import { Avatar, Spinner } from "@chakra-ui/core";
import Top3Section from "./Top3Section";
import NominationsTable from "./NominatorsTable";
import { useEffect, useState } from "react";
import axios from "@lib/axios";
import {
	useSelectedNetwork,
	useNominatorsData,
	useCoinGeckoPriceUSD,
} from "@lib/store";
import formatCurrency from "@lib/format-currency";
import { getNetworkInfo } from "yieldscan.config";

const Nominators = () => {
	const [error, setError] = useState(false);
	const { selectedNetwork } = useSelectedNetwork();
	const networkInfo = getNetworkInfo(selectedNetwork);
	const { nomLoading, setNomLoading } = useNominatorsData();
	const { coinGeckoPriceUSD } = useCoinGeckoPriceUSD();
	const [loading, setLoading] = useState(true);
	const [nominatorsData, setNominatorsData] = useState(undefined);
	const [totalAmountStakedSubCurrency, setTotalAmountStakedSubCurrency] =
		useState();
	const [totalRewardsSubCurrency, setTotalRewardsSubCurrency] = useState();

	useEffect(() => {
		setNomLoading(true);
		setLoading(true);
		setError(false);
		axios
			.get(`/${networkInfo.network}/actors/nominators`)
			.then(({ data }) => {
				setNominatorsData(data);
			})
			.catch((err) => {
				console.error(err);
				setError(true);
			})
			.finally(() => {
				setNomLoading(false);
				setLoading(false);
			});
	}, [networkInfo]);

	useEffect(() => {
		if (nominatorsData) {
			setTotalAmountStakedSubCurrency(
				nominatorsData.stats.totalAmountStaked * coinGeckoPriceUSD
			);
			setTotalRewardsSubCurrency(
				nominatorsData.stats.totalRewards * coinGeckoPriceUSD
			);
		}
	}, [nominatorsData]);

	// if (nomLoading && loading) {
	// 	return (
	// 		<div className="flex-center w-full h-full">
	// 			<div className="flex-center flex-col">
	// 				<Spinner size="xl" color="teal.500" thickness="4px" />
	// 				<span className="text-sm text-gray-600 mt-5">
	// 					Fetching nominators...
	// 				</span>
	// 			</div>
	// 		</div>
	// 	);
	// }

	// if (error) {
	// 	return (
	// 		<div className="flex-center flex-col mt-40">
	// 			<div className="text-4xl">🧐</div>
	// 			<h3>
	// 				Sorry, something went wrong while fetching! We'll surely look into
	// 				this.
	// 			</h3>
	// 		</div>
	// 	);
	// }

	return error ? (
		<div className="flex-center flex-col mt-40">
			<div className="text-4xl">🧐</div>
			<h3>
				Sorry, something went wrong while fetching! We'll surely look into this.
			</h3>
		</div>
	) : loading ? (
		<div className="flex-center w-full h-full">
			<div className="flex-center flex-col">
				<Spinner size="xl" color="teal.500" thickness="4px" />
				<span className="text-sm text-gray-600 mt-5">
					Fetching nominators...
				</span>
			</div>
		</div>
	) : (
		<div className="px-10 py-5">
			<h1 className="text-2xl text-gray-800 font-semibold">Nominators</h1>

			<div className="flex w-full">
				<div className="w-3/4">
					<div className="mt-6">
						<p className="text-gray-600 text-xs mb-2 tracking-widest">
							TOP NOMINATORS
						</p>
						<Top3Section
							nominators={nominatorsData.top3.slice(0, 3)}
							networkInfo={networkInfo}
						/>
					</div>
					<NominationsTable
						nominators={nominatorsData.nominatorsInfo}
						networkInfo={networkInfo}
					/>
				</div>
				<div className="sticky top-0 self-start pt-8 ml-8">
					<div
						className="shadow-xl flex flex-col rounded-lg pb-10 h-48 w-64 justify-end pl-10 text-white min-w-max-content"
						style={{ background: "#1F495B" }}
					>
						<h1 className="text-4xl">
							{formatCurrency.methods.formatNumber(
								nominatorsData.stats.nominatorsCount
							)}
						</h1>
						<h3 className="text-base">Active Nominators</h3>
					</div>
					<div
						className="shadow-xl flex flex-col rounded-lg my-10 pb-10 h-48 w-64 justify-end pl-10 text-white min-w-max-content"
						style={{ background: "#1F495B" }}
					>
						<h1 className="text-4xl">
							{formatCurrency.methods
								.formatAmount(
									Math.trunc(
										nominatorsData.stats.totalAmountStaked *
											10 ** networkInfo.decimalPlaces
									).toString(),
									networkInfo
								)
								.slice(0, -4)}
							<span className="text-xl">
								{formatCurrency.methods
									.formatAmount(
										Math.trunc(
											nominatorsData.stats.totalAmountStaked *
												10 ** networkInfo.decimalPlaces
										).toString(),
										networkInfo
									)
									.slice(-4)}
							</span>
						</h1>
						{totalAmountStakedSubCurrency && (
							<p className="-mt-2 opacity-50">
								${" "}
								{formatCurrency.methods.formatNumber(
									totalAmountStakedSubCurrency.toFixed(2)
								)}{" "}
								USD
							</p>
						)}
						<h3 className="text-base mt-3">Total Amount Staked</h3>
					</div>
					<div className="shadow-xl flex flex-col rounded-lg pb-10 h-48 w-64 justify-end pl-10 bg-teal-500 text-white min-w-max-content">
						<h1 className="text-4xl">
							{formatCurrency.methods
								.formatAmount(
									Math.trunc(
										nominatorsData.stats.totalRewards *
											10 ** networkInfo.decimalPlaces
									).toString(),
									networkInfo
								)
								.slice(0, -4)}
							<span className="text-xl">
								{formatCurrency.methods
									.formatAmount(
										Math.trunc(
											nominatorsData.stats.totalRewards *
												10 ** networkInfo.decimalPlaces
										).toString(),
										networkInfo
									)
									.slice(-4)}
							</span>
						</h1>
						{totalRewardsSubCurrency && (
							<p className="-mt-2 opacity-75">
								${" "}
								{formatCurrency.methods.formatNumber(
									totalRewardsSubCurrency.toFixed(2)
								)}{" "}
								USD
							</p>
						)}
						<h3 className="text-base mt-3">Total Rewards</h3>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Nominators;
