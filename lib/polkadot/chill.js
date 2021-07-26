import { web3FromAddress } from "@polkadot/extension-dapp";
import { encodeAddress, decodeAddress } from "@polkadot/util-crypto";

const createEventInstance = (message, ...params) => ({ message, ...params });

// Polkadot API uses it in browser, we let it remain mad :]
window.setImmediate = (cb) => cb();

const chill = async (
	stashId,
	api,
	{ onEvent, onFinish },
) => {
	let controllerAccountId = stashId;

	const controllerAccount = await api.query.staking.bonded(stashId);
	if (controllerAccount.isSome) {
		controllerAccountId = encodeAddress(decodeAddress(controllerAccount.toString()), 42);
	}

	const injector = await web3FromAddress(controllerAccountId);
	api.setSigner(injector.signer);

	const transactions = []
	transactions.push(
		api.tx.staking.chill(),
		api.tx.system.remark("Sent with YieldScan")
	);
	
	return api.tx.utility
		.batchAll(transactions)
		.signAndSend(
			controllerAccountId,
			({ events = [], status }) => {
				console.log(`status: ${JSON.stringify(status, null, 4)}`);
				if (status.isInBlock) {
					console.log(`batch included in ${status.asInBlock}`);
					onEvent(createEventInstance(`Included in block : ${status.asInBlock}...`));
				}

				if (status.isFinalized) {
					console.log(`finalized: ${status.asFinalized}`);

					let failed = false;
					events.forEach((d) => {
						const { phase, event: { data, method, section } } = d;
						console.log(`${phase}: ${section}.${method}:: ${data}`);
						if (method === 'BatchInterrupted') {
							failed = true;
						}
					});

					onFinish(
						failed ? 1 : 0,
						failed ?
							'Reason Unknown.' :
							'All nominations stopped.'
					);
				}
			}
		);
};

export default chill;
