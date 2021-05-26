import { ArrowRight } from "react-feather";
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalBody,
	ModalCloseButton,
	Divider,
	useToast,
	Spinner,
} from "@chakra-ui/core";
import formatCurrency from "@lib/format-currency";
import { useEffect, useState } from "react";
import { useCoinGeckoPriceUSD } from "@lib/store";
import getRedeemUnbondedFee from "@lib/getRedeemUnbondedFee";
import withSlideIn from "@components/common/withSlideIn";
import ChainErrorPage from "@components/overview/ChainErrorPage";
import SuccessfullyBonded from "@components/overview/SuccessfullyBonded";
import redeemUnbonded from "@lib/polkadot/redeemUnbonded";

const RedeemUnbonded = withSlideIn(
	({
		isOpen,
		close,
		api,
		toggle,
		redeemableBalance,
		stakingInfo,
		selectedAccount,
		networkInfo,
	}) => {
		const toast = useToast();
		const { coinGeckoPriceUSD } = useCoinGeckoPriceUSD();
		const [transactionFee, setTransactionFee] = useState(0);
		const [subFeeCurrency, setSubFeeCurrency] = useState(0);
		const [totalAmount, setTotalAmount] = useState(0);
		const [currentStep, setCurrentStep] = useState(0);
		const [totalAmountFiat, setTotalAmountFiat] = useState(0);
		const [redeemableBalanceFiat, setRedeemableBalanceFiat] = useState();
		const [updatingFunds, setUpdatingFunds] = useState(false);
		const [chainError, setChainError] = useState(false);
		const [stakingEvent, setStakingEvent] = useState();
		const [errMessage, setErrMessage] = useState();
		const [transactionHash, setTransactionHash] = useState();
		const [closeOnOverlayClick, setCloseOnOverlayClick] = useState(true);
		const [processComplete, setProcessComplete] = useState(false);

		const { address } = selectedAccount;
		useEffect(() => {
			if (!transactionFee) {
				getRedeemUnbondedFee(address, api, networkInfo).then((data) => {
					setTransactionFee(data);
				});
			}
		}, [selectedAccount, networkInfo]);

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
			if (redeemableBalance) {
				setRedeemableBalanceFiat(
					(redeemableBalance / Math.pow(10, networkInfo.decimalPlaces)) *
						coinGeckoPriceUSD
				);
			}
		}, [redeemableBalance]);

		// useEffect(() => {
		// 	if (!totalAmount) {
		// 		type === "bond"
		// 			? setTotalAmount(amount + bondedAmount.currency)
		// 			: setTotalAmount(bondedAmount.currency - amount);
		// 	}
		// }, [amount, bondedAmount]);

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
						// updateTransactionData(
						// 	selectedAccount.address,
						// 	networkInfo.coinGeckoDenom,
						// 	get(bondedAmount, "currency", 0),
						// 	type == "bond"
						// 		? get(bondedAmount, "currency", 0) + amount
						// 		: get(bondedAmount, "currency", 0) - amount,
						// 	tranHash,
						// 	true
						// );
						setProcessComplete(true);
						setUpdatingFunds(false);
						setCloseOnOverlayClick(true);
					} else {
						setUpdatingFunds(false);
						setCloseOnOverlayClick(true);
						setErrMessage(message);
						if (message !== "Cancelled") {
							// updateTransactionData(
							// 	selectedAccount.address,
							// 	networkInfo.coinGeckoDenom,
							// 	get(bondedAmount, "currency", 0),
							// 	type == "bond"
							// 		? get(bondedAmount, "currency", 0) + amount
							// 		: get(bondedAmount, "currency", 0) - amount,
							// 	tranHash,
							// 	false
							// );
							setChainError(true);
						}
					}
				},
			};
			redeemUnbonded(selectedAccount.address, api, handlers, networkInfo).catch(
				(error) => {
					handlers.onFinish(1, error.message);
				}
			);
		};

		const handlePopoverClose = () => {
			close();
		};
		const handleOnClickForSuccessfulTransaction = () => {
			close();
		};

		return (
			<Modal
				isOpen={true}
				onClose={handlePopoverClose}
				isCentered
				closeOnOverlayClick={closeOnOverlayClick}
				closeOnEsc={closeOnOverlayClick}
				size="md"
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
						<div className="flex flex-col">
							{!updatingFunds && !processComplete && !chainError && (
								<>
									<h3 className="mt-4 text-2xl">Confirmation</h3>
									<div className="w-full mt-8">
										<div className="flex justify-between">
											<p className="text-gray-700 text-xs">Redeemable Amount</p>
											<div className="flex flex-col">
												<p className="text-sm text-right">
													{formatCurrency.methods.formatAmount(
														Math.trunc(redeemableBalance),
														networkInfo
													)}
												</p>
												<p className="text-xs text-right text-gray-600">
													${Number(redeemableBalanceFiat).toFixed(2)}
												</p>
											</div>
										</div>
										<div className="flex justify-between mt-4">
											<p className="text-gray-700 text-xs">Transaction Fee</p>

											<div className="flex flex-col">
												{transactionFee !== 0 ? (
													<div>
														<p className="text-sm text-right">
															{formatCurrency.methods.formatAmount(
																Math.trunc(transactionFee),
																networkInfo
															)}
														</p>
														<p className="text-xs text-right text-gray-600">
															${subFeeCurrency.toFixed(2)}
														</p>
													</div>
												) : (
													<Spinner />
												)}
											</div>
										</div>
									</div>
									<div className="w-full flex-center">
										<button
											className="rounded-full font-medium px-12 py-3 bg-teal-500 mt-40 mb-40 text-white"
											onClick={onConfirm}
										>
											Confirm
										</button>
									</div>
								</>
							)}
							{updatingFunds && !processComplete && !chainError && (
								<div className="mt-6">
									<div className="flex items-center justify-between">
										<span>{stakingEvent}</span>
										<Spinner className="ml-4" />
									</div>
								</div>
							)}
							{processComplete && (
								<SuccessfullyBonded
									transactionHash={transactionHash}
									onConfirm={handleOnClickForSuccessfulTransaction}
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

export default RedeemUnbonded;
