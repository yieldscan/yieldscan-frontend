import { useState } from "react";
import GettingStarted from "./GettingStarted";
import AreYouUsingLedger from "./AreYouUsingLedger";
import NotUsingLedger from "./NotUsingLedger";
import UsingLedger from "./UsingLedger";
import SetUpComplete from "./SetUpComplete";
import NextSteps from "./NextSteps";

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
