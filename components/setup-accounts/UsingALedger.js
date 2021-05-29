import { ChevronLeft } from "react-feather";
import Image from "next/image";

const UsingALedger = ({ incrementStep, decrementStep, setUsingLedger }) => (
	<div className="w-full h-full flex justify-center">
		<div className="w-full max-w-65-rem flex flex-col items-center">
			<div className="p-2 w-full">
				{/* TODO: Make a common back button component */}
				<button
					className="flex items-center bg-gray-200 text-gray-600 rounded-full px-2 py-1"
					onClick={decrementStep}
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
					Are you using a ledger device?
				</h1>
				<p className="text-gray-600 text-sm text-center max-w-md">
					Please select yes, even if your ledger device is connected through
					PolkadotJS browser extension
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
						onClick={() => {
							setUsingLedger(false);
							incrementStep();
						}}
					>
						No
					</button>
				</div>
			</div>
		</div>
	</div>
);

export default UsingALedger;
