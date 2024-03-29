import dynamic from "next/dynamic";
import WithDocumentationLayout from "@components/common/layouts/documentation";

const Page = dynamic(
	() => import("@components/common/page").then((mod) => mod.default),
	{ ssr: false }
);

const DisclaimerComponent = dynamic(
	() =>
		import("@components/policies/disclaimer-component").then((mod) => mod.default),
	{ ssr: false }
);

const Privacy = () => (
	<Page title="Legal Disclaimer" layoutProvider={WithDocumentationLayout}>
		{() => <DisclaimerComponent />}
	</Page>
);

export default Privacy;
