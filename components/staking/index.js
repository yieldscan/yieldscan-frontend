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
	useAccountsControllerStashInfo,
	useSelectedAccountInfo,
	useIsNewSetup,
} from "@lib/store";
import { useRouter } from "next/router";
import { getNetworkInfo } from "yieldscan.config";
import getFromLocalStorage from "@lib/getFromLocalStorage";
import StakeToEarn from "./StakeToEarn";
import LockFunds from "./LockFunds";
import Confirmation from "./Confirmation";
import stake from "@lib/stake";
import axios from "@lib/axios";
import { useToast } from "@chakra-ui/core";
import ConfettiGenerator from "confetti-js";
import ChainErrorPage from "./ChainErrorPage";
import { BottomNextButton } from "../common/BottomButton";
import InfoAlert from "./InfoAlert";
import TransferFunds from "./TransferFunds";

const Staking = () => {
	const toast = useToast();
	const router = useRouter();
	const { selectedNetwork } = useSelectedNetwork();
	const { apiInstance } = usePolkadotApi();
	const networkInfo = getNetworkInfo(selectedNetwork);
	const { selectedAccount } = useSelectedAccount();
	const { setIsNewSetup } = useIsNewSetup();
	const { transactionHash, setTransactionHash } = useTransactionHash();
	const { setTransactionState, ...transactionState } = useTransaction();
	const { accounts } = useAccounts();
	const { accountsBalances } = useAccountsBalances();
	const { accountsStakingInfo } = useAccountsStakingInfo();

	const { accountsControllerStashInfo } = useAccountsControllerStashInfo();
	const [isLedger, setIsLedger] = useState(() =>
		JSON.parse(
			getFromLocalStorage(selectedAccount?.substrateAddress, "isLedger")
		)
	);

	const selectedValidators = get(transactionState, "selectedValidators", []);
	const stakingAmount = get(transactionState, "stakingAmount", 0);

	const { balances, stakingInfo, stakingLedgerInfo } = useSelectedAccountInfo();

	const [controllerStashInfo, setControllerStashInfo] = useState(
		() => accountsControllerStashInfo[selectedAccount?.address]
	);

	const [controllerAccount, setControllerAccount] = useState(() =>
		accountsStakingInfo[selectedAccount?.address]?.controllerId
			? accounts?.filter(
					(account) =>
						account.address ===
						accountsStakingInfo[
							selectedAccount?.address
						]?.controllerId.toString()
			  )[0]
			: isNil(
					window?.localStorage.getItem(
						selectedAccount?.address + networkInfo.network + "Controller"
					)
			  )
			? selectedAccount
			: accounts?.filter(
					(account) =>
						account.address ===
						window?.localStorage.getItem(
							selectedAccount?.address + networkInfo.network + "Controller"
						)
			  )[0]
	);

	useEffect(() => {
		if (stakingInfo?.accountId.toString() !== selectedAccount?.address) {
			setControllerAccount(null);
		}
		const account = accountsStakingInfo[selectedAccount?.address]?.controllerId
			? accounts?.filter(
					(account) =>
						account.address ===
						accountsStakingInfo[
							selectedAccount?.address
						]?.controllerId.toString()
			  )[0]
			: isNil(
					window?.localStorage.getItem(
						selectedAccount?.address + networkInfo.network + "Controller"
					)
			  )
			? selectedAccount
			: accounts?.filter(
					(account) =>
						account.address ===
						window?.localStorage.getItem(
							selectedAccount?.address + networkInfo.network + "Controller"
						)
			  )[0];
		setControllerAccount(account);
	}, [
		selectedAccount?.address,
		JSON.stringify(stakingInfo),
		JSON.stringify(accountsStakingInfo),
	]);

	const [controllerBalances, setControllerBalances] = useState(
		() => accountsBalances[controllerAccount?.address]
	);

	useEffect(() => {
		if (stakingInfo?.accountId.toString() !== selectedAccount?.address) {
			setControllerBalances(null);
		}
		setControllerBalances(accountsBalances[controllerAccount?.address]);
	}, [
		controllerAccount?.address,
		selectedAccount?.address,
		JSON.stringify(stakingInfo),
		JSON.stringify(accountsBalances[controllerAccount?.address]),
	]);

	const [stakingLoading, setStakingLoading] = useState(false);
	const [successHeading, setSuccessHeading] = useState("Congratulations");
	const [stakingEvent, setStakingEvent] = useState();
	const [isSuccessful, setIsSuccessful] = useState(false);
	const [isLockFunds, setIsLockFunds] = useState();
	const [isTransferFunds, setIsTransferFunds] = useState();
	const [chainError, setChainError] = useState(false);
	const [loaderError, setLoaderError] = useState(false);

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

	const transact = (transactionType) => {
		if (["lock-funds", "bond-extra"].includes(transactionType)) {
			setIsLockFunds(true);
		} else setIsLockFunds(false);
		setIsTransferFunds(false);
		setStakingLoading(true);
		setTransactionHash(null);

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
					setStakingLoading(false);
				}, 2500);

				if (status === 0) {
					updateTransactionData(
						selectedAccount?.address,
						networkInfo.network,
						parseInt(stakingInfo.stakingLedger.active) /
							Math.pow(10, networkInfo.decimalPlaces),
						get(transactionState, "stakingAmount", 0),
						tranHash,
						true
					);
				} else {
					if (message !== "Cancelled") {
						updateTransactionData(
							selectedAccount?.address,
							networkInfo.network,
							parseInt(stakingInfo.stakingLedger.active) /
								Math.pow(10, networkInfo.decimalPlaces),
							get(transactionState, "stakingAmount", 0),
							tranHash,
							false
						);
						setStakingEvent("Transaction failed");
						setLoaderError(true);

						setTimeout(() => {
							setChainError(true);
							setLoaderError(false);
							setStakingLoading(false);
						}, 2000);
					}
				}
			},
		};

		if (transactionState.stakingAmount) {
			stake(
				selectedAccount?.address,
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
		setControllerStashInfo(
			accountsControllerStashInfo[selectedAccount?.address]
		);
	}, [
		selectedAccount?.address,
		JSON.stringify(accountsControllerStashInfo[selectedAccount?.address]),
	]);

	useEffect(() => {
		setIsLedger(() =>
			JSON.parse(
				getFromLocalStorage(selectedAccount?.substrateAddress, "isLedger")
			)
		);
	}, [selectedAccount?.address]);

	// uncomment the following for automatically taking to overview after successful staking
	// useEffect(() => {
	// 	if (transactionHash && isSuccessful && !isLockFunds) {
	// 		setTimeout(() => router.push({ pathname: "/overview" }), 5000);
	// 	}
	// }, [transactionHash, isSuccessful]);

	useEffect(() => {
		if (transactionHash && isSuccessful && !isLockFunds && !isTransferFunds) {
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

			const confettiClear = setTimeout(() => confetti.clear(), 5000);

			return () => clearTimeout(confettiClear);
		}
	}, [transactionHash, isSuccessful]);

	return selectedAccount &&
		controllerBalances &&
		Object.keys(accountsBalances).length > 0 &&
		Object.keys(accountsControllerStashInfo).length > 0 &&
		Object.keys(accountsStakingInfo).length > 0 ? (
		<div className="w-full h-full flex justify-center max-h-full">
			{transactionHash && isSuccessful && !isLockFunds && !isTransferFunds && (
				<canvas id="confetti-holder" className="absolute w-full"></canvas>
			)}
			{stakingLoading || isSuccessful ? (
				<div className="grid grid-rows-2 gap-2 h-full items-center justify-content justify-center">
					<div className="w-full h-full flex justify-center items-end">
						<span
							className={`loader ${
								loaderError
									? "fail"
									: transactionHash && isSuccessful && "success"
							}`}
						></span>
					</div>
					<div className="w-full max-w-sm flex flex-col items-center h-full justify-between pb-12">
						<div className="flex flex-col items-center text-center">
							{isSuccessful && (
								<h1 className="text-gray-700 text-2xl font-semibold">
									{successHeading}
								</h1>
							)}
							<p className="text-gray-700">{stakingEvent}</p>
						</div>
						<div className="w-full mb-32">
							{" "}
							{isSuccessful && !isLockFunds && !isTransferFunds && (
								<InfoAlert />
							)}
						</div>
						{isSuccessful && !isLockFunds && !isTransferFunds && (
							<BottomNextButton
								onClick={() => router.push({ pathname: "/overview" })}
							>
								Continue
							</BottomNextButton>
						)}
					</div>
				</div>
			) : chainError ? (
				<ChainErrorPage
					// back={backToConfirmation}
					// onConfirm={() => {
					// 	setStakingLoading(true);
					// 	setChainError(false);
					// 	transact();
					// }}
					router={router}
					setIsNewSetup={setIsNewSetup}
					networkInfo={networkInfo}
				/>
			) : parseInt(controllerBalances?.availableBalance) <
			  apiInstance?.consts.balances.existentialDeposit.toNumber() / 2 ? (
				<TransferFunds
					router={router}
					apiInstance={apiInstance}
					networkInfo={networkInfo}
					selectedAccount={selectedAccount}
					accounts={accounts}
					accountsBalances={accountsBalances}
					accountsStakingInfo={accountsStakingInfo}
					controllerAccount={controllerAccount}
					controllerBalances={controllerBalances}
					setStakingLoading={setStakingLoading}
					setStakingEvent={setStakingEvent}
					setLoaderError={setLoaderError}
					setSuccessHeading={setSuccessHeading}
					setIsSuccessful={setIsSuccessful}
					setChainError={setChainError}
					setIsTransferFunds={setIsTransferFunds}
					setTransactionHash={setTransactionHash}
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
						stakingInfo={stakingInfo}
						apiInstance={apiInstance}
						selectedAccount={selectedAccount}
						networkInfo={networkInfo}
						transactionState={transactionState}
						isLedger={isLedger}
						onConfirm={(type) => transact(type)}
					/>
				)
			) : controllerStashInfo.isStash &&
			  !controllerStashInfo.isSameStashController ? (
				<StakeToEarn
					stakingInfo={stakingInfo}
					apiInstance={apiInstance}
					selectedAccount={selectedAccount}
					networkInfo={networkInfo}
					transactionState={transactionState}
					isLedger={isLedger}
					onConfirm={(type) => transact(type)}
				/>
			) : (
				<Confirmation
					accounts={accounts}
					balances={balances}
					stakingInfo={stakingInfo}
					apiInstance={apiInstance}
					selectedAccount={selectedAccount}
					controllerAccount={controllerAccount}
					networkInfo={networkInfo}
					transactionState={transactionState}
					setTransactionState={setTransactionState}
					onConfirm={(type) => transact(type)}
				/>
			)}
		</div>
	) : (
		<div className="w-full h-full flex justify-center items-center max-h-full">
			<span className="loader"></span>
		</div>
	);
};

export default Staking;
