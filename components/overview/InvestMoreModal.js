import { useState, useEffect } from "react";
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalBody,
	ModalCloseButton,
	Spinner,
	useToast,
	Popover,
	PopoverTrigger,
	PopoverContent,
	PopoverArrow,
	PopoverBody,
	Divider,
} from "@chakra-ui/core";
import { NextButton } from "@components/common/BottomButton";
import { HelpPopover } from "@components/reward-calculator";
import withSlideIn from "@components/common/withSlideIn";
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";
import { isNil } from "lodash";
import formatCurrency from "@lib/format-currency";
import { useCoinGeckoPriceUSD } from "@lib/store";
import { ArrowRight, Check } from "react-feather";
import ChainErrorPage from "@components/overview/ChainErrorPage";
import SuccessfullyBonded from "@components/overview/SuccessfullyBonded";
import AmountInput from "./AmountInput";
import axios from "@lib/axios";
import AmountConfirmation from "./AmountConfirmation";
import { track, goalCodes } from "@lib/analytics";
import signAndSend from "@lib/signAndSend";
import Image from "next/image";

const BondExtra = ({
	amount,
	subCurrency,
	stakingInfo,
	networkInfo,
	transactionFee,
}) => {
	const { coinGeckoPriceUSD } = useCoinGeckoPriceUSD();
	const [subFeeCurrency, setSubFeeCurrency] = useState();
	const [totalAmount, setTotalAmount] = useState(0);
	const [totalAmountFiat, setTotalAmountFiat] = useState(0);

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
			setTotalAmount(
				amount +
					stakingInfo.stakingLedger.active /
						Math.pow(10, networkInfo.decimalPlaces)
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
			<div className="w-full mt-8">
				<div className="flex justify-between">
					<p className="text-gray-700 text-xs">Additional Investment Amount</p>
					<div className="flex flex-col">
						<p className="text-sm text-right">
							{formatCurrency.methods.formatAmount(
								Math.trunc(amount * 10 ** networkInfo.decimalPlaces),
								networkInfo
							)}
						</p>
						<p className="text-xs text-right text-gray-600">
							${Number(amount * coinGeckoPriceUSD).toFixed(2)}
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
								{formatCurrency.methods.formatAmount(
									Math.trunc(amount * 10 ** networkInfo.decimalPlaces) +
										transactionFee,
									networkInfo
								)}
							</p>
							{!isNil(subFeeCurrency) && (
								<p className="text-sm text-right text-gray-600 font-medium">
									${(subCurrency + subFeeCurrency).toFixed(2)}
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

const YieldScanFees = ({
	networkInfo,
	transactionFee,
	ysFees,
	currentDate,
	lastDiscountDate,
	isExistingUser,
}) => (
	<div className="w-full flex flex-col space-x-2">
		<div className="flex justify-between p-2">
			<div className="text-xs text-gray-700 flex items-center">
				{ysFees !== 0 && (
					<div className="text-xs text-gray-700 flex items-center">
						<p>
							Yieldscan Fee{" "}
							{isExistingUser && currentDate <= lastDiscountDate && "(50% off)"}
						</p>
						<HelpPopover
							content={
								<p className="text-xs text-white">
									This fee is used to pay for the costs of building and running
									Yieldscan. Its charged on the amount by which your stake is
									being increased.{" "}
									{isExistingUser && currentDate <= lastDiscountDate && (
										<span className="font-semibold">
											You have been given a 50% discount because you staked with
											Yieldscan on or before 15th September 2021.{" "}
										</span>
									)}
								</p>
							}
						/>
					</div>
				)}
			</div>
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
							This fee is used to pay for the resources used for processing the
							transaction on the blockchain network.
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
							Math.trunc(transactionFee + ysFees),
							networkInfo
						)}
					</p>
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
	ysFees,
	currentDate,
	lastDiscountDate,
	isExistingUser,
}) => {
	return (
		<div className="w-full flex flex-col justify-center items-center space-y-4 p-4">
			<h1 className="w-full text-xl text-center text-gray-700 font-semibold p-2">
				Invest More
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
							{currentStep <= index ? (
								<div
									className={`h-8 w-8 border-2 ${
										index === currentStep
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
								currentStep + 1 <= index ? "text-gray-500" : "text-teal-500"
							} ${currentStep !== index + 1 && "font-light"} `}
						>
							{a?.transactionHeading}
						</p>
					</div>
				))}
			</div>
			{stepperTransactions[currentStep]?.transactionType === "bondExtra" ? (
				<BondExtra
					amount={amount}
					subCurrency={subCurrency}
					stashId={stashId}
					stakingInfo={stakingInfo}
					networkInfo={networkInfo}
					transactionFee={transactionFee}
				/>
			) : (
				<YieldScanFees
					networkInfo={networkInfo}
					transactionFee={transactionFee}
					ysFees={ysFees}
					currentDate={currentDate}
					lastDiscountDate={lastDiscountDate}
					isExistingUser={isExistingUser}
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

const InvestMoreModal = withSlideIn(
	({
		type = "bond",
		apiInstance,
		close,
		selectedAccount,
		balance,
		stakingInfo,
		networkInfo,
		minPossibleStake,
		ysFees,
		setYsFees,
		controllerAccount,
		isExistingUser,
		lastDiscountDate,
	}) => {
		const toast = useToast();
		const { coinGeckoPriceUSD } = useCoinGeckoPriceUSD();
		const [currentStep, setCurrentStep] = useState(0);
		const [amount, setAmount] = useState(0);
		const [subCurrency, setSubCurrency] = useState(0);
		const [updatingFunds, setUpdatingFunds] = useState(false);
		const [stakingEvent, setStakingEvent] = useState();
		const [processComplete, setProcessComplete] = useState(false);
		const [stepperTransactions, setStepperTransactions] = useState(null);
		const [stepperIndex, setStepperIndex] = useState(0);
		const [isLedger, setIsLedger] = useState(false);
		const [chainError, setChainError] = useState(false);
		const [transactions, setTransactions] = useState(null);
		const [injectorAccount, setInjectorAccount] = useState(null);
		const [transactionFee, setTransactionFee] = useState(0);
		const [totalUnbonding] = useState();
		const [totalUnbondingFiat] = useState();
		const [transactionHash, setTransactionHash] = useState(null);
		const [isSuccessful, setIsSuccessful] = useState(null);
		const [closeOnOverlayClick, setCloseOnOverlayClick] = useState(true);
		const [calculationDisabled, setCalculationDisabled] = useState(true);
		const [isLast, setIsLast] = useState(true);
		const [totalStakingAmount, setTotalStakingAmount] = useState(
			() =>
				stakingInfo.stakingLedger.active /
				Math.pow(10, networkInfo.decimalPlaces)
		);

		const [errMessage, setErrMessage] = useState();
		const [currentDate, setCurrentDate] = useState(null);
		const [stepperTransactBondExtraHash, setStepperTransactBondExtraHash] =
			useState(null);

		const updateTransactionData = (
			stashId,
			controllerId,
			injectorId,
			transactionType,
			sourcePage,
			walletType,
			ysFees,
			ysFeesAddress,
			ysFeesRatio,
			ysFeesPaid,
			network,
			alreadyBonded,
			stake,
			transactionHash,
			successful
		) => {
			axios
				.put(`${networkInfo.network}/user/transaction/update`, {
					stashId: stashId,
					controllerId: controllerId,
					injectorId: injectorId,
					transactionType: transactionType,
					sourcePage: sourcePage,
					walletType: walletType,
					ysFees: ysFees,
					ysFeesAddress: ysFeesAddress,
					ysFeesRatio: ysFeesRatio,
					ysFeesPaid: ysFeesPaid,
					network: network,
					alreadyBonded: alreadyBonded,
					stake: stake,
					transactionHash: transactionHash,
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
				amount >
					balance.availableBalance / Math.pow(10, networkInfo.decimalPlaces) -
						networkInfo.reserveAmount / 2 +
						ysFees ||
				stakingInfo?.stakingLedger.active /
					Math.pow(10, networkInfo.decimalPlaces) +
					amount <
					minPossibleStake
			) {
				setCalculationDisabled(true);
			} else setCalculationDisabled(false);
		}, [amount]);

		useEffect(() => {
			if (networkInfo?.feesEnabled && isExistingUser !== null) {
				setCurrentDate(() => new Date().getTime());

				if (isExistingUser && currentDate <= lastDiscountDate) {
					setYsFees(() =>
						Math.trunc(
							amount *
								networkInfo.feesRatio *
								Math.pow(10, networkInfo.decimalPlaces) *
								0.5
						)
					);
				} else {
					setYsFees(() =>
						Math.trunc(
							amount *
								networkInfo.feesRatio *
								Math.pow(10, networkInfo.decimalPlaces)
						)
					);
				}
			} else setYsFees(0);
		}, [networkInfo, amount, isExistingUser]);

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
						track(goalCodes.OVERVIEW.BOND_EXTRA_SUCCESSFUL);
						updateTransactionData(
							selectedAccount?.address,
							controllerAccount?.address,
							selectedAccount?.address,
							isLedger
								? stepperTransactions[stepperIndex]["transactionType"]
								: stepperTransactions.length === 1
								? stepperTransactions[0]["transactionType"]
								: "batchAll-" +
								  stepperTransactions
										.map((transaction) => transaction.transactionType)
										.join("-"),
							"overview",
							isLedger ? "ledger" : "polkadotjs",
							ysFees > 0 &&
								networkInfo?.feesAddress &&
								(stepperTransactions[stepperIndex]["transactionType"] ==
									"yieldscanFees" ||
									!isLedger)
								? ysFees / Math.pow(10, networkInfo.decimalPlaces)
								: 0,
							ysFees > 0 &&
								networkInfo?.feesAddress &&
								(stepperTransactions[stepperIndex]["transactionType"] ==
									"yieldscanFees" ||
									!isLedger)
								? networkInfo?.feesAddress
								: "null",
							ysFees > 0 &&
								networkInfo?.feesAddress &&
								(stepperTransactions[stepperIndex]["transactionType"] ==
									"yieldscanFees" ||
									!isLedger)
								? networkInfo?.feesRatio
								: 0,
							ysFees > 0 &&
								networkInfo?.feesAddress &&
								(stepperTransactions[stepperIndex]["transactionType"] ==
									"yieldscanFees" ||
									!isLedger)
								? true
								: false,
							networkInfo.network,
							stakingInfo.stakingLedger.active /
								Math.pow(10, networkInfo.decimalPlaces),
							stakingInfo.stakingLedger.active /
								Math.pow(10, networkInfo.decimalPlaces) +
								amount,
							tranHash,
							true
						);
						if (
							stepperTransactions[stepperIndex]["transactionType"] ==
							"bondExtra"
						) {
							setStepperTransactBondExtraHash(tranHash);
						}
						if (
							stepperTransactions[stepperIndex]["transactionType"] ==
							"yieldscanFees"
						) {
							axios
								.put(
									`${networkInfo.network}/user/transaction/update-fees-status`,
									{
										network: networkInfo.network,
										transactionHash: stepperTransactBondExtraHash,
										ysFees: ysFees / Math.pow(10, networkInfo.decimalPlaces),
										ysFeesAddress: networkInfo?.feesAddress,
										ysFeesRatio: networkInfo?.feesRatio,
										ysFeesPaid: true,
									}
								)
								.then(() => {
									console.info(
										"successfully updated the bondExtra transaction with yieldscan fees info"
									);
								})
								.catch((e) => {
									console.error(e);
									console.error(
										"unable to update the ysFeesPaid status in bondExtra transaction"
									);
								});
						}
						setIsSuccessful(true);
						setStakingEvent(
							isLast
								? "Investing more successful!"
								: "Successfull! Please pay Yieldscan Fees now."
						);
						setTimeout(() => {
							if (isLast) {
								setProcessComplete(true);
							} else setStepperIndex(1);
							setUpdatingFunds(false);
							setIsSuccessful(null);
							setCloseOnOverlayClick(true);
						}, 5000);
					} else {
						if (message === "Cancelled") {
							setUpdatingFunds(false);
							setCloseOnOverlayClick(true);
							setErrMessage(message);
						}
						if (message !== "Cancelled") {
							track(goalCodes.OVERVIEW.BOND_EXTRA_UNSUCCESSFUL);
							updateTransactionData(
								selectedAccount?.address,
								controllerAccount?.address,
								selectedAccount?.address,
								isLedger
									? stepperTransactions[stepperIndex]["transactionType"]
									: stepperTransactions.length === 1
									? stepperTransactions[0]["transactionType"]
									: "batchAll-" +
									  stepperTransactions
											.map((transaction) => transaction.transactionType)
											.join("-"),
								"/overview",
								isLedger ? "ledger" : "polkadotjs",
								ysFees > 0 &&
									networkInfo?.feesAddress &&
									(stepperTransactions[stepperIndex]["transactionType"] ==
										"yieldscanFees" ||
										!isLedger)
									? ysFees / Math.pow(10, networkInfo.decimalPlaces)
									: 0,
								ysFees > 0 &&
									networkInfo?.feesAddress &&
									(stepperTransactions[stepperIndex]["transactionType"] ==
										"yieldscanFees" ||
										!isLedger)
									? networkInfo?.feesAddress
									: "null",
								ysFees > 0 &&
									networkInfo?.feesAddress &&
									(stepperTransactions[stepperIndex]["transactionType"] ==
										"yieldscanFees" ||
										!isLedger)
									? networkInfo?.feesRatio
									: 0,
								false,
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
				const substrateStashId = encodeAddress(
					decodeAddress(selectedAccount?.address),
					42
				);

				const rawAmount = Math.trunc(
					amount * Math.pow(10, networkInfo.decimalPlaces)
				);

				const _transactions = [];

				_transactions.push({
					transactionType: "bondExtra",
					transactionHeading: "Lock funds",
					injectorAccount: substrateStashId,
					substrateStashId: substrateStashId,
					stakingAmount: rawAmount,
				});

				if (
					ysFees > 0 &&
					networkInfo?.feesEnabled &&
					networkInfo?.feesAddress
				) {
					_transactions.push({
						transactionType: "yieldscanFees",
						transactionHeading: "Pay Yieldscan Fees",
						injectorAccount: substrateStashId,
						ysFees: ysFees,
						substrateControllerId: substrateStashId,
					});
				}

				setStepperTransactions([..._transactions]);
			}
		}, [amount, ysFees]);

		useEffect(async () => {
			setTransactions(null);
			setTransactionFee(0);
			setInjectorAccount(null);
			if (!isNil(stakingInfo) && stepperTransactions?.length > 0) {
				const _transactions = [];
				const substrateStashId = encodeAddress(
					decodeAddress(selectedAccount?.address),
					42
				);
				const rawAmount = Math.trunc(
					amount * Math.pow(10, networkInfo.decimalPlaces)
				);

				if (stepperTransactions.length > 1) {
					if (isLedger) {
						if (
							stepperTransactions[stepperIndex].transactionType === "bondExtra"
						) {
							_transactions.push(apiInstance.tx.staking.bondExtra(rawAmount));
							setIsLast(false);
						} else if (
							stepperTransactions[stepperIndex].transactionType ===
							"yieldscanFees"
						) {
							_transactions.push(
								apiInstance.tx.balances.transferKeepAlive(
									networkInfo.feesAddress,
									ysFees
								)
							);
							setIsLast(true);
						}
					} else {
						if (
							ysFees > 0 &&
							networkInfo?.feesEnabled &&
							networkInfo?.feesAddress
						) {
							_transactions.push(
								apiInstance.tx.staking.bondExtra(rawAmount),
								apiInstance.tx.balances.transferKeepAlive(
									networkInfo.feesAddress,
									ysFees
								)
							);
						} else {
							_transactions.push(
								apiInstance.tx.balances.transferKeepAlive(
									networkInfo.feesAddress,
									ysFees
								)
							);
						}
						setIsLast(true);
					}
				} else {
					_transactions.push(apiInstance.tx.staking.bondExtra(rawAmount));
					setIsLast(true);
				}
				const fee =
					_transactions.length > 1
						? await apiInstance.tx.utility
								.batchAll(_transactions)
								.paymentInfo(substrateStashId)
						: await _transactions[0].paymentInfo(substrateStashId);

				setTransactions([..._transactions]);
				setInjectorAccount(substrateStashId);
				setTransactionFee(() => fee.partialFee.toNumber());
			}
		}, [stepperTransactions, stepperIndex, isLedger]);

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
											Invest more
										</h3>
										<div className="flex-center w-full h-full">
											<div className="mt-10 w-full">
												{totalStakingAmount < minPossibleStake ? (
													<div className="rounded-lg px-5 py-2 text-sm bg-red-200 text-red-600 mb-4">
														<span>
															We cannot stake this amount because your total
															combined stake does not cross the{" "}
															{minPossibleStake} {networkInfo.denom} minimum
															staking threshold mandated by the{" "}
															{networkInfo.name} network or the free balance in
															your account falls below the recommended minimum
															of {networkInfo.reserveAmount / 2}{" "}
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
																			The recommended minimum of{" "}
																			{networkInfo.reserveAmount / 2}{" "}
																			{networkInfo.denom} account balance is to
																			ensure that you have a decent amount of
																			funds in your account to pay transaction
																			fees for claiming rewards, unbonding
																			funds, changing on-chain staking
																			preferences, etc.
																		</span>
																	</PopoverBody>
																</PopoverContent>
															</Popover>
														</span>
													</div>
												) : (
													amount >
														balance?.availableBalance /
															Math.pow(10, networkInfo.decimalPlaces) -
															networkInfo.reserveAmount / 2 +
															ysFees && (
														<div className="rounded-lg px-5 py-2 text-sm bg-red-200 text-red-600 mb-4">
															<span>
																Insufficient Balance: We cannot stake this
																amount as it leaves you account balance too low.{" "}
															</span>
														</div>
													)
												)}
												<div className="flex justify-between">
													<span className="text-gray-700 text-xs">
														I want to invest additional funds of
													</span>
													<span className="text-gray-700 text-xxs mt-2">
														Available Balance:{" "}
														{formatCurrency.methods.formatAmount(
															balance?.availableBalance,
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
														isExistingUser={isExistingUser}
														currentDate={currentDate}
														lastDiscountDate={lastDiscountDate}
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
									ysFees={ysFees}
									currentDate={currentDate}
									lastDiscountDate={lastDiscountDate}
									isExistingUser={isExistingUser}
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
										ysFees={ysFees}
										isExistingUser={isExistingUser}
										currentDate={currentDate}
										lastDiscountDate={lastDiscountDate}
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

export default InvestMoreModal;
