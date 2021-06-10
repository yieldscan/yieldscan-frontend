import { memo, useEffect } from "react";
const Account = memo(
	({
		account,
		api,
		accountsBalances,
		setAccountsBalances,
		accountsStakingInfo,
		setAccountsStakingInfo,
		accountsStakingLedgerInfo,
		setAccountsStakingLedgerInfo,
	}) => {
		useEffect(() => {
			let unsub;
			api.derive.balances
				.all(account.address, (info) => {
					const balances = accountsBalances;
					balances[account.address] = info;
					setAccountsBalances(balances);
				})
				.then((u) => {
					unsub = u;
				});
			return () => {
				unsub && unsub();
			};
		}, [account]);

		useEffect(() => {
			let unsub;
			api?.derive.staking
				.account(account.address, (info) => {
					const stakingInfo = accountsStakingInfo;
					stakingInfo[account.address] = info;
					setAccountsStakingInfo(stakingInfo);
				})
				.then((u) => {
					unsub = u;
				});
			return () => {
				unsub && unsub();
			};
		}, [account]);

		useEffect(() => {
			let unsub;
			api?.query.staking
				.ledger(account.address, (info) => {
					const stakingLedger = accountsStakingLedgerInfo;
					stakingLedger[account.address] = info;
					setAccountsStakingLedgerInfo(stakingLedger);
				})
				.then((u) => {
					unsub = u;
				});
			return () => {
				unsub && unsub();
			};
		}, [account]);

		return null;
	}
);

export default Account;
