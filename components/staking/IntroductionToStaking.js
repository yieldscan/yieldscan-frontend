import { BottomNextButton, NextButtonContent } from "../common/BottomButton";
const IntroductionToStaking = ({ incrementCurrentStep }) => {
	return (
		<div className="w-full flex flex-col text-gray-700 p-4 text-gray-700 space-y-6">
			<div className="w-full flex flex-col justify-center">
				<h1 className="w-full text-2xl font-semibold">
					Introduction to secure staking
				</h1>
				<p className="w-full text-gray-600 text-sm">
					Let’s get your staking setup ready!
				</p>
			</div>
			<div className="w-full space-y-4">
				<h2 className="text-xl font-semibold">
					Learn what makes a secure staking setup
				</h2>

				<iframe
					width="420"
					height="280"
					src="https://www.youtube.com/embed/N8V4D2PpuLk"
					title="YouTube video player"
					frameBorder="0"
					// allow="autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowFullScreen
				></iframe>
			</div>
			<div className="w-full flex flex-row justify-start">
				{/* <div>
					<BottomBackButton
						onClick={() => {
							decrementStep();
						}}
					>
						<BackButtonContent />
					</BottomBackButton>
				</div> */}
				<div>
					<BottomNextButton
						onClick={() => {
							incrementCurrentStep();
						}}
					>
						<NextButtonContent />
					</BottomNextButton>
				</div>
			</div>
		</div>
	);
};

export default IntroductionToStaking;
