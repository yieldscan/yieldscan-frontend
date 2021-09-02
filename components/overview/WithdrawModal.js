// TODO: Cleanup this: remove unused variables and effects
import { useState, useEffect } from "react";
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalBody,
	ModalCloseButton,
	ModalHeader,
	Spinner,
	useToast,
	Input,
	Button,
	Popover,
	PopoverTrigger,
	PopoverContent,
	PopoverArrow,
	PopoverBody,
	Divider,
} from "@chakra-ui/core";
import withSlideIn from "@components/common/withSlideIn";
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";
import RiskTag from "@components/reward-calculator/RiskTag";
import { random, get, noop, isNil } from "lodash";
import calculateReward from "@lib/calculate-reward";
import formatCurrency from "@lib/format-currency";
import updateFunds from "@lib/polkadot/update-funds";
import { usePolkadotApi, useAccounts, useCoinGeckoPriceUSD } from "@lib/store";
import { ArrowRight, Check, ExternalLink } from "react-feather";
import Routes from "@lib/routes";
import Identicon from "@components/common/Identicon";
import ChainErrorPage from "@components/overview/ChainErrorPage";
import SuccessfullyBonded from "@components/overview/SuccessfullyBonded";
import AmountInput from "./AmountInput";
import axios from "@lib/axios";
import AmountConfirmation from "./AmountConfirmation";
import { track, goalCodes } from "@lib/analytics";
import { network } from "yieldscan.config";
import signAndSend from "@lib/signAndSend";
import Image from "next/image";
import { NextButton } from "@components/common/BottomButton";
import { HelpPopover } from "@components/reward-calculator";

