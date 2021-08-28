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
	controllerAvailableAmount,
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
				minPossibleStake + networkInfo.reserveAmount
			) {
				setStatus("error");
				setTitleColor("red.500");
				setDescriptionColor("red.500");
				setTitle("Amount insufficient to begin staking");
				setDescription(
					`You need a minimum of ${minPossibleStake} ${networkInfo.denom}
					to begin staking. `
				);
				setPopoverContent(`The ${networkInfo.name} network has a minimum staking
				threshold of ${minPossibleStake} ${networkInfo.denom}.`);
			} else if (amount < minPossibleStake) {
				setStatus("error");
				setTitleColor("red.500");
				setTitle("Insufficient Amount");
				setDescriptionColor("red.500");
				setDescription(
					`Your inputted amount is less than the minimum allowed staking amount of ${formatCurrency.methods.formatAmount(
						Math.trunc(
							Number(minPossibleStake) * 10 ** networkInfo.decimalPlaces
						),
						networkInfo
					)}. `
				);
				setPopoverContent(
					`${
						networkInfo.name
					} network doesn't allow staking of amounts less than ${formatCurrency.methods.formatAmount(
						Math.trunc(
							Number(minPossibleStake) * 10 ** networkInfo.decimalPlaces
						),
						networkInfo
					)}.`
				);
			} else if (
				amount >
				totalPossibleStakingAmount - networkInfo.reserveAmount
			) {
				setStatus("error");
				setTitleColor("red.500");
				setTitle("Insufficient Balance");
				setDescriptionColor("red.500");
				setDescription(
					`Your inputted amount is more than your available free
				account balance of ${formatCurrency.methods.formatAmount(
					Math.trunc(
						Number(totalPossibleStakingAmount) * 10 ** networkInfo.decimalPlaces
					),
					networkInfo
				)} minus
				${networkInfo.reserveAmount} ${networkInfo.denom}. Press the max
				icon to autofill the maximum amount. `
				);
				setPopoverContent(`The subtracted
			${networkInfo.reserveAmount} ${networkInfo.denom} is a reserve to ensure that you have a
			decent amount of funds in your
			account to pay transaction fees for claiming rewards, unbonding
			funds, changing on-chain staking preferences, etc.`);
			} else setStatus(null);
		} else {
			if (controllerUnavailable) {
				setStatus("warning");
				setTitleColor("#FDB808");
				setTitle("Controller not found");
				setDescriptionColor("#FDB808");
				setDescription(
					`Existing controller account not found.
				Either import the existing controller account or proceed to change controller. `
				);
				setPopoverContent(null);
			} else if (activeBondedAmount < minPossibleStake) {
				setStatus("error");
				setTitleColor("red.500");
				setTitle("Insufficient Balance");
				setDescriptionColor("red.500");
				setDescription(
					`Your active bonded amount is less than min allowed staking amount of ${formatCurrency.methods.formatAmount(
						Math.trunc(
							Number(minPossibleStake) * 10 ** networkInfo.decimalPlaces
						),
						networkInfo
					)}. Go to overview page to invest more.`
				);
				setPopoverContent(null);
			} else if (controllerAvailableAmount < networkInfo.reserveAmount / 2) {
				setStatus("error");
				setTitleColor("red.500");
				setTitle("Insufficient Balance");
				setDescriptionColor("red.500");
				setDescription(
					`You need an additional ${formatCurrency.methods.formatAmount(
						Math.trunc(
							Number(networkInfo.reserveAmount - controllerAvailableAmount) *
								10 ** networkInfo.decimalPlaces
						),
						networkInfo
					)} to proceed further. `
				);
				setPopoverContent(`This is to ensure that you have a
							decent amount of funds in your
							account to pay transaction fees for claiming rewards, unbonding
							funds, changing on-chain staking preferences, etc.`);
			} else if (controllerAvailableAmount < networkInfo.reserveAmount) {
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

	return !status ? null : (
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
