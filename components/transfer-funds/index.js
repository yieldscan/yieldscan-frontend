import { useState, useEffect } from "react";
import { get, isNil } from "lodash";
import {
	useSelectedAccount,
	useTransaction,
	useSelectedNetwork,
	useTransactionHash,
	usePolkadotApi,
	useAccounts,
	useAccountsBalances,
	useAccountsStakingInfo,
	useAccountsStakingLedgerInfo,
	useAccountsControllerStashInfo,
} from "@lib/store";
import { useRouter } from "next/router";
import { getNetworkInfo } from "yieldscan.config";
import getFromLocalStorage from "@lib/getFromLocalStorage";
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";
// import StakeToEarn from "./StakeToEarn";
// import LockFunds from "./LockFunds";
// import Confirmation from "./Confirmation";
// import stake from "@lib/stake";
import { ChevronLeft } from "react-feather";
import axios from "@lib/axios";
import {
	Alert,
	AlertDescription,
	AlertIcon,
	AlertTitle,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	Popover,
	PopoverArrow,
	PopoverBody,
	PopoverContent,
	PopoverTrigger,
	Spinner,
	Divider,
	useDisclosure,
	useToast,
} from "@chakra-ui/core";
// import ConfettiGenerator from "confetti-js";
// import ChainErrorPage from "./ChainErrorPage";
// import { BottomNextButton } from "../setup-accounts/BottomButton";
// import InfoAlert from "./InfoAlert";
import Account from "@components/wallet-connect/Account";
import PopoverAccountSelection from "@components/common/PopoverAccountSelection";
import formatCurrency from "@lib/format-currency";
import AmountInput from "./AmountInput";
import { HelpPopover } from "@components/reward-calculator";
import transferBalancesKeepAlive from "@lib/polkadot/transfer-balances";