const StepperAmountConfirmation = ({
	amount,
	subCurrency,
	type,
	api,
	stakingInfo,
	networkInfo,
	onConfirm,
	transactionFee,
}) => {
	const { coinGeckoPriceUSD } = useCoinGeckoPriceUSD();
	const [subFeeCurrency, setSubFeeCurrency] = useState();
	const [totalAmount, setTotalAmount] = useState(0);
	const [totalAmountFiat, setTotalAmountFiat] = useState(0);

	// useEffect(() => {
	// 	if (!transactionFee) {
	// 		getUpdateFundsTransactionFee(
	// 			stashId,
	// 			amount,
	// 			type,
	// 			stakingInfo.stakingLedger.active /
	// 				Math.pow(10, networkInfo.decimalPlaces),
	// 			api,
	// 			networkInfo
	// 		).then((data) => {
	// 			if (type == "unbond") {
	// 				data.partialFee !== undefined
	// 					? setTransactionFee(data.partialFee.toNumber())
	// 					: setTransactionFee(0);
	// 			} else setTransactionFee(data);
	// 		});
	// 	}
	// }, [amount, stashId, networkInfo, type]);

	useEffect(() => {
		if (transactionFee) {
			setSubFeeCurrency(
				(transactionFee / Math.pow(10, networkInfo.decimalPlaces)) *
					coinGeckoPriceUSD
			);
		}
	}, [transactionFee]);

	useEffect(() => {
		if (totalAmount) {
			setTotalAmountFiat(totalAmount * coinGeckoPriceUSD);
		}
	}, [totalAmount]);

	useEffect(() => {
		if (!totalAmount) {
			type === "bond" || type == "rebond"
				? setTotalAmount(
						amount +
							stakingInfo.stakingLedger.active /
								Math.pow(10, networkInfo.decimalPlaces)
				  )
				: setTotalAmount(
						stakingInfo.stakingLedger.active /
							Math.pow(10, networkInfo.decimalPlaces) -
							amount
				  );
		}
	}, [amount, stakingInfo]);

	return (
		<div className="w-full flex flex-col">
			<div className="w-full flex flex-col">
				<div className="mt-2 mb-8 rounded text-gray-900 flex items-center justify-between">
					<div className="rounded-lg flex-col ml-2">
						<span className="text-gray-500 white-space-nowrap text-xs">
							Current Investment Value
						</span>
						<h3 className="text-2xl white-space-nowrap">
							{formatCurrency.methods.formatAmount(
								stakingInfo.stakingLedger.active,
								networkInfo
							)}
						</h3>
						<span className="text-sm font-medium text-teal-500">
							$
							{(
								(stakingInfo.stakingLedger.active /
									Math.pow(10, networkInfo.decimalPlaces)) *
								coinGeckoPriceUSD
							).toFixed(2)}
						</span>
					</div>
					<div>
						<ArrowRight size="2rem" />
					</div>
					<div className="rounded-lg flex-col mr-2 ">
						<span className="text-gray-500 white-space-nowrap  text-xs">
							Final Investment Value
						</span>
						<h3 className="text-2xl white-space-nowrap">
							{formatCurrency.methods.formatAmount(
								Math.trunc(
									totalAmount * Math.pow(10, networkInfo.decimalPlaces)
								),
								networkInfo
							)}
						</h3>
						<span className="text-sm font-medium text-teal-500">
							${totalAmountFiat.toFixed(2)}
						</span>
					</div>
				</div>
			</div>
			{/* <button
				className="mt-8 px-24 py-4 bg-teal-500 text-white rounded-lg"
				onClick={handlePopoverClose}
			>
				Back to Dashboard
			</button> */}
			<div className="w-full mt-8">
				<div className="flex justify-between">
					<p className="text-gray-700 text-xs">Additional Investment Amount</p>
					<div className="flex flex-col">
						<p className="text-sm text-right">
							{type === "bond" || type == "rebond"
								? formatCurrency.methods.formatAmount(
										Math.trunc(amount * 10 ** networkInfo.decimalPlaces),
										networkInfo
								  )
								: formatCurrency.methods.formatAmount(0, networkInfo)}
						</p>
						<p className="text-xs text-right text-gray-600">
							$
							{Number(
								type === "bond" || type == "rebond"
									? amount * coinGeckoPriceUSD
									: 0
							).toFixed(2)}
						</p>
					</div>
				</div>
				<div className="flex justify-between mt-4">
					<p className="text-gray-700 text-xs">Transaction Fee</p>

					<div className="flex flex-col">
						{transactionFee > 0 ? (
							<div>
								<p className="text-sm text-right">
									{formatCurrency.methods.formatAmount(
										Math.trunc(transactionFee),
										networkInfo
									)}
								</p>
								{!isNil(subFeeCurrency) && (
									<p className="text-xs text-right text-gray-600">
										${subFeeCurrency.toFixed(2)}
									</p>
								)}
							</div>
						) : (
							<Spinner />
						)}
					</div>
				</div>
				<Divider my={6} />
				<div className="flex justify-between">
					<p className="text-gray-700 text-sm font-semibold">Total Amount</p>
					{transactionFee > 0 ? (
						<div className="flex flex-col">
							<p className="text-lg text-right font-bold">
								{type === "bond" || type == "rebond"
									? formatCurrency.methods.formatAmount(
											Math.trunc(amount * 10 ** networkInfo.decimalPlaces) +
												transactionFee,
											networkInfo
									  )
									: formatCurrency.methods.formatAmount(
											Math.trunc(transactionFee),
											networkInfo
									  )}
							</p>
							{!isNil(subFeeCurrency) && (
								<p className="text-sm text-right text-gray-600 font-medium">
									$
									{type === "bond" || type == "rebond"
										? (subCurrency + subFeeCurrency).toFixed(2)
										: subFeeCurrency.toFixed(2)}
								</p>
							)}
						</div>
					) : (
						<Spinner />
					)}
				</div>
			</div>
		</div>
	);
};

