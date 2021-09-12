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
} from "@chakra-ui/core";
import withSlideIn from "@components/common/withSlideIn";
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";
import RiskTag from "@components/reward-calculator/RiskTag";
import { random, get, noop, isNil } from "lodash";
import calculateReward from "@lib/calculate-reward";
import formatCurrency from "@lib/format-currency";
import updateFunds from "@lib/polkadot/update-funds";
import { usePolkadotApi, useAccounts, useCoinGeckoPriceUSD } from "@lib/store";
import { ExternalLink } from "react-feather";
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

const ReBondModal = withSlideIn(
	({
		styles,
		type = "rebond",
		apiInstance,
		close,
		nominations,
		selectedAccount,
		balance,
		stakingInfo,
		networkInfo,
		minPossibleStake,
		controllerAccount,
		controllerBalances,
		isSameStashController,
	}) => {
		const toast = useToast();
		const { coinGeckoPriceUSD } = useCoinGeckoPriceUSD();
		const [currentStep, setCurrentStep] = useState(0);
		const [amount, setAmount] = useState(0);
		const [subCurrency, setSubCurrency] = useState(0);
		const [updatingFunds, setUpdatingFunds] = useState(false);
		const [stakingEvent, setStakingEvent] = useState();
		const [processComplete, setProcessComplete] = useState(false);
		const [chainError, setChainError] = useState(false);
		const [transactions, setTransactions] = useState(null);
		const [injectorAccount, setInjectorAccount] = useState(null);
		const [transactionFee, setTransactionFee] = useState(0);
		const [totalUnbonding, setTotalUnbonding] = useState();
		const [totalUnbondingFiat, setTotalUnbondingFiat] = useState();
		const [transactionHash, setTransactionHash] = useState(null);
		const [isSuccessful, setIsSuccessful] = useState(null);
		const [closeOnOverlayClick, setCloseOnOverlayClick] = useState(true);
		const [calculationDisabled, setCalculationDisabled] = useState(true);

		const [totalStakingAmount, setTotalStakingAmount] = useState(
			() =>
				stakingInfo.stakingLedger.active /
				Math.pow(10, networkInfo.decimalPlaces)
		);

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
					console.error("unable to update transaction info");
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
		}, [amount, totalStakingAmount]);

		useEffect(() => {
			if (isNil(amount) || isNaN(amount) || amount <= 0 || amount === "") {
				setCalculationDisabled(true);
			} else if (
				amount > totalUnbonding / Math.pow(10, networkInfo.decimalPlaces) ||
				stakingInfo?.stakingLedger.active /
					Math.pow(10, networkInfo.decimalPlaces) +
					amount <
					minPossibleStake
			) {
				setCalculationDisabled(true);
			} else if (
				controllerAccount &&
				controllerBalances &&
				transactionFee +
					apiInstance?.consts.balances.existentialDeposit.toNumber() >
					controllerBalances.availableBalance
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
						track(goalCodes.OVERVIEW.REBOND_SUCCESSFUL);
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
						setIsSuccessful(true);
						setStakingEvent("Rebonding successful!");
						setTimeout(() => {
							setProcessComplete(true);
							setUpdatingFunds(false);
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
							track(goalCodes.OVERVIEW.REBOND_UNSUCCESSFUL);
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
							setIsSuccessful(false);
							setStakingEvent("Rebonding failed!");
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

		useEffect(() => {
			if (stakingInfo?.unlocking && !stakingInfo?.unlocking?.isEmpty) {
				const total = stakingInfo.unlocking.reduce((a, b) => a + b.value, 0);
				setTotalUnbonding(total);
				setTotalUnbondingFiat(
					(total / Math.pow(10, networkInfo.decimalPlaces)) * coinGeckoPriceUSD
				);
			} else {
				setTotalUnbonding(null);
				setTotalUnbondingFiat(null);
			}
		}, [stakingInfo?.unlocking, coinGeckoPriceUSD]);

		useEffect(async () => {
			if (!isNil(stakingInfo)) {
				setTransactions(null);
				setInjectorAccount(null);
				const substrateControllerId = encodeAddress(
					decodeAddress(stakingInfo?.controllerId),
					42
				);

				const rawAmount = Math.trunc(
					amount * Math.pow(10, networkInfo.decimalPlaces)
				);

				const _transactions = [];

				_transactions.push(apiInstance.tx.staking.rebond(rawAmount));

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
		}, [amount]);

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
											Rebond
										</h3>
										{isNil(totalUnbonding) ? (
											<div className="flex w-full h-full loader"></div>
										) : (
											<div className="flex-center w-full h-full">
												<div className="mt-10 w-full">
													{totalStakingAmount < minPossibleStake ? (
														<div className="rounded-lg px-5 py-2 text-sm bg-red-200 text-red-600 mb-4">
															<span>
																We cannot stake this amount because your total
																combined stake does not cross the{" "}
																{minPossibleStake} {networkInfo.denom} minimum
																staking threshold mandated by the{" "}
																{networkInfo.name} network or the free balance
																in your account falls below the recommended
																minimum of {networkInfo.reserveAmount / 2}{" "}
																{networkInfo.denom}.{" "}
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
																				The recommended minimum{" "}
																				{networkInfo.reserveAmount / 2}{" "}
																				{networkInfo.denom} account balance is
																				to ensure that you have a decent amount
																				of funds in your account to pay
																				transaction fees for claiming rewards,
																				unbonding funds, changing on-chain
																				staking preferences, etc.
																			</span>
																		</PopoverBody>
																	</PopoverContent>
																</Popover>
															</span>
														</div>
													) : amount >
													  totalUnbonding /
															Math.pow(10, networkInfo.decimalPlaces) ? (
														<div className="rounded-lg px-5 py-2 text-sm bg-red-200 text-red-600 mb-4">
															<span>
																We cannot rebond this amount since its greater
																than the total unbonding amount.
															</span>
														</div>
													) : (
														controllerAccount &&
														controllerBalances &&
														transactionFee +
															apiInstance?.consts.balances.existentialDeposit.toNumber() >
															controllerBalances.availableBalance && (
															<div className="rounded-lg px-5 py-2 text-sm bg-red-200 text-red-600 mb-4">
																<span>
																	{isSameStashController
																		? "Account "
																		: "Controller "}
																	Balance insufficient to pay transaction fees.
																</span>
															</div>
														)
													)}
													<div className="flex justify-between">
														<span className="text-gray-700 text-xs">
															I want to rebond
														</span>
														<span className="text-gray-700 text-xxs mt-2">
															Unbonding Amount:{" "}
															{formatCurrency.methods.formatAmount(
																totalUnbonding,
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
															totalUnbonding={
																totalUnbonding /
																Math.pow(10, networkInfo.decimalPlaces)
															}
															totalUnbondingFiat={totalUnbondingFiat}
															type={type}
															onChange={setAmount}
														/>
													</div>
												</div>
											</div>
										)}
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

export default ReBondModal;
