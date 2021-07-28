import {
	Filter,
	ChevronDown,
	ChevronUp,
	ChevronLeft,
	ArrowUp,
	ArrowDown,
} from "react-feather";
import { useState, useEffect } from "react";
import {
	useDisclosure,
	Select,
	Spinner,
	Button,
	Checkbox,
	Switch,
} from "@chakra-ui/core";
import {
	mapValues,
	keyBy,
	isNil,
	get,
	orderBy,
	filter,
	isNull,
	cloneDeep,
	debounce,
} from "lodash";
import {
	useTransaction,
	useAccounts,
	usePaymentPopover,
	useNetworkElection,
	useSelectedNetwork,
	useTransactionHash,
	useValidatorData,
	useCoinGeckoPriceUSD,
	useSelectedAccount,
	useSelectedAccountInfo,
	useAccountsStakingInfo,
	useAccountsBalances,
	usePolkadotApi,
} from "@lib/store";
import calculateReward from "@lib/calculate-reward";
import ValidatorsResult from "./ValidatorsResult";
import ValidatorsTable from "./ValidatorsTable";
import EditAmountModal from "./EditAmountModal";
import FilterPanel from "./FilterPanel";
import { useWalletConnect } from "@components/wallet-connect";
import {
	LowBalancePopover,
	useLowBalancePopover,
} from "../staking/LowBalancePopover";
import { useRouter } from "next/router";
import axios from "@lib/axios";
import { getNetworkInfo } from "yieldscan.config";
import { trackEvent, Events } from "@lib/analytics";
import {
	StakingPathPopover,
	useStakingPathPopover,
} from "@components/staking/StakingPathPopover";

const DEFAULT_FILTER_OPTIONS = {
	numOfNominators: { min: "", max: "" },
	riskScore: "",
	ownStake: { min: "", max: "" },
	totalStake: { min: "", max: "" },
	commission: "",
};

