import { useState, useEffect } from "react";
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalCloseButton,
	ModalBody,
	Alert,
	AlertTitle,
	AlertDescription,
	Popover,
	PopoverTrigger,
	PopoverContent,
	PopoverArrow,
	PopoverBody,
} from "@chakra-ui/core";
import AmountInput from "@components/reward-calculator/AmountInput";
import withSlideIn from "@components/common/withSlideIn";
import { isNil, get } from "lodash";
import { useCoinGeckoPriceUSD } from "@lib/store";
import formatCurrency from "@lib/format-currency";

const EditAmountModal = withSlideIn(
	({
		styles,
		onClose,
		accounts,
		selectedAccount,
		balances,
		stakingInfo,
		controllerAccount,
		amount = "",
		setAmount,
		networkInfo,
		trackRewardCalculatedEvent,
		minPossibleStake,
	}) => {
		const { coinGeckoPriceUSD } = useCoinGeckoPriceUSD();
		const [stakingAmount, setStakingAmount] = useState(() => amount);
		const [subCurrency, setSubCurrency] = useState(0);

		const onConfirm = () => {
			if (stakingInfo && stakingInfo?.stakingLedger?.active.isEmpty) {
				setAmount(stakingAmount);
			}
			if (!selectedAccount) {
				setAmount(stakingAmount);
			}
			onClose();
		};

		useEffect(() => {
			if (stakingInfo && !stakingInfo?.stakingLedger.active.isEmpty) {
				setStakingAmount(
					parseInt(stakingInfo?.stakingLedger.active) /
						Math.pow(10, networkInfo.decimalPlaces)
				);
			}
		}, [stakingInfo]);

		useEffect(() => {
			stakingAmount
				? setSubCurrency(stakingAmount * coinGeckoPriceUSD)
				: setSubCurrency(0);
		}, [stakingAmount]);

		const activeBondedAmount =
			parseInt(get(stakingInfo, "stakingLedger.active", 0)) /
			Math.pow(10, networkInfo.decimalPlaces);

		const totalAvailableStakingAmount =
			parseInt(get(balances, "availableBalance", 0)) /
			Math.pow(10, networkInfo.decimalPlaces);

		const totalPossibleStakingAmount =
			activeBondedAmount + totalAvailableStakingAmount;

		const modalProceedDisabled =
			selectedAccount &&
			(stakingAmount > totalPossibleStakingAmount - networkInfo.reserveAmount ||
				stakingAmount < minPossibleStake);

		return (
			<Modal isOpen={true} onClose={onClose} isCentered>
				<ModalOverlay />
				<ModalContent rounded="lg" maxWidth="33rem" height="30rem" {...styles}>
					<ModalHeader>
						<h3 className="text-gray-700 font-normal text-2xl">
							Edit Staking Amount
						</h3>
					</ModalHeader>
					<ModalCloseButton onClick={onClose} />
					<ModalBody>
						<div className="mt-4">
							{selectedAccount &&
							stakingAmount >
								totalPossibleStakingAmount - networkInfo.reserveAmount ? (
								<Alert
									status="error"
									rounded="md"
									flex
									flexDirection="column"
									alignItems="start"
									my={4}
								>
									<AlertTitle color="red.500">
										<span className="text-base">Insufficient Balance</span>
									</AlertTitle>
									<AlertDescription color="red.500">
										<span className="text-sm">
											We cannot stake this amount since we recommend maintaining
											a minimum balance of {networkInfo.reserveAmount}{" "}
											{networkInfo.denom} in your account at all times.{" "}
										</span>
										<Popover trigger="hover" usePortal>
											<PopoverTrigger>
												<span className="underline cursor-help text-sm">
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
														This is to ensure that you have a decent amout of
														funds in your account to pay transaction fees for
														claiming rewards, unbonding funds, changing on-chain
														staking preferences, etc.
													</span>
												</PopoverBody>
											</PopoverContent>
										</Popover>
									</AlertDescription>
								</Alert>
							) : (
								selectedAccount &&
								stakingAmount < minPossibleStake && (
									<Alert
										status="error"
										rounded="md"
										flex
										flexDirection="column"
										alignItems="start"
										my={4}
									>
										<AlertTitle color="red.500">
											<span className="text-base">
												{activeBondedAmount > 0
													? "Current amount insufficient to stake anymore"
													: "Amount insufficient to begin staking"}
											</span>
										</AlertTitle>
										<AlertDescription color="red.500">
											<span className="text-sm">
												We cannot stake this amount as it does not cross the{" "}
												{minPossibleStake} {networkInfo.denom} minimum staking
												threshold mandated by the {networkInfo.name} network.{" "}
											</span>
										</AlertDescription>
									</Alert>
								)
							)}
							<div
								className="m-2 text-gray-600 text-sm"
								hidden={isNil(selectedAccount)}
							>
								Transferrable Balance:{" "}
								{balances &&
									formatCurrency.methods.formatAmount(
										balances?.availableBalance,
										networkInfo
									)}
							</div>
							<div className="my-5">
								<AmountInput
									value={{
										currency: parseFloat(stakingAmount),
										subCurrency: subCurrency,
									}}
									networkInfo={networkInfo}
									onChange={setStakingAmount}
									trackRewardCalculatedEvent={trackRewardCalculatedEvent}
									balances={balances}
									stakingInfo={stakingInfo}
								/>
							</div>
							<div className="">
								<button
									className={`bg-teal-500 text-white py-2 px-5 rounded
									${modalProceedDisabled ? "opacity-75 cursor-not-allowed" : "opacity-100"}
									`}
									onClick={onConfirm}
									disabled={modalProceedDisabled}
								>
									Confirm
								</button>
							</div>
						</div>
					</ModalBody>
				</ModalContent>
			</Modal>
		);
	}
);

export default EditAmountModal;
