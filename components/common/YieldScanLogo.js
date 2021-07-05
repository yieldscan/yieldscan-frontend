import { Badge } from "@chakra-ui/core";
import ProgressiveImage from "react-progressive-image";
import Link from "next/link";

const YieldScanLogo = () => {
	return (
		<Link href="/">
			<a className="flex items-center">
				<ProgressiveImage
					src="/images/yieldscan-logo.svg"
					placeholder="/images/favicon-32x32.png"
				>
					{(src) => (
						<img src={src} alt="Yieldscan Logo" width="41px" height="41px" />
					)}
				</ProgressiveImage>
				<span className="ml-2 font-medium flex items-center">
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
