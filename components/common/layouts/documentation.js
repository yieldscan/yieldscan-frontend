/* eslint-disable react/display-name */
import dynamic from "next/dynamic";
import Footer from "../footer";

const Header = dynamic(
	() => import("@components/common/header").then((mod) => mod.default),
	{ ssr: false }
);

const WithDocumentationLayout = (children) => {
	return <div>
		<Header isBase />
		<div className="flex justify-center w-full">
			<div className="max-w-5xl px-6">{children()}</div>
		</div>
		<Footer />
	</div>

};

export default WithDocumentationLayout;
