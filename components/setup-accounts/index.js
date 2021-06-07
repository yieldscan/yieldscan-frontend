import { useState } from "react";
import GettingStarted from "./GettingStarted";
import AreYouUsingLedger from "./AreYouUsingLedger";
import NotUsingLedger from "./NotUsingLedger";
import UsingLedger from "./UsingLedger";
import SetUpComplete from "./SetUpComplete";
import NextSteps from "./NextSteps";
import NewSetUp_AreYouUsingLedger from "./NewSetUp_AreYouUsingLedger";
import NewSetUp_IdentifyLedgerAccounts from "./NewSetUp_IdentifyLedgerAccounts";
import { useIsNewSetup, useSelectedNetwork } from "@lib/store";
import { getNetworkInfo } from "yieldscan.config";

const SetupAccounts = () => {
	const { isNewSetup, setIsNewSetup } = useIsNewSetup();
	const [step, setStep] = useState(0);
	const [usingLedger, setUsingLedger] = useState(false);
	const { selectedNetwork } = useSelectedNetwork();
	const networkInfo = getNetworkInfo(selectedNetwork);

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
		<GettingStarted incrementStep={incrementStep} />
	) : step === 1 ? (
		<AreYouUsingLedger
			incrementStep={incrementStep}
			decrementStep={decrementStep}
			setUsingLedger={(info) => setUsingLedger(info)}
		/>
	) : step === 2 ? (
		usingLedger ? (
			<UsingLedger
				incrementStep={incrementStep}
				decrementStep={decrementStep}
			/>
		) : (
			<NotUsingLedger
				incrementStep={incrementStep}
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
