import {
	Modal,
	ModalBody,
	ModalOverlay,
	ModalContent,
	ModalCloseButton,
	Icon,
} from "@chakra-ui/core";
// import { useIsLowBalance } from "@lib/store";
import { useRouter } from "next/router";
import { AlertCircle, AlertTriangle } from "react-feather";
import create from "zustand";
import Image from "next/image";
import { track, goalCodes } from "@lib/analytics";

const useStakingPathPopover = create((set) => ({
	isStakingPathPopoverOpen: false,
	toggleIsStakingPathPopoverOpen: () =>
		set((state) => ({
			isStakingPathPopoverOpen: !state.isStakingPathPopoverOpen,
		})),
	close: () => set(() => ({ isStakingPathPopoverOpen: false })),
	open: () => set(() => ({ isStakingPathPopoverOpen: true })),
}));

const StakingPathPopover = ({
	styles,
	networkInfo,
	toStaking,
	setStakingPath,
	isSameStashController,
}) => {
	const router = useRouter();
	const { isStakingPathPopoverOpen, close } = useStakingPathPopover();
	const handleOnClick = (path) => {
		if (path == "express") {
			track(goalCodes.GLOBAL.EXPRESS_STAKING_PATH);
		} else if (path == "secure") {
			track(goalCodes.GLOBAL.SECURE_STAKING_PATH);
		}
		setStakingPath(path);
		router.push("/staking");
		close();
	};

	return (
		<Modal
			isOpen={isStakingPathPopoverOpen}
			onClose={close}
			isCentered
			closeOnEsc={true}
			size={"3xl"}
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
					<div className="w-full h-full flex flex-col justify-center items-center">
						<h1 className="w-full text-xl text-gray-700 font-semibold p-2">
							Choose your path
						</h1>
						<div className="w-full h-full flex flex-row justify-center items-center p-2 space-x-4">
							<button
								className="w-full flex-1 flex rounded-lg border items-center shadow-lg py-8 transform hover:scale-102"
								onClick={() => handleOnClick("express")}
							>
								<div className="w-full flex-1 flex flex-col items-center text-left space-y-4 px-4">
									<Image
										src="/images/lightning.svg"
										width="80"
										height="80"
										alt="walletIcon"
									/>
									<div className="flex flex-col justify-center items-center">
										<h2 className="text-md font-semibold">Express</h2>
										<p className="text-gray-600 text-sm max-w-md">
											(
											{isSameStashController
												? "currently using this"
												: "most used"}
											)
										</p>
									</div>
									<ul className="w-full flex flex-col text-sm text-gray-700 list-disc list-outside p-4 space-y-4">
										<li>
											<b>No setup required:</b> You can continue to stake
											directly without having to worry about any additional
											setup
										</li>
										<li>
											🚧 <b>Less secure:</b> Since you’ll be using the same
											account for storage of funds as well as to manage your
											staking activities, it is exposed to the internet often,
											making it more vulnerable
										</li>
										<li>Single step to stake</li>
									</ul>
								</div>
							</button>
							<button
								className="w-full flex-1 flex rounded-lg border items-center shadow-lg py-8 transform hover:scale-102"
								onClick={() => handleOnClick("secure")}
							>
								<div className="w-full flex-1 flex flex-col items-center text-left space-y-4 px-4">
									<Image
										src="/images/secure.svg"
										width="80"
										height="80"
										alt="walletIcon"
									/>
									<div className="flex flex-col justify-center items-center">
										<h2 className="text-md font-semibold">Secure</h2>
										<p className="text-gray-600 text-sm max-w-md">
											(recommended)
										</p>
									</div>
									<ul className="w-full flex flex-col text-sm text-gray-700 list-disc list-outside p-4 space-y-4">
										<li>
											<b>Setup required:</b> Security is increased by creating
											an additional account known as controller
										</li>
										<li>
											<b>More secure:</b> Using a controller account reduces the
											risk of your funds being stolen or hacked by minimizing
											exposure of your wallet to the internet <br />
											<br />
										</li>
										<li>Three steps to stake</li>
									</ul>
								</div>
							</button>
						</div>
					</div>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};

export { StakingPathPopover, useStakingPathPopover };
