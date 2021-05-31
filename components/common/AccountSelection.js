import React from "react";
import { isNil } from "lodash";
import addToLocalStorage from "@lib/addToLocalStorage";
import PopoverAccountSelection from "./PopoverAccountSelection";

const AccountSelection = ({
	accounts,
	toggle,
	isStashPopoverOpen,
	selectedAccount,
	networkInfo,
	accountsBalances,
	setTransactionHash,
	setIsStashPopoverOpen,
	setSelectedAccount,
}) => {
	const handleOnClick = (account) => {
		setTransactionHash(null);
		setSelectedAccount(account);
		addToLocalStorage(networkInfo.network, "selectedAccount", account.address);
		setIsStashPopoverOpen(false);
	};
	return isNil(accounts) ? (
		<button
			className="rounded-full border border-gray-300 p-2 px-4 font-medium text-gray-800"
			onClick={toggle}
		>
			Connect Wallet
		</button>
	) : (
		<PopoverAccountSelection
			accounts={accounts}
			isStashPopoverOpen={isStashPopoverOpen}
			selectedAccount={selectedAccount}
			networkInfo={networkInfo}
			accountsBalances={accountsBalances}
			setIsStashPopoverOpen={setIsStashPopoverOpen}
			onClick={handleOnClick}
		/>
	);
};
export default AccountSelection;
