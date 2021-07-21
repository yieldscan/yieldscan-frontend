import { useAccountsBalances } from "@lib/store";
import Account from "./Account";

const SelectAccount = ({ accounts, onAccountSelected, networkInfo }) => {
	const { accountsBalances } = useAccountsBalances();
	return (
		<div className="w-full">
			<div className="w-full text-sm p-2 space-y-1 overflow-y-scroll max-h-24-rem">
				{accounts?.map((account) => {
					return (
						<Account
							account={account}
							key={account.address}
							onAccountSelected={onAccountSelected}
							balances={accountsBalances[account.address]}
							networkInfo={networkInfo}
						/>
					);
				})}
			</div>
			<style jsx>{`
				.max-h-24-rem {
					max-height: 24rem;
				}
			`}</style>
		</div>
	);
};

export default SelectAccount;
