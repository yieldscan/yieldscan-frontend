import {
	Avatar,
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@chakra-ui/core";
import {
	useAccounts,
	useCouncil,
	useNominatorsData,
	usePolkadotApi,
	useSelectedNetwork,
	useTransactionHash,
	useValidatorData,
	useNomMinStake,
	useOverviewData,
	useCoinGeckoPriceUSD,
	useAccountsBalances,
} from "@lib/store";
import { setCookie } from "nookies";
import { useState } from "react";
import { ChevronDown } from "react-feather";
import { getNetworkInfo, getAllNetworksInfo } from "yieldscan.config";

const NetworkPopover = ({ isExpanded, hasBorder }) => {
	const { setApiInstance } = usePolkadotApi();
	const { setValidatorMap, setValidators, setValidatorRiskSets } =
		useValidatorData();
	const { setUserData, setAllNominations } = useOverviewData();
	const { setCoinGeckoPriceUSD } = useCoinGeckoPriceUSD();
	const { setTransactionHash } = useTransactionHash();
	const { setNominatorsData, setNomLoading } = useNominatorsData();
	const { setCouncilMembers, setCouncilLoading } = useCouncil();
	const {
		accounts,
		accountsWithBalances,
		stashAccount,
		freeAmount,
		setFreeAmount,
		setBondedAmount,
		accountInfoLoading,
		setStashAccount,
		setAccounts,
		setAccountsWithBalances,
		setAccountInfoLoading,
	} = useAccounts();
	const { accountsBalances, setAccountsBalances } = useAccountsBalances();
	const { selectedNetwork, setSelectedNetwork } = useSelectedNetwork();
	const { setNomMinStake } = useNomMinStake();
	const networkInfo = getNetworkInfo(selectedNetwork);
	const supportedNetworksInfo = getAllNetworksInfo();
	const [isNetworkOpen, setIsNetworkOpen] = useState(false);

	const switchNetwork = (from, to) => {
		if (from !== to) {
			setApiInstance(null);
			setAccountsBalances({});
			setValidatorMap(undefined);
			setValidatorRiskSets(undefined);
			setValidators(undefined);
			setUserData(null);
			setAllNominations(null);
			// setNominatorsData(undefined);
			setNomLoading(true);
			setCookie(null, "networkName", to, {
				maxAge: 7 * 24 * 60 * 60,
			});
			setCouncilMembers(undefined);
			setTransactionHash(null);
			setCouncilLoading(true);
			setStashAccount(null);
			setFreeAmount(null);
			setBondedAmount(null);
			setAccounts(null);
			setCoinGeckoPriceUSD(null);
			setAccountsWithBalances(null);
			setAccountInfoLoading(false);
			setNomMinStake(null);
			setSelectedNetwork(to);
		}
		setIsNetworkOpen(!isNetworkOpen);
	};
	return (
		<Popover
			isOpen={isNetworkOpen}
			onClose={() => setIsNetworkOpen(false)}
			// onOpen={() => setIsStashPopoverOpen(true)}
		>
			<PopoverTrigger>
				<button
					className={`relative flex items-center rounded-full  ${
						hasBorder && "border border-gray-300 p-2 px-4"
					} font-semibold text-gray-800 z-20`}
					onClick={(e) => {
						e.preventDefault();
						setIsNetworkOpen(!isNetworkOpen);
					}}
				>
					<img
						src={`/images/${networkInfo.network}-logo.png`}
						alt={`${networkInfo.network}-logo`}
						className="mr-2 w-6 rounded-full"
					/>
					{isExpanded && <p className="font-normal mr-2">{selectedNetwork}</p>}
					<ChevronDown size="20px" />
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

export default NetworkPopover;
