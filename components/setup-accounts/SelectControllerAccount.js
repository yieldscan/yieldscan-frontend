import { useEffect, useState } from "react";
import {
	usePolkadotApi,
	useAccounts,
	useAccountsBalances,
	useSelectedAccount,
	useAccountsStakingInfo,
	useAccountsControllerStashInfo,
} from "@lib/store";
import { isNil } from "lodash";
import {
	BottomBackButton,
	BottomNextButton,
	BackButtonContent,
	NextButtonContent,
} from "./BottomButton";
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
	Button,
	ModalFooter,
} from "@chakra-ui/core";
import getFromLocalStorage from "@lib/getFromLocalStorage";
import editController from "@lib/polkadot/edit-controller";

const SelectControllerAccount = ({
	decrementCurrentStep,
	incrementCurrentStep,
	incrementStep,
	networkInfo,
}) => {
	const { apiInstance } = usePolkadotApi();
	const { accounts } = useAccounts();
	const { accountsBalances } = useAccountsBalances();
	const { accountsStakingInfo } = useAccountsStakingInfo();
	const { selectedAccount, setSelectedAccount } = useSelectedAccount();
	const { accountsControllerStashInfo } = useAccountsControllerStashInfo();
	const [isLedger, setIsLedger] = useState(() =>
		JSON.parse(
			getFromLocalStorage(selectedAccount?.substrateAddress, "isLedger")
		)
	);
	const [isStashPopoverOpen, setIsStashPopoverOpen] = useState(false);
	const [exisiting, setExisiting] = useState();
	const [isOpen, setIsOpen] = useState(false);

	const [filteredAccounts, setFilteredAccounts] = useState(null);

	const [sessionController, setSessionController] = useState(() =>
		isNil(
			window?.localStorage.getItem(
				selectedAccount?.address + networkInfo.network + "Controller"
			)
		)
			? null
			: accounts?.filter(
					(account) =>
						account.address ===
						window?.localStorage.getItem(
							selectedAccount?.address + networkInfo.network + "Controller"
						)
			  )[0]
	);

	const handleOnClick = (account) => {
		setSessionController(account);
		window?.localStorage.setItem(
			selectedAccount?.address + networkInfo.network + "Controller",
			account.address
		);
		setIsStashPopoverOpen(false);
	};

	const handleOnClickNext = () =>
		exisiting
			? exisiting.address === selectedAccount.address && isLedger
				? setIsOpen(true)
				: incrementStep()
			: incrementStep();

	useEffect(() => {
		setIsLedger(() =>
			JSON.parse(
				getFromLocalStorage(selectedAccount?.substrateAddress, "isLedger")
			)
		);
	}, [selectedAccount?.address]);

	useEffect(() => {
		const controller =
			accountsStakingInfo[selectedAccount?.address]?.controllerId?.toString();
		const controllerInfo = controller
			? accounts.filter((account) => account.address === controller)[0]
			: controller;

		setExisiting(controllerInfo);
	}, [accountsStakingInfo[selectedAccount?.address]]);

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
		setFilteredAccounts(filteredAccounts);
	}, [
		JSON.stringify(accounts),
		JSON.stringify(accountsControllerStashInfo),
		JSON.stringify(accountsBalances),
	]);

	return filteredAccounts &&
		Object.keys(accountsBalances).length > 0 &&
		Object.keys(accountsControllerStashInfo).length > 0 ? (
		<div className="flex-1 w-full max-w-2xl flex flex-col text-gray-700 justify-center p-4 text-gray-700 space-y-6 mb-32">
			{exisiting &&
				isLedger &&
				exisiting.address === selectedAccount.address && (
					<EditControllerModal
						isOpen={isOpen}
						eligibleAccounts={filteredAccounts}
						accountsBalances={accountsBalances}
						networkInfo={networkInfo}
						apiInstance={apiInstance}
						selectedAccount={selectedAccount}
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
				{exisiting ? (
					exisiting.address === selectedAccount?.address ? (
						<SameStashControllerAlert />
					) : (
						<ExistingControllerAlert />
					)
				) : (
					filteredAccounts?.length === 0 && (
						<NoElligibleControllerAccounts networkInfo={networkInfo} />
					)
				)}
				{filteredAccounts && (
					<PopoverAccountSelection
						accounts={filteredAccounts}
						accountsBalances={accountsBalances}
						isStashPopoverOpen={isStashPopoverOpen}
						setIsStashPopoverOpen={setIsStashPopoverOpen}
						networkInfo={networkInfo}
						selectedAccount={
							exisiting
								? accounts.filter((account) => account === exisiting)[0]
								: sessionController
						}
						onClick={handleOnClick}
						isSetUp={true}
						disabled={
							exisiting ? true : filteredAccounts.length !== 0 ? false : true
						}
					/>
				)}
				<h2 className="text-md font-semibold underline cursor-pointer">
					Don’t see your account?
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
						disabled={isNil(sessionController) && isNil(exisiting)}
					>
						<NextButtonContent
							name={
								exisiting
									? exisiting.address === selectedAccount.address && isLedger
										? "Change controller"
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
				{"Found an exisiting controller"}
			</AlertTitle>
			<AlertDescription fontSize="xs">
				<p>
					Please make sure that your controller account is NOT imported from a
					ledger device else your staking transaction may fail. You can change
					your controller later in the settings tab.
				</p>
				<h2 className="mt-2 text-md font-semibold underline cursor-pointer">
					See how to setup a controller
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
				<h2 className="mt-2 text-md font-semibold underline cursor-pointer">
					See how to setup a controller
				</h2>
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
	accountsBalances,
	networkInfo,
	close,
	isOpen,
}) => {
	const toast = useToast();
	const [selectedControllerAccount, setSelectedControllerAccount] =
		useState(null);
	const [isStashPopoverOpen, setIsStashPopoverOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const handleOnClick = (account) => {
		setSelectedControllerAccount(account);
		setIsStashPopoverOpen(false);
	};

	const handleOnClickCancel = (account) => {
		setSelectedControllerAccount(null);
		setLoading(false);
		close();
	};

	const updateController = () => {
		setLoading(true);
		const stashId = selectedAccount?.address;
		const newControllerId = selectedControllerAccount.address;
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
				minHeight={"24rem"}
				maxWidth="40rem"
				py={4}
				alignItems="center"
				alignContent="center"
			>
				<ModalHeader>
					<div>
						<h3 className="text-center text-2xl text-gray-700">Confirmation</h3>
						<p className="text-center text-sm text-gray-700">
							Please confirm the details below
						</p>
					</div>
				</ModalHeader>
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
				<ModalBody height="full" alignItems="center">
					{eligibleAccounts.length > 0 ? (
						!loading ? (
							<div className="h-64 flex text-left text-gray-700 flex-col justify-center items-center">
								<p className="w-full mb-2">Your controller:</p>
								<PopoverAccountSelection
									accounts={eligibleAccounts}
									accountsBalances={accountsBalances}
									isStashPopoverOpen={isStashPopoverOpen}
									setIsStashPopoverOpen={setIsStashPopoverOpen}
									networkInfo={networkInfo}
									selectedAccount={selectedControllerAccount}
									onClick={handleOnClick}
									isSetUp={true}
									// disabled={
									// 	exisiting ? true : filteredAccounts.length !== 0 ? false : true
									// }
								/>
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
						) : (
							<div className="h-64 flex text-left text-gray-700 flex-col justify-center items-center">
								<span className="loader"></span>
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
