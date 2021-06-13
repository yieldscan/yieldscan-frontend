import { useEffect, useState } from "react";
import { isNil } from "lodash";
import { useAccounts, useAccountsBalances, useWalletType } from "@lib/store";
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
	accounts,
	accountsBalances,
	walletType,
	setWalletType,
}) => {
	const [isLedgerWalletObj, setIsLedgerWalletObj] = useState(() =>
		accounts?.reduce((acc, account) => {
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
		accounts.map((account) => {
			addToLocalStorage(
				account.substrateAddress,
				"isLedger",
				isLedgerWalletObj[account.substrateAddress]
			);
			const accountsType = walletType;
			accountsType[account.substrateAddress] =
				isLedgerWalletObj[account.substrateAddress];
			setWalletType({ ...accountsType });
		});
	};

	useEffect(() => {
		accounts?.reduce((acc, account) => {
			if (isNil(getFromLocalStorage(account.substrateAddress, "isLedger"))) {
				acc[account.substrateAddress] = false;
			} else
				acc[account.substrateAddress] = JSON.parse(
					getFromLocalStorage(account.substrateAddress, "isLedger")
				);
			return acc;
		}, {});
	}, [accounts]);

	return isLedgerWalletObj ? (
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
								isLedgerWallet={isLedgerWalletObj[account.substrateAddress]}
							/>
						))}
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
								handleOnClickNext();
								incrementCurrentStep();
							}}
							disabled={!Object.values(isLedgerWalletObj).includes(true)}
						>
							<NextButtonContent />
						</BottomNextButton>
					</div>
				</div>
			</div>
		</div>
	) : (
		<div className="flex h-full w-full text-left text-gray-700 flex-col justify-center items-center">
			<span className="loader"></span>
		</div>
	);
};
export default IdentifyLedgerAccounts;
