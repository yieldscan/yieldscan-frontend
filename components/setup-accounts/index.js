import { useState } from "react";
import GettingStarted from "./GettingStarted";
import AreYouUsingLedger from "./AreYouUsingLedger";
import NotUsingLedger from "./NotUsingLedger";
import UsingLedger from "./UsingLedger";

const SetupAccounts = () => {
	const [step, setStep] = useState(0);
	const [usingLedger, setUsingLedger] = useState(false);

	const incrementStep = () => setStep((step) => step + 1);
	const decrementStep = () => setStep((step) => step - 1);

	console.log(step);

	return step === 0 ? (
		<GettingStarted incrementStep={incrementStep} />
	) : step === 1 ? (
		<AreYouUsingLedger
			incrementStep={incrementStep}
			decrementStep={decrementStep}
			setUsingLedger={(info) => setUsingLedger(info)}
		/>
	) : usingLedger ? (
		<UsingLedger incrementStep={incrementStep} decrementStep={decrementStep} />
	) : (
		<NotUsingLedger
			incrementStep={incrementStep}
			decrementStep={decrementStep}
		/>
	);
};

export default SetupAccounts;
