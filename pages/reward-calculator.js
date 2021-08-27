import dynamic from "next/dynamic";
import WithDashboardLayout from "@components/common/layouts/dashboard";
import { NextSeo } from "next-seo";

const Page = dynamic(
	() => import("@components/common/page").then((mod) => mod.default),
	{ ssr: false }
);

const RewardCalculatorComponent = dynamic(
	() => import("@components/reward-calculator").then((mod) => mod.default),
	{ ssr: false }
);

const RewardCalculator = () => (
	<>
		<NextSeo
			openGraph={{
				type: "website",
				title: "YieldScan: Polkadot staking rewards calculator",
				locale: "en_IE",
				url: "https://yieldscan.app/reward-calculator",
				site_name: "YieldScan",
				description:
					"Polkadot staking rewards calculator, DOT staking rewards calculator, kusama staking rewards calculator, KSM staking rewards calculator, staking rewards calculator",
			}}
		/>
		<Page title="Reward Calculator" layoutProvider={WithDashboardLayout}>
			{() => <RewardCalculatorComponent />}
		</Page>
	</>
);

export default RewardCalculator;
