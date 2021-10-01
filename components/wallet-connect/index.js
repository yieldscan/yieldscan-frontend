import { useState, useEffect } from "react";
import create from "zustand";
import { isNil, get } from "lodash";
import { ChevronLeft } from "react-feather";
import {
	Modal,
	ModalBody,
	ModalOverlay,
	ModalContent,
	ModalCloseButton,
	ModalHeader,
	Spinner,
	Box,
	SimpleGrid,
	Flex,
	Text,
	Button,
	Icon,
} from "@chakra-ui/core";
import { web3Enable, web3AccountsSubscribe } from "@polkadot/extension-dapp";
import { encodeAddress, decodeAddress } from "@polkadot/util-crypto";
import SelectAccount from "./SelectAccount";
import {
	useAccounts,
	useAccountsBalances,
	useAccountsControllerStashInfo,
	usePolkadotApi,
	useSelectedAccount,
	useWalletConnectState,
	useIsExistingUser,
} from "@lib/store";
import getFromLocalStorage from "@lib/getFromLocalStorage";
import addToLocalStorage from "@lib/addToLocalStorage";
import {
	trackEvent,
	Events,
	setUserProperties,
	track,
	goalCodes,
} from "@lib/analytics";
import { setCookie } from "nookies";
import { useRouter } from "next/router";
import axios from "@lib/axios";

const useWalletConnect = create((set) => ({
	isOpen: false,
	toggle: () => set((state) => ({ isOpen: !state.isOpen })),
	close: () => set(() => ({ isOpen: false })),
	open: () => set(() => ({ isOpen: true })),
}));

const WalletConnectStates = {
	REJECTED: "rejected",
	CONNECTED: "connected",
	GOTACCOUNTS: "gotaccounts",
	RECOVERAUTH: "recover",
};

