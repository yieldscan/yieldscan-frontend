import { useEffect, useState } from "react";
import { isNil, get } from "lodash";
import {
	BottomBackButton,
	BottomNextButton,
	BackButtonContent,
	NextButtonContent,
} from "../common/BottomButton";
import PopoverAccountSelection from "../common/PopoverAccountSelection";
import {
	Alert,
	AlertDescription,
	AlertIcon,
	AlertTitle,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalBody,
	ModalCloseButton,
	ModalHeader,
	Spinner,
	useToast,
	Divider,
	Button,
	ModalFooter,
} from "@chakra-ui/core";
import formatCurrency from "@lib/format-currency";
import getFromLocalStorage from "@lib/getFromLocalStorage";
import editController from "@lib/polkadot/edit-controller";
import InsufficientBalanceAlert from "./InsufficientBalanceAlert";
import Account from "@components/wallet-connect/Account";
import { HelpPopover } from "@components/reward-calculator";
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";

const SelectControllerAccount = ({
	decrementCurrentStep,
	incrementStep,
	networkInfo,
	accounts,
	accountsBalances,
	apiInstance,
	accountsStakingInfo,
	accountsControllerStashInfo,
	selectedAccount,
	stakingInfo,
	walletType,
	isLedger,
}) => {
	const [isStashPopoverOpen, setIsStashPopoverOpen] = useState(false);

	const [isOpen, setIsOpen] = useState(false);

	const [filteredAccounts, setFilteredAccounts] = useState(null);

	const [transactionHash, setTransactionHash] = useState(null);

	const [controllerAccount, setControllerAccount] = useState(() =>
		accountsStakingInfo[selectedAccount?.address]?.controllerId
			? accounts?.filter(
					(account) =>
						account.address ===
						accountsStakingInfo[
							selectedAccount?.address
						]?.controllerId.toString()
			  )[0]
			: isNil(
					window?.localStorage.getItem(
						selectedAccount?.address + networkInfo.network + "Controller"
					)
			  )
			? walletType[selectedAccount?.substrateAddress]
				? null
				: selectedAccount
			: accounts?.filter(
					(account) =>
						account.address ===
						window?.localStorage.getItem(
							selectedAccount?.address + networkInfo.network + "Controller"
						)
			  )[0]
	);

	useEffect(() => {
		if (stakingInfo?.accountId.toString() !== selectedAccount?.address) {
			setControllerAccount(null);
		}
		const account = accountsStakingInfo[selectedAccount?.address]?.controllerId
			? accounts?.filter(
					(account) =>
						account.address ===
						accountsStakingInfo[
							selectedAccount?.address
						]?.controllerId.toString()
			  )[0]
			: isNil(
					window?.localStorage.getItem(
						selectedAccount?.address + networkInfo.network + "Controller"
					)
			  )
			? walletType[selectedAccount?.substrateAddress]
				? null
				: selectedAccount
			: accounts?.filter(
					(account) =>
						account.address ===
						window?.localStorage.getItem(
							selectedAccount?.address + networkInfo.network + "Controller"
						)
			  )[0];
		setControllerAccount(account);
	}, [
		selectedAccount?.address,
		JSON.stringify(stakingInfo),
		JSON.stringify(accountsStakingInfo),
	]);

	const [selected, setSelected] = useState(() =>
		isLedger && controllerAccount?.address === selectedAccount?.address
			? null
			: controllerAccount
	);

	const [existing, setExisting] = useState(
		() => !isNil(accountsStakingInfo[selectedAccount?.address]?.controllerId)
	);

	useEffect(() => {
		setExisting(
			() => !isNil(accountsStakingInfo[selectedAccount?.address]?.controllerId)
		);
	}, [selectedAccount, JSON.stringify(accountsStakingInfo)]);

	const handleOnClick = (account) => {
		setSelected(account);
		window?.localStorage.setItem(
			selectedAccount?.address + networkInfo.network + "Controller",
			account.address
		);
		setIsStashPopoverOpen(false);
	};

	const handleOnClickNext = () =>
		controllerAccount
			? controllerAccount.address === selectedAccount.address && isLedger
				? setIsOpen(true)
				: incrementStep()
			: incrementStep();

	useEffect(() => {
		const filteredAccounts = accounts.filter(
			(account) =>
				// allowing 0 balance accounts as a controller selection because low balances are being handled before proceeding to staking
				// accountsBalances[account.address]?.freeBalance.gte(
				// 	apiInstance?.consts.balances.existentialDeposit
				// ) &&
				!JSON.parse(
					getFromLocalStorage(account?.substrateAddress, "isLedger")
				) &&
				!accountsControllerStashInfo[account.address]?.isController &&
				!accountsControllerStashInfo[account.address]?.isStash
		);
		if (!isLedger) {
			filteredAccounts?.push(selectedAccount);
		}
		filteredAccounts.map((account) => {
			account.disabledSelection = accountsBalances[
				account.address
			]?.freeBalance.lte(apiInstance?.consts.balances.existentialDeposit);
		});
		setFilteredAccounts(filteredAccounts);
	}, [
		JSON.stringify(accounts),
		JSON.stringify(accountsControllerStashInfo),
		JSON.stringify(accountsBalances),
	]);

	return selectedAccount &&
		filteredAccounts &&
		Object.keys(accountsBalances).length > 0 &&
		Object.keys(accountsControllerStashInfo).length > 0 ? (
		<div className="flex-1 w-full max-w-2xl flex flex-col text-gray-700 justify-center p-4 text-gray-700 space-y-6 mb-32">
			{(transactionHash ||
				(controllerAccount &&
					isLedger &&
					selected &&
					controllerAccount.address === selectedAccount.address)) && (
				<EditControllerModal
					isOpen={isOpen}
					selectedControllerAccount={selected}
					eligibleAccounts={filteredAccounts}
					accountsBalances={accountsBalances}
					networkInfo={networkInfo}
					apiInstance={apiInstance}
					setTransactionHash={setTransactionHash}
					selectedAccount={selectedAccount}
					incrementStep={incrementStep}
					close={() => setIsOpen(false)}
				/>
			)}
			<div>
				<h1 className="text-2xl font-semibold">
					Select your controller account
				</h1>
				<p className="text-gray-600 text-sm max-w-md">
					Your controller will act on behalf of your main wallet to participate
					in staking activities, without being able to access those funds
				</p>
			</div>
			<div className="space-y-4">
				{existing ? (
					controllerAccount?.address === selectedAccount?.address ? (
						<SameStashControllerAlert />
					) : (
						<ExistingControllerAlert />
					)
				) : (
					filteredAccounts?.length === 0 && (
						<NoElligibleControllerAccounts networkInfo={networkInfo} />
					)
				)}
				{selected?.disabledSelection && <InsufficientBalanceAlert />}
				{filteredAccounts && (
					<PopoverAccountSelection
						accounts={filteredAccounts}
						accountsBalances={accountsBalances}
						isStashPopoverOpen={isStashPopoverOpen}
						setIsStashPopoverOpen={setIsStashPopoverOpen}
						networkInfo={networkInfo}
						selectedAccount={selected}
						onClick={handleOnClick}
						isSetUp={true}
						disabled={
							existing
								? controllerAccount?.address === selectedAccount.address &&
								  isLedger
									? false
									: true
								: filteredAccounts.length !== 0
								? false
								: true
						}
					/>
				)}
				<h2 className="text-md font-semibold underline cursor-pointer">
					<a
						href="https://intercom.help/yieldscan/en/articles/5353506-my-account-is-not-showing-i-can-t-find-my-account-in-the-list"
						target="_blank"
					>
						Don’t see your account?
					</a>
				</h2>
			</div>
			<div className="w-full flex flex-row justify-start space-x-3">
				<div>
					<BottomBackButton onClick={() => decrementCurrentStep()}>
						<BackButtonContent />
					</BottomBackButton>
				</div>
				<div>
					<BottomNextButton
						onClick={() => handleOnClickNext()}
						disabled={isNil(selected) || selected?.disabledSelection}
					>
						<NextButtonContent
							name={
								controllerAccount
									? controllerAccount.address === selectedAccount.address &&
									  isLedger
										? "Confirm"
										: "Done"
									: "Done"
							}
						/>
					</BottomNextButton>
				</div>
			</div>
		</div>
	) : (
		<div className="flex h-full w-full text-left text-gray-700 flex-col justify-center items-center">
			<span className="loader"></span>
		</div>
	);
};
export default SelectControllerAccount;

