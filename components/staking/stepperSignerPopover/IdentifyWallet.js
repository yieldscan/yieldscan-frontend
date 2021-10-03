import Image from "next/image";

const IdentifyWallet = ({
	onConfirm,
	closeStepperSignerPopover,
	incrementStepperIndex,
	isLedger,
	setIsLedger,
}) => {
	return (
		<div className="w-full flex flex-col justify-center items-center space-y-4">
			<h1 className="w-full text-xl text-center text-gray-700 font-semibold p-2">
				Tell us your account’s source
			</h1>
			<div className="w-full flex flex-col justify-center items-center space-y-2">
				<p className="w-full text-sm text-center text-gray-700 font-light px-4">
					We optimize your transaction signing process using this information.
					Please make sure you select the correct option else your transaction
					may fail.
				</p>
				<a
					className="w-full text-sm text-center text-gray-700 font-semibold underline cursor-pointer px-2"
					href="https://intercom.help/yieldscan/en/articles/5353515-how-to-check-which-accounts-on-polkadot-js-wallet-are-imported-through-a-hardware-wallet"
					target="_blank"
					rel="noreferrer"
				>
					How to check?
				</a>
			</div>
			<div className="w-full flex text-gray-700 flex-col space-y-2 p-2">
				<button
					className="w-full flex rounded-lg border items-center shadow-md hover:shadow-lg p-8 transform hover:scale-102"
					onClick={() => {
						setIsLedger(true);
						incrementStepperIndex();
					}}
				>
					<div className="w-full flex-1 flex flex-row items-center text-left space-x-6">
						<Image
							src="/images/ledgerIcon.svg"
							width="80"
							height="80"
							alt="walletIcon"
						/>
						<div className="flex flex-col text-left">
							<h2 className="text-lg font-semibold">Ledger hardware wallet</h2>
							<p className="text-gray-600 text-sm max-w-md">
								{
									"Select this option if you’re using a hardware wallet connected through polkadot{.js}"
								}
							</p>
						</div>
					</div>
				</button>
				<button
					className="w-full flex rounded-lg border items-center shadow-md hover:shadow-lg p-8 transform hover:scale-102"
					onClick={() => {
						setIsLedger(false);
						onConfirm(false);
						closeStepperSignerPopover();
					}}
				>
					<div className="w-full flex-1 flex flex-row items-center text-left space-x-6">
						<Image
							src="/images/polkadot-ext.svg"
							width="80"
							height="80"
							alt="walletIcon"
						/>
						<div className="flex flex-col text-left">
							<h2 className="text-lg font-semibold">
								{"Using a polkadot{.js} account"}
							</h2>
							<p className="text-gray-600 text-sm max-w-md">
								Select this if you’re using a non-ledger account or if you don’t
								know what a ledger device is
							</p>
						</div>
					</div>
				</button>
			</div>
		</div>
	);
};
export default IdentifyWallet;
