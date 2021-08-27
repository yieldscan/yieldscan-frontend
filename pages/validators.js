import dynamic from "next/dynamic";
import WithDashboardLayout from "@components/common/layouts/dashboard";
import { NextSeo } from "next-seo";

const Page = dynamic(
	() => import("@components/common/page").then((mod) => mod.default),
	{ ssr: false }
);

const ValidatorsComponent = dynamic(
	() => import("@components/validators").then((mod) => mod.default),
	{ ssr: false }
);

const Payment = () => (
	<>
		<NextSeo
			openGraph={{
				type: "website",
				title: "YieldScan: Polkadot validators",
				locale: "en_IE",
				url: "https://yieldscan.app/validators",
				site_name: "YieldScan",
				description: "Polkadot validators, Kusama validators",
			}}
		/>
		<Page title="Validators" layoutProvider={WithDashboardLayout}>
			{() => <ValidatorsComponent />}
		</Page>
	</>
);

export default Payment;
