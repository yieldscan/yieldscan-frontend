import { useState } from "react";
import { ChevronLeft } from "react-feather";
import Image from "next/image";
import { useAccounts, useSelectedNetwork, useWalletType } from "@lib/store";
import addToLocalStorage from "@lib/addToLocalStorage";
import { getNetworkInfo } from "yieldscan.config";
import { isNil } from "lodash";
import { useRouter } from "next/router";

const NewSetUp_AreYouUsingLedger = ({ incrementStep, setUsingLedger }) => {
	const router = useRouter();
	const { accounts } = useAccounts();
	const { selectedNetwork } = useSelectedNetwork();
	const { walletType, setWalletType } = useWalletType();
	const [showLedgerInfo, setShowLedgerInfo] = useState(false);
	const networkInfo = getNetworkInfo(selectedNetwork);
	const newAccounts = accounts?.filter((account) =>
		isNil(walletType[account?.substrateAddress])
	);
	const handleOnClickNext = () => {
		newAccounts?.map((account) => {
			addToLocalStorage(account.substrateAddress, "isLedger", false);
			const accountsType = walletType;
			accountsType[account?.substrateAddress] = false;
			setWalletType({ ...accountsType });
		});
		setUsingLedger(false);
		incrementStep();
	};

	return accounts ? (
		<div className="w-full h-full flex justify-center">
			<div className="w-full max-w-65-rem flex flex-col items-center">
				<div className="p-2 w-full">
					{/* TODO: Make a common back button component */}
					<button
						className="flex items-center bg-gray-200 text-gray-600 rounded-full px-2 py-1"
						onClick={() => router.back()}
					>
						<ChevronLeft size={16} className="text-gray-600" />
						<span className="mx-2 text-sm">back</span>
					</button>
				</div>
				<div className="flex-1 flex flex-col text-gray-700 justify-center content-center p-2 items-center text-gray-700 space-y-6 max-w-md mb-32">
					<Image
						src="/images/ledgerIcon.svg"
						width="120"
						height="120"
						alt="ledgerIcon"
					/>
					<h1 className="text-2xl font-semibold text-center">
						Are any of your new accounts imported from a ledger device?
					</h1>
					<p
						className={`text-sm text-center max-w-md p-4 rounded-lg border border-white ${
							showLedgerInfo
								? "rounded-lg border border-teal-500 text-teal-500"
								: "text-gray-600"
						}`}
					>
						{showLedgerInfo
							? "Ledger wallet is a dedicated hardware device which securely stores your accounts, isolated from your easy-to-hack computer"
							: "Please select yes, even if your ledger device is connected through PolkadotJS browser extension"}
					</p>
					<p
						className="text-gray-700 text-xs text-center underline cursor-pointer"
						onMouseOver={() => setShowLedgerInfo(true)}
						onMouseOut={() => setShowLedgerInfo(false)}
					>
						WTF is a ledger?
					</p>
					<div className="w-full flex flex-col text-center space-y-3">
						<button
							className="rounded-lg font-medium w-full py-3 border-2 border-gray-700"
							onClick={() => {
								setUsingLedger(true);
								incrementStep();
							}}
						>
							Yes
						</button>
						<button
							className="rounded-lg font-medium w-full py-3 border-2 border-gray-700"
							onClick={handleOnClickNext}
						>
							No
						</button>
					</div>
				</div>
			</div>
		</div>
	) : (
		<div className="flex h-full w-full text-left text-gray-700 flex-col justify-center items-center">
			<span className="loader"></span>
		</div>
	);
};

export default NewSetUp_AreYouUsingLedger;
