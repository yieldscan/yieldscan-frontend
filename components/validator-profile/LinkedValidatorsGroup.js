import { useDisclosure } from "@chakra-ui/core";
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalCloseButton,
} from "@chakra-ui/core";
import Identicon from "@components/common/Identicon";
import withSlideIn from "@components/common/withSlideIn";
import { getName } from "@lib/getName";
import Routes from "@lib/routes";

const ValidatorCard = ({ info, stashId, onProfile = noop }) => {
	const displayName = getName(info?.display, info?.displayParent, stashId);
	return (
		<div
			className="flex items-center justify-between rounded-lg border border-gray-200 py-2 w-full mb-2 cursor-pointer"
			onClick={onProfile}
		>
			<div className="flex items-center ml-4">
				<Identicon address={stashId} size="3rem" />
				<div className="flex flex-col ml-2">
					<h3 className="text-gray-700">
						<span className="font-medium">{displayName}</span>
					</h3>
					<p className="text-gray-600 text-xs">{stashId || ""}</p>
				</div>
			</div>
		</div>
	);
};

const LinkedValidatorsModal = withSlideIn(
	({ validators, styles, onClose, onProfile }) => (
		<Modal isOpen={true} onClose={onClose}>
			<ModalOverlay />
			<ModalContent {...styles} maxWidth="40rem" rounded="lg">
				<ModalHeader>
					<div className="flex items-center">
						<span className="font-medium text-2xl">Linked Validators</span>
						<span className="cursor-pointer border-4 border-white bg-gray-200 text-gray-600 text-xs rounded-full h-10 w-10 flex items-center justify-center ml-2 z-10 font-medium">
							<span>{validators.length}</span>
						</span>
					</div>
				</ModalHeader>
				<ModalCloseButton
					onClick={onClose}
					boxShadow="0 0 0 0 #fff"
					color="gray.400"
					backgroundColor="gray.100"
					rounded="1rem"
					mt={4}
					mr={4}
				/>
				<ModalBody maxHeight="80vh" overflowY="scroll" py={4}>
					<div className="flex items-center flex-wrap overflow-y-scroll">
						{validators.map((validator) => (
							<ValidatorCard
								key={validator.stashId}
								info={validator}
								stashId={validator.stashId}
								onProfile={() => onProfile(validator.stashId)}
							/>
						))}
					</div>
				</ModalBody>
			</ModalContent>
		</Modal>
	)
);

const LinkedValidatorsGroup = ({ validators = [] }) => {
	const { onToggle, isOpen, onClose } = useDisclosure();

	const onProfile = (validatorId) =>
		window.open(`${Routes.VALIDATOR_PROFILE}/${validatorId}`, "_blank");

	const limitedValidators =
		validators.length > 5 ? validators.slice(0, 5) : validators;

	return validators.length ? (
		<div className="flex items-center">
			<span className="text-gray-700 text-xs mr-5 font-semibold">
				LINKED VALIDATORS
			</span>
			<LinkedValidatorsModal
				isOpen={isOpen}
				onClose={onClose}
				validators={validators}
				limitedValidators={limitedValidators}
				onProfile={onProfile}
			/>
			<div className="flex items-center max-w-xs">
				{limitedValidators.map((validator, index) => (
					<div
						style={{ marginLeft: -12 }}
						className="cursor-pointer-ml-12"
						key={index}
					>
						<Identicon
							key={validator.stashId}
							address={validator.stashId}
							onClick={onProfile}
							showToast={false}
						/>
					</div>
				))}
				{limitedValidators.length !== validators.length && (
					<div
						className="cursor-pointer border-4 border-white bg-gray-200 text-gray-600 text-xs rounded-full h-12 w-12 flex items-center justify-center -ml-2 z-10"
						onClick={onToggle}
					>
						<span>+{validators.length - limitedValidators.length}</span>
					</div>
				)}
			</div>
		</div>
	) : (
		""
	);
};

export default LinkedValidatorsGroup;
