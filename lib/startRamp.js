import { RampInstantSDK } from "@ramp-network/ramp-instant-sdk";

const startRamp = (networkInfo) => {
	new RampInstantSDK({
		hostAppName: "YieldScan",
		hostApiKey: process.env.NEXT_PUBLIC_RAMP_API_KEY,
		hostLogoUrl: "https://yieldscan.app/images/yieldscan-logo.svg",
		swapAsset: networkInfo.denom,
	})
		.on("*", (event) => console.log(event))
		.show();
};
export default startRamp;
