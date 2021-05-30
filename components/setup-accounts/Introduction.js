import { Check, ChevronDown } from "react-feather";
import { Collapse } from "@chakra-ui/core";
import { BottomBackButton, BottomNextButton } from "./BottomButton";
import { useState } from "react";

const begginerInfo = [
	"Make sure you have at least 10 DOT in your main wallet",
	"Create a controller account using the PolkadotJS browser extension to securely manage your staking activities",
	"Connect your ledger wallet through PolkadotJS",
];

const Introduction = ({ decrementStep, incrementCurrentStep }) => {
	const [infoIndex, setInfoIndex] = useState();
	const [isOpen, setIsOpen] = useState(false);
	const handleOnClick = (info) => {
		if (isOpen) {
			infoIndex !== info ? setInfoIndex(info) : setIsOpen(false);
		} else {
			setIsOpen(true);
			setInfoIndex(info);
		}
	};
	return (
		<div className="flex-1 w-full max-w-2xl flex flex-col text-gray-700 justify-center p-4 text-gray-700 space-y-6 mb-32">
			<div>
				<h1 className="text-2xl font-semibold">
					Introduction to staking with ledger
				</h1>
				<p className="text-gray-600 text-sm max-w-md">
					Let’s get your staking setup ready!
				</p>
			</div>
			<div className="space-y-2">
				<h2 className="text-xl font-semibold">Before you begin</h2>
				<div className="w-full space-y-2">
					{begginerInfo.map((info, index) => (
						<div className="grid grid-cols-10 items-center">
							<div className="grid justify-items-center">
								<Check
									className="p-1 mr-2 rounded-full text-white bg-teal-500 bg-opacity-100"
									strokeWidth="4px"
								/>
							</div>
							<div className="col-span-9 flex w-full max-w-xl flex-col rounded-lg text-sm border p-4">
								<button
									onClick={() => handleOnClick(index)}
									className="grid grid-cols-10 gap-2 w-full text-gray-600 justify-between items-center"
								>
									<p className="text-justify col-span-9 max-w-lg">{info}</p>
									<div className="w-full grid justify-items-end">
										<ChevronDown
											size={16}
											className={`transition ease-in-out duration-500 ${
												false && "transform rotate-180"
											}`}
										/>
									</div>
								</button>
								<Collapse isOpen={isOpen && infoIndex === index}>
									<p className="text-xs">Content</p>
								</Collapse>
							</div>
						</div>
					))}
				</div>
			</div>
			<div className="w-full flex flex-row text-center space-x-3">
				<BottomBackButton
					onClick={() => {
						decrementStep();
					}}
				>
					Go Back
				</BottomBackButton>
				<BottomNextButton
					onClick={() => {
						incrementCurrentStep();
					}}
				>
					Next
				</BottomNextButton>
			</div>
		</div>
	);
};
export default Introduction;
