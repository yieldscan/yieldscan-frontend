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

const LowBalanceAlert = ({
	freeAmount,
	networkInfo,
	bondedAmount,
	amount,
	totalBalance,
}) => (
	<Alert
		status={
			get(freeAmount, "currency", 0) < networkInfo.minAmount
				? amount > get(bondedAmount, "currency", 0)
					? "error"
					: get(freeAmount, "currency", 0) > networkInfo.minAmount / 2
					? "warning"
					: "error"
				: "error"
		}
		rounded="md"
		flex
		flexDirection="column"
		alignItems="start"
		my={4}
	>
		<AlertTitle
			color={
				get(freeAmount, "currency", 0) < networkInfo.minAmount
					? amount > get(bondedAmount, "currency", 0)
						? "red.500"
						: get(freeAmount, "currency", 0) > networkInfo.minAmount / 2
						? "#FDB808"
						: "red.500"
					: "red.500"
			}
		>
			{get(freeAmount, "currency", 0) < networkInfo.minAmount
				? amount > get(bondedAmount, "currency", 0)
					? "Insufficient Balance"
					: get(freeAmount, "currency", 0) > networkInfo.minAmount / 2
					? "Low Balance"
					: "Insufficient Balance"
				: "Insufficient Balance"}
		</AlertTitle>
		<AlertDescription
			color={
				get(freeAmount, "currency", 0) < networkInfo.minAmount
					? amount > get(bondedAmount, "currency", 0)
						? "red.500"
						: get(freeAmount, "currency", 0) > networkInfo.minAmount / 2
						? "#FDB808"
						: "red.500"
					: "red.500"
			}
		>
			{get(freeAmount, "currency", 0) < networkInfo.minAmount
				? amount > get(bondedAmount, "currency", 0)
					? `You need an additional of ${formatCurrency.methods.formatAmount(
							Math.trunc(
								Number(amount - (totalBalance - networkInfo.minAmount)) *
									10 ** networkInfo.decimalPlaces
							),
							networkInfo
					  )} to proceed further.`
					: get(freeAmount, "currency", 0) > networkInfo.minAmount / 2
					? `Your available balance is low, we recommend to add more ${networkInfo.denom}'s`
					: `You need an additional of ${formatCurrency.methods.formatAmount(
							Math.trunc(
								Number(amount - (totalBalance - networkInfo.minAmount)) *
									10 ** networkInfo.decimalPlaces
							),
							networkInfo
					  )} to proceed further.`
				: `You need an additional of ${formatCurrency.methods.formatAmount(
						Math.trunc(
							Number(amount - (totalBalance - networkInfo.minAmount)) *
								10 ** networkInfo.decimalPlaces
						),
						networkInfo
				  )} to proceed further.`}{" "}
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
							{get(freeAmount, "currency", 0) < networkInfo.minAmount
								? amount > get(bondedAmount, "currency", 0)
									? "This is to ensure that you have a decent amount of funds in your account to pay transaction fees for claiming rewards, unbonding funds, changing on-chain staking preferences, etc."
									: "This is to ensure that you have a decent amount of funds in your account to pay transaction fees for claiming rewards, unbonding funds, changing on-chain staking preferences, etc."
								: "This is to ensure that you have a decent amount of funds in your account to pay transaction fees for claiming rewards, unbonding funds, changing on-chain staking preferences, etc."}
						</span>
					</PopoverBody>
				</PopoverContent>
			</Popover>
		</AlertDescription>
	</Alert>
);
export default LowBalanceAlert;
