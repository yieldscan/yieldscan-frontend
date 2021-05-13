import { memo, useEffect } from "react";
const Account = memo(
	({ account, api, accountsBalances, setAccountsBalances }) => {
		useEffect(() => {
			let unsub;
			api?.derive.balances
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
		}, []);

		return null;
	}
);

export default Account;
