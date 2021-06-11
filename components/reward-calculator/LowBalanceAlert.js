import {
	Alert,
	AlertDescription,
	AlertTitle,
	Popover,
	PopoverArrow,
	PopoverBody,
	PopoverContent,
	PopoverTrigger,
} from "@chakra-ui/core";
import { get } from "lodash";
import formatCurrency from "@lib/format-currency";
import { useEffect, useState } from "react";

const LowBalanceAlert = ({
	networkInfo,
	amount,
	activeBondedAmount,
	totalAvailableStakingAmount,
	totalPossibleStakingAmount,
}) => {
	const [status, setStatus] = useState();
	const [title, setTitle] = useState();
	const [titleColor, setTitleColor] = useState();
	const [description, setDescription] = useState();
	const [descriptionColor, setDescriptionColor] = useState();
	useEffect(() => {
		amount > totalPossibleStakingAmount
			? true
			: activeBondedAmount > totalPossibleStakingAmount - networkInfo.minAmount
			? totalAvailableStakingAmount < networkInfo.minAmount / 2
				? true
				: false
			: amount > totalPossibleStakingAmount - networkInfo.minAmount
			? true
			: false;
		if (amount > totalPossibleStakingAmount) {
			setStatus("error");
			setTitleColor("red.500");
			setTitle("Insufficient Balance");
			setDescriptionColor("red.500");
			setDescription(
				`You need an additional of ${formatCurrency.methods.formatAmount(
					Math.trunc(
						Number(
							amount - (totalPossibleStakingAmount - networkInfo.minAmount)
						) *
							10 ** networkInfo.decimalPlaces
					),
					networkInfo
				)} to proceed further.`
			);
		} else if (
			activeBondedAmount >
			totalPossibleStakingAmount - networkInfo.minAmount
		) {
			if (totalAvailableStakingAmount < networkInfo.minAmount / 2) {
				setStatus("error");
				setTitleColor("red.500");
				setTitle("Insufficient Balance");
				setDescriptionColor("red.500");
				setDescription(
					`You need an additional of ${formatCurrency.methods.formatAmount(
						Math.trunc(
							Number(networkInfo.minAmount - totalAvailableStakingAmount) *
								10 ** networkInfo.decimalPlaces
						),
						networkInfo
					)} to proceed further.`
				);
			} else {
				setStatus("warning");
				setTitleColor("#FDB808");
				setTitle("Low Balance");
				setDescriptionColor("#FDB808");
				setDescription(
					`Your available balance is low, we recommend to add more ${networkInfo.denom}'s`
				);
			}
		} else if (amount > totalPossibleStakingAmount - networkInfo.minAmount) {
			setStatus("error");
			setTitleColor("red.500");
			setTitle("Insufficient Balance");
			setDescriptionColor("red.500");
			setDescription(
				`You need an additional of ${formatCurrency.methods.formatAmount(
					Math.trunc(
						Number(
							amount - (totalPossibleStakingAmount - networkInfo.minAmount)
						) *
							10 ** networkInfo.decimalPlaces
					),
					networkInfo
				)} to proceed further.`
			);
		} else setStatus(null);
	});

	return (
		<Alert
			status={status}
			rounded="md"
			hidden={status}
			flex
			flexDirection="column"
			alignItems="start"
			my={4}
		>
			<AlertTitle color={titleColor}>{title}</AlertTitle>
			<AlertDescription color={descriptionColor}>
				{description}{" "}
				<Popover trigger="hover" usePortal>
					<PopoverTrigger>
						<span className="underline cursor-help">Why?</span>
					</PopoverTrigger>
					<PopoverContent
						zIndex={50}
						_focus={{ outline: "none" }}
						bg="gray.600"
						border="none"
					>
						<PopoverArrow />
						<PopoverBody>
							<span className="text-white text-xs">
								This is to ensure that you have a decent amount of funds in your
								account to pay transaction fees for claiming rewards, unbonding
								funds, changing on-chain staking preferences, etc.
							</span>
						</PopoverBody>
					</PopoverContent>
				</Popover>
			</AlertDescription>
		</Alert>
	);
};
export default LowBalanceAlert;
