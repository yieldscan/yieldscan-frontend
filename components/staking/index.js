import { useState, useEffect } from "react";
import { get, isNil } from "lodash";
import {
	useSelectedAccount,
	useTransaction,
	useSelectedNetwork,
	useTransactionHash,
	usePolkadotApi,
	useAccounts,
	useAccountsBalances,
	useAccountsStakingInfo,
	useAccountsStakingLedgerInfo,
	useAccountsControllerStashInfo,
} from "@lib/store";
import { useRouter } from "next/router";
import { getNetworkInfo } from "yieldscan.config";
import getFromLocalStorage from "@lib/getFromLocalStorage";
import StakeToEarn from "./StakeToEarn";
import LockFunds from "./LockFunds";
import Confirmation from "./Confirmation";
import stake from "@lib/stake";
import axios from "@lib/axios";
import { useToast, Spinner, Flex, Button } from "@chakra-ui/core";
import ConfettiGenerator from "confetti-js";
import ChainErrorPage from "./ChainErrorPage";

const Staking = () => {
	const toast = useToast();
	const router = useRouter();
	const { selectedNetwork } = useSelectedNetwork();
	const { apiInstance } = usePolkadotApi();
	const networkInfo = getNetworkInfo(selectedNetwork);
	const { selectedAccount } = useSelectedAccount();
	const { transactionHash, setTransactionHash } = useTransactionHash();
	const { setTransactionState, ...transactionState } = useTransaction();
	const { accounts } = useAccounts();
	const { accountsBalances } = useAccountsBalances();
	const { accountsStakingInfo } = useAccountsStakingInfo();
	const { accountsStakingLedgerInfo } = useAccountsStakingLedgerInfo();

	const { accountsControllerStashInfo } = useAccountsControllerStashInfo();
	const [isLedger, setIsLedger] = useState(() =>
		JSON.parse(
			getFromLocalStorage(
				selectedAccount.address + networkInfo.network,
				"isLedger"
			)
		)
	);

	const selectedValidators = get(transactionState, "selectedValidators", []);
	const stakingAmount = get(transactionState, "stakingAmount", 0);

	const [balances, setBalances] = useState(
		() => accountsBalances[selectedAccount?.address]
	);

	const [stakingInfo, setStakingInfo] = useState(
		() => accountsStakingInfo[selectedAccount?.address]
	);
	const [stakingLedgerInfo, setStakingLedgerInfo] = useState(
		() => accountsStakingLedgerInfo[selectedAccount?.address]
	);
	const [controllerStashInfo, setControllerStashInfo] = useState(
		() => accountsControllerStashInfo[selectedAccount?.address]
	);

	const [stakingLoading, setStakingLoading] = useState(false);
	const [successHeading, setSuccessHeading] = useState("Congratulations");
	const [stakingEvent, setStakingEvent] = useState();
	const [isSuccessful, setIsSuccessful] = useState(false);
	const [isLockFunds, setIsLockFunds] = useState();
	const [chainError, setChainError] = useState(false);
	const [loaderError, setLoaderError] = useState(false);

	const [controllerAccount, setControllerAccount] = useState(() =>
		accountsStakingInfo[selectedAccount.address]?.stakingLedger.controllerId
			? accounts?.filter(
					(account) =>
						account.address ===
						accountsStakingInfo[
							selectedAccount.address
						]?.stakingLedger.controllerId.toString()
			  )[0]
			: isNil(
					window?.localStorage.getItem(
						selectedAccount.address + networkInfo.network + "Controller"
					)
			  )
			? selectedAccount
			: accounts?.filter(
					(account) =>
						account.address ===
						window?.localStorage.getItem(
							selectedAccount.address + networkInfo.network + "Controller"
						)
			  )[0]
	);

	const [controllerBalances, setControllerBalances] = useState(
		() => accountsBalances[controllerAccount?.address]
	);

	const updateTransactionData = (
		stashId,
		network,
		alreadyBonded,
		stakeAmount,
		tranHash,
		successful
	) => {
		axios
			.put(`${networkInfo.network}/user/transaction/update`, {
				stashId: stashId,
				network: network,
				alreadyBonded: alreadyBonded,
				stake: stakeAmount,
				transactionHash: tranHash,
				successful: successful,
			})
			.then(() => {
				console.info("successfully updated transaction info");
			})
			.catch((e) => {
				console.info("unable to update transaction info");
			});
	};

	// useEffect(() => {
	// 	setLoading(false);
	// 	// To prevent the user from switching accounts or networks while in the middle of the payment process
	// 	setHeaderLoading(true);
	// 	if (selectedAccount) {
	// 		getTransactionFee(
	// 			selectedAccount.address,
	// 			selectedAccount.address,
	// 			transactionState.stakingAmount,
	// 			get(bondedAmount, "currency", 0),
	// 			transactionState.rewardDestination,
	// 			transactionState.selectedValidators.map((v) => v.stashId),
	// 			apiInstance,
	// 			networkInfo
	// 		).then((info) => {
	// 			setTransactionFee(info);
	// 		});
	// 	}
	// }, []);

	// useEffect(() => {
	// 	if (transactionHash && isSuccessful) {
	// 		setTimeout(() => router.push({ pathname: "/overview" }), 5000);
	// 	}
	// }, [transactionHash, isSuccessful]);

	const transact = (transactionType) => {
		if (["lock-funds", "bond-extra"].includes(transactionType)) {
			setIsLockFunds(true);
		} else setIsLockFunds(false);

		setStakingLoading(true);

		// trackEvent(Events.INTENT_TRANSACTION, {
		// 	transactionType: !!transactionState.stakingAmount ? "STAKE" : "NOMINATE",
		// 	stakingAmount: get(transactionState, "stakingAmount"),
		// 	riskPreference: get(transactionState, "riskPreference"),
		// 	selectedValidators: map(
		// 		get(transactionState, "selectedValidators"),
		// 		(val) => get(val, "stashId")
		// 	),
		// 	numOfSelectedValidators: size(
		// 		get(transactionState, "selectedValidators")
		// 	),
		// });

		const handlers = {
			onEvent: (eventInfo) => {
				setStakingEvent(eventInfo.message);
			},
			onSuccessfullSigning: (hash) => {
				const transactionHash = get(hash, "message");
				setLoaderError(false);
				setTimeout(() => {
					setTransactionHash(transactionHash);
					setStakingEvent(
						"Your transaction is sent to the network. Awaiting confirmation..."
					);
				}, 750);
				// trackEvent(Events.TRANSACTION_SENT, {
				// 	hash: get(hash, "message"),
				// 	url: `https://${get(
				// 		networkInfo,
				// 		"network"
				// 	)}.subscan.io/block/${transactionHash}`,
				// });
			},
			onFinish: (status, message, eventLogs, tranHash) => {
				// status = 0 for success, anything else for error code
				if (status === 0) {
					["lock-funds", "bond-extra"].includes(transactionType)
						? setSuccessHeading("Now you’re ready to stake")
						: setSuccessHeading("Congratulations");
					const successMessage = ["lock-funds", "bond-extra"].includes(
						transactionType
					)
						? "Your funds have been locked successfully. Just one more step to start earning..."
						: "You’ve successfully staked your funds...";
					setStakingEvent(successMessage);
					setIsSuccessful(true);
					setTimeout(() => {
						if (["lock-funds", "bond-extra"].includes(transactionType)) {
							setIsSuccessful(false);
							setTransactionHash(null);
						}
					}, 5000);
				}
				toast({
					title: status === 0 ? "Successful!" : "Error!",
					status: status === 0 ? "success" : "error",
					description: message,
					position: "top-right",
					isClosable: true,
					duration: 7000,
				});
				setTimeout(() => {
					console.log("hello");
					setStakingLoading(false);
				}, 2500);

				if (status === 0) {
					updateTransactionData(
						selectedAccount.address,
						networkInfo.network,
						parseInt(stakingInfo.stakingLedger.active) /
							Math.pow(10, networkInfo.decimalPlaces),
						get(transactionState, "stakingAmount", 0),
						tranHash,
						true
					);
					// trackEvent(Events.TRANSACTION_SUCCESS, {
					// 	stakingAmount: get(transactionState, "stakingAmount"),
					// 	riskPreference: get(transactionState, "riskPreference"),
					// 	successMessage: message,
					// });
					// To allow the user to switch accounts and networks after the payment process is complete
					// setHeaderLoading(false);
					// router.replace("/overview");
				} else {
					if (message !== "Cancelled") {
						updateTransactionData(
							selectedAccount.address,
							networkInfo.network,
							parseInt(stakingInfo.stakingLedger.active) /
								Math.pow(10, networkInfo.decimalPlaces),
							get(transactionState, "stakingAmount", 0),
							tranHash,
							false
						);
						// trackEvent(Events.TRANSACTION_FAILED, {
						// 	stakingAmount: get(transactionState, "stakingAmount"),
						// 	riskPreference: get(transactionState, "riskPreference"),
						// 	errorMessage: message,
						// 	eventLogs,
						// });
						setTimeout(() => {
							setStakingEvent("Transaction failed");
							setLoaderError(true);
						}, 750);
						setTimeout(() => {
							setChainError(true);
							setLoaderError(false);
							setStakingLoading(false);
						}, 2500);
					}
				}
			},
		};

		if (transactionState.stakingAmount) {
			stake(
				selectedAccount.address,
				controllerAccount?.address,
				transactionState.stakingAmount,
				transactionState.rewardDestination,
				transactionState.selectedValidators.map((v) => v.stashId),
				apiInstance,
				handlers,
				transactionType,
				networkInfo
			).catch((error) => {
				handlers.onFinish(1, error.message);
			});
		}
	};

	useEffect(() => {
		setBalances(accountsBalances[selectedAccount?.address]);
	}, [
		selectedAccount?.address,
		JSON.stringify(accountsBalances[selectedAccount?.address]),
	]);

	useEffect(() => {
		setControllerBalances(accountsBalances[controllerAccount?.address]);
	}, [
		controllerAccount?.address,
		JSON.stringify(accountsBalances[controllerAccount?.address]),
	]);

	useEffect(() => {
		setControllerStashInfo(
			accountsControllerStashInfo[selectedAccount?.address]
		);
	}, [
		selectedAccount?.address,
		JSON.stringify(accountsControllerStashInfo[selectedAccount?.address]),
	]);

	useEffect(() => {
		setStakingInfo(accountsStakingInfo[selectedAccount?.address]);
	}, [
		selectedAccount?.address,
		JSON.stringify(accountsStakingInfo[selectedAccount?.address]),
	]);

	useEffect(() => {
		setStakingLedgerInfo(accountsStakingLedgerInfo[selectedAccount?.address]);
	}, [
		selectedAccount?.address,
		JSON.stringify(accountsStakingLedgerInfo[selectedAccount?.address]),
	]);

	useEffect(() => {
		setIsLedger(() =>
			JSON.parse(
				getFromLocalStorage(
					selectedAccount.address + networkInfo.network,
					"isLedger"
				)
			)
		);
	}, [selectedAccount?.address]);

	useEffect(() => {
		if (transactionHash && isSuccessful && !isLockFunds) {
			setTimeout(() => router.push({ pathname: "/overview" }), 5000);
		}
	}, [transactionHash, isSuccessful]);

	useEffect(() => {
		if (transactionHash && isSuccessful) {
			const confettiSettings = {
				target: "confetti-holder",
				max: "150",
				size: "1",
				animate: true,
				props: ["circle", "square", "triangle", "line"],
				colors: [
					[165, 104, 246],
					[230, 61, 135],
					[0, 199, 228],
					[253, 214, 126],
				],
				clock: "200",
				rotate: true,
				start_from_edge: true,
				respawn: true,
			};
			const confetti = new ConfettiGenerator(confettiSettings);
			confetti.render();

			return () => confetti.clear();
		}
	}, [transactionHash, isSuccessful]);

	useEffect(() => {
		if (stakingInfo?.controllerId) {
			setControllerAccount(
				() =>
					accounts?.filter(
						(account) => account.address === stakingInfo.controllerId.toString()
					)[0]
			);
		}
	}, [stakingInfo?.controllerId]);
	// console.log("balances");
	// console.log(balances);
	// console.log("stakingInfo");
	// console.log(stakingInfo);
	// console.log("controllerStashInfo");
	// console.log(controllerStashInfo);
	// console.log(isLedger);

	// console.log("controllerAccount");
	// console.log(controllerAccount);

	return selectedAccount ? (
		<div className="w-full h-full flex justify-center max-h-full">
			{transactionHash && isSuccessful && (
				<canvas id="confetti-holder" className="absolute w-full"></canvas>
			)}
			{stakingLoading || isSuccessful ? (
				<div className="flex flex-col h-full items-center justify-content justify-center space-y-4">
					<span
						className={`loader ${
							loaderError
								? "fail"
								: transactionHash && isSuccessful && "success"
						}`}
					></span>
					{isSuccessful && (
						<h1 className="text-gray-700 text-2xl font-semibold">
							{successHeading}
						</h1>
					)}
					<p className="text-gray-700">{stakingEvent}</p>
				</div>
			) : chainError ? (
				<ChainErrorPage
					// back={backToConfirmation}
					// onConfirm={() => {
					// 	setStakingLoading(true);
					// 	setChainError(false);
					// 	transact();
					// }}
					networkInfo={networkInfo}
				/>
			) : isLedger ? (
				stakingInfo.stakingLedger.active.isEmpty ? (
					<LockFunds
						accounts={accounts}
						balances={balances}
						controllerBalances={controllerBalances}
						stakingInfo={stakingInfo}
						stakingLedgerInfo={stakingLedgerInfo}
						controllerStashInfo={controllerStashInfo}
						apiInstance={apiInstance}
						selectedAccount={selectedAccount}
						controllerAccount={controllerAccount}
						networkInfo={networkInfo}
						transactionState={transactionState}
						setTransactionState={setTransactionState}
						onConfirm={(type) => transact(type)}
					/>
				) : (
					<StakeToEarn
						accounts={accounts}
						balances={balances}
						controllerBalances={controllerBalances}
						stakingInfo={stakingInfo}
						stakingLedgerInfo={stakingLedgerInfo}
						controllerStashInfo={controllerStashInfo}
						apiInstance={apiInstance}
						selectedAccount={selectedAccount}
						controllerAccount={controllerAccount}
						networkInfo={networkInfo}
						transactionState={transactionState}
						isLedger={isLedger}
						setTransactionState={setTransactionState}
						onConfirm={(type) => transact(type)}
					/>
				)
			) : controllerStashInfo.isStash &&
			  !controllerStashInfo.isSameStashController ? (
				<StakeToEarn
					accounts={accounts}
					balances={balances}
					controllerBalances={controllerBalances}
					stakingInfo={stakingInfo}
					stakingLedgerInfo={stakingLedgerInfo}
					controllerStashInfo={controllerStashInfo}
					apiInstance={apiInstance}
					selectedAccount={selectedAccount}
					controllerAccount={controllerAccount}
					networkInfo={networkInfo}
					transactionState={transactionState}
					isLedger={isLedger}
					setTransactionState={setTransactionState}
					onConfirm={(type) => transact(type)}
				/>
			) : (
				<Confirmation
					accounts={accounts}
					balances={balances}
					controllerBalances={controllerBalances}
					stakingInfo={stakingInfo}
					stakingLedgerInfo={stakingLedgerInfo}
					controllerStashInfo={controllerStashInfo}
					apiInstance={apiInstance}
					selectedAccount={selectedAccount}
					controllerAccount={controllerAccount}
					networkInfo={networkInfo}
					transactionState={transactionState}
					setTransactionState={setTransactionState}
					// stakingLoading={stakingLoading}
					// stakingEvent={stakingEvent}
					onConfirm={(type) => transact(type)}
					// transactionHash={transactionHash}
					// isSuccessful={isSuccessful}
					// chainError={chainError}
					// loaderError={loaderError}
				/>
			)}
		</div>
	) : (
		<></>
	);
};

export default Staking;
