import { useState, useEffect } from "react";
import { ChevronLeft, RefreshCw } from "react-feather";
import { has, isNil } from "lodash";
import { parseCookies } from "nookies";
import Image from "next/image";
import { useRouter } from "next/router";
import { useWalletConnect } from "@components/wallet-connect";
import {
	useAccounts,
	useAccountsBalances,
	useAccountsControllerStashInfo,
	useSelectedAccount,
	useSelectedNetwork,
	useWalletConnectState,
} from "@lib/store";
import { getNetworkInfo } from "yieldscan.config";
import SelectStakingAccount from "./SelectStakingAccount";
import LedgerSetup from "./LedgerSetup";

const SetupWallet = () => {
	const router = useRouter();
	const cookies = parseCookies();
	const { toggle } = useWalletConnect();
	const { accounts } = useAccounts();
	const { selectedNetwork } = useSelectedNetwork();
	const { setSelectedAccount } = useSelectedAccount();
	const { accountsBalances } = useAccountsBalances();
	const { accountsControllerStashInfo } = useAccountsControllerStashInfo();
	const { walletConnectState } = useWalletConnectState();
	const networkInfo = getNetworkInfo(selectedNetwork);

	const [connectExtensionCheck, setConnectExtensionCheck] = useState(false);
	const [currentStep, setCurrentStep] = useState(() =>
		isNil(cookies?.currentStep) ? "main" : "ledgerSetup"
	);
	const [hasExtension, setHasExtension] = useState(
		has(window?.injectedWeb3, "polkadot-js")
	);

	const handleOnClickConnectPolkadotExtension = () => {
		walletConnectState !== "connected" && toggle();
		setConnectExtensionCheck(true);
	};

	useEffect(() => {
		setHasExtension(has(window?.injectedWeb3, "polkadot-js"));
	}, []);

	useEffect(() => {
		walletConnectState === "connected" &&
			connectExtensionCheck &&
			currentStep === "main" &&
			setCurrentStep("selectStakingAccount");
	}, [connectExtensionCheck, walletConnectState]);

	return currentStep === "main" ? (
		<div className="w-full h-full flex justify-center">
			<div className="w-full max-w-65-rem flex flex-col space-y-6">
				<div className="flex flex-row mt-12 font-semibold">
					{/* TODO: Make a common back button component */}
					<button
						className="flex items-center bg-gray-200 text-gray-600 rounded-full px-2 py-1"
						onClick={() => router.back()}
					>
						<ChevronLeft size={16} className="text-gray-600" />
						<span className="mx-2 text-sm">back</span>
					</button>
					<h2 className="w-full text-2xl text-gray-700 text-center">
						Choose the path that’s right for you
					</h2>
				</div>
				<div className="grid grid-cols-10 justify-items-center">
					<div className="col-span-4 w-full flex flex-col justify-center content-center items-center text-gray-700 space-y-4">
						<Image
							src="/images/no-wallets-icon.svg"
							width="120"
							height="120"
							alt="walletIcon"
						/>
						<h1 className="text-2xl font-semibold text-center">
							No Crypto Wallet?
						</h1>
						<p className="text-gray-600 text-sm text-center max-w-md">
							No worries! Create a wallet to get started with staking on
							YieldScan
						</p>
						<div className="w-full text-center">
							<button
								className="rounded-lg font-medium w-full py-3 bg-teal-500 text-white"
								onClick={() =>
									window?.open(
										"https://intercom.help/yieldscan/en/articles/5341271-take-your-first-steps-create-your-crypto-account",
										"_blank"
									)
								}
							>
								Get Started
							</button>
						</div>
					</div>
					<div className="col-span-1 grid grid-rows-9 gap-4 text-gray-700 justify-items-center items-center py-24">
						<div className="row-span-4 h-full border-r border-gray-500 rounded-full"></div>
						<span className="row-span-1">or</span>
						<div className="row-span-4 h-full border-r border-gray-500 rounded-full"></div>
					</div>
					<div className="col-span-5 flex w-full flex-col text-gray-700 justify-center content-center items-center text-gray-700 space-y-4">
						{hasExtension && (
							<button
								className="w-full flex rounded-lg border items-center shadow-lg p-8 transform hover:scale-102"
								onClick={handleOnClickConnectPolkadotExtension}
							>
								<div className="w-full flex-1 flex flex-row items-center text-left space-x-6">
									<Image
										src="/images/polkadot-ext.svg"
										width="80"
										height="80"
										alt="walletIcon"
									/>
									<div className="flex flex-col text-left">
										<h2 className="text-lg font-semibold">
											{"Connect using polkadot{.js} wallet"}
										</h2>
										<p className="text-gray-600 text-sm max-w-md">
											{
												"Polkadot{.js} wallet is a free-to-use browser extension that generates and holds your accounts"
											}
										</p>
									</div>
								</div>
							</button>
						)}
						<button
							className="w-full flex rounded-lg border items-center shadow-lg p-8 transform hover:scale-102"
							onClick={() => {
								setConnectExtensionCheck(false);
								setCurrentStep("ledgerSetup");
							}}
						>
							<div className="w-full flex-1 flex flex-row items-center text-left space-x-6">
								<Image
									src="/images/ledgerIcon.svg"
									width="80"
									height="80"
									alt="walletIcon"
								/>
								<div className="flex flex-col text-left">
									<h2 className="text-lg font-semibold">
										{"Connect using a Ledger hardware wallet"}
									</h2>
									<p className="text-gray-600 text-sm max-w-md">
										{
											"Ledger wallets are dedicated hardware devices that securely store your accounts, isolated from your easy-to-hack computer"
										}
									</p>
								</div>
							</div>
						</button>
						<button className="w-full flex rounded-lg border items-center shadow-lg p-8 transform hover:scale-102">
							<div className="w-full flex-1 flex flex-row items-center text-left space-x-6">
								<Image
									src="/images/exchange-icons.svg"
									width="80"
									height="80"
									alt="walletIcon"
								/>
								<div className="flex flex-col text-left">
									<h2 className="text-lg font-semibold">
										{"Transfer from an exchange"}
									</h2>
									<p className="text-gray-600 text-sm max-w-md">
										{
											"Have your crypto stored on a centralized exchange like Coinbase, Binance or Kraken? Choose this option to learn how to get started with staking on yieldscan"
										}
									</p>
								</div>
							</div>
						</button>
					</div>
				</div>
				{!hasExtension && (
					<div className="flex justify-center">
						<div className="flex flex-row rounded-lg bg-gray-200 items-center text-sm justify-center p-4 px-6 space-x-4">
							<p className="text-gray-700">Don’t see your wallet here?</p>
							<p className="text-gray-500">Check supported wallets</p>
							<button
								className="flex flex-row items-center justify-center bg-teal-500 text-white rounded-lg p-2 px-4 space-x-2"
								onClick={() => location.reload()}
							>
								<RefreshCw size={16} />
								<p>Refresh</p>
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	) : currentStep === "selectStakingAccount" ? (
		<div className="w-full h-full flex justify-center">
			<SelectStakingAccount
				networkInfo={networkInfo}
				accounts={accounts}
				accountsBalances={accountsBalances}
				accountsControllerStashInfo={accountsControllerStashInfo}
				setSelectedAccount={setSelectedAccount}
			/>
		</div>
	) : (
		<div className="w-full h-full flex justify-center">
			<LedgerSetup
				networkInfo={networkInfo}
				accounts={accounts}
				accountsBalances={accountsBalances}
				accountsControllerStashInfo={accountsControllerStashInfo}
				setSelectedAccount={setSelectedAccount}
				hasExtension={hasExtension}
				handleOnClickConnectPolkadotExtension={
					handleOnClickConnectPolkadotExtension
				}
				connectExtensionCheck={connectExtensionCheck}
				walletConnectState={walletConnectState}
				setCurrentStep={setCurrentStep}
				setConnectExtensionCheck={setConnectExtensionCheck}
			/>
		</div>
	);
};

export default SetupWallet;
