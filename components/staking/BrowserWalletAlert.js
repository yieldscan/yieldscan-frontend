import {
	Alert,
	AlertDescription,
	AlertIcon,
	AlertTitle,
} from "@chakra-ui/core";

const BrowserWalletAlert = ({ networkInfo, stakingAmount }) => (
	<Alert
		status="warning"
		color="#FDB808"
		backgroundColor="#FFF4DA"
		borderRadius="8px"
		zIndex={1}
	>
		<AlertIcon name="warning-2" color />
		<div>
			<AlertTitle fontSize="sm">{"CAUTION: Funds at risk"}</AlertTitle>
			<AlertDescription fontSize="xs">
				<p>
					You’re trying to stake {stakingAmount.toFixed(4)} {networkInfo.denom}{" "}
					using a software wallet. We recommend using a Ledger hardware wallet
					to store your funds securely, isolated from your easy-to-hack
					computer.
				</p>
			</AlertDescription>
		</div>
	</Alert>
);
export default BrowserWalletAlert;
