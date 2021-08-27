import { InputGroup, Input, InputRightElement } from "@chakra-ui/core";
import { useState, useEffect } from "react";

const AmountInput = ({
	transferFundsAmount,
	senderBalances,
	senderAccount,
	networkInfo,
	setTransferFundsAmount,
	controllerBalances,
	apiInstance,
	isLowAmount,
}) => {
	const [inputValue, setInputValue] = useState(0);
	const maxAmount = Math.max(
		(senderBalances?.availableBalance -
			2 * apiInstance?.consts.balances.existentialDeposit.toNumber()) /
			Math.pow(10, networkInfo.decimalPlaces),
		0
	);

	useEffect(() => {
		setInputValue(
			transferFundsAmount / Math.pow(10, networkInfo.decimalPlaces)
		);
	}, [transferFundsAmount]);

	const handleChange = (data) => {
		setTransferFundsAmount(() =>
			Math.trunc(data * Math.pow(10, networkInfo.decimalPlaces))
		);
		// setInputValue(data);
	};

	return (
		<div className="w-full">
			<InputGroup>
				<Input
					type="number"
					rounded="lg"
					alignItems="center"
					autoFocus={true}
					p={8}
					pr={inputValue === maxAmount ? 8 : 24}
					textOverflow="ellipsis"
					placeholder={0}
					value={inputValue === 0 ? "" : inputValue}
					onChange={(e) => {
						const { value } = e.target;
						handleChange(value);
					}}
					// border="none"
					fontSize="lg"
					color="gray.600"
					isInvalid={isLowAmount}
					errorBorderColor="crimson"
				/>
				<InputRightElement
					opacity="1"
					h="full"
					rounded="full"
					fontSize="xl"
					w="fit-content"
					px={4}
				>
					<span className="flex min-w-fit-content">
						{inputValue !== maxAmount && senderAccount && (
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
		</div>
	);
};

export default AmountInput;
