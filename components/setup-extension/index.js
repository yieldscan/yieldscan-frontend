import { Box, Button, Flex, Icon, Image } from "@chakra-ui/core";
import { ChevronLeft } from "react-feather";

const SetupExtension = () => {
	return (
		<Box w="100%" h="100%" display="flex" justifyContent="space-evenly">
			<Box
				w="100%"
				h="100%"
				display="flex"
				flexDirection="column"
				flex={1}
				maxW="65rem"
			>
				<Box w="100%" p="8">
					<Button
						leftIcon="chevron-left"
						size="sm"
						color="gray.700"
						rounded="full"
					>
						back
					</Button>
				</Box>
				<Box
					display="flex"
					flexDirection="row"
					w="100%"
					flex={1}
					p="8"
					alignItems="center"
					justifyContent="space-evenly"
				>
					<Box>No Crypto Wallet</Box>
					<Box>OR</Box>
					<Box>Using Ledger</Box>
				</Box>
			</Box>
		</Box>
	);
};

export default SetupExtension;
