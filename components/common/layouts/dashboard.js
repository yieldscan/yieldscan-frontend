import dynamic from "next/dynamic";
import SideMenu from "@components/common/sidemenu";
import {
	useAccounts,
	usePolkadotApi,
	useTransaction,
	useSelectedNetwork,
	useBetaInfo,
	useEraProgress,
} from "@lib/store";
import createPolkadotAPIInstance from "@lib/polkadot-api";
import convertCurrency from "@lib/convert-currency";
import { get, includes, isNil, pick } from "lodash";
import { useEffect } from "react";
import { trackEvent, Events, setUserProperties } from "@lib/analytics";
import Footer from "../footer";
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";

const Header = dynamic(
	() => import("@components/common/header").then((mod) => mod.default),
	{ ssr: false }
);

import { getNetworkInfo } from "yieldscan.config";
import { Alert, AlertIcon, CloseButton } from "@chakra-ui/core";
import SideMenuFooter from "../side-menu-footer";
import { useRouter } from "next/router";
import Routes from "@lib/routes";
import { setCookie } from "nookies";

const withDashboardLayout = (children) => {
	const router = useRouter();
	const { showBetaMessage, setShowBetaMessage } = useBetaInfo();
	const { apiInstance, setApiInstance } = usePolkadotApi();
	const { selectedNetwork, setSelectedNetwork } = useSelectedNetwork();
	const networkInfo = getNetworkInfo(selectedNetwork);
	const {
		accounts,
		setAccountsWithBalances,
		stashAccount,
		setAccountInfoLoading,
		setAccountState,
		bondedAmount,
		setBondedAmount,
		unbondingBalances,
		setUnbondingBalances,
		activeStake,
		setActiveStake,
		redeemableBalance,
		setRedeemableBalance,
		freeAmount,
		setFreeAmount,
		accountsWithBalances,
	} = useAccounts();
	const { setEraLength, setEraProgress } = useEraProgress();
	const { stakingAmount, setTransactionState } = useTransaction((state) =>
		pick(state, ["stakingAmount", "setTransactionState"])
	);

	useEffect(() => {
		if (accounts && accounts.length > 0) {
			createPolkadotAPIInstance(networkInfo, apiInstance)
				.then(async (api) => {
					setApiInstance(api);
					const queries = accounts.map((account) => [
						api.query.staking.ledger,
						account.address,
					]);

					const accountsWithBalances = await Promise.all(
						accounts.map(async (account) => {
							const balanceInfo = await api.derive.balances.all(
								account.address.toString()
							);
							account.address = encodeAddress(
								decodeAddress(account.address.toString()),
								networkInfo.addressPrefix
							);
							account.balances = balanceInfo;
							return account;
						})
					);
					setAccountsWithBalances(accountsWithBalances);
					await api.derive.session.progress((data) => {
						setEraLength(parseInt(data.eraLength));
						setEraProgress(parseInt(data.eraProgress));
					});
				})
				.catch((err) => {
					throw err;
				});
		}
	}, [accounts]);

	useEffect(() => {
		// wallet connected state:
		// when `stashAccount` is selected, fetch ledger for the account and save it.
		if (stashAccount) {
			setAccountInfoLoading(true);
			createPolkadotAPIInstance(networkInfo, apiInstance).then(async (api) => {
				setApiInstance(api);

				const { address } = stashAccount;

				await api.derive.staking.account(address, async (info) => {
					if (!isNil(info.redeemable)) {
						const redeemable = Number(parseInt(info.redeemable));
						setRedeemableBalance(redeemable);
					}
					if (!isNil(info.stakingLedger)) {
						const bondedAmount = Number(
							parseInt(info.stakingLedger.active) /
								10 ** networkInfo.decimalPlaces
						);
						const bondedAmountInSubCurrency = await convertCurrency(
							bondedAmount,
							networkInfo.coinGeckoDenom
						);
						setBondedAmount({
							currency: bondedAmount,
							subCurrency: bondedAmountInSubCurrency,
						});
						const activeStake = Number(
							parseInt(info.stakingLedger.active) /
								10 ** networkInfo.decimalPlaces
						);
						const activeStakeInSubCurrency = await convertCurrency(
							activeStake,
							networkInfo.coinGeckoDenom
						);
						setActiveStake({
							currency: activeStake,
							subCurrency: activeStakeInSubCurrency,
						});
					}
					if (!isNil(info.unlocking)) {
						const unbondingBalancesArr = [];
						info.unlocking.forEach((unbondingBalance) => {
							const { remainingEras, value } = unbondingBalance;
							unbondingBalancesArr.push({
								remainingEras: Number(parseInt(remainingEras)),
								value: Number(
									parseInt(value) / 10 ** networkInfo.decimalPlaces
								),
							});
						});
						setUnbondingBalances(unbondingBalancesArr);
					} else setUnbondingBalances([]);
				});
				await api.derive.balances.all(address, async (info) => {
					const freeAmount = Number(
						parseInt(info.availableBalance) / 10 ** networkInfo.decimalPlaces
					);
					const freeAmountInSubCurrency = await convertCurrency(
						freeAmount,
						networkInfo.coinGeckoDenom
					);
					setFreeAmount({
						currency: freeAmount,
						subCurrency: freeAmountInSubCurrency,
					});
				});

				const setStateAndTrack = (details) => {
					setUserProperties({
						stashId: address,
						bondedAmount: `${get(details, "bondedAmount.currency")} ${get(
							networkInfo,
							"denom"
						)} ($${get(details, "bondedAmount.subCurrency")})`,
						accounts: accountsWithBalances,
					});
					// setAccountState(details);
				};
			});
		}
	}, [stashAccount]);

	useEffect(() => {
		if (stashAccount) {
			setAccountInfoLoading(true);
			if (!isNil(bondedAmount) && !isNil(activeStake) && !isNil(freeAmount)) {
				setAccountInfoLoading(false);
				// setStateAndTrack({
				// 	bondedAmount: bondedAmount,
				// 	freeAmount: freeAmount,
				// 	activeStake: activeStake,
				// 	redeemableBalance: redeemableBalance,
				// 	unbondingBalances: unbondingBalances,
				// 	accountInfoLoading: false,
				// });
			}
		}
	}, [freeAmount, bondedAmount, activeStake]);

	return () => (
		<div>
			<Header />
			<div className="dashboard-content fixed flex relative w-full">
				<div className="h-full hidden xl:block sidemenu-container xl:w-2/12 py-8 max-w-xs">
					<SideMenu />
					<div className="absolute bottom-0 pb-8">
						<SideMenuFooter />
					</div>
				</div>

				<div className="h-full px-8 overflow-y-scroll  mx-auto w-full">
					<div
						className={`mx-auto h-full ${
							includes(
								[Routes.OVERVIEW, Routes.CALCULATOR, Routes.SETTINGS],
								get(router, "pathname")
							)
								? "max-w-screen-lg"
								: "max-w-screen-xl"
						}`}
					>
						{showBetaMessage && (
							<Alert
								status="info"
								color="blue.500"
								rounded="lg"
								mt={4}
								fontSize="sm"
								justifyContent="center"
								flex
							>
								<AlertIcon />
								This platform is currently in beta. Please proceed with
								discretion.
								<CloseButton
									position="absolute"
									right="8px"
									top="8px"
									onClick={() => {
										setShowBetaMessage(false);
										setCookie(null, "showBeta", "false", {
											maxAge: 7 * 24 * 60 * 60,
										});
									}}
								/>
							</Alert>
						)}
						{children()}
					</div>
				</div>
			</div>
			<style jsx>{`
				.dashboard-content {
					height: calc(100vh - 4.125rem);
				}
				.sidemenu-container {
					background: #f7fbff;
					z-index: 10;
				}
			`}</style>
		</div>
	);
};

export default withDashboardLayout;
