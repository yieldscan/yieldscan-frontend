import {
	Box,
	FormLabel,
	Skeleton,
	Divider,
	Image,
	Alert,
	AlertDescription,
} from "@chakra-ui/core";
import axios from "@lib/axios";
import calculateReward from "@lib/calculate-reward";
import getRewards from "@lib/getRewards";
import getClaimableRewards from "@lib/getClaimableRewards";
import formatCurrency from "@lib/format-currency";
import {
	useYearlyEarning,
	useMonthlyEarning,
	useDailyEarning,
	useValidatorData,
	useTransaction,
	useTransactionHash,
	useCoinGeckoPriceUSD,
} from "@lib/store";
import { cloneDeep, get, isNil, keyBy, mapValues, set } from "lodash";
import { useEffect, useState } from "react";
import CountUp from "react-countup";
import { Twitter } from "react-feather";
import getErasHistoric from "@lib/getErasHistoric";
import ProgressiveImage from "react-progressive-image";
import PastEarningsTimeRange from "./PastEarningsTimeRange";
import getRewardsSum from "@lib/getRewardsSum";

const PastEarningsDisplay = ({ earnings, networkInfo }) =>
	!isNil(earnings) ? (
		<>
			<div className="text-xl justify-between text">
				{formatCurrency.methods.formatAmount(
					Math.trunc(earnings.currency),
					networkInfo
				)}
			</div>
			<div className="text-sm font-medium text-teal-500">
				${formatCurrency.methods.formatNumber(earnings.subCurrency.toFixed(2))}
			</div>
		</>
	) : (
		<Skeleton>
			<span>Loading...</span>
		</Skeleton>
	);

