import { memo, useState, useEffect } from "react";
import {
	InputGroup,
	Spinner,
	Input,
	InputRightElement,
	Icon,
} from "@chakra-ui/core";
import formatCurrency from "@lib/format-currency";
import { useSelectedAccount, useCoinGeckoPriceUSD } from "@lib/store";
import { get, isEmpty, isNil } from "lodash";

const AmountInputDefault = memo(
	({
		bonded,
		selectedAccount,
		availableBalance,
		vestingLocked,
		value,
		onChange,
		networkInfo,
		trackRewardCalculatedEvent,
		coinGeckoPriceUSD,
	}) => {
		// const initiallyEditable =
		// 	bonded === undefined ? true : bonded == 0 ? true : false;
		const [isEditable, setIsEditable] = useState(true);
		const [inputValue, setInputValue] = useState(value.currency);
		const maxAmount = Math.max(
			availableBalance <= networkInfo.minAmount
				? bonded
				: bonded + availableBalance - networkInfo.minAmount,
			0
		);

		useEffect(() => {
			const initiallyEditable =
				bonded === undefined ? true : bonded == 0 ? true : false;
			setIsEditable(initiallyEditable);
		}, [bonded]);

		useEffect(() => {
			if (bonded) {
				onChange(bonded);
				setInputValue(Number(Math.max(bonded, 0)));
			}
		}, [bonded]);

		const handleChange = (value) => {
			onChange(value);
			setInputValue(value);
			trackRewardCalculatedEvent({
				investmentAmount: `${value} ${networkInfo.denom}`,
			});
		};

		return (
			<div>
				<div className="flex items-center justify-between w-2/3">
					<InputGroup className={`border border-gray-200 rounded-full`}>
						<Input
							type="number"
							rounded="full"
							pt={6}
							pb={10}
							px={4}
							pr={inputValue === maxAmount ? 8 : 24}
							textOverflow="ellipsis"
							placeholder="0"
							value={inputValue}
							onChange={(e) => {
								const { value } = e.target;
								handleChange(value);
							}}
							border="none"
							fontSize="lg"
							isInvalid={isNil(value?.currency) || value.currency === ""}
							errorBorderColor="crimson"
							isDisabled={!isEditable}
							backgroundColor={!isEditable && "gray.200"}
							color="gray.600"
						/>
						<h6
							className={`absolute z-20 bottom-0 left-0 ml-4 mb-3 text-xs text-gray-600 cursor-not-allowed ${
								isEditable ? "opacity-1" : "opacity-25"
							}`}
						>
							$
							{formatCurrency.methods.formatNumber(
								(value.currency * coinGeckoPriceUSD).toFixed(2)
							)}
						</h6>
						<InputRightElement
							opacity={isEditable ? "1" : "0.4"}
							children={
								<span className="flex min-w-fit-content">
									{value?.currency === "" && (
										<Icon name="warning" color="red.500" marginRight="4px" />
									)}
									{selectedAccount && inputValue !== maxAmount && (
										<button
											className={`bg-teal-200 text-teal-500 rounded-full text-xs px-2 ${
												!isEditable && "opacity-0 cursor-not-allowed"
											}`}
											disabled={!isEditable}
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
				</div>
				{(bonded && (
					<button
						className="mt-2 py-2 px-4 shadow-custom rounded-full text-xs border border-gray-200"
						onClick={() => {
							if (isEditable) {
								handleChange(bonded);
							}
							setIsEditable(!isEditable);
						}}
					>
						{isEditable ? "Use Currently Bonded Amount" : "Use Custom Amount"}
					</button>
				)) ||
					""}
			</div>
		);
	}
);

const AmountInputAccountInfoLoading = memo(
	({
		value,
		onChange,
		networkInfo,
		selectedAccount,
		trackRewardCalculatedEvent,
		coinGeckoPriceUSD,
	}) => {
		const [inputValue, setInputValue] = useState(value.currency);

		const handleChange = (value) => {
			onChange(value);
			setInputValue(value);
			trackRewardCalculatedEvent({
				investmentAmount: `${value} ${networkInfo.denom}`,
			});
		};

		return (
			<div>
				<div className="flex items-center justify-between w-full">
					<InputGroup className="border border-gray-200 rounded-full">
						<Input
							type="number"
							rounded="full"
							pt={6}
							pb={10}
							px={4}
							pr={24}
							textOverflow="ellipsis"
							placeholder="0"
							value={inputValue}
							onChange={(e) => {
								const { value } = e.target;
								handleChange(value);
							}}
							border="none"
							fontSize="lg"
							isInvalid={isNil(value?.currency) || value.currency === ""}
							errorBorderColor="crimson"
							isDisabled={selectedAccount && true}
							backgroundColor={selectedAccount && "gray.200"}
							color="gray.600"
						/>
						<h6
							className={`absolute z-20 bottom-0 left-0 ml-4 mb-3 text-xs text-gray-600 ${
								selectedAccount ? "opacity-25 cursor-not-allowed" : "opacity-1"
							}`}
						>
							$
							{formatCurrency.methods.formatNumber(
								(value.currency * coinGeckoPriceUSD).toFixed(2)
							)}
						</h6>
						<InputRightElement
							// opacity="0.4"
							h="full"
							rounded="full"
							fontSize="xl"
							w="fit-content"
							px={4}
						>
							{value?.currency === "" && (
								<Icon
									opacity="1"
									name="warning"
									color="red.500"
									marginRight="4px"
								/>
							)}
							<span className="flex min-w-fit-content">
								<span className="ml-2 text-sm font-medium cursor-not-allowed text-gray-700 opacity-25">
									{networkInfo.denom}
								</span>
							</span>
						</InputRightElement>
					</InputGroup>
					{selectedAccount && (
						<div className="ml-4 text-gray text-xs flex inline">
							Loading...
							<div className="ml-2">
								<Spinner
									thickness="2px"
									speed="0.65s"
									emptyColor="gray.200"
									color="blue.500"
									size="sm"
								/>
							</div>
						</div>
					)}
				</div>
			</div>
		);
	}
);

const AmountInput = memo(
	({
		value,
		networkInfo,
		onChange,
		trackRewardCalculatedEvent,
		balance,
		stakingBalance,
	}) => {
		const { selectedAccount } = useSelectedAccount();
		const { coinGeckoPriceUSD } = useCoinGeckoPriceUSD();
		return (
			<div className="w-4/5">
				{/* {get(bonded, 'currency') ? (
				<AmountInputAlreadyBonded
					value={value}
					bonded={bonded}
					total={{
						currency: Number(((value.currency || 0) + bonded.currency).toFixed(4)),
						subCurrency: Number((value.subCurrency + bonded.subCurrency).toFixed(4)),
					}}
					onChange={onChange}
				/>
			): ( */}
				{stakingBalance && balance ? (
					<AmountInputDefault
						value={value}
						selectedAccount={selectedAccount}
						bonded={
							stakingBalance?.stakingLedger?.active /
							Math.pow(10, networkInfo.decimalPlaces)
						}
						onChange={onChange}
						availableBalance={
							parseInt(balance?.availableBalance) /
							Math.pow(10, networkInfo.decimalPlaces)
						}
						vestingLocked={
							parseInt(balance?.vestingLocked) /
							Math.pow(10, networkInfo.decimalPlaces)
						}
						networkInfo={networkInfo}
						trackRewardCalculatedEvent={trackRewardCalculatedEvent}
						coinGeckoPriceUSD={coinGeckoPriceUSD}
					/>
				) : (
					<AmountInputAccountInfoLoading
						value={value}
						selectedAccount={selectedAccount}
						onChange={onChange}
						networkInfo={networkInfo}
						trackRewardCalculatedEvent={trackRewardCalculatedEvent}
						coinGeckoPriceUSD={coinGeckoPriceUSD}
					/>
				)}
			</div>
		);
	}
);

export default AmountInput;
