import { useEffect, useState } from "react";
import { isNil } from "lodash";
import {
	useAccounts,
	useAccountsBalances,
	useSelectedAccount,
	useAccountsControllerStashInfo,
} from "@lib/store";
import addToLocalStorage from "@lib/addToLocalStorage";
import { BottomBackButton, BottomNextButton } from "./BottomButton";
import PopoverAccountSelection from "../common/PopoverAccountSelection";

const SelectStakingAccount = ({
	decrementCurrentStep,
	incrementCurrentStep,
	networkInfo,
}) => {
	const { accounts } = useAccounts();
	const { accountsBalances } = useAccountsBalances();
	const { selectedAccount, setSelectedAccount } = useSelectedAccount();
	const { accountsControllerStashInfo } = useAccountsControllerStashInfo();
	const [isStashPopoverOpen, setIsStashPopoverOpen] = useState(false);

	const [filteredAccounts, setFilteredAccounts] = useState(null);

	const handleOnClick = (account) => {
		setSelectedAccount(account);
		addToLocalStorage(networkInfo.network, "selectedAccount", account.address);
		setIsStashPopoverOpen(false);
	};

	useEffect(() => {
		const filteredAccounts = accounts.filter(
			(account) =>
				!accountsControllerStashInfo[account.address].isController ||
				accountsControllerStashInfo[account.address].isSameStashController
		);
		setFilteredAccounts(filteredAccounts);
	}, [accountsControllerStashInfo]);

	return (
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
					<PopoverAccountSelection
						accounts={filteredAccounts}
						accountsBalances={accountsBalances}
						isStashPopoverOpen={isStashPopoverOpen}
						setIsStashPopoverOpen={setIsStashPopoverOpen}
						networkInfo={networkInfo}
						selectedAccount={selectedAccount}
						onClick={handleOnClick}
						isSetUp={true}
					/>
				)}
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
						incrementCurrentStep();
					}}
					disabled={isNil(selectedAccount)}
				>
					Next
				</BottomNextButton>
			</div>
		</div>
	);
};
export default SelectStakingAccount;
