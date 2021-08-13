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
		minPossibleStake
	}) => {
		const { coinGeckoPriceUSD } = useCoinGeckoPriceUSD();
		const [stakingAmount, setStakingAmount] = useState(() => amount);
		const [subCurrency, setSubCurrency] = useState(0);

		const onConfirm = () => {
			if (stakingInfo && stakingInfo?.stakingLedger?.active.isEmpty) {
				setAmount(stakingAmount);
			}
			if(!selectedAccount){
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
			setSubCurrency(stakingAmount * coinGeckoPriceUSD);
		}, [stakingAmount]);

		const activeBondedAmount =
			parseInt(get(stakingInfo, "stakingLedger.active", 0)) /
			Math.pow(10, networkInfo.decimalPlaces);

		const totalAvailableStakingAmount =
			parseInt(get(balances, "availableBalance", 0)) /
			Math.pow(10, networkInfo.decimalPlaces);

		const totalPossibleStakingAmount =
			activeBondedAmount + totalAvailableStakingAmount;

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
							{selectedAccount && stakingAmount < minPossibleStake + networkInfo.reserveAmount
							? (<Alert
									status="error"
									rounded="md"
									flex
									flexDirection="column"
									alignItems="start"
									my={4}
								>
									<AlertTitle color="red.500">
									{activeBondedAmount > 0
									? "Current amount insufficient to stake anymore"
									: "Amount insufficient to begin staking"}
									</AlertTitle>
									<AlertDescription color="red.500">
									You need an additional of {formatCurrency.methods
									.formatAmount(Math.trunc(Number(
									minPossibleStake + networkInfo.reserveAmount -
									stakingAmount
									) *10 ** networkInfo.decimalPlaces),
									networkInfo)} to proceed further.
										<Popover trigger="hover" usePortal>
											<PopoverTrigger>
												<span className="underline cursor-help">Why?</span>
											</PopoverTrigger>
											<PopoverContent
												zIndex={99999}
												_focus={{ outline: "none" }}
												bg="gray.700"
												border="none"
											>
												<PopoverArrow />
												<PopoverBody>
													<span className="text-white">
													{amount < networkInfo.minPossibleStake
													? `${networkInfo.name} network has a minimum threshold of 
														${minPossibleStake} ${networkInfo.denom} to 
														stake. The rest `
													: "This "}
													is to ensure that you have a decent amount of funds in your
													account to pay transaction fees for claiming rewards, unbonding
													funds, changing on-chain staking preferences, etc.
													</span>
												</PopoverBody>
											</PopoverContent>
										</Popover>
									</AlertDescription>
								</Alert>

							) : (
								selectedAccount && stakingAmount >
								totalPossibleStakingAmount - networkInfo.reserveAmount &&
								(<Alert
									status="error"
									rounded="md"
									flex
									flexDirection="column"
									alignItems="start"
									my={4}
								>
									<AlertTitle color="red.500">
										Insufficient Balance
									</AlertTitle>
									<AlertDescription color="red.500">
										We cannot stake this amount since we recommend maintaining
										a minimum balance of {networkInfo.reserveAmount}{" "}
										{networkInfo.denom} in your account at all times.{" "}
										<Popover trigger="hover" usePortal>
											<PopoverTrigger>
												<span className="underline cursor-help">Why?</span>
											</PopoverTrigger>
											<PopoverContent
												zIndex={99999}
												_focus={{ outline: "none" }}
												bg="gray.700"
												border="none"
											>
												<PopoverArrow />
												<PopoverBody>
													<span className="text-white">
														This is to ensure that you have a decent amout of
														funds in your account to pay transaction fees for
														claiming rewards, unbonding funds, changing
														on-chain staking preferences, etc.
													</span>
												</PopoverBody>
											</PopoverContent>
										</Popover>
									</AlertDescription>
								</Alert>
							))}
							<div
								className="m-2 text-gray-600 text-sm"
								hidden={isNil(selectedAccount)}
							>
								Transferrable Balance:{" "}
								{balances && (formatCurrency.methods.formatAmount(
									balances?.availableBalance,
									networkInfo
								))}
							</div>
							<div className="my-5">
								<AmountInput
									value={{ currency: amount, subCurrency: subCurrency }}
									networkInfo={networkInfo}
									onChange={setStakingAmount}
									trackRewardCalculatedEvent={trackRewardCalculatedEvent}
									balances={balances}
									stakingInfo={stakingInfo}
								/>
							</div>
							<div className="">
								<button
									className={`
									bg-teal-500 text-white py-2 px-5 rounded
						${selectedAccount ? "opacity-75 cursor-not-allowed" : "opacity-100"}
					`}
									onClick={onConfirm}
									// disabled={proceedDisabled}
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
