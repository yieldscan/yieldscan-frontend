import {
	AlertCircle,
	ArrowLeft,
	Check,
	ChevronLeft,
	AlertOctagon,
	AlertTriangle,
} from "react-feather";
import { useState, useEffect } from "react";
import { Collapse } from "@chakra-ui/core";
import { isNil, get } from "lodash";
import {
	BottomNextButton,
	BottomBackButton,
	NextButtonContent,
	BackButtonContent,
} from "../common/BottomButton";
import PopoverAccountSelection from "../common/PopoverAccountSelection";
import formatCurrency from "@lib/format-currency";
import { HelpPopover } from "@components/reward-calculator";
import {
	Alert,
	AlertDescription,
	AlertTitle,
	Popover,
	PopoverArrow,
	PopoverBody,
	PopoverContent,
	PopoverTrigger,
} from "@chakra-ui/core";

const stepHeadings = () => [
	"Create a new account using polkadot{.js}",
	"To be doubly sure, can you help us with selecting the account you intend to use as controller?",
];

const CreateNewAccount = ({ networkInfo, incrementInfoIndex }) => (
	<div className="space-y-4">
		<p className="mt-4 text-sm text-gray-600">
			{
				"Follow the video instructions below to create the new account which can be used as your controller for staking. We recommend naming the account “Controller” to avoid any confusion with other accounts in your wallet."
			}
		</p>
		<iframe
			width="720"
			height="480"
			src="https://www.youtube.com/embed/NlUxkSkFH2U"
			title="YouTube video player"
			frameBorder="0"
			// allow="autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
			allowFullScreen
		></iframe>
		<div className="w-full flex flex-row justify-start space-x-3">
			{/* <div>
				<BottomBackButton
					onClick={() => {
						decrementInfoIndex();
					}}
				>
					<BackButtonContent />
				</BottomBackButton>
			</div> */}
			<div>
				<BottomNextButton
					onClick={() => {
						incrementInfoIndex();
					}}
				>
					<NextButtonContent />
				</BottomNextButton>
			</div>
		</div>
	</div>
);

