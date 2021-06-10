import { Alert, AlertDescription, AlertIcon } from "@chakra-ui/core";
const InfoAlert = () => (
	<Alert
		color="gray.500"
		backgroundColor="white"
		border="1px solid #E2ECF9"
		borderRadius="8px"
		zIndex={1}
	>
		<AlertIcon name="info" color="#2BCACA" />
		<div>
			<AlertDescription fontSize="xs">
				Staking rewards usually start to show after 2-3 days. You can monitor
				them on your dashboard overview.
			</AlertDescription>
		</div>
	</Alert>
);
export default InfoAlert;
