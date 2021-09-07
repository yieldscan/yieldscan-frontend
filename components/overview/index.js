import { useState, useEffect } from "react";
import { Edit2, AlertTriangle, ChevronRight } from "react-feather";
import OverviewCards from "./OverviewCards";
import NominationsTable from "./NominationsTable";
import {
	Spinner,
	useDisclosure,
	useToast,
	Collapse,
	Button,
} from "@chakra-ui/core";
import axios from "@lib/axios";
import {
	useAccounts,
	usePolkadotApi,
	useSelectedNetwork,
	useOverviewData,
	useValidatorData,
	useSelectedAccount,
	useAccountsBalances,
	useAccountsStakingInfo,
	useSelectedAccountInfo,
} from "@lib/store";
import { useWalletConnect } from "@components/wallet-connect";
import { isNil } from "lodash";
import UnbondingList from "./UnbondingList";
import Routes from "@lib/routes";
import { useRouter } from "next/router";
import AllNominations from "./AllNominations";
import { getNetworkInfo } from "yieldscan.config";
import EarningsOutput from "./EarningsOutput";
import { Events, trackEvent, track, goalCodes } from "@lib/analytics";
import ProgressiveImage from "react-progressive-image";
import RedeemUnbonded from "./RedeemUnbonded";
import Image from "next/image";
import InvestMoreModal from "./InvestMoreModal";
import ReBondModal from "./ReBondModal";
import WithdrawModal from "./WithdrawModal";

const Tabs = {
	ACTIVE_VALIDATORS: "validators",
	NOMINATIONS: "nominations",
};

