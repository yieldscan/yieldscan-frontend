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
	Badge,
} from "@chakra-ui/core";
import Identicon from "@components/common/Identicon";
import EditControllerModal from "@components/overview/EditControllerModal";
import { useEffect, useState } from "react";
import formatCurrency from "@lib/format-currency";
import convertCurrency from "@lib/convert-currency";
import Routes from "@lib/routes";
import Link from "next/link";
import createPolkadotAPIInstance from "@lib/polkadot-api";
import { getNetworkInfo, getAllNetworksInfo } from "yieldscan.config";
import { setCookie, parseCookies } from "nookies";
import SideMenu from "./sidemenu";
import SideMenuFooter from "./side-menu-footer";
import ProgressiveImage from "react-progressive-image";

const Header = ({ isBase }) => {
	const cookies = parseCookies();
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

	const switchNetwork = (from, to) => {
		if (from !== to) {
			setApiInstance(null);
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
			setAccountsWithBalances(null);
			setAccountInfoLoading(false);
			setNomMinStake(null);
			setSelectedNetwork(to);
		}
		setIsNetworkOpen(!isNetworkOpen);
	};

	useEffect(() => {
		if (accounts) {
			const accountsWithoutCurrent =
				accountsWithBalances !== null
					? accountsWithBalances.filter(
							(account) => stashAddress && account.address !== stashAddress
					  )
					: accounts.filter(
							(account) => stashAddress && account.address !== stashAddress
					  );
			setAccountsWithoutCurrent(accountsWithoutCurrent);
		}
	}, [stashAccount, networkInfo]);

	useEffect(() => {
		if (accountsWithBalances && stashAccount) {
			accountsWithBalances
				.filter(
					(account) =>
						account.address == get(cookies, networkInfo.network + "Default")
				)
				.map((account) => {
					setStashAccount(account);
					if (account.balances) {
						/**
						 * `freeBalance` here includes `locked` balance also - that's how polkadot API is currently working
						 *  so we need to subtract the `bondedBalance``
						 */
						// TODO: why is freeAmount being calculated at multiple places
						const calcFreeAmountInCurrency = Number(
							(parseInt(account.balances.availableBalance) +
								parseInt(account.balances.vestingLocked)) /
								Math.pow(10, networkInfo.decimalPlaces)
						);
						convertCurrency(
							calcFreeAmountInCurrency,
							networkInfo.coinGeckoDenom
						).then((value) => {
							const calcFreeAmount = {
								currency: calcFreeAmountInCurrency,
								subCurrency: value,
							};
							if (calcFreeAmount !== freeAmount) {
								setFreeAmount(calcFreeAmount);
							}
						});
					}
				});
		}
	}, [stashAccount]);

	useEffect(() => {
		if (stashAccount) {
			createPolkadotAPIInstance(networkInfo, apiInstance).then((api) => {
				setApiInstance(api);
				api.query.staking
					.bonded(stashAccount.address)
					.then(({ isSome }) => {
						setIsBonded(isSome);
					})
					.catch((error) => {
						console.error("Something went wrong,", error);
					});
				// TODO: handle era election station w.r.t the new changes
				// networkInfo.network !== "westend" &&
				// 	api.query.staking.eraElectionStatus().then((data) => {
				// 		setIsInElection(data.isOpen);
				// 	});
			});
		}
	}, [stashAccount, networkInfo]);

	return (
		<div
			className={`header flex items-center justify-between text-gray-700 ${
				!isBase
					? "border border-bottom border-gray-200"
					: "max-w-65-rem xl:px-0"
			} bg-white px-8 py-8 h-12 mx-auto`}
		>
			{!isBase && (isOpen || !isNil(cookies.isAuthorized)) && (
				<WalletConnectPopover
					isOpen={isOpen}
					networkInfo={networkInfo}
					cookies={cookies}
				/>
			)}
			<EditControllerModal
				isOpen={editControllerModalOpen}
				close={closeEditControllerModal}
				networkInfo={networkInfo}
			/>
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
									<Link href="/">
										<a className="flex items-center">
											{/* <Image
												src="/images/yieldscan-logo.svg"
												alt="YieldScan Logo"
											/> */}
											<ProgressiveImage
												src="/images/yieldscan-logo.svg"
												placeholder="/favicon-32x32.png"
											>
												{(src) => <img src={src} alt="an image" />}
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
				<Link href="/">
					<a className="flex items-center">
						{/* <Image src="/images/yieldscan-logo.svg" alt="YieldScan Logo" /> */}
						<ProgressiveImage
							src="/images/yieldscan-logo.svg"
							placeholder="/images/../favicon-16x16.png"
						>
							{(src) => (
								<img
									src={src}
									alt="Yieldscan Logo"
									width="41px"
									height="41px"
								/>
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
			</div>
			{!accountInfoLoading && !headerLoading && isBase ? (
				<Link href={Routes.OVERVIEW}>
					<a className="border border-gray-200 rounded-full py-2 px-4">
						Dashboard
					</a>
				</Link>
			) : (
				!accountInfoLoading &&
				!headerLoading && (
					<div className="flex">
						{isNil(accounts) ? (
							<button
								className="rounded-full border border-gray-300 p-2 px-4 font-medium text-gray-800 mr-4"
								onClick={toggle}
							>
								Connect Wallet
							</button>
						) : isNil(stashAccount) ? (
							<Popover
								isOpen={isStashPopoverOpen}
								onClose={() => setIsStashPopoverOpen(false)}
								onOpen={() => setIsStashPopoverOpen(true)}
							>
								<PopoverTrigger>
									<button className="rounded-full flex items-center mr-8 font-medium">
										Select Account
										<ChevronDown size="20px" className="ml-2" />
									</button>
								</PopoverTrigger>
								<PopoverContent
									zIndex={50}
									maxWidth="20rem"
									backgroundColor="gray.700"
									border="none"
								>
									<p className="text-white text-xxs tracking-widest pt-2 pl-2">
										ACCOUNTS
									</p>
									<div className="flex flex-col justify-center my-2 text-white w-full">
										{accounts.map((account) => (
											<React.Fragment key={account.address}>
												<button
													className="flex items-center rounded px-4 py-2 w-full bg-gray-800 hover:bg-gray-700 hover:text-gray-200"
													onClick={() => {
														setStashAccount(account);
														setCookie(
															null,
															networkInfo.network + "Default",
															account.address,
															{ maxAge: 7 * 24 * 60 * 60 }
														);
														setIsStashPopoverOpen(false);
													}}
												>
													<Identicon address={account.address} size="32" />
													<span className="flex flex-col items-start w-1/2 ml-2">
														<span className="truncate w-full text-left pr-1">
															{account.meta.name}
														</span>
														{account.balances ? (
															<p className="text-xs text-gray-500">
																{formatCurrency.methods.formatAmount(
																	Math.trunc(
																		parseInt(account.balances.freeBalance) +
																			parseInt(account.balances.reservedBalance)
																	),
																	networkInfo
																)}{" "}
																{formatCurrency.methods.formatAmount(
																	Math.trunc(
																		parseInt(account.balances.freeBalance) +
																			parseInt(account.balances.reservedBalance)
																	),
																	networkInfo
																) === "0" && get(networkInfo, "denom")}
															</p>
														) : (
															<div>
																<Skeleton>
																	<Text className="text-xxs w-20">
																		Loading...
																	</Text>
																</Skeleton>
															</div>
														)}
													</span>
													<span className="text-xs text-gray-500 w-1/2 text-right">
														{account.address.slice(0, 6) +
															"..." +
															account.address.slice(-6)}
													</span>
												</button>
												{accountsWithoutCurrent[
													accountsWithoutCurrent.length - 1
												] !== account && <hr className="border-gray-700" />}
											</React.Fragment>
										))}
									</div>
								</PopoverContent>
							</Popover>
						) : (
							<Popover
								isOpen={isStashPopoverOpen}
								onClose={() => setIsStashPopoverOpen(false)}
								onOpen={() => setIsStashPopoverOpen(true)}
							>
								<PopoverTrigger>
									<button className="flex items-center mr-8">
										<Identicon address={get(stashAccount, "address")} />
										<div className="cursor-pointer ml-2 text-left">
											<h3 className="flex items-center text-gray-700 font-medium -mb-1">
												{get(stashAccount, "meta.name", "")}
											</h3>
											{accountsWithBalances && (
												<span className="text-gray-600 text-xs">
													Total:{" "}
													{formatCurrency.methods.formatAmount(
														parseInt(
															accountsWithBalances.filter(
																(account) =>
																	stashAccount.address &&
																	account.address == stashAccount.address
															)[0].balances.freeBalance
														) +
															parseInt(
																accountsWithBalances.filter(
																	(account) =>
																		stashAccount.address &&
																		account.address == stashAccount.address
																)[0].balances.reservedBalance
															),
														networkInfo
													)}
												</span>
											)}
										</div>
										<ChevronDown size="20px" className="ml-4" />
									</button>
								</PopoverTrigger>
								<PopoverContent
									zIndex={50}
									maxWidth="20rem"
									backgroundColor="gray.700"
									border="none"
								>
									<p className="text-white text-xxs tracking-widest pt-2 pl-2">
										ACCOUNTS
									</p>
									<div className="flex flex-col justify-center my-2 text-white w-full">
										{accountsWithoutCurrent.map((account) => (
											<React.Fragment key={account.address}>
												<button
													className="flex items-center rounded px-4 py-2 w-full bg-gray-800 hover:bg-gray-700 hover:text-gray-200"
													onClick={() => {
														setBondedAmount(null);
														setStashAccount(account);
														setTransactionHash(null);
														setCookie(
															null,
															networkInfo.network + "Default",
															account.address,
															{ maxAge: 7 * 24 * 60 * 60 }
														);
														setIsStashPopoverOpen(false);
													}}
												>
													<Identicon address={account.address} size="32" />
													<span className="flex flex-col items-start w-1/2 ml-2">
														<span className="truncate w-full text-left pr-1">
															{account.meta.name}
														</span>
														{account.balances ? (
															<p className="text-xs text-gray-500">
																{formatCurrency.methods.formatAmount(
																	parseInt(account.balances.freeBalance) +
																		parseInt(account.balances.reservedBalance),
																	networkInfo
																)}{" "}
																{formatCurrency.methods.formatAmount(
																	parseInt(account.balances.freeBalance) +
																		parseInt(account.balances.reservedBalance),
																	networkInfo
																) === "0" && get(networkInfo, "denom")}
															</p>
														) : (
															<Skeleton>
																<p>Loading...</p>
															</Skeleton>
														)}
													</span>
													<span className="text-xs text-gray-500 w-1/2 text-right">
														{account.address.slice(0, 6) +
															"..." +
															account.address.slice(-6)}
													</span>
												</button>
												{accountsWithoutCurrent[
													accountsWithoutCurrent.length - 1
												] !== account && <hr className="border-gray-700" />}
											</React.Fragment>
										))}
									</div>
								</PopoverContent>
							</Popover>
						)}

						<div className="relative">
							<Popover
								isOpen={isNetworkOpen}
								onClose={() => setIsNetworkOpen(false)}
								// onOpen={() => setIsStashPopoverOpen(true)}
							>
								<PopoverTrigger>
									<button
										className="relative flex items-center rounded-full border border-gray-300 p-2 px-4 font-semibold text-gray-800 z-20"
										onClick={() => {
											setIsNetworkOpen(!isNetworkOpen);
										}}
									>
										<img
											src={`/images/${networkInfo.network}-logo.png`}
											alt={`${networkInfo.network}-logo`}
											className="mr-2 w-6 rounded-full"
										/>
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
											if (
												process.env.NODE_ENV !== "production" ||
												!x.isTestNetwork
											) {
												return (
													<button
														className={`flex items-center px-4 py-2 text-white text-sm leading-5 ${
															selectedNetwork === x.name
																? "cursor-default bg-gray-600"
																: "hover:bg-gray-700 focus:bg-gray-700"
														}  focus:outline-none w-full`}
														role="menuitem"
														onClick={() =>
															switchNetwork(selectedNetwork, x.name)
														}
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
						</div>
						{!isNil(stashAccount) && isBonded && (
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
				)
			)}{" "}
		</div>
	);
};

export default Header;
