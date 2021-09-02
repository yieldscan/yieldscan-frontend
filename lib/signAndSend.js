import { web3FromAddress } from "@polkadot/extension-dapp";
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";
import { WsProvider, ApiPromise } from "@polkadot/api";
import { isNil } from "lodash";

// Stash-Controller 1:1 relationship

// Polkadot API uses it in browser, we let it remain mad :]
window.setImmediate = (cb) => cb();

const createEventInstance = (message, ...params) => ({ message, ...params });

// TODO: error handling -> balance check, basics.
const signAndSend = async (
	api,
	{ onEvent, onFinish, onSuccessfullSigning },
	transactions,
	injectorAccount
) => {
	const injector = await web3FromAddress(injectorAccount);
	await api.setSigner(injector.signer);

	onEvent(createEventInstance("Waiting for you to sign the transaction..."));
	return transactions.length > 1
		? api.tx.utility
				.batchAll(transactions)
				.signAndSend(injectorAccount, ({ events = [], status }) => {
					onEvent(createEventInstance("Sending your request to the chain..."));
					if (status.isInBlock) {
						onEvent(
							createEventInstance(
								`Included in block, transaction hash: ${status.asInBlock
									.toString()
									.slice(0, 35)}...`
							)
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
							failed ? "Transaction failed" : "Transaction finalized",
							eventLogs,
							isNil(tranHash) ? "N/A" : tranHash
						);
					}
				})
		: transactions[0].signAndSend(
				injectorAccount,
				({ events = [], status }) => {
					onEvent(createEventInstance("Sending your request to the chain..."));
					if (status.isInBlock) {
						onEvent(
							createEventInstance(
								`Included in block, transaction hash: ${status.asInBlock
									.toString()
									.slice(0, 35)}...`
							)
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
							failed ? "Transaction failed" : "Transaction finalized",
							eventLogs,
							isNil(tranHash) ? "N/A" : tranHash
						);
					}
				}
		  );
};

export default signAndSend;
