import { web3FromAddress } from "@polkadot/extension-dapp";
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";

const createEventInstance = (message, ...params) => ({ message, ...params });

// Polkadot API uses it in browser, we let it remain mad :]
window.setImmediate = (cb) => cb();

const editController = async (
	newControllerId,
	stashId,
	api,
	{ onEvent, onSuccessfullSigning, onFinish }
) => {
	console.log(newControllerId, stashId);
	const substrateStashId = encodeAddress(decodeAddress(stashId), 42);
	const substrateControllerId = encodeAddress(
		decodeAddress(newControllerId),
		42
	);
	const injector = await web3FromAddress(substrateStashId);
	api.setSigner(injector.signer);

	const transactions = []
	transactions.push(
		api.tx.staking.setController(substrateControllerId),
		api.tx.system.remark("Sent with YieldScan")
	);

	return api.tx.utility
		.batchAll(transactions)
		.signAndSend(stashId, ({ events = [], status }) => {
			onSuccessfullSigning(createEventInstance("successful signing"));
			console.log(`status: ${JSON.stringify(status, null, 4)}`);
			if (status.isInBlock) {
				console.log(`batch included in ${status.asInBlock}`);
				onEvent(
					createEventInstance(`Included in block : ${status.asInBlock}...`)
				);
				onSuccessfullSigning(createEventInstance(`${status.asInBlock}`));
			}

			if (status.isFinalized) {
				console.log(`finalized: ${status.asFinalized}`);

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

				onFinish(
					failed ? 1 : 0,
					failed ? "Reason Unknown." : "Controller edited successfully."
				);
			}
		});
};

export default editController;
