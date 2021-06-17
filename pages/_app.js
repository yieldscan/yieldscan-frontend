import { MetomicProvider } from "@metomic/react";
import * as Sentry from "@sentry/node";
// import tawkTo from "tawkto-react";

import { ThemeProvider, theme } from "@chakra-ui/core";
import { IntercomProvider, useIntercom } from "react-use-intercom";
import "../styles/index.scss";
import { useEffect } from "react";

const customIcons = {
	secureLogo: {
		path: (
			<svg
				width="18"
				height="22"
				viewBox="0 0 18 22"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<rect width="18" height="22" fill="#E5E5E5" />
				<rect
					x="-3557"
					y="-1457"
					width="19820"
					height="11679"
					rx="538"
					stroke="black"
					strokeWidth="30"
				/>
				<g clipPath="url(#clip0)">
					<rect
						width="1440"
						height="900"
						transform="translate(-797 -527)"
						fill="white"
					/>
					<rect x="-586" y="-463" width="1229" height="836" fill="white" />
					<g filter="url(#filter0_f)">
						<rect
							x="-0.305176"
							y="-273.838"
							width="420.61"
							height="210.838"
							rx="20"
							fill="#2BCACA"
							fillOpacity="0.2"
						/>
					</g>
					<path
						d="M9 21C9 21 17 17 17 11V4L9 1L1 4V11C1 17 9 21 9 21Z"
						fill="#798594"
						stroke="#798594"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M14 7L7.125 14L4 10.8182"
						stroke="white"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<rect
						x="-22.5"
						y="-26.5"
						width="465"
						height="75"
						rx="7.5"
						stroke="#E2ECF9"
					/>
				</g>
				<defs>
					<filter
						id="filter0_f"
						x="-75.3052"
						y="-348.838"
						width="570.61"
						height="360.838"
						filterUnits="userSpaceOnUse"
						colorInterpolationFilters="sRGB"
					>
						<feFlood floodOpacity="0" result="BackgroundImageFix" />
						<feBlend
							mode="normal"
							in="SourceGraphic"
							in2="BackgroundImageFix"
							result="shape"
						/>
						<feGaussianBlur
							stdDeviation="37.5"
							result="effect1_foregroundBlur"
						/>
					</filter>
					<clipPath id="clip0">
						<rect
							width="1440"
							height="900"
							fill="white"
							transform="translate(-797 -527)"
						/>
					</clipPath>
				</defs>
			</svg>
		),
	},
	walletIcon: {
		path: (
			<svg
				width="100"
				height="90"
				viewBox="0 0 100 90"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M85 20H80V15C80 11.0218 78.4196 7.20644 75.6066 4.3934C72.7936 1.58035 68.9782 0 65 0H15C11.0218 0 7.20644 1.58035 4.3934 4.3934C1.58035 7.20644 0 11.0218 0 15V75C0 78.9782 1.58035 82.7936 4.3934 85.6066C7.20644 88.4196 11.0218 90 15 90H85C88.9782 90 92.7936 88.4196 95.6066 85.6066C98.4196 82.7936 100 78.9782 100 75V35C100 31.0218 98.4196 27.2064 95.6066 24.3934C92.7936 21.5804 88.9782 20 85 20ZM15 10H65C66.3261 10 67.5979 10.5268 68.5355 11.4645C69.4732 12.4021 70 13.6739 70 15V20H15C13.6739 20 12.4021 19.4732 11.4645 18.5355C10.5268 17.5979 10 16.3261 10 15C10 13.6739 10.5268 12.4021 11.4645 11.4645C12.4021 10.5268 13.6739 10 15 10ZM90 60H85C83.6739 60 82.4021 59.4732 81.4645 58.5355C80.5268 57.5979 80 56.3261 80 55C80 53.6739 80.5268 52.4021 81.4645 51.4645C82.4021 50.5268 83.6739 50 85 50H90V60ZM90 40H85C81.0218 40 77.2064 41.5803 74.3934 44.3934C71.5804 47.2064 70 51.0218 70 55C70 58.9782 71.5804 62.7936 74.3934 65.6066C77.2064 68.4196 81.0218 70 85 70H90V75C90 76.3261 89.4732 77.5979 88.5355 78.5355C87.5979 79.4732 86.3261 80 85 80H15C13.6739 80 12.4021 79.4732 11.4645 78.5355C10.5268 77.5979 10 76.3261 10 75V29.15C11.6063 29.7151 13.2972 30.0025 15 30H85C86.3261 30 87.5979 30.5268 88.5355 31.4645C89.4732 32.4021 90 33.6739 90 35V40Z"
					fill="#2BCACA"
				/>
			</svg>
		),
	},
};

const customTheme = {
	...theme,
	icons: {
		...theme.icons,
		...customIcons,
	},
	colors: {
		...theme.colors,
		teal: {
			...theme.colors.teal,
			300: "#45E2E2",
			500: "#2BCACA",
			700: "#20B1B1",
		},
		pink: {
			...theme.colors.pink,
			300: "#FF9DC0",
			500: "#FF7CAB",
			700: "#EF6093",
		},
		orange: {
			...theme.colors.orange,
			500: "#F5B100",
		},
	},
	opacity: {
		...theme.opacity,
		10: ".1",
		20: ".2",
		30: ".3",
		40: ".4",
		50: ".5",
		60: ".6",
		70: ".7",
		80: ".8",
		90: ".9",
	},
};

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
	Sentry.init({
		environment: process.env.NODE_ENV,
		enabled: process.env.NODE_ENV === "production",
		dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
	});
}

export default function YieldScanApp({ Component, pageProps, err }) {
	// useEffect(() => {
	// 	if (process.env.NEXT_PUBLIC_TAWK_PROP_ID)
	// 		tawkTo(process.env.NEXT_PUBLIC_TAWK_PROP_ID);
	// }, []);
	const intercomAppId = process.env.NEXT_PUBLIC_INTERCOM_ID;
	return (
		<ThemeProvider theme={customTheme}>
			<MetomicProvider projectId={process.env.NEXT_PUBLIC_METOMIC_PROJECT_ID}>
				<IntercomProvider appId={intercomAppId} autoBoot={true}>
					<Component {...pageProps} err={err} />
				</IntercomProvider>
			</MetomicProvider>
		</ThemeProvider>
	);
}
