import dynamic from "next/dynamic";
import Footer from "../footer";
import {motion} from "framer-motion"

const Header = dynamic(
	() => import("@components/common/header").then((mod) => mod.default),
	{ ssr: false }
);

const withDocumentationLayout = (children) => {
	return () => (
		<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
			<Header isBase />
			<div className="flex justify-center w-full">
				<div className="documentation">{children()}</div>
			</div>
			<Footer />
		</motion.div>
	);
};

export default withDocumentationLayout;
