const ChainErrorPage = ({ router, setIsNewSetup }) => {
	return (
		<div className="flex flex-col text-center justify-center items-center space-y-6">
			<img src="/images/polkadot_alert.png" width="150px" />
			<h3 className="text-xl font-semibold max-w-sm">
				Oops! The transaction has failed...
			</h3>
			<span className="mt-4 px-4 text-sm text-gray-600">
				This might be because you haven't setup your accounts correctly. Setup
				your accounts before retrying.
			</span>
			{/* <a
				href={`https://polkascan.io/kusama/transaction/${transactionHash}`}
				className="mt-6 text-gray-500"
				target="_blank"
			>
				Track this transaction on PolkaScan
			</a> */}
			<div className="max-w-lg space-y-4">
				<button
					className="w-full rounded-lg min-w-32 font-medium p-3 bg-teal-500 text-white"
					onClick={() => {
						setIsNewSetup(false);
						router.push("/setup-accounts");
					}}
				>
					Yes, take me to setup accounts
				</button>
				<button
					className="w-full rounded-lg min-w-32 font-medium p-3 text-teal-500 border border-teal-500 text-white"
					// onClick={onConfirm}
				>
					No? Contact Us
				</button>
			</div>
		</div>
	);
};

export default ChainErrorPage;
