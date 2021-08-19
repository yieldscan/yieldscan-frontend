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
}) => {
	const [currentStep, setCurrentStep] = useState(0);

	const incrementCurrentStep = () => setCurrentStep((step) => step + 1);
	const decrementCurrentStep = () => setCurrentStep((step) => step - 1);
	const [transaction, setTransaction] = useState(null);
	const [transactionFee, setTransactionFee] = useState(0);
	const [injectorAccount, setInjectorAccount] = useState(null);

	useEffect(async () => {
		setTransaction(null);
		setTransactionFee(0);
		setInjectorAccount(null);
		if (
			currentStep > 0 &&
			stepperTransactions[currentStep - 1]?.transactionType === "bond"
		) {
			console.log(stepperTransactions[currentStep - 1]);
			const _transaction = [];
			_transaction.push(
				apiInstance.tx.staking.bond(
					stepperTransactions[currentStep - 1]?.substrateControllerId,
					stepperTransactions[currentStep - 1]?.stakingAmount,
					stepperTransactions[currentStep - 1]?.rewardDestination
				)
			);

			const fee = await _transaction[0]?.paymentInfo(
				stepperTransactions[currentStep - 1]?.injectorAccount
			);
			setTransaction([..._transaction]);
			setInjectorAccount(stepperTransactions[currentStep - 1]?.injectorAccount);
			setTransactionFee(() => fee.partialFee.toNumber());
		} else if (
			currentStep > 0 &&
			stepperTransactions[currentStep - 1]?.transactionType === "bondExtra"
		) {
			const _transaction = [];
			_transaction.push(
				apiInstance.tx.staking.bondExtra(
					stepperTransactions[currentStep - 1]?.stakingAmount
				)
			);

			const fee = await _transaction[0]?.paymentInfo(
				stepperTransactions[currentStep - 1]?.injectorAccount
			);
			setTransaction([..._transaction]);
			setInjectorAccount(stepperTransactions[currentStep - 1]?.injectorAccount);
			setTransactionFee(() => fee.partialFee.toNumber());
		} else if (
			currentStep > 0 &&
			stepperTransactions[currentStep - 1]?.transactionType === "nominate"
		) {
			const _transaction = [];
			_transaction.push(
				apiInstance.tx.staking.nominate(
					stepperTransactions[currentStep - 1]?.nominatedValidators
				)
			);

			const fee = await _transaction[0]?.paymentInfo(
				stepperTransactions[currentStep - 1]?.injectorAccount
			);
			setTransaction([..._transaction]);
			setInjectorAccount(stepperTransactions[currentStep - 1]?.injectorAccount);
			setTransactionFee(() => fee.partialFee.toNumber());
		} else if (
			currentStep > 0 &&
			stepperTransactions[currentStep - 1]?.transactionType ===
				"controllerTransfer"
		) {
			const _transaction = [];
			_transaction.push(
				apiInstance.tx.balances.transferKeepAlive(
					stepperTransactions[currentStep - 1]?.substrateControllerId,
					stepperTransactions[currentStep - 1]?.controllerTransferAmount
				)
			);

			const fee = await _transaction[0]?.paymentInfo(
				stepperTransactions[currentStep - 1]?.injectorAccount
			);
			setTransaction([..._transaction]);
			setInjectorAccount(stepperTransactions[currentStep - 1]?.injectorAccount);
			setTransactionFee(() => fee.partialFee.toNumber());
		} else if (
			currentStep > 0 &&
			stepperTransactions[currentStep - 1]?.transactionType === "setController"
		) {
			const _transaction = [];
			_transaction.push(
				apiInstance.tx.staking.setController(
					stepperTransactions[currentStep - 1]?.substrateControllerId
				)
			);

			const fee = await _transaction[0]?.paymentInfo(
				stepperTransactions[currentStep - 1]?.injectorAccount
			);
			setTransaction([..._transaction]);
			setInjectorAccount(stepperTransactions[currentStep - 1]?.injectorAccount);
			setTransactionFee(() => fee.partialFee.toNumber());
		}
	}, [stepperTransactions, currentStep]);

	console.log(transactionFee);

	return (
		<Modal
			isOpen={isStepperSigningPopoverOpen}
			onClose={closeStepperSignerPopover}
			isCentered
			size={currentStep > 0 ? "2xl" : "lg"}
			closeOnEsc={true}
			closeOnOverlayClick={true}
		>
			<ModalOverlay />
			<ModalContent rounded="lg" {...styles} py={4}>
				<ModalCloseButton
					onClick={closeStepperSignerPopover}
					boxShadow="0 0 0 0 #fff"
					color="gray.400"
					backgroundColor="gray.100"
					rounded="1rem"
					mt={4}
					mr={4}
				/>
				<ModalBody>
					{currentStep === 0 ? (
						<IdentifyWallet
							onConfirm={onConfirm}
							closeStepperSignerPopover={closeStepperSignerPopover}
							incrementCurrentStep={incrementCurrentStep}
						/>
					) : (
						<StepperSigning
							onConfirm={onConfirm}
							closeStepperSignerPopover={closeStepperSignerPopover}
							stakingPath={stakingPath}
							stepperTransactions={stepperTransactions}
							currentStep={currentStep}
							transaction={transaction}
							injectorAccount={injectorAccount}
							transactionFee={transactionFee}
							selectedValidators={selectedValidators}
							apiInstance={apiInstance}
							networkInfo={networkInfo}
							ysFees={ysFees}
							transactionType={
								stepperTransactions[currentStep - 1]?.transactionType
							}
							incrementCurrentStep={incrementCurrentStep}
						/>
					)}
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};

export { StepperSigningPopover, useStepperSigningPopover };
