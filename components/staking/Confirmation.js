import { useState, useEffect } from "react";
import { get, isNil } from "lodash";
import Identicon from "@components/common/Identicon";
import Image from "next/image";
import router from "next/router";
import {
	useSelectedAccount,
	useTransaction,
	useSelectedNetwork,
	usePolkadotApi,
	useAccounts,
	useAccountsBalances,
	useAccountsStakingInfo,
	useAccountsStakingLedgerInfo,
} from "@lib/store";
import { getNetworkInfo } from "yieldscan.config";
import RiskTag from "@components/reward-calculator/RiskTag";
import formatCurrency from "@lib/format-currency";
import { GlossaryModal, HelpPopover } from "@components/reward-calculator";
import {
	Spinner,
	Divider,
	Alert,
	AlertDescription,
	AlertIcon,
	AlertTitle,
	Collapse,
} from "@chakra-ui/core";
import getTransactionFee from "@lib/getTransactionFee";
import { web3FromAddress } from "@polkadot/extension-dapp";
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";
import { ChevronLeft, Circle, ChevronRight, Edit } from "react-feather";
import Account from "../wallet-connect/Account";
import ValidatorCard from "./ValidatorCard";
import RewardDestination from "./RewardDestination";
import EditController from "./EditController";

const Confirmation = () => {
	const { selectedNetwork } = useSelectedNetwork();
	const { apiInstance } = usePolkadotApi();
	const networkInfo = getNetworkInfo(selectedNetwork);
	const { selectedAccount } = useSelectedAccount();
	const { setTransactionState, ...transactionState } = useTransaction();
	const { accounts } = useAccounts();

	const { accountsBalances, setAccountsBalances } = useAccountsBalances();
	const { accountsStakingInfo, setAccountsStakingInfo } =
		useAccountsStakingInfo();
	const { accountsStakingLedgerInfo, setAccountsStakingLedgerInfo } =
		useAccountsStakingLedgerInfo();
	const selectedValidators = get(transactionState, "selectedValidators", []);
	const stakingAmount = get(transactionState, "stakingAmount", 0);
	const [transactionFee, setTransactionFee] = useState(0);
	const [showValidators, setShowValidators] = useState(false);
	const [showAdvPrefs, setShowAdvPrefs] = useState(false);

	const handleAdvPrefsToggle = () => {
		setShowAdvPrefs((show) => !show);
	};

	const handleValToggle = () => {
		setShowValidators((show) => !show);
	};

	useEffect(() => {
		if (!isNil(accountsStakingInfo[selectedAccount.address])) {
			const nominatedValidators = transactionState.selectedValidators.map(
				(v) => v.stashId
			);
			const substrateControllerId = encodeAddress(
				decodeAddress(selectedAccount.address),
				42
			);
			apiInstance.tx.staking
				.nominate(nominatedValidators)
				.paymentInfo(substrateControllerId)
				.then((info) => {
					const fee = info.partialFee.toNumber();
					console.log("fee");
					console.log(fee);
					setTransactionFee(fee);
				});
		}
	}, [accountsStakingInfo[selectedAccount.address]]);

	return (
		<div className="w-full h-full flex justify-center max-h-full">
			<div className="flex flex-col w-full max-w-65-rem h-full space-y-evenly">
				<div className="p-2 w-full">
					<button
						className="flex items-center bg-gray-200 text-gray-600 rounded-full px-2 py-1"
						onClick={() => router.back()}
					>
						<ChevronLeft size={16} className="text-gray-600" />
						<span className="mx-2 text-sm">back</span>
					</button>
				</div>
				<div className="flex-1 flex justify-center items-center">
					<div className="flex flex-col w-full max-w-xl items-center justify-center space-y-6">
						<div className="w-full flex justify-center items-center">
							<Circle size={60} color="#2BCACA" />
						</div>
						<div className="text-center space-y-2">
							<h1 className="text-2xl  font-semibold">Confirmation</h1>
							<p className="text-gray-600 text-sm">
								You will be locking your funds for staking. Please make sure you
								understand the risks before proceeding.
							</p>
						</div>
						<BrowserWalletAlert />
						<div className="flex flex-col w-full text-gray-700 text-sm space-y-2 font-semibold">
							<div>
								<p className="ml-2">Stash Account</p>
								<Account
									account={selectedAccount}
									balances={accountsBalances[selectedAccount.address]}
									networkInfo={networkInfo}
									onAccountSelected={() => {
										return;
									}}
									disabled={true}
								/>
							</div>
							<div>
								<p className="ml-2">Controller Account</p>
								<Account
									account={selectedAccount}
									balances={accountsBalances[selectedAccount.address]}
									networkInfo={networkInfo}
									onAccountSelected={() => {
										return;
									}}
									disabled={true}
								/>
							</div>
						</div>
						<div className="w-full p-2">
							<button
								onClick={handleValToggle}
								className="flex text-gray-600 text-xs"
							>
								<ChevronRight
									size={16}
									className={`transition ease-in-out duration-500 mr-2 ${
										showValidators && "transform rotate-90"
									}`}
								/>
								{showValidators ? "Hide" : "Show"} suggested validators{" "}
								<HelpPopover
									content={
										<p className="text-white text-xs">
											The list of most rewarding validators, selected based on
											your investment amount and risk preference.
										</p>
									}
								/>
							</button>
							<Collapse isOpen={showValidators}>
								<div className="mt-2 rounded-xl">
									<div className="overflow-auto">
										{selectedValidators.map((validator) => (
											<ValidatorCard
												key={validator.stashId}
												name={validator.name}
												stashId={validator.stashId}
												riskScore={validator.riskScore.toFixed(2)}
												commission={validator.commission}
												nominators={validator.numOfNominators}
												totalStake={validator.totalStake}
												estimatedReward={Number(validator.rewardsPer100KSM)}
												networkInfo={networkInfo}
												onProfile={() => onProfile(validator)}
											/>
										))}
									</div>
								</div>
							</Collapse>
						</div>
						<div className="w-full p-2">
							<button
								className="flex text-gray-600 text-xs items-center"
								onClick={handleAdvPrefsToggle}
							>
								<ChevronRight
									size={16}
									className={`transition ease-in-out duration-500 mr-2 ${
										showAdvPrefs && "transform rotate-90"
									}`}
								/>
								Advanced preferences
							</button>
							<Collapse isOpen={showAdvPrefs}>
								<div className="mt-6 rounded-xl mt-4">
									<EditController
										accounts={accounts}
										controller={selectedAccount}
										transactionState={transactionState}
										setController={(controller) =>
											setTransactionState({ controller })
										}
										networkInfo={networkInfo}
									/>
									<RewardDestination
										transactionState={transactionState}
										setTransactionState={setTransactionState}
									/>
								</div>
							</Collapse>
						</div>
						<div className="w-full px-4">
							<div className="flex justify-between">
								<p className="text-gray-700 text-xs">Staking amount</p>
								<div className="flex flex-col">
									<p className="text-sm font-semibold text-right">
										{formatCurrency.methods.formatAmount(
											Math.trunc(
												stakingAmount * 10 ** networkInfo.decimalPlaces
											),
											networkInfo
										)}
									</p>
									{/* <p className="text-xs text-right text-gray-600">
								${subCurrency.toFixed(2)}
							</p> */}
								</div>
							</div>

							<div className="flex justify-between mt-4">
								<div className="text-xs text-gray-700 flex items-center">
									<p>Transaction Fee</p>
									<HelpPopover
										content={
											<p className="text-xs text-white">
												This fee is used to pay for the resources used for
												processing the transaction on the blockchain network.
												YieldScan doesn’t profit from this fee in any way.
											</p>
										}
									/>
								</div>

								<div className="flex flex-col">
									{transactionFee !== 0 ? (
										<div>
											<p className="text-sm font-semibold text-right">
												{formatCurrency.methods.formatAmount(
													Math.trunc(transactionFee),
													networkInfo
												)}
											</p>
											{/* <p className="text-xs text-right text-gray-600">
									${subFeeCurrency.toFixed(2)}
								</p> */}
										</div>
									) : (
										<Spinner />
									)}
								</div>
							</div>
							<Divider my={6} />
							<div className="flex justify-between">
								<p className="text-gray-700 text-sm font-semibold">
									Total Amount
								</p>
								<div className="flex flex-col">
									<p className="text-lg text-right font-bold">
										{formatCurrency.methods.formatAmount(
											Math.trunc(
												stakingAmount * 10 ** networkInfo.decimalPlaces
											) + transactionFee,
											networkInfo
										)}
									</p>
									{/* <p className="text-sm text-right text-gray-600 font-medium">
							${(subCurrency + subFeeCurrency).toFixed(2)}
						</p> */}
								</div>
							</div>
						</div>
						<div className="mt-4 w-full text-center">
							<button
								className="rounded-full font-medium px-12 py-3 bg-teal-500 text-white"
								// onClick={() => onConfirm()}
							>
								Stake Now
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
export default Confirmation;

const BrowserWalletAlert = () => (
	<Alert
		status="warning"
		color="#FDB808"
		backgroundColor="#FFF4DA"
		borderRadius="8px"
		zIndex={1}
	>
		<AlertIcon name="warning-2" color />
		<div>
			<AlertTitle fontSize="sm">{"CAUTION: Funds at risk"}</AlertTitle>
			<AlertDescription fontSize="xs">
				<p>
					You’re trying to stake 191.2423 DOT using a software wallet. We
					recommend using a Ledger hardware wallet to store your funds securely,
					isolated from your easy-to-hack computer.
				</p>
			</AlertDescription>
		</div>
	</Alert>
);
