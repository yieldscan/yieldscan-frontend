import { useEffect, useState } from "react";
import {
	useAccounts,
	useAccountsBalances,
	useSelectedAccount,
	useAccountsStakingInfo,
	useAccountsControllerStashInfo,
} from "@lib/store";
import { isNil } from "lodash";
import { BottomBackButton, BottomNextButton } from "./BottomButton";
import PopoverAccountSelection from "../common/PopoverAccountSelection";
import {
	Alert,
	AlertDescription,
	AlertIcon,
	AlertTitle,
} from "@chakra-ui/core";

const SelectControllerAccount = ({
	decrementCurrentStep,
	incrementCurrentStep,
	incrementStep,
	networkInfo,
}) => {
	const { accounts } = useAccounts();
	const { accountsBalances } = useAccountsBalances();
	const { accountsStakingInfo } = useAccountsStakingInfo();
	const { selectedAccount, setSelectedAccount } = useSelectedAccount();
	const { accountsControllerStashInfo } = useAccountsControllerStashInfo();
	const [isStashPopoverOpen, setIsStashPopoverOpen] = useState(false);
	const [exisiting, setExisiting] = useState();

	const [sessionController, setSessionController] = useState(() =>
		isNil(
			window?.sessionStorage.getItem(
				selectedAccount.address + networkInfo.network + "Controller"
			)
		)
			? null
			: accounts?.filter(
					(account) =>
						account.address ===
						window?.sessionStorage.getItem(
							selectedAccount.address + networkInfo.network + "Controller"
						)
			  )[0]
	);

	const handleOnClick = (account) => {
		setSessionController(account);
		window?.sessionStorage.setItem(
			selectedAccount.address + networkInfo.network + "Controller",
			account.address
		);
		setIsStashPopoverOpen(false);
	};

	useEffect(() => {
		const controller =
			accountsStakingInfo[selectedAccount.address]?.controllerId?.toString();
		console.log("controller");
		console.log(controller);
		const controllerInfo = controller
			? accounts.filter((account) => account.address === controller)[0]
			: controller;

		setExisiting(controllerInfo);
	}, [accountsStakingInfo[selectedAccount.address]]);

	// console.log(JSON.stringify(accountsStakingInfo[selectedAccount.address]));

	console.log("exisiting");
	console.log(exisiting);
	console.log("accountsStakingInfo[selectedAccount.address]");
	console.log(accountsStakingInfo[selectedAccount.address]);

	return (
		<div className="flex-1 w-full max-w-2xl flex flex-col text-gray-700 justify-center p-4 text-gray-700 space-y-6 mb-32">
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
				{exisiting &&
					(exisiting.address === selectedAccount.address ? (
						<SameStashControllerAlert />
					) : (
						<ExistingControllerAlert />
					))}
				<PopoverAccountSelection
					accounts={accounts}
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
					disabled={!isNil(exisiting)}
				/>
				<h2 className="text-md font-semibold underline cursor-pointer">
					Don’t see your account?
				</h2>
			</div>
			<div className="w-full flex flex-row text-center space-x-3">
				<BottomBackButton
					onClick={() => {
						decrementCurrentStep();
					}}
				>
					Back
				</BottomBackButton>
				<BottomNextButton
					onClick={() => {
						incrementStep();
					}}
					disabled={isNil(sessionController) && isNil(exisiting)}
				>
					Next
				</BottomNextButton>
			</div>
		</div>
	);
};
export default SelectControllerAccount;

const ExistingControllerAlert = () => (
	<Alert
		status="warning"
		color="#FDB808"
		backgroundColor="#FFF4DA"
		borderRadius="8px"
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
		color="#FDB808"
		backgroundColor="#FFF4DA"
		borderRadius="8px"
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
