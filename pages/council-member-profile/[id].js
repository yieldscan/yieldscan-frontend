import dynamic from "next/dynamic";
import WithDashboardLayout from "@components/common/layouts/dashboard";

const Page = dynamic(
	() => import("@components/common/page").then((mod) => mod.default),
	{ ssr: false }
);

const CouncilMemberProfileComponent = dynamic(
	() => import("@components/council-member-profile").then((mod) => mod.default),
	{ ssr: false }
);

const CouncilMemberProfile = () => (
	<Page title="Council Member Profile" layoutProvider={WithDashboardLayout}>
		{() => <CouncilMemberProfileComponent />}
	</Page>
);

export default CouncilMemberProfile;
