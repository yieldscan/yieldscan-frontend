import dynamic from "next/dynamic";
import withDashboardLayout from "@components/common/layouts/dashboard";

const Page = dynamic(
	() => import("@components/common/page").then((mod) => mod.default),
	{ ssr: false }
);

const Transfer = dynamic(
	() => import("@components/transfer-funds").then((mod) => mod.default),
	{ ssr: false }
);

const TransferComponent = () => (
	<Page
		title="Transfer Funds"
		layoutProvider={withDashboardLayout}
		isSetUp={true}
	>
		{() => <Transfer />}
	</Page>
);

export default TransferComponent;
