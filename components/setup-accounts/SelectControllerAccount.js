import { useState } from "react";
import { isNil } from "lodash";
import { useAccounts, useAccountsBalances } from "@lib/store";
import getFromLocalStorage from "@lib/getFromLocalStorage";
import addToLocalStorage from "@lib/addToLocalStorage";
import { BottomBackButton, BottomNextButton } from "./BottomButton";
import AccountButton from "./AccountButton";

const SelectControllerAccount = ({
	decrementCurrentStep,
	incrementCurrentStep,
	networkInfo,
}) => {
	const { accounts } = useAccounts();
	const { accountsBalances } = useAccountsBalances();
	const [infoIndex, setInfoIndex] = useState();
	const [isOpen, setIsOpen] = useState(false);
	const [isLedgerWalletObj, setIsLedgerWalletObj] = useState(() =>
		accounts.reduce((acc, account) => {
			if (
				isNil(
					getFromLocalStorage(account.address + networkInfo.network, "isLedger")
				)
			) {
				acc[account.address] = false;
			} else
				acc[account.address] = JSON.parse(
					getFromLocalStorage(account.address + networkInfo.network, "isLedger")
				);
			return acc;
		}, {})
	);

	const handleSelection = (address, info) => {
		setIsLedgerWalletObj((state) => ({ ...state, [address]: !info }));
	};

	const handleOnClickNext = () => {
		accounts.map((account) => {
			addToLocalStorage(
				account.address + networkInfo.network,
				"isLedger",
				isLedgerWalletObj[account.address]
			);
		});
	};

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
				<h2 className="text-md font-semibold underline cursor-pointer">
					Don’t see your account?
				</h2>
				{/* <div className="w-full max-h-xl grid grid-cols-4 gap-3 items-center">
					{isLedgerWalletObj &&
						accounts.map((account) => (
							<AccountButton
								key={account.address}
								account={account}
								balance={accountsBalances[account.address]}
								networkInfo={networkInfo}
								handleSelection={handleSelection}
								isLedgerWallet={isLedgerWalletObj[account.address]}
							/>
						))}
				</div> */}
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
						handleOnClickNext();
						incrementCurrentStep();
					}}
				>
					Next
				</BottomNextButton>
			</div>
		</div>
	);
};
export default SelectControllerAccount;
