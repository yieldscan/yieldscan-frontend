import { useState } from "react";
import { isNil } from "lodash";
import { useAccounts, useAccountsBalances, useWalletType } from "@lib/store";
import getFromLocalStorage from "@lib/getFromLocalStorage";
import addToLocalStorage from "@lib/addToLocalStorage";
import {
	BackButtonContent,
	BottomBackButton,
	BottomNextButton,
	NextButtonContent,
} from "../common/BottomButton";
import AccountButton from "./AccountButton";
import { ChevronLeft } from "react-feather";

const NewSetUp_IdentifyLedgerAccounts = ({
	decrementStep,
	incrementStep,
	networkInfo,
}) => {
	const { accounts } = useAccounts();
	const { accountsBalances } = useAccountsBalances();
	const { walletType, setWalletType } = useWalletType();
	const newAccounts = accounts?.filter((account) =>
		isNil(walletType[account?.substrateAddress])
	);
	const [infoIndex, setInfoIndex] = useState();
	const [isOpen, setIsOpen] = useState(false);
	const [isLedgerWalletObj, setIsLedgerWalletObj] = useState(() =>
		newAccounts.reduce((acc, account) => {
			if (isNil(getFromLocalStorage(account.substrateAddress, "isLedger"))) {
				acc[account.substrateAddress] = false;
			} else
				acc[account.substrateAddress] = JSON.parse(
					getFromLocalStorage(account.substrateAddress, "isLedger")
				);
			return acc;
		}, {})
	);

	const handleSelection = (account, info) => {
		setIsLedgerWalletObj((state) => ({
			...state,
			[account.substrateAddress]: !info,
		}));
	};

	const handleOnClickNext = () => {
		newAccounts.map((account) => {
			addToLocalStorage(
				account.substrateAddress,
				"isLedger",
				isLedgerWalletObj[account.substrateAddress]
			);
			const accountsType = walletType;
			accountsType[account.substrateAddress] =
				isLedgerWalletObj[account.substrateAddress];
			setWalletType({ ...accountsType });
			incrementStep();
		});
	};

	return (
		<div className="w-full h-full flex flex-col justify-center items-center">
			<div className="w-full h-full max-w-2xl space-y-6">
				<div className="p-2 w-full">
					{/* TODO: Make a common back button component */}
					<button
						className="flex items-center bg-gray-200 text-gray-600 rounded-full px-2 py-1"
						onClick={decrementStep}
					>
						<ChevronLeft size={16} className="text-gray-600" />
						<span className="mx-2 text-sm">back</span>
					</button>
				</div>
				<div className="w-full flex flex-col items-center justify-center space-y-2">
					<h1 className="text-2xl font-semibold">
						Identify your ledger accounts
					</h1>
					<p className="text-gray-600 text-sm">
						Please select all the accounts which are imported from your ledger
						device
					</p>
					<h2 className="text-md font-semibold underline cursor-pointer">
						How do I check?
					</h2>
				</div>
				<div className="w-full grid grid-cols-3 justify-content gap-4 mt-6">
					{isLedgerWalletObj &&
						newAccounts.map((account) => (
							<AccountButton
								key={account.address}
								account={account}
								balance={accountsBalances[account.address]}
								networkInfo={networkInfo}
								handleSelection={handleSelection}
								isLedgerWallet={isLedgerWalletObj[account.substrateAddress]}
							/>
						))}
				</div>
				<div className="w-full flex justify-center">
					<BottomNextButton onClick={handleOnClickNext}>Done</BottomNextButton>
				</div>
			</div>
		</div>
	);
};
export default NewSetUp_IdentifyLedgerAccounts;
