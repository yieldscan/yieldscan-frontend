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
				<div className="video-container">
					<iframe
						width="560"
						height="315"
						src="https://www.youtube.com/embed/fd9wDFD1R_g"
						title="YouTube video player"
						frameBorder="0"
						allowFullScreen
					></iframe>
				</div>
			</div>
			<div className="w-full flex flex-row justify-start">
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
