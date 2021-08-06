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
import { AlertCircle, AlertTriangle, AlertOctagon } from "react-feather";
import create from "zustand";
import Image from "next/image";
import formatCurrency from "@lib/format-currency";
import startRamp from "@lib/startRamp";
import { track, goalCodes} from "@lib/analytics";

const useLowBalancePopover = create((set) => ({
	isLowBalanceOpen: false,
	toggleIsLowBalanceOpen: () =>
		set((state) => ({ isLowBalanceOpen: !state.isLowBalanceOpen })),
	close: () => set(() => ({ isLowBalanceOpen: false })),
	open: () => set(() => ({ isLowBalanceOpen: true })),
}));

const LowBalancePopover = ({
	styles,
	networkInfo,
	toStaking,
	setStakingPath,
	transferAmount,
	controllerAccount,
}) => {
	const router = useRouter();
	const { isLowBalanceOpen, close } = useLowBalancePopover();

	return (
		<Modal
			isOpen={isLowBalanceOpen}
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
					<div className="w-full flex flex-col justify-center items-center space-y-4 p-4">
						<AlertOctagon color="red" size="60" />
						<div>
							<h1 className="w-full text-xl text-center text-gray-700 font-semibold p-2">
								Insufficient balance in controller account
							</h1>
							<p className="w-full text-md text-center text-gray-700">
								Hey, we found that you’re staking with a dedicated controller
								account. But it doesn’t have enough balance to pay for the
								transaction fees.
							</p>
						</div>
						<div className="flex flex-row w-full bg-gray-200 rounded-lg p-4 justify-center items-center space-x-2">
							<AlertCircle size="30" className="text-gray-700" />
							<p className="w-full text-sm text-gray-700">
								Hey, we found that you’re staking with a dedicated controller
								account. But it doesn’t have enough balance to pay for the
								transaction fees.
							</p>
						</div>
						<div className="w-full flex flex-col text-gray-700 justify-center content-center items-center text-gray-700 space-y-4">
							<button
								className="w-full flex rounded-lg border items-center shadow-lg transform hover:scale-102 px-2 py-4"
								onClick={() => {
									track(goalCodes.GLOBAL.TRANSFER_STAKING_PATH);
									setStakingPath("transfer");
									router.push("/staking");
									close();
								}}
							>
								<div className="w-full flex-1 flex flex-row items-center text-left space-x-6">
									<Image
										src="/images/wallet01.svg"
										width="120"
										height="120"
										alt="walletIcon"
									/>
									<div className="flex flex-col text-left">
										<h2 className="text-md font-semibold">
											Transfer{" "}
											{formatCurrency.methods.formatAmount(
												Math.trunc(transferAmount),
												networkInfo
											)}{" "}
											{networkInfo.denom}'s from another account
										</h2>
										<p className="text-gray-600 text-sm max-w-md">
											Transfer funds from one of your existing accounts
										</p>
									</div>
								</div>
							</button>
							<button
								className="w-full flex rounded-lg border items-center shadow-lg transform hover:scale-102 px-2 py-4"
								onClick={() => {
									track(goalCodes.GLOBAL.STAKING_RAMP_TRANSFER);
									startRamp(
										networkInfo,
										transferAmount,
										controllerAccount?.address
									);
									close();
								}}
							>
								<div className="w-full flex-1 flex flex-row items-center text-left space-x-6">
									<Image
										src="/images/dollarCoin.svg"
										width="120"
										height="120"
										alt="walletIcon"
									/>
									<div className="flex flex-col text-left">
										<h2 className="text-md font-semibold">
											Buy{" "}
											{formatCurrency.methods.formatAmount(
												transferAmount,
												networkInfo
											)}{" "}
											{networkInfo.denom} using fiat
										</h2>
										<p className="text-gray-600 text-sm max-w-md">
											Buy {networkInfo.denom} using fiat currencies like USD,
											EUR, etc. from our fiat to crypto on ramp partner
										</p>
									</div>
								</div>
							</button>
						</div>
					</div>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};

export { LowBalancePopover, useLowBalancePopover };
