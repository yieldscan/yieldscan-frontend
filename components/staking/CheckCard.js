import { Check } from "react-feather";

const CheckCard = ({ content, textSize = "xs", fontWeight = "light" }) => (
	<div className="w-full flex flex-row items-center text-gray-700 space-x-2">
		<div>
			<Check className="border-2 rounded-full border-gray-700 p-1 h-6 w-6" />
		</div>
		<p className={`text-${textSize} font-${fontWeight}`}>{content}</p>
	</div>
);

export default CheckCard;
