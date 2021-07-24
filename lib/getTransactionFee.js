import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";

// Stash-Controller 1:1 relationship

// Polkadot API uses it in browser, we let it remain mad :]
window.setImmediate = (cb) => cb();

// TODO: error handling -> balance check, basics.
const getTransactionFee = async (
	stashId,
	controllerId,
	stakeAmount,
	bondedAmount,
	payee,
	nominatedValidators = [],
	api,
	networkInfo
) => {
	if (
		!stashId ||
		!controllerId ||
		!stakeAmount ||
		!nominatedValidators ||
		payee === (undefined || null) ||
		!api
	) {
		throw new Error({ message: "Incomplete argument list to stake!" });
	}

	const substrateStashId = encodeAddress(decodeAddress(stashId), 42);
	const substrateControllerId = encodeAddress(decodeAddress(controllerId), 42);

	const ledger = await api.query.staking.ledger(substrateControllerId);

	const transactions = [];
	if (ledger.isSome) {
		if (stakeAmount > bondedAmount) {
			const amount =
				(stakeAmount - bondedAmount) * 10 ** networkInfo.decimalPlaces; // 12 decimal places
			
			const yieldscanCommission = Math.trunc(
				stakingAmount *networkInfo.commissionRatio
			);
			transactions.push(api.tx.staking.bondExtra(amount),
			api.tx.balances.transferKeepAlive(networkInfo.collectionAddress, yieldscanCommission),
			api.tx.system.remark("Sent with YieldScan")
			);

		} else if (stakeAmount < bondedAmount) {
			const amount =
				(bondedAmount - stakeAmount) * 10 ** networkInfo.decimalPlaces; // 12 decimal places
			const yieldscanCommission = Math.trunc(
				stakingAmount *networkInfo.commissionRatio
			);
				transactions.push(
					api.tx.staking.unbond(amount),
					api.tx.balances.transferKeepAlive(networkInfo.collectionAddress, yieldscanCommission),
					api.tx.system.remark("Sent with YieldScan")
				);
		}
		transactions.push(api.tx.staking.nominate(nominatedValidators));
	} else {
		// Take the origin account (stash account) as a stash and lock up value of its balance.
		// controller will be the account that controls it.
		const amount = stakeAmount * 10 ** networkInfo.decimalPlaces; // 12 decimal places
		const yieldscanCommission = Math.trunc(
			stakingAmount *networkInfo.commissionRatio
		);
		transactions.push(
			api.tx.staking.bond(substrateControllerId, amount, payee),
			api.tx.staking.nominate(nominatedValidators),
			api.tx.balances.transferKeepAlive(networkInfo.collectionAddress, yieldscanCommission),
			api.tx.system.remark("Sent with YieldScan")
			);
		
	}

	const info = await api.tx.utility.batchAll(transactions).paymentInfo(stashId);

	return info.partialFee.toNumber();
};

export default getTransactionFee;
