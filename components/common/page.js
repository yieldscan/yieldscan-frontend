import Head from "next/head";
import React from "react";
import { isMobile, isTablet } from "react-device-detect";
import { trackEvent, Events } from "@lib/analytics";
import { useEffect } from "react";

window.setImmediate = (cb) => cb();

const Page = ({
	title,
	children,
	layoutProvider,
	isSetUp = false,
	isWalletSetUp = false,
}) => {
	const layoutedChild = layoutProvider
		? layoutProvider(children, isSetUp, isWalletSetUp)
		: children;

	useEffect(() => {
		trackEvent(Events.PAGE_VIEW, { path: window.location.pathname });
	}, []);

	return isMobile || isTablet ? (
		<React.Fragment>
			<Head>
				<title>{title} - YieldScan</title>
				<meta charset="UTF-8" />
				<meta
					name="description"
					content="Polkadot staking: Built to maximize staking yield, minimize effort."
				/>
				<meta
					name="keywords"
					content="Polkadot, Kusama, DOT, KSM, staking, Acala, Karura, KAR"
				/>
			</Head>
			<div
				className="flex-center flex-col bg-gray-100"
				style={{ width: "100vw", height: "100vh" }}
			>
				<span className="text-lg text-teal-500 font-bold text-4xl mb-10">
					YieldScan
				</span>
				<p className="text-xl text-center text-gray-800 px-5">
					We don't support this device yet. To use YieldScan please visit us on
					your desktop / laptop.
				</p>
			</div>
		</React.Fragment>
	) : (
		<React.Fragment>
			<Head>
				<title>{title} - YieldScan</title>
				<meta charset="UTF-8" />
				<meta
					name="description"
					content="Polkadot staking: Built to maximize staking yield, minimize effort."
				/>
				<meta
					name="keywords"
					content="Polkadot, Kusama, DOT, KSM, staking, Acala, Karura, KAR"
				/>
			</Head>
			<div>{layoutedChild}</div>
		</React.Fragment>
	);
};

export default Page;
