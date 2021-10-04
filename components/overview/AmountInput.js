import { InputGroup, Input, InputRightElement } from "@chakra-ui/core";
import formatCurrency from "@lib/format-currency";
import { isNil } from "lodash";
import { useState, useEffect } from "react";

const AmountInput = ({
	value,
	bonded,
	type,
	totalUnbonding,
	availableBalance,
	networkInfo,
	onChange,
}) => {
	const maxAmount =
		type === "bond"
			? availableBalance / (1 + networkInfo.feesRatio) <
			  networkInfo.reserveAmount / 2
				? 0
				: availableBalance / (1 + networkInfo.feesRatio) -
				  networkInfo.reserveAmount / 2
			: type === "unbond"
			? bonded
			: totalUnbonding;

	const [inputValue, setInputValue] = useState(value.currency);

	const handleChange = (value) => {
		onChange(Number(value));
		setInputValue(value);
	};

	useEffect(() => {
		if (maxAmount) handleChange(maxAmount);
	}, [maxAmount]);

	return (
		<InputGroup className="rounded-full">
			<Input
				type="number"
				rounded="full"
				autoFocus={true}
				pt={6}
				pb={10}
				px={4}
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
				isInvalid={
					isNil(value?.currency) ||
					value.currency === "" ||
					value?.currency <= 0 ||
					value?.currency > maxAmount
				}
				errorBorderColor="crimson"
				color="gray.600"
			/>
			<h6
				className={`absolute z-20 bottom-0 left-0 ml-4 mb-3 text-xs text-gray-600 cursor-not-allowed opacity-1"
				}`}
			>
				${formatCurrency.methods.formatNumber(value.subCurrency.toFixed(2))}
			</h6>
			<InputRightElement
				opacity="1"
				h="full"
				rounded="full"
				fontSize="xl"
				w="fit-content"
				px={4}
			>
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
			</InputRightElement>
		</InputGroup>
	);
};

export default AmountInput;