const SelectControllerAccount = ({
	networkInfo,
	apiInstance,
	decrementInfoIndex,
	filteredAccounts,
	accountsBalances,
	isStashPopoverOpen,
	setIsStashPopoverOpen,
	selected,
	handleOnClick,
	handleOnClickNext,
	controllerTransferAmount,
	transactionFee,
	stakingInfo,
	balances,
	transactionState,
	setTransactionState,
	minPossibleStake,
	adjustedStakingAmount,
	setAdjustedStakingAmount,
	unadjustedStakingAmount,
	setUnadjustedStakingAmount,
	ysFees,
}) => {
	const activeBondedAmount =
		parseInt(get(stakingInfo, "stakingLedger.active", 0)) /
		Math.pow(10, networkInfo.decimalPlaces);

	const stakingAmount = get(transactionState, "stakingAmount", 0);

	useEffect(() => {
		setAdjustedStakingAmount(null);
		if (
			selected &&
			apiInstance &&
			accountsBalances &&
			controllerTransferAmount > 0
		) {
			if (
				activeBondedAmount === 0 &&
				balances?.availableBalance.toNumber() <
					controllerTransferAmount +
						Math.trunc(
							stakingAmount * Math.pow(10, networkInfo.decimalPlaces)
						) +
						ysFees +
						networkInfo.reserveAmount * Math.pow(10, networkInfo.decimalPlaces)
			) {
				if (
					balances?.availableBalance.toNumber() -
						(controllerTransferAmount +
							ysFees +
							networkInfo.reserveAmount *
								Math.pow(10, networkInfo.decimalPlaces)) >=
						minPossibleStake * Math.pow(10, networkInfo.decimalPlaces) &&
					balances?.freeBalance.toNumber() -
						(controllerTransferAmount + ysFees + transactionFee) >=
						apiInstance?.consts.balances.existentialDeposit.toNumber()
				) {
					setAdjustedStakingAmount(
						balances?.availableBalance.toNumber() -
							(controllerTransferAmount +
								ysFees +
								networkInfo.reserveAmount *
									Math.pow(10, networkInfo.decimalPlaces))
					);
				}
			}
		}
	}, [
		selected?.address,
		JSON.stringify(accountsBalances[selected?.address]),
		controllerTransferAmount,
		networkInfo,
		minPossibleStake,
		stakingAmount,
		ysFees,
	]);
	return (
		<div className="space-y-4">
			<p className="mt-4 text-sm text-gray-600">
				{"We recommend selecting the account you created in the previous step"}
			</p>
			{filteredAccounts && filteredAccounts?.length !== 0 ? (
				<PopoverAccountSelection
					accounts={filteredAccounts}
					accountsBalances={accountsBalances}
					isStashPopoverOpen={isStashPopoverOpen}
					setIsStashPopoverOpen={setIsStashPopoverOpen}
					networkInfo={networkInfo}
					selectedAccount={selected}
					onClick={handleOnClick}
					isSetUp={true}
				/>
			) : (
				<div className="w-full flex flex-row justify-center items-center text-gray-700 bg-gray-200 rounded-lg p-4 space-x-3">
					<div>
						<AlertCircle />
					</div>
					<p className="text-sm font-light">
						You don't have any eligible accounts available for setting as a
						controller. Please go back and create one.
					</p>
				</div>
			)}
			{adjustedStakingAmount ? (
				<div className="w-full flex flex-row bg-yellow-200 bg-opacity-50 rounded-lg p-4 justify-center items-center space-x-3">
					<div>
						<AlertOctagon size="40" className="text-orange-300" />
					</div>

					<div className="flex flex-col p-2">
						<h1 className="w-full text-md text-gray-700 font-semibold">
							Staking amount will be changed
						</h1>

						<span className="w-full h-full text-sm text-gray-600 font-semibold">
							Your staking amount will be changed from{" "}
							{formatCurrency.methods.formatAmount(
								Math.trunc(
									stakingAmount * Math.pow(10, networkInfo.decimalPlaces)
								),
								networkInfo
							)}{" "}
							to{" "}
							{formatCurrency.methods.formatAmount(
								adjustedStakingAmount,
								networkInfo
							)}{" "}
							to transfer enough funds to the selected controller account.{" "}
							<Popover trigger="hover" usePortal>
								<PopoverTrigger>
									<span className="underline cursor-help">Why?</span>
								</PopoverTrigger>
								<PopoverContent
									zIndex={1401}
									_focus={{ outline: "none" }}
									bg="gray.600"
									border="none"
								>
									<PopoverArrow />
									<PopoverBody>
										<span className="text-white text-xs">
											Your selected account needs additional funds to maintain
											the minimum balance required by the network and to pay for
											the transaction fees. We will auto-transfer the required
											amount from your “cold” wallet in the next step.
										</span>
									</PopoverBody>
								</PopoverContent>
							</Popover>
						</span>
					</div>
				</div>
			) : (controllerTransferAmount > 0 &&
					activeBondedAmount > 0 &&
					balances?.availableBalance.toNumber() <
						controllerTransferAmount +
							(networkInfo.reserveAmount *
								Math.pow(10, networkInfo.decimalPlaces)) /
								2) ||
			  (controllerTransferAmount > 0 &&
					activeBondedAmount === 0 &&
					balances?.availableBalance.toNumber() -
						(controllerTransferAmount +
							networkInfo.reserveAmount *
								Math.pow(10, networkInfo.decimalPlaces)) <
						minPossibleStake &&
					balances?.freeBalance.toNumber() -
						(controllerTransferAmount + transactionFee) <
						apiInstance?.consts.balances.existentialDeposit.toNumber()) ? (
				<div className="w-full flex flex-row justify-center items-center bg-red-100 rounded-lg p-4 space-x-3">
					<div>
						<AlertTriangle size="40" className="text-red-600" />
					</div>
					<div className="flex flex-col p-2">
						<h1 className="w-full text-md text-gray-700 font-semibold">
							Insufficient stash balance
						</h1>
						<p className=" w-full h-full text-sm text-gray-600 font-semibold">
							Either choose a different controller with enough available balance
							or add funds to your stash account to proceed with secure staking.
						</p>
					</div>
				</div>
			) : (
				controllerTransferAmount > 0 && (
					<div className="w-full flex flex-row justify-center items-center text-gray-700 bg-gray-200 rounded-lg p-4 space-x-3">
						<div>
							<AlertCircle size="40" />
						</div>
						<p className="text-sm font-semibold">
							Your selected account needs additional funds to maintain the
							minimum balance required by the network and to pay for the
							transaction fees. We will auto-transfer the required amount from
							your “cold” wallet in the next step.
						</p>
					</div>
				)
			)}
			<div className="w-full flex flex-row justify-start space-x-3">
				<div>
					<BottomBackButton
						onClick={() => {
							decrementInfoIndex();
						}}
					>
						<BackButtonContent />
					</BottomBackButton>
				</div>
				<div>
					<BottomNextButton
						onClick={() => handleOnClickNext(selected, adjustedStakingAmount)}
						disabled={
							isNil(selected) ||
							selected?.disabledSelection ||
							(controllerTransferAmount > 0 &&
								activeBondedAmount > 0 &&
								balances?.availableBalance.toNumber() <
									controllerTransferAmount +
										(networkInfo.reserveAmount *
											Math.pow(10, networkInfo.decimalPlaces)) /
											2) ||
							(controllerTransferAmount > 0 &&
								activeBondedAmount === 0 &&
								balances?.availableBalance.toNumber() -
									(controllerTransferAmount +
										networkInfo.reserveAmount *
											Math.pow(10, networkInfo.decimalPlaces)) <
									minPossibleStake &&
								balances?.freeBalance.toNumber() -
									(controllerTransferAmount + transactionFee) <
									apiInstance?.consts.balances.existentialDeposit.toNumber())
						}
					>
						<NextButtonContent name="Confirm" />
					</BottomNextButton>
				</div>
			</div>
		</div>
	);
};

