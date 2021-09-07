import { noop } from "lodash";
import { ExternalLink } from "react-feather";
import Identicon from "@components/common/Identicon";
import Routes from "@lib/routes";
import formatCurrency from "@lib/format-currency";
import RiskTag from "@components/reward-calculator/RiskTag";
import { getName } from "@lib/getName";

const ValidatorCard = ({
	info,
	stashId,
	riskScore,
	commission,
	totalStake,
	networkInfo,
	nominators,
	onProfile = noop,
}) => {
	const displayName = getName(info?.display, info?.displayParent, stashId);
	return (
		<div className="flex items-center justify-between rounded-lg border border-gray-200 py-2 w-full mb-2">
			<div className="flex items-center ml-4">
				<Identicon address={stashId} size="32" />
				<div className="text-gray-700 cursor-pointer ml-2" onClick={onProfile}>
					<span className="text-xs font-semibold">{displayName}</span>
					<div className="flex items-center">
						<span className="text-xs mr-2">View Profile</span>
						<ExternalLink size="12px" />
					</div>
				</div>
			</div>
			{/* <StatusTag status="active" /> */}
			<div className="flex">
				{/* <div className="flex flex-col mx-8">
					<span className="text-xs text-gray-500 font-semibold">
						Nominators
					</span>
					<h3 className="text-xg">{nominators}</h3>
				</div> */}
				<div className="flex flex-col">
					<span className="text-xs text-gray-500 font-semibold">
						Risk Score
					</span>
					<div className="rounded-full font-semibold">
						<RiskTag risk={riskScore} />
					</div>
				</div>
				<div className="flex flex-col mx-2">
					<span className="text-xs text-gray-500 font-semibold">
						Commission
					</span>
					<h3>{commission}%</h3>
				</div>
				<div className="flex flex-col mx-2">
					<span className="text-xs text-gray-500 font-semibold">
						Total Stake
					</span>
					<h3>
						{formatCurrency.methods.formatAmount(
							Math.trunc(totalStake * Math.pow(10, networkInfo.decimalPlaces)),
							networkInfo
						)}
					</h3>
				</div>
			</div>
		</div>
	);
};

const AllNominations = ({ nominations = [], networkInfo }) => {
	const onProfile = (validator) =>
		window.open(`${Routes.VALIDATOR_PROFILE}/${validator.stashId}`, "_blank");

	return (
		<div className="py-2 flex items-center flex-wrap">
			{nominations.map((nomination) => (
				<ValidatorCard
					key={nomination.stashId}
					info={nomination?.info}
					stashId={nomination.stashId}
					riskScore={nomination.riskScore.toFixed(2)}
					commission={nomination.commission}
					nominators={nomination.numOfNominators}
					totalStake={nomination.totalStake}
					networkInfo={networkInfo}
					onProfile={() => onProfile(nomination)}
				/>
			))}
			{!nominations.length && (
				<div className="mt-5">
					<span className="text-xl font-thin text-gray-700">
						No Nominations!
					</span>
				</div>
			)}
		</div>
	);
};

export default AllNominations;
