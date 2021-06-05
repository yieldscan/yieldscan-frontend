import { useState } from "react";
import { isNil } from "lodash";
import { useAccounts, useAccountsBalances } from "@lib/store";
import getFromLocalStorage from "@lib/getFromLocalStorage";
import addToLocalStorage from "@lib/addToLocalStorage";
import {
	BackButtonContent,
	BottomBackButton,
	BottomNextButton,
	NextButtonContent,
} from "./BottomButton";
import AccountButton from "./AccountButton";

const IdentifyLedgerAccounts = ({
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
		<div className="w-full h-full max-w-2xl grid grid-rows-6 gap-2 text-gray-700 p-4 text-gray-700">
			<div className="row-span-2 w-full h-full flex flex-col justify-center">
				<h1 className="text-2xl font-semibold">
					Identify your ledger accounts
				</h1>
				<p className="text-gray-600 text-sm max-w-md">
					Please select all the accounts which are imported from your ledger
					device
				</p>
				<h2 className="text-md font-semibold underline cursor-pointer">
					How do I check?
				</h2>
			</div>
			<div className="row-span-4 w-full space-y-4">
				<div className="w-full h-80 grid grid-cols-4 gap-3 overflow-y-scroll items-center">
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
				</div>
				<div className="w-full flex flex-row justify-start space-x-3">
					<div>
						<BottomBackButton
							onClick={() => {
								decrementCurrentStep();
							}}
						>
							<BackButtonContent />
						</BottomBackButton>
					</div>
					<div>
						<BottomNextButton
							onClick={() => {
								handleOnClickNext();
								incrementCurrentStep();
							}}
						>
							<NextButtonContent />
						</BottomNextButton>
					</div>
				</div>
			</div>
		</div>
	);
};
export default IdentifyLedgerAccounts;
