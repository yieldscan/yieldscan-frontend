import { useState, useEffect } from "react";
import { isNil } from "lodash";
import Image from "next/image";
import router from "next/router";
import formatCurrency from "@lib/format-currency";
import { HelpPopover } from "@components/reward-calculator";
import { Spinner, Divider, Collapse } from "@chakra-ui/core";
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";
import { Check, ChevronLeft, ChevronRight } from "react-feather";
import ValidatorCard from "../ValidatorCard";
import { NextButton } from "@components/common/BottomButton";

const LockFunds = ({ networkInfo, amount, transactionFee, ysFees }) => {
	return (
		<div className="w-full px-4">
			<div className="flex justify-between">
				<p className="text-gray-700 text-xs">Staking amount</p>
				<div className="flex flex-col">
					<p className="text-gray-700 text-sm font-semibold text-right">
						{formatCurrency.methods.formatAmount(amount, networkInfo)}
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
								the transaction on the blockchain network. YieldScan doesn’t
								profit from this fee in any way.
							</p>
						}
					/>
				</div>
				<div className="flex flex-col">
					{transactionFee !== 0 ? (
						<div>
							<p className="text-gray-700 text-sm font-semibold text-right">
								{formatCurrency.methods.formatAmount(
									Math.trunc(transactionFee + ysFees),
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
				<p className="text-gray-700 text-base font-semibold">Total Amount</p>
				<div className="flex flex-col">
					<p className="text-gray-700 text-lg text-right font-bold">
						{formatCurrency.methods.formatAmount(
							Math.trunc(amount + transactionFee + ysFees),
							networkInfo
						)}
					</p>
					{/* <p className="text-sm text-right text-gray-600 font-medium">
	${(subCurrency + subFeeCurrency).toFixed(2)}
</p> */}
				</div>
			</div>
		</div>
	);
};

const AddFundsToController = ({
	networkInfo,
	transactionFee,
	controllerTransferAmount,
}) => {
	return (
		<div className="w-full px-4">
			<div className="flex justify-between mt-4">
				<p className="text-gray-700 text-xs">Transfer Amount</p>
				<div className="flex flex-col">
					<p className="text-gray-700 text-sm font-semibold text-right">
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
			<div className="flex justify-between mt-4">
				<div className="text-xs text-gray-700 flex items-center">
					<p>Transaction Fee</p>
					<HelpPopover
						content={
							<p className="text-xs text-white">
								This fee is used to pay for the resources used for processing
								the transaction on the blockchain network. YieldScan doesn’t
								profit from this fee in any way.
							</p>
						}
					/>
				</div>
				<div className="flex flex-col">
					{transactionFee !== 0 ? (
						<div>
							<p className="text-gray-700 text-sm font-semibold text-right">
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
				<p className="text-gray-700 text-base font-semibold">Total Amount</p>
				<div className="flex flex-col">
					<p className="text-gray-700 text-lg text-right font-bold">
						{formatCurrency.methods.formatAmount(
							Math.trunc(controllerTransferAmount + transactionFee),
							networkInfo
						)}
					</p>
					{/* <p className="text-sm text-right text-gray-600 font-medium">
	${(subCurrency + subFeeCurrency).toFixed(2)}
</p> */}
				</div>
			</div>
		</div>
	);
};

const ValidatorsList = ({
	selectedValidators,
	networkInfo,
	transactionFee,
}) => (
	<div className="w-full flex flex-col space-x-2 p-4">
		<p className="text-gray-700">Selected validators:</p>
		<div className="h-48 w-full overflow-scroll">
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
		<div className="flex justify-between mt-4">
			<div className="text-xs text-gray-700 flex items-center">
				<p>Transaction Fee</p>
				<HelpPopover
					content={
						<p className="text-xs text-white">
							This fee is used to pay for the resources used for processing the
							transaction on the blockchain network. YieldScan doesn’t profit
							from this fee in any way.
						</p>
					}
				/>
			</div>
			<div className="flex flex-col">
				{transactionFee !== 0 ? (
					<div>
						<p className="text-gray-700 text-sm font-semibold text-right">
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
			<p className="text-gray-700 text-base font-semibold">Total Amount</p>
			<div className="flex flex-col">
				<p className="text-gray-700 text-lg text-right font-bold">
					{formatCurrency.methods.formatAmount(
						Math.trunc(transactionFee),
						networkInfo
					)}
				</p>
				{/* <p className="text-sm text-right text-gray-600 font-medium">
	${(subCurrency + subFeeCurrency).toFixed(2)}
</p> */}
			</div>
		</div>
	</div>
);

const SetControllerAccount = ({ networkInfo, transactionFee }) => (
	<div className="w-full flex flex-col space-x-2 p-4">
		<div className="flex justify-between mt-4">
			<div className="text-xs text-gray-700 flex items-center">
				<p>Transaction Fee</p>
				<HelpPopover
					content={
						<p className="text-xs text-white">
							This fee is used to pay for the resources used for processing the
							transaction on the blockchain network. YieldScan doesn’t profit
							from this fee in any way.
						</p>
					}
				/>
			</div>
			<div className="flex flex-col">
				{transactionFee !== 0 ? (
					<div>
						<p className="text-gray-700 text-sm font-semibold text-right">
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
			<p className="text-gray-700 text-base font-semibold">Total Amount</p>
			<div className="flex flex-col">
				<p className="text-gray-700 text-lg text-right font-bold">
					{formatCurrency.methods.formatAmount(
						Math.trunc(transactionFee),
						networkInfo
					)}
				</p>
				{/* <p className="text-sm text-right text-gray-600 font-medium">
	${(subCurrency + subFeeCurrency).toFixed(2)}
</p> */}
			</div>
		</div>
	</div>
);

const StepperSigning = ({
	onConfirm,
	closeStepperSignerPopover,
	stakingPath,
	stepperTransactions,
	currentStep,
	transaction,
	injectorAccount,
	transactionFee,
	selectedValidators,
	apiInstance,
	networkInfo,
	transactionType,
	incrementCurrentStep,
	ysFees,
}) => {
	return (
		<div className="w-full flex flex-col justify-center items-center space-y-4">
			<h1 className="w-full text-xl text-center text-gray-700 font-semibold p-2">
				{stakingPath === "express" ? "Express" : "Secure"} Staking
			</h1>
			<div className="w-full flex flex-row items-center">
				{stepperTransactions?.map((a, index) => (
					<div key={index} className="w-full flex flex-row items-center">
						<div className="flex w-1/3 justify-center items-center">
							{index !== 0 && (
								<div className="flex w-full border-b h-0 border-gray-500 rounded-full"></div>
							)}
						</div>
						<div className="w-1/3 flex justify-center">
							{currentStep <= index + 1 ? (
								<div
									className={`h-8 w-8 border-2 ${
										index + 1 === currentStep
											? "border-teal-500 text-teal-500"
											: "border-gray-500 text-gray-500"
									} rounded-full flex items-center text-lg justify-center`}
								>
									{index + 1}
								</div>
							) : (
								<Check
									className="p-1 mr-2 rounded-full text-white bg-teal-500 bg-opacity-100"
									strokeWidth="4px"
									size={30}
								/>
							)}
						</div>
						<div className="flex w-1/3 justify-center items-center">
							{index !== stepperTransactions?.length - 1 && (
								<div className="flex w-full border-b h-0 border-gray-500 rounded-full"></div>
							)}
						</div>
					</div>
				))}
			</div>
			<div className="w-full flex flex-row items-center">
				{stepperTransactions?.map((a, index) => (
					<div
						key={index}
						className="w-full flex flex-row items-center justify-center"
					>
						<p
							className={`w-full text-center text-sm ${
								currentStep <= index ? "text-gray-500" : "text-teal-500"
							} ${currentStep !== index + 1 && "font-light"} `}
						>
							{a?.transactionHeading}
						</p>
					</div>
				))}
			</div>
			{transactionType === "bond" || transactionType === "bondExtra" ? (
				<LockFunds
					networkInfo={networkInfo}
					amount={stepperTransactions[currentStep - 1]?.stakingAmount}
					transactionFee={transactionFee}
					ysFees={ysFees}
				/>
			) : transactionType === "nominate" ? (
				<ValidatorsList
					networkInfo={networkInfo}
					selectedValidators={selectedValidators}
					transactionFee={transactionFee}
				/>
			) : transactionType === "controllerTransfer" ? (
				<AddFundsToController
					networkInfo={networkInfo}
					controllerTransferAmount={
						stepperTransactions[currentStep - 1]?.controllerTransferAmount
					}
					transactionFee={transactionFee}
				/>
			) : transactionType === "setController" ? (
				<SetControllerAccount
					networkInfo={networkInfo}
					transactionFee={transactionFee}
				/>
			) : (
				<></>
			)}
			<div className="mt-4 w-full text-center">
				<NextButton onClick={onConfirm} disabled={transactionFee === 0}>
					Continue to sign
				</NextButton>
			</div>
		</div>
	);
};
export default StepperSigning;
