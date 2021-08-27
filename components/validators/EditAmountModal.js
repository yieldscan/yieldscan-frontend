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
import LowBalanceAlert from "@components/reward-calculator/LowBalanceAlert";

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
		controllerUnavailable,
		controllerBalances,
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
							{selectedAccount && balances && stakingInfo && (
								<LowBalanceAlert
									amount={amount}
									activeBondedAmount={activeBondedAmount}
									networkInfo={networkInfo}
									totalPossibleStakingAmount={totalPossibleStakingAmount}
									totalAvailableStakingAmount={totalAvailableStakingAmount}
									minPossibleStake={minPossibleStake}
									controllerUnavailable={controllerUnavailable}
									controllerAvailableAmount={
										controllerBalances
											? (parseInt(controllerBalances?.availableBalance) -
													apiInstance?.consts.balances.existentialDeposit.toNumber()) /
											  Math.pow(10, networkInfo.decimalPlaces)
											: null
									}
								/>
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
