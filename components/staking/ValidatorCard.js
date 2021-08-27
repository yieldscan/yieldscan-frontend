import Identicon from "@components/common/Identicon";
import RiskTag from "@components/reward-calculator/RiskTag";
import formatCurrency from "@lib/format-currency";

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
		</div>
	);
};
export default ValidatorCard;
