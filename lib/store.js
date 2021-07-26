import { cloneDeep, isNil } from "lodash";
import create from "zustand";
import { parseCookies } from "nookies";
import { getAllNetworks } from "yieldscan.config";

const cookies = parseCookies();
const defaultNetworkName = cookies.networkName;
const showBeta = cookies.showBeta;

const supportedNetworks = getAllNetworks();

const useSelectedNetwork = create((set) => ({
	selectedNetwork:
		defaultNetworkName !== undefined
			? supportedNetworks.includes(defaultNetworkName)
				? defaultNetworkName
				: "Polkadot"
			: "Polkadot",
	setSelectedNetwork: (selectedNetwork) => set(() => ({ selectedNetwork })),
}));

const useSelectedAccount = create((set) => ({
	selectedAccount: null,
	setSelectedAccount: (selectedAccount) => set(() => ({ selectedAccount })),
}));

const useIsNewSetup = create((set) => ({
	isNewSetup: null,
	setIsNewSetup: (isNewSetup) => set(() => ({ isNewSetup })),
}));

const useIsLowBalance = create((set) => ({
	isLowBalance: true,
	setIsLowBalance: (isLowBalance) => set(() => ({ isLowBalance })),
}));

const useSelectedAccountInfo = create((set) => ({
	balances: null,
	stakingInfo: null,
	stakingLedgerInfo: null,
	setBalances: (balances) => set(() => ({ balances })),
	setStakingInfo: (stakingInfo) => set(() => ({ stakingInfo })),
	setStakingLedgerInfo: (stakingLedgerInfo) =>
		set(() => ({ stakingLedgerInfo })),
}));

const useControllerAccountInfo = create((set) => ({
	controllerAccount: null,
	controllerBalances: null,
	controllerStakingInfo: null,
	setControllerAccount: (controllerAccount) =>
		set(() => ({ controllerAccount })),
	setControllerBalances: (controllerBalances) =>
		set(() => ({ controllerBalances })),
	setControllerStakingInfo: (controllerStakingInfo) =>
		set(() => ({ controllerStakingInfo })),
}));

const useAccountsBalances = create((set) => ({
	accountsBalances: {},

	setAccountsBalances: (accountsBalances) => set(() => ({ accountsBalances })),
}));

const useAccountsControllerStashInfo = create((set) => ({
	accountsControllerStashInfo: {},

	setAccountsControllerStashInfo: (accountsControllerStashInfo) =>
		set(() => ({ accountsControllerStashInfo })),
}));

const useAccountsStakingInfo = create((set) => ({
	accountsStakingInfo: {},

	setAccountsStakingInfo: (accountsStakingInfo) =>
		set(() => ({ accountsStakingInfo })),
}));

const useWalletType = create((set) => ({
	walletType: {},

	setWalletType: (walletType) => set(() => ({ walletType })),
}));

const useAccountsStakingLedgerInfo = create((set) => ({
	accountsStakingLedgerInfo: {},

	setAccountsStakingLedgerInfo: (accountsStakingLedgerInfo) =>
		set(() => ({ accountsStakingLedgerInfo })),
}));

const useYearlyEarning = create((set) => ({
	yearlyEarning: null,

	setYearlyEarning: (yearlyEarning) => set(() => ({ yearlyEarning })),
}));
const useMonthlyEarning = create((set) => ({
	monthlyEarning: null,

	setMonthlyEarning: (monthlyEarning) => set(() => ({ monthlyEarning })),
}));

const useTransactionHash = create((set) => ({
	transactionHash: null,

	setTransactionHash: (transactionHash) => set(() => ({ transactionHash })),
}));

const useDailyEarning = create((set) => ({
	dailyEarning: null,

	setDailyEarning: (dailyEarning) => set(() => ({ dailyEarning })),
}));

const useValidatorData = create((set) => ({
	validatorMap: undefined,
	validatorRiskSets: undefined,
	validators: undefined,

	setValidatorMap: (validatorMap) => set(() => ({ validatorMap })),
	setValidatorRiskSets: (validatorRiskSets) =>
		set(() => ({ validatorRiskSets })),
	setValidators: (validators) => set(() => ({ validators })),
}));

const useNominatorsData = create((set) => ({
	nominatorsData: undefined,
	nomLoading: true,
	setNominatorsData: (nominatorsData) => set(() => ({ nominatorsData })),
	setNomLoading: (nomLoading) => set(() => ({ nomLoading })),
}));

const useCouncil = create((set) => ({
	councilMembers: undefined,
	councilLoading: true,

	setCouncilMembers: (councilMembers) => set(() => ({ councilMembers })),
	setCouncilLoading: (councilLoading) => set(() => ({ councilLoading })),
}));

