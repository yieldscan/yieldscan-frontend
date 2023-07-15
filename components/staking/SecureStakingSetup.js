import { useState, useEffect } from "react";
import { isNil } from "lodash";
import router from "next/router";
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";
import { ChevronLeft, Check } from "react-feather";
import IntroductionToStaking from "./IntroductionToStaking";
import SettingUpController from "./SettingUpController";
import SecureStakeToEarn from "./SecureStakeToEarn";
import { track, goalCodes } from "@lib/analytics";

const stepsMenu = [
	"Introduction to secure staking",
	"Setting up your controller",
	"Stake to start earning",
];

const SecureStakingSetup = ({
	accounts,
	balances,
	stakingInfo,
	apiInstance,
	selectedAccount,
	networkInfo,
	transactionState,
	accountsControllerStashInfo,
	accountsBalances,
	ysFees,
	setTransactionState,
	selected,
	setSelected,
	confirmedControllerAccount,
	setConfirmedControllerAccount,
	controllerTransferAmount,
	onConfirm,
	toggleIsAuthPopoverOpen,
	transactionFee,
	setTransactionFee,
	transactionType,
	setTransactionType,
	setTransactions,
	setInjectorAccount,
	stakingAmount,
	selectedValidators,
	setStepperTransactions,
	minPossibleStake,
	adjustedStakingAmount,
	setAdjustedStakingAmount,
	unadjustedStakingAmount,
	setUnadjustedStakingAmount,
	currentStep,
	setCurrentStep,
	isExistingUser,
	hasSubscription,
	currentDate,
	lastDiscountDate,
}) => {
	const [isStashPopoverOpen, setIsStashPopoverOpen] = useState(false);

	const incrementCurrentStep = () => setCurrentStep((step) => step + 1);
	const decrementCurrentStep = () => setCurrentStep((step) => step - 1);

	const [filteredAccounts, setFilteredAccounts] = useState(null);
	const handleOnClick = (account) => {
		setSelected(account);
		setIsStashPopoverOpen(false);
	};
	const handleOnClickNext = (account, adjustedStakingAmount) => {
		if (controllerTransferAmount > 0) {
			track(goalCodes.STAKING.SECURE.LAST_STEP_WITH_CONTROLLER_TRANSFER);
		} else {
			track(goalCodes.STAKING.SECURE.LAST_STEP_WITHOUT_CONTROLLER_TRANSFER);
		}
		setConfirmedControllerAccount(account);

		if (adjustedStakingAmount) {
			setUnadjustedStakingAmount(
				stakingAmount * Math.pow(10, networkInfo.decimalPlaces)
			);
			setTransactionState({
				stakingAmount:
					adjustedStakingAmount / Math.pow(10, networkInfo.decimalPlaces),
			});
		}

		incrementCurrentStep();
	};

	const handleOnClickBackToSettinUpYourController = (
		unadjustedStakingAmount
	) => {
		if (adjustedStakingAmount) {
			setTransactionState({
				stakingAmount:
					unadjustedStakingAmount / Math.pow(10, networkInfo.decimalPlaces),
			});
			setAdjustedStakingAmount(null);
			setUnadjustedStakingAmount(null);
		}
	};

	useEffect(() => {
		const filteredAccounts = accounts.filter(
			(account) =>
				// allowing 0 balance accounts as a controller selection because low balances are being handled before proceeding to staking
				// accountsBalances[account.address]?.freeBalance.gte(
				// 	apiInstance?.consts.balances.existentialDeposit
				// )
				!accountsControllerStashInfo[account.address]?.isController &&
				!accountsControllerStashInfo[account.address]?.isStash &&
				account.address !== selectedAccount?.address &&
				accountsControllerStashInfo[account.address] &&
				accountsBalances[account.address]
		);
		// filteredAccounts.map((account) => {
		// 	account.disabledSelection = accountsBalances[
		// 		account.address
		// 	]?.freeBalance.lte(apiInstance?.consts.balances.existentialDeposit);
		// });
		setFilteredAccounts(filteredAccounts);
	}, [
		JSON.stringify(accounts),
		JSON.stringify(accountsControllerStashInfo),
		JSON.stringify(accountsBalances),
	]);

	useEffect(async () => {
		if (selected) {
			setTransactionFee(0);
			setTransactions(null);
			setInjectorAccount(null);
			setStepperTransactions(null);
			const nominatedValidators = selectedValidators.map((v) => v.stashId);

			const substrateStashId = encodeAddress(
				decodeAddress(selectedAccount?.address)
			);
			const substrateSelectedControllerId = encodeAddress(
				decodeAddress(selected?.address)
			);

			const amount = Math.trunc(
				stakingAmount * Math.pow(10, networkInfo.decimalPlaces)
			);

			const transactions = [];
			const stepperTransactions = [];

			if (controllerTransferAmount > 0) {
				transactions.push(
					apiInstance.tx.balances.transferKeepAlive(
						substrateSelectedControllerId,
						controllerTransferAmount
					)
				);
				stepperTransactions.push({
					transactionType: "controllerTransfer",
					transactionHeading: "Add funds to controller",
					injectorAccount: substrateStashId,
					substrateStashId: substrateStashId,
					controllerTransferAmount: controllerTransferAmount,
					substrateControllerId: substrateSelectedControllerId,
				});
			}

			// if no staking history then bond else bondExtra or setController depending on
			// whether controller is
			// same as stash or active stake is empty or not
			if (isNil(stakingInfo?.controllerId)) {
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
					substrateControllerId: substrateSelectedControllerId,
					rewardDestination: transactionState.rewardDestination,
				});
			} else {
				if (stakingInfo?.controllerId.toString() !== selectedAccount?.address) {
					transactions.push(
						apiInstance.tx.staking.setController(selectedAccount?.address)
					);
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
				if (
					stakingInfo?.controllerId.toString() !==
					confirmedControllerAccount?.address
				) {
					stepperTransactions.push({
						transactionType: "setController",
						transactionHeading: "Set controller account",
						injectorAccount: substrateStashId,
						substrateStashId: substrateStashId,
						substrateControllerId: substrateSelectedControllerId,
					});
				}
			}

			transactions.push(
				apiInstance.tx.staking.nominate(nominatedValidators),
				apiInstance.tx.staking.setController(substrateSelectedControllerId)
			);

			stepperTransactions.push({
				transactionType: "nominate",
				transactionHeading: "Stake",
				injectorAccount: substrateSelectedControllerId,
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
					injectorAccount: substrateSelectedControllerId,
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
		controllerTransferAmount,
		ysFees,
		stakingAmount,
		selectedValidators,
		selected?.address,
	]);

	return (
		<div className="w-full h-full grid grid-cols-4 justify-center gap-4">
			<div className="w-full flex flex-col justify-center items-center shadow-lg">
				<div className="p-8 w-full">
					<button
						className="flex items-center bg-gray-200 text-gray-600 rounded-full px-2 py-1"
						onClick={() => router.back()}
					>
						<ChevronLeft size={16} className="text-gray-600" />
						<span className="mx-2 text-sm">back</span>
					</button>
				</div>
				<div className="w-full flex-1 flex flex-col text-gray-700 justify-center items-center p-4 text-gray-700 space-y-10 mb-32">
					{stepsMenu.map((step, index) => (
						<div
							key={index}
							className="w-full grid grid-cols-8 items-center space-x-1 px-4"
						>
							{currentStep > index ? (
								<Check
									className="p-1 rounded-full border-2 border-teal-500 text-teal-500 bg-opacity-100"
									strokeWidth="4px"
								/>
							) : (
								<div
									className={`h-6 w-6 border-2 rounded-full ${
										index <= currentStep
											? "text-teal-500 border-teal-500"
											: "text-gray-500 border-gray-500"
									} flex items-center text-sm justify-center`}
								>
									{index + 1}
								</div>
							)}
							<p
								className={`${
									index <= currentStep ? "text-teal-500" : "text-gray-500"
								} col-span-7 ${
									index !== currentStep && "font-light"
								} text-base`}
							>
								{step}
							</p>
						</div>
					))}
				</div>
			</div>
			<div className="w-full col-span-3 flex flex-col justify-content overflow-y-scroll items-center p-12">
				{currentStep === 0 ? (
					<IntroductionToStaking
						incrementCurrentStep={incrementCurrentStep}
						networkInfo={networkInfo}
					/>
				) : currentStep === 1 ? (
					<SettingUpController
						incrementCurrentStep={incrementCurrentStep}
						decrementCurrentStep={decrementCurrentStep}
						networkInfo={networkInfo}
						apiInstance={apiInstance}
						filteredAccounts={filteredAccounts}
						accountsBalances={accountsBalances}
						isStashPopoverOpen={isStashPopoverOpen}
						setIsStashPopoverOpen={setIsStashPopoverOpen}
						selected={selected}
						ysFees={ysFees}
						handleOnClick={handleOnClick}
						controllerTransferAmount={controllerTransferAmount}
						handleOnClickNext={handleOnClickNext}
						transactionFee={transactionFee}
						stakingInfo={stakingInfo}
						balances={balances}
						transactionState={transactionState}
						setTransactionState={setTransactionState}
						minPossibleStake={minPossibleStake}
						adjustedStakingAmount={adjustedStakingAmount}
						setAdjustedStakingAmount={setAdjustedStakingAmount}
						unadjustedStakingAmount={unadjustedStakingAmount}
						setUnadjustedStakingAmount={setUnadjustedStakingAmount}
					/>
				) : (
					<SecureStakeToEarn
						selectedAccount={selectedAccount}
						networkInfo={networkInfo}
						transactionState={transactionState}
						balances={balances}
						confirmedControllerBalances={
							accountsBalances[confirmedControllerAccount?.address]
						}
						controllerTransferAmount={controllerTransferAmount}
						decrementCurrentStep={decrementCurrentStep}
						transactionFee={transactionFee}
						confirmedControllerAccount={confirmedControllerAccount}
						toggleIsAuthPopoverOpen={toggleIsAuthPopoverOpen}
						ysFees={ysFees}
						apiInstance={apiInstance}
						stakingInfo={stakingInfo}
						adjustedStakingAmount={adjustedStakingAmount}
						setAdjustedStakingAmount={setAdjustedStakingAmount}
						unadjustedStakingAmount={unadjustedStakingAmount}
						setUnadjustedStakingAmount={setUnadjustedStakingAmount}
						handleOnClickBackToSettinUpYourController={
							handleOnClickBackToSettinUpYourController
						}
						isExistingUser={isExistingUser}
						hasSubscription={hasSubscription}
						currentDate={currentDate}
						lastDiscountDate={lastDiscountDate}
					/>
				)}
			</div>
		</div>
	);
};
export default SecureStakingSetup;
