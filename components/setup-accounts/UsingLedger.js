import { Check, Circle } from "react-feather";
import { useRouter } from "next/router";
import {
	useAccounts,
	useSelectedAccount,
	useSelectedNetwork,
} from "@lib/store";
import { getNetworkInfo } from "yieldscan.config";
import addToLocalStorage from "lib/addToLocalStorage";
import { useState } from "react";
import Introduction from "./Introduction";
import IdentifyLedgerAccounts from "./IdentifyLedgerAccounts";
import SelectStakingAccount from "./SelectStakingAccount";
import SelectControllerAccount from "./SelectControllerAccount";

const stepsMenu = [
	"Introduction to staking with Ledger",
	"Identify your ledger accounts",
	"Choose the account you want to use for staking",
	"Select your controller account",
];

const begginerInfo = [
	"Make sure you have at least 10 DOT in your main wallet",
	"Create a controller account using the PolkadotJS browser extension to securely manage your staking activities",
	"Connect your ledger wallet through PolkadotJS",
];

const UsingLedger = ({ incrementStep, decrementStep }) => {
	const router = useRouter();
	const { setSelectedAccount } = useSelectedAccount();
	const { accounts } = useAccounts();
	const { selectedNetwork } = useSelectedNetwork();
	const networkInfo = getNetworkInfo(selectedNetwork);

	const onAccountSelected = (account) => {
		setSelectedAccount(account);
		addToLocalStorage(networkInfo.network, "selectedAccount", account.address);
		router.push({ pathname: "/reward-calculator" });
	};
	const [currentStep, setCurrentStep] = useState(0);

	const incrementCurrentStep = () => setCurrentStep((step) => step + 1);
	const decrementCurrentStep = () => setCurrentStep((step) => step - 1);

	return (
		<div className="w-full h-full grid grid-cols-4 justify-center gap-4">
			<div className="w-full flex flex-col items-center shadow-lg">
				<div className="flex-1 flex flex-col text-gray-700 justify-center content-center p-4 text-gray-700 space-y-6 mb-32">
					{stepsMenu.map((step, index) => (
						<div key={index} className="grid grid-cols-8 items-center">
							{currentStep > index ? (
								<Check
									className="p-1 mr-2 rounded-full border-2 border-gray-500 text-gray-500 bg-opacity-100"
									strokeWidth="4px"
								/>
							) : (
								<Circle
									className="p-1 mr-2 rounded-full"
									strokeWidth="2px"
									color={currentStep !== index ? "#9E9E9E" : "#2BCACA"}
									size="24px"
								/>
							)}
							<p
								className={`${
									currentStep !== index ? "text-gray-500" : "text-teal-500"
								} col-span-7 text-sm max-w-md`}
							>
								{step}
							</p>
						</div>
					))}
				</div>
			</div>
			<div className="w-full col-span-3 flex flex-col justify-center items-center">
				{currentStep === 0 ? (
					<Introduction
						incrementCurrentStep={incrementCurrentStep}
						decrementStep={decrementStep}
					/>
				) : currentStep === 1 ? (
					<IdentifyLedgerAccounts
						incrementCurrentStep={incrementCurrentStep}
						decrementCurrentStep={decrementCurrentStep}
						networkInfo={networkInfo}
					/>
				) : currentStep === 2 ? (
					<SelectStakingAccount
						incrementCurrentStep={incrementCurrentStep}
						decrementCurrentStep={decrementCurrentStep}
						networkInfo={networkInfo}
					/>
				) : (
					<SelectControllerAccount
						incrementCurrentStep={incrementCurrentStep}
						decrementCurrentStep={decrementCurrentStep}
						incrementStep={incrementStep}
						networkInfo={networkInfo}
					/>
				)}
			</div>
		</div>
	);
};

export default UsingLedger;
