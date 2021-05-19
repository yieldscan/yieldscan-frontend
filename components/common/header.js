import React from "react";
import {
	useAccounts,
	useHeaderLoading,
	usePolkadotApi,
	useSelectedNetwork,
	useNetworkElection,
	useValidatorData,
	useTransactionHash,
	useNominatorsData,
	useNomMinStake,
	useOverviewData,
	useCouncil,
	useCoinGeckoPriceUSD,
	useAccountsBalances,
	useSelectedAccount,
	useAccountsStakingInfo,
	useAccountsStakingLedgerInfo,
} from "@lib/store";
import { get, isNil } from "lodash";
import { ChevronDown, Settings, Menu } from "react-feather";
import {
	WalletConnectPopover,
	useWalletConnect,
} from "@components/wallet-connect";
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
	useDisclosure,
	Avatar,
	Image,
	IconButton,
	DrawerOverlay,
	DrawerContent,
	DrawerCloseButton,
	DrawerHeader,
	DrawerBody,
	DrawerFooter,
	Drawer,
	Skeleton,
	Text,
} from "@chakra-ui/core";
import Identicon from "@components/common/Identicon";
import EditControllerModal from "@components/overview/EditControllerModal";
import { useEffect, useState } from "react";
import formatCurrency from "@lib/format-currency";
import Routes from "@lib/routes";
import Link from "next/link";
import createPolkadotAPIInstance from "@lib/polkadot-api";
import { getNetworkInfo, getAllNetworksInfo } from "yieldscan.config";
import { setCookie } from "nookies";
import Account from "./account";
import SideMenu from "./sidemenu";
import SideMenuFooter from "./side-menu-footer";
import addToLocalStorage from "@lib/addToLocalStorage";
import YieldScanLogo from "./YieldScanLogo";
import NetworkSelection from "./NetworkSelection";
import AccountSelection from "./AccountSelection";

