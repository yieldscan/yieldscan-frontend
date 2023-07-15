import { useState, useEffect } from "react";
import { get, isNil } from "lodash";
import router from "next/router";
import formatCurrency from "@lib/format-currency";
import { HelpPopover } from "@components/reward-calculator";
import { Spinner, Divider, Collapse } from "@chakra-ui/core";
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";
import { ChevronLeft, Circle, ChevronRight, Edit } from "react-feather";
import Account from "../wallet-connect/Account";
import ValidatorCard from "./ValidatorCard";
import { NextButton } from "@components/common/BottomButton";
import { track, goalCodes } from "@lib/analytics";

const Confirmation = ({
	balances,
	stakingInfo,
	apiInstance,
	selectedAccount,
	networkInfo,
	transactionState,
	toggleIsAuthPopoverOpen,
	ysFees,
	transactionFee,
	setTransactionFee,
	setTransactions,
	setInjectorAccount,
	stakingAmount,
	selectedValidators,
	setStepperTransactions,
	isExistingUser,
	hasSubscription,
	currentDate,
	lastDiscountDate,
}) => {
	const [showValidators, setShowValidators] = useState(false);
	// const [showAdvPrefs, setShowAdvPrefs] = useState(false);

	// const handleAdvPrefsToggle = () => {
	// 	setShowAdvPrefs((show) => !show);
	// };

	const handleValToggle = () => {
		if (!showValidators) {
			track(goalCodes.STAKING.EXPRESS.CLICKED_SHOW_VALIDATORS);
		}
		setShowValidators((show) => !show);
	};

	useEffect(async () => {
		if (!isNil(stakingInfo)) {
			setTransactions(null);
			setInjectorAccount(null);
			const nominatedValidators = selectedValidators.map((v) => v.stashId);

			// same stash and controller for express staking path
			const substrateStashId = encodeAddress(
				decodeAddress(selectedAccount?.address),
				42
			);

			const amount = Math.trunc(
				stakingAmount * Math.pow(10, networkInfo.decimalPlaces)
			);

			const transactions = [];
			const stepperTransactions = [];

			if (!isNil(stakingInfo?.controllerId)) {
				if (stakingInfo?.controllerId.toString() !== selectedAccount?.address) {
					transactions.push(
						apiInstance.tx.staking.setController(substrateStashId)
					);
					stepperTransactions.push({
						transactionType: "setController",
						transactionHeading: "Set controller account",
						injectorAccount: substrateStashId,
						substrateStashId: substrateStashId,
						substrateControllerId: substrateStashId,
					});
				}
				if (stakingInfo?.stakingLedger.active.isEmpty) {
					transactions.push(apiInstance.tx.staking.bondExtra(amount));
					stepperTransactions.push({
						transactionType: "bondExtra",
						transactionHeading: "Lock funds",
						injectorAccount: substrateStashId,
						substrateStashId: substrateStashId,
						stakingAmount: amount,
					});
				}
			} else {
				transactions.push(
					apiInstance.tx.staking.bond(
						amount,
						transactionState.rewardDestination
					)
				);
				stepperTransactions.push({
					transactionType: "bond",
					transactionHeading: "Lock funds",
					injectorAccount: substrateStashId,
					stakingAmount: amount,
					substrateControllerId: substrateStashId,
					rewardDestination: transactionState.rewardDestination,
				});
			}

			transactions.push(apiInstance.tx.staking.nominate(nominatedValidators));

			stepperTransactions.push({
				transactionType: "nominate",
				transactionHeading: "Stake",
				injectorAccount: substrateStashId,
				nominatedValidators: nominatedValidators,
			});

			if (ysFees > 0 && networkInfo?.feesEnabled && networkInfo?.feesAddress) {
				transactions.push(
					apiInstance.tx.balances.transferKeepAlive(
						networkInfo.feesAddress,
						ysFees
					)
				);
				stepperTransactions.push({
					transactionType: "yieldscanFees",
					transactionHeading: "Pay Yieldscan Fees",
					injectorAccount: substrateStashId,
					ysFees: ysFees,
					substrateControllerId: substrateStashId,
				});
			}

			const fee =
				transactions.length > 1
					? await apiInstance.tx.utility
							.batchAll(transactions)
							.paymentInfo(substrateStashId)
					: await transactions[0].paymentInfo(substrateStashId);

			setTransactions([...transactions]);
			setStepperTransactions([...stepperTransactions]);
			setInjectorAccount(substrateStashId);
			setTransactionFee(() => fee.partialFee.toNumber());
		}
	}, [
		stakingInfo,
		selectedValidators,
		networkInfo,
		selectedAccount?.address,
		ysFees,
	]);

	return (
		<div className="w-full h-full flex justify-center max-h-full">
			<div className="flex flex-col w-full max-w-65-rem h-full space-y-evenly">
				<div className="p-2 w-full">
					<button
						className="flex items-center bg-gray-200 text-gray-600 rounded-full px-2 py-1"
						onClick={() => router.back()}
					>
						<ChevronLeft size={16} className="text-gray-600" />
						<span className="mx-2 text-sm">back</span>
					</button>
				</div>
				<div className="flex-1 flex justify-center items-center pb-4">
					<div className="flex flex-col w-full max-w-xl items-center justify-center space-y-4">
						<div className="w-full flex justify-center items-center">
							<Circle size={60} color="#2BCACA" />
						</div>
						<div className="text-center space-y-2">
							<h1 className="text-4xl text-gray-700 font-semibold">
								Confirmation
							</h1>
							<p className="text-gray-600 text-sm">
								You will be locking your funds for staking. Please make sure you
								understand the risks before proceeding.
							</p>
						</div>
						<div className="flex flex-col w-full text-gray-700 text-sm space-y-2 font-semibold">
							<div>
								<p className="ml-2">Account</p>
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
						</div>
						<div className="w-full">
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
											The list of most rewarding validators, selected based on
											your investment amount and risk preference.
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
						{/* <div className="w-full p-2">
							<button
								className="flex text-gray-600 text-xs items-center"
								onClick={handleAdvPrefsToggle}
							>
								<ChevronRight
									size={16}
									className={`transition ease-in-out duration-500 mr-2 ${
										showAdvPrefs && "transform rotate-90"
									}`}
								/>
								Advanced preferences
							</button>
							<Collapse isOpen={showAdvPrefs}>
								<div className="mt-6 rounded-xl mt-4">
									<EditController
										accounts={accounts}
										controller={selectedAccount}
										transactionState={transactionState}
										setController={(controller) =>
											setTransactionState({ controller })
										}
										networkInfo={networkInfo}
									/>
									<RewardDestination
										transactionState={transactionState}
										setTransactionState={setTransactionState}
									/>
								</div>
							</Collapse>
						</div> */}
						<div className="w-full text-gray-700 px-4">
							<div className="flex justify-between">
								<p className="text-gray-700 text-xs">Staking amount</p>
								<div className="flex flex-col">
									<p className="text-sm font-semibold text-right">
										{formatCurrency.methods.formatAmount(
											Math.trunc(
												stakingAmount * 10 ** networkInfo.decimalPlaces
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
													{isExistingUser &&
														currentDate <= lastDiscountDate && (
															<span className="font-semibold">
																You have been given a 50% discount because you
																staked with Yieldscan on or before 15th
																September 2021.{" "}
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
												This fee is used to pay for the resources used for
												processing the transaction on the blockchain network.
											</p>
										}
									/>
								</div>

								<div className="flex text-gray-700 flex-col">
									{transactionFee !== 0 ? (
										<div>
											<p className="text-sm font-semibold text-right">
												{formatCurrency.methods.formatAmount(
													Math.trunc(transactionFee + ysFees),
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
							<div className="flex text-gray-700 justify-between">
								<p className="text-base font-semibold">Total Amount</p>
								<div className="flex flex-col">
									<p className="text-lg text-right font-bold">
										{formatCurrency.methods.formatAmount(
											Math.trunc(
												stakingAmount * 10 ** networkInfo.decimalPlaces
											) +
												transactionFee +
												ysFees,
											networkInfo
										)}
									</p>
									{/* <p className="text-sm text-right text-gray-600 font-medium">
							${(subCurrency + subFeeCurrency).toFixed(2)}
						</p> */}
								</div>
							</div>
						</div>
						<div className="mt-4 w-full text-center">
							<NextButton
								onClick={toggleIsAuthPopoverOpen}
								disabled={transactionFee === 0}
							>
								Stake Now
							</NextButton>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
export default Confirmation;
