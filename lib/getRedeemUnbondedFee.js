import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";

// Stash-Controller 1:1 relationship

// Polkadot API uses it in browser, we let it remain mad :]
window.setImmediate = (cb) => cb();

// TODO: error handling -> balance check, basics.
const getRedeemUnbondedFee = async (stashId, api, networkInfo) => {
	if (!stashId || !api) {
		throw new Error({ message: "Incomplete argument list to stake!" });
	}

	const substrateStashId = encodeAddress(decodeAddress(stashId), 42);

	const slashSpan = await api.query.staking.slashingSpans(stashId);
	const transactions = []
	transactions.push(
		api.tx.staking.withdrawUnbonded(Number(slashSpan)),
		api.tx.system.remark("Sent with Yieldscan")
	);

	const redeemFee = api.tx.utility.batchAll(transactions)
		.paymentInfo(substrateStashId);
	return redeemFee.partialFee.toNumber();
};

export default getRedeemUnbondedFee;