const Overview = () => {
	const router = useRouter();
	const { selectedNetwork } = useSelectedNetwork();
	const networkInfo = getNetworkInfo(selectedNetwork);
	const { toggle } = useWalletConnect();
	const { apiInstance } = usePolkadotApi();
	const { accounts, redeemableBalance } = useAccounts();
	const { selectedAccount } = useSelectedAccount();
	const { accountsBalances } = useAccountsBalances();
	const { accountsStakingInfo } = useAccountsStakingInfo();
	const { balances, stakingInfo } = useSelectedAccountInfo();
	const toast = useToast();
	const [loading, setLoading] = useState(true);
	const [nominationsLoading, setNominationsLoading] = useState(true); // work-around :(
	const [error, setError] = useState(false);
	const { userData, setUserData, allNominations, setAllNominations } =
		useOverviewData();
	const { validators, setValidators } = useValidatorData();
	const [showValidators, setShowValidators] = useState(false);
	const [eraLength, setEraLength] = useState();
	const [eraProgress, setEraProgress] = useState();
	const [activeEra, setActiveEra] = useState();
	const [validatorsLoading, setValidatorsLoading] = useState(true);
	const handleValToggle = () => setShowValidators(!showValidators);
	const [selectedTab, setSelectedTab] = useState(Tabs.NOMINATIONS);
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
	const [controllerBalances, setControllerBalances] = useState(
		() => accountsBalances[controllerAccount?.address]
	);
	const [minPossibleStake, setMinPossibleStake] = useState(0);
	const {
		isOpen: isRewardDestinationModalOpen,
		onToggle: toggleRewardDestinationModal,
		onClose: closeRewardDestinationModal,
	} = useDisclosure();
	const {
		isOpen: editControllerModalOpen,
		onToggle: toggleEditControllerModal,
		onClose: closeEditControllerModal,
	} = useDisclosure();
	const {
		isOpen: investMoreModalOpen,
		onToggle: toggleInvestMoreModal,
		onClose: closeInvestMoreModal,
	} = useDisclosure();
	const {
		isOpen: reBondModalOpen,
		onToggle: toggleReBondModal,
		onClose: closeReBondModal,
	} = useDisclosure();
	const {
		isOpen: withdrawModalOpen,
		onToggle: toggleWithdrawModal,
		onClose: closeWithdrawModal,
	} = useDisclosure();
	const {
		isOpen: openUnbondingList,
		onToggle: toggleUnbondingList,
		onClose: closeUnbondingList,
	} = useDisclosure();
	const {
		isOpen: openRedeemUnbonded,
		onToggle: toggleRedeemUnbonded,
		onClose: closeRedeemUnbonded,
	} = useDisclosure();

	useEffect(() => {
		if (selectedAccount?.address) {
			axios
				.get(`/${networkInfo.network}/user/${selectedAccount?.address}`)
				.then(({ data }) => {
					setUserData(data);
				})
				.catch((err) => {
					setUserData(null);
					console.info(
						"No staking data found for the accountId:",
						selectedAccount?.address
					);
				});
		} else {
			setUserData(null);
		}
	}, [selectedAccount?.address]);

	useEffect(() => {
		setEraLength(null);
		setEraProgress(null);
		setActiveEra(null);
		let unsubscribe;
		apiInstance?.derive.session
			.progress((data) => {
				setEraLength(parseInt(data.eraLength));
				setEraProgress(parseInt(data.eraProgress));
				setActiveEra(parseInt(data.activeEra));
			})
			.then((u) => (unsubscribe = u));
		return () => {
			unsubscribe && unsubscribe();
		};
	}, [networkInfo, apiInstance]);

	useEffect(() => {
		if (stakingInfo?.nominators && stakingInfo?.nominators.length > 0) {
			const multiQueryString = stakingInfo.nominators.reduce(
				(acc, curr) => acc + `,${curr.toString()}`,
				""
			);

			axios
				.get(
					`/${networkInfo.network}/validator/multi?stashIds=${multiQueryString}`
				)
				.then(({ data }) => {
					setAllNominations(data);
				})
				.catch((err) => {
					setAllNominations(null);
					console.info("No data found for the nominations!");
				})
				.finally(() => {
					setNominationsLoading(false);
				});
		} else {
			setAllNominations(null);
		}
	}, [stakingInfo]);

	useEffect(async () => {
		if (apiInstance) {
			const data = await apiInstance?.query.staking.minNominatorBond();
			setMinPossibleStake(
				parseInt(data) / Math.pow(10, networkInfo.decimalPlaces)
			);
		}
	}, [selectedNetwork, apiInstance]);

	useEffect(() => {
		if (stakingInfo?.accountId?.toString() !== selectedAccount?.address) {
			setControllerAccount(null);
		}
		const account = accountsStakingInfo[selectedAccount?.address]?.controllerId
			? accounts?.filter(
					(account) =>
						account.address ===
						accountsStakingInfo[
							selectedAccount?.address
						]?.controllerId?.toString()
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
	const onEditController = () => {
		closeRewardDestinationModal();
		toggleEditControllerModal();
	};

	const openUnbondingListModal = () => {
		toggleUnbondingList();
	};

	return isNil(apiInstance) ? (
		<div className="flex-center w-full h-full">
			<div className="flex-center flex-col">
				<Spinner size="xl" color="teal.500" thickness="4px" />
				<span className="text-sm text-gray-600 mt-5">Instantiating API...</span>
			</div>
		</div>
	) : !accounts || !selectedAccount ? (
		<div className="flex-center w-full h-full">
			<div className="flex-center flex-col">
				<AlertTriangle size="32" className="text-orange-500" />
				<span className="text-gray-600 text-lg mb-10">
					No account {isNil(accounts) ? "connected" : "selected"}!
				</span>
				<button
					className="border border-teal-500 text-teal-500 px-3 py-2 rounded-full"
					onClick={() =>
						isNil(accounts)
							? (router.push("/setup-wallet"),
							  track(goalCodes.OVERVIEW.INTENT_CONNECT_WALLET))
							: toggle()
					}
				>
					{isNil(accounts) ? "Connect Wallet" : "Select Account"}
				</button>
			</div>
		</div>
	) : isNil(balances) || isNil(stakingInfo) ? (
		<div className="flex-center w-full h-full">
			<div className="flex-center flex-col">
				<Spinner size="xl" color="teal.500" thickness="4px" />
				<span className="text-sm text-gray-600 mt-5">
					Fetching your data...
				</span>
			</div>
		</div>
	) : stakingInfo?.stakingLedger?.total.isEmpty ? (
		<div className="flex items-center flex-col pt-24">
			<Image
				src="/images/unicorn-sweat/unicorn-sweat.png"
				alt="unicorn-sweat"
				width="180"
				height="200"
			/>
			<h2 className="text-2xl text-gray-700 font-semibold mt-4">
				Hey! So, ummm...
			</h2>
			<p className="text-gray-600 mt-2 text-center">
				You haven’t yet started staking. <br />
				Try checking back after you’ve done that.
			</p>
			<Button
				as="button"
				className="min-w-max-content"
				variantColor="teal"
				rounded="full"
				fontWeight="normal"
				size="lg"
				mt={12}
				px={12}
				_hover={{ bg: "#2bcaca" }}
				onClick={() => {
					trackEvent(Events.LANDING_CTA_CLICK, {
						path: Routes.OVERVIEW,
					}).then(() => router.push({ pathname: "/reward-calculator" }));
				}}
			>
				Start staking
			</Button>
			<p className="mt-6 text-sm text-gray-600">
				Think this is a mistake?{" "}
				<a
					className="text-gray-700 font-semibold"
					href="mailto:karan@buidllabs.io"
					target="_blank"
					rel="noreferrer"
				>
					Contact us
				</a>
			</p>
		</div>
	) : (
		<div className="py-10 w-full h-full">
			{investMoreModalOpen && (
				<InvestMoreModal
					apiInstance={apiInstance}
					isOpen={investMoreModalOpen}
					close={closeInvestMoreModal}
					nominations={allNominations}
					selectedAccount={selectedAccount}
					balance={balances}
					stakingInfo={stakingInfo}
					networkInfo={networkInfo}
					minPossibleStake={minPossibleStake}
					controllerAccount={controllerAccount}
					controllerBalances={controllerBalances}
					isSameStashController={
						selectedAccount?.address === controllerAccount?.address
					}
				/>
			)}
			{reBondModalOpen && (
				<ReBondModal
					apiInstance={apiInstance}
					isOpen={reBondModalOpen}
					close={closeReBondModal}
					nominations={allNominations}
					selectedAccount={selectedAccount}
					balance={balances}
					stakingInfo={stakingInfo}
					networkInfo={networkInfo}
					minPossibleStake={minPossibleStake}
					controllerAccount={controllerAccount}
					controllerBalances={controllerBalances}
					isSameStashController={
						selectedAccount?.address === controllerAccount?.address
					}
				/>
			)}
			{withdrawModalOpen && (
				<WithdrawModal
					apiInstance={apiInstance}
					isOpen={withdrawModalOpen}
					close={closeWithdrawModal}
					nominations={allNominations}
					selectedAccount={selectedAccount}
					balance={balances}
					stakingInfo={stakingInfo}
					networkInfo={networkInfo}
					minPossibleStake={minPossibleStake}
					controllerAccount={controllerAccount}
					controllerBalances={controllerBalances}
					isSameStashController={
						selectedAccount?.address === controllerAccount?.address
					}
				/>
			)}
			<UnbondingList
				api={apiInstance}
				isOpen={openUnbondingList}
				close={closeUnbondingList}
				stakingInfo={stakingInfo}
				networkInfo={networkInfo}
				eraLength={eraLength}
				eraProgress={eraProgress}
			/>
			<RedeemUnbonded
				isOpen={openRedeemUnbonded}
				close={closeRedeemUnbonded}
				api={apiInstance}
				toggle={toggleRedeemUnbonded}
				redeemableBalance={stakingInfo?.redeemable}
				stakingInfo={stakingInfo}
				selectedAccount={selectedAccount}
				networkInfo={networkInfo}
				apiInstance={apiInstance}
				controllerAccount={controllerAccount}
				controllerBalances={controllerBalances}
				isSameStashController={
					selectedAccount?.address === controllerAccount?.address
				}
			/>
			<div className="flex-col">
				<div className="flex">
					<OverviewCards
						stats={isNil(userData) ? null : userData.stats}
						stakingInfo={stakingInfo}
						validators={isNil(userData) ? null : userData.validatorsInfo}
						bondFunds={toggleInvestMoreModal}
						unbondFunds={toggleWithdrawModal}
						rebondFunds={toggleReBondModal}
						toggleRedeemUnbonded={toggleRedeemUnbonded}
						openUnbondingListModal={() => openUnbondingListModal()}
						openRewardDestinationModal={toggleRewardDestinationModal}
						networkInfo={networkInfo}
						minPossibleStake={minPossibleStake}
					/>
					{/* TODO: Handle errors */}
					<div className="flex ml-20 w-1/2">
						<EarningsOutput
							networkInfo={networkInfo}
							validators={
								isNil(userData)
									? []
									: userData.validatorsInfo.filter(
											(validator) => validator.isElected
									  )
							}
							inputValue={{
								currency:
									stakingInfo?.stakingLedger.active /
									Math.pow(10, networkInfo.decimalPlaces),
							}}
							address={selectedAccount?.address}
							eraLength={eraLength}
							activeEra={activeEra}
						/>
					</div>
				</div>
				<div className="w-full">
					<div className="flex flex-col h-full mb-2">
						<button
							onClick={() => {
								handleValToggle();
								if (!showValidators)
									track(goalCodes.OVERVIEW.CHECKED_VALIDATORS);
							}}
							className="flex text-gray-600 text-xs mt-12"
						>
							<ChevronRight
								size={16}
								className={`transition ease-in-out duration-500 mr-2 ${
									showValidators && "transform rotate-90"
								}`}
							/>
							{showValidators ? "Hide" : "See your"} validators
						</button>
						<Collapse isOpen={showValidators}>
							<div className="flex items-center mt-4 mb-2">
								<button
									className={
										selectedTab === Tabs.NOMINATIONS
											? "text-gray-900 mx-2"
											: "text-gray-500 mx-2"
									}
									onClick={() => setSelectedTab(Tabs.NOMINATIONS)}
								>
									Selected
								</button>
								<button
									className={
										selectedTab === Tabs.ACTIVE_VALIDATORS
											? "text-gray-900 mx-2"
											: "text-gray-500 mx-2"
									}
									onClick={() => setSelectedTab(Tabs.ACTIVE_VALIDATORS)}
								>
									Active
								</button>
							</div>
							{selectedTab === Tabs.ACTIVE_VALIDATORS ? (
								<NominationsTable
									validators={isNil(userData) ? [] : userData.validatorsInfo}
									networkInfo={networkInfo}
								/>
							) : (
								allNominations && (
									<AllNominations
										nominations={allNominations}
										networkInfo={networkInfo}
									/>
								)
							)}
						</Collapse>
					</div>
					{/* <div className="w-4/12">
						<ExpectedReturns
							stats={userData.stats}
							validators={userData.validatorsInfo}
							networkInfo={networkInfo}
						/>
					</div> */}
				</div>
			</div>
		</div>
	);
};

export default Overview;
