import { HelpCircle, ChevronDown, Minus } from "react-feather";
import { Collapse, Skeleton } from "@chakra-ui/core";
import { useCoinGeckoPriceUSD } from "@lib/store";
import { useState } from "react";
import { track, goalCodes } from "@lib/analytics";
import formatCurrency from "@lib/format-currency";
import { HelpPopover } from "@components/reward-calculator";

const EstimatedFeesCard = ({
	result,
	networkInfo,
	transactionFees,
	ysFees,
	hasSubscription,
	isExistingUser,
	currentDate,
	lastDiscountDate,
}) => {
	// const { coinGeckoPriceUSD } = useCoinGeckoPriceUSD();
	// const returns = {
	// 	currency: get(result, "returns.currency"),
	// };

	// const portfolio = {
	// 	currency: get(result, "portfolioValue.currency"),
	// };

	const [showFeesBreakUp, setShowFeesBreakUp] = useState(false);

	const handleShowFeesToggle = () => {
		if (!showFeesBreakUp)
			track(goalCodes.REWARD_CALCULATOR.CHECKED_FEE_BREAKUP);
		setShowFeesBreakUp((state) => !state);
	};

	return (
		<>
			<div className="rounded-xl bg-gray-200 text-gray-600 text-md p-8 space-y-2">
				<div className="flex flex-row justify-between items-center">
					<button
						onClick={handleShowFeesToggle}
						className="flex flex-row justify-center items-center"
					>
						Estimated Fees
						<ChevronDown
							size={16}
							className={`transition ease-in-out duration-500 ml-2 mb-1 ${
								showFeesBreakUp && "transform rotate-180"
							}`}
						/>
					</button>
					{transactionFees > 0 && (ysFees > 0 || hasSubscription) ? (
						<p>
							{formatCurrency.methods.formatAmount(
								ysFees + transactionFees,
								networkInfo
							)}
						</p>
					) : (
						<Skeleton>
							<p>Loading ...</p>
						</Skeleton>
					)}
				</div>
				<Collapse isOpen={showFeesBreakUp}>
					<div className="flex flex-row text-gray-600 text-sm justify-between items-center">
						<div className="flex flex-row items-center space-x-2">
							<Minus size={18} className="mb-1" />
							<p>{networkInfo.name} Network</p>
						</div>
						{transactionFees > 0 ? (
							<p>
								{formatCurrency.methods.formatAmount(
									transactionFees,
									networkInfo
								)}
							</p>
						) : (
							<Skeleton>
								<p>Loading ...</p>
							</Skeleton>
						)}
					</div>
					{networkInfo.feesEnabled && hasSubscription === false && (
						<div className="flex flex-row text-gray-600 text-sm justify-between items-center">
							<div className="flex flex-row justify-between items-center">
								<div className="flex flex-row items-center space-x-2">
									<Minus size={18} className="mb-1" />
									<p>
										{" "}
										Yieldscan Fee{" "}
										{isExistingUser &&
											currentDate <= lastDiscountDate &&
											"(50% off)"}
									</p>
								</div>
								{isExistingUser && currentDate <= lastDiscountDate && (
									<HelpPopover
										content={
											<p className="text-xs text-white">
												You have been given a 50% discount because you staked
												with Yieldscan on or before 15th September 2021.{" "}
											</p>
										}
									/>
								)}
							</div>

							{ysFees > 0 ? (
								<p>
									{formatCurrency.methods.formatAmount(ysFees, networkInfo)}
								</p>
							) : (
								<Skeleton>
									<p>Loading ...</p>
								</Skeleton>
							)}
						</div>
					)}
				</Collapse>
			</div>
		</>
	);
};

export default EstimatedFeesCard;
