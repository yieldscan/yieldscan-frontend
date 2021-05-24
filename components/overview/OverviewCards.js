import { useState, useEffect } from "react";
import { noop, get, isNil } from "lodash";
import { FormLabel } from "@chakra-ui/core";
import formatCurrency from "@lib/format-currency";
import {
	useAccounts,
	usePolkadotApi,
	useNetworkElection,
	useCoinGeckoPriceUSD,
} from "@lib/store";
import calculateReward from "@lib/calculate-reward";
import { HelpPopover } from "@components/reward-calculator";

const OverviewCards = ({
	stats,
	bondedAmount,
	balance,
	stakingInfo,
	activeStake,
	address,
	validators,
	redeemableBalance,
	openUnbondingListModal,
	toggleRedeemUnbonded,
	unbondingBalances,
	unlockingBalances = [],
	openRewardDestinationModal = noop,
	bondFunds = noop,
	unbondFunds = noop,
	rebondFunds = noop,
	networkInfo,
}) => {
	// const totalUnlockingBalance = formatCurrency.methods.formatAmount(
	// 	Math.trunc(
	// 		unlockingBalances.reduce(
	// 			(total, balanceInfo) => total + balanceInfo.value,
	// 			0
	// 		)
	// 	),
	// 	networkInfo
	// );

	const { apiInstance } = usePolkadotApi();
	const { stashAccount } = useAccounts();
	const { isInElection } = useNetworkElection();
	const { coinGeckoPriceUSD } = useCoinGeckoPriceUSD();
	const [compounding, setCompounding] = useState(false);

	const isActivelyStaking = isNil(validators)
		? false
		: validators.filter((validator) => validator.isElected).length !== 0
		? true
		: false;

	const [totalAmountStakedFiat, setTotalAmountStakedFiat] = useState();
	const [earningsFiat, setEarningsFiat] = useState();
	const [estimatedRewardsFiat, setEstimatedRewardsFiat] = useState();
	const [expectedAPR, setExpectedAPR] = useState(0);
	const [redeemableBalanceFiat, setRedeemableBalanceFiat] = useState();
	const [totalUnbonding, setTotalUnbonding] = useState();
	const [totalUnbondingFiat, setTotalUnbondingFiat] = useState();

	useEffect(() => {
		if (!isNil(apiInstance)) {
			apiInstance.query.staking.payee(stashAccount.address).then((payee) => {
				if (payee.isStaked) setCompounding(true);
				else {
					setCompounding(false);
				}
			});
		}
	}, [stashAccount, apiInstance]);
	useEffect(() => {
		if (stats) {
			setTotalAmountStakedFiat(stats.totalAmountStaked * coinGeckoPriceUSD);
			setEstimatedRewardsFiat(stats.estimatedRewards * coinGeckoPriceUSD);
			setEarningsFiat(stats.earnings * coinGeckoPriceUSD);
		}

		if (validators) {
			calculateReward(
				coinGeckoPriceUSD,
				validators.filter((validator) => validator.isElected),
				stats.totalAmountStaked,
				12,
				"months",
				compounding,
				networkInfo
			).then(({ yieldPercentage }) => setExpectedAPR(yieldPercentage));
		}
	}, [stats, compounding]);

	useEffect(() => {
		if (!stakingInfo.redeemable.isEmpty) {
			setRedeemableBalanceFiat(
				(stakingInfo.redeemable / Math.pow(10, networkInfo.decimalPlaces)) *
					coinGeckoPriceUSD
			);
		}
	}, [stats, stakingInfo?.redeemable, coinGeckoPriceUSD]);

	useEffect(() => {
		if (stakingInfo?.unlocking && !stakingInfo?.unlocking?.isEmpty) {
			const total = stakingInfo.unlocking.reduce(
				(a, b) => a + b.value / Math.pow(10, networkInfo.decimalPlaces),
				0
			);
			setTotalUnbonding(total);
			setTotalUnbondingFiat(total * coinGeckoPriceUSD);
		} else {
			setTotalUnbonding(null);
			setTotalUnbondingFiat(null);
		}
	}, [stats, stakingInfo?.unlocking, coinGeckoPriceUSD]);

	return (
		<div className="flex justify-between items-center h-auto w-full max-w-lg text-gray-700">
			<div className="bg-white min-h-12-rem py-4 px-8 text-center flex flex-col justify-center shadow-custom rounded-xl h-full w-full">
				<div className="flex flex-col items-center justify-between">
					<p className="font-medium mt-40">Your investment</p>
					<div>
						<div className="flex">
							<h1
								className={`text-4xl font-bold ${
									isActivelyStaking ? "text-gray-700" : "text-gray-600"
								}`}
							>
								{formatCurrency.methods.formatAmount(
									stakingInfo?.stakingLedger.active,
									networkInfo
								)}
							</h1>
							{!isActivelyStaking && (
								<HelpPopover
									content={
										<p className="text-xs text-white">
											Currently you are not earning any rewards on your
											investment.
										</p>
									}
								/>
							)}
						</div>
						{!stakingInfo?.stakingLedger.active.isEmpty && (
							<h3 className="text-teal-500 text-xl font-medium">
								$
								{formatCurrency.methods.formatNumber(
									(
										(stakingInfo?.stakingLedger.active /
											Math.pow(10, networkInfo.decimalPlaces)) *
										coinGeckoPriceUSD
									).toFixed(2)
								)}
							</h3>
						)}
					</div>
					<div className="flex">
						<button
							className={`confirm rounded-lg mt-40 mb-40 text-white bg-teal-500 p-1 ${
								isInElection ? "opacity-75 cursor-not-allowed" : "opacity-100"
							}`}
							onClick={bondFunds}
							disabled={isInElection}
						>
							Invest more
						</button>

						<button
							className={`confirm rounded-lg mt-40 mb-40 border-teal border-solid-1 bg-white text-teal-500 p-1 ${
								isInElection ? "opacity-75 cursor-not-allowed" : "opacity-100"
							}`}
							onClick={unbondFunds}
							disabled={isInElection}
						>
							Withdraw
						</button>
					</div>
					{!stakingInfo.redeemable.isEmpty && (
						<div className="flex justify-between w-full">
							<div className="flex flex-col">
								<FormLabel fontSize="sm" className="font-medium text-gray-700">
									Redeemable Withdrawn Amount
								</FormLabel>
								<h2 className="text-xl text-gray-700 font-bold">
									<div className="flex">
										{formatCurrency.methods.formatAmount(
											stakingInfo.redeemable,
											networkInfo
										)}
									</div>
									{!isNil(redeemableBalanceFiat) ? (
										<div className="flex text-sm font-medium text-teal-500">
											$
											{formatCurrency.methods.formatNumber(
												redeemableBalanceFiat.toFixed(2)
											)}
										</div>
									) : (
										<></>
									)}
								</h2>
							</div>
							<button
								className={`text-teal-500 p-1`}
								onClick={toggleRedeemUnbonded}
								disabled={isInElection}
							>
								REDEEM
							</button>
						</div>
					)}
					{!isNil(totalUnbonding) && (
						<div className="flex justify-between w-full">
							<div className="flex flex-col mt-4 mb-4">
								<FormLabel fontSize="sm" className="font-medium text-gray-700">
									Unbonding Amount
								</FormLabel>
								<h2 className="text-xl text-gray-700 font-bold">
									<div className="flex">
										{formatCurrency.methods.formatAmount(
											Math.trunc(
												Number(
													totalUnbonding *
														Math.pow(10, networkInfo.decimalPlaces)
												)
											),
											networkInfo
										)}
									</div>
									{!isNil(totalUnbondingFiat) && (
										<div className="flex text-sm font-medium text-teal-500">
											$
											{formatCurrency.methods.formatNumber(
												totalUnbondingFiat.toFixed(2)
											)}
										</div>
									)}
								</h2>
							</div>
							<div className="flex">
								<button
									className={`text-teal-500 p-1 mr-2`}
									onClick={rebondFunds}
									disabled={isInElection}
								>
									Rebond
								</button>
								<button
									className={`text-teal-500 p-1`}
									onClick={openUnbondingListModal}
									disabled={isInElection}
								>
									View All
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default OverviewCards;
