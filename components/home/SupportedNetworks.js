import Image from "next/image";
import { Fragment } from "react";

const supportedNetworks = ["kusama", "polkadot"];

const SupportedNetworks = () => {
	return (
		<Fragment>
			<h1 className="text-3xl text-gray-700 font-bold text-center mb-16">
				Networks you can start investing in now
			</h1>
			<div className="flex justify-center">
				{/* TODO: fix image alignements */}
				{supportedNetworks.map((network) => (
					<div key={network} className="mx-12 mb-16">
						<Image
							src={`/images/${network}-logo.png`}
							alt={`${network}-logo`}
							height="64"
							width="64"
							className="rounded-full shadow-custom border border-gray-200"
						/>
						<p className="capitalize text-gray-700 mt-4">{network}</p>
					</div>
				))}
			</div>
		</Fragment>
	);
};

export default SupportedNetworks;
