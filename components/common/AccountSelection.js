import React from "react";
import { isNil } from "lodash";
import addToLocalStorage from "@lib/addToLocalStorage";
import PopoverAccountSelection from "./PopoverAccountSelection";
import { useRouter } from "next/router";
import { Circle } from "react-feather";

const AccountSelection = ({
	accounts,
	toggle,
	isStashPopoverOpen,
	selectedAccount,
	networkInfo,
	accountsBalances,
	apiInstance,
	setTransactionHash,
	walletType,
	isSetUp,
	setIsStashPopoverOpen,
	setSelectedAccount,
}) => {
	const router = useRouter();
	const handleOnClick = (account) => {
		setTransactionHash(null);
		setSelectedAccount(account);
		addToLocalStorage(networkInfo.network, "selectedAccount", account.address);
		setIsStashPopoverOpen(false);
	};
	const handleOnClickSetUp = () => {
		router.push("/setup-accounts");
	};

	return isNil(accounts) ? (
		<button
			className="rounded-full border border-gray-300 p-2 px-4 font-medium text-gray-800"
			onClick={toggle}
		>
			Connect Wallet
		</button>
	) : isSetUp ? (
		<button
			className="p-2 px-4 cursor-default font-medium text-gray-800"
			// onClick={handleOnClickSetUp}
		>
			<div className="flex flex-row items-center justify-center space-x-2">
				<Circle
					className={`rounded-full ${
						apiInstance
							? "bg-teal-500 text-teal-500"
							: "bg-gray-500 text-gray-500"
					}`}
					size={12}
				/>
				<span>{apiInstance ? "Connected" : "Connecting..."}</span>
			</div>
		</button>
	) : Object.keys(walletType).length === 0 ||
	  Object.values(walletType).every((value) => value === null) ? (
		<button
			className="rounded-full border border-gray-300 p-2 px-4 font-medium text-gray-800"
			onClick={handleOnClickSetUp}
		>
			Setup Accounts
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
