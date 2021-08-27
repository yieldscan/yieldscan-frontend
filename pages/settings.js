import dynamic from "next/dynamic";
import WithDashboardLayout from "@components/common/layouts/dashboard";

const Page = dynamic(
	() => import("@components/common/page").then((mod) => mod.default),
	{ ssr: false }
);

const SettingsComponent = dynamic(
	() => import("@components/settings").then((mod) => mod.default),
	{ ssr: false }
);

const Settings = () => (
	<Page title="Settings" layoutProvider={WithDashboardLayout}>
		{() => <SettingsComponent />}
	</Page>
);

export default Settings;
