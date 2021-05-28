import { ChevronLeft } from "react-feather";
import Image from "next/image";

const SetupWallet = () => {
	return (
		<div className="w-full h-full flex justify-center">
			<div className="w-full max-w-65-rem flex flex-col">
				<div>
					{/* TODO: Make a common back button component */}
					<button
						className="flex items-center bg-gray-200 text-gray-600 rounded-full px-2 py-1"
						// onClick={back}
					>
						<ChevronLeft size={16} className="text-gray-600" />
						<span className="mx-2 text-sm">back</span>
					</button>
				</div>
				<div className="flex-1 flex flex-row justify-items-center p-1">
					<div className="flex-1 flex flex-col text-gray-700 justify-center content-center p-2 items-center text-gray-700 space-y-6 max-w-md mb-32">
						<Image
							src="/images/walletIcon.svg"
							width="120"
							height="120"
							alt="walletIcon"
						/>
						<h1 className="text-2xl font-semibold text-center">
							No Crypto Wallet?
						</h1>
						<p className="text-gray-600 text-sm text-center max-w-md">
							No worries! Create a wallet to get started with staking on
							YieldScan
						</p>
						<div className="w-full text-center">
							<button
								className="rounded-lg font-medium w-full py-3 bg-teal-500 text-white"
								// onClick={() => onConfirm()}
							>
								Get Started
							</button>
						</div>
					</div>
					<div className="flex-1 flex flex-col text-gray-700 justify-center content-center p-2 items-center text-gray-700 space-y-6 max-w-md mb-32">
						<span>Or</span>
					</div>
					<div className="flex-1 flex flex-col text-gray-700 justify-center content-center p-2 items-center text-gray-700 space-y-6 max-w-md mb-32">
						<Image
							src="/images/ledgerIcon.svg"
							width="120"
							height="120"
							alt="ledgerIcon"
						/>
						<h1 className="text-2xl font-semibold text-center">
							Using Ledger?
						</h1>
						<p className="text-gray-600 text-sm text-center max-w-md">
							This dedicated hardware device securely generates and stores your
							accounts, isolated from your easy-to-hack computer
						</p>
						<div className="w-full text-center">
							<button
								className="rounded-lg font-medium w-full py-3 border-2 border-gray-700"
								// onClick={() => onConfirm()}
							>
								Connect your ledger to PolkadotJS
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SetupWallet;
