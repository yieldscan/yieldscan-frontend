import dynamic from "next/dynamic";
import withBaseLayout from "@components/common/layouts/base";
import { NextSeo } from "next-seo";

const Page = dynamic(
	() => import("@components/common/page").then((mod) => mod.default),
	{ ssr: false }
);

const HomeComponent = dynamic(
	() => import("@components/home").then((mod) => mod.default),
	{ ssr: false }
);

const HomePage = () => (
	<>
		<NextSeo
			title="YieldScan"
			description="How to stake Polkadot?, How to stake Kusama?"
		/>
		<Page title="Home" layoutProvider={withBaseLayout}>
			{() => <HomeComponent />}
		</Page>
	</>
);

export default HomePage;
