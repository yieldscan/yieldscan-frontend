import { useState, useEffect } from "react";
import { get, isNil } from "lodash";
import Image from "next/image";
import router from "next/router";
import formatCurrency from "@lib/format-currency";
import { GlossaryModal, HelpPopover } from "@components/reward-calculator";
import { Spinner, Divider, Collapse } from "@chakra-ui/core";
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";
import { ArrowLeft, ChevronRight } from "react-feather";
import ValidatorCard from "./ValidatorCard";
import BrowserWalletAlert from "./BrowserWalletAlert";
import { AuthPopover, useAuthPopover } from "./AuthPopover";
import Account from "../wallet-connect/Account";

const SecureStakeToEarn = ({
	stakingInfo,
	apiInstance,
	selectedAccount,
	networkInfo,
	balances,
	confirmedControllerBalances,
	transactionState,
	onConfirm,
	decrementCurrentStep,
	confirmedControllerAccount,
	controllerTransferAmount,
	transactionFee,
	transactionType,
}) => {
	const selectedValidators = get(transactionState, "selectedValidators", []);
	const stakingAmount = get(transactionState, "stakingAmount", 0);
	// const [transactionFee, setTransactionFee] = useState(0);
	const [showValidators, setShowValidators] = useState(false);

	const { isAuthPopoverOpen, toggleIsAuthPopoverOpen, close } =
		useAuthPopover();

	const handleValToggle = () => {
		setShowValidators((show) => !show);
	};

	// const type = "nominate";

	// useEffect(() => {
	// 	if (selectedAccount && apiInstance) {
	// 		const nominatedValidators = transactionState.selectedValidators.map(
	// 			(v) => v.stashId
	// 		);
	// 		const substrateControllerId = encodeAddress(
	// 			decodeAddress(stakingInfo?.controllerId),
	// 			42
	// 		);

	// 		apiInstance.tx.staking
	// 			.nominate(nominatedValidators)
	// 			.paymentInfo(substrateControllerId)
	// 			.then((info) => {
	// 				const fee = info.partialFee.toNumber();
	// 				setTransactionFee(fee);
	// 			});
	// 	}
	// }, [stakingInfo]);

	return (
		<div className="flex flex-col w-full justify-center text-gray-700 space-y-4 p-4">
			<AuthPopover
				isAuthPopoverOpen={isAuthPopoverOpen}
				networkInfo={networkInfo}
				onConfirm={onConfirm}
				close={close}
				type={transactionType}
			/>
			<div className="space-y-2">
				<h1 className="text-2xl  font-semibold">Stake to start earning</h1>
				<p className="text-gray-600 max-w-lg text-sm">
					You will be delegating your stake to the following validators. Please
					make sure you understand the risks before proceeding.
				</p>
			</div>
			<div className="flex flex-col w-full max-w-xl text-gray-700 text-sm space-y-2 font-semibold">
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
						account={confirmedControllerAccount}
						balances={confirmedControllerBalances}
						networkInfo={networkInfo}
						onAccountSelected={() => {
							return;
						}}
						disabled={true}
					/>
				</div>
			</div>
			<div className="w-full max-w-xl flex flex-col space-y-4">
				<div className="w-full p-2">
					<button
						onClick={handleValToggle}
						className="flex text-gray-600 text-xs"
					>
						<ChevronRight
							size={16}
							className={`transition ease-in-out duration-500 mr-2 ${
								showValidators && "transform rotate-90"
							}`}
						/>
						{showValidators ? "Hide" : "Show"} suggested validators{" "}
						<HelpPopover
							content={
								<p className="text-white text-xs">
									The list of most rewarding validators, selected based on your
									investment amount and risk preference.
								</p>
							}
						/>
					</button>
					<Collapse isOpen={showValidators}>
						<div className="mt-2 rounded-xl">
							<div className="overflow-auto">
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
						</div>
					</Collapse>
				</div>
				{controllerTransferAmount > 0 && (
					<div className="flex justify-between">
						<p className="text-gray-700 text-xs">Controller transfer amount</p>
						<div className="flex flex-col">
							<p className="text-sm font-semibold text-right">
								{formatCurrency.methods.formatAmount(
									controllerTransferAmount,
									networkInfo
								)}
							</p>
							{/* <p className="text-xs text-right text-gray-600">
								${subCurrency.toFixed(2)}
							</p> */}
						</div>
					</div>
				)}
				<div className="flex justify-between">
					<p className="text-gray-700 text-xs">Staking amount</p>
					<div className="flex flex-col">
						<p className="text-sm font-semibold text-right">
							{formatCurrency.methods.formatAmount(
								Math.trunc(stakingAmount * 10 ** networkInfo.decimalPlaces),
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
									This fee is used to pay for the resources used for processing
									the transaction on the blockchain network.
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
					<p className="text-gray-700 text-sm font-semibold">Total Amount</p>
					<div className="flex flex-col">
						<p className="text-lg text-right font-bold">
							{formatCurrency.methods.formatAmount(
								Math.trunc(stakingAmount * 10 ** networkInfo.decimalPlaces) +
									transactionFee +
									controllerTransferAmount,
								networkInfo
							)}
						</p>
						{/* <p className="text-sm text-right text-gray-600 font-medium">
							${(subCurrency + subFeeCurrency).toFixed(2)}
						</p> */}
					</div>
				</div>
				<div className="mt-4 w-full text-center">
					<button
						className="w-full rounded-lg font-medium px-12 py-3 bg-teal-500 transform hover:bg-teal-700 text-white"
						onClick={() => toggleIsAuthPopoverOpen()}
					>
						Just stake, baby!
					</button>
				</div>
			</div>
			<div className="w-full flex flex-row justify-start pt-4 space-x-2">
				<button>
					<div
						className="flex flex-row space-x-2 items-center"
						onClick={() => decrementCurrentStep()}
					>
						<ArrowLeft size="18" />
						<span>Setting up your controller</span>
					</div>
				</button>
			</div>
		</div>
	);
};
export default SecureStakeToEarn;
