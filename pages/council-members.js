import dynamic from "next/dynamic";
import WithDashboardLayout from "@components/common/layouts/dashboard";

const Page = dynamic(
	() => import("@components/common/page").then((mod) => mod.default),
	{ ssr: false }
);

const CouncilMembersPage = dynamic(
	() => import("@components/council-members").then((mod) => mod.default),
	{ ssr: false }
);

const CouncilMembers = () => (
	<Page title="Council Members" layoutProvider={WithDashboardLayout}>
		{() => <CouncilMembersPage />}
	</Page>
);

export default CouncilMembers;
