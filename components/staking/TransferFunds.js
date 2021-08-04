import { useState, useEffect } from "react";
import { get, isNil } from "lodash";
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";
import { AlertOctagon, ChevronLeft } from "react-feather";
import {
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalOverlay,
	Spinner,
	Divider,
	useToast,
} from "@chakra-ui/core";
import Account from "@components/wallet-connect/Account";
import PopoverAccountSelection from "@components/common/PopoverAccountSelection";
import formatCurrency from "@lib/format-currency";
import AmountInput from "./AmountInput";
import { HelpPopover } from "@components/reward-calculator";
import transferBalancesKeepAlive from "@lib/polkadot/transfer-balances";
import {
	BottomNextButton,
	NextButtonContent,
} from "@components/common/BottomButton";

const TransferFunds = ({
	router,
	apiInstance,
	networkInfo,
	selectedAccount,
	accounts,
	accountsBalances,
	accountsStakingInfo,
	controllerAccount,
	transferFundsAmount,
	controllerBalances,
	senderAccount,
	transferFunds,
	setSenderAccount,
	setTransferFundsAmount,
}) => {
	const [isStashPopoverOpen, setIsStashPopoverOpen] = useState(false);

	const [filteredAccounts, setFilteredAccounts] = useState(null);

	useEffect(() => {
		const filteredAccounts = accounts.filter(
			(account) =>
				accountsBalances[account.address]?.availableBalance.gt(
					apiInstance?.consts.balances.existentialDeposit
				) && account?.address !== controllerAccount?.address
		);
		setFilteredAccounts(filteredAccounts);
	}, [JSON.stringify(accounts), JSON.stringify(accountsBalances)]);

	const handleOnClick = (account) => {
		setSenderAccount(account);
		setIsStashPopoverOpen(false);
	};

	const [isOpen, setIsOpen] = useState(false);

	const close = () => {
		setIsOpen(false);
	};

	const [isLowAmount, setIsLowAmount] = useState(false);
	const [isLowSenderBalance, setIsLowSenderBalance] = useState(false);

	useEffect(() => {
		accountsBalances[senderAccount?.address]?.availableBalance <
		transferFundsAmount
			? setIsLowSenderBalance(true)
			: setIsLowSenderBalance(false);
	}, [
		senderAccount?.address,
		JSON.stringify(accountsBalances[senderAccount?.address]),
		transferFundsAmount,
	]);

	useEffect(() => {
		transferFundsAmount <
		Math.pow(10, networkInfo.decimalPlaces) +
			apiInstance?.consts.balances.existentialDeposit.toNumber() -
			controllerBalances?.availableBalance
			? setIsLowAmount(true)
			: setIsLowAmount(false);
	}, [transferFundsAmount, controllerBalances]);

	return selectedAccount &&
		controllerAccount &&
		accountsBalances &&
		accountsStakingInfo ? (
		<div className="w-full h-full flex justify-center">
			{senderAccount && transferFundsAmount > 0 && (
				<ConfirmTransfer
					senderAccount={senderAccount}
					controllerAccount={controllerAccount}
					senderBalances={accountsBalances[senderAccount?.address]}
					controllerBalances={controllerBalances}
					networkInfo={networkInfo}
					close={close}
					apiInstance={apiInstance}
					isOpen={isOpen}
					transferFunds={transferFunds}
					transferFundsAmount={transferFundsAmount}
				/>
			)}
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
					<div className="w-full max-w-xl flex flex-col justify-center items-center space-y-4">
						<div className="w-full max-w-sm flex flex-col">
							<p className="w-full text-gray-500">From</p>
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
										defaultHeading={"Select sender account"}
										isInvalid={isLowSenderBalance}
										widthFull={true}
										transferFundsAmount={transferFundsAmount}
										setTransferFundsAmount={setTransferFundsAmount}
										// disabled={
										// 	exisiting ? true : filteredAccounts.length !== 0 ? false : true
										// }
									/>
								</div>
							)}
						</div>
						<div className="w-full max-w-sm flex flex-col items-center justify-center">
							<p className="w-full text-gray-500">Amount</p>
							<AmountInput
								transferFundsAmount={transferFundsAmount}
								setTransferFundsAmount={setTransferFundsAmount}
								networkInfo={networkInfo}
								senderBalances={accountsBalances[senderAccount?.address]}
								senderAccount={senderAccount}
								controllerBalances={controllerBalances}
								apiInstance={apiInstance}
								isLowAmount={isLowAmount}
							/>
						</div>
						{isLowAmount && (
							<div className="flex flex-row w-full bg-red-100 rounded-lg p-4 justify-center items-center space-x-2">
								<div>
									<AlertOctagon size="60" className="text-red-600" />
								</div>
								<div className="flex flex-col p-2">
									<h1 className="w-full text-md text-gray-700 font-semibold">
										Amount too low
									</h1>
									<p className="w-full text-sm text-gray-700">
										You need to transfer at least 19.3423 DOT to proceed. Please
										increase the amount input.
									</p>
								</div>
							</div>
						)}
						{senderAccount && isLowSenderBalance && (
							<div className="flex flex-row w-full bg-red-100 rounded-lg p-4 justify-center items-center space-x-2">
								<div>
									<AlertOctagon size="60" className="text-red-600" />
								</div>
								<div className="flex flex-col p-2">
									<h1 className="w-full text-md text-gray-700 font-semibold">
										Insufficient Balance
									</h1>
									<p className="w-full text-sm text-gray-700">
										The selected account doesn’t have sufficient balance to make
										the transfer. Please select an account with a free balance
										of at least 20 DOT.
									</p>
								</div>
							</div>
						)}
						<div className="w-full max-w-lg text-center">
							<BottomNextButton
								// className={`w-full rounded-lg min-w-32 font-medium p-3 bg-teal-500 text-white z-20 ${
								// 	(isNil(senderAccount) || isNil(controllerAccount) || !amount) &&
								// 	"cursor-not-allowed opacity-50"
								// }`}
								disabled={
									isNil(senderAccount) ||
									isNil(controllerAccount) ||
									isLowAmount ||
									isLowSenderBalance
								}
								onClick={() => setIsOpen(true)}
							>
								<NextButtonContent name={"Continue to confirmation"} />
							</BottomNextButton>
						</div>
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
	networkInfo,
	close,
	isOpen,
	apiInstance,
	styles,
	transferFunds,
	transferFundsAmount,
}) => {
	const handleOnClickCancel = (account) => {
		// setLoading(false);
		close();
	};
	const [transactionFee, setTransactionFee] = useState(0);

	useEffect(() => {
		if (!isNil(transferFundsAmount)) {
			const substrateControllerId = encodeAddress(
				decodeAddress(controllerAccount?.address),
				42
			);
			const substrateSenderId = encodeAddress(
				decodeAddress(senderAccount?.address),
				42
			);

			apiInstance?.tx.balances
				.transferKeepAlive(substrateControllerId, transferFundsAmount)
				.paymentInfo(substrateSenderId)
				.then((info) => {
					const fee = info.partialFee.toNumber();
					setTransactionFee(fee);
				});
		}
	}, [transferFundsAmount, senderAccount, controllerAccount]);

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleOnClickCancel}
			// isClosable={!loading}
			// closeOnEsc={!loading}
			// closeOnOverlayClick={!loading}
			isCentered
		>
			<ModalOverlay />
			<ModalContent rounded="lg" height="xl" {...styles} py={4}>
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
					{senderAccount && transferFundsAmount ? (
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
												Math.trunc(transferFundsAmount),
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
												Math.trunc(transferFundsAmount) + transactionFee,
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
									className={`w-full rounded-lg min-w-32 font-medium p-3 bg-teal-500 text-white z-20`}
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
