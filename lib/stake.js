import { web3FromAddress } from "@polkadot/extension-dapp";
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";
import { WsProvider, ApiPromise } from "@polkadot/api";
import { isNil } from "lodash";

// Stash-Controller 1:1 relationship

// Polkadot API uses it in browser, we let it remain mad :]
window.setImmediate = (cb) => cb();

const createEventInstance = (message, ...params) => ({ message, ...params });

// TODO: error handling -> balance check, basics.
const stake = async (
	stashId,
	controllerId,
	stakeAmount,
	payee,
	nominatedValidators = [],
	api,
	{ onEvent, onFinish, onSuccessfullSigning },
	tranasactionType,
	networkInfo,
	ysFees = 0,
	confirmedControllerAccount = null,
	controllerTransferAmount = 0
) => {
	if (
		!stashId ||
		!stakeAmount ||
		!nominatedValidators ||
		payee === (undefined || null) ||
		!api
	) {
		throw new Error({ message: "Incomplete argument list to stake!" });
	}

	const substrateStashId = encodeAddress(decodeAddress(stashId), 42);
	const substrateControllerId = [
		"secure-bond-nominate",
		"secure-nominate",
	].includes(tranasactionType)
		? encodeAddress(decodeAddress(confirmedControllerAccount), 42)
		: encodeAddress(decodeAddress(controllerId), 42);

	// get substrate address
	onEvent(createEventInstance("Fetching substrate address..."));
	const stashCalls = [
		"lock-funds",
		"bond-and-nominate",
		"bond-extra",
		"secure-bond-nominate",
		"secure-nominate",
	];
	const injectorAccount = stashCalls.includes(tranasactionType)
		? substrateStashId
		: substrateControllerId;
	const injector = await web3FromAddress(injectorAccount);
	await api.setSigner(injector.signer);

	const transactions = [];

	const amount = Math.trunc(
		stakeAmount * Math.pow(10, networkInfo.decimalPlaces)
	);

	if (controllerTransferAmount > 0) {
		transactions.push(
			api.tx.balances.transferKeepAlive(
				substrateControllerId,
				controllerTransferAmount
			)
		);
	}

	if (tranasactionType === "bond-and-nominate") {
		onEvent(createEventInstance("Bond and nominate staking amount..."));
		transactions.push(
			api.tx.staking.bond(substrateControllerId, amount, payee),
			api.tx.staking.nominate(nominatedValidators)
		);
	} else if (tranasactionType === "nominate") {
		onEvent(createEventInstance("Sending nomination request..."));
		transactions.push(api.tx.staking.nominate(nominatedValidators));
	} else if (tranasactionType === "lock-funds") {
		const amount = Math.trunc(stakeAmount * 10 ** networkInfo.decimalPlaces); // 12 decimal places
		onEvent(createEventInstance("Bond staking amount..."));
		transactions.push(
			api.tx.staking.bond(substrateControllerId, amount, payee)
		);
	} else if (tranasactionType === "bond-extra") {
		const amount = Math.trunc(stakeAmount * 10 ** networkInfo.decimalPlaces); // 12 decimal places
		onEvent(createEventInstance("Bond staking amount..."));
		transactions.push(api.tx.staking.bondExtra(amount));
	} else if (tranasactionType === "secure-bond-nominate") {
		transactions.push(
			api.tx.staking.bond(substrateStashId, amount, payee),
			api.tx.staking.nominate(nominatedValidators),
			api.tx.staking.setController(substrateControllerId)
		);
	} else if (tranasactionType === "secure-nominate") {
		transactions.push(
			api.tx.staking.nominate(nominatedValidators),
			api.tx.staking.setController(substrateControllerId)
		);
	}

	transactions.push(
		api.tx.balances.transferKeepAlive(networkInfo.feesAddress, ysFees)
	);

	onEvent(createEventInstance("Waiting for you to sign the transaction..."));
	return api.tx.utility
		.batchAll(transactions)
		.signAndSend(injectorAccount, ({ events = [], status }) => {
			onEvent(createEventInstance("Sending your request to the chain..."));
			if (status.isInBlock) {
				onEvent(
					createEventInstance(`Included in block : ${status.asInBlock}...`)
				);
				onSuccessfullSigning(createEventInstance(`${status.asInBlock}`));
			}

			if (status.isFinalized) {
				const tranHash = status.asFinalized.toString();
				console.info("transaction hash: " + tranHash);
				let failed = false;
				events.forEach((d) => {
					const {
						phase,
						event: { data, method, section },
					} = d;
					console.info("method");
					console.info(method);
					if (method === "BatchInterrupted" || method === "ExtrinsicFailed") {
						failed = true;
					}
				});

				const eventLogs = events.map((d) => {
					const {
						phase,
						event: { data, method, section },
					} = d;
					return `${phase}: ${section}.${method}:: ${data}`;
				});

				onFinish(
					failed ? 1 : 0,
					failed
						? "Reason Unknown. If your amount is bonded, it's safe in your account, you can retry with different set of validators."
						: "Bonded and Nominated.",
					eventLogs,
					isNil(tranHash) ? "N/A" : tranHash
				);
			}
		});
};

export default stake;
