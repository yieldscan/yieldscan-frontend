import { InputGroup, Input, InputRightElement } from "@chakra-ui/core";
import formatCurrency from "@lib/format-currency";
import { useAccounts } from "@lib/store";
import { get } from "lodash";
import { useState, useEffect } from "react";

const AmountInputDefault = ({
	bonded,
	type,
	value,
	totalUnbonding,
	availableBalance,
	totalUnbondingFiat,
	onChange,
	networkInfo,
}) => {
	const [inputValue, setInputValue] = useState(value.currency);
	const maxAmount =
		type === "bond"
			? availableBalance - networkInfo.reserveAmount < 0
				? 0
				: availableBalance - networkInfo.reserveAmount
			: type === "unbond"
			? bonded
			: totalUnbonding;

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

const AmountInput = ({
	value,
	bonded,
	type,
	totalUnbonding,
	availableBalance,
	totalUnbondingFiat,
	networkInfo,
	onChange,
}) => {
	return (
		<AmountInputDefault
			value={value}
			bonded={bonded}
			type={type}
			onChange={onChange}
			availableBalance={availableBalance}
			totalUnbonding={totalUnbonding}
			totalUnbondingFiat={totalUnbondingFiat}
			networkInfo={networkInfo}
		/>
	);
};

export default AmountInput;
