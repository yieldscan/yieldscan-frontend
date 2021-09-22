import { Box, Button, FormLabel, Input, InputGroup } from "@chakra-ui/core";
import { isNil } from "lodash";
import NetworkPopover from "@components/common/utilities/popovers/network-popover";
import { Events, trackEvent } from "@lib/analytics";
import axios from "@lib/axios";
import { useTransaction } from "@lib/store";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Rifm } from "rifm";
import EarningsOutput from "./earnings-output";

const LandingPageCalculator = ({
	inputValue,
	setInputValue,
	networkInfo,
	coinGeckoPriceUSD,
}) => {
	const router = useRouter();

	const { setStakingAmount } = useTransaction();
	const [marketCap, setMarketCap] = useState();
	const [vol24H, setVol24H] = useState();
	const numberAccept = /[\d.]+/g;
	const parseNumber = (string) =>
		(String(string).match(numberAccept) || []).join("");

	const formatFloatingPointNumber = (value, maxDigits) => {
		const parsed = parseNumber(value);
		const [head, tail] = parsed.split(".");
		// Avoid rounding errors at toLocaleString as when user enters 1.239 and maxDigits=2 we
		// must not to convert it to 1.24, it must stay 1.23
		const scaledTail = tail != null ? tail.slice(0, maxDigits) : "";

		const number = Number.parseFloat(`${head}.${scaledTail}`);

		if (Number.isNaN(number)) {
			return "";
		}

		const formatted = number.toLocaleString("en-US", {
			minimumFractionDigits: 0,
			maximumFractionDigits: maxDigits,
		});

		if (parsed.includes(".")) {
			const [formattedHead] = formatted.split(".");

			// skip zero at digits position for non fixed floats
			// as at digits 2 for non fixed floats numbers like 1.50 has no sense, just 1.5 allowed
			// but 1.0 has sense as otherwise you will not be able to enter 1.05 for example
			const formattedTail =
				scaledTail !== "" && scaledTail[maxDigits - 1] === "0"
					? scaledTail.slice(0, -1)
					: scaledTail;

			return `${formattedHead}.${formattedTail}`;
		}
		return formatted;
	};

	const _formatCurrency = (string) =>
		formatFloatingPointNumber(string, 12) + " " + networkInfo.denom;

	useEffect(() => {
		if (!isNil(networkInfo.coinGeckoDenom)) {
			axios
				.get(
					`https://api.coingecko.com/api/v3/simple/price?ids=${networkInfo.coinGeckoDenom}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true`
				)
				.then(({ data }) => {
					setMarketCap(data[networkInfo.coinGeckoDenom].usd_market_cap);
					setVol24H(data[networkInfo.coinGeckoDenom].usd_24h_vol);
				});
		}
	}, [networkInfo.network]);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				setStakingAmount(inputValue);
				router.push({ pathname: "/reward-calculator" });
			}}
			className="w-full max-w-4xl"
		>
			<div className="flex items-center justify-between mt-8 md:mt-16 mb-8 flex-wrap">
				<div className="w-full md:w-auto">
					<div>
						<FormLabel fontSize="xs" className="text-gray-700">
							Network
						</FormLabel>
						<NetworkPopover isExpanded />
					</div>
					<div>
						<FormLabel fontSize="xs" className="text-gray-700" mt={8}>
							Your Investment
						</FormLabel>

						<InputGroup>
							<Rifm
								accept={/[\d.$]/g}
								format={_formatCurrency}
								value={inputValue || 0}
								onChange={(value) => setInputValue(parseNumber(value))}
							>
								{({ value, onChange }) => (
									// type=number is not allowed
									<Input
										type="tel"
										rounded="md"
										pt={6}
										pb={10}
										px={6}
										mt={2}
										mb={4}
										mr={{ base: 0, md: 4 }}
										maxW={500}
										placeholder={`0`}
										value={value}
										onChange={onChange}
										className="text-gray-700"
										fontSize={
											String(inputValue).length > 18
												? "md"
												: String(inputValue).length > 15
													? "lg"
													: "xl"
										}
										fontWeight="medium"
										variant="filled"
										isRequired
										autoFocus
									/>
								)}
							</Rifm>
							<p
								className="text-teal-500 text-xs font-semibold absolute z-20 left-0 ml-6 mb-6"
								style={{ bottom: "3px" }}
							>
								$
								{formatFloatingPointNumber(
									(inputValue * coinGeckoPriceUSD).toFixed(2)
								)}
							</p>
						</InputGroup>
					</div>
					<div className="hidden md:block">
						<FormLabel fontSize="xs" className="text-gray-700" mt={8}>
							About the network
						</FormLabel>
						<p className="text-sm text-gray-600 w-80">
							{networkInfo.about ? networkInfo.about + " " : ""}
							The market cap is{" "}
							<span className="text-teal-500">
								{marketCap
									? `$${formatFloatingPointNumber(marketCap.toFixed(2))}`
									: "..."}
							</span>{" "}
							and the <span className="text-gray-700 font-semibold">24h</span>{" "}
							volume is{" "}
							<span className="text-teal-500">
								{vol24H
									? `$${formatFloatingPointNumber(vol24H.toFixed(2))}`
									: "..."}
							</span>
							.
						</p>
					</div>
				</div>
				<Box
					h="fill-available"
					minH={300}
					borderRightWidth={1}
					borderColor="gray-300"
					display={{ base: "none", md: "block" }}
				/>
				<EarningsOutput networkInfo={networkInfo} inputValue={inputValue} />
			</div>
			<div className="w-full text-center mt-20">
				<Button
					as="button"
					className="rounded-md shadow-teal min-w-max-content"
					variantColor="teal"
					rounded="md"
					fontWeight="normal"
					size="lg"
					px={12}
					_hover={{ bg: "#2bcaca", transform: "translate(0, -8px)" }}
					_disabled={{
						bg: "#CAD2DB",
						transform: "none",
						cursor: "not-allowed",
						filter: "none",
					}}
					onClick={() => {
						setStakingAmount(inputValue);
						trackEvent(Events.LANDING_CTA_CLICK, {
							investmentAmount: `${inputValue} ${networkInfo.denom}`,
						}).then(() => router.push({ pathname: "/reward-calculator" }));
					}}
					isDisabled={isNaN(inputValue) || Number(inputValue) <= 0}
				>
					Start investing
				</Button>
			</div>
		</form>
	);
};

export default LandingPageCalculator;
