import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";
import { get } from "lodash";

const getTransactionFee = async (
	networkInfo,
	stakingInfo,
	amount,
	selectedAccount,
	selectedValidators,
	controllerAccount,
	apiInstance
) => {
	const stakingAmount = amount;

	const ysFees = Math.trunc(
		0.00125 * stakingAmount * Math.pow(10, networkInfo.decimalPlaces)
	);

	const nominatedValidators = selectedValidators.map((v) => v.stashId);

	const substrateStashId = encodeAddress(
		decodeAddress(selectedAccount?.address),
		42
	);

	// const substrateControllerId = encodeAddress(
	// 	decodeAddress(controllerAccount?.address),
	// 	42
	// );

	const transactions = [];
	const tranasactionType = stakingInfo?.stakingLedger.active.isEmpty
		? "bond-and-nominate"
		: "nominate";
	if (tranasactionType === "bond-and-nominate") {
		const amount = Math.trunc(stakingAmount * 10 ** networkInfo.decimalPlaces);
		// Hack: here we are always taking compounding on(since it's just for fees calculation)
		transactions.push(
			apiInstance.tx.staking.bond(substrateStashId, amount, "Staked"),
			apiInstance.tx.staking.nominate(nominatedValidators)
		);
	} else if (tranasactionType === "nominate") {
		transactions.push(apiInstance.tx.staking.nominate(nominatedValidators));
	}

	transactions.push(
		// TODO: below is a temp account address, it will be replaced by a multisig account
		apiInstance.tx.balances.transferKeepAlive(
			"5CJmdFKuEiwzhyPRHcyM3mr4hc9VrrWpevQV8GeCKsPXJUha",
			ysFees
		)
	);

	const fees = await apiInstance.tx.utility
		.batchAll(transactions)
		.paymentInfo(substrateStashId);

	const networkFees = fees?.partialFee.toNumber();

	return { ysFees: ysFees, networkFees: networkFees };
};

export default getTransactionFee;
