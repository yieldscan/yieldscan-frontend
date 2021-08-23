import { web3FromAddress } from "@polkadot/extension-dapp";
import { get } from "lodash";
import { encodeAddress, decodeAddress } from "@polkadot/util-crypto";
import { isNil } from "lodash";

const createEventInstance = (message, ...params) => ({ message, ...params });

// Polkadot API uses it in browser, we let it remain mad :]
window.setImmediate = (cb) => cb();

const updateFunds = async (
	type,
	stashId,
	controllerId,
	amount,
	activeBondedAmount,
	minPossibleStake,
	apiInstance,
	{ onEvent, onFinish, onSuccessfullSigning },
	networkInfo
) => {
	const substrateStashId = encodeAddress(decodeAddress(stashId.toString()), 42);
	const substrateControllerId = encodeAddress(decodeAddress(controllerId), 42);
	// if (type !== "bond") {
	// 	const controllerAccount = await apiInstance.query.staking.bonded(stashId);
	// 	if (controllerAccount.isSome) {
	// 		controllerAccountId = encodeAddress(
	// 			decodeAddress(controllerAccount.toString()),
	// 			42
	// 		);
	// 	}
	// }

	const rawAmount = BigInt(amount * 10 ** networkInfo.decimalPlaces);

	onEvent(createEventInstance("Fetching substrate address..."));
	const injectorAccount =
		type === "bond" ? substrateStashId : substrateControllerId;
	const injector = await web3FromAddress(injectorAccount);
	apiInstance.setSigner(injector.signer);

	const operation =
		type === "bond"
			? apiInstance.tx.staking.bondExtra(rawAmount)
			: type === "rebond"
			? apiInstance.tx.staking.rebond(rawAmount)
			: BigInt(activeBondedAmount) - rawAmount >=
			  BigInt(minPossibleStake * 10 ** networkInfo.decimalPlaces)
			? apiInstance.tx.staking.unbond(rawAmount)
			: apiInstance.tx.utility.batchAll([
					apiInstance.tx.staking.chill(),
					apiInstance.tx.staking.unbond(rawAmount),
			  ]);

	onEvent(createEventInstance("Waiting for you to sign the transaction..."));
	return operation.signAndSend(injectorAccount, ({ events = [], status }) => {
		console.info(`status: ${JSON.stringify(status, null, 4)}`);
		onEvent(createEventInstance("Sending your request to the chain..."));
		if (status.isInBlock) {
			console.info(`batched included in ${status.asInBlock}`);
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
				console.info(`${phase}: ${section}.${method}:: ${data}`);
				if (method === "BatchInterrupted") {
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
				failed ? "Reason Unknown." : "Funds Updated successfully!",
				eventLogs,
				isNil(tranHash) ? "N/A" : tranHash
			);
		}
	});
};

export default updateFunds;
