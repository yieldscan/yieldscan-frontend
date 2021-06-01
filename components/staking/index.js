import { useState, useEffect } from "react";
import { get, isNil } from "lodash";
import Identicon from "@components/common/Identicon";
import Image from "next/image";
import router from "next/router";
import {
	useSelectedAccount,
	useTransaction,
	useSelectedNetwork,
	usePolkadotApi,
	useAccountsBalances,
	useAccountsStakingInfo,
	useAccountsStakingLedgerInfo,
} from "@lib/store";
import { getNetworkInfo } from "yieldscan.config";
import RiskTag from "@components/reward-calculator/RiskTag";
import formatCurrency from "@lib/format-currency";
import { GlossaryModal, HelpPopover } from "@components/reward-calculator";
import { Spinner, Divider } from "@chakra-ui/core";
import getTransactionFee from "@lib/getTransactionFee";
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";
import { ChevronLeft } from "react-feather";

const Staking = () => {
	const { selectedNetwork } = useSelectedNetwork();
	const { apiInstance } = usePolkadotApi();
	const networkInfo = getNetworkInfo(selectedNetwork);
	const { selectedAccount } = useSelectedAccount();
	const { setTransactionState, ...transactionState } = useTransaction();
	const { accountsBalances, setAccountsBalances } = useAccountsBalances();
	const { accountsStakingInfo, setAccountsStakingInfo } =
		useAccountsStakingInfo();
	const { accountsStakingLedgerInfo, setAccountsStakingLedgerInfo } =
		useAccountsStakingLedgerInfo();
	const selectedValidators = get(transactionState, "selectedValidators", []);
	const stakingAmount = get(transactionState, "stakingAmount", 0);
	const [transactionFee, setTransactionFee] = useState(0);

	useEffect(() => {
		if (selectedAccount && apiInstance) {
			const nominatedValidators = transactionState.selectedValidators.map(
				(v) => v.stashId
			);
			const substrateControllerId = encodeAddress(
				decodeAddress(
					accountsStakingInfo[selectedAccount.address].controllerId
				),
				42
			);
			apiInstance.tx.staking
				.nominate(nominatedValidators)
				.paymentInfo(substrateControllerId)
				.then((info) => {
					const fee = info.partialFee.toNumber();
					console.log("fee");
					console.log(fee);
					setTransactionFee(fee);
				});
		}
	}, [accountsStakingInfo[selectedAccount.address]]);

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
					<div className="flex flex-col w-full max-w-xl items-center justify-center space-y-6">
						<div className="w-full flex justify-center items-center">
							<Image
								src="/images/channel.svg"
								width="60"
								height="60"
								alt="walletIcon"
							/>
						</div>
						<div className="text-center space-y-2">
							<h1 className="text-2xl  font-semibold">
								Stake to start earning
							</h1>
							<p className="text-gray-600 text-sm">
								You will be delegating your stake to the following validators.
								Please make sure you understand the risks before proceeding.
							</p>
						</div>
						<div className="h-48 w-full px-4 overflow-scroll">
							{selectedValidators.map((validator) => (
								<ValidatorCard
									key={validator.stashId}
									name={validator.name}
									stashId={validator.stashId}
									riskScore={validator.riskScore.toFixed(2)}
									commission={validator.commission}
									nominators={validator.numOfNominators}
									totalStake={validator.totalStake}
									estimatedReward={Number(validator.rewardsPer100KSM)}
									networkInfo={networkInfo}
									onProfile={() => onProfile(validator)}
								/>
							))}
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
								// onClick={() => onConfirm()}
							>
								Stake Now
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
export default Staking;

const ValidatorCard = ({
	name,
	stashId,
	riskScore,
	commission,
	totalStake,
	networkInfo,
	estimatedReward,
	nominators,
	onProfile = noop,
}) => {
	const displayName = name
		? name.length > 13
			? name.slice(0, 5) + "..." + name.slice(-5)
			: name
		: stashId.slice(0, 5) + "..." + stashId.slice(-5);
	return (
		<div className="flex items-center justify-between rounded-lg border border-gray-200 py-2 w-full mb-2">
			<div className="flex items-center ml-4">
				<Identicon address={stashId} size="2rem" />
				<div className="text-gray-700 cursor-pointer ml-2" onClick={onProfile}>
					<span className="text-xs font-semibold">{displayName}</span>
				</div>
			</div>
			<div className="flex">
				<div className="flex flex-col">
					<span className="text-xs text-gray-500 font-semibold">
						Risk Score
					</span>
					<div className="rounded-full font-semibold">
						<RiskTag risk={riskScore} />
					</div>
				</div>
				<div className="flex flex-col items-center mx-2">
					<span className="text-xs text-gray-500 font-semibold">
						Nominators
					</span>
					<h3>{nominators}</h3>
				</div>
				<div className="flex flex-col items-center mx-2">
					<span className="text-xs text-gray-500 font-semibold">
						Commission
					</span>
					<h3>{commission}%</h3>
				</div>
				<div className="flex flex-col items-center mx-2">
					<span className="text-xs text-gray-500 font-semibold">
						Returns/100 {networkInfo.denom}'s
					</span>
					<h3>
						{formatCurrency.methods.formatAmount(
							Math.trunc(
								estimatedReward * Math.pow(10, networkInfo.decimalPlaces)
							),
							networkInfo
						)}
					</h3>
				</div>
			</div>
			{false && (
				<button className="flex items-center justify-between border-2 border-orange-500 rounded-lg py-1 px-3">
					<Star
						className="text-orange-500 mr-2"
						fill="#F5B100"
						size="20px"
						strokeWidth="2px"
					/>
					<div className="flex flex-col items-center">
						<span className="text-sm text-gray-900">Claim Rewards</span>
						<span className="text-xs text-gray-700">3 days left</span>
					</div>
				</button>
			)}
		</div>
	);
};
