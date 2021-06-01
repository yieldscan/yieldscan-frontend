import { useState, useEffect } from "react";
import { get, isNil } from "lodash";
import Identicon from "@components/common/Identicon";
import Image from "next/image";
import router from "next/router";
import {
	useSelectedAccount,
	useTransaction,
	useSelectedNetwork,
	usePolkadotApi,
	useAccountsBalances,
	useAccountsStakingInfo,
	useAccountsStakingLedgerInfo,
} from "@lib/store";
import { getNetworkInfo } from "yieldscan.config";
import RiskTag from "@components/reward-calculator/RiskTag";
import formatCurrency from "@lib/format-currency";
import { GlossaryModal, HelpPopover } from "@components/reward-calculator";
import { Spinner, Divider } from "@chakra-ui/core";
import getTransactionFee from "@lib/getTransactionFee";
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";
import { ChevronLeft } from "react-feather";
import StakeToEarn from "./StakeToEarn";
import LockFunds from "./LockFunds";

const Staking = () => {
	const { selectedNetwork } = useSelectedNetwork();
	const { apiInstance } = usePolkadotApi();
	const networkInfo = getNetworkInfo(selectedNetwork);
	const { selectedAccount } = useSelectedAccount();
	const { setTransactionState, ...transactionState } = useTransaction();
	const { accountsBalances, setAccountsBalances } = useAccountsBalances();
	const { accountsStakingInfo, setAccountsStakingInfo } =
		useAccountsStakingInfo();
	const { accountsStakingLedgerInfo, setAccountsStakingLedgerInfo } =
		useAccountsStakingLedgerInfo();
	const selectedValidators = get(transactionState, "selectedValidators", []);
	const stakingAmount = get(transactionState, "stakingAmount", 0);
	const [transactionFee, setTransactionFee] = useState(0);

	console.log(transactionState);

	return <LockFunds />;
};
export default Staking;
