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
	minPossibleStake,
	controllerUnavailable,
	isSameStashController,
	ysFees,
	isExistingUser,
	hasSubscription,
}) => {
	const [status, setStatus] = useState();
	const [title, setTitle] = useState();
	const [titleColor, setTitleColor] = useState();
	const [description, setDescription] = useState();
	const [descriptionColor, setDescriptionColor] = useState();
	const [popoverContent, setPopoverContent] = useState();

	useEffect(() => {
		if (activeBondedAmount === 0) {
			if (
				totalPossibleStakingAmount <
				minPossibleStake +
					networkInfo.reserveAmount +
					ysFees / Math.pow(10, networkInfo.decimalPlaces)
			) {
				setStatus("error");
				setTitleColor("red.500");
				setDescriptionColor("red.500");
				setTitle("Insufficient balance:");
				setDescription(
					`You need at least ${formatCurrency.methods.formatAmount(
						Math.trunc(
							(minPossibleStake + networkInfo.reserveAmount) *
								Math.pow(10, networkInfo.decimalPlaces)
						),
						networkInfo
					)} to proceed.`
				);
				setPopoverContent(
					`The ${networkInfo.name} network has a minimum staking
					threshold of 
					${formatCurrency.methods.formatAmount(
						Math.trunc(
							minPossibleStake * Math.pow(10, networkInfo.decimalPlaces)
						),
						networkInfo
					)}. ${
						networkInfo.feesEnabled
							? "Please also be informed that we have started charging fees for using Yieldscan. "
							: ""
					}
					We additionally require users to keep a minimum of
					${formatCurrency.methods.formatAmount(
						Math.trunc(
							networkInfo.reserveAmount *
								Math.pow(10, networkInfo.decimalPlaces)
						),
						networkInfo
					)} as a reserve in their accounts when they start staking.`
				);
			} else if (amount < minPossibleStake) {
				setStatus("error");
				setTitleColor("red.500");
				setTitle("Insufficient Amount");
				setDescriptionColor("red.500");
				setDescription(
					`Your inputted amount is less than the minimum allowed staking amount of ${formatCurrency.methods.formatAmount(
						Math.trunc(
							minPossibleStake * Math.pow(10, networkInfo.decimalPlaces)
						),
						networkInfo
					)}. `
				);
				setPopoverContent(
					`${
						networkInfo.name
					} network doesn't allow staking of amounts less than ${formatCurrency.methods.formatAmount(
						Math.trunc(
							minPossibleStake * Math.pow(10, networkInfo.decimalPlaces)
						),
						networkInfo
					)}.`
				);
			} else if (
				amount >
				totalPossibleStakingAmount -
					networkInfo.reserveAmount -
					ysFees / Math.pow(10, networkInfo.decimalPlaces)
			) {
				setStatus("error");
				setTitleColor("red.500");
				setTitle("Insufficient Balance");
				setDescriptionColor("red.500");
				setDescription(
					`Your account balance falls too low. Please account for the recommended ${formatCurrency.methods.formatAmount(
						Math.trunc(
							networkInfo.reserveAmount *
								Math.pow(10, networkInfo.decimalPlaces)
						),
						networkInfo
					)} reserve amount for new stakers ${
						networkInfo.feesEnabled ? "and Yieldscan's fee." : "."
					} Press the max
					icon to autofill the maximum amount. `
				);
				setPopoverContent(`The
					${formatCurrency.methods.formatAmount(
						Math.trunc(
							networkInfo.reserveAmount *
								Math.pow(10, networkInfo.decimalPlaces)
						),
						networkInfo
					)}
					is a reserve to ensure that you have a
					decent amount of funds in your
					account to pay transaction fees for claiming rewards, unbonding
					funds, changing on-chain staking preferences, etc.`);
			} else setStatus(null);
		} else {
			if (activeBondedAmount < minPossibleStake) {
				setStatus("error");
				setTitleColor("red.500");
				setTitle("Insufficient Balance");
				setDescriptionColor("red.500");
				setDescription(
					`Your active bonded amount is less than minimum allowed staking amount of ${formatCurrency.methods.formatAmount(
						Math.trunc(
							minPossibleStake * Math.pow(10, networkInfo.decimalPlaces)
						),
						networkInfo
					)}. Go to overview page to invest more.`
				);
				setPopoverContent(null);
			} else if (controllerUnavailable) {
				setStatus("warning");
				setTitleColor("#FDB808");
				setTitle("Controller not found");
				setDescriptionColor("#FDB808");
				setDescription(
					`Existing controller account not found.
				Either import the existing controller account or proceed to change controller. `
				);
				setPopoverContent(null);
			} else if (
				(isSameStashController &&
					totalAvailableStakingAmount <
						networkInfo.reserveAmount / 2 +
							ysFees / Math.pow(10, networkInfo.decimalPlaces)) ||
				(!isSameStashController &&
					totalAvailableStakingAmount < networkInfo.reserveAmount / 2)
			) {
				setStatus("error");
				setTitleColor("red.500");
				setTitle("Insufficient Balance");
				setDescriptionColor("red.500");
				setDescription(
					`You need an additional ${formatCurrency.methods.formatAmount(
						Math.trunc(
							(networkInfo.reserveAmount - totalAvailableStakingAmount) *
								Math.pow(10, networkInfo.decimalPlaces)
						) + ysFees,
						networkInfo
					)} to proceed further. `
				);
				setPopoverContent(`This is to ensure that you have a
							decent amount of funds in your
							account to pay transaction fees for claiming rewards, unbonding
							funds, changing on-chain staking preferences ${
								networkInfo.feesEnabled
									? "and Yieldscan's fee for this transaction."
									: "etc."
							}`);
			} else if (
				isSameStashController &&
				totalAvailableStakingAmount < networkInfo.reserveAmount
			) {
				setStatus("warning");
				setTitleColor("#FDB808");
				setTitle("Low Balance");
				setDescriptionColor("#FDB808");
				setDescription(
					`Your available balance is low, we recommend to add more
							${networkInfo.denom}s. `
				);
				setPopoverContent(`This is to ensure that you have a
							decent amount of funds in your
							account to pay transaction fees for claiming rewards, unbonding
							funds, changing on-chain staking preferences, etc.`);
			} else setStatus(null);
		}
	});

	return !status ||
		isExistingUser === null ||
		hasSubscription === null ? null : (
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
				{popoverContent && (
					<Popover trigger="hover" usePortal>
						<PopoverTrigger>
							<span className="underline cursor-help">Why?</span>
						</PopoverTrigger>
						<PopoverContent
							zIndex={1401}
							_focus={{ outline: "none" }}
							bg="gray.600"
							border="none"
						>
							<PopoverArrow />
							<PopoverBody>
								<span className="text-white text-xs">{popoverContent}</span>
							</PopoverBody>
						</PopoverContent>
					</Popover>
				)}
			</AlertDescription>
		</Alert>
	);
};
export default LowBalanceAlert;
