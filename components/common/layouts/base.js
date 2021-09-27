import dynamic from "next/dynamic";
import {
	useAccounts,
	usePolkadotApi,
	useTransaction,
	useSelectedNetwork,
	useCoinGeckoPriceUSD,
} from "@lib/store";
import createPolkadotAPIInstance from "@lib/polkadot-api";
import fetchPrice from "@lib/fetch-price";
import { isNil, pick } from "lodash";
import { useEffect } from "react";

const Header = dynamic(
	() => import("@components/common/header").then((mod) => mod.default),
	{ ssr: false }
);

import { getNetworkInfo } from "yieldscan.config";
import { Box, Flex } from "@chakra-ui/core";
import Footer from "../footer";

const WithBaseLayout = (children) => {
	const { apiInstance, setApiInstance } = usePolkadotApi();
	const { selectedNetwork, setSelectedNetwork } = useSelectedNetwork();
	const networkInfo = getNetworkInfo(selectedNetwork);

	const { coinGeckoPriceUSD, setCoinGeckoPriceUSD } = useCoinGeckoPriceUSD();

	useEffect(() => {
		if (isNil(coinGeckoPriceUSD)) {
			fetchPrice(coinGeckoPriceUSD, networkInfo.coinGeckoDenom).then((price) =>
				setCoinGeckoPriceUSD(price)
			);
		}
	}, [networkInfo, coinGeckoPriceUSD]);

	useEffect(() => {
		createPolkadotAPIInstance(networkInfo, apiInstance).then((api) => {
			setApiInstance(api);
		});
	}, [networkInfo]);

	return (
		<Flex h="100%" w="100%" flexDirection="column">
			<Header isBase />
			<Box flex={1}>{children()}</Box>
			<Footer />
		</Flex>
	);
};

export default WithBaseLayout;
