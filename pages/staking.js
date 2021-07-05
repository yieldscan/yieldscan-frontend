import dynamic from "next/dynamic";
import withBaseLayout from "@components/common/layouts/base";
import withDashboardLayout from "@components/common/layouts/dashboard";

const Page = dynamic(
	() => import("@components/common/page").then((mod) => mod.default),
	{ ssr: false }
);

const Staking = dynamic(
	() => import("@components/staking").then((mod) => mod.default),
	{ ssr: false }
);

const StakingComponent = () => (
	<Page title="Staking" layoutProvider={withDashboardLayout} isSetUp={true}>
		{() => <Staking />}
	</Page>
);

export default StakingComponent;
