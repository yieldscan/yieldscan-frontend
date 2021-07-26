import { WsProvider, ApiPromise } from "@polkadot/api";

const createPolkadotApi = async (networkInfo, apiInstance) => {
	if (apiInstance) {
		console.info("Polkadot api instance aleady exists.");
		return apiInstance;
	}
	const wsURL = networkInfo.nodeWs;
	const wsProvider = new WsProvider(wsURL);
	const api = await ApiPromise.create({ provider: wsProvider });
	await api.isReady;
	return api;
};

export default createPolkadotApi;
