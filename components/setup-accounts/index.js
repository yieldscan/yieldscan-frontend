import { useState } from "react";
import GettingStarted from "./GettingStarted";
import AreYouUsingLedger from "./AreYouUsingLedger";
import NotUsingLedger from "./NotUsingLedger";
import UsingLedger from "./UsingLedger";
import SetUpComplete from "./SetUpComplete";
import NextSteps from "./NextSteps";
import NewSetUp_AreYouUsingLedger from "./NewSetUp_AreYouUsingLedger";
import NewSetUp_IdentifyLedgerAccounts from "./NewSetUp_IdentifyLedgerAccounts";
import {
	useAccounts,
	useAccountsBalances,
	useAccountsControllerStashInfo,
	useAccountsStakingInfo,
	useIsNewSetup,
	usePolkadotApi,
	useSelectedAccount,
	useSelectedAccountInfo,
	useSelectedNetwork,
	useWalletType,
} from "@lib/store";
import { getNetworkInfo } from "yieldscan.config";

const SetupAccounts = () => {
	const { accounts } = useAccounts();
	const { walletType, setWalletType } = useWalletType();
	const { isNewSetup, setIsNewSetup } = useIsNewSetup();
	const { selectedNetwork } = useSelectedNetwork();
	const { selectedAccount, setSelectedAccount } = useSelectedAccount();
	const { api } = usePolkadotApi();
	const { accountsBalances } = useAccountsBalances();
	const { accountsStakingInfo } = useAccountsStakingInfo();
	const { accountsControllerStashInfo } = useAccountsControllerStashInfo();
	const { balances, stakingInfo } = useSelectedAccountInfo();
	const networkInfo = getNetworkInfo(selectedNetwork);

	const [step, setStep] = useState(0);
	const [usingLedger, setUsingLedger] = useState(false);

	const incrementStep = () => setStep((step) => step + 1);
	const decrementStep = () => setStep((step) => step - 1);

	return isNewSetup ? (
		step === 0 ? (
			<NewSetUp_AreYouUsingLedger
				setUsingLedger={setUsingLedger}
				incrementStep={incrementStep}
			/>
		) : step === 1 ? (
			usingLedger ? (
				<NewSetUp_IdentifyLedgerAccounts
					incrementStep={incrementStep}
					decrementStep={decrementStep}
					networkInfo={networkInfo}
				/>
			) : (
				<SetUpComplete
					incrementStep={incrementStep}
					isNewSetup={isNewSetup}
					setIsNewSetup={setIsNewSetup}
				/>
			)
		) : (
			<SetUpComplete
				incrementStep={incrementStep}
				isNewSetup={isNewSetup}
				setIsNewSetup={setIsNewSetup}
			/>
		)
	) : step === 0 ? (
		<GettingStarted incrementStep={incrementStep} accounts={accounts} />
	) : step === 1 ? (
		<AreYouUsingLedger
			incrementStep={incrementStep}
			decrementStep={decrementStep}
			setUsingLedger={(info) => setUsingLedger(info)}
			accounts={accounts}
			walletType={walletType}
			setWalletType={setWalletType}
		/>
	) : step === 2 ? (
		usingLedger ? (
			<UsingLedger
				incrementStep={incrementStep}
				decrementStep={decrementStep}
				networkInfo={networkInfo}
				setSelectedAccount={setSelectedAccount}
				accounts={accounts}
				selectedAccount={selectedAccount}
				accountsBalances={accountsBalances}
				api={api}
				accountsStakingInfo={accountsStakingInfo}
				accountsControllerStashInfo={accountsControllerStashInfo}
				balances={balances}
				stakingInfo={stakingInfo}
				walletType={walletType}
				setWalletType={setWalletType}
			/>
		) : (
			<NotUsingLedger
				accounts={accounts}
				setSelectedAccount={setSelectedAccount}
				networkInfo={networkInfo}
				api={api}
				accountsBalances={accountsBalances}
				accountsControllerStashInfo={accountsControllerStashInfo}
				decrementStep={decrementStep}
			/>
		)
	) : step === 3 ? (
		<SetUpComplete incrementStep={incrementStep} />
	) : (
		<NextSteps />
	);
};

export default SetupAccounts;
