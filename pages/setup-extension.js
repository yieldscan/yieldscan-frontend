import dynamic from "next/dynamic";
import withBaseLayout from "@components/common/layouts/base";

const Page = dynamic(
	() => import("@components/common/page").then((mod) => mod.default),
	{ ssr: false }
);

const SetupExtension = dynamic(
	() => import("@components/setup-extension").then((mod) => mod.default),
	{ ssr: false }
);

const SetupExtensionComponent = () => (
	<Page title="Setup Extension" layoutProvider={withBaseLayout}>
		{() => <SetupExtension />}
	</Page>
);

export default SetupExtensionComponent;
