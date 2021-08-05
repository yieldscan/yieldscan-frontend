import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "@lib/axios";
import RiskSelect from "./RiskSelect";
import AmountInput from "./AmountInput";
import TimePeriodInput from "./TimePeriodInput";
import ExpectedReturnsCard from "./ExpectedReturnsCard";
import EstimatedFeesCard from "./EstimatedFeesCard";
import CompoundRewardSlider from "./CompoundRewardSlider";
import SimulationSwitch from "./SimulationSwitch";
import LowBalanceAlert from "./LowBalanceAlert";
import { useWalletConnect } from "@components/wallet-connect";
import {
	useAccounts,
	useTransaction,
	useHeaderLoading,
	useSelectedNetwork,
	useNetworkElection,
	useTransactionHash,
	useValidatorData,
	useCoinGeckoPriceUSD,
	useSelectedAccount,
	useAccountsBalances,
	useAccountsStakingInfo,
	usePolkadotApi,
	useIsNewSetup,
	useSelectedAccountInfo,
	useStakingPath,
} from "@lib/store";
import { get, isNil, mapValues, keyBy, cloneDeep, debounce } from "lodash";
import calculateReward from "@lib/calculate-reward";
import getTransactionFee from "@lib/getTransactionFee";
import {
	Alert,
	AlertDescription,
	AlertIcon,
	AlertTitle,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	Popover,
	PopoverArrow,
	PopoverBody,
	PopoverContent,
	PopoverTrigger,
	Spinner,
	useDisclosure,
} from "@chakra-ui/core";
import Routes from "@lib/routes";
import { trackEvent, Events, track, goalCodes} from "@lib/analytics";
import { getNetworkInfo } from "yieldscan.config";
import { HelpCircle, AlertCircle, AlertTriangle } from "react-feather";
import MinStakeAlert from "./MinStakeAlert";
import { BottomNextButton } from "@components/common/BottomButton";
import {
	LowBalancePopover,
	useLowBalancePopover,
} from "../staking/LowBalancePopover";
import {
	StakingPathPopover,
	useStakingPathPopover,
} from "@components/staking/StakingPathPopover";

const trackRewardCalculatedEvent = debounce((eventData) => {
	track(goalCodes.REWARD_CALCULATOR.VALUE_CHANGED)
	trackEvent(Events.REWARD_CALCULATED, eventData);
}, 1000);

