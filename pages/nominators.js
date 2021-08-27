import dynamic from "next/dynamic";
import WithDashboardLayout from "@components/common/layouts/dashboard";

const Page = dynamic(
	() => import("@components/common/page").then((mod) => mod.default),
	{ ssr: false }
);

const NominatorsComponent = dynamic(
	() => import("@components/nominators").then((mod) => mod.default),
	{ ssr: false }
);

const Nominators = () => (
	<Page title="Nominators" layoutProvider={WithDashboardLayout}>
		{() => <NominatorsComponent />}
	</Page>
);

export default Nominators;
