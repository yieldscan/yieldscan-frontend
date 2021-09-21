import dynamic from "next/dynamic";
import WithBaseLayout from "@components/common/layouts/base";

const Page = dynamic(
	() => import("@components/common/page").then((mod) => mod.default),
	{ ssr: false }
);

const CareersComponent = dynamic(
	() => import("@components/careers").then((mod) => mod.default),
	{ ssr: false }
);

const Careers = () => (
	<Page title="Careers at yieldscan" layoutProvider={WithBaseLayout}>
		{() => <CareersComponent />}
	</Page>
);

export default Careers;
