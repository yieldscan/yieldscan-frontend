// Selected network
// const selectedNetwork = `Polkadot`;
const selectedNetwork = `Kusama`;
// const selectedNetwork = `Westend`;

// Substrate networks
export const networks = [
	{
		id: "polkadot-cc1",
		name: "Polkadot",
		network: "polkadot",
		isTestNetwork: false,
		denom: "DOT",
		coinGeckoDenom: "polkadot",
		decimalPlaces: 10,
		twitterUrl: "@Polkadot",
		addressPrefix: 0,
		nodeWs: process.env.NEXT_PUBLIC_POLKADOT,
		erasPerDay: 1,
		lockUpPeriod: 28,
		minAmount: 1,
		recommendedAdditionalAmount: 50,
		about: "Polkadot is a heterogeneous multi‑chain technology.",
	},
	{
		id: "kusama-cc3",
		name: "Kusama",
		network: "kusama",
		isTestNetwork: false,
		denom: "KSM",
		twitterUrl: "@kusamanetwork",
		coinGeckoDenom: "kusama",
		decimalPlaces: 12,
		addressPrefix: 2,
		nodeWs: process.env.NEXT_PUBLIC_KUSAMA,
		erasPerDay: 4,
		lockUpPeriod: 7,
		minAmount: 0.1,
		recommendedAdditionalAmount: 0.5,
		about: "Kusama is an early, unaudited, and unrefined release of Polkadot.",
	},
	{
		id: "westend",
		name: "Westend",
		network: "westend",
		isTestNetwork: true,
		denom: "WND",
		twitterUrl: "@westend",
		coinGeckoDenom: undefined,
		decimalPlaces: 12,
		addressPrefix: 42,
		nodeWs: process.env.NEXT_PUBLIC_WESTEND,
		erasPerDay: 4,
		lockUpPeriod: 7,
		minAmount: 0.1,
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

export const network = networks.find(({ name }) => name === selectedNetwork);