const RewardCalculatorPage = () => {
	const router = useRouter();
	const { selectedNetwork } = useSelectedNetwork();
	const networkInfo = getNetworkInfo(selectedNetwork);
	const { transactionHash, setTransactionHash } = useTransactionHash();
	const { coinGeckoPriceUSD } = useCoinGeckoPriceUSD();
	const { toggle } = useWalletConnect();
	const {
		isOpen: isRiskGlossaryOpen,
		onClose: onRiskGlossaryClose,
		onOpen: onRiskGlossaryOpen,
	} = useDisclosure();
	const {
		isOpen: isUnbondingGlossaryOpen,
		onClose: onUnbondingGlossaryClose,
		onOpen: onUnbondingGlossaryOpen,
	} = useDisclosure();
	const setTransactionState = useTransaction(
		(state) => state.setTransactionState
	);
	const transactionState = useTransaction();
	const { accounts } = useAccounts();
	const { selectedAccount } = useSelectedAccount();
	const { apiInstance } = usePolkadotApi();
	const { setHeaderLoading } = useHeaderLoading();
	const { isInElection } = useNetworkElection();
	const { setIsNewSetup } = useIsNewSetup();

	const { accountsStakingInfo } = useAccountsStakingInfo();
	const { accountsBalances } = useAccountsBalances();

	const { isLowBalanceOpen, toggleIsLowBalanceOpen } = useLowBalancePopover();
	const { isStakingPathPopoverOpen, toggleIsStakingPathPopoverOpen } =
		useStakingPathPopover();
	const { setStakingPath } = useStakingPath();
	const [loading, setLoading] = useState(false);
	const [amount, setAmount] = useState(transactionState.stakingAmount || 1000);
	const [subCurrency, setSubCurrency] = useState(0);

	const [risk, setRisk] = useState(transactionState.riskPreference || "Medium");
	const [timePeriodValue, setTimePeriod] = useState(
		transactionState.timePeriodValue || 12
	);
	const [timePeriodUnit, setTimePeriodUnit] = useState(
		transactionState.timePeriodUnit || "months"
	);
	const [compounding, setCompounding] = useState(
		transactionState.compounding || true
	);
	const [selectedValidators, setSelectedValidators] = useState({});

	const { validatorRiskSets, setValidatorRiskSets } = useValidatorData();
	const [result, setResult] = useState({});

	const { balances, stakingInfo } = useSelectedAccountInfo();
	const [simulationChecked, setSimulationChecked] = useState(false);
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

	const [transactionFees, setTransactionFees] = useState(0);
	const [ysFees, setYsFees] = useState(0);

	const [controllerBalances, setControllerBalances] = useState(
		() => accountsBalances[controllerAccount?.address]
	);

	const onAdvancedSelection = () => {
		updateTransactionState(Events.INTENT_ADVANCED_SELECTION);
		router.push(`${Routes.VALIDATORS}?advanced=true`);
	};

	const updateTransactionState = (eventType = "") => {
		let _returns = get(result, "returns"),
			_yieldPercentage = get(result, "yieldPercentage");
		const selectedValidatorsList = Object.values(selectedValidators).filter(
			(v) => !isNil(v)
		);

		if (eventType) {
			trackEvent(eventType, {
				investmentAmount: `${amount} ${get(
					networkInfo,
					"denom"
				)} ($${subCurrency})`,
				riskPreference: risk,
				timePeriod: `${timePeriodValue} ${timePeriodUnit}`,
				compounding,
				returns: `${get(_returns, "currency")} ${get(
					networkInfo,
					"denom"
				)} ($${get(_returns, "subCurrency")})`,
				yieldPercentage: `${_yieldPercentage}%`,
				// selectedValidators: selectedValidatorsList,
			});
		}

		setTransactionState({
			stakingAmount: amount,
			riskPreference: risk,
			timePeriodValue,
			timePeriodUnit,
			compounding,
			returns: _returns,
			yieldPercentage: _yieldPercentage,
			selectedValidators: selectedValidatorsList,
			validatorRiskSets,
		});
	};

	// const totalBondedAmount =
	// 	parseInt(get(stakingInfo, "stakingLedger.total", 0)) /
	// 	Math.pow(10, networkInfo.decimalPlaces);

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
			? amount && !isInElection && amount > 0 && transactionFees > 0
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

	const toStaking = async () => {
		updateTransactionState(Events.INTENT_STAKING);
		setTransactionHash(null);
		setStakingPath(null);

		if (
			controllerAccount &&
			controllerBalances?.availableBalance <
				apiInstance?.consts.balances.existentialDeposit.toNumber() +
					ysFees +
					transactionFees
		) {
			toggleIsLowBalanceOpen();
		} else if (
			isNil(controllerAccount) ||
			selectedAccount?.address === controllerAccount?.address ||
			stakingInfo?.stakingLedger.active.isEmpty
		) {
			toggleIsStakingPathPopoverOpen();
		} else {
			setStakingPath("distinct");
			router.push("/staking");
		}
	};

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
		setSubCurrency(amount * coinGeckoPriceUSD);
	}, [amount, networkInfo, validatorRiskSets]);

	useEffect(() => {
		if (get(validatorRiskSets, risk)) {
			const selectedValidators = cloneDeep(validatorRiskSets[risk]);
			setSelectedValidators(selectedValidators);
		}
	}, [risk]);

	useEffect(() => {
		if (!validatorRiskSets) {
			setLoading(true);
			setHeaderLoading(true);
			axios
				.get(`/${networkInfo.network}/rewards/risk-set-only`)
				.then(({ data }) => {
					/**
					 * `mapValues(keyBy(array), 'value-key')`:
					 * 	O(N + N) operation, using since each risk set will have maximum 16 validators
					 */
					const validatorMap = {
						Low: mapValues(keyBy(data.lowriskset, "stashId")),
						Medium: mapValues(keyBy(data.medriskset, "stashId")),
						High: mapValues(keyBy(data.highriskset, "stashId")),
						total: data.totalset,
					};

					setValidatorRiskSets(validatorMap);
					setSelectedValidators(validatorMap["Medium"]);
					setLoading(false);
					setHeaderLoading(false);
				});
		} else {
			console.info("Using previous validator map.");
		}
	}, [networkInfo, validatorRiskSets]);

	useEffect(() => {
		if (risk && timePeriodValue) {
			const selectedValidatorsList = Object.values(selectedValidators).filter(
				(v) => !isNil(v)
			);
			calculateReward(
				coinGeckoPriceUSD,
				selectedValidatorsList,
				amount || 0,
				timePeriodValue,
				timePeriodUnit,
				compounding,
				networkInfo
			)
				.then((result) => {
					setResult(result);
				})
				.catch((error) => {
					// TODO: handle error gracefully with UI toast
					console.error(error);
				});
		}
	}, [
		amount,
		timePeriodValue,
		timePeriodUnit,
		compounding,
		selectedValidators,
	]);

	useEffect(() => {
		setSimulationChecked(false);
	}, [selectedAccount?.address]);

	useEffect(() => {
		if (networkInfo.feesEnabled) {
			setYsFees(() =>
				Math.trunc(
					amount *
						Math.pow(10, networkInfo.decimalPlaces) *
						networkInfo.feesRatio
				)
			);
		} else setYsFees(0);
	}, [amount, networkInfo]);

	useEffect(async () => {
		setTransactionFees(0);
		if (amount && selectedValidators && selectedAccount && apiInstance) {
			const networkFees = await getTransactionFee(
				networkInfo,
				stakingInfo,
				amount,
				selectedAccount,
				Object.values(selectedValidators),
				controllerAccount,
				apiInstance
			);

			setTransactionFees(networkFees);
		}
	}, [stakingInfo, amount, selectedAccount, apiInstance]);

	return loading || isNil(apiInstance) ? (
		<div className="flex-center w-full h-full">
			<div className="flex-center flex-col">
				<Spinner size="xl" color="teal.500" thickness="4px" />
				<span className="text-sm text-gray-600 mt-5">
					Instantiating API and fetching data...
				</span>
			</div>
		</div>
	) : (
		<div className="flex pt-12 px-10">
			<GlossaryModal
				isOpen={isRiskGlossaryOpen}
				onClose={onRiskGlossaryClose}
				header="Risk Score"
				content={
					<p className="text-gray-700 text-sm px-8">
						Risk score is calculated based on 6 on-chain variables (
						<span className="italic">
							own stake, other stake, no. of backers, no. of slashes and no. of
							eras validated
						</span>
						), where no. of slashes carry the highest weight.{" "}
						<a
							className="underline"
							href="https://github.com/buidl-labs/yieldscan-frontend/wiki/Risk-score-logic"
							target="_blank"
						>
							Learn more
						</a>
					</p>
				}
			/>
			<GlossaryModal
				isOpen={isUnbondingGlossaryOpen}
				onClose={onUnbondingGlossaryClose}
				header="Unbonding Period"
				content={
					<p className="text-gray-700 text-sm px-8">
						After staking, your investment amount is "frozen" as collateral for
						earning rewards. Whenever you decide to withdraw these funds, you
						would first need to wait for them to "unbond". This waiting duration
						is called the unbonding period and it can vary from network to
						network.
					</p>
				}
			/>
			<div>
				<div className="flex flex-wrap">
					{controllerAccount && controllerBalances && isLowBalanceOpen && (
						<LowBalancePopover
							isOpen={isLowBalanceOpen}
							toStaking={toStaking}
							networkInfo={networkInfo}
							setStakingPath={setStakingPath}
							transferAmount={
								controllerBalances
									? ysFees +
									  apiInstance?.consts.balances.existentialDeposit.toNumber() *
											2 -
									  controllerBalances?.availableBalance
									: 0
							}
							controllerAccount={controllerAccount}
						/>
					)}
					{selectedAccount && (
						<StakingPathPopover
							isOpen={isStakingPathPopoverOpen}
							toStaking={toStaking}
							networkInfo={networkInfo}
							setStakingPath={setStakingPath}
						/>
					)}
					{activeBondedAmount > 0 && (
						<div
							className={`w-full flex flex-row mb-4 rounded items-center ${
								simulationChecked ? "justify-between" : "justify-end"
							}`}
						>
							{simulationChecked && (
								<div>
									<SimulationAlert />
								</div>
							)}
							<div className=" flex items-center justify-center">
								<SimulationSwitch
									simulationChecked={simulationChecked}
									setSimulationChecked={setSimulationChecked}
								/>
							</div>
						</div>
					)}
					<div className="w-1/2 space-y-8">
						{/* <h1 className="font-semibold text-xl text-gray-700">
							Calculate Returns
						</h1> */}
						<div className="mx-2">
							<h3 className="text-gray-700 text-xs">
								{activeBondedAmount > 0
									? "Staking Amount:"
									: "I want to invest:"}
							</h3>
							<div className="mt-2">
								{selectedAccount &&
									balances &&
									stakingInfo &&
									(amount >
										totalPossibleStakingAmount - networkInfo.minAmount ||
										totalAvailableStakingAmount < networkInfo.minAmount) && (
										<LowBalanceAlert
											amount={amount}
											activeBondedAmount={activeBondedAmount}
											networkInfo={networkInfo}
											totalPossibleStakingAmount={totalPossibleStakingAmount}
											totalAvailableStakingAmount={totalAvailableStakingAmount}
										/>
									)}
								<AmountInput
									value={{ currency: amount, subCurrency: subCurrency }}
									networkInfo={networkInfo}
									onChange={setAmount}
									trackRewardCalculatedEvent={trackRewardCalculatedEvent}
									balances={balances}
									simulationChecked={simulationChecked}
									stakingInfo={stakingInfo}
								/>
							</div>
							<div className="flex mt-8 items-center">
								<h3 className="text-gray-700 text-xs">With a risk level:</h3>
								<HelpPopover
									content={
										<p className="text-white text-xs">
											Risk levels are an abstraction over the risk scores we
											assign to validators. If you're unsure, choose "Medium".{" "}
											<span
												onClick={onRiskGlossaryOpen}
												className="underline cursor-pointer"
											>
												How are risk scores calculated?
											</span>
										</p>
									}
								/>
							</div>
							<div className="mt-2">
								<RiskSelect
									selected={risk}
									setSelected={setRisk}
									trackRewardCalculatedEvent={trackRewardCalculatedEvent}
								/>
							</div>

							<h3 className="text-gray-700 mt-8 text-xs">
								For the time period:
							</h3>
							<Alert
								status="warning"
								color="#FDB808"
								backgroundColor="#FFF4DA"
								borderRadius="8px"
								mr={12}
								mt={2}
								mb={4}
							>
								<AlertDescription color="#FDB808" fontSize="xs">
									Time period is only used for estimating returns. It doesn’t
									affect the{" "}
									<span
										className="underline cursor-pointer"
										onClick={onUnbondingGlossaryOpen}
									>
										unbonding period
									</span>{" "}
									of approximately {networkInfo.lockUpPeriod} days.
								</AlertDescription>
							</Alert>
							<div className="mt-2">
								<TimePeriodInput
									value={timePeriodValue}
									unit={timePeriodUnit}
									onChange={setTimePeriod}
									onUnitChange={setTimePeriodUnit}
									trackRewardCalculatedEvent={trackRewardCalculatedEvent}
								/>
							</div>
							<div className="flex mt-8 items-center">
								<h3 className="text-gray-700 text-xs">
									Lock rewards for compounding?
								</h3>
								<HelpPopover
									content={
										<p className="text-white text-xs">
											If you choose not to lock your rewards, then your newly
											minted rewards will be transferrable by default. However,
											this would mean lower earnings over longer period of time.
											Please note that locking of your capital investment is
											independent of this. See{" "}
											<span
												onClick={onUnbondingGlossaryOpen}
												className="underline cursor-pointer"
											>
												unbonding period
											</span>{" "}
											for more info.
										</p>
									}
								/>
							</div>
							{/* <span className="text-sm text-gray-500">
								Your rewards will be locked for staking over the specified time
								period
							</span> */}
							<div className="mt-2 my-8">
								<CompoundRewardSlider
									checked={compounding}
									setChecked={setCompounding}
									trackRewardCalculatedEvent={trackRewardCalculatedEvent}
								/>
							</div>
						</div>
					</div>
					<div className="w-1/2 space-y-6">
						<ExpectedReturnsCard result={result} networkInfo={networkInfo} />
						{selectedAccount && (
							<EstimatedFeesCard
								result={result}
								transactionFees={transactionFees}
								ysFees={ysFees}
								networkInfo={networkInfo}
							/>
						)}
					</div>
					<div className="w-full bg-white bottom-0 p-8 left-0 flex-center">
						<button
							className={`
						rounded-full font-medium px-12 py-3 bg-teal-500 text-white
						${proceedDisabled ? "opacity-75 cursor-not-allowed" : "opacity-100"}
					`}
							disabled={proceedDisabled}
							hidden={simulationChecked}
							onClick={() =>
								isNil(accounts)
									? (track(goalCodes.REWARD_CALCULATOR.INTENT_CONNECT_WALLET), 
										router.push("/setup-wallet"))
									: selectedAccount
									? (track(goalCodes.REWARD_CALCULATOR.INTENT_STAKING),
										toStaking())
									: toggle()
							}
						>
							{isNil(accounts)
								? "Connect Wallet"
								: isNil(selectedAccount)
								? "Select Account"
								: isInElection
								? "Ongoing elections, can't invest now!"
								: "Looks good, let’s stake"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default RewardCalculatorPage;

const GlossaryModal = ({
	isOpen,
	onClose,
	header,
	content,
	maxWidth = "md",
}) => {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			isCentered
			closeOnEsc={true}
			closeOnOverlayClick={true}
		>
			<ModalOverlay />
			<ModalContent rounded="1rem" maxWidth={maxWidth} pt={4} pb={12}>
				<ModalHeader>
					<h3 className="px-3 text-2xl text-center text-gray-700">{header}</h3>
				</ModalHeader>
				<ModalCloseButton
					onClick={onClose}
					boxShadow="0 0 0 0 #fff"
					color="gray.400"
					backgroundColor="gray.100"
					rounded="1rem"
					mt={4}
					mr={4}
				/>
				<ModalBody>{content}</ModalBody>
			</ModalContent>
		</Modal>
	);
};

const HelpPopover = ({
	popoverTrigger,
	content,
	placement = "right",
	iconSize = "12px",
	zIndex = 50,
}) => {
	return (
		<Popover trigger="hover" placement={placement} usePortal>
			<PopoverTrigger>
				{popoverTrigger ? (
					popoverTrigger
				) : (
					<HelpCircle
						size={iconSize}
						className="text-gray-700 ml-2 cursor-help"
					/>
				)}
			</PopoverTrigger>
			<PopoverContent
				rounded="lg"
				zIndex={zIndex}
				_focus={{ outline: "none" }}
				bg="gray.600"
				border="none"
			>
				<PopoverArrow />
				<PopoverBody>{content}</PopoverBody>
			</PopoverContent>
		</Popover>
	);
};

const SetupAccountsAlert = () => {
	const router = useRouter();
	const { setIsNewSetup } = useIsNewSetup();
	return (
		<div className="flex flex-row justify-between items-center bg-gray-200 text-xs text-gray-700 p-2 px-4 rounded-lg">
			<div className="flex flex-row space-x-2">
				<AlertCircle size={18} />
				<p>
					<span className="font-semibold">Setup required:</span> We found some
					new accounts in your wallet. You need to setup your accounts before
					you can use them to stake.
				</p>
			</div>
			<BottomNextButton
				onClick={() => {
					setIsNewSetup(true);
					router.push("/setup-accounts");
				}}
			>
				Setup accounts
			</BottomNextButton>
		</div>
	);
};

const SimulationAlert = () => (
	<div className="flex flex-row justify-between items-center bg-gray-200 text-xs text-gray-700 p-4 rounded-lg">
		<div className="flex flex-row space-x-2">
			<AlertTriangle size={18} />
			<p>
				<span className="font-semibold">Simulation mode:</span> You can use this
				calculator ONLY to simulate your expected earnings. To stake, turn off
				simulation.
			</p>
		</div>
	</div>
);

export { GlossaryModal, HelpPopover };
