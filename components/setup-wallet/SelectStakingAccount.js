import { ChevronLeft } from "react-feather";
import { useRouter } from "next/router";
import SelectAccount from "@components/wallet-connect/SelectAccount";
import addToLocalStorage from "@lib/addToLocalStorage";
import { useEffect, useState } from "react";

const SelectStakingAccount = ({
	decrementStep,
	networkInfo,
	accounts,
	accountsBalances,
	accountsControllerStashInfo,
	setSelectedAccount,
	apiInstance,
}) => {
	const router = useRouter();
	const onAccountSelected = (account) => {
		setSelectedAccount(account);
		addToLocalStorage(networkInfo.network, "selectedAccount", account.address);
		router.push({ pathname: "/reward-calculator" });
	};

	const [filteredAccounts, setFilteredAccounts] = useState(null);

	useEffect(() => {
		const filteredAccounts = accounts?.filter(
			(account) =>
				// accountsBalances[account.address]?.freeBalance.gte(
				// 	apiInstance?.consts.balances.existentialDeposit
				// ) &&
				!accountsControllerStashInfo[account.address]?.isController ||
				accountsControllerStashInfo[account.address]?.isSameStashController
		);
		setFilteredAccounts(filteredAccounts);
	}, [
		JSON.stringify(accounts),
		JSON.stringify(accountsControllerStashInfo),
		JSON.stringify(accountsBalances),
	]);
	return filteredAccounts &&
		Object.keys(accountsBalances).length > 0 &&
		Object.keys(accountsControllerStashInfo).length > 0 ? (
		<div className="w-full h-full flex justify-center">
			<div className="w-full max-w-65-rem flex flex-col items-center">
				{/* <div className="p-2 w-full">
					<button
						className="flex items-center bg-gray-200 text-gray-600 rounded-full px-2 py-1"
						onClick={decrementStep}
					>
						<ChevronLeft size={16} className="text-gray-600" />
						<span className="mx-2 text-sm">back</span>
					</button>
				</div> */}
				<div className="flex-1 flex flex-col text-gray-700 justify-center content-center p-2 items-center text-gray-700 space-y-6 max-w-md mb-32">
					<h1 className="text-2xl font-semibold text-center">
						Select the account for staking
					</h1>
					<p className="text-gray-600 text-sm text-center max-w-md">
						Please select the account which your want to stake from
					</p>
					<SelectAccount
						accounts={filteredAccounts ? filteredAccounts : accounts}
						networkInfo={networkInfo}
						onAccountSelected={(info) => onAccountSelected(info)}
					/>
					<span className="underline text-teal-500 cursor-pointer">
						Can't find your account?
					</span>
				</div>
			</div>
		</div>
	) : (
		<div className="flex h-full w-full text-left text-gray-700 flex-col justify-center items-center">
			<span className="loader"></span>
			<p>Loading accounts and information...</p>
		</div>
	);
};

export default SelectStakingAccount;
