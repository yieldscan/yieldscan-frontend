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
import RejectedPage from "./RejectedPage";
import SelectAccount from "./SelectAccount";
import { useAccounts, useSelectedAccount, useWalletType } from "@lib/store";
import getFromLocalStorage from "@lib/getFromLocalStorage";
import addToLocalStorage from "@lib/addToLocalStorage";
import { trackEvent, Events, setUserProperties } from "@lib/analytics";
import { setCookie } from "nookies";
import RecoverAuthInfo from "./RecoverAuthInfo";
import { useRouter } from "next/router";

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
const WalletConnectPopover = ({ styles, networkInfo }) => {
	const router = useRouter();
	const { isOpen, close } = useWalletConnect();
	const {
		accounts,
		stashAccount,
		accountsWithBalances,
		setAccounts,
		setStashAccount,
	} = useAccounts();
	const { selectedAccount, setSelectedAccount } = useSelectedAccount();
	const { walletType, setWalletType } = useWalletType();
	const [state, setState] = useState();
	const [extensionEvent, setExtensionEvent] = useState();
	const [currentStep, setCurrentStep] = useState("beginnerInfo");
	const [redirectToSetUp, setRedirectToSetUp] = useState(false);

	const handlers = {
		onEvent: (eventInfo) => {
			setExtensionEvent(eventInfo.message);
		},
	};

	const userStorage = !isNil(typeof window) ? window.localStorage : null;
	const autoConnectEnabled = userStorage.getItem("autoConnectEnabled");
	const setAuthForAutoConnect = () => {
		userStorage.setItem("autoConnectEnabled", "true");
	};

	useEffect(() => {
		if (autoConnectEnabled) {
			setCurrentStep("connectWallet");
		}
	}, []);

	useEffect(() => {
		if (currentStep === "connectWallet") {
			web3Enable("YieldScan").then((extension) => {
				if (extension.length === 0) {
					setState(WalletConnectStates.REJECTED);
					if (typeof window !== undefined) {
						trackEvent(Events.AUTH_REJECTED, {
							path: window.location.pathname,
						});
					}
				} else {
					if (!autoConnectEnabled) {
						setRedirectToSetUp(true);
					}
					setState(WalletConnectStates.CONNECTED);
					setAuthForAutoConnect();
					if (typeof window !== undefined) {
						trackEvent(Events.AUTH_ALLOWED, {
							path: window.location.pathname,
						});
					}
				}
			});
		}
	}, [currentStep]);

	useEffect(() => {
		let unsubscribe;
		if (state === "connected") {
			web3AccountsSubscribe((injectedAccounts) => {
				injectedAccounts.push(
					{
						address: "5DCYHPEg6gmzTv2bw34ANzKr6DfkCRUjzHUqKd9sNd4RpXYh",
						meta: { name: "bruno" },
					},
					{
						address: "5DyYPZ73qUs5YGkqsBuQ7MZmdkpbXAFbMzA83Tp8bwiRQFpb",
						meta: { name: "test1" },
					}
					// {
					// 	address: "13xDUejMzd7ehFFgjWdYcxdzykxS6yxiVq7cr96vQPQNQWy1",
					// 	meta: { name: "sahil" },
					// }
				);
				injectedAccounts?.map((account) => {
					account.substrateAddress = account.address.toString();
					account.address = encodeAddress(
						decodeAddress(account.address.toString()),
						networkInfo.addressPrefix
					);
					const accountsType = walletType;
					accountsType[account.substrateAddress] = isNil(
						getFromLocalStorage(account.substrateAddress, "isLedger")
					)
						? null
						: JSON.parse(
								getFromLocalStorage(account.substrateAddress, "isLedger")
						  );

					setWalletType({ ...accountsType });
					return account;
				});
				setAccounts(injectedAccounts);
				if (!redirectToSetUp) {
					setState(WalletConnectStates.GOTACCOUNTS);
				}
			}).then((u) => (unsubscribe = u));
		}
		return () => {
			unsubscribe && unsubscribe();
		};
	}, [state, networkInfo]);

	useEffect(() => {
		if (redirectToSetUp && accounts) {
			close();
			router.push("/setup-accounts");
		}
	}, [accounts, redirectToSetUp]);

	useEffect(() => {
		if (accounts) {
			if (
				accounts?.filter(
					(account) =>
						account.address.toString() ===
						getFromLocalStorage(networkInfo.network, "selectedAccount")
				).length === 0
			) {
				setStashAccount(null);
				setCookie(null, networkInfo.network + "Default", null, {
					maxAge: 7 * 24 * 60 * 60,
				});
				setSelectedAccount(null);
				addToLocalStorage(networkInfo.network, "selectedAccount", null);
			} else {
				accounts
					.filter(
						(account) =>
							account.address ===
							getFromLocalStorage(networkInfo.network, "selectedAccount")
					)
					.map((account) => {
						setStashAccount(account);
						setCookie(null, networkInfo.network + "Default", account.address, {
							maxAge: 7 * 24 * 60 * 60,
						});
						setSelectedAccount(account);
						addToLocalStorage(
							networkInfo.network,
							"selectedAccount",
							account.address
						);
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

	const onAccountSelected = async (account) => {
		if (account) close();
		if (typeof window !== undefined) {
			trackEvent(Events.ACCOUNT_SELECTED, {
				path: window.location.pathname,
				address: account.address,
				network: networkInfo.name,
			});
		}
		setStashAccount(account);
		setCookie(null, networkInfo.network + "Default", account.address, {
			maxAge: 7 * 24 * 60 * 60,
		});
		setSelectedAccount(account);
		addToLocalStorage(networkInfo.network, "selectedAccount", account.address);
	};

	const handleRecoveryAuth = () => {
		setState(WalletConnectStates.RECOVERAUTH);
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={close}
			isCentered
			closeOnEsc={true}
			closeOnOverlayClick={true}
		>
			<ModalOverlay />
			<ModalContent rounded="lg" maxWidth="lg" {...styles} py={4}>
				<ModalHeader>
					<h3 className="px-3 text-2xl text-left text-gray-700 self-start">
						{currentStep === "beginnerInfo"
							? "What you should know"
							: isNil(state)
							? "Wallet Connect"
							: "Select Account"}
					</h3>
				</ModalHeader>
				<ModalCloseButton
					onClick={close}
					boxShadow="0 0 0 0 #fff"
					color="gray.400"
					backgroundColor="gray.100"
					rounded="1rem"
					mt={4}
					mr={4}
				/>
				<ModalBody>
					{currentStep === "connectWallet" ? (
						state === WalletConnectStates.REJECTED ? (
							<RejectedPage handleRecoveryAuth={handleRecoveryAuth} />
						) : state === WalletConnectStates.RECOVERAUTH ? (
							<RecoverAuthInfo />
						) : !accounts ? (
							<div className="flex-center w-full h-full min-h-26-rem">
								<div className="flex-center flex-col">
									<Spinner size="xl" color="teal.500" thickness="4px" />
									<span className="text-sm text-gray-600 mt-5">
										{extensionEvent}
									</span>
								</div>
							</div>
						) : (
							state === WalletConnectStates.GOTACCOUNTS && (
								<SelectAccount
									accounts={
										accountsWithBalances !== null
											? accountsWithBalances
											: accounts
									}
									onAccountSelected={onAccountSelected}
									networkInfo={networkInfo}
								/>
							)
						)
					) : (
						<SimpleGrid w="100%" columns={1} spacing={8}>
							<Box w="100%">
								<CheckIconInfo info="You keep ownership of your funds" />
								<CheckIconInfo info="Staking rewards usually start to show after 2-3 days" />
								<CheckIconInfo
									info="Funds will be locked for staking and can be unlocked at any
										time, but unlocking takes 28 days"
								/>
							</Box>

							<Flex
								w="100%"
								align="center"
								justify="center"
								border="1px"
								borderStyle="dashed"
								borderColor="gray.700"
								rounded="md"
								p={6}
							>
								<Icon name="warning" size={10} color="#2BCACA" />
								<Text ml={2} fontSize="sm" color="gray.700">
									Your staked funds may be irrevocably lost if the validator
									doesn’t behave properly, YieldScan mitigates this but does NOT
									guarantee immunity
								</Text>
							</Flex>
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
								Continue
							</Button>
						</SimpleGrid>
					)}
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};

export { WalletConnectPopover, useWalletConnect };
