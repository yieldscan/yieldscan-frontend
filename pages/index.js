import dynamic from "next/dynamic";
import withBaseLayout from "@components/common/layouts/base";
import { motion } from "framer-motion";

const Page = dynamic(
	() => import("@components/common/page").then((mod) => mod.default),
);

const HomeComponent = dynamic(
	() => import("@components/home").then((mod) => mod.default),
);

const HomePage = () => (
		<Page title="Home" layoutProvider={withBaseLayout}>
			{() => <HomeComponent />}
		</Page>
);

export default HomePage;
