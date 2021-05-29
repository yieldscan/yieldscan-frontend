import { ChevronLeft } from "react-feather";
import Image from "next/image";

const GettingStrated = ({ incrementStep }) => (
	<div className="w-full h-full flex justify-center">
		<div className="w-full max-w-65-rem flex flex-col items-center">
			<div className="p-2 w-full">
				{/* TODO: Make a common back button component */}
				<button
					className="flex items-center bg-gray-200 text-gray-600 rounded-full px-2 py-1"
					// onClick={decrementStep}
				>
					<ChevronLeft size={16} className="text-gray-600" />
					<span className="mx-2 text-sm">back</span>
				</button>
			</div>
			<div className="flex-1 flex flex-col text-gray-700 justify-center content-center p-2 items-center text-gray-700 space-y-6 max-w-md mb-32">
				<Image
					src="/images/walletIcon.svg"
					width="120"
					height="120"
					alt="walletIcon"
				/>
				<h1 className="text-2xl font-semibold text-center">
					Let’s setup your accounts
				</h1>
				<p className="text-gray-600 text-sm text-center max-w-md">
					Just answer a few questions and we’ll get you set up. You only need to
					do this once and it will only take 2-5 minutes.
				</p>
				<div className="w-full text-center">
					<button
						className="rounded-lg w-full font-medium px-12 py-3 bg-teal-500 text-white"
						onClick={incrementStep}
					>
						Get Started
					</button>
				</div>
			</div>
		</div>
	</div>
);

export default GettingStrated;
