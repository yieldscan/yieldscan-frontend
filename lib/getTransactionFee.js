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

	const ysFees = networkInfo.feesEnabled
		? BigInt(
				Math.trunc(
					networkInfo.feesRatio *
						stakingAmount *
						Math.pow(10, networkInfo.decimalPlaces)
				)
		  )
		: 0;

	const nominatedValidators = selectedValidators.map((v) => v.stashId);

	const substrateStashId = encodeAddress(
		decodeAddress(selectedAccount?.address),
		42
	);

	const substrateControllerId = controllerAccount?.address
		? encodeAddress(decodeAddress(controllerAccount?.address))
		: encodeAddress(decodeAddress(selectedAccount?.address));

	const transactions = [];
	const tranasactionType = stakingInfo?.stakingLedger.active.isEmpty
		? "bond-and-nominate"
		: "nominate";
	if (tranasactionType === "bond-and-nominate") {
		const amount = BigInt(
			Math.trunc(stakingAmount * 10 ** networkInfo.decimalPlaces)
		);
		// Hack: here we are always taking compounding on(since it's just for fees calculation)
		transactions.push(
			apiInstance.tx.staking.bond(substrateStashId, amount, "Staked"),
			apiInstance.tx.staking.nominate(nominatedValidators)
		);
	} else if (tranasactionType === "nominate") {
		transactions.push(apiInstance.tx.staking.nominate(nominatedValidators));
	}

	if (networkInfo.feesEnabled) {
		transactions.push(
			// TODO: below is a temp account address, it will be replaced by a multisig account
			apiInstance.tx.balances.transferKeepAlive(
				networkInfo?.feesAddress,
				ysFees
			)
		);
	}

	const fees =
		transactions.length > 1
			? await apiInstance.tx.utility
					.batchAll(transactions)
					.paymentInfo(substrateControllerId)
			: await transactions[0].paymentInfo(substrateControllerId);

	const networkFees = fees?.partialFee.toNumber();

	return networkFees;
};

export default getTransactionFee;
