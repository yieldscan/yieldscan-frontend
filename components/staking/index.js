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
	useAccounts,
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
import getFromLocalStorage from "@lib/getFromLocalStorage";
import StakeToEarn from "./StakeToEarn";
import LockFunds from "./LockFunds";
import Confirmation from "./Confirmation";

const Staking = () => {
	const { selectedNetwork } = useSelectedNetwork();
	const { apiInstance } = usePolkadotApi();
	const networkInfo = getNetworkInfo(selectedNetwork);
	const { selectedAccount } = useSelectedAccount();
	const { setTransactionState, ...transactionState } = useTransaction();
	const { accounts } = useAccounts();
	const { accountsBalances, setAccountsBalances } = useAccountsBalances();
	const { accountsStakingInfo, setAccountsStakingInfo } =
		useAccountsStakingInfo();
	const { accountsStakingLedgerInfo, setAccountsStakingLedgerInfo } =
		useAccountsStakingLedgerInfo();
	const isLedger = JSON.parse(
		getFromLocalStorage(
			selectedAccount.address + networkInfo.network,
			"isLedger"
		)
	);
	const selectedValidators = get(transactionState, "selectedValidators", []);
	const stakingAmount = get(transactionState, "stakingAmount", 0);

	console.log(isLedger);

	console.log(transactionState);

	return <Confirmation />;
};
export default Staking;
