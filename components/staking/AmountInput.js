import { InputGroup, Input, InputRightElement } from "@chakra-ui/core";
import formatCurrency from "@lib/format-currency";
import { useAccounts } from "@lib/store";
import { get } from "lodash";
import { useState, useEffect } from "react";

const AmountInputDefault = ({
	value,
	availableBalance,
	onChange,
	networkInfo,
}) => {
	const [inputValue, setInputValue] = useState(value);
	const maxAmount = availableBalance - networkInfo.minAmount;

	// useEffect(() => {
	// 	if (bonded) {
	// 		onChange(bonded);
	// 		setInputValue(Number(Math.max(bonded, 0)));
	// 	}
	// }, [bonded]);

	const handleChange = (value) => {
		onChange(Number(value));
		setInputValue(value);
	};

	return (
		<InputGroup className="rounded-full">
			<Input
				type="number"
				rounded="lg"
				alignItems="center"
				autoFocus={true}
				p={8}
				pr={inputValue === maxAmount ? 8 : 24}
				textOverflow="ellipsis"
				placeholder={0}
				value={inputValue}
				onChange={(e) => {
					const { value } = e.target;
					handleChange(value);
				}}
				border="none"
				fontSize="lg"
				color="gray.600"
			/>
			{/* <h6
				className={`absolute z-20 bottom-0 left-0 ml-4 mb-3 text-xs text-gray-600 cursor-not-allowed opacity-1"
				}`}
			>
				${formatCurrency.methods.formatNumber(value.subCurrency.toFixed(2))}
			</h6> */}
			<InputRightElement
				opacity="1"
				children={
					<span className="flex min-w-fit-content">
						{inputValue !== maxAmount && (
							<button
								className="bg-teal-200 text-teal-500 rounded-full text-xs px-2"
								onClick={() => {
									handleChange(maxAmount);
								}}
							>
								max
							</button>
						)}
						<span className="ml-2 text-sm font-medium cursor-not-allowed text-gray-700">
							{networkInfo.denom}
						</span>
					</span>
				}
				h="full"
				rounded="full"
				fontSize="xl"
				w="fit-content"
				px={4}
			/>
		</InputGroup>
	);
};

const AmountInput = ({ value, availableBalance, networkInfo, onChange }) => {
	return (
		<AmountInputDefault
			value={value}
			onChange={onChange}
			availableBalance={availableBalance}
			networkInfo={networkInfo}
		/>
	);
};

export default AmountInput;
