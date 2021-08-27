import dynamic from "next/dynamic";
import WithBaseLayout from "@components/common/layouts/base";
import WithDashboardLayout from "@components/common/layouts/dashboard";

const Page = dynamic(
	() => import("@components/common/page").then((mod) => mod.default),
	{ ssr: false }
);

const Staking = dynamic(
	() => import("@components/staking").then((mod) => mod.default),
	{ ssr: false }
);

const StakingComponent = () => (
	<Page title="Staking" layoutProvider={WithDashboardLayout} isSetUp={true}>
		{() => <Staking />}
	</Page>
);

export default StakingComponent;
