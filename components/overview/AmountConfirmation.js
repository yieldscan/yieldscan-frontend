import { ArrowRight } from "react-feather";
import { Divider, Spinner } from "@chakra-ui/core";
import formatCurrency from "@lib/format-currency";
import { useEffect, useState } from "react";
import { useCoinGeckoPriceUSD } from "@lib/store";
import getUpdateFundsTransactionFee from "@lib/getUpdateFundsTransactionFee";
import { isNil } from "lodash";
const AmountConfirmation = ({
	stashId,
	amount,
	subCurrency,
	type,
	close,
	nominations,
	handlePopoverClose,
	api,
	stakingInfo,
	networkInfo,
	onConfirm,
}) => {
	const { coinGeckoPriceUSD } = useCoinGeckoPriceUSD();
	const [transactionFee, setTransactionFee] = useState();
	const [subFeeCurrency, setSubFeeCurrency] = useState();
	const [totalAmount, setTotalAmount] = useState(0);
	const [totalAmountFiat, setTotalAmountFiat] = useState(0);
	useEffect(() => {
		if (!transactionFee) {
			getUpdateFundsTransactionFee(
				stashId,
				amount,
				type,
				stakingInfo.stakingLedger.active /
					Math.pow(10, networkInfo.decimalPlaces),
				api,
				networkInfo
			).then((data) => {
				if (type == "unbond") {
					data.partialFee !== undefined
						? setTransactionFee(data.partialFee.toNumber())
						: setTransactionFee(0);
				} else setTransactionFee(data);
			});
		}
	}, [amount, stashId, networkInfo, type]);

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
					<p className="text-gray-700 text-xs">Transaction Fee</p>

					<div className="flex flex-col">
						{!isNil(transactionFee) ? (
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
					{!isNil(transactionFee) && (
						<div className="flex flex-col">
							<p className="text-lg text-right font-bold">
								{type === "bond" || type == "rebond"
									? formatCurrency.methods.formatAmount(
											Math.trunc(amount * 10 ** networkInfo.decimalPlaces) +
												transactionFee,
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
					)}
				</div>
			</div>
			<div className="w-full flex-center">
				<button
					className="rounded-full font-medium px-12 py-3 bg-teal-500 mt-40 mb-40 text-white"
					onClick={onConfirm}
				>
					Confirm
				</button>
			</div>
		</div>
	);
};
export default AmountConfirmation;
