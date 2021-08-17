import { get, isNil } from "lodash";
import { HelpCircle, ChevronDown } from "react-feather";
import {
	Popover,
	PopoverTrigger,
	PopoverBody,
	PopoverContent,
	PopoverArrow,
} from "@chakra-ui/core";
import CountUp from "react-countup";
import { useCoinGeckoPriceUSD } from "@lib/store";

const ResultCardInsight = ({
	label,
	popoverContent = "",
	value,
	supportValue,
	placement = "top",
	emptyState,
}) => (
	<div className="mt-2 mr-8">
		<div className="flex items-center">
			<span className="opacity-75 mr-1 text-xs">{label}</span>
			<Popover trigger="hover" placement={placement}>
				<PopoverTrigger>
					<HelpCircle
						size="12"
						cursor="help"
						opacity="0.5"
						fill="white"
						stroke="#2bcaca"
					/>
				</PopoverTrigger>
				<PopoverContent
					zIndex={50}
					_focus={{ outline: "none" }}
					bg="gray.600"
					border="none"
				>
					<PopoverArrow />
					<PopoverBody>{popoverContent}</PopoverBody>
				</PopoverContent>
			</Popover>
		</div>
		{emptyState ? (
			<h3 className="text-center">-</h3>
		) : (
			<>
				<h3 className="font-medium -mb-1">{value}</h3>
				<span className="text-xs">{supportValue}</span>
			</>
		)}
	</div>
);

const ExpectedReturnsCard = ({ result, networkInfo }) => {
	const { coinGeckoPriceUSD } = useCoinGeckoPriceUSD();
	const returns = {
		currency: get(result, "returns.currency"),
	};

	const portfolio = {
		currency: get(result, "portfolioValue.currency"),
	};

	return (
		<>
			<div className="relative rounded-xl bg-teal-500 shadow-teal text-white p-8">
				<h1 className="font-semibold text-xl">Expected Results</h1>
				<div className="flex flex-col mt-2">
					<div className="flex mt-2">
						<ResultCardInsight
							label="Estimated Returns"
							value={
								<CountUp
									end={returns.currency || 0}
									duration={0.5}
									decimals={3}
									separator=","
									suffix={` ${networkInfo.denom}`}
									preserveValue
								/>
							}
							supportValue={
								<CountUp
									end={returns.currency * coinGeckoPriceUSD || 0}
									duration={0.5}
									decimals={2}
									separator=","
									prefix="$"
									suffix=" USD"
									preserveValue
								/>
							}
							emptyState={!result.returns}
							popoverContent={
								<p className="text-xs text-white text-center">
									These returns are calculated for your entered stake amount,
									time period and risk preference. To learn about how we
									calculate these returns{" "}
									<a
										href="https://github.com/buidl-labs/yieldscan-frontend/wiki/Returns-Calculation-Mechanism"
										target="_blank"
										rel="noreferrer"
										className="underline"
									>
										click here
									</a>
									.
								</p>
							}
						/>
						<ResultCardInsight
							label="Estimated Portfolio Value"
							value={
								<CountUp
									end={portfolio.currency || 0}
									duration={0.5}
									decimals={3}
									separator=","
									suffix={` ${networkInfo.denom}`}
									preserveValue
								/>
							}
							supportValue={
								<CountUp
									end={portfolio.currency * coinGeckoPriceUSD || 0}
									duration={0.5}
									decimals={2}
									separator=","
									prefix="$"
									suffix=" USD"
									preserveValue
								/>
							}
							emptyState={!result.returns}
							popoverContent={
								<p className="text-xs text-white text-center">
									This is the estimated value of your staking portfolio based on
									your inputs. It is the sum of your staking amount and your
									expected returns.
								</p>
							}
						/>
					</div>
					<ResultCardInsight
						label="Estimated Yield"
						value={
							<CountUp
								end={result.yieldPercentage || 0}
								duration={0.5}
								decimals={2}
								suffix="%"
								preserveValue
							/>
						}
						emptyState={isNil(result.yieldPercentage)}
						popoverContent={
							<p className="text-xs text-white text-center">
								This is the expected percentage return for the time period you
								entered.
							</p>
						}
					/>
				</div>
				{/* <div className="flex mt-4">
					<button
						className={`
						rounded-full font-semibold text-lg mt-5 px-8 py-3 bg-white text-teal-500
						${
							stashAccount && calculationDisabled
								? "opacity-75 cursor-not-allowed"
								: "opacity-100"
						}
					`}
						disabled={false && stashAccount && calculationDisabled}
						onClick={() =>
							stashAccount ? onPayment() : onWalletConnectClick()
						}
					>
						{stashAccount ? "Stake" : "Connect Wallet to Stake"}
					</button>
				</div> */}
				{/* <div className="absolute bg-white h-16 w-16 -ml-8 mt-4 rounded-full text-gray-900 flex items-center justify-center shadow-teal left-50">
					<ChevronDown />
				</div> */}
			</div>
		</>
	);
};

export default ExpectedReturnsCard;
