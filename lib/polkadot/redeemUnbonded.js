import { web3FromAddress } from "@polkadot/extension-dapp";
import { get } from "lodash";
import { encodeAddress, decodeAddress } from "@polkadot/util-crypto";
import { isNil } from "lodash";

const createEventInstance = (message, ...params) => ({ message, ...params });

// Polkadot API uses it in browser, we let it remain mad :]
window.setImmediate = (cb) => cb();

const redeemUnbonded = async (
	stashId,
	apiInstance,
	{ onEvent, onFinish, onSuccessfullSigning },
	networkInfo
) => {
	const substrateStashId = encodeAddress(decodeAddress(stashId.toString()), 42);
	// if (type !== "bond") {
	// 	const controllerAccount = await apiInstance.query.staking.bonded(stashId);
	// 	if (controllerAccount.isSome) {
	// 		controllerAccountId = encodeAddress(
	// 			decodeAddress(controllerAccount.toString()),
	// 			42
	// 		);
	// 	}
	// }

	onEvent(createEventInstance("Fetching substrate address..."));
	const injector = await web3FromAddress(substrateStashId);
	apiInstance.setSigner(injector.signer);

	const slashSpan = await apiInstance.query.staking.slashingSpans(stashId);

	onEvent(createEventInstance("Waiting for you to sign the transaction..."));
	return apiInstance.tx.staking
		.withdrawUnbonded(Number(slashSpan))
		.signAndSend(substrateStashId, ({ events = [], status }) => {
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
					failed ? "Reason Unknown." : "Funds Redeemed successfully!",
					eventLogs,
					isNil(tranHash) ? "N/A" : tranHash
				);
			}
		});
};

export default redeemUnbonded;
