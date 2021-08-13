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
	const [popoverContent, setPopoverContent] = useState();

	useEffect(() => {
		if (amount !=0 && amount && (amount > totalPossibleStakingAmount - networkInfo.minAmount)
			&& (totalAvailableStakingAmount - networkInfo.minAmount > 0)){
			setStatus("error");
			setTitleColor("red.500");
			setTitle("Insufficient Balance");
			setDescriptionColor("red.500");
			setDescription(
				`Your inputted amount is more than your available free 
				account balance of ${totalAvailableStakingAmount} ${networkInfo.denom} minus 
				${networkInfo.minAmount} ${networkInfo.denom}. Press the max 
				icon to autofill the maximum amount. `
			); // Using the full amount here to prevent any confusion
			
			setPopoverContent(`The subtracted
			${networkInfo.minAmount} ${networkInfo.denom} is a reserve to ensure that you have a 
			decent amount of funds in your
			account to pay transaction fees for claiming rewards, unbonding
			funds, changing on-chain staking preferences, etc.`)
		}
		
		else if (amount == 0 || amount < networkInfo.minPossibleStake + 
					networkInfo.minAmount){
			setStatus("error");
			setTitleColor("red.500");
			setDescriptionColor("red.500");
			if(activeBondedAmount > 0){
				setTitle("Current amount insufficient to stake anymore");
				setDescription(
					`Head over to the Overview page and bond an additional 
					${formatCurrency.methods
						.formatAmount(Math.trunc(Number(networkInfo.minPossibleStake
							- activeBondedAmount) *
							10 ** networkInfo.decimalPlaces
							),
							networkInfo
							)} continue staking. `
				);
				setPopoverContent(`The ${networkInfo.name} network has set a minimum staking 
				threshold of ${networkInfo.minPossibleStake} ${networkInfo.denom}.`)
			}
			else {
				setTitle("Amount insufficient to begin staking");
				setDescription(
					`You need minimum free ${formatCurrency.methods.formatAmount(
						Math.trunc(
							Number(networkInfo.minPossibleStake + networkInfo.minAmount) *
								10 ** networkInfo.decimalPlaces
						),
						networkInfo
					)} to begin staking. `
				);
				setPopoverContent(`The ${networkInfo.name} network has a minimum staking 
				threshold of ${networkInfo.minPossibleStake} ${networkInfo.denom}. The additional
				${networkInfo.minAmount} ${networkInfo.denom} is to ensure that you have a 
				decent amount of funds in your
				account to pay transaction fees for claiming rewards, unbonding
				funds, changing on-chain staking preferences, etc.`)
			}
		// } else if (
		// 	activeBondedAmount >
		// 	totalPossibleStakingAmount - networkInfo.minAmount
		// ) {
		// 	if (totalAvailableStakingAmount < networkInfo.minAmount / 2) {
		// 		setStatus("error");
		// 		setTitleColor("red.500");
		// 		setTitle("Insufficient Balance");
		// 		setDescriptionColor("red.500");
		// 		setDescription(
		// 			`You need an additional of ${formatCurrency.methods.formatAmount(
		// 				Math.trunc(
		// 					Number(networkInfo.minAmount - totalAvailableStakingAmount) *
		// 						10 ** networkInfo.decimalPlaces
		// 				),
		// 				networkInfo
		// 			)} to proceed further.`
		// 		);
		// 	} else {
		// 		setStatus("warning");
		// 		setTitleColor("#FDB808");
		// 		setTitle("Low Balance");
		// 		setDescriptionColor("#FDB808");
		// 		setDescription(
		// 			`Your available balance is low, we recommend to add more 
		// 			${networkInfo.denom}s`
		// 		);
		// 	}
		// } else if (amount > totalPossibleStakingAmount - networkInfo.minAmount) {
		// 	setStatus("error");
		// 	setTitleColor("red.500");
		// 	setTitle("Insufficient Balance");
		// 	setDescriptionColor("red.500");
		// 	setDescription(
		// 		`You need an additional of ${formatCurrency.methods.formatAmount(
		// 			Math.trunc(
		// 				Number(
		// 					amount - (totalPossibleStakingAmount - networkInfo.minAmount)
		// 				) *
		// 					10 ** networkInfo.decimalPlaces
		// 			),
		// 			networkInfo
		// 		)} to proceed further.`
		// 	);
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
								{popoverContent}
							</span>
						</PopoverBody>
					</PopoverContent>
				</Popover>
			</AlertDescription>
		</Alert>
	);
};
export default LowBalanceAlert;