const TransferFunds = () => {
	const toast = useToast();
	const router = useRouter();
	const { selectedNetwork } = useSelectedNetwork();
	const { apiInstance } = usePolkadotApi();
	const networkInfo = getNetworkInfo(selectedNetwork);
	const { selectedAccount } = useSelectedAccount();
	const { transactionHash, setTransactionHash } = useTransactionHash();
	const { setTransactionState, ...transactionState } = useTransaction();
	const { accounts } = useAccounts();
	const { accountsBalances } = useAccountsBalances();
	const { accountsStakingInfo } = useAccountsStakingInfo();
	const { accountsStakingLedgerInfo } = useAccountsStakingLedgerInfo();

	const { accountsControllerStashInfo } = useAccountsControllerStashInfo();
	const [isLedger, setIsLedger] = useState(() =>
		JSON.parse(
			getFromLocalStorage(selectedAccount?.substrateAddress, "isLedger")
		)
	);

	const [isStashPopoverOpen, setIsStashPopoverOpen] = useState(false);

	const [filteredAccounts, setFilteredAccounts] = useState(null);

	const [senderAccount, setSenderAccount] = useState(null);

	const [amount, setAmount] = useState(null);

	const selectedValidators = get(transactionState, "selectedValidators", []);
	const stakingAmount = get(transactionState, "stakingAmount", 0);

	const [balances, setBalances] = useState(
		() => accountsBalances[selectedAccount?.address]
	);

	const [stakingInfo, setStakingInfo] = useState(
		() => accountsStakingInfo[selectedAccount?.address]
	);
	const [stakingLedgerInfo, setStakingLedgerInfo] = useState(
		() => accountsStakingLedgerInfo[selectedAccount?.address]
	);
	const [controllerStashInfo, setControllerStashInfo] = useState(
		() => accountsControllerStashInfo[selectedAccount?.address]
	);

	const [controllerAccount, setControllerAccount] = useState(() =>
		accountsStakingInfo[selectedAccount?.address]?.stakingLedger.controllerId
			? accounts?.filter(
					(account) =>
						account.address ===
						accountsStakingInfo[
							selectedAccount?.address
						]?.stakingLedger.controllerId.toString()
			  )[0]
			: isNil(
					window?.localStorage.getItem(
						selectedAccount?.address + networkInfo.network + "Controller"
					)
			  )
			? selectedAccount
			: accounts?.filter(
					(account) =>
						account.address ===
						window?.localStorage.getItem(
							selectedAccount?.address + networkInfo.network + "Controller"
						)
			  )[0]
	);

	const [controllerBalances, setControllerBalances] = useState(
		() => accountsBalances[controllerAccount?.address]
	);

	useEffect(() => {
		setBalances(accountsBalances[selectedAccount?.address]);
	}, [
		selectedAccount?.address,
		JSON.stringify(accountsBalances[selectedAccount?.address]),
	]);

	useEffect(() => {
		setControllerBalances(accountsBalances[controllerAccount?.address]);
	}, [
		controllerAccount?.address,
		JSON.stringify(accountsBalances[controllerAccount?.address]),
	]);

	useEffect(() => {
		setControllerStashInfo(
			accountsControllerStashInfo[selectedAccount?.address]
		);
	}, [
		selectedAccount?.address,
		JSON.stringify(accountsControllerStashInfo[selectedAccount?.address]),
	]);

	useEffect(() => {
		setStakingInfo(accountsStakingInfo[selectedAccount?.address]);
	}, [
		selectedAccount?.address,
		JSON.stringify(accountsStakingInfo[selectedAccount?.address]),
	]);

	useEffect(() => {
		setStakingLedgerInfo(accountsStakingLedgerInfo[selectedAccount?.address]);
	}, [
		selectedAccount?.address,
		JSON.stringify(accountsStakingLedgerInfo[selectedAccount?.address]),
	]);

	useEffect(() => {
		if (stakingInfo?.controllerId) {
			setControllerAccount(
				() =>
					accounts?.filter(
						(account) => account.address === stakingInfo.controllerId.toString()
					)[0]
			);
		}
	}, [stakingInfo?.controllerId]);

	useEffect(() => {
		const filteredAccounts = accounts.filter((account) =>
			accountsBalances[account.address]?.availableBalance.gt(
				apiInstance?.consts.balances.existentialDeposit
			)
		);
		setFilteredAccounts(filteredAccounts);
	}, [
		JSON.stringify(accounts),
		JSON.stringify(accountsControllerStashInfo),
		JSON.stringify(accountsBalances),
	]);

	const handleOnClick = (account) => {
		setSenderAccount(account);
		setIsStashPopoverOpen(false);
	};

	const [isOpen, setIsOpen] = useState(false);

	const close = () => {
		setIsOpen(false);
	};

	return selectedAccount &&
		controllerAccount &&
		accountsBalances &&
		accountsStakingInfo ? (
		<div className="w-full h-full flex justify-center">
			<ConfirmTransfer
				senderAccount={senderAccount}
				controllerAccount={controllerAccount}
				senderBalances={accountsBalances[senderAccount?.address]}
				controllerBalances={controllerBalances}
				networkInfo={networkInfo}
				close={close}
				apiInstance={apiInstance}
				isOpen={isOpen}
				amount={amount}
			/>
			<div className="w-full max-w-65-rem flex flex-col items-center">
				<div className="p-2 w-full">
					{/* TODO: Make a common back button component */}
					<button
						className="flex items-center bg-gray-200 text-gray-600 rounded-full px-2 py-1"
						onClick={() => router.back()}
					>
						<ChevronLeft size={16} className="text-gray-600" />
						<span className="mx-2 text-sm">back</span>
					</button>
				</div>
				<div className="flex-1 flex flex-col text-gray-700 justify-center content-center p-2 items-center text-gray-700 space-y-6 max-w-md mb-32">
					<h1 className="text-2xl font-semibold text-center">
						Transfer funds to controller
					</h1>
					<p className="text-gray-600 text-sm text-center max-w-md">
						Your selected controller doesn’t have enough funds to pay for the
						fees. Please select an account to transfer funds.
					</p>

					{filteredAccounts && (
						<div className="w-full flex items-center justify-center">
							<PopoverAccountSelection
								accounts={filteredAccounts}
								accountsBalances={accountsBalances}
								isStashPopoverOpen={isStashPopoverOpen}
								setIsStashPopoverOpen={setIsStashPopoverOpen}
								networkInfo={networkInfo}
								selectedAccount={senderAccount}
								onClick={handleOnClick}
								isSetUp={true}
								// disabled={
								// 	exisiting ? true : filteredAccounts.length !== 0 ? false : true
								// }
							/>
						</div>
					)}

					{senderAccount && (
						<div className="flex items-center justify-center">
							<AmountInput
								value={amount}
								onChange={setAmount}
								networkInfo={networkInfo}
								availableBalance={
									accountsBalances[senderAccount?.address]
										? accountsBalances[senderAccount?.address]
												?.availableBalance /
										  Math.pow(10, networkInfo.decimalPlaces)
										: 0
								}
							/>
						</div>
					)}
					<div className="w-full max-w-lg text-center">
						<button
							className={`w-full rounded-lg min-w-32 font-medium p-3 bg-teal-500 text-white z-20 ${
								(isNil(senderAccount) || isNil(controllerAccount) || !amount) &&
								"cursor-not-allowed opacity-50"
							}`}
							disabled={
								isNil(senderAccount) || isNil(controllerAccount) || !amount
							}
							onClick={() => setIsOpen(true)}
						>
							Proceed to confirmation
						</button>
					</div>
				</div>
			</div>
		</div>
	) : (
		<div className="w-full h-full flex justify-center items-center max-h-full">
			<span className="loader"></span>
		</div>
	);
};

