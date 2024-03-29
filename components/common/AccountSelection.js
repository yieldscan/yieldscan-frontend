import React from "react";
import { isNil } from "lodash";
import addToLocalStorage from "@lib/addToLocalStorage";
import PopoverAccountSelection from "./PopoverAccountSelection";
import { useRouter } from "next/router";
import { Circle } from "react-feather";
import { track, goalCodes } from "@lib/analytics";
import axios from "@lib/axios";

const AccountSelection = ({
	accounts,
	toggle,
	isStashPopoverOpen,
	selectedAccount,
	networkInfo,
	accountsBalances,
	apiInstance,
	setTransactionHash,
	isSetUp,
	setIsStashPopoverOpen,
	setSelectedAccount,
	setIsExistingUser,
}) => {
	const router = useRouter();
	const handleOnClick = (account) => {
		setTransactionHash(null);
		setSelectedAccount(account);
		addToLocalStorage(networkInfo.network, "selectedAccount", account.address);
		track(goalCodes.GLOBAL.ACCOUNT_SELECTED);
		setIsStashPopoverOpen(false);

		axios
			.get(`/${networkInfo.network}/user/existing-user/${account.address}`)
			.then(({ data }) => {
				setIsExistingUser(data.isExistingUser);
			})
			.catch((e) => {
				console.error(e);
				console.error("unable to get existing user status");
			});
	};
	const handleOnClickSetUp = () => {
		router.push("/setup-wallet");
	};

	return isNil(accounts) ? (
		<button
			className="rounded-full border border-gray-300 p-2 px-4 font-medium text-gray-800 text-md"
			onClick={handleOnClickSetUp}
		>
			Connect Wallet
		</button>
	) : isSetUp ? (
		<button className="p-2 px-4 cursor-default font-medium text-gray-800">
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
