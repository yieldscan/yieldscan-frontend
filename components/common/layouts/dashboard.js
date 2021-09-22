import dynamic from "next/dynamic";
import Link from "next/link";
import { isMobile, isTablet } from "react-device-detect";
import SideMenu from "@components/common/sidemenu";
import {
	usePolkadotApi,
	useSelectedNetwork,
	useBetaInfo,
	useCoinGeckoPriceUSD,
} from "@lib/store";
import createPolkadotAPIInstance from "@lib/polkadot-api";
import fetchPrice from "@lib/fetch-price";
import { get, includes } from "lodash";
import { useEffect } from "react";
import Image from "next/image";

const Header = dynamic(
	() => import("@components/common/header").then((mod) => mod.default),
	{ ssr: false }
);

import { getNetworkInfo } from "yieldscan.config";
import SideMenuFooter from "../side-menu-footer";
import { useRouter } from "next/router";
import Routes from "@lib/routes";
import { BookOpen, ChevronRight, Rss } from "react-feather";
import { FaDiscord, FaRegEnvelope } from "react-icons/fa";

const links = [
	{
		title: "Help center",
		description: "Find answers, tips, and other important info",
		icon: BookOpen,
		url: "https://intercom.help/yieldscan/",
	},
	{
		title: "Contact us",
		description: "Get in touch with our support team",
		icon: FaRegEnvelope,
		url: "mailto:contact@yieldscan.app",
	},
	{
		title: "Discord",
		description: "Get help from our discord community",
		icon: FaDiscord,
		url: "https://discord.gg/5Dggqx8",
	},
	{
		title: "Blog",
		description: "Read our latest news and articles",
		icon: Rss,
		url: "https://medium.com/yieldscan",
	},
];

const UnsupportedDeviceScreen = () => (
	<div className="bg-white">
		<main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
			<div className="flex-shrink-0 pt-16 flex justify-center">
				<Image
					src="/images/yieldscan-logo.svg"
					alt="Yieldscan Logo"
					width="64"
					height="64"
				/>
			</div>
			<div className="max-w-xl mx-auto py-16 sm:py-24">
				<div className="text-center">
					<p className="text-sm font-semibold text-teal-600 uppercase tracking-wide">
						Device not supported
					</p>
					<h1 className="mt-2 text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
						This page isn't supported on your device.
					</h1>
					<p className="mt-2 text-lg text-gray-600">
						The page you are looking for is not available on your device. To
						continue, please visit the page using a laptop or desktop computer.
					</p>
				</div>
				<div className="mt-12">
					<h2 className="text-sm font-semibold text-gray-600 tracking-wide uppercase">
						Helpful resources
					</h2>
					<ul
						role="list"
						className="mt-4 border-t border-b border-gray-200 divide-y divide-gray-200"
					>
						{links.map((link, linkIdx) => (
							<li
								key={linkIdx}
								className="relative py-6 flex items-start space-x-4"
							>
								<div className="flex-shrink-0">
									<span className="flex items-center justify-center h-12 w-12 rounded-lg bg-teal-50">
										<link.icon
											className="h-6 w-6 text-teal-700"
											aria-hidden="true"
										/>
									</span>
								</div>
								<div className="min-w-0 flex-1">
									<h3 className="text-base font-medium text-gray-900">
										<span className="rounded-sm focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal-500">
											<a href={link.url} className="focus:outline-none">
												<span className="absolute inset-0" aria-hidden="true" />
												{link.title}
											</a>
										</span>
									</h3>
									<p className="text-base text-gray-600">{link.description}</p>
								</div>
								<div className="flex-shrink-0 self-center">
									<ChevronRight
										className="h-5 w-5 text-gray-400"
										aria-hidden="true"
									/>
								</div>
							</li>
						))}
					</ul>
					<div className="mt-8">
						<Link href="/">
							<a className="text-base font-medium text-teal-600 hover:text-teal-500">
								Or go back home<span aria-hidden="true"> &rarr;</span>
							</a>
						</Link>
					</div>
				</div>
			</div>
		</main>
	</div>
);

const WithDashboardLayout = (children, isSetUp, isWalletSetUp) => {
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

	return isMobile || isTablet ? (
		<UnsupportedDeviceScreen />
	) : (
		<div>
			<Header isSetUp={isSetUp} isWalletSetUp={isWalletSetUp} />
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

export default WithDashboardLayout;