const Validators = () => {
	const router = useRouter();
	const { selectedNetwork } = useSelectedNetwork();
	const networkInfo = getNetworkInfo(selectedNetwork);
	const { accounts } = useAccounts();
	const { toggle } = useWalletConnect();
	const { selectedAccount } = useSelectedAccount();
	const { accountsStakingInfo } = useAccountsStakingInfo();
	const { accountsBalances } = useAccountsBalances();
	const { balances, stakingInfo } = useSelectedAccountInfo();
	const { coinGeckoPriceUSD } = useCoinGeckoPriceUSD();
	const { validatorMap, setValidatorMap } = useValidatorData();
	const { isLowBalanceOpen, toggleIsLowBalanceOpen } = useLowBalancePopover();
	const { transactionHash, setTransactionHash } = useTransactionHash();
	const { isOpen, onClose, onToggle } = useDisclosure();
	const { apiInstance } = usePolkadotApi();
	const [errorFetching, setErrorFetching] = useState(false);
	const { isStakingPathPopoverOpen, toggleIsStakingPathPopoverOpen } =
		useStakingPathPopover();

	const transactionState = useTransaction((state) => {
		let _returns = get(result, "returns"),
			_yieldPercentage = get(result, "yieldPercentage");
		return {
			...state,
			stakingAmount: 1000,
			timePeriodValue: "12",
			timePeriodUnit: "months",
			compounding: true,
			returns: _returns,
			yieldPercentage: _yieldPercentage,
		};
	});
	const { setTransactionState } = transactionState;
	const { isInElection } = useNetworkElection();

	const [loading, setLoading] = useState(true);
	const [validators, setValidators] = useState(
		get(validatorMap, "total", undefined)
	);
	const [filteredValidators, setFilteredValidators] = useState(
		get(validatorMap, "total", undefined)
	);
	const [advancedMode] = useState(router.query.advanced);
	const [amount, setAmount] = useState(transactionState.stakingAmount || 1000);

	const [subCurrency, setSubCurrency] = useState(0);
	const [timePeriodValue, setTimePeriod] = useState(
		transactionState.timePeriodValue
	);
	const [timePeriodUnit, setTimePeriodUnit] = useState(
		transactionState.timePeriodUnit || "months"
	);
	const [compounding, setCompounding] = useState(
		transactionState.compounding || false
	);
	const [selectedValidatorsMap, setSelectedValidatorsMap] = useState(
		mapValues(keyBy(transactionState.selectedValidators, "stashId"))
	);

	const [showSelected, setShowSelected] = useState(false);
	const [filterPanelOpen, setFilterPanelOpen] = useState(false);
	const [filterOptions, setFilterOptions] = useState(
		cloneDeep(DEFAULT_FILTER_OPTIONS)
	);
	const [sortOrder, setSortOrder] = useState("asc");
	const [sortKey, setSortKey] = useState("rewardsPer100KSM");
	const [result, setResult] = useState({});

	const [controllerAccount, setControllerAccount] = useState(() =>
		accountsStakingInfo[selectedAccount?.address]?.controllerId
			? accounts?.filter(
					(account) =>
						account.address ===
						accountsStakingInfo[
							selectedAccount?.address
						]?.controllerId.toString()
			  )[0]
			: null
	);

	useEffect(() => {
		if (stakingInfo?.accountId.toString() !== selectedAccount?.address) {
			setControllerAccount(null);
		}
		const account = accountsStakingInfo[selectedAccount?.address]?.controllerId
			? accounts?.filter(
					(account) =>
						account.address ===
						accountsStakingInfo[
							selectedAccount?.address
						]?.controllerId.toString()
			  )[0]
			: null;
		setControllerAccount(account);
	}, [
		selectedAccount?.address,
		JSON.stringify(stakingInfo),
		JSON.stringify(accountsStakingInfo),
	]);

	const [controllerBalances, setControllerBalances] = useState(
		() => accountsBalances[controllerAccount?.address]
	);

	useEffect(() => {
		if (stakingInfo?.accountId.toString() !== selectedAccount?.address) {
			setControllerBalances(null);
		}
		setControllerBalances(accountsBalances[controllerAccount?.address]);
	}, [
		controllerAccount?.address,
		selectedAccount?.address,
		JSON.stringify(stakingInfo),
		JSON.stringify(accountsBalances[controllerAccount?.address]),
	]);

	useEffect(() => {
		if (!validatorMap) {
			axios
				.get(`/${networkInfo.network}/rewards/risk-set`)
				.then(({ data }) => {
					const validatorMap = {
						Low: mapValues(keyBy(data.lowriskset, "stashId")),
						Medium: mapValues(keyBy(data.medriskset, "stashId")),
						High: mapValues(keyBy(data.highriskset, "stashId")),
						total: data.totalset,
					};

					setValidatorMap(validatorMap);
				})
				.catch(() => {
					setErrorFetching(true);
					setLoading(false);
				});
		}
	}, [validatorMap, networkInfo]);

	useEffect(() => {
		if (validatorMap) {
			setLoading(true);
			setValidators(validatorMap.total);
			setFilteredValidators(validatorMap.total);
			setSelectedValidatorsMap(validatorMap.Medium);
			setLoading(false);
		} else {
			setLoading(true);
		}
	}, [validatorMap, networkInfo]);

	useEffect(() => {
		setSubCurrency(amount * coinGeckoPriceUSD);
	}, [amount]);

	useEffect(() => {
		const sorted = orderBy(filteredValidators, [sortKey], [sortOrder]);
		setFilteredValidators(sorted);
	}, [sortKey, sortOrder]);

	useEffect(() => {
		const selectedValidatorsList = Object.values(selectedValidatorsMap).filter(
			(v) => !isNil(v)
		);

		if (!filterPanelOpen && !showSelected)
			return setFilteredValidators(validators);
		if (!filterPanelOpen && showSelected)
			return setFilteredValidators(selectedValidatorsList);

		const riskGroup = get(filterOptions, "riskScore");
		const commission = get(filterOptions, "commission");
		const numOfNominators = get(filterOptions, "numOfNominators", {
			min: "",
			max: "",
		});
		const ownStake = get(filterOptions, "ownStake", { min: "", max: "" });
		const totalStake = get(filterOptions, "totalStake", { min: "", max: "" });

		const isEmpty = (...values) => values.every((v) => v === "");

		if (
			isEmpty(
				riskGroup,
				commission,
				numOfNominators.min,
				numOfNominators.max,
				ownStake.min,
				ownStake.max,
				totalStake.min,
				totalStake.max
			)
		)
			return setFilteredValidators(validators);

		const validatorList = showSelected ? selectedValidatorsList : validators;

		const filtered = validatorList.filter((validator) => {
			if (riskGroup === "Low" && validator.riskScore > 0.32) return false;
			if (riskGroup === "Medium" && validator.riskScore > 0.66) return false;

			if (!isEmpty(commission) && validator.commission > commission)
				return false;

			if (
				!isEmpty(numOfNominators.min) &&
				validator.numOfNominators < numOfNominators.min
			)
				return false;
			if (
				!isEmpty(numOfNominators.max) &&
				validator.numOfNominators > numOfNominators.max
			)
				return false;

			if (!isEmpty(ownStake.min) && validator.ownStake < ownStake.min)
				return false;
			if (!isEmpty(ownStake.max) && validator.ownStake > ownStake.max)
				return false;

			if (!isEmpty(totalStake.min) && validator.totalStake < totalStake.min)
				return false;
			if (!isEmpty(totalStake.max) && validator.totalStake > totalStake.max)
				return false;

			return true;
		});

		const filteredAndsorted = orderBy(filtered, [sortKey], [sortOrder]);

		setFilteredValidators(filteredAndsorted);
	}, [filterPanelOpen, filterOptions, showSelected]);

	useEffect(() => {
		if (amount && timePeriodValue && timePeriodUnit) {
			const selectedValidatorsList = Object.values(
				selectedValidatorsMap
			).filter((v) => !isNil(v));
			calculateReward(
				coinGeckoPriceUSD,
				selectedValidatorsList,
				amount || 0,
				timePeriodValue,
				timePeriodUnit,
				compounding,
				networkInfo
			)
				.then(setResult)
				.catch((error) => {
					// TODO: handle error gracefully with UI toast
					console.error(error);
				});
		}
	}, [
		amount,
		timePeriodValue,
		timePeriodUnit,
		selectedValidatorsMap,
		compounding,
	]);

	const updateTransactionState = (eventType = "") => {
		let _returns = get(result, "returns"),
			_yieldPercentage = get(result, "yieldPercentage");
		const selectedValidatorsList = Object.values(selectedValidatorsMap).filter(
			(v) => !isNil(v)
		);

		if (eventType) {
			trackEvent(eventType, {
				investmentAmount: `${amount} ${get(
					networkInfo,
					"denom"
				)} ($${subCurrency})`,
				timePeriod: `${timePeriodValue} ${timePeriodUnit}`,
				compounding,
				returns: `${get(_returns, "currency")} ${get(
					networkInfo,
					"denom"
				)} ($${get(_returns, "subCurrency")})`,
				yieldPercentage: `${_yieldPercentage}%`,
				// selectedValidators: selectedValidatorsList,
				// validatorMap
			});
		}

		setTransactionState({
			stakingAmount: amount,
			riskPreference: transactionState.riskPreference,
			timePeriodValue,
			timePeriodUnit,
			compounding: transactionState.compounding,
			returns: _returns,
			yieldPercentage: _yieldPercentage,
			selectedValidators: selectedValidatorsList,
			validatorMap,
		});
	};

	const toStaking = async () => {
		updateTransactionState(Events.INTENT_STAKING);
		setTransactionHash(null);
		if (
			controllerAccount &&
			parseInt(controllerBalances?.availableBalance) <
				apiInstance?.consts.balances.existentialDeposit.toNumber() / 2
		) {
			toggleIsLowBalanceOpen();
		} else toggleIsLowBalanceOpen();
		//toggleIsStakingPathPopoverOpen();
		//router.push("/staking");
	};

	const onPayment = async () => {
		updateTransactionState(Events.INTENT_STAKING);
		if (transactionHash) setTransactionHash(null);
		router.push("/payment", "/payment", { shallow: true });
	};

	const trackRewardCalculatedEvent = debounce((eventData) => {
		trackEvent(Events.REWARD_CALCULATED, eventData);
	}, 1000);

	const activeBondedAmount =
		parseInt(get(stakingInfo, "stakingLedger.active", 0)) /
		Math.pow(10, networkInfo.decimalPlaces);

	const totalAvailableStakingAmount =
		parseInt(get(balances, "availableBalance", 0)) /
		Math.pow(10, networkInfo.decimalPlaces);

	const totalPossibleStakingAmount =
		activeBondedAmount + totalAvailableStakingAmount;

	const proceedDisabled =
		accounts && selectedAccount
			? amount && !isInElection && amount > 0
				? amount > totalPossibleStakingAmount
					? true
					: activeBondedAmount >
					  totalPossibleStakingAmount - networkInfo.minAmount
					? totalAvailableStakingAmount < networkInfo.minAmount / 2
						? true
						: false
					: amount > totalPossibleStakingAmount - networkInfo.minAmount
					? true
					: false
				: true
			: false;

	useEffect(() => {
		if (stakingInfo?.stakingLedger.active) {
			setAmount(
				parseInt(stakingInfo?.stakingLedger.active) /
					Math.pow(10, networkInfo.decimalPlaces)
			);
		}
	}, [stakingInfo]);

	return loading ? (
		<div className="flex-center w-full h-full">
			<div className="flex-center flex-col">
				<Spinner size="xl" color="teal.500" thickness="4px" />
				<span className="text-sm text-gray-600 mt-5">
					Fetching validators...
				</span>
			</div>
		</div>
	) : errorFetching ? (
		<div className="flex-center w-full h-full">
			<div className="flex-center flex-col">
				<span className="text-sm text-gray-600 mt-5">
					Unable to fetch validators data, try refreshing the page.
				</span>
			</div>
		</div>
	) : (
		<div className="relative h-full px-10 py-5">
			{advancedMode && (
				<div className="mb-4">
					<button
						className="flex items-center bg-gray-200 text-gray-600 rounded-lg px-2 py-1"
						onClick={router.back}
					>
						<ChevronLeft className="mr-2 text-gray-600" />
						Reward Calculator
					</button>
				</div>
			)}
			{controllerAccount && controllerBalances && (
				<LowBalancePopover
					isOpen={isLowBalanceOpen}
					toStaking={toStaking}
					networkInfo={networkInfo}
				/>
			)}
			{controllerAccount && controllerBalances && (
					<StakingPathPopover
						isOpen={true}
						// isOpen={isStakingPathPopoverOpen}
						toStaking={toStaking}
						networkInfo={networkInfo}
					/>
			)}
			<EditAmountModal
				isOpen={isOpen}
				onClose={onClose}
				amount={amount}
				setAmount={setAmount}
				stakingInfo={stakingInfo}
				balances={balances}
				accounts={accounts}
				proceedDisabled={proceedDisabled}
				controllerAccount={controllerAccount}
				selectedAccount={selectedAccount}
				networkInfo={networkInfo}
				trackRewardCalculatedEvent={trackRewardCalculatedEvent}
			/>
			<ValidatorsResult
				stakingAmount={amount}
				advancedMode={advancedMode}
				compounding={compounding}
				timePeriodValue={timePeriodValue}
				timePeriodUnit={timePeriodUnit}
				onCompoundingChange={setCompounding}
				onTimePeriodValueChange={setTimePeriod}
				onTimePeriodUnitChange={setTimePeriodUnit}
				onEditAmount={onToggle}
				result={result}
				transactionState={transactionState}
				networkInfo={networkInfo}
			/>
			<div className="flex justify-between items-center mt-8">
				<div className="flex items-center">
					<span className="text-gray-900 mr-4">Sort by</span>
					<Select
						rounded="full"
						border="1px"
						borderColor="gray.200"
						color="gray.800"
						pl={4}
						width="14rem"
						cursor="pointer"
						value={sortKey}
						onChange={(ev) => setSortKey(ev.target.value)}
					>
						<option value="rewardsPer100KSM">Estimated Rewards</option>
						<option value="riskScore">Risk Score</option>
						<option value="commission">Commission</option>
						<option value="numOfNominators">Nominators</option>
						<option value="othersStake">Other Stake</option>
					</Select>
					<div className="flex items-center justify-between items-center ml-2">
						<button
							onClick={() => setSortOrder("asc")}
							className={`py-2 px-3 bg-white border border-gray-200 rounded-l-full transition-all duration-300 ${
								sortOrder === "asc" &&
								"bg-gray-200 text-gray-500 cursor-default"
							}`}
						>
							<ArrowUp size="20px" />
						</button>

						<button
							onClick={() => setSortOrder("desc")}
							className={`py-2 px-3 bg-white border border-l-0 rounded-r-full transition-all duration-300 ${
								sortOrder === "desc" &&
								"bg-gray-200 text-gray-500 cursor-default"
							}`}
						>
							<ArrowDown size="20px" />
						</button>
					</div>
					<div className="ml-4 flex items-center text-gray-900 border border-gray-200 rounded px-3 py-1">
						<p>Show Selected</p>
						<Switch
							color="teal"
							className="mt-1 ml-2"
							isChecked={showSelected}
							onChange={(e) => setShowSelected(e.target.checked)}
						/>
					</div>
				</div>
				<div className="flex items-center">
					<button
						className={`text-sm text-gray-600 hover:underline transition-all duration-300 ease-in-out ${
							filterPanelOpen ? "mr-2 opacity-100" : "opacity-0 ml-4"
						}`}
						onClick={() => setFilterOptions(cloneDeep(DEFAULT_FILTER_OPTIONS))}
					>
						reset filters
					</button>
					<button
						className={`
							flex items-center select-none rounded-full px-4 py-2 border border-gray-200
							${filterPanelOpen ? "bg-gray-900 text-white" : "text-gray-900"}
						`}
						onClick={() => setFilterPanelOpen(!filterPanelOpen)}
					>
						<Filter size="16" className="mr-2" />
						<span>Filter</span>
					</button>
				</div>
			</div>
			<div
				className={`transition-all duration-300 ease-in-out transform overflow-hidden ${
					filterPanelOpen ? "mt-5 h-auto opacity-100" : "h-0 opacity-0"
				}`}
				// hidden={!filterPanelOpen}
			>
				<FilterPanel
					filterOptions={filterOptions}
					setFilterOptions={setFilterOptions}
				/>
			</div>

			<ValidatorsTable
				validators={filteredValidators}
				selectedValidatorsMap={selectedValidatorsMap}
				setSelectedValidators={setSelectedValidatorsMap}
				networkInfo={networkInfo}
			/>
			<div className="fixed left-0 bottom-0 flex-end w-full bg-white">
				<div className="text-xs text-gray-500 text-right mr-24 mt-4">
					* Estimated Returns are calculated per era for 100 {networkInfo.denom}
				</div>
				<div className="flex items-center justify-end w-full p-4">
					<button
						className={`
						rounded-full mr-24 font-medium px-12 py-3 bg-teal-500 text-white
						${proceedDisabled ? "opacity-75 cursor-not-allowed" : "opacity-100"}
					`}
						disabled={proceedDisabled}
						// hidden={simulationChecked}
						onClick={() =>
							isNil(accounts)
							? router.push("/setup-wallet")
							: selectedAccount
							? toStaking()
							: toggle()
						}
					>
						{isNil(accounts)
							? "Connect Wallet"
							: isNil(selectedAccount)
							? "Select Account"
							: isInElection
							? "Ongoing elections, can't invest now!"
							: "Proceed to confirmation"}
					</button>
				</div>
			</div>
			{/* {isPaymentPopoverOpen && (
				<PaymentPopover
					isPaymentPopoverOpen={isPaymentPopoverOpen}
					selectedAccount={selectedAccount}
					stakingAmount={{ currency: amount, subCurrency: subCurrency }}
					validators={validators}
					compounding={compounding}
					selectedValidators={Object.values(selectedValidatorsMap)}
					setSelectedValidators={setSelectedValidatorsMap}
					bondedAmount={bondedAmount}
					closePaymentPopover={closePaymentPopover}
					result={result}
					networkInfo={networkInfo}
				/>
			)} */}
		</div>
	);
};

export default Validators;
