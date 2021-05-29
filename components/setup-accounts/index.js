import { useState } from "react";
import GettingStarted from "./GettingStarted";
import UsingALedger from "./UsingALedger";
import NotUsingLedger from "./NotUsingLedger";

const SetupAccounts = () => {
	const [step, setStep] = useState(0);
	const [usingLedger, setUsingLedger] = useState(false);

	const incrementStep = () => setStep((step) => step + 1);
	const decrementStep = () => setStep((step) => step - 1);

	console.log(step);

	return step === 0 ? (
		<GettingStarted incrementStep={incrementStep} />
	) : step === 1 ? (
		<UsingALedger
			incrementStep={incrementStep}
			decrementStep={decrementStep}
			setUsingLedger={(info) => setUsingLedger(info)}
		/>
	) : usingLedger ? (
		<>Using Ledger</>
	) : (
		<NotUsingLedger
			incrementStep={incrementStep}
			decrementStep={decrementStep}
		/>
	);
};

export default SetupAccounts;
