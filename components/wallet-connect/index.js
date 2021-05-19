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
} from "@chakra-ui/core";
import { encodeAddress, decodeAddress } from "@polkadot/util-crypto";
import RejectedPage from "./RejectedPage";
import SelectAccount from "./SelectAccount";
import getPolkadotExtensionInfo from "@lib/polkadot-extension";
import { useAccounts } from "@lib/store";
import { trackEvent, Events, setUserProperties } from "@lib/analytics";
import { setCookie } from "nookies";
import RecoverAuthInfo from "./RecoverAuthInfo";

const useWalletConnect = create((set) => ({
	isOpen: false,
	toggle: () => set((state) => ({ isOpen: !state.isOpen })),
	close: () => set(() => ({ isOpen: false })),
	open: () => set(() => ({ isOpen: true })),
}));

const WalletConnectStates = {
	REJECTED: "rejected",
	CONNECTED: "connected",
	RECOVERAUTH: "recover",
};

const WalletConnectPopover = ({ styles, networkInfo, cookies }) => {
	const { isOpen, close } = useWalletConnect();
	const [extensionEvent, setExtensionEvent] = useState();
	const {
		accounts,
		stashAccount,
		accountsWithBalances,
		setAccounts,
		setStashAccount,
	} = useAccounts();
	const [state, setState] = useState("");

	const handlers = {
		onEvent: (eventInfo) => {
			setExtensionEvent(eventInfo.message);
		},
	};

	useEffect(() => {
		if (typeof window !== undefined) {
			trackEvent(Events.INTENT_CONNECT_WALLET, {
				path: window.location.pathname,
			});
		}
		getPolkadotExtensionInfo(handlers)
			.then(({ isExtensionAvailable, accounts = [] }) => {
				if (!isExtensionAvailable) {
					setState(WalletConnectStates.REJECTED);
					if (typeof window !== undefined) {
						trackEvent(Events.AUTH_REJECTED, {
							path: window.location.pathname,
						});
					}
					setUserProperties({ hasExtension: false });
				} else {
					setCookie(null, "isAuthorized", true);
					if (typeof window !== undefined) {
						trackEvent(Events.AUTH_ALLOWED, {
							path: window.location.pathname,
						});
					}
					if (!accounts.length)
						throw new Error("Couldn't find any stash or unnassigned accounts.");

					accounts.map((x) => {
						x.address = encodeAddress(
							decodeAddress(x.address.toString()),
							networkInfo.addressPrefix
						);
					});
					// setState(WalletConnectStates.CONNECTED);
					setAccounts(accounts);
					setUserProperties({ hasExtension: true });
				}
			})
			.catch((error) => {
				// TODO: handle error properly using UI toast
				console.error(error);
			});
	}, [networkInfo]);

	useEffect(() => {
		let previousAccountAvailable = false;
		if (!stashAccount && accounts) {
			if (!isNil(get(cookies, networkInfo.network + "Default"))) {
				accounts
					.filter(
						(account) =>
							account.address == get(cookies, networkInfo.network + "Default")
					)
					.map((account) => {
						previousAccountAvailable = true;
						setStashAccount(account);
						if (typeof window !== undefined) {
							trackEvent(Events.ACCOUNT_SELECTED, {
								path: window.location.pathname,
								address: account.address,
								network: networkInfo.name,
							});
						}
					});
			}
			if (!previousAccountAvailable) {
				if (typeof window !== undefined) {
					trackEvent(Events.INTENT_ACCOUNT_SELECTION, {
						path: window.location.pathname,
					});
				}
				setState(WalletConnectStates.CONNECTED);
			} else close();
		}
	}, [accounts]);

	const onStashSelected = async (stashAccount) => {
		if (stashAccount) close();
		if (typeof window !== undefined) {
			trackEvent(Events.ACCOUNT_SELECTED, {
				path: window.location.pathname,
				address: stashAccount.address,
				network: networkInfo.name,
			});
		}
		setStashAccount(stashAccount);
		setCookie(null, networkInfo.network + "Default", stashAccount.address, {
			maxAge: 7 * 24 * 60 * 60,
		});
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
			<ModalContent
				rounded="lg"
				maxWidth={state === WalletConnectStates.REJECTED ? "lg" : "xl"}
				{...styles}
				py={4}
			>
				<ModalHeader>
					{[
						WalletConnectStates.DISCLAIMER,
						WalletConnectStates.CREATE,
						WalletConnectStates.IMPORT,
					].includes(state) ? (
						<div
							className="text-sm flex-center px-2 py-1 text-gray-700 bg-gray-200 rounded-xl w-40 font-normal cursor-pointer"
							onClick={() => setState(WalletConnectStates.REJECTED)}
						>
							<ChevronLeft />
							<span>Wallet Connect</span>
						</div>
					) : (
						state === WalletConnectStates.CONNECTED && (
							<h3 className="px-3 text-2xl text-left self-start">
								Select Account
							</h3>
						)
					)}
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
					{state === WalletConnectStates.REJECTED ? (
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
						state === WalletConnectStates.CONNECTED && (
							<SelectAccount
								accounts={
									accountsWithBalances !== null
										? accountsWithBalances
										: accounts
								}
								onStashSelected={onStashSelected}
								networkInfo={networkInfo}
							/>
						)
					)}
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};

export { WalletConnectPopover, useWalletConnect };