const StopStaking = ({ networkInfo, transactionFee }) => (
	<div className="w-full flex flex-col space-x-2">
		<div className="flex justify-between mt-4">
			<div className="text-xs text-gray-700 flex items-center">
				<p>Transaction Fee</p>
				<HelpPopover
					content={
						<p className="text-xs text-white">
							This fee is used to pay for the resources used for processing the
							transaction on the blockchain network. YieldScan doesn’t profit
							from this fee in any way.
						</p>
					}
				/>
			</div>
			<div className="flex flex-col">
				{transactionFee !== 0 ? (
					<div>
						<p className="text-gray-700 text-sm font-semibold text-right">
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
			{transactionFee !== 0 ? (
				<div className="flex flex-col">
					<p className="text-gray-700 text-lg text-right font-bold">
						{formatCurrency.methods.formatAmount(
							Math.trunc(transactionFee),
							networkInfo
						)}
					</p>
					{/* <p className="text-sm text-right text-gray-600 font-medium">
	${(subCurrency + subFeeCurrency).toFixed(2)}
</p> */}
				</div>
			) : (
				<Spinner />
			)}
		</div>
	</div>
);

const StepperSigning = ({
	onConfirm,
	stepperTransactions,
	currentStep,
	transactionFee,
	amount,
	subCurrency,
	type,
	stashId,
	stakingInfo,
	networkInfo,
	api,
}) => {
	return (
		<div className="w-full flex flex-col justify-center items-center space-y-4 p-4">
			<h1 className="w-full text-xl text-center text-gray-700 font-semibold p-2">
				Withdraw
			</h1>
			<div className="w-full flex flex-row items-center">
				{stepperTransactions?.map((a, index) => (
					<div key={index} className="w-full flex flex-row items-center">
						<div className="flex w-1/3 justify-center items-center">
							{index !== 0 && (
								<div className="flex w-full border-b h-0 border-gray-500 rounded-full"></div>
							)}
						</div>
						<div className="w-1/3 flex justify-center">
							{currentStep <= index + 2 ? (
								<div
									className={`h-8 w-8 border-2 ${
										index + 2 === currentStep
											? "border-teal-500 text-teal-500"
											: "border-gray-500 text-gray-500"
									} rounded-full flex items-center text-lg justify-center`}
								>
									{index + 1}
								</div>
							) : (
								<Check
									className="p-1 mr-2 rounded-full text-white bg-teal-500 bg-opacity-100"
									strokeWidth="4px"
									size={30}
								/>
							)}
						</div>
						<div className="flex w-1/3 justify-center items-center">
							{index !== stepperTransactions?.length - 1 && (
								<div className="flex w-full border-b h-0 border-gray-500 rounded-full"></div>
							)}
						</div>
					</div>
				))}
			</div>
			<div className="w-full flex flex-row items-center">
				{stepperTransactions?.map((a, index) => (
					<div
						key={index}
						className="w-full flex flex-row items-center justify-center"
					>
						<p
							className={`w-full text-center text-sm ${
								currentStep <= index ? "text-gray-500" : "text-teal-500"
							} ${currentStep !== index + 1 && "font-light"} `}
						>
							{a?.transactionHeading}
						</p>
					</div>
				))}
			</div>
			{stepperTransactions[currentStep]?.transactionType === "chill" ? (
				<StopStaking
					networkInfo={networkInfo}
					transactionFee={transactionFee}
				/>
			) : (
				<StepperAmountConfirmation
					amount={amount}
					subCurrency={subCurrency}
					type={type}
					stashId={stashId}
					stakingInfo={stakingInfo}
					networkInfo={networkInfo}
					api={api}
					onConfirm={onConfirm}
					transactionFee={transactionFee}
				/>
			)}
			<div className="mt-4 w-full text-center">
				<NextButton onClick={onConfirm} disabled={transactionFee === 0}>
					Continue to sign
				</NextButton>
			</div>
		</div>
	);
};

const IdentifyWallet = ({ setIsLedger, setCurrentStep }) => {
	return (
		<div className="w-full flex flex-col justify-center items-center space-y-4 p-4">
			<h1 className="w-full text-xl text-center text-gray-700 font-semibold p-2">
				Tell us your account’s source
			</h1>
			<div className="w-full flex flex-col justify-center items-center space-y-2">
				<p className="w-full text-sm text-center text-gray-700 font-light px-4">
					We optimize your transaction signing process using this information.
					Please make sure you select the correct option else your transaction
					may fail.
				</p>
				<a
					className="w-full text-sm text-center text-gray-700 font-semibold underline cursor-pointer px-2"
					href="https://intercom.help/yieldscan/en/articles/5353515-how-to-check-which-accounts-on-polkadot-js-wallet-are-imported-through-a-hardware-wallet"
					target="_blank"
					rel="noreferrer"
				>
					How to check?
				</a>
			</div>
			<div className="w-full flex text-gray-700 flex-col space-y-2 p-2">
				<button
					className="w-full flex rounded-lg border items-center shadow-md hover:shadow-lg p-8 transform hover:scale-102"
					onClick={() => {
						setIsLedger(true);
						setCurrentStep(2);
					}}
				>
					<div className="w-full flex-1 flex flex-row items-center text-left space-x-6">
						<Image
							src="/images/ledgerIcon.svg"
							width="80"
							height="80"
							alt="walletIcon"
						/>
						<div className="flex flex-col text-left">
							<h2 className="text-lg font-semibold">Ledger hardware wallet</h2>
							<p className="text-gray-600 text-sm max-w-md">
								{
									"Select this option if you’re using a hardware wallet connected through polkadot{.js}"
								}
							</p>
						</div>
					</div>
				</button>
				<button
					className="w-full flex rounded-lg border items-center shadow-md hover:shadow-lg p-8 transform hover:scale-102"
					onClick={() => {
						setIsLedger(false);
						setCurrentStep(2);
					}}
				>
					<div className="w-full flex-1 flex flex-row items-center text-left space-x-6">
						<Image
							src="/images/polkadot-ext.svg"
							width="80"
							height="80"
							alt="walletIcon"
						/>
						<div className="flex flex-col text-left">
							<h2 className="text-lg font-semibold">
								{"Using a polkadot{.js} account"}
							</h2>
							<p className="text-gray-600 text-sm max-w-md">
								Select this if you’re using a non-ledger account or if you don’t
								know what a ledger device is
							</p>
						</div>
					</div>
				</button>
			</div>
		</div>
	);
};

const WithdrawModal = withSlideIn(
	({
		type = "unbond",
		apiInstance,
		close,
		nominations,
		selectedAccount,
		balance,
		stakingInfo,
		networkInfo,
		minPossibleStake,
	}) => {
		const toast = useToast();
		const { coinGeckoPriceUSD } = useCoinGeckoPriceUSD();
		const [currentStep, setCurrentStep] = useState(0);
		const [isLedger, setIsLedger] = useState(false);
		const [amount, setAmount] = useState(0);
		const [subCurrency, setSubCurrency] = useState(0);
		const [updatingFunds, setUpdatingFunds] = useState(false);
		const [stakingEvent, setStakingEvent] = useState();
		const [stepperTransactions, setStepperTransactions] = useState(null);
		const [stepperIndex, setStepperIndex] = useState(0);
		const [processComplete, setProcessComplete] = useState(false);
		const [chainError, setChainError] = useState(false);
		const [transactions, setTransactions] = useState(null);
		const [injectorAccount, setInjectorAccount] = useState(null);
		const [transactionFee, setTransactionFee] = useState(0);
		const [totalUnbonding, setTotalUnbonding] = useState();
		const [totalUnbondingFiat, setTotalUnbondingFiat] = useState();
		const [transactionHash, setTransactionHash] = useState(null);
		const [isSuccessful, setIsSuccessful] = useState(null);
		const [isLast, setIsLast] = useState(true);
		const [closeOnOverlayClick, setCloseOnOverlayClick] = useState(true);
		const [calculationDisabled, setCalculationDisabled] = useState(true);

		const [totalStakingAmount, setTotalStakingAmount] = useState(
			() =>
				stakingInfo.stakingLedger.active /
				Math.pow(10, networkInfo.decimalPlaces)
		);

		const [totalStakingAmountFiat, setTotalStakingAmountFiat] = useState(0);
		const [validatorsLoading, setValidatorsLoading] = useState(true);
		const [errMessage, setErrMessage] = useState();

		const updateTransactionData = (
			stashId,
			network,
			alreadyBonded,
			stakeAmount,
			tranHash,
			successful
		) => {
			axios
				.put(`${networkInfo.network}/user/transaction/update`, {
					stashId: stashId,
					network: network,
					alreadyBonded: alreadyBonded,
					stake: stakeAmount,
					transactionHash: tranHash,
					successful: successful,
				})
				.then(() => {
					console.info("successfully updated transaction info");
				})
				.catch((e) => {
					console.info("unable to update transaction info");
				});
		};

		const handlePopoverClose = () => {
			close();
			setCurrentStep(0);
			setProcessComplete(false);
			setIsSuccessful(null);
		};

		const handleOnClickProceed = () => {
			setCurrentStep(1);
		};
		// useEffect(() => {
		// 	const timePeriodValue = 12,
		// 		timePeriodUnit = "months";

		// 	calculateReward(
		// 		coinGeckoPriceUSD,
		// 		validators,
		// 		totalStakingAmount,
		// 		timePeriodValue,
		// 		timePeriodUnit,
		// 		compounding,
		// 		networkInfo
		// 	).then((result) => {
		// 		// setTotalStakingAmount(totalStakingAmount);
		// 		setEstimatedReturns(get(result, "returns", 0));
		// 	});
		// }, [amount, compounding]);

		useEffect(() => {
			if (amount) {
				const totalAmount = Math.max(
					stakingInfo.stakingLedger.active /
						Math.pow(10, networkInfo.decimalPlaces) +
						amount,
					0
				);
				setTotalStakingAmount(totalAmount);
			}
		}, [amount]);

		useEffect(() => {
			setSubCurrency(amount * coinGeckoPriceUSD);
			setTotalStakingAmountFiat(totalStakingAmount * coinGeckoPriceUSD);
		}, [amount, totalStakingAmount]);

		useEffect(() => {
			if (isNil(amount) || isNaN(amount) || amount <= 0 || amount === "") {
				setCalculationDisabled(true);
			} else if (
				amount >
				stakingInfo.stakingLedger.active /
					Math.pow(10, networkInfo.decimalPlaces)
			) {
				setCalculationDisabled(true);
			} else setCalculationDisabled(false);
		}, [amount]);

		const onConfirm = () => {
			setUpdatingFunds(true);
			setCloseOnOverlayClick(false);
			const handlers = {
				onEvent: ({ message }) => {
					setStakingEvent(message);

					toast({
						title: "Info",
						description: message,
						status: "info",
						duration: 3000,
						position: "top-right",
						isClosable: true,
					});
				},
				onSuccessfullSigning: (hash) => {
					// setProcessComplete(true);
					// setStakingLoading(false);
					// setCloseOnOverlayClick(true);
					setTransactionHash(hash.message);
				},
				onFinish: (status, message, eventLogs, tranHash) => {
					// status = 0 for success, anything else for error code
					toast({
						title: status === 0 ? "Successful!" : "Error!",
						status: status === 0 ? "success" : "error",
						description: message,
						position: "top-right",
						isClosable: true,
						duration: 7000,
					});

					if (status === 0) {
						track(goalCodes.OVERVIEW.UNBOND_SUCCESSFUL);
						if (isLast) {
							updateTransactionData(
								selectedAccount?.address,
								networkInfo.network,
								stakingInfo.stakingLedger.active /
									Math.pow(10, networkInfo.decimalPlaces),
								stakingInfo.stakingLedger.active /
									Math.pow(10, networkInfo.decimalPlaces) +
									amount,
								tranHash,
								true
							);
						}
						setIsSuccessful(true);
						setStakingEvent(
							isLast
								? "Unbonding successful!"
								: "Successfully stopped staking, now moving to unbonding funds!"
						);
						setTimeout(() => {
							if (isLast) {
								setProcessComplete(true);
							} else setStepperIndex(1);
							setUpdatingFunds(false);
							setIsSuccessful(null);
							setCloseOnOverlayClick(true);
						}, 5000);
						// setProcessComplete(true);
						// setUpdatingFunds(false);
						// setCloseOnOverlayClick(true);
					} else {
						if (message === "Cancelled") {
							setUpdatingFunds(false);
							setCloseOnOverlayClick(true);
							setErrMessage(message);
						}
						if (message !== "Cancelled") {
							track(goalCodes.OVERVIEW.UNBOND_UNSUCCESSFUL);
							if (isLast) {
								updateTransactionData(
									selectedAccount?.address,
									networkInfo.network,
									stakingInfo.stakingLedger.active /
										Math.pow(10, networkInfo.decimalPlaces),
									stakingInfo.stakingLedger.active /
										Math.pow(10, networkInfo.decimalPlaces) +
										amount,
									tranHash,
									false
								);
							}
							setIsSuccessful(false);
							setStakingEvent("Investing more failed!");
							setTimeout(() => {
								setChainError(true);
								setUpdatingFunds(false);
								setCloseOnOverlayClick(true);
							}, 5000);
						}
					}
				},
			};
			signAndSend(apiInstance, handlers, transactions, injectorAccount).catch(
				(error) => {
					handlers.onFinish(1, error.message);
				}
			);
		};
		const handleOnClickForSuccessfulTransaction = () => {
			close();
		};

		useEffect(async () => {
			setStepperTransactions(null);
			if (!isNil(stakingInfo)) {
				// setTransactionFee(0);
				// setInjectorAccount(null);
				const substrateControllerId = encodeAddress(
					decodeAddress(stakingInfo?.controllerId),
					42
				);

				const rawAmount = Math.trunc(
					amount * Math.pow(10, networkInfo.decimalPlaces)
				);

				const _transactions = [];

				if (
					stakingInfo?.stakingLedger.active /
						Math.pow(10, networkInfo.decimalPlaces) -
						amount <
						minPossibleStake &&
					stakingInfo?.nominators &&
					stakingInfo?.nominators.length > 0
				) {
					// _transactions.push(apiInstance.tx.staking.chill());
					_transactions.push({
						transactionType: "chill",
						transactionHeading: "Stop staking(chill)",
						injectorAccount: substrateControllerId,
						substrateControllerId: substrateControllerId,
					});
				}

				// _transactions.push(apiInstance.tx.staking.unbond(rawAmount));
				_transactions.push({
					transactionType: "unbond",
					transactionHeading: "Unbond funds",
					injectorAccount: substrateControllerId,
					amount: rawAmount,
					substrateControllerId: substrateControllerId,
				});

				// const fee =
				// 	_transactions.length > 1
				// 		? await apiInstance.tx.utility
				// 				.batchAll(_transactions)
				// 				.paymentInfo(substrateControllerId)
				// 		: await _transactions[0].paymentInfo(substrateControllerId);

				setStepperTransactions([..._transactions]);
				// setInjectorAccount(substrateControllerId);
				// setTransactionFee(() => fee.partialFee.toNumber());
			}
		}, [amount]);

		useEffect(async () => {
			setTransactions(null);
			setTransactionFee(0);
			setInjectorAccount(null);
			if (!isNil(stakingInfo) && stepperTransactions?.length > 0) {
				const _transactions = [];
				const substrateControllerId = encodeAddress(
					decodeAddress(stakingInfo?.controllerId),
					42
				);
				if (stepperTransactions.length > 1) {
					if (isLedger) {
						if (stepperTransactions[stepperIndex].transactionType === "chill") {
							_transactions.push(apiInstance.tx.staking.chill());
							setIsLast(false);
						} else {
							_transactions.push(
								apiInstance.tx.staking.unbond(
									stepperTransactions[stepperIndex].amount
								)
							);
							setIsLast(true);
						}
					} else {
						_transactions.push(
							apiInstance.tx.staking.chill(),
							apiInstance.tx.staking.unbond(
								stepperTransactions[stepperIndex].amount
							)
						);
						setIsLast(true);
					}
				} else {
					_transactions.push(
						apiInstance.tx.staking.unbond(
							stepperTransactions[stepperIndex].amount
						)
					);
					setIsLast(true);
				}
				const fee =
					_transactions.length > 1
						? await apiInstance.tx.utility
								.batchAll(_transactions)
								.paymentInfo(substrateControllerId)
						: await _transactions[0].paymentInfo(substrateControllerId);

				setTransactions([..._transactions]);
				setInjectorAccount(substrateControllerId);
				setTransactionFee(() => fee.partialFee.toNumber());
			}
		}, [stepperTransactions, stepperIndex, isLedger]);

		useEffect(() => {
			if (
				currentStep === 1 &&
				stakingInfo?.stakingLedger.active /
					Math.pow(10, networkInfo.decimalPlaces) -
					amount >
					minPossibleStake
			) {
				setCurrentStep(2);
			}
		}, [currentStep]);

		return (
			<Modal
				isOpen={true}
				onClose={close}
				isCentered
				closeOnOverlayClick={closeOnOverlayClick}
				closeOnEsc={closeOnOverlayClick}
				size={currentStep == 0 ? "md" : "xl"}
			>
				<ModalOverlay />
				<ModalContent rounded="lg">
					{/* {!updatingFunds && !processComplete && !chainError && (
						<ModalHeader>
							<h1>{title}</h1>
						</ModalHeader>
					)} */}
					{closeOnOverlayClick && (
						<ModalCloseButton
							onClick={handlePopoverClose}
							boxShadow="0 0 0 0 #fff"
							color="gray.400"
							backgroundColor="gray.100"
							rounded="1rem"
							mt={4}
							mr={4}
						/>
					)}
					<ModalBody px="2rem">
						<div className="w-full h-full">
							{currentStep == 0 && !processComplete && !chainError && (
								<>
									<div className="flex flex-col">
										<h3 className="mt-4 text-2xl text-gray-700 font-semibold">
											Withdraw
										</h3>
										<div className="flex-center w-full h-full">
											<div className="mt-10 w-full">
												{amount >
												stakingInfo?.stakingLedger.active /
													Math.pow(10, networkInfo.decimalPlaces) ? (
													<div className="rounded-lg px-5 py-2 text-sm bg-red-200 text-red-600 mb-4">
														<span>
															You cannot withdraw this amount as it exceeds your
															current investment value.{" "}
														</span>
													</div>
												) : (
													stakingInfo?.stakingLedger.active /
														Math.pow(10, networkInfo.decimalPlaces) -
														amount <
														minPossibleStake &&
													stakingInfo?.stakingLedger.active /
														Math.pow(10, networkInfo.decimalPlaces) !==
														amount && (
														<div className="rounded-lg px-5 py-2 text-sm bg-yellow-200 text-yellow-600 mb-4">
															<span>
																We recommend you to select the max option to
																unbond all.{" "}
															</span>
															<Popover trigger="hover" usePortal>
																<PopoverTrigger>
																	<span className="underline cursor-help">
																		Why?
																	</span>
																</PopoverTrigger>
																<PopoverContent
																	zIndex={99999}
																	_focus={{ outline: "none" }}
																	bg="gray.700"
																	border="none"
																>
																	<PopoverArrow />
																	<PopoverBody>
																		<span className="text-white text-xs">
																			After withdrawing the remaining bonded
																			amount will be less than{" "}
																			{minPossibleStake} {networkInfo.denom},
																			the minimum staking threshold mandated by
																			the {networkInfo.name} network and you
																			won't remain a part of the elected network
																			and thus you won't be receiving any
																			rewards for the bonded amount.
																		</span>
																	</PopoverBody>
																</PopoverContent>
															</Popover>
														</div>
													)
												)}
												<div className="flex justify-between">
													<span className="text-gray-700 text-xs">
														I want to withdraw
													</span>
													<span className="text-gray-700 text-xxs mt-2">
														Current Investment:{" "}
														{formatCurrency.methods.formatAmount(
															stakingInfo.stakingLedger.active,
															networkInfo
														)}
													</span>
												</div>
												<div className="flex flex-col">
													<AmountInput
														bonded={
															stakingInfo.stakingLedger.active /
															Math.pow(10, networkInfo.decimalPlaces)
														}
														value={{
															currency: amount,
															subCurrency: subCurrency,
														}}
														networkInfo={networkInfo}
														availableBalance={
															balance.availableBalance /
															Math.pow(10, networkInfo.decimalPlaces)
														}
														totalUnbonding={totalUnbonding}
														totalUnbondingFiat={totalUnbondingFiat}
														type={type}
														onChange={setAmount}
													/>
												</div>
											</div>
										</div>
										<div className="flex-center">
											<button
												className={`rounded-full font-medium px-12 py-3 ${
													calculationDisabled
														? "bg-gray-700 opacity-25 cursor-not-allowed"
														: "bg-teal-500 opacity-100 cursor-pointer"
												} mt-40 mb-40 text-white`}
												onClick={handleOnClickProceed}
												disabled={calculationDisabled}
												// isLoading={updatingFunds}
											>
												Proceed
											</button>
										</div>
									</div>
								</>
							)}
							{currentStep === 1 &&
								!updatingFunds &&
								!processComplete &&
								!chainError && (
									<IdentifyWallet
										setIsLedger={setIsLedger}
										setCurrentStep={setCurrentStep}
									/>
								)}
							{currentStep === 2 &&
							!updatingFunds &&
							!processComplete &&
							!chainError &&
							isLedger &&
							stepperTransactions?.length > 1 ? (
								<StepperSigning
									amount={amount}
									subCurrency={subCurrency}
									type={type}
									stashId={selectedAccount?.address}
									stakingInfo={stakingInfo}
									networkInfo={networkInfo}
									api={apiInstance}
									stepperTransactions={stepperTransactions}
									currentStep={stepperIndex}
									onConfirm={onConfirm}
									transactionFee={transactionFee}
								/>
							) : (
								currentStep === 2 &&
								!updatingFunds &&
								!processComplete && (
									<AmountConfirmation
										amount={amount}
										subCurrency={subCurrency}
										type={type}
										stashId={selectedAccount?.address}
										stakingInfo={stakingInfo}
										networkInfo={networkInfo}
										api={apiInstance}
										onConfirm={onConfirm}
										transactionFee={transactionFee}
									/>
								)
							)}
							{updatingFunds && !processComplete && !chainError && (
								<div className="grid grid-rows-2 gap-2 h-96 items-center justify-content justify-center">
									<div className="w-full h-full flex justify-center items-end">
										<span
											className={`loader ${
												!isNil(isSuccessful) &&
												(isSuccessful ? "success" : "fail")
											}`}
										></span>
									</div>
									<div className="w-full max-w-sm flex flex-col items-center h-full justify-between">
										<div className="flex flex-col items-center text-center">
											<p className="text-gray-700 mt-4">{stakingEvent}</p>
										</div>
									</div>
								</div>
							)}
							{processComplete && (
								<SuccessfullyBonded
									transactionHash={transactionHash}
									onConfirm={handleOnClickForSuccessfulTransaction}
									networkInfo={networkInfo}
								/>
							)}
							{chainError && (
								<ChainErrorPage
									transactionHash={transactionHash}
									onConfirm={handleOnClickForSuccessfulTransaction}
									errMessage={errMessage}
								/>
							)}
						</div>
					</ModalBody>
				</ModalContent>
			</Modal>
		);
	}
);

export default WithdrawModal;
