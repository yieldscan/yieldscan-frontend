import { useState } from "react";
import { Box, Skeleton, Spinner } from "@chakra-ui/core";
import Identicon from "@components/common/Identicon";
import { get } from "lodash";
import formatCurrency from "@lib/format-currency";

const SelectAccount = ({ accounts, onStashSelected, networkInfo }) => {
	return (
		<div className="mx-6 mb-6 flex flex-col items-center">
			<div className="py-3 self-stretch rounded-lg">
				<div className="mt-1 px-5 py-2 overflow-y-scroll text-sm accounts-container">
					{accounts.map((account) => {
						return (
							<div
								key={account.address}
								className={`
								flex items-center rounded-lg border-1 border-gray-200 border-2 transform hover:scale-105 cursor-pointer px-3 py-3 mb-2 text-gray-600
								transition-all duration-300 ease-in-out
							`}
								onClick={() => onStashSelected(account)}
							>
								<Identicon address={get(account, "address")} size="3rem" />
								<div className="ml-2 flex w-full">
									<div className="ml-2 flex-col w-1/2">
										<p className="text-gray-700 text-base font-medium">
											{account.meta.name}
										</p>
										{account.balances ? (
											<p className="text-gray-600 text-sm">
												{formatCurrency.methods.formatAmount(
													Math.trunc(
														parseInt(account.balances.freeBalance) +
															parseInt(account.balances.reservedBalance)
													),
													networkInfo
												)}
												{formatCurrency.methods.formatAmount(
													Math.trunc(
														parseInt(account.balances.freeBalance) +
															parseInt(account.balances.reservedBalance)
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
										{account.address.slice(0, 6) +
											"...." +
											account.address.slice(-6)}
									</p>
								</div>
							</div>
						);
					})}
				</div>
			</div>
			<style jsx>{`
				.accounts-container {
					height: 23rem;
				}
			`}</style>
		</div>
	);
};

export default SelectAccount;
