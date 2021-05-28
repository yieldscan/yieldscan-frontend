import dynamic from "next/dynamic";
import withBaseLayout from "@components/common/layouts/base";

const Page = dynamic(
	() => import("@components/common/page").then((mod) => mod.default),
	{ ssr: false }
);

const SetupWallet = dynamic(
	() => import("@components/setup-wallet").then((mod) => mod.default),
	{ ssr: false }
);

const SetupWalletComponent = () => (
	<Page title="Setup Extension" layoutProvider={withBaseLayout}>
		{() => <SetupWallet />}
	</Page>
);

export default SetupWalletComponent;
