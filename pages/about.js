import dynamic from "next/dynamic";
import WithBaseLayout from "@components/common/layouts/base";

const Page = dynamic(
	() => import("@components/common/page").then((mod) => mod.default),
	{ ssr: false }
);

const AboutComponent = dynamic(
	() => import("@components/about").then((mod) => mod.default),
	{ ssr: false }
);

const About = () => (
	<Page title="About us" layoutProvider={WithBaseLayout}>
		{() => <AboutComponent />}
	</Page>
);

export default About;
