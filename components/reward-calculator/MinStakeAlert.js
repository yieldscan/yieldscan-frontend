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

const MinStakeAlert = ({ networkInfo, nomMinStake }) => (
	<Alert
		status="warning"
		rounded="md"
		flex
		flexDirection="column"
		fontSize="sm"
		alignItems="start"
		my={4}
	>
		<AlertTitle color="#FDB808">
			Investment is less than the recommended minimum
		</AlertTitle>
		<AlertDescription color="#FDB808">
			{`We recommend investing at least ${formatCurrency.methods.formatAmount(
				Math.trunc(
					Number(nomMinStake + networkInfo.recommendedAdditionalAmount) *
						10 ** networkInfo.decimalPlaces
				),
				networkInfo
			)} to maximize the chances of
			receiving rewards.`}
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
							{`Current lowest amount staked is ${formatCurrency.methods.formatAmount(
								Math.trunc(
									Number(nomMinStake) * 10 ** networkInfo.decimalPlaces
								),
								networkInfo
							)}. With increased staking activity, to ensure that you remain a part of the elected network and recieve rewards for a longer period of time, we recommend staking ${
								networkInfo.recommendedAdditionalAmount
							} more than the current lowest staked amount.`}
						</span>
					</PopoverBody>
				</PopoverContent>
			</Popover>
		</AlertDescription>
	</Alert>
);
export default MinStakeAlert;
