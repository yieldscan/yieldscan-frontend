import { web3FromAddress } from "@polkadot/extension-dapp";
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";
import { WsProvider, ApiPromise } from "@polkadot/api";

// Stash-Controller 1:1 relationship

// Polkadot API uses it in browser, we let it remain mad :]
window.setImmediate = (cb) => cb();

// TODO: error handling -> balance check, basics.
const getUpdateFundsTransactionFee = async (
	stashId,
	amount,
	type,
	bondedAmount,
	api,
	networkInfo
) => {
	if (!stashId || !amount || !api) {
		throw new Error({ message: "Incomplete argument list to stake!" });
	}

	const substrateStashId = encodeAddress(decodeAddress(stashId), 42);
	// const substrateControllerId = encodeAddress(decodeAddress(controllerId), 42);

	// const ledger = await api.query.staking.ledger(substrateControllerId);

	const transactions = [];

	const rawAmount = Math.trunc(
		amount * Math.pow(10, networkInfo.decimalPlaces)
	);

	if (type === "bond") {
		if (bondedAmount == 0) {
			const commission = Math.trunc(
				rawAmount *networkInfo.commissionRatio
			);
			transactions.push(
				api.tx.staking.bond(substrateStashId, rawAmount, 0),
				api.tx.balances.transferKeepAlive(networkInfo.collectionAddress, yieldscanCommission),
				api.tx.system.remark("Sent with YieldScan")
			);
			const bondFee = await api.tx.utility.batchAll(transactions).paymentInfo(substrateStashId);
			return bondFee.partialFee.toNumber();
		} else {
			const yieldscanCommission = Math.trunc(
				rawAmount *networkInfo.commissionRatio
			);
			transactions.push(
				api.tx.staking.bondExtra(rawAmount),
				api.tx.balances.transferKeepAlive(networkInfo.collectionAddress, yieldscanCommission),
				api.tx.system.remark("Sent with YieldScan")
			);
			
			const bondExtraFee = await api.tx.utility.batchAll(transactions).paymentInfo(substrateStashId);
			return bondExtraFee.partialFee.toNumber();
		}
	} else if (type == "rebond") {
		const yieldscanCommission = Math.trunc(
			rawAmount *networkInfo.commissionRatio
		);
		transactions.push(
			api.tx.staking.rebond(rawAmount),
			api.tx.balances.transferKeepAlive(networkInfo.collectionAddress, yieldscanCommission),
			api.tx.system.remark("Sent with YieldScan")
		);
		const rebondFee = await api.tx.utility.batchAll(transactions).paymentInfo(substrateStashId);
		return rebondFee.partialFee.toNumber();
	} else {
		const yieldscanCommission = Math.trunc(
			rawAmount *networkInfo.commissionRatio
		);
		transactions.push(
			api.tx.staking.unbond(rawAmount),
			api.tx.balances.transferKeepAlive(networkInfo.collectionAddress, yieldscanCommission),
			api.tx.system.remark("Sent with YieldScan")
		);
		const unbondFee = await api.tx.utility.batchAll(transactions).paymentInfo(substrateStashId);
		return unbondFee;
	}
};

export default getUpdateFundsTransactionFee;
