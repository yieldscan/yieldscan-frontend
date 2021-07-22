import { ArrowRight, ArrowUpRight, Check, ChevronLeft } from "react-feather";
import { Collapse } from "@chakra-ui/core";
import {
	BackButtonContent,
	BottomBackButton,
	BottomNextButton,
	NextButtonContent,
} from "@components/common/BottomButton";
import { useState, useEffect } from "react";
import startRamp from "@lib/startRamp";
import Image from "next/image";
import WaitingModal from "./WaitingModal";

const begginerInfo = (networkInfo) => [
	`Install polkadot{.js} browser wallet`,
	"Connect your ledger wallet through polkadot{.js}",
	"Authorize polkadot{.js} to connect to YieldScan",
];

const MinAmountInfo = ({
	networkInfo,
	hasExtension,
	openWaitingModal,
	incrementInfoIndex,
}) => (
	<div className="space-y-4">
		<p className="text-sm text-gray-600">
			{hasExtension
				? "You’ve already installed polkaodt{.js} wallet. Click next to continue to the next step."
				: "You’ll be redirected to the external installation page. Return to this page after installation"}
		</p>
		<BottomNextButton
			onClick={() => {
				if (hasExtension) {
					incrementInfoIndex();
				} else {
					openWaitingModal();
					window?.open("https://polkadot.js.org/extension/", "_blank");
				}
			}}
		>
			{hasExtension ? <NextButtonContent /> : <p>{"Install polkadot{.js}"}</p>}
		</BottomNextButton>
	</div>
);

