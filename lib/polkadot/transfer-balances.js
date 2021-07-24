import { web3FromAddress } from "@polkadot/extension-dapp";
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";

const createEventInstance = (message, ...params) => ({ message, ...params });

// Polkadot API uses it in browser, we let it remain mad :]
window.setImmediate = (cb) => cb();

const transferBalancesKeepAlive = async (
	from,
	to,
	apiInstance,
	amount,
	networkInfo,
	{ onEvent, onFinish, onSuccessfullSigning }
) => {
	const substrateSourceAccount = encodeAddress(decodeAddress(from), 42);
	const substrateDestAccount = encodeAddress(decodeAddress(to), 42);

	const amountRaw = Math.trunc(
		amount * Math.pow(10, networkInfo.decimalPlaces)
	);
	const injector = await web3FromAddress(substrateSourceAccount);

	const transactions = []
	transactions.push(
		apiInstance.tx.balances.transferKeepAlive(substrateDestAccount, amountRaw),
		apiInstance.tx.system.remark("Sent with YieldScan")
	)

	onEvent(createEventInstance("Waiting for you to sign the transaction..."));
	apiInstance.setSigner(injector.signer);
	return apiInstance.tx.utility
		.batchAll(transactions)
		.signAndSend(substrateSourceAccount, ({ events = [], status }) => {
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
					failed ? "Reason Unknown." : "Funds transfered successfully.",
					eventLogs
				);
			}
		});
};
export default transferBalancesKeepAlive;