const CheckIconInfo = ({ info }) => (
	<Flex flexDirection="row" alignItems="center" m={2}>
		<Icon name="check-circle" color="#2BCACA" />
		<Text ml={2} fontSize="xs" lineHeight="18px" color="gray.700">
			{info}
		</Text>
	</Flex>
);
const WalletConnectPopover = ({ styles, networkInfo, isSetUp }) => {
	const router = useRouter();
	const { isOpen, close } = useWalletConnect();
	const { walletConnectState, setWalletConnectState } = useWalletConnectState();
	const { accounts, setAccounts } = useAccounts();
	const { selectedAccount, setSelectedAccount } = useSelectedAccount();
	const { setIsExistingUser } = useIsExistingUser();
	const { accountsBalances } = useAccountsBalances();
	const { apiInstance } = usePolkadotApi();
	const { accountsControllerStashInfo } = useAccountsControllerStashInfo();
	const [state, setState] = useState();
	const [extensionEvent, setExtensionEvent] = useState();
	const [currentStep, setCurrentStep] = useState("beginnerInfo");
	// const [redirectToSetUp, setRedirectToSetUp] = useState(false);
	const [filteredAccounts, setFilteredAccounts] = useState(null);
	const [networkGenesisHash, setNetworkGenesisHash] = useState();

	const onEvent = (eventInfo) => {
		setExtensionEvent(eventInfo.message);
	};

	const userStorage = !isNil(typeof window) ? window.localStorage : null;
	const autoConnectEnabled = userStorage.getItem("autoConnectEnabled");
	const setAuthForAutoConnect = () => {
		if (!autoConnectEnabled || autoConnectEnabled !== "true")
			track(goalCodes.GLOBAL.WALLET_CONNECTED);
		userStorage.setItem("autoConnectEnabled", "true");
	};

	useEffect(() => {
		if (autoConnectEnabled) {
			setCurrentStep("connectWallet");
		} else {
			setCurrentStep("beginnerInfo");
		}
	}, [networkInfo]);

	useEffect(() => {
		async function getGenesisHash() {
			const genesisHash = (await apiInstance.genesisHash).toString();
			return genesisHash;
		}

		setNetworkGenesisHash(null);
		if (apiInstance) {
			getGenesisHash().then((genesisHash) =>
				setNetworkGenesisHash(genesisHash)
			);
		}
	}, [apiInstance, networkInfo]);

	useEffect(() => {
		if (currentStep === "connectWallet") {
			const createEventInstance = (message, ...params) => ({
				message,
				...params,
			});
			onEvent(createEventInstance("Waiting for authorization"));
			web3Enable("YieldScan").then((extension) => {
				setCurrentStep("checkWallet");
				if (extension.length === 0) {
					// setState(WalletConnectStates.REJECTED);
					setWalletConnectState("rejected");
					close();
					if (typeof window !== undefined) {
						trackEvent(Events.AUTH_REJECTED, {
							path: window.location.pathname,
						});
					}
				} else {
					// if (!autoConnectEnabled) {
					// 	setRedirectToSetUp(true);
					// }
					setWalletConnectState("connected");
					setAuthForAutoConnect();
					if (typeof window !== undefined) {
						trackEvent(Events.AUTH_ALLOWED, {
							path: window.location.pathname,
						});
					}
					isSetUp && close();
				}
			});
		}
	}, [currentStep]);

	useEffect(() => {
		let unsubscribe;
		if (walletConnectState === "connected" && networkGenesisHash) {
			web3AccountsSubscribe((injectedAccounts) => {
				injectedAccounts = injectedAccounts?.filter((account) => {
					return (
						isNil(account?.meta?.genesisHash) ||
						account?.meta?.genesisHash === "" ||
						account?.meta?.genesisHash?.toString() === networkGenesisHash
					);
				});
				injectedAccounts?.map((account) => {
					account.substrateAddress = account.address.toString();
					account.address = encodeAddress(
						decodeAddress(account.address.toString()),
						networkInfo.addressPrefix
					);
					return account;
				});
				setAccounts(injectedAccounts);
				// setState(WalletConnectStates.GOTACCOUNTS);
			}).then((u) => (unsubscribe = u));
		}
		return () => {
			unsubscribe && unsubscribe();
		};
	}, [walletConnectState, currentStep, networkInfo, networkGenesisHash]);

	useEffect(() => {
		if (accounts) {
			if (
				accounts?.filter(
					(account) =>
						account.address.toString() ===
						getFromLocalStorage(networkInfo.network, "selectedAccount")
				).length === 0
			) {
				setCookie(null, networkInfo.network + "Default", null, {
					maxAge: 7 * 24 * 60 * 60,
				});
				setSelectedAccount(null);
				addToLocalStorage(networkInfo.network, "selectedAccount", null);
				setIsExistingUser(null);
			} else {
				accounts
					.filter(
						(account) =>
							account.address ===
							getFromLocalStorage(networkInfo.network, "selectedAccount")
					)
					.map((account) => {
						setCookie(null, networkInfo.network + "Default", account.address, {
							maxAge: 7 * 24 * 60 * 60,
						});
						setSelectedAccount(account);
						addToLocalStorage(
							networkInfo.network,
							"selectedAccount",
							account.address
						);
						axios
							.get(
								`/${networkInfo.network}/user/existing-user/${account.address}`
							)
							.then(({ data }) => {
								setIsExistingUser(data.isExistingUser);
							})
							.catch((err) => {
								console.error(err);
								console.error("unable to get existing user status");
							});

						if (typeof window !== undefined) {
							trackEvent(Events.ACCOUNT_SELECTED, {
								path: window.location.pathname,
								address: account.address,
								network: networkInfo.name,
							});
						}
					});
			}
		}
	}, [accounts]);

	useEffect(() => {
		if (
			accounts &&
			Object.keys(accountsBalances).length > 0 &&
			Object.keys(accountsControllerStashInfo).length > 0
		) {
			const filteredAccounts = accounts.filter(
				(account) =>
					// accountsBalances[account.address]?.freeBalance.gte(
					// 	apiInstance?.consts.balances.existentialDeposit
					// ) &&
					!accountsControllerStashInfo[account.address]?.isController ||
					accountsControllerStashInfo[account.address]?.isSameStashController
			);
			setFilteredAccounts(filteredAccounts);
		} else setFilteredAccounts(null);
	}, [
		JSON.stringify(accounts),
		JSON.stringify(accountsControllerStashInfo),
		JSON.stringify(accountsBalances),
	]);

	const onAccountSelected = async (account) => {
		if (account) close();
		if (typeof window !== undefined) {
			track(goalCodes.GLOBAL.ACCOUNT_SELECTED);
			trackEvent(Events.ACCOUNT_SELECTED, {
				path: window.location.pathname,
				address: account.address,
				network: networkInfo.name,
			});
		}
		setCookie(null, networkInfo.network + "Default", account.address, {
			maxAge: 7 * 24 * 60 * 60,
		});
		setSelectedAccount(account);
		addToLocalStorage(networkInfo.network, "selectedAccount", account.address);

		axios
			.get(`/${networkInfo.network}/user/existing-user/${account.address}`)
			.then(({ data }) => {
				setIsExistingUser(data.isExistingUser);
			})
			.catch((err) => {
				console.error(err);
				console.error("unable to get existing user status");
			});
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={close}
			isCentered
			closeOnEsc={currentStep !== "connectWallet"}
			closeOnOverlayClick={currentStep !== "connectWallet"}
		>
			<ModalOverlay />
			<ModalContent rounded="lg" maxWidth="lg" {...styles} py={4}>
				<ModalHeader>
					<h3 className="px-3 text-2xl text-left text-gray-700 self-start">
						{currentStep === "beginnerInfo"
							? "What you should know"
							: isNil(walletConnectState) || walletConnectState === "rejected"
							? "Wallet Connect"
							: "Select Account"}
					</h3>
				</ModalHeader>
				{currentStep !== "connectWallet" && (
					<ModalCloseButton
						onClick={close}
						boxShadow="0 0 0 0 #fff"
						color="gray.400"
						backgroundColor="gray.100"
						rounded="1rem"
						mt={4}
						mr={4}
					/>
				)}
				<ModalBody>
					{currentStep === "beginnerInfo" ? (
						<SimpleGrid w="100%" columns={1} spacing={8}>
							<Box w="100%">
								<CheckIconInfo info="You keep ownership of your funds" />
							</Box>
							<Button
								w="100%"
								rounded="lg"
								color="white"
								bg="#2BCACA"
								alignItems="center"
								fontWeight="medium"
								textAlign="center"
								p={6}
								onClick={() => setCurrentStep("connectWallet")}
							>
								I understand, continue to authorize
							</Button>
						</SimpleGrid>
					) : walletConnectState === "connected" &&
					  !filteredAccounts &&
					  accounts?.length === 0 ? (
						<span className="flex flex-col items-center justify-center text-gray-700">
							NO ACCOUNTS AVAILABLE
						</span>
					) : walletConnectState === "connected" ? (
						<SelectAccount
							accounts={filteredAccounts ? filteredAccounts : accounts}
							onAccountSelected={onAccountSelected}
							networkInfo={networkInfo}
						/>
					) : (
						isNil(walletConnectState) && (
							<div className="h-64 flex text-left text-gray-700 flex-col justify-center items-center">
								<span className="loader"></span>
								<p className="text-gray-700 text-center mt-4">
									{extensionEvent}
								</p>
							</div>
						)
					)}
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};

export { WalletConnectPopover, useWalletConnect };
