import dynamic from "next/dynamic";
import {
	useAccounts,
	usePolkadotApi,
	useTransaction,
	useSelectedNetwork,
	useCoinGeckoPriceUSD,
} from "@lib/store";
import createPolkadotAPIInstance from "@lib/polkadot-api";
import fetchPrice from "@lib/fetch-price";
import { get, isNil, pick } from "lodash";
import { useEffect } from "react";
import { trackEvent, Events, setUserProperties } from "@lib/analytics";
import Footer from "../footer";
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";

const Header = dynamic(
	() => import("@components/common/header").then((mod) => mod.default),
	{ ssr: false }
);

import { getNetworkInfo } from "yieldscan.config";

const withBaseLayout = (children) => {
	const { apiInstance, setApiInstance } = usePolkadotApi();
	const { selectedNetwork, setSelectedNetwork } = useSelectedNetwork();
	const networkInfo = getNetworkInfo(selectedNetwork);
	const {
		accounts,
		accountsWithBalances,
		setAccountsWithBalances,
		stashAccount,
		setAccountInfoLoading,
		setAccountState,
	} = useAccounts((state) =>
		pick(state, [
			"accounts",
			"accountsWithBalances",
			"setAccountsWithBalances",
			"stashAccount",
			// "setAccountInfoLoading",
			"setAccountState",
		])
	);
	const { coinGeckoPriceUSD, setCoinGeckoPriceUSD } = useCoinGeckoPriceUSD();
	const { stakingAmount, setTransactionState } = useTransaction((state) =>
		pick(state, ["stakingAmount", "setTransactionState"])
	);

	useEffect(() => {
		if (isNil(coinGeckoPriceUSD)) {
			fetchPrice(coinGeckoPriceUSD, networkInfo.coinGeckoDenom).then((price) =>
				setCoinGeckoPriceUSD(price)
			);
		}
	}, [networkInfo, coinGeckoPriceUSD]);

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
				})
				.catch((err) => {
					throw err;
				});
		}
	}, [accounts]);

	return () => (
		<div>
			<Header isBase />
			<div className="flex">
				<div className="min-h-full h-fit-content w-full">{children()}</div>
			</div>
		</div>
	);
};

export default withBaseLayout;