export default TransferFunds;

const ConfirmTransfer = ({
	senderAccount,
	controllerAccount,
	controllerBalances,
	senderBalances,
	amount,
	networkInfo,
	close,
	isOpen,
	apiInstance,
	styles,
}) => {
	const toast = useToast();
	const [selectedControllerAccount, setSelectedControllerAccount] =
		useState(null);
	const [loading, setLoading] = useState(false);

	const handleOnClickCancel = (account) => {
		setLoading(false);
		close();
	};
	const [transactionFee, setTransactionFee] = useState(0);

	const transferFunds = () => {
		setLoading(true);
		const stashId = senderAccount?.address;
		const newControllerId = controllerAccount.address;
		transferBalancesKeepAlive(from, to, apiInstance, amount, {
			onEvent: ({ message }) => {
				toast({
					title: "Info",
					description: message,
					status: "info",
					duration: 3000,
					position: "top-right",
					isClosable: true,
				});
			},
			onFinish: (failed, message) => {
				toast({
					title: failed ? "Failure" : "Success",
					description: message,
					status: failed ? "error" : "success",
					duration: 3000,
					position: "top-right",
					isClosable: true,
				});
				setLoading(false);
				handleOnClickCancel();
			},
		}).catch((error) => {
			setLoading(false);
			toast({
				title: "Error",
				description: error.message,
				status: "error",
				duration: 3000,
				position: "top-right",
				isClosable: true,
			});
		});
	};

	useEffect(() => {
		if (!isNil(amount)) {
			const substrateControllerId = encodeAddress(
				decodeAddress(controllerAccount?.address),
				42
			);
			const substrateSenderId = encodeAddress(
				decodeAddress(senderAccount?.address),
				42
			);
			const amountRaw = Math.trunc(
				amount * Math.pow(10, networkInfo.decimalPlaces)
			);
			apiInstance?.tx.balances
				.transferKeepAlive(substrateControllerId, amountRaw)
				.paymentInfo(substrateSenderId)
				.then((info) => {
					const fee = info.partialFee.toNumber();
					setTransactionFee(fee);
				});
		}
	}, [amount, senderAccount, controllerAccount]);

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleOnClickCancel}
			isClosable={!loading}
			closeOnEsc={!loading}
			closeOnOverlayClick={!loading}
			isCentered
		>
			<ModalOverlay />
			<ModalContent rounded="lg" height="xl" {...styles} py={4}>
				{!loading && (
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
					{!loading ? (
						<div className="h-full w-full flex text-left text-gray-700 flex-col justify-center items-center">
							<div className="flex flex-col w-full text-gray-700 text-sm space-y-2 font-semibold">
								<div>
									<h3 className="text-center text-2xl text-gray-700">
										Confirmation
									</h3>
									<p className="text-center text-sm text-gray-700">
										Please confirm the details below
									</p>
								</div>
								<div>
									<p className="ml-2">From:</p>
									<Account
										account={senderAccount}
										balances={senderBalances}
										networkInfo={networkInfo}
										onAccountSelected={() => {
											return;
										}}
										disabled={true}
									/>
								</div>

								<div>
									<p className="ml-2">To:</p>
									<Account
										account={controllerAccount}
										balances={controllerBalances}
										networkInfo={networkInfo}
										onAccountSelected={() => {
											return;
										}}
										disabled={true}
									/>
								</div>
							</div>
							<div className="w-full px-4">
								<div className="flex justify-between">
									<p className="text-gray-700 text-xs">Amount</p>
									<div className="flex flex-col">
										<p className="text-sm font-semibold text-right">
											{formatCurrency.methods.formatAmount(
												Math.trunc(amount * 10 ** networkInfo.decimalPlaces),
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
												Math.trunc(amount * 10 ** networkInfo.decimalPlaces) +
													transactionFee,
												networkInfo
											)}
										</p>
										{/* <p className="text-sm text-right text-gray-600 font-medium">
							${(subCurrency + subFeeCurrency).toFixed(2)}
						</p> */}
									</div>
								</div>
							</div>
							<div className="w-full mt-4">
								<button
									className={`w-full rounded-lg min-w-32 font-medium p-3 bg-teal-500 text-white z-20 ${
										!selectedControllerAccount &&
										"cursor-not-allowed opacity-50"
									}`}
									onClick={transferFunds}
									// disabled={}
								>
									Transfer
								</button>
							</div>
							<button
								className="w-full rounded-lg min-w-32 text-gray-700 font-medium underline mt-4"
								onClick={handleOnClickCancel}
							>
								Cancel
							</button>
						</div>
					) : (
						<div className="h-64 flex text-left text-gray-700 flex-col justify-center items-center">
							<span className="loader"></span>
						</div>
					)}
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};
