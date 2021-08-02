import {
	Modal,
	ModalBody,
	ModalOverlay,
	ModalContent,
	ModalCloseButton,
	Icon,
} from "@chakra-ui/core";
import { useRouter } from "next/router";
import { AlertCircle, AlertTriangle, AlertOctagon, Check } from "react-feather";
import create from "zustand";
import Image from "next/image";
import { useStakingPath } from "@lib/store";

const useAuthPopover = create((set) => ({
	isAuthPopoverOpen: false,
	toggleIsAuthPopoverOpen: () =>
		set((state) => ({ isAuthPopoverOpen: !state.isAuthPopoverOpen })),
	close: () => set(() => ({ isAuthPopoverOpen: false })),
	open: () => set(() => ({ isAuthPopoverOpen: true })),
}));

const AuthPopover = ({
	styles,
	networkInfo,
	isAuthPopoverOpen,
	close,
	onConfirm,
}) => {
	const { setStakingPath } = useStakingPath();
	return (
		<Modal
			isOpen={isAuthPopoverOpen}
			onClose={close}
			isCentered
			size={"lg"}
			closeOnEsc={true}
			closeOnOverlayClick={true}
		>
			<ModalOverlay />
			<ModalContent rounded="lg" {...styles} py={4}>
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
					<div className="w-full flex flex-col justify-center items-center space-y-4">
						<h1 className="w-full text-xl text-gray-700 font-semibold p-2">
							What you should know
						</h1>
						<div className="w-full flex flex-col space-y-2 p-2">
							<CheckCard content="You keep complete ownership of your funds" />
							<CheckCard content="Staking rewards usually start to show after 2-3 days" />
							<CheckCard
								content={`Funds will be locked for staking and can be unlocked at any time, but unlocking takes ${networkInfo.lockUpPeriod} days`}
							/>
						</div>
						<div className="w-full flex flex-row text-gray-700 bg-gray-200 justify-center items-center space-x-2 p-4 rounded-lg">
							<div>
								<AlertCircle size="30" />
							</div>
							<p className="text-xs font-light">
								Your staked funds may be irrevocably lost if the validator
								doesn’t behave properly, YieldScan mitigates this but does NOT
								guarantee immunity
							</p>
						</div>
						<button
							className="w-full rounded-lg font-medium py-3 bg-teal-500 transform hover:bg-teal-700 text-white"
							onClick={() => {
								onConfirm();
								// setStakingPath("loadingPage");
								close();
							}}
						>
							Continue to authorize
						</button>
					</div>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};

export { AuthPopover, useAuthPopover };

const CheckCard = ({ content }) => (
	<div className="w-full flex flex-row items-center text-gray-700 space-x-2">
		<div>
			<Check className="border-2 rounded-full border-gray-700 p-1 h-6 w-6" />
		</div>
		<p className="text-xs font-light">{content}</p>
	</div>
);
