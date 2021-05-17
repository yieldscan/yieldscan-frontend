import React from "react";
import { get, isNil } from "lodash";
import { ChevronDown } from "react-feather";
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
	Skeleton,
} from "@chakra-ui/core";
import Identicon from "@components/common/Identicon";
import formatCurrency from "@lib/format-currency";
import { setCookie } from "nookies";

const AccountSelection = ({
	accounts,
	toggle,
	isStashPopoverOpen,
	selectedAccount,
	accountsWithBalances,
	networkInfo,
	accountsBalances,
	accountsWithoutCurrent,
	setStashAccount,
	setBondedAmount,
	setTransactionHash,
	setIsStashPopoverOpen,
	setSelectedAccount,
}) => {
	return isNil(accounts) ? (
		<button
			className="rounded-full border border-gray-300 p-2 px-4 font-medium text-gray-800 mr-4"
			onClick={toggle}
		>
			Connect Wallet
		</button>
	) : (
		<Popover
			isOpen={isStashPopoverOpen}
			onClose={() => setIsStashPopoverOpen(false)}
			onOpen={() => setIsStashPopoverOpen(true)}
		>
			<PopoverTrigger>
				{isNil(selectedAccount) ? (
					<button className="rounded-full flex items-center mr-8 font-medium">
						Select Account
						<ChevronDown size="20px" className="ml-2" />
					</button>
				) : (
					<button className="flex items-center mr-8">
						<Identicon address={get(selectedAccount, "address")} />
						<div className="flex flex-col cursor-pointer ml-2 text-left">
							<h3 className="flex items-center text-gray-700 font-medium -mb-1">
								{get(selectedAccount, "meta.name", "")}
							</h3>

							<span className="flex flex-row text-gray-600 text-xs">
								<span>Total: </span>
								<span className="ml-1">
									{accountsBalances[selectedAccount.address] ? (
										formatCurrency.methods.formatAmount(
											parseInt(
												accountsBalances[selectedAccount.address].freeBalance
											) +
												parseInt(
													accountsBalances[selectedAccount.address]
														.reservedBalance
												),
											networkInfo
										)
									) : (
										<Skeleton>
											<p>Loading ...</p>
										</Skeleton>
									)}
								</span>
							</span>
						</div>
						<ChevronDown size="20px" className="ml-4" />
					</button>
				)}
			</PopoverTrigger>
			<PopoverContent
				zIndex={50}
				maxWidth="20rem"
				backgroundColor="gray.700"
				border="none"
			>
				<p className="text-white text-xxs tracking-widest pt-2 pl-2">
					ACCOUNTS
				</p>
				<div className="flex flex-col justify-center my-2 text-white w-full">
					{accounts
						.filter((account) => account.address !== selectedAccount?.address)
						.map((account) => (
							<React.Fragment key={account.address}>
								<button
									className="flex items-center rounded px-4 py-2 w-full bg-gray-800 hover:bg-gray-700 hover:text-gray-200"
									onClick={() => {
										setBondedAmount(null);
										setStashAccount(account);
										setTransactionHash(null);
										setCookie(
											null,
											networkInfo.network + "Default",
											account.address,
											{ maxAge: 7 * 24 * 60 * 60 }
										);
										setSelectedAccount(account);
										addToLocalStorage(
											networkInfo.network,
											"selectedAccount",
											account.address
										);
										setIsStashPopoverOpen(false);
									}}
								>
									<Identicon address={account.address} size="32" />
									<span className="flex flex-col items-start w-1/2 ml-2">
										<span className="truncate w-full text-left pr-1">
											{account.meta.name}
										</span>
										{accountsBalances[account.address] ? (
											<p className="text-xs text-gray-500">
												{formatCurrency.methods.formatAmount(
													parseInt(
														accountsBalances[account.address].freeBalance
													) +
														parseInt(
															accountsBalances[account.address].reservedBalance
														),
													networkInfo
												)}{" "}
												{formatCurrency.methods.formatAmount(
													parseInt(
														accountsBalances[account.address].freeBalance
													) +
														parseInt(
															accountsBalances[account.address].reservedBalance
														),
													networkInfo
												) === "0" && get(networkInfo, "denom")}
											</p>
										) : (
											<Skeleton>
												<p>Loading...</p>
											</Skeleton>
										)}
									</span>
									<span className="text-xs text-gray-500 w-1/2 text-right">
										{account.address.slice(0, 6) +
											"..." +
											account.address.slice(-6)}
									</span>
								</button>
								<hr className="border-gray-700" />
							</React.Fragment>
						))}
					<hr className="border-gray-700" />
				</div>
			</PopoverContent>
		</Popover>
	);
};
export default AccountSelection;
