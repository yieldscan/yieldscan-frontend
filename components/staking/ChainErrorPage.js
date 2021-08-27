const { AlertOctagon } = require("react-feather");
import CheckCard from "./CheckCard";

const ChainErrorPage = ({
	setStakingPath,
	networkInfo,
	initialStakingPath,
}) => {
	return (
		<div className="flex-1 w-full h-full flex flex-col text-gray-700 justify-center items-center">
			<div className="flex-1 flex flex-col justify-center items-center max-w-xl space-y-6">
				<div className="flex flex-row items-center justify-center space-x-4">
					<div>
						<AlertOctagon size={60} color={"red"} />
					</div>
					<p className="text-xl font-semibold max-w-sm">
						Oops! The transaction has failed...
					</p>
				</div>
				<div className="w-full flex flex-col">
					<p className="w-full text-gray-700 p-2">
						Here’s a few things you should check:
					</p>
					<div className="w-full flex flex-col space-y-2 p-2">
						<CheckCard
							content="Make sure you’re running the latest version of your browser."
							textSize="md"
						/>
					</div>
				</div>
				<div className="w-full flex flex-col">
					<p className="w-full text-gray-700 p-2">
						For ledger hardware wallet users:
					</p>
					<div className="w-full flex flex-col space-y-2 p-2">
						<CheckCard
							content={`Make sure you’ve updated the ${networkInfo.name} Ledger Application.`}
							textSize="md"
						/>
						<CheckCard
							content="Check if your ledger live desktop application is open, as this may lead to connection issues."
							textSize="md"
						/>
					</div>
				</div>
				<div className="flex w-full flex-row space-x-4 justify-center items-center">
					<button
						className="w-full rounded-lg max-w-xs font-medium p-3 bg-teal-500 text-white"
						onClick={() => {
							setStakingPath(initialStakingPath);
						}}
					>
						Retry
					</button>
					<button
						className="w-full rounded-lg max-w-xs font-medium p-3 text-teal-500 border border-teal-500 text-white"
						onClick={() =>
							window?.open("https://discord.gg/nQYhcg9RPU", "_blank")
						}
					>
						No? Contact Us
					</button>
				</div>
			</div>
		</div>
	);
};

export default ChainErrorPage;
