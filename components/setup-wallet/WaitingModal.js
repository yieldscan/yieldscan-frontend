import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalBody,
	ModalCloseButton,
} from "@chakra-ui/core";
import { setCookie } from "nookies";
import withSlideIn from "@components/common/withSlideIn";

const WaitingModal = withSlideIn(({ styles, close, isOpen }) => {
	return (
		<Modal isOpen={isOpen} size={"md"} ononClose={close} isCentered>
			<ModalOverlay />
			<ModalContent rounded="lg" {...styles} py={4}>
				{/* <ModalHeader>
					<h3 className="px-3 text-2xl text-left self-start">
						Edit Controller
					</h3>
				</ModalHeader> */}
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
					<div className="h-64 flex text-left text-gray-700 flex-col justify-center items-center space-y-4">
						<span className="loader"></span>
						<p className="text-gray-700 text-center">
							{"Waiting for you to install polkadot{.js} wallet..."}
						</p>
						<p className="text-gray-700 text-sm pt-4">
							Already installed?{" "}
							<span
								className="font-semibold cursor-pointer"
								onClick={() => {
									setCookie(null, "currentStep", "ledgerSetup", {
										maxAge: 10,
									});
									location.reload();
								}}
							>
								Refresh page
							</span>
						</p>
					</div>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
});

export default WaitingModal;
