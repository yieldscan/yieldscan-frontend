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

	return (
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
