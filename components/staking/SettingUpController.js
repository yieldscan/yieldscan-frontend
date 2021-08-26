import { AlertCircle, ArrowLeft, Check, ChevronLeft } from "react-feather";
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
			width="420"
			height="280"
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
	decrementInfoIndex,
	filteredAccounts,
	accountsBalances,
	isStashPopoverOpen,
	setIsStashPopoverOpen,
	selected,
	handleOnClick,
	handleOnClickNext,
	controllerTransferAmount,
}) => {
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
			{controllerTransferAmount > 0 && (
				<div className="w-full flex flex-row justify-center items-center text-gray-700 bg-gray-200 rounded-lg p-4 space-x-3">
					<div>
						<AlertCircle />
					</div>
					<p className="text-sm font-light">
						Your selected account needs additional funds to maintain the minimum
						balance required by the network and to pay for the transaction fees.
						We will auto-transfer the required amount from your “cold” wallet in
						the next step.
					</p>
				</div>
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
						onClick={() => handleOnClickNext(selected)}
						disabled={isNil(selected) || selected?.disabledSelection}
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
								<p className="text-justify text-lg col-span-9 mt-1 max-w-5xl">{info}</p>
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