const ExistingControllerAlert = () => (
	<Alert
		status="warning"
		color="gray.500"
		backgroundColor="white"
		borderRadius="8px"
		border="1px solid #E2ECF9"
		zIndex={1}
	>
		<AlertIcon name="info-outline" color />
		<div>
			<AlertTitle fontWeight="medium" fontSize="sm">
				{"Found an existing controller"}
			</AlertTitle>
			<AlertDescription fontSize="xs">
				<p>
					Please make sure that your controller account is NOT imported from a
					ledger device else your staking transaction may fail. You can change
					your controller later in the settings tab.
				</p>
				<h2 className="mt-2 text-md font-semibold underline cursor-pointer">
					<a
						href="https://intercom.help/yieldscan/en/articles/5353583-setting-up-a-controller-account"
						target="_blank"
					>
						See how to setup a controller
					</a>
				</h2>
			</AlertDescription>
		</div>
	</Alert>
);

const SameStashControllerAlert = () => (
	<Alert
		status="warning"
		color="gray.500"
		backgroundColor="white"
		borderRadius="8px"
		border="1px solid #E2ECF9"
		zIndex={1}
	>
		<AlertIcon name="info-outline" color />
		<div>
			<AlertTitle fontWeight="medium" fontSize="sm">
				{"You haven’t setup a dedicated controller..."}
			</AlertTitle>
			<AlertDescription fontSize="xs">
				<p>
					You seem to be using the same account for storing and managing your
					funds. We recommend having separate storage and controller wallets for
					better security and accessibility.
				</p>
				<a
					href="https://intercom.help/yieldscan/en/articles/5353583-setting-up-a-controller-account"
					target="_blank"
				>
					<h2 className="mt-2 text-md font-semibold underline cursor-pointer">
						See how to setup a controller
					</h2>
				</a>
			</AlertDescription>
		</div>
	</Alert>
);

