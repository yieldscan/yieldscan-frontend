import {
	Modal,
	ModalBody,
	ModalOverlay,
	ModalContent,
	ModalCloseButton,
} from "@chakra-ui/core";
import { AlertCircle } from "react-feather";
import create from "zustand";
import { NextButton } from "@components/common/BottomButton";
import CheckCard from "../CheckCard";
import Image from "next/image";
import { useEffect, useState } from "react";
import IdentifyWallet from "./IdentifyWallet";
import StepperSigning from "./StepperSigning";

const useStepperSigningPopover = create((set) => ({
	isStepperSigningPopoverOpen: false,
	toggleIsStepperSigningPopoverOpen: () =>
		set((state) => ({
			isStepperSigningPopoverOpen: !state.isStepperSigningPopoverOpen,
		})),
	closeStepperSignerPopover: () =>
		set(() => ({ isStepperSigningPopoverOpen: false })),
	open: () => set(() => ({ isStepperSigningPopoverOpen: true })),
}));

const StepperSigningPopover = ({
	styles,
	networkInfo,
	isStepperSigningPopoverOpen,
	closeStepperSignerPopover,
	onConfirm,
	stakingPath,
	stepperTransactions,
	apiInstance,
	selectedValidators,
	ysFees,
	stepperTransact,
	setIsLedger,
}) => {
	const [stepperIndex, setStepperIndex] = useState(0);

	const incrementStepperIndex = () => setStepperIndex((step) => step + 1);
	const decrementStepperIndex = () => setStepperIndex((step) => step - 1);
	const [stepTransactions, setStepTransactions] = useState([]);
	const [transaction, setTransaction] = useState(null);
	const [transactionFee, setTransactionFee] = useState(0);
	const [injectorAccount, setInjectorAccount] = useState(null);
	const [loading, setLoading] = useState(false);
	const [event, setEvent] = useState("");
	const [success, setSuccess] = useState(false);
	const [loader, setLoader] = useState(false);
	const [stepperSuccessMessage, setStepperSuccessMessage] = useState("");

	useEffect(() => {
		stepperTransactions && setStepTransactions(() => [...stepperTransactions]);
	}, []);

	useEffect(async () => {
		setTransaction(null);
		setTransactionFee(0);
		setInjectorAccount(null);
		setStepperSuccessMessage("");
		if (
			stepperIndex > 0 &&
			stepTransactions[stepperIndex - 1]?.transactionType === "bond"
		) {
			const _transaction = [];
			_transaction.push(
				apiInstance.tx.staking.bond(
					stepTransactions[stepperIndex - 1]?.substrateControllerId,
					stepTransactions[stepperIndex - 1]?.stakingAmount,
					stepTransactions[stepperIndex - 1]?.rewardDestination
				)
			);

			const fee = await _transaction[0]?.paymentInfo(
				stepTransactions[stepperIndex - 1]?.injectorAccount
			);
			setTransaction([..._transaction]);
			setStepperSuccessMessage("Successfully locked!");
			setInjectorAccount(stepTransactions[stepperIndex - 1]?.injectorAccount);
			setTransactionFee(() => fee.partialFee.toNumber());
		} else if (
			stepperIndex > 0 &&
			stepTransactions[stepperIndex - 1]?.transactionType === "bondExtra"
		) {
			const _transaction = [];
			_transaction.push(
				apiInstance.tx.staking.bondExtra(
					stepTransactions[stepperIndex - 1]?.stakingAmount
				)
			);

			const fee = await _transaction[0]?.paymentInfo(
				stepTransactions[stepperIndex - 1]?.injectorAccount
			);
			setTransaction([..._transaction]);
			setStepperSuccessMessage("Successfully locked!");
			setInjectorAccount(stepTransactions[stepperIndex - 1]?.injectorAccount);
			setTransactionFee(() => fee.partialFee.toNumber());
		} else if (
			stepperIndex > 0 &&
			stepTransactions[stepperIndex - 1]?.transactionType === "nominate"
		) {
			const _transaction = [];
			_transaction.push(
				apiInstance.tx.staking.nominate(
					stepTransactions[stepperIndex - 1]?.nominatedValidators
				)
			);

			const fee = await _transaction[0]?.paymentInfo(
				stepTransactions[stepperIndex - 1]?.injectorAccount
			);
			setTransaction([..._transaction]);
			setStepperSuccessMessage("Successfully nominated!");
			setInjectorAccount(stepTransactions[stepperIndex - 1]?.injectorAccount);
			setTransactionFee(() => fee.partialFee.toNumber());
		} else if (
			stepperIndex > 0 &&
			stepTransactions[stepperIndex - 1]?.transactionType ===
				"controllerTransfer"
		) {
			const _transaction = [];
			_transaction.push(
				apiInstance.tx.balances.transferKeepAlive(
					stepTransactions[stepperIndex - 1]?.substrateControllerId,
					stepTransactions[stepperIndex - 1]?.controllerTransferAmount
				)
			);

			const fee = await _transaction[0]?.paymentInfo(
				stepTransactions[stepperIndex - 1]?.injectorAccount
			);
			setTransaction([..._transaction]);
			setStepperSuccessMessage("Successfully transfered funds to controller!");
			setInjectorAccount(stepTransactions[stepperIndex - 1]?.injectorAccount);
			setTransactionFee(() => fee.partialFee.toNumber());
		} else if (
			stepperIndex > 0 &&
			stepTransactions[stepperIndex - 1]?.transactionType === "setController"
		) {
			const _transaction = [];
			_transaction.push(
				apiInstance.tx.staking.setController(
					stepTransactions[stepperIndex - 1]?.substrateControllerId
				)
			);

			const fee = await _transaction[0]?.paymentInfo(
				stepTransactions[stepperIndex - 1]?.injectorAccount
			);
			setTransaction([..._transaction]);
			setStepperSuccessMessage("Controller successfully set!");
			setInjectorAccount(stepTransactions[stepperIndex - 1]?.injectorAccount);
			setTransactionFee(() => fee.partialFee.toNumber());
		} else if (
			stepperIndex > 0 &&
			stepTransactions[stepperIndex - 1]?.transactionType === "yieldscanFees"
		) {
			const _transaction = [];
			_transaction.push(
				apiInstance.tx.balances.transferKeepAlive(
					stepTransactions[stepperIndex - 1]?.injectorAccount,
					stepTransactions[stepperIndex - 1]?.ysFees
				)
			);

			const fee = await _transaction[0]?.paymentInfo(
				stepTransactions[stepperIndex - 1]?.injectorAccount
			);

			setTransaction([..._transaction]);
			setStepperSuccessMessage("Yieldscan Fees Successfully Paid");
			setInjectorAccount(stepTransactions[stepperIndex - 1]?.injectorAccount);
			setTransactionFee(() => fee.partialFee.toNumber());
		}
	}, [stepTransactions, stepperIndex]);

	return (
		<Modal
			isOpen={isStepperSigningPopoverOpen}
			onClose={closeStepperSignerPopover}
			isCentered
			size={stepperIndex > 0 ? "2xl" : "lg"}
			closeOnEsc={loading || stepperIndex > 1 ? false : true}
			closeOnOverlayClick={loading || stepperIndex > 1 ? false : true}
		>
			<ModalOverlay />
			<ModalContent rounded="lg" {...styles} py={4}>
				{!loading && stepperIndex < 2 && (
					<ModalCloseButton
						onClick={closeStepperSignerPopover}
						boxShadow="0 0 0 0 #fff"
						color="gray.400"
						backgroundColor="gray.100"
						rounded="1rem"
						mt={4}
						mr={4}
					/>
				)}
				<ModalBody>
					{loading ? (
						<div className="grid grid-rows-2 gap-2 h-96 items-center justify-content justify-center">
							<div className="w-full h-full flex justify-center items-end">
								<span
									className={`loader ${loader ? "fail" : success && "success"}`}
								></span>
							</div>
							<div className="w-full max-w-sm flex flex-col items-center h-full justify-between">
								<div className="flex flex-col items-center text-center">
									<p className="text-gray-700 mt-4">{event}</p>
								</div>
							</div>
						</div>
					) : stepperIndex === 0 ? (
						<IdentifyWallet
							onConfirm={onConfirm}
							closeStepperSignerPopover={closeStepperSignerPopover}
							incrementStepperIndex={incrementStepperIndex}
							setIsLedger={setIsLedger}
						/>
					) : (
						<StepperSigning
							onConfirm={() =>
								stepperTransact(
									transaction,
									stepTransactions,
									injectorAccount,
									stepperIndex === stepTransactions?.length,
									closeStepperSignerPopover,
									setLoading,
									setEvent,
									setLoader,
									stepperSuccessMessage,
									setSuccess,
									stepperIndex,
									setStepperIndex
								)
							}
							closeStepperSignerPopover={closeStepperSignerPopover}
							stakingPath={stakingPath}
							stepperTransactions={stepTransactions}
							stepperIndex={stepperIndex}
							transaction={transaction}
							injectorAccount={injectorAccount}
							transactionFee={transactionFee}
							selectedValidators={selectedValidators}
							apiInstance={apiInstance}
							networkInfo={networkInfo}
							ysFees={ysFees}
							transactionType={
								stepTransactions[stepperIndex - 1]?.transactionType
							}
							incrementStepperIndex={incrementStepperIndex}
						/>
					)}
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};

export { StepperSigningPopover, useStepperSigningPopover };
