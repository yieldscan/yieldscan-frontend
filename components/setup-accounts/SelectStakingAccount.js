import { useEffect, useState } from "react";
import { isNil } from "lodash";
import {
	Alert,
	AlertDescription,
	AlertIcon,
	AlertTitle,
} from "@chakra-ui/core";
import addToLocalStorage from "@lib/addToLocalStorage";
import {
	BottomBackButton,
	BottomNextButton,
	BackButtonContent,
	NextButtonContent,
} from "../common/BottomButton";
import PopoverAccountSelection from "../common/PopoverAccountSelection";
import InsufficientBalanceAlert from "./InsufficientBalanceAlert";

const SelectStakingAccount = ({
	decrementCurrentStep,
	incrementCurrentStep,
	networkInfo,
	accounts,
	accountsBalances,
	setSelectedAccount,
	api,
	accountsControllerStashInfo,
	selectedAccount,
}) => {
	const [isStashPopoverOpen, setIsStashPopoverOpen] = useState(false);

	const [filteredAccounts, setFilteredAccounts] = useState(null);
	const [selected, setSelected] = useState(() =>
		selectedAccount ? selectedAccount : null
	);

	const handleOnClick = (account) => {
		setSelected(account);
		setIsStashPopoverOpen(false);
	};

	// useEffect(() => {
	// 	if (api) {
	// 		setExistentialDeposit(
	// 			() =>
	// 				api.consts.balances.existentialDeposit.toNumber() /
	// 				Math.pow(10, networkInfo.decimalPlaces)
	// 		);
	// 	}
	// }, []);

	useEffect(() => {
		const filteredAccounts = accounts.filter(
			(account) =>
				// accountsBalances[account.address]?.freeBalance.gte(
				// 	api?.consts.balances.existentialDeposit
				// ) &&
				!accountsControllerStashInfo[account.address]?.isController ||
				accountsControllerStashInfo[account.address]?.isSameStashController
		);
		filteredAccounts.map((account) => {
			account.disabledSelection = accountsBalances[
				account.address
			]?.freeBalance.lte(api?.consts.balances.existentialDeposit);
		});
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
			<div>
				<h1 className="text-2xl font-semibold">Select staking account</h1>
				<p className="text-gray-600 text-sm max-w-md">
					Choose the account you want to use for staking, this would be your
					main wallet
				</p>
			</div>
			<div className="space-y-4">
				{filteredAccounts && (
					<div className="w-full space-y-4">
						{filteredAccounts.length === 0 && (
							<NoElligibleAccounts networkInfo={networkInfo} />
						)}
						{selected?.disabledSelection && <InsufficientBalanceAlert />}
						<PopoverAccountSelection
							accounts={filteredAccounts}
							accountsBalances={accountsBalances}
							isStashPopoverOpen={isStashPopoverOpen}
							setIsStashPopoverOpen={setIsStashPopoverOpen}
							networkInfo={networkInfo}
							selectedAccount={selected}
							onClick={handleOnClick}
							isSetUp={true}
							disabled={filteredAccounts.length === 0}
						/>
					</div>
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
						onClick={() => {
							addToLocalStorage(
								networkInfo.network,
								"selectedAccount",
								selected?.address
							);
							setSelectedAccount(selected);
							incrementCurrentStep();
						}}
						disabled={isNil(selected) || selected?.disabledSelection}
					>
						<NextButtonContent />
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
export default SelectStakingAccount;

const NoElligibleAccounts = ({ networkInfo }) => (
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
				No elligible accounts available
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
