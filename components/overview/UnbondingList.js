import { useState, useEffect } from "react";
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalBody,
	ModalCloseButton,
	CircularProgress,
} from "@chakra-ui/core";
import withSlideIn from "@components/common/withSlideIn";
import convertRemainingErasToSecs from "@lib/convertRemainingErasToTime";
import formatCurrency from "@lib/format-currency";
import moment from "moment";

const UnbondingAmountCard = ({
	value,
	remainingEras,
	eraLength,
	eraProgress,
	networkInfo,
}) => {
	const timeRemainingInSecs = convertRemainingErasToSecs(
		eraLength,
		eraProgress,
		remainingEras
	);

	const humanizeTimeRemaining = moment
		.duration(timeRemainingInSecs, "seconds")
		.humanize();

	const lockUpPeriodInSecs = networkInfo.lockUpPeriod * 24 * 60 * 60;
	const progressInPercentage =
		((lockUpPeriodInSecs - timeRemainingInSecs) / lockUpPeriodInSecs) * 100;
	return (
		<div className="flex items-center justify-between rounded-lg border border-gray-200 py-2 w-full mb-2">
			<div className="flex items-center ml-4">
				<CircularProgress value={progressInPercentage} size={40} color="teal" />
				<div className="text-gray-700 ml-2">
					<span className="text-md">
						{formatCurrency.methods.formatAmount(value, networkInfo)}
					</span>
					<div className="flex items-center">
						{/* TODO: Add skeleteon for loading time instead of dots */}
						<span className="text-xs mr-2">
							Unbonding in{" "}
							{eraLength && eraProgress ? humanizeTimeRemaining : "..."}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};

const UnbondingList = withSlideIn(
	({ api, close, stakingInfo, networkInfo }) => {
		const handlePopoverClose = () => {
			close();
		};

		const [eraLength, setEraLength] = useState();
		const [eraProgress, setEraProgress] = useState();

		useEffect(() => {
			let unsubscribe;
			api?.derive.session
				.progress((data) => {
					setEraLength(parseInt(data.eraLength));
					setEraProgress(parseInt(data.eraProgress));
				})
				.then((u) => (unsubscribe = u));
			return () => {
				unsubscribe && unsubscribe();
			};
		}, [networkInfo]);

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
								{stakingInfo.unlocking.map((data) => (
									<UnbondingAmountCard
										value={data.value}
										remainingEras={data.remainingEras}
										eraLength={eraLength}
										eraProgress={eraProgress}
										networkInfo={networkInfo}
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