const NoElligibleControllerAccounts = ({ networkInfo }) => (
	<Alert
		status="warning"
		color="gray.500"
		backgroundColor="white"
		borderRadius="8px"
		border="1px solid #E2ECF9"
		zIndex={1}
	>
		<AlertIcon name="info-outline" color="gray.500" />
		<div>
			<AlertTitle fontWeight="medium" fontSize="sm">
				No elligible accounts available to set as a controller.
			</AlertTitle>
			<AlertDescription fontSize="xs">
				<p>
					Please create a new account if not already created and make sure that
					you have enough funds for staking.
				</p>
				<h2 className="mt-2 text-md font-semibold underline cursor-pointer">
					Get {networkInfo.denom}
				</h2>
			</AlertDescription>
		</div>
	</Alert>
);

const EditControllerModal = ({
	selectedAccount,
	eligibleAccounts,
	apiInstance,
	selectedControllerAccount,
	accountsBalances,
	networkInfo,
	close,
	setTransactionHash,
	incrementStep,
	isOpen,
}) => {
	const toast = useToast();
	const [isStashPopoverOpen, setIsStashPopoverOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	const [transactionFee, setTransactionFee] = useState(0);

	const [isSuccessful, setIsSuccessful] = useState(null);

	const handleOnClickCancel = (account) => {
		setLoading(false);
		setIsSuccessful(null);
		setTransactionHash(null);
		close();
	};

	const updateController = () => {
		setLoading(true);
		const stashId = selectedAccount?.address;
		const newControllerId = selectedControllerAccount?.address;
		editController(newControllerId, stashId, apiInstance, {
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
			onSuccessfullSigning: (hash) => {
				const transactionHash = get(hash, "message");
				setTransactionHash(transactionHash);
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
				if (failed) {
					setIsSuccessful(false);
				} else {
					setIsSuccessful(true);
				}
				// handleOnClickCancel();
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
		const substrateStashId = encodeAddress(
			decodeAddress(selectedAccount?.address),
			42
		);
		const substrateControllerId = encodeAddress(
			decodeAddress(selectedControllerAccount?.address),
			42
		);
		apiInstance.tx.staking
			.setController(substrateControllerId)
			.paymentInfo(substrateStashId)
			.then((info) => {
				const fee = info.partialFee.toNumber();
				setTransactionFee(fee);
			});
	}, [selectedAccount, selectedControllerAccount]);

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
			<ModalContent
				rounded="lg"
				height={"36rem"}
				maxWidth="40rem"
				py={4}
				alignItems="center"
				alignContent="center"
			>
				{/* <ModalHeader>
					<div>
						<h3 className="text-center text-2xl text-gray-700">Confirmation</h3>
						<p className="text-center text-sm text-gray-700">
							Please confirm the details below
						</p>
					</div>
				</ModalHeader> */}
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
				<ModalBody width="full" height="full" alignItems="center">
					{eligibleAccounts.length > 0 ? (
						!loading && isNil(isSuccessful) ? (
							<div className="w-full h-full flex text-left text-gray-700 flex-col justify-center items-center space-y-6">
								<div>
									<h3 className="text-center text-2xl text-gray-700">
										Confirmation
									</h3>
									<p className="text-center text-sm text-gray-700">
										Please confirm the details below
									</p>
								</div>
								<div className="w-full max-w-lg">
									<p className="w-full mb-2">Your controller:</p>
									<div className="w-full">
										<Account
											account={selectedControllerAccount}
											balances={
												accountsBalances[selectedControllerAccount?.address]
											}
											networkInfo={networkInfo}
											onAccountSelected={() => {
												return;
											}}
											disabled={true}
										/>
									</div>
									<div className="w-full px-4">
										<div className="flex justify-between mt-4">
											<div className="text-xs text-gray-700 flex items-center">
												<p>Transaction Fee</p>
												<HelpPopover
													content={
														<p className="text-xs text-white">
															This fee is used to pay for the resources used for
															processing the transaction on the blockchain
															network. YieldScan doesn’t profit from this fee in
															any way.
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
									</div>
									<div className="w-full mt-4">
										<button
											className={`w-full rounded-lg min-w-32 font-medium p-3 bg-teal-500 text-white z-20 ${
												!selectedControllerAccount &&
												"cursor-not-allowed opacity-50"
											}`}
											onClick={updateController}
											disabled={!selectedControllerAccount}
										>
											Set Controller
										</button>
									</div>
									<button
										className="w-full rounded-lg min-w-32 text-gray-700 font-medium underline mt-4"
										onClick={handleOnClickCancel}
									>
										Cancel
									</button>
								</div>
							</div>
						) : (
							<div className="w-full h-full flex text-left text-gray-700 flex-col justify-center items-center space-y-6">
								<div className="w-full flex justify-center">
									<span
										className={`loader ${
											isNil(isSuccessful)
												? ""
												: isSuccessful
												? "success"
												: "fail"
										}`}
									></span>
								</div>
								<div className="w-full max-w-sm flex flex-col items-center space-y-6">
									<div className="flex flex-col items-center text-center">
										{!isNil(isSuccessful) && (
											<h1 className="text-gray-700 text-2xl font-semibold">
												{isSuccessful ? "Wohoo!" : "Oops!"}
											</h1>
										)}
										<p className="text-gray-700">
											{loading
												? "Waiting for you to sign the transaction..."
												: isSuccessful
												? "Your controller is successfully set up"
												: "Failed to set up your controller"}
										</p>
									</div>
									{!isNil(isSuccessful) && (
										<BottomNextButton
											onClick={() => {
												if (isSuccessful) {
													close();
													incrementStep();
												} else handleOnClickCancel();
											}}
										>
											{isSuccessful ? "Done" : "Retry"}
										</BottomNextButton>
									)}
								</div>
							</div>
						)
					) : (
						<NoElligibleControllerAccounts networkInfo={networkInfo} />
					)}
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};
