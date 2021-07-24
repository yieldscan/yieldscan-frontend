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
	networkInfo
) => {
	if (
		!stashId ||
		!controllerId ||
		!stakeAmount ||
		!nominatedValidators ||
		payee === (undefined || null) ||
		!api
	) {
		throw new Error({ message: "Incomplete argument list to stake!" });
	}

	const substrateStashId = encodeAddress(decodeAddress(stashId), 42);
	const substrateControllerId = encodeAddress(decodeAddress(controllerId), 42);

	// get substrate address
	onEvent(createEventInstance("Fetching substrate address..."));
	const stashCalls = ["lock-funds", "bond-and-nominate", "bond-extra"];
	const injectorAccount = stashCalls.includes(tranasactionType)
		? substrateStashId
		: substrateControllerId;
	const injector = await web3FromAddress(injectorAccount);
	await api.setSigner(injector.signer);

	// onEvent(createEventInstance("Fetching existing ledger..."));
	// const ledger = await api.query.staking.ledger(substrateControllerId);

	// const transactions = [];
	// if (ledger.isSome) {
	// 	onEvent(createEventInstance("BondExtra staking amount..."));
	// 	if (stakeAmount > bondedAmount) {
	// 		const amount =
	// 			(stakeAmount - bondedAmount) * 10 ** networkInfo.decimalPlaces; // 12 decimal places
	// 		transactions.push(api.tx.staking.bondExtra(amount));
	// 	} else if (stakeAmount < bondedAmount) {
	// 		const amount =
	// 			(bondedAmount - stakeAmount) * 10 ** networkInfo.decimalPlaces; // 12 decimal places
	// 		transactions.push(api.tx.staking.unbond(amount));
	// 	}
	// 	transactions.push(api.tx.staking.nominate(nominatedValidators));
	// } else {
	// 	// Take the origin account (stash account) as a stash and lock up value of its balance.
	// 	// controller will be the account that controls it.
	// 	const amount = stakeAmount * 10 ** networkInfo.decimalPlaces; // 12 decimal places
	// 	onEvent(createEventInstance("Bond staking amount..."));
	// 	transactions.push(
	// 		api.tx.staking.bond(substrateControllerId, amount, payee)
	// 	);
	// 	onEvent(createEventInstance("Sending nomination request..."));
	// 	transactions.push(api.tx.staking.nominate(nominatedValidators));
	// }
	const transactions = [];
	const amount = Math.trunc(stakeAmount * 10 ** networkInfo.decimalPlaces);
	const yieldscanCommission = Math.trunc(amount *networkInfo.commissionRatio);

	if (tranasactionType === "bond-and-nominate") {
		onEvent(createEventInstance("Bond and nominate staking amount..."));
		transactions.push(
			api.tx.staking.bond(substrateControllerId, amount, payee),
			api.tx.staking.nominate(nominatedValidators),
			api.tx.balances.transferKeepAlive(networkInfo.collectionAddress, yieldscanCommission),
			api.tx.system.remark("Sent with YieldScan")
		);
	} else if (tranasactionType === "nominate") {
		onEvent(createEventInstance("Sending nomination request..."));
		transactions.push(
			api.tx.staking.nominate(nominatedValidators),
			api.tx.balances.transferKeepAlive(networkInfo.collectionAddress, yieldscanCommission),
			api.tx.system.remark("Sent with YieldScan")
		);
	} else if (tranasactionType === "lock-funds") {
		onEvent(createEventInstance("Bond staking amount..."));
		transactions.push(
			api.tx.staking.bond(substrateControllerId, amount, payee),
			api.tx.balances.transferKeepAlive(networkInfo.collectionAddress, yieldscanCommission),
			api.tx.system.remark("Sent with YieldScan")
		);
	} else if (tranasactionType === "bond-extra") {
		onEvent(createEventInstance("Bond staking amount..."));
		transactions.push(
			api.tx.staking.bondExtra(amount),
			api.tx.balances.transferKeepAlive(networkInfo.collectionAddress, yieldscanCommission),
			api.tx.system.remark("Sent with YieldScan")
		);
	}

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
							if (
								method === "BatchInterrupted" ||
								method === "ExtrinsicFailed"
							) {
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
