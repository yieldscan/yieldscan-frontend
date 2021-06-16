import dynamic from "next/dynamic";
import SideMenu from "@components/common/sidemenu";
import {
	useAccounts,
	usePolkadotApi,
	useTransaction,
	useSelectedNetwork,
	useBetaInfo,
	useCoinGeckoPriceUSD,
} from "@lib/store";
import createPolkadotAPIInstance from "@lib/polkadot-api";
import fetchPrice from "@lib/fetch-price";
import { get, includes, isNil, pick } from "lodash";
import { useMe, useEffect } from "react";
import { trackEvent, Events, setUserProperties } from "@lib/analytics";
import Footer from "../footer";
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";

const Header = dynamic(
	() => import("@components/common/header").then((mod) => mod.default),
	{ ssr: false }
);

import { getNetworkInfo } from "yieldscan.config";
import { Alert, AlertIcon, CloseButton } from "@chakra-ui/core";
import SideMenuFooter from "../side-menu-footer";
import { useRouter } from "next/router";
import Routes from "@lib/routes";
import { setCookie } from "nookies";

const withDashboardLayout = (children, isSetUp) => {
	const router = useRouter();
	const { showBetaMessage, setShowBetaMessage } = useBetaInfo();
	const { apiInstance, setApiInstance } = usePolkadotApi();
	const { selectedNetwork, setSelectedNetwork } = useSelectedNetwork();
	const networkInfo = getNetworkInfo(selectedNetwork);
	const { coinGeckoPriceUSD, setCoinGeckoPriceUSD } = useCoinGeckoPriceUSD();

	useEffect(() => {
		fetchPrice(coinGeckoPriceUSD, networkInfo.coinGeckoDenom).then((price) =>
			setCoinGeckoPriceUSD(price)
		);
	}, [networkInfo]);

	useEffect(() => {
		createPolkadotAPIInstance(networkInfo, apiInstance).then((api) => {
			setApiInstance(api);
		});
	}, [networkInfo]);

	return () => (
		<div>
			<Header isSetUp={isSetUp} />
			<div className="dashboard-content fixed flex relative w-full">
				{!isSetUp && (
					<div className="h-full hidden xl:block sidemenu-container xl:w-2/12 py-8 max-w-xs">
						<SideMenu />
						<div className="absolute bottom-0 pb-8">
							<SideMenuFooter />
						</div>
					</div>
				)}

				<div
					className={`h-full ${
						!isSetUp && "px-8 mx-auto"
					} overflow-y-scroll  w-full`}
				>
					<div
						className={`mx-auto h-full ${
							isSetUp
								? "w-full"
								: includes(
										[Routes.OVERVIEW, Routes.CALCULATOR, Routes.SETTINGS],
										get(router, "pathname")
								  )
								? "max-w-screen-lg"
								: "max-w-screen-xl"
						}`}
					>
						{showBetaMessage && (
							<Alert
								status="info"
								color="blue.500"
								rounded="lg"
								mt={4}
								fontSize="sm"
								justifyContent="center"
								flex
							>
								<AlertIcon />
								This platform is currently in beta. Please proceed with
								discretion.
								<CloseButton
									position="absolute"
									right="8px"
									top="8px"
									onClick={() => {
										setShowBetaMessage(false);
										setCookie(null, "showBeta", "false", {
											maxAge: 7 * 24 * 60 * 60,
										});
									}}
								/>
							</Alert>
						)}
						{children()}
					</div>
				</div>
			</div>
			<style jsx>{`
				.dashboard-content {
					height: calc(100vh - 4.125rem);
				}
				.sidemenu-container {
					background: #f7fbff;
					z-index: 10;
				}
			`}</style>
		</div>
	);
};

export default withDashboardLayout;
