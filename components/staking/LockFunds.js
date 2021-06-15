import { useState, useEffect } from "react";
import { get, isNil } from "lodash";
import Image from "next/image";
import router from "next/router";
import formatCurrency from "@lib/format-currency";
import { HelpPopover } from "@components/reward-calculator";
import { Spinner, Divider } from "@chakra-ui/core";
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";
import { ChevronLeft } from "react-feather";
import Account from "../wallet-connect/Account";

const LockFunds = ({
	balances,
	controllerBalances,
	stakingInfo,
	apiInstance,
	selectedAccount,
	controllerAccount,
	networkInfo,
	transactionState,
	onConfirm,
}) => {
	const selectedValidators = get(transactionState, "selectedValidators", []);
	const stakingAmount = get(transactionState, "stakingAmount", 0);
	const [transactionFee, setTransactionFee] = useState(0);

	const handleOnClick = () => {
		const type = stakingInfo?.stakingLedger?.total.isEmpty
			? "lock-funds"
			: "bond-extra";

		return onConfirm(type);
	};

	useEffect(() => {
		if (selectedAccount && apiInstance) {
			const nominatedValidators = transactionState.selectedValidators.map(
				(v) => v.stashId
			);
			const substrateControllerId = encodeAddress(
				decodeAddress(controllerAccount?.address),
				42
			);
			const tranasactionType = stakingInfo?.stakingLedger?.total.isEmpty
				? "lock-funds"
				: "bond-extra";
			const transactions = [];
			if (tranasactionType === "lock-funds") {
				const amount = Math.trunc(
					stakingAmount * 10 ** networkInfo.decimalPlaces
				);
				transactions.push(
					apiInstance.tx.staking.bond(
						substrateControllerId,
						amount,
						transactionState.rewardDestination
					)
				);
			} else if (tranasactionType === "bond-extra") {
				const amount = Math.trunc(
					stakingAmount * 10 ** networkInfo.decimalPlaces
				);
				transactions.push(apiInstance.tx.staking.bondExtra(amount));
			}
			transactions[0].paymentInfo(substrateControllerId).then((info) => {
				const fee = info.partialFee.toNumber();
				setTransactionFee(fee);
			});
		}
	}, [stakingInfo]);

	return (
		<div className="w-full h-full flex justify-center max-h-full">
			<div className="flex flex-col w-full max-w-65-rem h-full space-y-evenly">
				<div className="p-2 w-full">
					<button
						className="flex items-center bg-gray-200 text-gray-600 rounded-full px-2 py-1"
						onClick={() => router.back()}
					>
						<ChevronLeft size={16} className="text-gray-600" />
						<span className="mx-2 text-sm">back</span>
					</button>
				</div>
				<div className="flex-1 flex justify-center items-center">
					<div className="flex flex-col w-full max-w-xl items-center justify-center space-y-4">
						<div className="w-full flex justify-center items-center">
							<Image
								src="/images/lock-alt.svg"
								width="60"
								height="60"
								alt="lock"
							/>
						</div>
						<div className="text-center space-y-2">
							<h1 className="text-2xl  font-semibold">
								Lock funds for staking
							</h1>
							<p className="text-gray-600 text-sm">
								You need to lock your funds to earn staking rewards. Your funds
								can be unbonded at any time, but unbonding takes 28 days.
							</p>
						</div>
						<div className="flex flex-col w-full text-gray-700 text-sm space-y-2 font-semibold">
							<div>
								<p className="ml-2">Stash Account</p>
								<Account
									account={selectedAccount}
									balances={balances}
									networkInfo={networkInfo}
									onAccountSelected={() => {
										return;
									}}
									disabled={true}
								/>
							</div>
							<div>
								<p className="ml-2">Controller Account</p>
								<Account
									account={controllerAccount}
									balances={controllerBalances}
									networkInfo={networkInfo}
									onAccountSelected={() => {
										return;
									}}
									disabled={true}
								/>
							</div>
						</div>
						<div className="w-full px-4">
							<div className="flex justify-between">
								<p className="text-gray-700 text-xs">Staking amount</p>
								<div className="flex flex-col">
									<p className="text-sm font-semibold text-right">
										{formatCurrency.methods.formatAmount(
											Math.trunc(
												stakingAmount * 10 ** networkInfo.decimalPlaces
											),
											networkInfo
										)}
									</p>
									{/* <p className="text-xs text-right text-gray-600">
								${subCurrency.toFixed(2)}
							</p> */}
								</div>
							</div>

							<div className="flex justify-between mt-4">
								<div className="text-xs text-gray-700 flex items-center">
									<p>Transaction Fee</p>
									<HelpPopover
										content={
											<p className="text-xs text-white">
												This fee is used to pay for the resources used for
												processing the transaction on the blockchain network.
												YieldScan doesn’t profit from this fee in any way.
											</p>
										}
									/>
								</div>

								<div className="flex flex-col">
									{transactionFee !== 0 ? (
										<div>
											<p className="text-sm font-semibold text-right">
												{formatCurrency.methods.formatAmount(
													Math.trunc(transactionFee),
													networkInfo
												)}
											</p>
											{/* <p className="text-xs text-right text-gray-600">
									${subFeeCurrency.toFixed(2)}
								</p> */}
										</div>
									) : (
										<Spinner />
									)}
								</div>
							</div>
							<Divider my={6} />
							<div className="flex justify-between">
								<p className="text-gray-700 text-sm font-semibold">
									Total Amount
								</p>
								<div className="flex flex-col">
									<p className="text-lg text-right font-bold">
										{formatCurrency.methods.formatAmount(
											Math.trunc(
												stakingAmount * 10 ** networkInfo.decimalPlaces
											) + transactionFee,
											networkInfo
										)}
									</p>
									{/* <p className="text-sm text-right text-gray-600 font-medium">
							${(subCurrency + subFeeCurrency).toFixed(2)}
						</p> */}
								</div>
							</div>
						</div>
						<div className="mt-4 w-full text-center">
							<button
								className="rounded-full font-medium px-12 py-3 bg-teal-500 text-white"
								onClick={handleOnClick}
							>
								Lock Funds
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
export default LockFunds;
