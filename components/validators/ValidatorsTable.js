import { Check, ExternalLink, AlertCircle } from "react-feather";
import { isNil, noop } from "lodash";
import RiskTag from "@components/reward-calculator/RiskTag";
import { useRouter } from "next/router";
import Routes from "@lib/routes";
import Identicon from "@components/common/Identicon";
import formatCurrency from "@lib/format-currency";
import { getName } from "@lib/getName";

const ValidatorCard = ({
	info,
	stashId,
	selected,
	riskScore,
	ownStake,
	otherStake,
	commission,
	nominators,
	returnsPer100KSM,
	toggleSelected = noop,
	onProfile = noop,
	networkInfo,
}) => {
	const displayName = getName(info?.display, info?.displayParent, stashId);
	return (
		<div
			className={`
			flex justify-between items-center py-3 my-1 rounded-lg cursor-pointer transition-all duration-300
			${
				selected
					? "border-teal-500 border-4 shadow-teal"
					: "border-2 border-gray-200 transform hover:scale-102"
			}
		`}
			onClick={toggleSelected}
		>
			<div className="ml-4 mr-2 flex items-center">
				<Check
					className={`p-1 mr-2 rounded-full text-white bg-opacity-0 ${
						selected && "bg-teal-500 bg-opacity-100"
					}`}
					strokeWidth="4px"
				/>
				<Identicon address={stashId} />
				<div
					className="ml-2 text-gray-900 truncate"
					onClick={(ev) => {
						ev.stopPropagation();
						onProfile();
					}}
				>
					<span className="font-semibold text-sm">{displayName}</span>
					<div className="flex items-center">
						<span className="text-xs mr-2">View Profile</span>
						<ExternalLink size="12px" />
					</div>
				</div>
			</div>
			<div className="ml-2 mr-4 flex items-center justify-between min-w-40-rem">
				<div className="flex flex-col w-20">
					<span className="text-xs text-gray-500 font-semibold">
						Nominators
					</span>
					<h3 className="text-base">
						{formatCurrency.methods.formatNumber(nominators)}
					</h3>
				</div>
				<div className="flex flex-col w-20">
					<span className="text-xs text-gray-500 font-semibold">
						Risk Score
					</span>
					<div className="rounded-full font-semibold">
						<RiskTag risk={riskScore} />
					</div>
				</div>
				<div className="flex flex-col w-32">
					<span className="text-xs text-gray-500 font-semibold">Own Stake</span>
					<h3 className="text-base">
						{!isNaN(ownStake) &&
							formatCurrency.methods.formatAmount(
								Math.trunc((ownStake || 0) * 10 ** networkInfo.decimalPlaces),
								networkInfo
							)}
					</h3>
				</div>
				<div className="flex flex-col w-32">
					<span className="text-xs text-gray-500 font-semibold">
						Other Stake
					</span>
					<h3 className="text-base">
						{!isNaN(otherStake) &&
							formatCurrency.methods.formatAmount(
								Math.trunc((otherStake || 0) * 10 ** networkInfo.decimalPlaces),
								networkInfo
							)}
					</h3>
				</div>
				<div className="flex flex-col w-20">
					<span className="text-xs text-gray-500 font-semibold">
						Commission
					</span>
					<h3 className="text-base">{commission}%</h3>
				</div>
				<div className="flex flex-col w-32">
					<span className="text-xs text-gray-500 font-semibold">
						Estimated Returns <sup>*</sup>
					</span>
					<h3 className="text-base">
						{formatCurrency.methods.formatAmount(
							Math.trunc(
								(returnsPer100KSM || 0) * 10 ** networkInfo.decimalPlaces
							),
							networkInfo
						)}
					</h3>
				</div>
			</div>
		</div>
	);
};

const ValidatorsTable = ({
	validators,
	selectedValidatorsMap,
	setSelectedValidators,
	networkInfo,
}) => {
	const router = useRouter();
	const selectedValidatorsList = Object.values(selectedValidatorsMap).filter(
		(v) => !isNil(v)
	);

	const toggleSelected = (validator) => {
		const { stashId } = validator;

		if (selectedValidatorsList.length === 16 && !selectedValidatorsMap[stashId])
			return;

		setSelectedValidators({
			...selectedValidatorsMap,
			[stashId]: isNil(selectedValidatorsMap[stashId]) ? validator : null,
		});
	};

	return (
		<div>
			<div className="mt-5 mb-2 table-container px-3 pb-16 overflow-y-scroll">
				{isNil(validators) ? (
					<div className="w-full flex-center h-full justify-center items-center text-gray-700">
						<div className="flex flex-row bg-gray-200 rounded-lg p-4 space-x-3">
							<div>
								<AlertCircle />
							</div>
							<p className=" text-sm font-light">
								There was an error fetching validator data. Please refresh the
								page.
							</p>
						</div>
					</div>
				) : !validators.length ? (
					<div className="w-full flex-center h-full justify-center items-center text-gray-700">
						<div className="flex flex-row bg-gray-200 rounded-lg p-4 space-x-3">
							<div>
								<AlertCircle />
							</div>
							<p className=" text-sm font-light">
								No validators found. Try updating your filters.
							</p>
						</div>
					</div>
				) : (
					validators.map((validator) => (
						<ValidatorCard
							key={validator.stashId}
							info={validator?.info}
							stashId={validator.stashId}
							riskScore={Number((validator.riskScore || 0).toFixed(2))}
							ownStake={validator.ownStake ? Number(validator.ownStake) : "-"}
							otherStake={
								validator.othersStake ? Number(validator.othersStake) : "-"
							}
							commission={validator.commission}
							nominators={validator.numOfNominators}
							returnsPer100KSM={validator.rewardsPer100KSM}
							selected={!isNil(selectedValidatorsMap[validator.stashId])}
							toggleSelected={() => toggleSelected(validator)}
							onProfile={() =>
								window.open(
									`${Routes.VALIDATOR_PROFILE}/${validator.stashId}`,
									"_blank"
								)
							}
							networkInfo={networkInfo}
						/>
					))
				)}
			</div>
			<style jsx>{`
				@media screen and (max-height: 712px) {
					.table-container {
						height: 44vh;
					}
				}
				@media screen and (min-height: 713px) {
					.table-container {
						height: 56vh;
					}
				}
			`}</style>
		</div>
	);
};

export default ValidatorsTable;
