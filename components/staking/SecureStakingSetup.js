import { useState, useEffect } from "react";
import { get, isNil } from "lodash";
import router from "next/router";
import formatCurrency from "@lib/format-currency";
import { HelpPopover } from "@components/reward-calculator";
import { Spinner, Divider, Collapse } from "@chakra-ui/core";
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";
import { ChevronLeft, Check, Circle, ChevronRight, Edit } from "react-feather";
import Account from "../wallet-connect/Account";
import IntroductionToStaking from "./IntroductionToStaking";
import ValidatorCard from "./ValidatorCard";
import RewardDestination from "./RewardDestination";
import EditController from "./EditController";
import BrowserWalletAlert from "./BrowserWalletAlert";
import SettingUpController from "./SettingUpController";
import SecureStakeToEarn from "./SecureStakeToEarn";

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
	controllerAccount,
	networkInfo,
	transactionState,
	accountsControllerStashInfo,
	accountsBalances,
	ysFees,
	selected,
	setSelected,
	confirmedControllerAccount,
	setConfirmedControllerAccount,
	controllerTransferAmount,
	onConfirm,
}) => {
	const selectedValidators = get(transactionState, "selectedValidators", []);
	const stakingAmount = get(transactionState, "stakingAmount", 0);
	const [transactionFee, setTransactionFee] = useState(0);
	const [showValidators, setShowValidators] = useState(false);
	const [showAdvPrefs, setShowAdvPrefs] = useState(false);
	const [transactionType, setTransactionType] = useState(null);

	const [currentStep, setCurrentStep] = useState(() =>
		confirmedControllerAccount && selected ? 2 : 0
	);
	const [isStashPopoverOpen, setIsStashPopoverOpen] = useState(false);

	const incrementCurrentStep = () => setCurrentStep((step) => step + 1);
	const decrementCurrentStep = () => setCurrentStep((step) => step - 1);

	const handleAdvPrefsToggle = () => {
		setShowAdvPrefs((show) => !show);
	};

	const handleValToggle = () => {
		setShowValidators((show) => !show);
	};

	const [filteredAccounts, setFilteredAccounts] = useState(null);
	// const [selected, setSelected] = useState(null);

	// const [confirmedControllerAccount, setConfirmedControllerAccount] =
	// 	useState(null);

	const handleOnClick = (account) => {
		setSelected(account);
		setIsStashPopoverOpen(false);
	};
	const handleOnClickNext = (account) => {
		setConfirmedControllerAccount(account);
		incrementCurrentStep();
	};

	useEffect(() => {
		const filteredAccounts = accounts.filter(
			(account) =>
				// allowing 0 balance accounts as a controller selection because low balances are being handled before proceeding to staking
				// accountsBalances[account.address]?.freeBalance.gte(
				// 	apiInstance?.consts.balances.existentialDeposit
				// )
				!accountsControllerStashInfo[account.address]?.isController &&
				!accountsControllerStashInfo[account.address]?.isStash
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
		if (!isNil(stakingInfo) && selected && controllerTransferAmount) {
			const nominatedValidators = transactionState.selectedValidators.map(
				(v) => v.stashId
			);

			const substrateStashId = encodeAddress(
				decodeAddress(selectedAccount?.address)
			);
			const substrateSelectedControllerId = encodeAddress(
				decodeAddress(selected?.address)
			);

			const transactions = [];
			stakingInfo?.stakingLedger.active.isEmpty
				? setTransactionType("secure-bond-nominate")
				: setTransactionType("secure-nominate");

			if (controllerTransferAmount > 0) {
				transactions.push(
					apiInstance.tx.balances.transferKeepAlive(
						substrateSelectedControllerId,
						controllerTransferAmount
					)
				);
			}

			const amount = Math.trunc(
				stakingAmount * 10 ** networkInfo.decimalPlaces
			);

			transactionType === "secure-bond-nominate"
				? transactions.push(
						apiInstance.tx.staking.bond(
							substrateStashId,
							amount,
							transactionState.rewardDestination
						),
						apiInstance.tx.staking.nominate(nominatedValidators)
				  )
				: transactions.push(
						apiInstance.tx.staking.nominate(nominatedValidators)
				  );

			transactions.push(
				apiInstance.tx.staking.setController(substrateSelectedControllerId),
				apiInstance.tx.balances.transferKeepAlive(
					networkInfo.feesAddress,
					ysFees
				)
			);
			// const substrateControllerId = encodeAddress(
			// 	decodeAddress(controllerAccount?.address),
			// 	42
			// );

			// const tranasactionType = stakingInfo?.stakingLedger.active.isEmpty
			// 	? "bond-and-nominate"
			// 	: "nominate";
			// if (tranasactionType === "bond-nominate-transfer") {
			// 	const amount = Math.trunc(
			// 		stakingAmount * 10 ** networkInfo.decimalPlaces
			// 	); // 12 decimal places
			// 	transactions.push(
			// 		apiInstance.tx.staking.bond(
			// 			substrateControllerId,
			// 			amount,
			// 			transactionState.rewardDestination
			// 		),
			// 		apiInstance.tx.staking.nominate(nominatedValidators)
			// 	);
			// } else if (tranasactionType === "nominate") {
			// 	transactions.push(apiInstance.tx.staking.nominate(nominatedValidators));
			// }

			const fee = await apiInstance.tx.utility
				.batchAll(transactions)
				.paymentInfo(substrateStashId);
			// .then((info) => {
			// 	const fee = info.partialFee.toNumber();
			// 	setTransactionFee(fee);
			// });

			setTransactionFee(() => fee.partialFee.toNumber() + ysFees);
		}
	}, [stakingInfo, selected, controllerTransferAmount]);

	// console.log(filteredAccounts);

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
				<div className="w-full flex-1 flex flex-col text-gray-700 justify-center items-center p-4 text-gray-700 space-y-6 mb-32">
					{stepsMenu.map((step, index) => (
						<div
							key={index}
							className="w-full grid grid-cols-8 items-center space-x-2 px-4"
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
								} col-span-7 ${index !== currentStep && "font-light"} text-sm`}
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
					/>
				) : (
					<SecureStakeToEarn
						stakingInfo={stakingInfo}
						apiInstance={apiInstance}
						selectedAccount={selectedAccount}
						networkInfo={networkInfo}
						transactionState={transactionState}
						balances={balances}
						confirmedControllerBalances={
							accountsBalances[confirmedControllerAccount?.address]
						}
						controllerTransferAmount={controllerTransferAmount}
						decrementCurrentStep={decrementCurrentStep}
						onConfirm={onConfirm}
						ysFees={ysFees}
						confirmedControllerAccount={confirmedControllerAccount}
						transactionFee={transactionFee}
						transactionType={transactionType}
					/>
				)}
			</div>
		</div>
	);
};
export default SecureStakingSetup;
