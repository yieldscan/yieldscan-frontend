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
} from "@lib/store";
import { cloneDeep, get, isNil, keyBy, mapValues, set } from "lodash";
import { useEffect, useState } from "react";
import CountUp from "react-countup";
import { Twitter } from "react-feather";
import convertCurrency from "@lib/convert-currency";
import getErasHistoric from "@lib/getErasHistoric";
import ProgressiveImage from "react-progressive-image";
import PastEarningsTimeRange from "./PastEarningsTimeRange";

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

const EarningsOutput = ({ networkInfo, inputValue, validators, address }) => {
	const transactionState = useTransaction();
	const [risk, setRisk] = useState(transactionState.riskPreference || "Medium");
	const [timeRange, setTimeRange] = useState("all");
	const [yearlyEarning, setYearlyEarning] = useState();
	const [totalEarnings, setTotalEarnings] = useState();
	const [dailyEarnings, setDailyEarnings] = useState();
	const [weeklyEarnings, setWeeklyEarnings] = useState();
	const { transactionHash } = useTransactionHash();
	// const yearlyEarning = useYearlyEarning((state) => state.yearlyEarning);
	// const setYearlyEarning = useYearlyEarning((state) => state.setYearlyEarning);

	const [monthlyEarning, setMonthlyEarning] = useState();

	const [tweet, setTweet] = useState();
	const [claimableRewards, setClaimableRewards] = useState();
	const [erasHistoric, setErasHistoric] = useState();

	// const monthlyEarning = useMonthlyEarning((state) => state.monthlyEarning);
	// const setMonthlyEarning = useMonthlyEarning(
	// 	(state) => state.setMonthlyEarning
	// );

	const [dailyEarning, setDailyEarning] = useState();

	const [selectedValidators, setSelectedValidators] = useState();
	const { validatorMap, setValidatorMap } = useValidatorData();

	useEffect(() => {
		if (validatorMap) {
			const selectedValidators = cloneDeep(validatorMap[risk]);
			setSelectedValidators(selectedValidators);
		}
	}, [validatorMap]);

	useEffect(() => {
		if (!totalEarnings) {
			getRewards(address, networkInfo).then((data) => {
				const currentTimeStamp = Date.now() / 1000;
				const oneDayEarnings = data
					.filter((x) => x.block_timestamp > currentTimeStamp - 86400)
					.reduce((a, b) => a + parseInt(b.amount), 0);
				convertCurrency(
					oneDayEarnings / Math.pow(10, networkInfo.decimalPlaces),
					networkInfo.coinGeckoDenom
				)
					.then((value) =>
						setDailyEarnings({
							currency: oneDayEarnings,
							subCurrency: value,
						})
					)
					.catch((err) => {
						console.error(err);
					});
				const weekEarnings = data
					.filter((x) => x.block_timestamp > currentTimeStamp - 604800)
					.reduce((a, b) => a + parseInt(b.amount), 0);
				convertCurrency(
					weekEarnings / Math.pow(10, networkInfo.decimalPlaces),
					networkInfo.coinGeckoDenom
				)
					.then((value) =>
						setWeeklyEarnings({
							currency: weekEarnings,
							subCurrency: value,
						})
					)
					.catch((err) => {
						console.error(err);
					});
				const total = data.reduce((a, b) => a + parseInt(b.amount), 0);
				convertCurrency(
					total / Math.pow(10, networkInfo.decimalPlaces),
					networkInfo.coinGeckoDenom
				)
					.then((value) =>
						setTotalEarnings({
							currency: total,
							subCurrency: value,
						})
					)
					.catch((err) => {
						console.error(err);
					});
			});
		}
	}, [networkInfo]);

	useEffect(() => {
		if (!validatorMap) {
			setYearlyEarning(null);
			setDailyEarning(null);
			setMonthlyEarning(null);
			setSelectedValidators(null);
			axios.get(`/${networkInfo.network}/rewards/risk-set`).then(({ data }) => {
				/**
				 * `mapValues(keyBy(array), 'value-key')`:
				 * 	O(N + N) operation, using since each risk set will have maximum 16 validators
				 */
				const validatorMap = {
					Low: mapValues(keyBy(data.lowriskset, "stashId")),
					Medium: mapValues(keyBy(data.medriskset, "stashId")),
					High: mapValues(keyBy(data.highriskset, "stashId")),
					total: data.totalset,
				};

				setValidatorMap(validatorMap);
				setSelectedValidators(validatorMap["Medium"]);
			});
		} else {
			console.info("Using previous validator map.");
		}
	}, [networkInfo]);

	useEffect(() => {
		if (yearlyEarning) {
			const msg = `I am earning ${yearlyEarning.yieldPercentage.toFixed(
				2
			)}% APR by staking on ${
				networkInfo.twitterUrl
			} through @yield_scan - created by @buidllabs. What are you waiting for?
			\nStake on https://yieldscan.onrender.com/ and be a part of @Polkadot & @kusamanetwork today!
			\nDon't forget to tweet your APR! #YieldScan $DOT $KSM`;
			setTweet("https://twitter.com/intent/tweet?text=" + escape(msg));
		}
	}, [yearlyEarning]);

	useEffect(() => {
		if (validators) {
			const selectedValidatorsList = Object.values(validators).filter(
				(v) => !isNil(v)
			);
			calculateReward(
				selectedValidatorsList,
				inputValue.currency,
				12,
				"months",
				true,
				networkInfo
			)
				.then((result) => {
					setYearlyEarning(result);
				})
				.catch((error) => {
					// TODO: handle error gracefully with UI toast
					console.error(error);
				});
			calculateReward(
				selectedValidatorsList,
				inputValue.currency,
				1,
				"months",
				true,
				networkInfo
			)
				.then((result) => {
					setMonthlyEarning(result);
				})
				.catch((error) => {
					// TODO: handle error gracefully with UI toast
					console.error(error);
				});
			calculateReward(
				selectedValidatorsList,
				inputValue.currency,
				1,
				"days",
				true,
				networkInfo
			)
				.then((result) => {
					setDailyEarning(result);
				})
				.catch((error) => {
					// TODO: handle error gracefully with UI toast
					console.error(error);
				});
		}
	}, [inputValue, validators]);

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
				Your past earnings
			</FormLabel>
			<div className="flex justify-between items-center">
				<h2
					className={`${
						validators.length !== 0 ? "text-gray-700" : "text-light-gray"
					} font-bold`}
				>
					<PastEarningsDisplay
						earnings={
							timeRange === "24h"
								? dailyEarnings
								: timeRange === "week"
								? weeklyEarnings
								: totalEarnings
						}
						networkInfo={networkInfo}
					/>
				</h2>
				<span>
					<PastEarningsTimeRange
						unit={timeRange}
						onUnitChange={(val) => setTimeRange(val)}
					/>
				</span>

				{/* <h2
						className={`${
							validators.length !== 0 ? "text-gray-700" : "text-light-gray"
						} font-bold`}
					>
						{!isNil(weeklyEarnings) ? (
							<>
								<div className="text-xl justify-between text">
									{formatCurrency.methods.formatAmount(
										Math.trunc(weeklyEarnings.currency),
										networkInfo
									)}
								</div>
								<div className="text-sm font-medium text-teal-500">
									$
									{formatCurrency.methods.formatNumber(
										weeklyEarnings.subCurrency.toFixed(2)
									)}
								</div>
							</>
						) : (
							<Skeleton>
								<span>Loading...</span>
							</Skeleton>
						)}
					</h2>
				</div> */}
				{/* <div className="mt-4">
					<FormLabel fontSize="sm" className="font-medium text-gray-700">
						All time
					</FormLabel>
					<h2
						className={`${
							validators.length !== 0 ? "text-gray-700" : "text-light-gray"
						} font-bold`}
					>
						{!isNil(totalEarnings) ? (
							<>
								<div className="text-xl justify-between text">
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
				</div> */}
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
					Estimated Earnings
				</FormLabel>
				<h2 className="text-xl text-gray-700 font-bold">
					{!isNil(yearlyEarning) ? (
						<div className="flex justify-between">
							<CountUp
								end={get(yearlyEarning, "yieldPercentage") || 0}
								duration={0.5}
								decimals={2}
								separator=","
								suffix={`% APR`}
								preserveValue
							/>
							<a
								className="twitter-share-button mt-2 flex text-sm font-medium justify-center items-center"
								style={{ color: "#1DA1F2" }}
								href={tweet}
								target="_blank"
							>
								<Twitter
									className="mr-2"
									size="16px"
									color="#1DA1F2"
									strokeWidth="2.5"
								/>
								<p className="mb-1">Tweet APR</p>
							</a>
						</div>
					) : (
						<Skeleton>
							<span>Loading...</span>
						</Skeleton>
					)}
				</h2>
			</div>
			<div>
				<FormLabel fontSize="xs" className="text-gray-700" mt={8}>
					Yearly
				</FormLabel>
				{!isNil(yearlyEarning) ? (
					<div className="flex justify-between">
						<p className="text-sm text-gray-600">
							<CountUp
								end={get(yearlyEarning, "returns.currency") || 0}
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
									end={get(yearlyEarning, "returns.subCurrency") || 0}
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
									end={get(yearlyEarning, "yieldPercentage") || 0}
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
					Monthly
				</FormLabel>
				{!isNil(monthlyEarning) ? (
					<div className="flex justify-between">
						<p className="text-sm text-gray-600">
							<CountUp
								end={get(monthlyEarning, "returns.currency") || 0}
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
									end={get(monthlyEarning, "returns.subCurrency") || 0}
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
									end={get(monthlyEarning, "yieldPercentage") || 0}
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
					Daily
				</FormLabel>
				{!isNil(dailyEarning) ? (
					<div className="flex justify-between">
						<p className="text-sm text-gray-600">
							<CountUp
								end={get(dailyEarning, "returns.currency") || 0}
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
									end={get(dailyEarning, "returns.subCurrency") || 0}
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
									end={get(dailyEarning, "yieldPercentage") || 0}
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
