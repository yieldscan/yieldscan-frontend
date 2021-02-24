import { useState, useEffect } from "react";
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalBody,
	ModalCloseButton,
} from "@chakra-ui/core";
import withSlideIn from "@components/common/withSlideIn";
import convertRemainingErasToSecs from "@lib/convertRemainingErasToTime";
import moment from "moment";

const UnbondingAmountCard = ({
	value,
	remainingEras,
	eraLength,
	eraProgress,
}) => {
	const timeRemainingInSecs = moment
		.duration(
			convertRemainingErasToSecs(eraLength, eraProgress, remainingEras),
			"seconds"
		)
		.humanize();
	return (
		<div className="flex items-center justify-between rounded-lg border border-gray-200 py-2 w-full mb-2">
			<div className="flex items-center ml-4">
				{/* <Identicon address={stashId} size="32" /> */}
				<div className="text-gray-700 ml-2">
					<span className="text-md">{value}</span>
					<div className="flex items-center">
						<span className="text-xs mr-2">
							Unbonding in {timeRemainingInSecs}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};

const UnbondingList = withSlideIn(
	({
		open,
		close,
		toggle,
		unbondingBalances,
		networkInfo,
		eraProgress,
		eraLength,
	}) => {
		const handlePopoverClose = () => {
			close();
		};

		return (
			<Modal
				isOpen={true}
				onClose={close}
				isCentered
				closeOnOverlayClick={true}
				closeOnEsc={true}
				size="md"
			>
				<ModalOverlay />
				<ModalContent rounded="lg">
					<ModalCloseButton
						onClick={handlePopoverClose}
						boxShadow="0 0 0 0 #fff"
						color="gray.400"
						backgroundColor="gray.100"
						rounded="1rem"
						mt={4}
						mr={4}
					/>
					<ModalBody px="2rem">
						<div className="flex flex-col">
							<h3 className="mt-4 text-2xl text-gray-700 font-semibold">
								Unlocking Amounts
							</h3>
							<div className="py-2 flex items-center flex-wrap">
								{unbondingBalances.map((data) => (
									<UnbondingAmountCard
										value={data.value}
										remainingEras={data.remainingEras}
										eraLength={eraLength}
										eraProgress={eraProgress}
									/>
								))}
							</div>
						</div>
					</ModalBody>
				</ModalContent>
			</Modal>
		);
	}
);

export default UnbondingList;