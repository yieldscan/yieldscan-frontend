import { useState } from "react";
import { get } from "lodash";
import formatCurrency from "@lib/format-currency";
import { HelpPopover } from "@components/reward-calculator";
import { Spinner, Divider, Collapse } from "@chakra-ui/core";
import { AlertOctagon, ArrowLeft, ChevronRight } from "react-feather";
import ValidatorCard from "./ValidatorCard";
import Account from "../wallet-connect/Account";
import { NextButton } from "@components/common/BottomButton";
import { track, goalCodes } from "@lib/analytics";

const SecureStakeToEarn = ({
	selectedAccount,
	networkInfo,
	balances,
	confirmedControllerBalances,
	transactionState,
	decrementCurrentStep,
	confirmedControllerAccount,
	controllerTransferAmount,
	transactionFee,
	toggleIsAuthPopoverOpen,
	ysFees,
	apiInstance,
	stakingInfo,
	adjustedStakingAmount,
	setAdjustedStakingAmount,
	unadjustedStakingAmount,
	setUnadjustedStakingAmount,
	handleOnClickBackToSettinUpYourController,
	isExistingUser,
	hasSubscription,
	currentDate,
	lastDiscountDate,
}) => {
	const selectedValidators = get(transactionState, "selectedValidators", []);
	const stakingAmount = get(transactionState, "stakingAmount", 0);
	const [showValidators, setShowValidators] = useState(false);

	const handleValToggle = () => {
		if (!showValidators) {
			track(goalCodes.STAKING.SECURE.CLICKED_SHOW_VALIDATORS);
		}
		setShowValidators((show) => !show);
	};

	const activeBondedAmount =
		parseInt(get(stakingInfo, "stakingLedger.active", 0)) /
		Math.pow(10, networkInfo.decimalPlaces);

	return (
		<div className="flex flex-col w-full justify-center text-gray-700 space-y-4 p-4">
			<div className="space-y-2">
				<h1 className="text-4xl  font-semibold">Stake to start earning</h1>
				<p className="text-gray-600 max-w-lg text-sm">
					You will be delegating your stake to the following validators. Please
					make sure you understand the risks before proceeding.
				</p>
			</div>
			<div className="flex flex-col w-full max-w-xl text-gray-700 text-sm space-y-2 font-semibold">
				{controllerTransferAmount > 0 && adjustedStakingAmount && (
					<div className="flex flex-row w-full bg-yellow-200 bg-opacity-50 rounded-lg p-4 items-center space-x-2">
						<div>
							<AlertOctagon size="40" className="text-orange-300" />
						</div>
						<div className="flex flex-col p-2">
							<h1 className="w-full text-md text-gray-700 font-semibold">
								Staking Amount Changed
							</h1>
							<span className="w-full h-full text-sm text-gray-600 font-semibold">
								Your staking amount has been changed from{" "}
								{formatCurrency.methods.formatAmount(
									unadjustedStakingAmount,
									networkInfo
								)}{" "}
								to{" "}
								{formatCurrency.methods.formatAmount(
									adjustedStakingAmount,
									networkInfo
								)}
								.
							</span>
						</div>
					</div>
				)}
				<div>
					<p className="ml-2">Stash Account</p>
					<Account
						account={selectedAccount}
						balances={balances}
						networkInfo={networkInfo}
						onAccountSelected={() => {
							return;
						}}
						disabled={true}
					/>
				</div>
				<div>
					<p className="ml-2">Controller Account</p>
					<Account
						account={confirmedControllerAccount}
						balances={confirmedControllerBalances}
						networkInfo={networkInfo}
						onAccountSelected={() => {
							return;
						}}
						disabled={true}
					/>
				</div>
			</div>
			<div className="w-full max-w-xl flex flex-col space-y-4">
				<div className="w-full p-2">
					<button
						onClick={handleValToggle}
						className="flex text-gray-600 text-xs"
					>
						<ChevronRight
							size={16}
							className={`transition ease-in-out duration-500 mr-2 ${
								showValidators && "transform rotate-90"
							}`}
						/>
						{showValidators ? "Hide" : "Show"} suggested validators{" "}
						<HelpPopover
							content={
								<p className="text-white text-xs">
									The list of most rewarding validators, selected based on your
									investment amount and risk preference.
								</p>
							}
						/>
					</button>
					<Collapse isOpen={showValidators}>
						<div className="mt-2 rounded-xl">
							<div className="h-48 w-full overflow-scroll">
								{selectedValidators.map((validator) => (
									<ValidatorCard
										key={validator.stashId}
										info={validator?.info}
										stashId={validator.stashId}
										riskScore={validator.riskScore.toFixed(2)}
										commission={validator.commission}
										nominators={validator.numOfNominators}
										totalStake={validator.totalStake}
										estimatedReward={Number(validator.rewardsPer100KSM)}
										networkInfo={networkInfo}
										onProfile={() => onProfile(validator)}
									/>
								))}
							</div>
						</div>
					</Collapse>
				</div>
				{controllerTransferAmount > 0 && (
					<div className="flex justify-between">
						<p className="text-gray-700 text-xs">Controller transfer amount</p>
						<div className="flex flex-col">
							<p className="text-sm font-semibold text-right">
								{formatCurrency.methods.formatAmount(
									Math.trunc(controllerTransferAmount),
									networkInfo
								)}
							</p>
							{/* <p className="text-xs text-right text-gray-600">
								${subCurrency.toFixed(2)}
							</p> */}
						</div>
					</div>
				)}
				<div className="flex justify-between">
					<p className="text-gray-700 text-xs">Staking amount</p>
					<div className="flex flex-col">
						<p className="text-sm font-semibold text-right">
							{formatCurrency.methods.formatAmount(
								Math.trunc(
									stakingAmount * Math.pow(10, networkInfo.decimalPlaces)
								),
								networkInfo
							)}
						</p>
						{/* <p className="text-xs text-right text-gray-600">
								${subCurrency.toFixed(2)}
							</p> */}
					</div>
				</div>
				<div className="flex justify-between mt-4">
					{ysFees !== 0 && (
						<div className="text-xs text-gray-700 flex items-center">
							<p>
								Yieldscan Fee{" "}
								{isExistingUser &&
									!hasSubscription &&
									currentDate <= lastDiscountDate &&
									"(50% off)"}
							</p>
							<HelpPopover
								content={
									<p className="text-xs text-white">
										This fee is used to pay for the costs of building and
										running Yieldscan. Its charged on the staking amount.{" "}
										{isExistingUser && currentDate <= lastDiscountDate && (
											<span className="font-semibold">
												You have been given a 50% discount because you staked
												with Yieldscan on or before 15th September 2021.{" "}
											</span>
										)}
									</p>
								}
							/>
						</div>
					)}

					<div className="flex flex-col">
						{ysFees !== 0 && (
							<div>
								<p className="text-gray-700 text-sm font-semibold text-right">
									{formatCurrency.methods.formatAmount(
										Math.trunc(ysFees),
										networkInfo
									)}
								</p>
							</div>
						)}
					</div>
				</div>
				<div className="flex justify-between mt-4">
					<div className="text-xs text-gray-700 flex items-center">
						<p>Transaction Fee</p>
						<HelpPopover
							content={
								<p className="text-xs text-white">
									This fee is used to pay for the resources used for processing
									the transaction on the blockchain network.
								</p>
							}
						/>
					</div>

					<div className="flex flex-col">
						{transactionFee !== 0 ? (
							<div>
								<p className="text-sm font-semibold text-right">
									{formatCurrency.methods.formatAmount(
										Math.trunc(transactionFee),
										networkInfo
									)}
								</p>
								{/* <p className="text-xs text-right text-gray-600">
									${subFeeCurrency.toFixed(2)}
								</p> */}
							</div>
						) : (
							<Spinner />
						)}
					</div>
				</div>
				<Divider my={6} />
				<div className="flex justify-between">
					<p className="text-gray-700 text-base font-semibold">Total Amount</p>
					<div className="flex flex-col">
						<p className="text-lg text-right font-bold">
							{formatCurrency.methods.formatAmount(
								Math.trunc(
									stakingAmount * Math.pow(10, networkInfo.decimalPlaces)
								) +
									transactionFee +
									controllerTransferAmount +
									ysFees,
								networkInfo
							)}
						</p>
						{/* <p className="text-sm text-right text-gray-600 font-medium">
							${(subCurrency + subFeeCurrency).toFixed(2)}
						</p> */}
					</div>
				</div>
				<div className="mt-4 w-full text-center">
					<NextButton
						// className="w-full rounded-lg font-medium px-12 py-3 bg-teal-500 transform hover:bg-teal-700 text-white"
						onClick={() => toggleIsAuthPopoverOpen()}
						disabled={transactionFee === 0}
					>
						Just stake, baby!
					</NextButton>
				</div>
			</div>
			<div className="w-full flex flex-row justify-start pt-4 space-x-2">
				<button>
					<div
						className="flex flex-row space-x-2 items-center"
						onClick={() => {
							handleOnClickBackToSettinUpYourController(
								unadjustedStakingAmount
							);
							decrementCurrentStep();
						}}
					>
						<ArrowLeft size="18" />
						<span>Setting up your controller</span>
					</div>
				</button>
			</div>
		</div>
	);
};
export default SecureStakeToEarn;