const StepsArr = ({
	index,
	networkInfo,
	apiInstance,
	incrementInfoIndex,
	decrementInfoIndex,
	ysFees,
	filteredAccounts,
	accountsBalances,
	isStashPopoverOpen,
	setIsStashPopoverOpen,
	controllerTransferAmount,
	selected,
	handleOnClick,
	handleOnClickNext,
	transactionFee,
	stakingInfo,
	balances,
	transactionState,
	setTransactionState,
	minPossibleStake,
	adjustedStakingAmount,
	setAdjustedStakingAmount,
	unadjustedStakingAmount,
	setUnadjustedStakingAmount,
}) => {
	return index === 0 ? (
		<CreateNewAccount
			networkInfo={networkInfo}
			incrementInfoIndex={incrementInfoIndex}
		/>
	) : (
		<SelectControllerAccount
			networkInfo={networkInfo}
			incrementInfoIndex={incrementInfoIndex}
			apiInstance={apiInstance}
			decrementInfoIndex={decrementInfoIndex}
			filteredAccounts={filteredAccounts}
			accountsBalances={accountsBalances}
			isStashPopoverOpen={isStashPopoverOpen}
			controllerTransferAmount={controllerTransferAmount}
			setIsStashPopoverOpen={setIsStashPopoverOpen}
			selected={selected}
			ysFees={ysFees}
			handleOnClick={handleOnClick}
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
	);
};

const SettingUpController = ({
	decrementCurrentStep,
	networkInfo,
	apiInstance,
	filteredAccounts,
	accountsBalances,
	ysFees,
	isStashPopoverOpen,
	setIsStashPopoverOpen,
	controllerTransferAmount,
	selected,
	handleOnClick,
	handleOnClickNext,
	transactionFee,
	stakingInfo,
	balances,
	transactionState,
	setTransactionState,
	minPossibleStake,
	adjustedStakingAmount,
	setAdjustedStakingAmount,
	unadjustedStakingAmount,
	setUnadjustedStakingAmount,
}) => {
	const [infoIndex, setInfoIndex] = useState(0);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const incrementInfoIndex = () => {
		setInfoIndex((state) => state + 1);
	};

	const decrementInfoIndex = () => {
		setInfoIndex((state) => Math.max(state - 1, 0));
	};

	useEffect(() => {
		if (selected) {
			setInfoIndex(1);
		}
	}, []);

	return (
		<div className="w-full flex flex-col text-gray-700 p-4 text-gray-700 space-y-6">
			<div className="w-full flex flex-col justify-center">
				<h1 className="w-full h-full text-4xl font-semibold">
					Setting up your controller
				</h1>
				<p className="w-full text-gray-600 text-sm">
					Your controller account will act on behalf of your “cold” wallet,
					without being able to access those funds
				</p>
			</div>
			<div className="w-full space-y-4">
				<h2 className="text-xl font-semibold">Step by step</h2>
			</div>
			<div className="w-full space-y-2">
				{stepHeadings(networkInfo).map((info, index) => (
					<div key={index} className="grid grid-cols-10">
						<div className="p-2 flex flex-col items-center space-y-2">
							{infoIndex <= index && (
								<div className="h-8 w-8 border-2 border-teal-500 rounded-full text-teal-500 flex items-center text-lg justify-center">
									{index + 1}
								</div>
							)}
							{infoIndex > index && (
								<div className="ml-2">
									<Check
										className="p-1 mr-2 rounded-full text-white bg-teal-500 bg-opacity-100"
										strokeWidth="4px"
										size={30}
									/>
								</div>
							)}
							{index !== stepHeadings(networkInfo).length - 1 && (
								<div className="h-full min-h-8 w-0 border-r border-gray-500 rounded-full"></div>
							)}
						</div>
						<div
							className={`col-span-9 flex w-full max-w-xl flex-col p-2 ${
								index === stepHeadings(networkInfo).length - 1 && "mb-12"
							}`}
						>
							<div className="grid grid-cols-10 gap-2 w-full text-md text-gray-700 justify-between items-center">
								<p className="text-justify text-lg col-span-9 mt-1 max-w-5xl">
									{info}
								</p>
							</div>
							<Collapse isOpen={infoIndex === index}>
								<StepsArr
									index={index}
									networkInfo={networkInfo}
									incrementInfoIndex={incrementInfoIndex}
									decrementInfoIndex={decrementInfoIndex}
									filteredAccounts={filteredAccounts}
									accountsBalances={accountsBalances}
									isStashPopoverOpen={isStashPopoverOpen}
									apiInstance={apiInstance}
									setIsStashPopoverOpen={setIsStashPopoverOpen}
									selected={selected}
									controllerTransferAmount={controllerTransferAmount}
									ysFees={ysFees}
									handleOnClick={handleOnClick}
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
							</Collapse>
						</div>
					</div>
				))}
			</div>
			<div className="w-full flex flex-row justify-start space-x-2">
				<button>
					<div
						className="flex flex-row space-x-2 items-center"
						onClick={() => decrementCurrentStep()}
					>
						<ArrowLeft size="18" />
						<span>Introduction to secure staking</span>
					</div>
				</button>
			</div>
		</div>
	);
};

export default SettingUpController;
