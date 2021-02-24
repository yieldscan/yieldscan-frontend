import { web3FromAddress } from "@polkadot/extension-dapp";
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";
import { WsProvider, ApiPromise } from "@polkadot/api";
import { isNil } from "lodash";

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
	const redeemFee = await api.tx.staking
		.withdrawUnbonded(Number(slashSpan))
		.paymentInfo(substrateStashId);
	return redeemFee.partialFee.toNumber();
};

export default getRedeemUnbondedFee;
