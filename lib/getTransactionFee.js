import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";
import { get } from "lodash";

const getTransactionFee = async (
    networkInfo,
    stakingInfo,
    stakingAmount,
    selectedAccount,
    selectedValidators,
    controllerAccount,
    api
) => {
    const amount = stakingAmount* 10 **networkInfo.decimalPlaces;

    const yieldscanCommission = Math.trunc(
        networkInfo.commissionRatio * amount
    );

    const nominatedValidators = selectedValidators.map((v) => v.stashId);

    const substrateStashId = encodeAddress(
        decodeAddress(selectedAccount?.address),
        42
    );

    // const substrateControllerId = encodeAddress(
    //  decodeAddress(controllerAccount?.address),
    //  42
    // );

    const transactions = [];
    const tranasactionType = stakingInfo?.stakingLedger.active.isEmpty
        ? "bond-and-nominate"
        : "nominate";
    if (tranasactionType === "bond-and-nominate") {
        transactions.push(
            api.tx.staking.bond(substrateStashId, amount, rewardDestination),
            api.tx.staking.nominate(nominatedValidators)
        );
    } else if (tranasactionType === "nominate") {
        transactions.push(api.tx.staking.nominate(nominatedValidators));
    }

    transactions.push(
        api.tx.balances.transferKeepAlive(networkInfo.collectionAddress, yieldscanCommission),
        api.tx.system.remark("Sent with YieldScan")
    );

    const fees = await api.tx.utility
        .batchAll(transactions)
        .paymentInfo(substrateStashId);

    const networkFees = fees?.partialFee.toNumber();

    return { ysFees: yieldscanCommission, networkFees: networkFees };
};

export default getTransactionFee;
