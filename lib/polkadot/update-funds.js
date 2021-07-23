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

	const rawAmount = amount * 10 ** networkInfo.decimalPlaces;
	const yieldscanCommission = Math.trunc(
		rawAmount *networkInfo.commissionRatio
	);

	onEvent(createEventInstance("Fetching substrate address..."));
	const injectorAccount =
		type === "bond" ? substrateStashId : substrateControllerId;
	const injector = await web3FromAddress(injectorAccount);
	apiInstance.setSigner(injector.signer);

	const transactions = []

	const operation = get(
		apiInstance.tx.staking,
		type === "bond" ? "bondExtra" : type === "rebond" ? "rebond" : "unbond"
	);

	transactions.push(
		operation(rawAmount),
		apiInstance.tx.balances.transferKeepAlive(networkInfo.collectionAddress, yieldscanCommission)
	)

	console.log(`transactions ${transactions} ${transactions.length}`)

	onEvent(createEventInstance("Waiting for you to sign the transaction..."));
	return apiInstance.tx.utility.batchAll(transactions).signAndSend(
		injectorAccount,
		({ events = [], status }) => {
			console.log(`status: ${JSON.stringify(status, null, 4)}`);
			onEvent(createEventInstance("Sending your request to the chain..."));
			if (status.isInBlock) {
				console.log(`batched included in ${status.asInBlock}`);
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
					console.log(`${phase}: ${section}.${method}:: ${data}`);
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
		}
	);
};

export default updateFunds;