const Header = ({ isBase }) => {
	const userStorage = !isNil(typeof window) ? window.localStorage : null;
	const { selectedNetwork, setSelectedNetwork } = useSelectedNetwork();
	const { setValidators, setValidatorMap, setValidatorRiskSets } =
		useValidatorData();
	const { setUserData, setAllNominations } = useOverviewData();
	const { setTransactionHash } = useTransactionHash();
	const { setNominatorsData, setNomLoading } = useNominatorsData();
	const { setCouncilMembers, setCouncilLoading } = useCouncil();
	const networkInfo = getNetworkInfo(selectedNetwork);
	const supportedNetworksInfo = getAllNetworksInfo();
	const { apiInstance, setApiInstance } = usePolkadotApi();
	const { isOpen, toggle } = useWalletConnect();
	const { setIsInElection } = useNetworkElection();
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
	const { selectedAccount, setSelectedAccount } = useSelectedAccount();
	const { accountsBalances, setAccountsBalances } = useAccountsBalances();
	const { accountsStakingInfo, setAccountsStakingInfo } =
		useAccountsStakingInfo();
	const { accountsStakingLedgerInfo, setAccountsStakingLedgerInfo } =
		useAccountsStakingLedgerInfo();
	const { coinGeckoPriceUSD, setCoinGeckoPriceUSD } = useCoinGeckoPriceUSD();
	const { headerLoading } = useHeaderLoading();
	const {
		isOpen: editControllerModalOpen,
		onClose: closeEditControllerModal,
		onToggle: toggleEditControllerModal,
	} = useDisclosure();

	const { setNomMinStake } = useNomMinStake();

	const [accountsWithoutCurrent, setAccountsWithoutCurrent] = useState([]);

	const stashAddress = get(stashAccount, "address");

	const [isStashPopoverOpen, setIsStashPopoverOpen] = useState(false);
	const [isNetworkOpen, setIsNetworkOpen] = useState(false);
	const [isBonded, setIsBonded] = useState(false);

	const {
		isOpen: navIsOpen,
		onOpen: navOnOpen,
		onClose: navOnClose,
	} = useDisclosure();
	const btnRef = React.useRef();

	const switchNetwork = async (from, to) => {
		if (from !== to) {
			await apiInstance.disconnect().catch((err) => console.log(err));
			setApiInstance(null);
			setSelectedAccount(null);
			setAccountsBalances({});
			setAccountsStakingInfo({});
			setAccountsStakingLedgerInfo({});
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
			// setAccountInfoLoading(false);
			setNomMinStake(null);
			setSelectedNetwork(to);
		}
		setIsNetworkOpen(!isNetworkOpen);
	};

	return (
		<div
			className={`header flex items-center justify-between text-gray-700 ${
				!isBase
					? "border border-bottom border-gray-200"
					: "max-w-65-rem xl:px-0"
			} bg-white px-8 py-8 h-12 mx-auto`}
		>
			{/* Wallet Connect */}
			{!isBase &&
				(isOpen || !isNil(userStorage.getItem("autoConnectEnabled"))) && (
					<WalletConnectPopover isOpen={isOpen} networkInfo={networkInfo} />
				)}
			{/* Edit Controller */}
			{/* <EditControllerModal
				isOpen={editControllerModalOpen}
				close={closeEditControllerModal}
				networkInfo={networkInfo}
			/> */}
			{/* Account returns null, maybe replace with a custom hook */}
			{!isNil(apiInstance)
				? accounts?.map((account) => (
						<Account
							account={account}
							api={apiInstance}
							accountsBalances={accountsBalances}
							setAccountsBalances={(info) => setAccountsBalances(info)}
							accountsStakingInfo={accountsStakingInfo}
							setAccountsStakingInfo={(info) => setAccountsStakingInfo(info)}
							accountsStakingLedgerInfo={accountsStakingLedgerInfo}
							setAccountsStakingLedgerInfo={(info) =>
								setAccountsStakingLedgerInfo(info)
							}
						/>
				  ))
				: null}
			{/* YieldScan Logo */}
			<div className="flex items-center">
				{!isBase && (
					<>
						<IconButton
							ref={btnRef}
							colorScheme="gray"
							variant="link"
							onClick={navOnOpen}
							icon={Menu}
							_focus={{ boxShadow: "none" }}
							mr={4}
							px={0}
							display={{ base: "inline", xl: "none" }}
						/>
						<Drawer
							isOpen={navIsOpen}
							placement="left"
							onClose={navOnClose}
							finalFocusRef={btnRef}
						>
							<DrawerOverlay />
							<DrawerContent>
								<DrawerCloseButton
									onClick={close}
									boxShadow="0 0 0 0 #fff"
									color="gray.400"
									backgroundColor="gray.100"
								/>
								<DrawerHeader>
									<YieldScanLogo />
								</DrawerHeader>

								<DrawerBody px={0}>
									<SideMenu />
								</DrawerBody>

								<DrawerFooter px={0}>
									<SideMenuFooter />
								</DrawerFooter>
							</DrawerContent>
						</Drawer>
					</>
				)}
				<YieldScanLogo />
			</div>
			{/* Header main content */}
			{isBase ? (
				// Home page dashboard button
				<Link href={Routes.OVERVIEW}>
					<a className="border border-gray-200 rounded-full py-2 px-4">
						Dashboard
					</a>
				</Link>
			) : (
				// network and account selection
				<div className="flex">
					{/* Account Selection */}
					<AccountSelection
						accounts={accounts}
						toggle={toggle}
						isStashPopoverOpen={isStashPopoverOpen}
						selectedAccount={selectedAccount}
						networkInfo={networkInfo}
						accountsBalances={accountsBalances}
						setTransactionHash={(info) => setTransactionHash(info)}
						setIsStashPopoverOpen={(info) => setIsStashPopoverOpen(info)}
						setSelectedAccount={(info) => setSelectedAccount(info)}
					/>
					<div className="relative">
						<NetworkSelection
							isNetworkOpen={isNetworkOpen}
							setIsNetworkOpen={setIsNetworkOpen}
							networkInfo={networkInfo}
							supportedNetworksInfo={supportedNetworksInfo}
							switchNetwork={switchNetwork}
							selectedNetwork={selectedNetwork}
						/>
					</div>
					{false && !isNil(selectedAccount) && isBonded && (
						<Popover trigger="click">
							<PopoverTrigger>
								<button className="flex items-center ml-5 p-2 font-semibold text-gray-800">
									<Settings size="20px" />
								</button>
							</PopoverTrigger>
							<PopoverContent
								zIndex={50}
								width="12rem"
								backgroundColor="gray.700"
							>
								<div className="flex flex-col items-center justify-center my-2 bg-gray-800 text-white w-full">
									<button
										className="flex items-center px-4 py-2 text-white text-sm leading-5 bg-gray-800 hover:bg-gray-700 focus:outline-none cursor-pointer w-full"
										onClick={toggleEditControllerModal}
									>
										Edit Controller
									</button>
								</div>
							</PopoverContent>
						</Popover>
					)}
				</div>
			)}{" "}
		</div>
	);
};

export default Header;
