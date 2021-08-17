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
import { useState } from "react";
import IdentifyWallet from "./IdentifyWallet";

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
}) => {
	const [currentStep, setCurrentStep] = useState(0);

	const incrementCurrentStep = () => setCurrentStep((step) => step + 1);
	const decrementCurrentStep = () => setCurrentStep((step) => step - 1);

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
					{currentStep === 0 && (
						<IdentifyWallet
							onConfirm={onConfirm}
							closeStepperSignerPopover={closeStepperSignerPopover}
						/>
					)}
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};

export { StepperSigningPopover, useStepperSigningPopover };
