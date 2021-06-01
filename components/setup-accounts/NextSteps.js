import { useEffect, useState } from "react";
import { Check, ArrowRight } from "react-feather";
import { BottomNextButton } from "./BottomButton";
import Image from "next/image";
import { useRouter } from "next/router";

const NextSteps = () => {
	const router = useRouter();
	return (
		<div className="w-full h-full flex justify-center">
			<div className="w-full grid grid-rows-10 gap-4 justify-items-center items-center content-center">
				<h1 className="text-xl items-center flex p-2 text-gray-700 mb-8">
					Next Steps
				</h1>
				<div className="row-span-7">
					<div className="flex flex-row justify-between items-center space-x-6 ">
						<div className="flex flex-col w-full h-full items-center p-2 text-gray-700 space-y-6">
							<Image
								src="/images/file-check-alt.svg"
								width="60"
								height="60"
								alt="walletIcon"
							/>
							<h1 className="text-lg font-semibold text-center">
								Review your staking preferences
							</h1>
							<p className="text-gray-600 text-xs text-center max-w-xs">
								Review and confirm your staking preferences on the calculator
								page.
							</p>
						</div>
						<ArrowRight size={60} />
						<div className="flex flex-col w-full h-full items-center p-2 text-gray-700 space-y-6">
							<Image
								src="/images/money-withdraw.svg"
								width="60"
								height="60"
								alt="walletIcon"
							/>
							<h1 className="text-lg font-semibold text-center">
								Lock funds for staking
							</h1>
							<p className="text-gray-600 text-xs text-center max-w-xs">
								It is a network requirement to lock your funds to earn staking
								rewards. Unlocking takes 28 days from the day you withhdraw your
								funds.
							</p>
						</div>
						<ArrowRight size={60} />
						<div className="flex flex-col w-full h-full items-center p-2 text-gray-700 space-y-6">
							<Image
								src="/images/coins.svg"
								width="60"
								height="60"
								alt="walletIcon"
							/>
							<h1 className="text-lg font-semibold text-center">
								Delegate your stake
							</h1>
							<p className="text-gray-600 text-xs text-center max-w-xs">
								Now, you just need to delegate your stake to the validators
								recommended by YieldScan.
							</p>
						</div>
					</div>
				</div>
				<div className="row-span-2 flex flex-col text-gray-700 justify-center content-center p-2 items-center text-gray-700 space-y-6 max-w-md mt-16">
					<BottomNextButton
						onClick={() => router.push({ pathname: "/reward-calculator" })}
					>
						Continue
					</BottomNextButton>
				</div>
			</div>
		</div>
	);
};

export default NextSteps;
