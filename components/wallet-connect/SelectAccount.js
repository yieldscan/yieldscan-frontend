import { useState } from "react";
import { Box, Skeleton, Spinner } from "@chakra-ui/core";
import Identicon from "@components/common/Identicon";
import { get } from "lodash";
import { useAccountsBalances } from "@lib/store";
import formatCurrency from "@lib/format-currency";

const Account = ({ account, onAccountSelected, balances, networkInfo }) => {
	return (
		<div
			key={account.address}
			className={`
		flex items-center mx-2 rounded-lg border-1 border-gray-200 border-2 p-2 transform hover:scale-105 cursor-pointer text-gray-600
		transition-all duration-300 ease-in-out
	`}
			onClick={() => onAccountSelected(account)}
		>
			<Identicon address={get(account, "address")} size="2rem" />
			<div className="ml-2 flex w-full">
				<div className="ml-2 flex-col w-1/2">
					<p className="text-gray-700 text-base font-medium">
						{account.meta.name}
					</p>
					{balances ? (
						<p className="text-gray-600 text-sm">
							{formatCurrency.methods.formatAmount(
								Math.trunc(
									parseInt(balances.freeBalance) +
										parseInt(balances.reservedBalance)
								),
								networkInfo
							)}
							{formatCurrency.methods.formatAmount(
								Math.trunc(
									parseInt(balances.freeBalance) +
										parseInt(balances.reservedBalance)
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
				</div>
				<p className="text-xs w-1/2 text-right">
					{account.address.slice(0, 6) + "...." + account.address.slice(-6)}
				</p>
			</div>
		</div>
	);
};

const SelectAccount = ({ accounts, onAccountSelected, networkInfo }) => {
	const { accountsBalances } = useAccountsBalances();
	return (
		<div className="w-full">
			<div className="w-full text-sm p-2 space-y-1 overflow-y-scroll max-h-24-rem">
				{accounts.map((account) => {
					return (
						<Account
							account={account}
							key={account.address}
							onAccountSelected={onAccountSelected}
							balances={accountsBalances[account.address]}
							networkInfo={networkInfo}
						/>
					);
				})}
			</div>
			<style jsx>{`
				.max-h-24-rem {
					max-height: 24rem;
				}
			`}</style>
		</div>
	);
};

export default SelectAccount;
