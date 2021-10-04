import { ArrowRight } from "react-feather";
import { Divider, Spinner } from "@chakra-ui/core";
import formatCurrency from "@lib/format-currency";
import { useEffect, useState } from "react";
import { useCoinGeckoPriceUSD } from "@lib/store";
import getUpdateFundsTransactionFee from "@lib/getUpdateFundsTransactionFee";
import { isNil } from "lodash";
import { NextButton } from "@components/common/BottomButton";
import { HelpPopover } from "@components/reward-calculator";

const AmountConfirmation = ({
	stashId,
	amount,
	subCurrency,
	type,
	api,
	stakingInfo,
	networkInfo,
	onConfirm,
	transactionFee,
	ysFees = 0,
	isExistingUser,
	currentDate,
	lastDiscountDate,
}) => {
	const { coinGeckoPriceUSD } = useCoinGeckoPriceUSD();
	const [subFeeCurrency, setSubFeeCurrency] = useState();
	const [totalAmount, setTotalAmount] = useState(0);
	const [totalAmountFiat, setTotalAmountFiat] = useState(0);

	// useEffect(() => {
	// 	if (!transactionFee) {
	// 		getUpdateFundsTransactionFee(
	// 			stashId,
	// 			amount,
	// 			type,
	// 			stakingInfo.stakingLedger.active /
	// 				Math.pow(10, networkInfo.decimalPlaces),
	// 			api,
	// 			networkInfo
	// 		).then((data) => {
	// 			if (type == "unbond") {
	// 				data.partialFee !== undefined
	// 					? setTransactionFee(data.partialFee.toNumber())
	// 					: setTransactionFee(0);
	// 			} else setTransactionFee(data);
	// 		});
	// 	}
	// }, [amount, stashId, networkInfo, type]);

	useEffect(() => {
		if (transactionFee) {
			setSubFeeCurrency(
				(transactionFee / Math.pow(10, networkInfo.decimalPlaces)) *
					coinGeckoPriceUSD
			);
		}
	}, [transactionFee]);

	useEffect(() => {
		if (totalAmount) {
			setTotalAmountFiat(totalAmount * coinGeckoPriceUSD);
		}
	}, [totalAmount]);

	useEffect(() => {
		if (!totalAmount) {
			type === "bond" || type == "rebond"
				? setTotalAmount(
						amount +
							stakingInfo.stakingLedger.active /
								Math.pow(10, networkInfo.decimalPlaces)
				  )
				: setTotalAmount(
						stakingInfo.stakingLedger.active /
							Math.pow(10, networkInfo.decimalPlaces) -
							amount
				  );
		}
	}, [amount, stakingInfo]);

	return (
		<div className="flex flex-col">
			<div className="flex flex-col">
				<h3 className="mt-4 text-2xl">Confirmation</h3>
				<div className="mt-2 mb-8 rounded text-gray-900 flex items-center justify-between">
					<div className="rounded-lg flex-col ml-2">
						<span className="text-gray-500 white-space-nowrap text-xs">
							Current Investment Value
						</span>
						<h3 className="text-2xl white-space-nowrap">
							{formatCurrency.methods.formatAmount(
								stakingInfo.stakingLedger.active,
								networkInfo
							)}
						</h3>
						<span className="text-sm font-medium text-teal-500">
							$
							{(
								(stakingInfo.stakingLedger.active /
									Math.pow(10, networkInfo.decimalPlaces)) *
								coinGeckoPriceUSD
							).toFixed(2)}
						</span>
					</div>
					<div>
						<ArrowRight size="2rem" />
					</div>
					<div className="rounded-lg flex-col mr-2 ">
						<span className="text-gray-500 white-space-nowrap  text-xs">
							Final Investment Value
						</span>
						<h3 className="text-2xl white-space-nowrap">
							{formatCurrency.methods.formatAmount(
								Math.trunc(
									totalAmount * Math.pow(10, networkInfo.decimalPlaces)
								),
								networkInfo
							)}
						</h3>
						<span className="text-sm font-medium text-teal-500">
							${totalAmountFiat.toFixed(2)}
						</span>
					</div>
				</div>
			</div>
			{/* <button
				className="mt-8 px-24 py-4 bg-teal-500 text-white rounded-lg"
				onClick={handlePopoverClose}
			>
				Back to Dashboard
			</button> */}
			<div className="w-full mt-8">
				<div className="flex justify-between">
					<p className="text-gray-700 text-xs">Additional Investment Amount</p>
					<div className="flex flex-col">
						<p className="text-sm text-right">
							{type === "bond" || type == "rebond"
								? formatCurrency.methods.formatAmount(
										Math.trunc(amount * 10 ** networkInfo.decimalPlaces),
										networkInfo
								  )
								: formatCurrency.methods.formatAmount(0, networkInfo)}
						</p>
						<p className="text-xs text-right text-gray-600">
							$
							{Number(
								type === "bond" || type == "rebond"
									? amount * coinGeckoPriceUSD
									: 0
							).toFixed(2)}
						</p>
					</div>
				</div>
				<div className="flex justify-between mt-4">
					{type === "bond" && ysFees !== 0 && (
						<div className="text-xs text-gray-700 flex items-center">
							<p>
								Yieldscan Fee{" "}
								{isExistingUser &&
									currentDate <= lastDiscountDate &&
									"(50% off)"}
							</p>
							<HelpPopover
								content={
									<p className="text-xs text-white">
										This fee is used to pay for the costs of building and
										running Yieldscan. Its charged on the amount by which your
										stake is being increased.{" "}
										{isExistingUser && currentDate <= lastDiscountDate && (
											<span className="font-semibold">
												You have been given a 50% discount because you staked
												with Yieldscan on or before 15th September 2021.{" "}
											</span>
										)}
									</p>
								}
							/>
						</div>
					)}

					<div className="flex flex-col">
						{type === "bond" && ysFees !== 0 && (
							<div>
								<p className="text-sm text-right">
									{formatCurrency.methods.formatAmount(
										Math.trunc(ysFees),
										networkInfo
									)}
								</p>
								<p className="text-xs text-right text-gray-600">
									${Number(ysFees * coinGeckoPriceUSD).toFixed(2)}
								</p>
							</div>
						)}
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
						{transactionFee > 0 ? (
							<div>
								<p className="text-sm text-right">
									{formatCurrency.methods.formatAmount(
										Math.trunc(transactionFee),
										networkInfo
									)}
								</p>
								{!isNil(subFeeCurrency) && (
									<p className="text-xs text-right text-gray-600">
										${subFeeCurrency.toFixed(2)}
									</p>
								)}
							</div>
						) : (
							<Spinner />
						)}
					</div>
				</div>
				<Divider my={6} />
				<div className="flex justify-between">
					<p className="text-gray-700 text-sm font-semibold">Total Amount</p>
					{transactionFee > 0 ? (
						<div className="flex flex-col">
							<p className="text-lg text-right font-bold">
								{type === "bond" || type == "rebond"
									? formatCurrency.methods.formatAmount(
											Math.trunc(amount * 10 ** networkInfo.decimalPlaces) +
												transactionFee +
												ysFees,
											networkInfo
									  )
									: formatCurrency.methods.formatAmount(
											Math.trunc(transactionFee),
											networkInfo
									  )}
							</p>
							{!isNil(subFeeCurrency) && (
								<p className="text-sm text-right text-gray-600 font-medium">
									$
									{type === "bond" || type == "rebond"
										? (subCurrency + subFeeCurrency).toFixed(2)
										: subFeeCurrency.toFixed(2)}
								</p>
							)}
						</div>
					) : (
						<Spinner />
					)}
				</div>
			</div>
			<div className="w-full flex-center my-4">
				<NextButton onClick={onConfirm} disabled={transactionFee === 0}>
					Confirm
				</NextButton>
			</div>
		</div>
	);
};
export default AmountConfirmation;
