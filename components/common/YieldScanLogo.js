import { Badge } from "@chakra-ui/core";
import ProgressiveImage from "react-progressive-image";
import Link from "next/link";
import Image from "next/image";

const YieldScanLogo = () => {
	return (
		<Link href="/">
			<a className="flex items-center">
				<Image
					src="/images/yieldscan-logo.svg"
					alt="Yieldscan Logo"
					width="40"
					height="40"
				/>
				<span className="ml-2 font-medium hidden md:flex items-center">
					YieldScan
					<Badge
						ml={2}
						textTransform="lowercase"
						fontWeight="normal"
						color="white"
						bg="blue.400"
					>
						beta
					</Badge>
				</span>
			</a>
		</Link>
	);
};
export default YieldScanLogo;
