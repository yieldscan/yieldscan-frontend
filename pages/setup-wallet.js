import dynamic from "next/dynamic";
import withBaseLayout from "@components/common/layouts/base";
import withDashboardLayout from "@components/common/layouts/dashboard";

const Page = dynamic(
	() => import("@components/common/page").then((mod) => mod.default),
	{ ssr: false }
);

const SetupWallet = dynamic(
	() => import("@components/setup-wallet").then((mod) => mod.default),
	{ ssr: false }
);

const SetupWalletComponent = () => (
	<Page
		title="Setup Wallets"
		layoutProvider={withDashboardLayout}
		isSetUp={true}
	>
		{() => <SetupWallet />}
	</Page>
);

export default SetupWalletComponent;
