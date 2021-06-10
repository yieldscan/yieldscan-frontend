import { ArrowRight, ArrowUpRight, Check, ChevronDown } from "react-feather";
import { Collapse } from "@chakra-ui/core";
import {
	BackButtonContent,
	BottomBackButton,
	BottomNextButton,
	NextButtonContent,
} from "./BottomButton";
import { useState } from "react";

const begginerInfo = [
	"Make sure you have at least 10 DOT in your main wallet",
	"Create a controller account using the PolkadotJS browser extension to securely manage your staking activities",
	"Connect your ledger wallet through PolkadotJS",
];

const MinAmountInfo = () => (
	<div>
		<p className="mt-4 text-xs text-gray-600">
			We strongly advise you to have at least 10 DOTs in your staking wallet
			before proceeding. Any amount smaller than this will end up in a net loss
			for you, as you’ll end up paying more in transaction fees than you will
			earn as reward.
		</p>
		<button
			className="flex flex-row space-x-2 items-center rounded-lg font-medium p-3 border border-gray-700 mt-4"
			// onClick={}
		>
			<span>Get DOT</span>
			<ArrowUpRight size={18} />
		</button>
	</div>
);

const ConnectInfo = () => (
	<div>
		<p className="mt-4 text-xs text-gray-600">
			To use ledger devices, we recommend connecting them through your
			PolkadotJS extension. Check out the help article linked below to get
			started.
		</p>
		<button
			className="flex flex-row space-x-2 items-center rounded-lg font-medium p-3 border border-gray-700 mt-4"
			// onClick={}
		>
			<span>Connect your ledger to PolkadotJS</span>
			<ArrowUpRight size={18} />
		</button>
	</div>
);

const ControllerInfo = () => (
	<div>
		<p className="mt-4 text-xs font-semibold text-gray-700">
			WTF is a controller?
		</p>
		<p className="mt-4 text-xs text-gray-600">
			Your controller is an account which acts on behalf of your main wallet to
			participate in staking activities, without being able to access those
			funds. In other words, it “controls” your staking activities, but CANNOT
			access the funds in your main wallet.
		</p>
		<p className="mt-4 text-xs font-semibold text-gray-700">
			Why should I use one?
		</p>
		<p className="text-xs text-gray-600">
			Using a separate controller is great for security because it only needs
			enough funds to pay for fees. So, if somehow your controller gets
			compromised, the loss would be limited to controller and your main wallet
			with your savings will be safe. <br />
			<br />
			For hardware wallet users, this is also great for accessibility, because
			you don’t need to connect your main wallet every time you need to make a
			small change to your staking preference.
		</p>
		<p className="mt-4 text-xs text-gray-600">
			<span className="font-semibold text-gray-700">PLEASE NOTE</span> that it
			is recommended to have enough funds in your controller to pay for a few
			transactions, but it should NOT be used to store large amounts or life
			savings. Think pocket wallet as opposed to a safe or savings vault.
			Curious to learn futher? Check out the official Polkadot Wiki for more
			information.
		</p>
		<button
			className="flex flex-row space-x-2 items-center rounded-lg font-medium p-3 border border-gray-700 mt-4"
			// onClick={}
		>
			<span>Setup your controller</span>
			<ArrowUpRight size={18} />
		</button>
	</div>
);

const ContentArr = ({ index }) => {
	return index === 0 ? (
		<MinAmountInfo />
	) : index === 1 ? (
		<ControllerInfo />
	) : (
		<ConnectInfo />
	);
};

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
		<div className="flex-1 w-full max-w-2xl grid grid-rows-4 text-gray-700 p-4 text-gray-700">
			<div className="w-full h-full flex flex-col justify-center">
				<h1 className="w-full text-2xl font-semibold">
					Introduction to staking with ledger
				</h1>
				<p className="w-full text-gray-600 text-sm">
					Let’s get your staking setup ready!
				</p>
			</div>
			<div className="row-span-2 w-full h-64 max-h-12 overflow-y-scroll space-y-2">
				<h2 className="text-xl font-semibold">Before you begin</h2>
				<div className="w-full space-y-2">
					{begginerInfo.map((info, index) => (
						<div key={index} className="grid grid-cols-10">
							<div className="grid p-4">
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
									<ContentArr index={index} />
								</Collapse>
							</div>
						</div>
					))}
				</div>
			</div>
			<div className="w-full flex flex-row justify-start space-x-3">
				<div>
					<BottomBackButton
						onClick={() => {
							decrementStep();
						}}
					>
						<BackButtonContent />
					</BottomBackButton>
				</div>
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
export default Introduction;
