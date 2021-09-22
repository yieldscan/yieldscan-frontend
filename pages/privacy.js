import dynamic from "next/dynamic";
import WithDocumentationLayout from "@components/common/layouts/documentation";

const Page = dynamic(
	() => import("@components/common/page").then((mod) => mod.default),
	{ ssr: false }
);

const PrivacyComponent = dynamic(
	() =>
		import("@components/policies/privacy-component").then((mod) => mod.default),
	{ ssr: false }
);

const Privacy = () => (
	<Page title="Privacy Policy" layoutProvider={WithDocumentationLayout}>
		{() => <PrivacyComponent />}
	</Page>
);

export default Privacy;
