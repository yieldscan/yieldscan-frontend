import dynamic from "next/dynamic";
import withBaseLayout from "@components/common/layouts/base";

const Page = dynamic(
	() => import("@components/common/page").then((mod) => mod.default),
	{ ssr: false }
);

const SetupAccounts = dynamic(
	() => import("@components/setup-accounts").then((mod) => mod.default),
	{ ssr: false }
);

const SetupAccountsComponent = () => (
	<Page title="Setup Accounts" layoutProvider={withBaseLayout}>
		{() => <SetupAccounts />}
	</Page>
);

export default SetupAccountsComponent;
