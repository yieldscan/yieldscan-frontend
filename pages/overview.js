import dynamic from "next/dynamic";
import WithDashboardLayout from "@components/common/layouts/dashboard";
import { NextSeo } from "next-seo";

const Page = dynamic(
	() => import("@components/common/page").then((mod) => mod.default),
	{ ssr: false }
);

const OverviewComponent = dynamic(
	() => import("@components/overview").then((mod) => mod.default),
	{ ssr: false }
);

const Payment = () => (
	<>
		<NextSeo
			title="YieldScan: Overview"
			description="nominator profile, staking rewards history"
		/>
		<Page title="Overview" layoutProvider={WithDashboardLayout}>
			{() => <OverviewComponent />}
		</Page>
	</>
);

export default Payment;