const ControllerInfo = ({ incrementInfoIndex, decrementInfoIndex }) => (
	<div className="space-y-4">
		<p className="mt-4 text-xs text-gray-600">
			{
				"Follow the video tutorial below to connect your ledger wallet through polkadot{.js}, then continue to the next step"
			}
		</p>
		<iframe
			width="420"
			height="280"
			src="https://www.youtube.com/embed/N8V4D2PpuLk"
			title="YouTube video player"
			frameBorder="0"
			// allow="autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
			allowFullScreen
		></iframe>
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

const ConnectInfo = ({
	incrementInfoIndex,
	decrementInfoIndex,
	handleOnClickConnectPolkadotExtension,
}) => (
	<div className="space-y-4">
		<p className="mt-4 text-xs text-gray-600">
			{
				"Click the Connect polkadot{.js} button below, then allow polkadot{.js} to connect to YieldScan as shown in the image."
			}
		</p>
		<div>
			<Image src="/images/auth.png" width="320" height="280" alt="walletIcon" />
		</div>
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
					onClick={() => {
						handleOnClickConnectPolkadotExtension();
					}}
				>
					{"Connect polkadot{.js}"}
				</BottomNextButton>
			</div>
		</div>
	</div>
);

const ContentArr = ({
	index,
	networkInfo,
	hasExtension,
	openWaitingModal,
	incrementInfoIndex,
	decrementInfoIndex,
	handleOnClickConnectPolkadotExtension,
}) => {
	return index === 0 ? (
		<MinAmountInfo
			networkInfo={networkInfo}
			hasExtension={hasExtension}
			openWaitingModal={openWaitingModal}
			incrementInfoIndex={incrementInfoIndex}
		/>
	) : index === 1 ? (
		<ControllerInfo
			incrementInfoIndex={incrementInfoIndex}
			decrementInfoIndex={decrementInfoIndex}
		/>
	) : (
		<ConnectInfo
			incrementInfoIndex={incrementInfoIndex}
			decrementInfoIndex={decrementInfoIndex}
			handleOnClickConnectPolkadotExtension={
				handleOnClickConnectPolkadotExtension
			}
		/>
	);
};

const LedgerSetup = ({
	networkInfo,
	hasExtension,
	handleOnClickConnectPolkadotExtension,
	connectExtensionCheck,
	walletConnectState,
	setCurrentStep,
	setConnectExtensionCheck,
}) => {
	const [infoIndex, setInfoIndex] = useState(0);
	const [isOpen, setIsOpen] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const [ledgerSetupStep, setLedgerSetupStep] = useState("installExt");

	const handleOnClick = (info) => {
		if (isOpen) {
			infoIndex !== info ? setInfoIndex(info) : setIsOpen(false);
		} else {
			setIsOpen(true);
			setInfoIndex(info);
		}
	};

	const incrementInfoIndex = () => {
		setInfoIndex((state) => state + 1);
	};

	const decrementInfoIndex = () => {
		setInfoIndex((state) => Math.max(state - 1, 0));
	};

	const closeWaitingModal = () => {
		setIsModalOpen(false);
	};

	const openWaitingModal = () => {
		setIsModalOpen(true);
	};

	useEffect(() => {
		walletConnectState === "connected" &&
			connectExtensionCheck &&
			incrementInfoIndex();
	}, [connectExtensionCheck, walletConnectState]);

	return (
		<div className="flex-1 w-full max-w-65-rem grid grid-rows-4 text-gray-700 p-4 text-gray-700">
			<WaitingModal isOpen={isModalOpen} close={closeWaitingModal} />
			{infoIndex < 3 && (
				<div className="row-span-1 w-full h-full flex flex-col justify-center">
					<div className="flex flex-row">
						<button
							className="flex items-center bg-gray-200 text-gray-600 rounded-full px-2 py-1"
							onClick={() => {
								setCurrentStep("main");
								setConnectExtensionCheck(false);
							}}
						>
							<ChevronLeft size={16} className="text-gray-600" />
							<span className="mx-2 text-sm">back</span>
						</button>
						<div className="w-full flex justify-center mr-20">
							<h1 className="w-full max-w-2xl text-2xl font-semibold">
								To use ledger wallet on YieldScan
							</h1>
						</div>
					</div>
					<div className="w-full flex justify-center">
						<p className="w-full max-w-2xl text-gray-600 text-sm">
							{
								"We strongly recommend connecting your ledger hardware wallet through the official polkadot{.js} browser wallet as it recognizes all known scam sites and alerts you to protect your funds"
							}
						</p>
					</div>
				</div>
			)}
			<div className="row-span-3 w-full flex justify-center">
				<div
					className={`w-full max-w-2xl flex flex-col space-y-2 ${
						connectExtensionCheck &&
						walletConnectState === "connected" &&
						"justify-center"
					}`}
				>
					{infoIndex < 3 && (
						<h2 className="text-xl font-semibold">Step by step</h2>
					)}
					<div className="w-full space-y-2">
						{begginerInfo(networkInfo).map((info, index) => (
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
									{index !== begginerInfo(networkInfo).length - 1 && (
										<div className="h-full min-h-8 w-0 border-r border-gray-500 rounded-full"></div>
									)}
								</div>
								<div className="col-span-9 flex w-full max-w-xl flex-col p-2">
									<div className="grid grid-cols-10 gap-2 w-full text-md text-gray-700 justify-between items-center">
										<p className="text-justify col-span-9 mt-1 max-w-lg">
											{info}
										</p>
									</div>
									<Collapse isOpen={isOpen && infoIndex === index}>
										<ContentArr
											index={index}
											networkInfo={networkInfo}
											hasExtension={hasExtension}
											openWaitingModal={openWaitingModal}
											incrementInfoIndex={incrementInfoIndex}
											decrementInfoIndex={decrementInfoIndex}
											handleOnClickConnectPolkadotExtension={
												handleOnClickConnectPolkadotExtension
											}
										/>
									</Collapse>
								</div>
							</div>
						))}
					</div>
					{connectExtensionCheck && walletConnectState === "connected" && (
						<div className="w-full flex flex-col justify-center space-y-2">
							<h1 className="w-full text-lg">
								{
									"Congratulations! You’ve successfully connected to polkadot{.js} wallet 🎉"
								}
							</h1>
							<div>
								<BottomNextButton
									onClick={() => {
										setCurrentStep("selectStakingAccount");
									}}
								>
									Continue to select account
								</BottomNextButton>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
export default LedgerSetup;
