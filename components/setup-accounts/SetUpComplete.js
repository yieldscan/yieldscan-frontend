import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Check } from "react-feather";
import { BottomNextButton } from "../common/BottomButton";

const SetUpComplete = ({ incrementStep, isNewSetup, setIsNewSetup }) => {
	const router = useRouter();
	const [startTimeMS, setStartTimeMS] = useState(() => new Date().getTime());
	const timerStep = 5000;
	const [remaining, setRemaining] = useState(timerStep);

	useEffect(() => {
		setStartTimeMS(() => new Date().getTime());
		let timer = setTimeout(() => incrementStep(), timerStep);
		return () => {
			clearTimeout(timer);
		};
	}, []);

	useEffect(() => {
		const intervalId = setInterval(() => {
			const current = new Date().getTime();

			const remaining = parseInt(
				Math.max((timerStep - (current - startTimeMS)) / 1000, 0)
			);
			setRemaining(remaining);
		}, 300);

		return () => clearInterval(intervalId); //This is important
	}, []);

	const handleOnClick = () => {
		incrementStep();
	};

	return (
		<div className="w-full h-full flex justify-center">
			<div className="w-full max-w-65-rem grid grid-rows-4 gap-4 justify-items-center items-center content-center">
				<div className="grid-1 row-span-3">
					<div className="flex flex-col w-full h-full items-center p-2 text-gray-700 space-y-6">
						<Check
							className="p-1 mr-2 rounded-full border-4 border-teal-500 text-teal-500 bg-opacity-100"
							strokeWidth="4px"
							size="60px"
						/>
						<h1 className="text-2xl font-semibold text-center">
							Accounts setup complete
						</h1>
						<p className="text-gray-600 text-sm text-center max-w-md">
							{isNewSetup
								? "Your account is succesfully set up. You can continue to review your staking preferences before locking your funds to stake."
								: "Your account is succesfully set up. Now, you can take the next steps to stake!"}
						</p>
					</div>
				</div>
				{isNewSetup ? (
					<BottomNextButton
						onClick={() => {
							router.back();
							// setIsNewSetup(false);
						}}
					>
						Continue
					</BottomNextButton>
				) : (
					<div className="flex flex-col text-gray-700 justify-center content-center p-2 items-center text-gray-700 space-y-6 max-w-md">
						<p className="text-gray-600 text-sm text-center max-w-md">
							{`You will be automatically redirected to the next steps in ${remaining} seconds.`}{" "}
							<span>
								<span
									className="text-teal-500 underline cursor-pointer"
									onClick={() => handleOnClick()}
								>
									Click here
								</span>{" "}
								if you’re not automatically redirected
							</span>
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default SetUpComplete;