const useOverviewData = create((set) => ({
	userData: undefined,
	allNominations: undefined,

	setUserData: (userData) => set(() => ({ userData })),
	setAllNominations: (allNominations) => set(() => ({ allNominations })),
}));

const useAccounts = create((set) => ({
	isFilteringAccounts: false,
	stashAccount: null,
	accounts: null,
	accountsWithBalances: null,
	filteredAccounts: [],
	ledgerExists: null,
	bondedAmount: null,
	freeAmount: null,
	activeStake: null,
	redeemableBalance: null,
	unbondingBalances: [],
	accountInfoLoading: false,

	setStashAccount: (stashAccount) => set(() => ({ stashAccount })),
	setAccounts: (accounts) => set(() => ({ accounts })),
	setFreeAmount: (freeAmount) => set(() => ({ freeAmount })),
	setBondedAmount: (bondedAmount) => set(() => ({ bondedAmount })),
	setActiveStake: (activeStake) => set(() => ({ activeStake })),
	setAccountsWithBalances: (accountsWithBalances) =>
		set(() => ({ accountsWithBalances })),
	setFilteredAccounts: (filteredAccounts) => set(() => ({ filteredAccounts })),
	setRedeemableBalance: (redeemableBalance) =>
		set(() => ({ redeemableBalance })),
	setUnbondingBalances: (unbondingBalances) =>
		set(() => ({ unbondingBalances })),
	setIsFilteringAccounts: (isFilteringAccounts) =>
		set(() => ({ isFilteringAccounts })),
	setAccountInfoLoading: (accountInfoLoading) =>
		set(() => ({ accountInfoLoading })),

	setAccountState: (state) => set(() => ({ ...cloneDeep(state) })),
}));

const useTransaction = create((set) => ({
	stakingAmount: null,
	riskPreference: null,
	timePeriodValue: null,
	timePeriodUnit: null,
	compounding: null,
	selectedValidators: [],
	returns: null,
	yieldPercentage: null,
	rewardDestination: 0,

	setStakingAmount: (amount) =>
		set((state) => ({ ...cloneDeep(state), stakingAmount: amount })),
	setTransactionState: (state) => set(() => ({ ...cloneDeep(state) })),
}));

const usePolkadotApi = create((set) => ({
	api: null,

	setapi: (api) => set(() => ({ api })),
}));

const useHeaderLoading = create((set) => ({
	headerLoading: false,

	setHeaderLoading: (headerLoading) => set(() => ({ headerLoading })),
}));

const useNetworkElection = create((set) => ({
	isInElection: false,

	setIsInElection: (isInElection) => set(() => ({ isInElection })),
}));

const useNomMinStake = create((set) => ({
	nomMinStake: null,

	setNomMinStake: (nomMinStake) => set(() => ({ nomMinStake })),
}));

const useCoinGeckoPriceUSD = create((set) => ({
	coinGeckoPriceUSD: null,

	setCoinGeckoPriceUSD: (coinGeckoPriceUSD) =>
		set(() => ({ coinGeckoPriceUSD })),
}));

const useBetaInfo = create((set) => ({
	showBetaMessage: isNil(showBeta) ? true : false,

	setShowBetaMessage: (showBetaMessage) => set(() => ({ showBetaMessage })),
}));

const usePaymentPopover = create((set) => ({
	isPaymentPopoverOpen: false,
	togglePaymentPopover: () =>
		set((state) => ({ isPaymentPopoverOpen: !state.isPaymentPopoverOpen })),
	closePaymentPopover: () => set(() => ({ isPaymentPopoverOpen: false })),
	openPaymentPopover: () => set(() => ({ isPaymentPopoverOpen: true })),
}));

export {
	useSelectedNetwork,
	useYearlyEarning,
	useMonthlyEarning,
	useOverviewData,
	useDailyEarning,
	useValidatorData,
	useAccounts,
	usePolkadotApi,
	useTransaction,
	useHeaderLoading,
	useNetworkElection,
	useCouncil,
	useTransactionHash,
	usePaymentPopover,
	useNominatorsData,
	useNomMinStake,
	useBetaInfo,
	useCoinGeckoPriceUSD,
	useAccountsBalances,
	useAccountsStakingInfo,
	useAccountsStakingLedgerInfo,
	useSelectedAccountInfo,
	useSelectedAccount,
	useAccountsControllerStashInfo,
	useWalletType,
	useIsNewSetup,
	useIsLowBalance,
	useControllerAccountInfo,
};
