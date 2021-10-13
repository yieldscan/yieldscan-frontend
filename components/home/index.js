import React from "react";
import { Box, Button, Image, Link } from "@chakra-ui/core";
import { Link as ScrollLink, animateScroll as scroll } from "react-scroll";
import {
	useTransaction,
	useSelectedNetwork,
	useCoinGeckoPriceUSD,
} from "@lib/store";
import { getNetworkInfo } from "../../yieldscan.config";
import SocialProofStats from "./SocialProofStats";
import LandingPageCalculator from "./landing-page-calculator";
import Testimonials from "./testimonials";
import FAQs from "./FAQs";
import SupportedNetworks from "./SupportedNetworks";
import { ArrowUp, ChevronRight } from "react-feather";
import { useRouter } from "next/router";

window.setImmediate = (cb) => cb();

const HomePage = () => {
	const router = useRouter();
	const { selectedNetwork } = useSelectedNetwork();
	const networkInfo = getNetworkInfo(selectedNetwork);
	const { stakingAmount, setStakingAmount } = useTransaction();
	const { coinGeckoPriceUSD } = useCoinGeckoPriceUSD();
	const [inputValue, setInputValue] = React.useState(stakingAmount || 1000);

	const [showScroll, setShowScroll] = React.useState(false);

	const scrollToTop = () => {
		scroll.scrollToTop();
	};

	const checkScrollTop = () => {
		if (!showScroll && window.pageYOffset > 400) {
			setShowScroll(true);
		} else if (showScroll && window.pageYOffset <= 400) {
			setShowScroll(false);
		}
	};

	React.useEffect(() => {
		setStakingAmount(inputValue);
	}, [inputValue]);

	window.addEventListener("scroll", checkScrollTop);

	return (
		<div className="pt-12 w-full min-h-full px-4 md:px-12 lg:px-20 xl:px-32 flex flex-col items-center">
			<button
				className={`fixed bottom-0 right-0 z-20 mb-24 mr-12 px-4 py-4 bg-gray-700 rounded-full text-white flex items-center justify-center transition ease-in-out duration-500 ${
					showScroll ? "opacity-75 hover:opacity-100" : "opacity-0"
				}`}
				onClick={scrollToTop}
			>
				<ArrowUp />
			</button>
			<div className="w-full">
				<h1 className="text-3xl md:text-4xl text-gray-700 dark:text-white font-bold text-center">
					Built to maximize staking yield
				</h1>
				<p className="text-center text-gray-600 dark:text-gray-400 text-lg md:text-xl">
					Designed to minimize effort
					<br />
					<ScrollLink
						to="supported-networks"
						smooth={true}
						offset={-70}
						duration={1000}
						className="cursor-pointer inline-flex items-center font-medium text-gray-700 dark:text-white text-xs underline"
					>
						Looking for supported networks?
					</ScrollLink>
				</p>
			</div>
			<LandingPageCalculator
				inputValue={inputValue}
				setInputValue={(val) => setInputValue(val)}
				coinGeckoPriceUSD={coinGeckoPriceUSD}
				networkInfo={networkInfo}
			/>
			<SocialProofStats networkInfo={networkInfo} />
			<Testimonials />
			<section name="Supported Networks" id="supported-networks">
				<SupportedNetworks />
			</section>
			<hr className="w-full" />
			<FAQs />
			<div className="w-full px-8 md:px-24 rounded-xl bg-gray-100 dark:bg-gray-800 pt-10 pb-12 flex justify-between items-center mt-32 flex-wrap max-w-6xl">
				<span className="pr-0 xl:pr-16">
					<h1 className="text-2xl md:text-4xl font-semibold text-gray-700 dark:text-white mr-0 xl:mr-8">
						Ready to start earning?
					</h1>
					<p className="text-gray-700 dark:text-white text-lg mb-8 xl:mb-0">
						It's simple, non-custodial and secure.
					</p>
				</span>
				<Button
					className="shadow-teal min-w-max-content"
					color="white"
					backgroundColor="teal.500"
					rounded="full"
					fontWeight="normal"
					fontSize="lg"
					py={6}
					px={20}
					_hover={{ bg: "teal.400", transform: "scale(1.03)" }}
					_disabled={{
						bg: "white",
						opacity: 0.5,
						transform: "none",
						cursor: "not-allowed",
						filter: "none",
					}}
					onClick={() => {
						setStakingAmount(inputValue);
						router.push({ pathname: "/reward-calculator" });
					}}
					isDisabled={isNaN(inputValue) || Number(inputValue) <= 0}
				>
					Invest now
				</Button>
			</div>
			<div className="max-w-4xl mb-32">
				<h1 className="text-2xl md:text-3xl text-gray-700 dark:text-white font-bold text-center mt-20 mb-16">
					We’re backed by the best
				</h1>
				<div className="flex items-center justify-between flex-wrap">
					<div className="w-full lg:w-1/3 flex justify-center lg:block">
						<Image
							src="/images/web3foundation_grants_badge_black.png"
							alt="Web3 Foundation Grants Badge"
							w={300}
							h={120}
							mr={-2}
						/>
					</div>
					<Box
						h="fill-available"
						minH={300}
						borderRightWidth={1}
						borderColor="gray-300"
						display={{ base: "none", lg: "block" }}
					/>
					<p className="w-full lg:w-1/3 text-gray-700 dark:text-white mt-8 lg:mt-0 text-center lg:text-left">
						YieldScan is funded by{" "}
						<span className="font-semibold">Web3 Foundation</span> under{" "}
						<span className="font-semibold">Wave 6</span> of the General Grants
						Program. See{" "}
						<Link
							href="https://medium.com/web3foundation/web3-foundation-grants-wave-6-recipients-5ed8d5cc179"
							color="teal.500"
							isExternal
						>
							official announcement
						</Link>
						. <br />
						<br /> Web3 Foundation funds development work driving advancement
						and adoption of decentralized software protocols.
					</p>
				</div>
			</div>
		</div>
	);
};

export default HomePage;
