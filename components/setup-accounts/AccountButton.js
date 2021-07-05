import { Skeleton } from "@chakra-ui/core";
import Identicon from "@components/common/Identicon";
import formatCurrency from "@lib/format-currency";
import getFromLocalStorage from "@lib/getFromLocalStorage";
import addToLocalStorage from "@lib/addToLocalStorage";
import { isNil } from "lodash";
import { useState } from "react";
import { Check } from "react-feather";

const AccountButton = ({
	account,
	balance,
	networkInfo,
	handleSelection,
	isLedgerWallet,
}) => {
	const metaName =
		account?.meta.name.length > 15
			? account?.meta.name.slice(0, 6) + "..." + account?.meta.name.slice(-6)
			: account?.meta.name;
	return (
		<button
			onClick={() => handleSelection(account, isLedgerWallet)}
			className={`flex flex-col justify-items-center items-center rounded-lg py-4 border-2 ${
				isLedgerWallet && "border-2 border-teal-500"
			}`}
		>
			<div className=" w-full h-2 grid justify-items-end">
				{isLedgerWallet && (
					<Check
						className="p-1 mr-4 rounded-full text-teal-500 border border-teal-500 bg-opacity-100"
						strokeWidth="4px"
					/>
				)}
			</div>
			<Identicon address={account.address} size="3rem" />
			<p className="text-gray-700 text-base font-medium">{metaName}</p>
			{balance ? (
				<p className="text-gray-500 text-xs">
					{formatCurrency.methods.formatAmount(
						Math.trunc(
							parseInt(balance.freeBalance) + parseInt(balance.reservedBalance)
						),
						networkInfo
					)}
					{formatCurrency.methods.formatAmount(
						Math.trunc(
							parseInt(balance.freeBalance) + parseInt(balance.reservedBalance)
						),
						networkInfo
					) === "0" && ` ${networkInfo.denom}`}
				</p>
			) : (
				<div>
					<Skeleton w={32}>
						<p className="text-xs">Loading...</p>
					</Skeleton>
				</div>
			)}
			<p className="text-xs text-gray-600 mt-2">
				{account.address.slice(0, 6) + "...." + account.address.slice(-6)}
			</p>
		</button>
	);
};

export default AccountButton;
