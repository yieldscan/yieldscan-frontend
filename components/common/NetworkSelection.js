import { ChevronDown } from "react-feather";
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
	Avatar,
} from "@chakra-ui/core";
const NetworkSelection = ({
	isNetworkOpen,
	setIsNetworkOpen,
	networkInfo,
	supportedNetworksInfo,
	switchNetwork,
	isSetUp,
	walletType,
	selectedNetwork,
}) => {
	return (
		<Popover
			isOpen={isNetworkOpen}
			onClose={() => setIsNetworkOpen(false)}
			// onOpen={() => setIsStashPopoverOpen(true)}
		>
			<PopoverTrigger>
				<button
					className={`relative flex flex-row items-center ${
						isSetUp ? "cursor-default" : "rounded-full border border-gray-300"
					} p-2 px-4 font-semibold text-gray-800 z-20`}
					onClick={() => !isSetUp && setIsNetworkOpen(!isNetworkOpen)}
				>
					<div>
						<img
							src={`/images/${networkInfo.network}-logo.png`}
							alt={`${networkInfo.network}-logo`}
							className="mr-2 w-6 rounded-full"
						/>
					</div>
					{!isSetUp && (
						<div>
							<ChevronDown size="20px" />
						</div>
					)}
				</button>
			</PopoverTrigger>
			<PopoverContent
				zIndex={50}
				maxWidth="20rem"
				minWidth="8rem"
				backgroundColor="gray.700"
				border="none"
			>
				<p className="text-white text-xxs tracking-widest pt-2 pl-2">
					NETWORKS
				</p>
				<div
					className="py-1"
					role="menu"
					aria-orientation="vertical"
					aria-labelledby="options-menu"
				>
					{supportedNetworksInfo.map((x) => {
						if (process.env.NODE_ENV !== "production" || !x.isTestNetwork) {
							return (
								<button
									key={x.name}
									className={`flex items-center px-4 py-2 text-white text-sm leading-5 ${
										selectedNetwork === x.name
											? "cursor-default bg-gray-600"
											: "hover:bg-gray-700 focus:bg-gray-700"
									}  focus:outline-none w-full`}
									role="menuitem"
									onClick={() => switchNetwork(selectedNetwork, x.name)}
								>
									<Avatar
										name={x.name}
										src={`/images/${x.network}-logo.png`}
										size="sm"
										mr={2}
									/>
									<span>{x.name}</span>
								</button>
							);
						} else return <></>;
					})}
				</div>
			</PopoverContent>
		</Popover>
	);
};
export default NetworkSelection;
