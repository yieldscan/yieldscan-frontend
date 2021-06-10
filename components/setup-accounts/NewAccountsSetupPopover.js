import {
	Modal,
	ModalBody,
	ModalOverlay,
	ModalContent,
	ModalCloseButton,
} from "@chakra-ui/core";
import { useIsNewSetup } from "@lib/store";
import { useRouter } from "next/router";
import { AlertCircle } from "react-feather";
import create from "zustand";

const useNewAccountsSetup = create((set) => ({
	isNewSetupOpen: true,
	toggleNewSetup: () =>
		set((state) => ({ isNewSetupOpen: !state.isNewSetupOpen })),
	close: () => set(() => ({ isNewSetupOpen: false })),
	open: () => set(() => ({ isNewSetupOpen: true })),
}));

const NewAccountsSetupPopover = ({ styles }) => {
	const router = useRouter();
	const { isNewSetupOpen, close } = useNewAccountsSetup();
	const { setIsNewSetup } = useIsNewSetup();
	const handleOnClick = () => {
		setIsNewSetup(true);
		router.push("/setup-accounts");
		close();
	};
	return (
		<Modal
			isOpen={isNewSetupOpen}
			onClose={close}
			isCentered
			closeOnEsc={true}
			closeOnOverlayClick={true}
		>
			<ModalOverlay />
			<ModalContent rounded="lg" maxWidth="lg" {...styles} py={4}>
				{/* <ModalCloseButton
					onClick={close}
					boxShadow="0 0 0 0 #fff"
					color="gray.400"
					backgroundColor="gray.100"
					rounded="1rem"
					mt={4}
					mr={4}
				/> */}
				<ModalBody>
					<div className="w-full h-full flex justify-center">
						<div className="w-full max-w-sm flex flex-col items-center">
							<div className="p-2 w-full">
								{/* TODO: Make a common back button component */}
							</div>
							<div className="flex-1 flex flex-col text-gray-700 justify-center content-center p-2 items-center text-gray-700 space-y-6 max-w-md">
								<AlertCircle size={60} color="#2BCACA" />
								<h1 className="text-2xl font-semibold text-center">
									New accounts found in your wallet
								</h1>
								<p className="text-gray-600 text-sm text-center max-w-md">
									You need to setup your accounts before you can use them to
									stake through YieldScan.
								</p>
								<div className="w-full text-center">
									<button
										className="rounded-lg w-full font-medium px-12 py-3 bg-teal-500 text-white"
										onClick={handleOnClick}
									>
										Let’s set it up
									</button>
									<button
										className="rounded-lg w-full font-medium px-12 underline py-3 text-gray-700"
										onClick={close}
									>
										Setup later
									</button>
								</div>
							</div>
						</div>
					</div>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};

export { NewAccountsSetupPopover, useNewAccountsSetup };
