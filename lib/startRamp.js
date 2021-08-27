import { RampInstantSDK } from "@ramp-network/ramp-instant-sdk";

const startRamp = (networkInfo, amount = "", address = "") => {
	new RampInstantSDK({
		hostAppName: "YieldScan",
		hostApiKey: process.env.NEXT_PUBLIC_RAMP_API_KEY,
		hostLogoUrl: "https://yieldscan.app/images/yieldscan-logo.svg",
		swapAsset: networkInfo.denom,
		// swapAmount: amount,
		userAddress: address,
	})
		.on("*", (event) => console.info(event))
		.show();
};
export default startRamp;
