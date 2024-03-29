import { isNil } from "lodash";

export const networks = [
	{
		id: "polkadot-cc1",
		name: "Polkadot",
		network: "polkadot",
		isTestNetwork: false,
		denom: "DOT",
		coinGeckoDenom: "polkadot",
		decimalPlaces: 10,
		feesAddress: isNil(process?.env?.NEXT_PUBLIC_POLKADOT_FEES_ADDRESS)
			? false
			: process?.env?.NEXT_PUBLIC_POLKADOT_FEES_ADDRESS,
		feesEnabled: isNil(process?.env?.NEXT_PUBLIC_POLKADOT_FEES_ENABLED)
			? false
			: JSON.parse(process?.env?.NEXT_PUBLIC_POLKADOT_FEES_ENABLED),
		feesRatio: isNil(process.env.NEXT_PUBLIC_POLKADOT_FEES_RATIO)
			? 0
			: JSON.parse(process.env.NEXT_PUBLIC_POLKADOT_FEES_RATIO),
		lastDiscountDate: isNil(process?.env?.NEXT_PUBLIC_LAST_DISCOUNT_DATE)
			? new Date("1 Jan 1990 00:00:00 UTC")
			: new Date(process?.env?.NEXT_PUBLIC_LAST_DISCOUNT_DATE),
		twitterUrl: "@Polkadot",
		addressPrefix: 0,
		nodeWs: process.env.NEXT_PUBLIC_POLKADOT,
		erasPerDay: 1,
		lockUpPeriod: 28,
		reserveAmount: 1,
		recommendedAdditionalAmount: 50,
		about: "Polkadot is a heterogeneous multi‑chain technology.",
	},
	{
		id: "kusama-cc3",
		name: "Kusama",
		network: "kusama",
		isTestNetwork: false,
		denom: "KSM",
		feesAddress: isNil(process?.env?.NEXT_PUBLIC_KUSAMA_FEES_ADDRESS)
			? false
			: process.env.NEXT_PUBLIC_KUSAMA_FEES_ADDRESS,
		feesEnabled: isNil(process?.env?.NEXT_PUBLIC_KUSAMA_FEES_ENABLED)
			? false
			: JSON.parse(process.env.NEXT_PUBLIC_KUSAMA_FEES_ENABLED),
		feesRatio: isNil(process?.env?.NEXT_PUBLIC_KUSAMA_FEES_RATIO)
			? 0
			: JSON.parse(process.env.NEXT_PUBLIC_KUSAMA_FEES_RATIO),
		lastDiscountDate: isNil(process?.env?.NEXT_PUBLIC_LAST_DISCOUNT_DATE)
			? new Date("1 Jan 1990 00:00:00 UTC")
			: new Date(process?.env?.NEXT_PUBLIC_LAST_DISCOUNT_DATE),
		twitterUrl: "@kusamanetwork",
		coinGeckoDenom: "kusama",
		decimalPlaces: 12,
		addressPrefix: 2,
		nodeWs: process.env.NEXT_PUBLIC_KUSAMA,
		erasPerDay: 4,
		lockUpPeriod: 7,
		reserveAmount: 0.01,
		recommendedAdditionalAmount: 0.5,
		about: "Kusama is an early, unaudited, and unrefined release of Polkadot.",
	},
	{
		id: "westend",
		name: "Westend",
		network: "westend",
		isTestNetwork: true,
		denom: "WND",
		feesAddress: isNil(process?.env?.NEXT_PUBLIC_WESTEND_FEES_ADDRESS)
			? false
			: process.env.NEXT_PUBLIC_WESTEND_FEES_ADDRESS,
		feesEnabled: isNil(process?.env?.NEXT_PUBLIC_WESTEND_FEES_ENABLED)
			? false
			: JSON.parse(process.env.NEXT_PUBLIC_WESTEND_FEES_ENABLED),
		feesRatio: isNil(process?.env?.NEXT_PUBLIC_WESTEND_FEES_RATIO)
			? 0
			: JSON.parse(process.env.NEXT_PUBLIC_WESTEND_FEES_RATIO),
		lastDiscountDate: isNil(process?.env?.NEXT_PUBLIC_LAST_DISCOUNT_DATE)
			? new Date("1 Jan 1990 00:00:00 UTC")
			: new Date(process?.env?.NEXT_PUBLIC_LAST_DISCOUNT_DATE),
		twitterUrl: "@westend",
		coinGeckoDenom: undefined,
		decimalPlaces: 12,
		addressPrefix: 42,
		nodeWs: process.env.NEXT_PUBLIC_WESTEND,
		erasPerDay: 4,
		lockUpPeriod: 7,
		reserveAmount: 1,
		recommendedAdditionalAmount: 0.5,
		about: "Westend is one of the test networks for polkadot ecosystem.",
	},
];

export const getNetworkInfo = (networkName) => {
	return networks.find(({ name }) => name === networkName);
};

export const getAllNetworksInfo = () => {
	const supportedNetworks = networks.filter(
		(network) =>
			JSON.parse(process.env.NEXT_PUBLIC_TESTNETS_ENABLED) ||
			!network.isTestNetwork
	);
	return supportedNetworks;
};

export const getAllNetworks = () => {
	const supportedNetworks = networks
		.filter(
			(network) =>
				JSON.parse(process.env.NEXT_PUBLIC_TESTNETS_ENABLED) ||
				!network.isTestNetwork
		)
		.map((network) => network.name);
	return supportedNetworks;
};
