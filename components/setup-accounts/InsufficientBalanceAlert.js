import { AlertTriangle } from "react-feather";

const InsufficientBalanceAlert = () => (
	<div className="flex flex-row justify-between items-center bg-red-200 text-xs text-gray-700 p-4 rounded-lg">
		<div className="flex flex-row space-x-2">
			<AlertTriangle size={18} />
			<p>
				<span className="font-semibold">Insufficient Balance:</span> Either
				select a different account or add more funds to this to proceed ahead.
			</p>
		</div>
	</div>
);

export default InsufficientBalanceAlert;
