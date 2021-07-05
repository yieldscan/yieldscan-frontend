import {
	Modal,
	ModalBody,
	ModalOverlay,
	ModalContent,
	ModalCloseButton,
	Icon,
} from "@chakra-ui/core";
import { useIsLowBalance } from "@lib/store";
import { useRouter } from "next/router";
import { AlertCircle, AlertTriangle } from "react-feather";
import create from "zustand";

const useLowBalancePopover = create((set) => ({
	isLowBalanceOpen: false,
	toggleIsLowBalanceOpen: () =>
		set((state) => ({ isLowBalanceOpen: !state.isLowBalanceOpen })),
	close: () => set(() => ({ isLowBalanceOpen: false })),
	open: () => set(() => ({ isLowBalanceOpen: true })),
}));

const LowBalancePopover = ({ styles, networkInfo, toStaking }) => {
	const router = useRouter();
	const { isLowBalanceOpen, close } = useLowBalancePopover();
	const { setIsLowBalance } = useIsLowBalance();
	const handleOnClick = () => {
		router.push("/staking");
		close();
	};
	return (
		<Modal
			isOpen={isLowBalanceOpen}
			onClose={close}
			isCentered
			closeOnEsc={true}
			closeOnOverlayClick={true}
		>
			<ModalOverlay />
			<ModalContent rounded="lg" maxWidth="lg" {...styles} py={4}>
				<ModalCloseButton
					onClick={close}
					boxShadow="0 0 0 0 #fff"
					color="gray.400"
					backgroundColor="gray.100"
					rounded="1rem"
					mt={4}
					mr={4}
				/>
				<ModalBody>
					<div className="w-full h-full flex justify-center items-center">
						<div className="w-full max-w-sm flex flex-col items-center">
							<div className="p-2 w-full">
								{/* TODO: Make a common back button component */}
							</div>
							<div className="flex-1 flex flex-col text-gray-700 justify-center content-center p-2 items-center text-gray-700 space-y-6 max-w-md">
								{/* <AlertCircle size={60} color="#2BCACA" /> */}
								<h1 className="w-full text-2xl font-semibold">
									Low controller balance
								</h1>
								<div className="flex flex-row space-x-2 justify-center bg-warning-500 rounded-lg p-2 text-gray-700 text-sm items-center">
									<AlertTriangle size={120} color="#FDB808" />
									<p>
										Your controller account needs an additional 20{" "}
										{networkInfo.denom} proceed. This amount will be used to pay
										for staking fees and to maintain enough balance to pay for
										future transactions.
									</p>
								</div>
								<div className="w-full text-center">
									<button
										className="rounded-lg w-full font-medium px-12 py-3 bg-teal-500 text-white"
										onClick={handleOnClick}
									>
										Continue
									</button>
									<span className="text-gray-700 text-xs ">
										Looking to change staking amount?{" "}
										<span
											className="font-semibold cursor-pointer"
											// onClick={() => router.push("/overview")}
										>
											Visit Settings
										</span>
									</span>
								</div>
							</div>
						</div>
					</div>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};

export { LowBalancePopover, useLowBalancePopover };