const EarningsOutput = ({
	networkInfo,
	inputValue,
	validators,
	eraLength,
	address,
	activeEra,
}) => {
	const transactionState = useTransaction();
	const [risk, setRisk] = useState(transactionState.riskPreference || "Medium");
	const [totalEarnings, setTotalEarnings] = useState();
	const [dailyEarnings, setDailyEarnings] = useState();
	const [monthlyEarnings, setMonthlyEarnings] = useState();
	const [weeklyEarnings, setWeeklyEarnings] = useState();
	const [stakedAmountMapped, setStakedAmountMapped] = useState();
	const [overallStakedAmountMapped, setOverallStakedAmountMapped] = useState();
	const { transactionHash } = useTransactionHash();
	const { coinGeckoPriceUSD } = useCoinGeckoPriceUSD();

	const [tweet, setTweet] = useState();

	// useEffect(() => {
	// 	setDailyEarnings(null);
	// 	setWeeklyEarnings(null);
	// 	setTotalEarnings(null);
	// 	getRewards(address, networkInfo).then((data) => {
	// 		const currentTimeStamp = Date.now() / 1000;
	// 		const oneDayEarnings = data
	// 			.filter((x) => x.block_timestamp > currentTimeStamp - 86400)
	// 			.reduce((a, b) => a + parseInt(b.amount), 0);
	// 		setDailyEarnings({
	// 			currency: oneDayEarnings,
	// 			subCurrency:
	// 				(oneDayEarnings / Math.pow(10, networkInfo.decimalPlaces)) *
	// 				coinGeckoPriceUSD,
	// 		});

	// 		const weekEarnings = data
	// 			.filter((x) => x.block_timestamp > currentTimeStamp - 604800)
	// 			.reduce((a, b) => a + parseInt(b.amount), 0);
	// 		setWeeklyEarnings({
	// 			currency: weekEarnings,
	// 			subCurrency:
	// 				(weekEarnings / Math.pow(10, networkInfo.decimalPlaces)) *
	// 				coinGeckoPriceUSD,
	// 		});

	// 		const monthEarnings = data
	// 			.filter((x) => x.block_timestamp > currentTimeStamp - 2592000)
	// 			.reduce((a, b) => a + parseInt(b.amount), 0);
	// 		setMonthlyEarnings({
	// 			currency: monthEarnings,
	// 			subCurrency:
	// 				(monthEarnings / Math.pow(10, networkInfo.decimalPlaces)) *
	// 				coinGeckoPriceUSD,
	// 		});

	// 		const total = data.reduce((a, b) => a + parseInt(b.amount), 0);
	// 		setTotalEarnings({
	// 			currency: total,
	// 			subCurrency:
	// 				(total / Math.pow(10, networkInfo.decimalPlaces)) * coinGeckoPriceUSD,
	// 		});
	// 	});
	// }, [networkInfo, address]);

	useEffect(() => {
		setTotalEarnings(null);
		getRewardsSum(address, networkInfo).then((data) => {
			setTotalEarnings({
				currency: data,
				subCurrency:
					(data / Math.pow(10, networkInfo.decimalPlaces)) * coinGeckoPriceUSD,
			});
		});
	}, [address, networkInfo]);

	useEffect(() => {
		setStakedAmountMapped(null);
		if (address && eraLength && activeEra) {
			axios
				.get(
					`/${networkInfo.network}/actors/nominator/history?id=${address}&activeEra=${activeEra}`
				)
				.then(({ data }) => {
					const erasPerDay = Math.floor(1440 / ((eraLength * 6) / 60));

					const previousDayEras = [...Array(erasPerDay).keys()].map(
						(i) => activeEra - 1 - i
					);

					const previousWeekEras = [...Array(erasPerDay * 7).keys()].map(
						(i) => activeEra - 1 - i
					);

					const previousDayHistory = {
						data: data.filter((x) => previousDayEras.includes(x.eraIndex)),
						totalAmountStaked: data
							.filter((x) => previousDayEras.includes(x.eraIndex))
							.reduce((acc, x) => acc + x.nomStake, 0),
						totalReward: data
							.filter((x) => previousDayEras.includes(x.eraIndex))
							.reduce((acc, x) => acc + x.nomReward, 0),
						erasPerDay: erasPerDay,
					};
					const previousWeekHistory = {
						data: data.filter((x) => previousWeekEras.includes(x.eraIndex)),
						totalAmountStaked: data
							.filter((x) => previousWeekEras.includes(x.eraIndex))
							.reduce((acc, x) => acc + x.nomStake, 0),
						totalReward: data
							.filter((x) => previousWeekEras.includes(x.eraIndex))
							.reduce((acc, x) => acc + x.nomReward, 0),
						erasPerDay: erasPerDay,
					};
					const previousMonthHistory = {
						data: data,
						totalAmountStaked: data.reduce((acc, x) => acc + x.nomStake, 0),
						totalReward: data.reduce((acc, x) => acc + x.nomReward, 0),
						erasPerDay: erasPerDay,
					};

					setStakedAmountMapped({
						previousDayHistory: previousDayHistory,
						previousWeekHistory: previousWeekHistory,
						previousMonthHistory: previousMonthHistory,
					});
				})
				.catch((err) => console.error(err));
		}
	}, [address, networkInfo]);

	useEffect(() => {
		setOverallStakedAmountMapped(null);
		if (address && eraLength && activeEra) {
			axios
				.get(
					`/${networkInfo.network}/actors/nominator/overall_history?id=${address}&activeEra=${activeEra}`
				)
				.then(({ data }) => {
					const erasPerDay = Math.floor(1440 / ((eraLength * 6) / 60));

					const overallRewardInfo = {
						data: data,
						totalAmountStaked: data.reduce((acc, x) => acc + x.nomStake, 0),
						totalReward: data.reduce((acc, x) => acc + x.nomReward, 0),
						erasPerDay: erasPerDay,
					};

					setOverallStakedAmountMapped(overallRewardInfo);
				})
				.catch((err) => console.error(err));
		}
	}, [address, networkInfo]);

	useEffect(() => {
		setTweet(null);
		if (overallStakedAmountMapped) {
			const overallYield = (
				(overallStakedAmountMapped.totalReward /
					overallStakedAmountMapped.totalAmountStaked) *
				100 *
				overallStakedAmountMapped.erasPerDay *
				365
			).toFixed(2);

			const msg = `I am earning ${overallYield}% APR by staking on ${networkInfo.twitterUrl} through @yield_scan. What are you waiting for?
			\nStake on https://yieldscan.app/ and be a part of @Polkadot & @kusamanetwork today!
			\nDon't forget to tweet your APR! #YieldScan $DOT $KSM`;
			setTweet("https://twitter.com/intent/tweet?text=" + escape(msg));
		}
	}, [overallStakedAmountMapped, networkInfo, address]);

	return (
		<Box minW={320} w="full">
			<div className="flex">
				<ProgressiveImage
					src="/images/dollar-sign.svg"
					placeholder="/images/dollar-sign.jpg"
				>
					{(src) => (
						<img src={src} alt="dollar-sign" width="32px" height="32px" />
					)}
				</ProgressiveImage>
				<p className="font-semibold text-base text-gray-700 ml-2 mt-1">
					Earnings
				</p>
			</div>
			{false && (
				<div className="bg-gray-100 rounded-lg mt-4 py-4 px-8">
					<FormLabel fontSize="sm" className="font-medium text-gray-700">
						Claimable Earnings
					</FormLabel>
					<h2 className="text-xl text-gray-700 font-bold">
						{!isNil(totalEarnings) ? (
							<>
								<div className="flex justify-between">
									{formatCurrency.methods.formatAmount(
										Math.trunc(totalEarnings.currency),
										networkInfo
									)}
								</div>
								<div className="text-sm font-medium text-teal-500">
									$
									{formatCurrency.methods.formatNumber(
										totalEarnings.subCurrency.toFixed(2)
									)}
								</div>
							</>
						) : (
							<Skeleton>
								<span>Loading...</span>
							</Skeleton>
						)}
					</h2>
				</div>
			)}
			<FormLabel fontSize="sm" className="mt-4 font-medium text-gray-700">
				Your overall yield
			</FormLabel>
			<div className="flex justify-between items-center">
				<h2
					className={`${
						validators.length !== 0 ? "text-gray-700" : "text-light-gray"
					} font-bold`}
				>
					{!isNil(overallStakedAmountMapped) ? (
						<>
							<div className="text-xl justify-between text">
								{(
									(overallStakedAmountMapped.totalReward /
										overallStakedAmountMapped.totalAmountStaked) *
									100 *
									overallStakedAmountMapped.erasPerDay *
									365
								).toFixed(2)}{" "}
								%
							</div>
						</>
					) : (
						<Skeleton>
							<span>Loading...</span>
						</Skeleton>
					)}
				</h2>
				<span>
					<button
						className="border rounded-full flex text-sm text-white bg-blue-450 bg-twitter-500 font-medium p-2 px-4 justify-center items-center"
						onClick={() => window?.open(tweet, "_blank")}
					>
						<Twitter
							className="mr-2"
							size="16px"
							color="#ffffff"
							strokeWidth="2.5"
						/>
						<p>Tweet</p>
					</button>
				</span>
			</div>
			<FormLabel fontSize="sm" className="mt-4 font-medium text-gray-700">
				Your overall earnings
			</FormLabel>
			<div className="flex justify-between items-center">
				<h2
					className={`${
						validators.length !== 0 ? "text-gray-700" : "text-light-gray"
					} font-bold`}
				>
					{!isNil(totalEarnings) ? (
						<>
							<div className="text-lg justify-between text">
								{formatCurrency.methods.formatAmount(
									Math.trunc(totalEarnings.currency),
									networkInfo
								)}
							</div>
							<div className="text-sm font-medium text-teal-500">
								$
								{formatCurrency.methods.formatNumber(
									totalEarnings.subCurrency.toFixed(2)
								)}
							</div>
						</>
					) : (
						<Skeleton>
							<span>Loading...</span>
						</Skeleton>
					)}
				</h2>
			</div>
			{transactionHash && (
				<div className="mt-4 flex">
					<Alert
						status="warning"
						color="#FDB808"
						backgroundColor="#FFF4DA"
						borderRadius="8px"
					>
						<AlertDescription color="#FDB808" fontSize="12px">
							<p>
								Your staking investment will start earning returns in
								approximately {(2 * 24) / networkInfo.erasPerDay} hours.
							</p>
							<p className="mt-4">
								We recommend bookmarking this tab and checking back soon.
							</p>
						</AlertDescription>
					</Alert>
				</div>
			)}
			<div className="mt-8">
				<FormLabel fontSize="sm" className="font-medium text-gray-700">
					Past Earnings Breakup
				</FormLabel>
			</div>
			<div>
				<FormLabel fontSize="xs" className="text-gray-700">
					Previous Month
				</FormLabel>
				{!isNil(stakedAmountMapped) ? (
					<div className="flex justify-between">
						<p className="text-sm text-gray-600">
							<CountUp
								end={
									stakedAmountMapped.previousMonthHistory.totalReward /
									Math.pow(10, networkInfo.decimalPlaces)
								}
								duration={0.5}
								decimals={3}
								separator=","
								suffix={` ${networkInfo.denom}`}
								preserveValue
							/>
						</p>
						<div className="flex">
							<p className="text-sm font-medium text-teal-500 mr-2">
								<CountUp
									end={
										(stakedAmountMapped.previousMonthHistory.totalReward /
											Math.pow(10, networkInfo.decimalPlaces)) *
										coinGeckoPriceUSD
									}
									duration={0.5}
									decimals={2}
									separator=","
									prefix={`$`}
									preserveValue
								/>
							</p>
							<Divider orientation="vertical" />
							<p className="text-sm text-gray-600 w-12 text-right">
								<CountUp
									end={
										(stakedAmountMapped.previousMonthHistory.totalReward /
											stakedAmountMapped.previousMonthHistory
												.totalAmountStaked) *
										stakedAmountMapped.previousMonthHistory.erasPerDay *
										365 *
										100
									}
									duration={0.5}
									decimals={2}
									separator=","
									suffix={`%`}
									preserveValue
								/>
							</p>
						</div>
					</div>
				) : (
					<div className="flex justify-between">
						<Skeleton>
							<span>Loading...</span>
						</Skeleton>
					</div>
				)}
			</div>
			<div>
				<FormLabel fontSize="xs" className="text-gray-700" mt={6}>
					Previous Week
				</FormLabel>
				{!isNil(stakedAmountMapped) ? (
					<div className="flex justify-between">
						<p className="text-sm text-gray-600">
							<CountUp
								end={
									stakedAmountMapped.previousWeekHistory.totalReward /
									Math.pow(10, networkInfo.decimalPlaces)
								}
								duration={0.5}
								decimals={3}
								separator=","
								suffix={` ${networkInfo.denom}`}
								preserveValue
							/>
						</p>
						<div className="flex">
							<p className="text-sm font-medium text-teal-500 mr-2">
								<CountUp
									end={
										(stakedAmountMapped.previousWeekHistory.totalReward /
											Math.pow(10, networkInfo.decimalPlaces)) *
										coinGeckoPriceUSD
									}
									duration={0.5}
									decimals={2}
									separator=","
									prefix={`$`}
									preserveValue
								/>
							</p>
							<Divider orientation="vertical" />
							<p className="text-sm text-gray-600 w-12 text-right">
								<CountUp
									end={
										(stakedAmountMapped.previousWeekHistory.totalReward /
											stakedAmountMapped.previousWeekHistory
												.totalAmountStaked) *
										stakedAmountMapped.previousWeekHistory.erasPerDay *
										365 *
										100
									}
									duration={0.5}
									decimals={2}
									separator=","
									suffix={`%`}
									preserveValue
								/>
							</p>
						</div>
					</div>
				) : (
					<div className="flex justify-between">
						<Skeleton>
							<span>Loading...</span>
						</Skeleton>
					</div>
				)}
			</div>
			<div>
				<FormLabel fontSize="xs" className="text-gray-700" mt={6}>
					Previous Day
				</FormLabel>
				{!isNil(stakedAmountMapped) ? (
					<div className="flex justify-between">
						<p className="text-sm text-gray-600">
							<CountUp
								end={
									stakedAmountMapped.previousDayHistory.totalReward /
									Math.pow(10, networkInfo.decimalPlaces)
								}
								duration={0.5}
								decimals={3}
								separator=","
								suffix={` ${networkInfo.denom}`}
								preserveValue
							/>
						</p>
						<div className="flex">
							<p className="text-sm font-medium text-teal-500 mr-2">
								<CountUp
									end={
										(stakedAmountMapped.previousDayHistory.totalReward /
											Math.pow(10, networkInfo.decimalPlaces)) *
										coinGeckoPriceUSD
									}
									duration={0.5}
									decimals={2}
									separator=","
									prefix={`$`}
									preserveValue
								/>
							</p>
							<Divider orientation="vertical" />
							<p className="text-sm text-gray-600 w-12 text-right">
								<CountUp
									end={
										(stakedAmountMapped.previousDayHistory.totalReward /
											stakedAmountMapped.previousDayHistory.totalAmountStaked) *
										stakedAmountMapped.previousDayHistory.erasPerDay *
										365 *
										100
									}
									duration={0.5}
									decimals={2}
									separator=","
									suffix={`%`}
									preserveValue
								/>
							</p>
						</div>
					</div>
				) : (
					<div className="flex justify-between">
						<Skeleton>
							<span>Loading...</span>
						</Skeleton>
					</div>
				)}
			</div>
		</Box>
	);
};

export default EarningsOutput;
