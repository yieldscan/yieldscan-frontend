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
	useStakingPath,
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
import SecureStakingSetup from "./SecureStakingSetup";
import { AuthPopover, useAuthPopover } from "./AuthPopover";
import transferBalancesKeepAlive from "@lib/polkadot/transfer-balances";

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
	const { stakingPath, setStakingPath } = useStakingPath();
	const { accountsBalances } = useAccountsBalances();
	const { accountsStakingInfo } = useAccountsStakingInfo();
	const { accountsControllerStashInfo } = useAccountsControllerStashInfo();
	const { balances, stakingInfo, stakingLedgerInfo } = useSelectedAccountInfo();
	const { isAuthPopoverOpen, toggleIsAuthPopoverOpen, close } =
		useAuthPopover();

	const [initialStakingPath, setInitialStakingPath] = useState(stakingPath);

	const [transactions, setTransactions] = useState(null);
	const [injectorAccount, setInjectorAccount] = useState(null);
	const [transactionFee, setTransactionFee] = useState(0);
	const [transactionType, setTransactionType] = useState(null);
	const [senderAccount, setSenderAccount] = useState(null);

	const selectedValidators = get(transactionState, "selectedValidators", []);
	const stakingAmount = get(transactionState, "stakingAmount", 0);

	const [controllerStashInfo, setControllerStashInfo] = useState(
		() => accountsControllerStashInfo[selectedAccount?.address]
	);

	const [ysFees, setYsFees] = useState(0);
	Math.trunc(
		get(transactionState, "stakingAmount", 0) *
			0.00125 *
			Math.pow(10, networkInfo.decimalPlaces)
	);

	const [controllerAccount, setControllerAccount] = useState(() =>
		isNil(stakingInfo?.controllerId)
			? null
			: accounts?.filter(
					(account) => account.address === stakingInfo?.controllerId.toString()
			  )[0]
	);

	const [controllerBalances, setControllerBalances] = useState(
		() => accountsBalances[controllerAccount?.address]
	);
	const [successHeading, setSuccessHeading] = useState("Congratulations");
	const [stakingEvent, setStakingEvent] = useState();
	const [isSuccessful, setIsSuccessful] = useState(false);
	const [loaderError, setLoaderError] = useState(false);

	const [selected, setSelected] = useState(null);

	const [confirmedControllerAccount, setConfirmedControllerAccount] =
		useState(null);

	const [controllerTransferAmount, setControllerTransferAmount] = useState(0);

	const [transferFundsAmount, setTransferFundsAmount] = useState(0);

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

	const transact = () => {
		const from = senderAccount?.address;
		const to = controllerAccount?.address;
		setStakingPath("loading");
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
					initialStakingPath === "transfer"
						? setSuccessHeading("Wohoo!")
						: setSuccessHeading("Congratulations");
					const successMessage =
						initialStakingPath === "transfer"
							? "Your controller account is succesfully set up, you can continue to stake now..."
							: "You’ve successfully staked your funds...";
					setStakingEvent(successMessage);
					setIsSuccessful(true);
					setTimeout(() => {
						if (initialStakingPath === "transfer") {
							setInitialStakingPath(() =>
								controllerAccount?.address === selectedAccount?.address
									? "express"
									: "distinct"
							);
							// setStakingPath(() =>
							// 	controllerAccount?.address === selectedAccount?.address
							// 		? "express"
							// 		: "distinct"
							// );
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
				// setTimeout(() => {
				// 	setStakingLoading(false);
				// }, 2500);

				if (status === 0) {
					initialStakingPath !== "transfer" &&
						updateTransactionData(
							selectedAccount?.address,
							networkInfo.network,
							parseInt(stakingInfo.stakingLedger.active) /
								Math.pow(10, networkInfo.decimalPlaces),
							stakingAmount,
							tranHash,
							true
						);
				} else {
					if (message !== "Cancelled" && initialStakingPath !== "transfer") {
						updateTransactionData(
							selectedAccount?.address,
							networkInfo.network,
							parseInt(stakingInfo.stakingLedger.active) /
								Math.pow(10, networkInfo.decimalPlaces),
							stakingAmount,
							tranHash,
							false
						);
						setStakingEvent("Transaction failed");
						setLoaderError(true);

						setTimeout(() => {
							setLoaderError(false);
							setStakingPath("errorPage");
							// setStakingLoading(false);
						}, 2000);
					} else setStakingPath(initialStakingPath);
				}
			},
		};

		if (transactionState.stakingAmount && initialStakingPath !== "transfer") {
			stake(apiInstance, handlers, transactions, injectorAccount).catch(
				(error) => {
					handlers.onFinish(1, error.message);
				}
			);
		} else {
			transferBalancesKeepAlive(
				from,
				to,
				apiInstance,
				transferFundsAmount,
				networkInfo,
				handlers
			).catch((error) => {
				handlers.onFinish(1, error.message);
			});
		}
	};

	useEffect(() => {
		if (networkInfo?.feesEnabled) {
			setYsFees(() =>
				Math.trunc(
					stakingAmount *
						networkInfo.feesRatio *
						Math.pow(10, networkInfo.decimalPlaces)
				)
			);
		} else setYsFees(0);
	}, [networkInfo, stakingAmount]);

	useEffect(() => {
		if (stakingInfo) {
			isNil(stakingInfo?.controllerId)
				? setControllerAccount(null)
				: setControllerAccount(
						accounts?.filter(
							(account) =>
								account.address === stakingInfo?.controllerId.toString()
						)[0]
				  );
		}
	}, [JSON.stringify(stakingInfo)]);

	useEffect(() => {
		if (controllerAccount?.address) {
			setControllerBalances(accountsBalances[controllerAccount?.address]);
		}
	}, [
		controllerAccount?.address,
		JSON.stringify(accountsBalances[controllerAccount?.address]),
	]);

	useEffect(() => {
		setStakingPath(initialStakingPath);
	}, [initialStakingPath]);

	useEffect(() => {
		setControllerStashInfo(
			accountsControllerStashInfo[selectedAccount?.address]
		);
	}, [
		selectedAccount?.address,
		JSON.stringify(accountsControllerStashInfo[selectedAccount?.address]),
	]);

	useEffect(() => {
		if (selected && apiInstance && accountsBalances) {
			accountsBalances[selected?.address].availableBalance <
			ysFees + apiInstance?.consts.balances.existentialDeposit
				? setControllerTransferAmount(
						() =>
							ysFees +
							2 * apiInstance?.consts.balances.existentialDeposit.toNumber() -
							accountsBalances[selected?.address].availableBalance
				  )
				: setControllerTransferAmount(0);
		}
	}, [selected?.address, JSON.stringify(accountsBalances[selected?.address])]);

	useEffect(() => {
		if (stakingPath === "transfer" && controllerBalances) {
			setTransferFundsAmount(
				ysFees +
					apiInstance?.consts.balances.existentialDeposit.toNumber() * 2 -
					controllerBalances?.availableBalance
			);
		}
	}, [JSON.stringify(controllerBalances), ysFees, stakingPath]);

	useEffect(() => {
		if (transactionHash && isSuccessful && initialStakingPath !== "transfer") {
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

	console.log("ysFees");
	console.log(ysFees);
	console.log(transferFundsAmount);
	console.log(transferFundsAmount);
	console.log(apiInstance?.consts.balances.existentialDeposit.toNumber() * 2);
	console.log(
		ysFees +
			apiInstance?.consts.balances.existentialDeposit.toNumber() * 2 -
			controllerBalances?.availableBalance
	);

	return isNil(transactionState) || isNil(selectedAccount) ? (
		<div className="w-full h-full flex justify-center items-center max-h-full">
			<span className="loader"></span>
		</div>
	) : isNil(stakingInfo) || isNil(balances) || isNil(accountsBalances) ? (
		<div className="w-full h-full flex justify-center items-center max-h-full">
			<span className="loader"></span>
		</div>
	) : (
		<div className="w-full h-full justify-center items-center">
			<AuthPopover
				isAuthPopoverOpen={isAuthPopoverOpen}
				networkInfo={networkInfo}
				onConfirm={() => transact()}
				close={close}
				// transactionType={transactionType}
			/>
			{transactionHash && isSuccessful && initialStakingPath !== "transfer" && (
				<canvas id="confetti-holder" className="absolute w-full"></canvas>
			)}
			{stakingPath === "loading" ? (
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
						{isSuccessful && initialStakingPath !== "transfer" && (
							<BottomNextButton
								onClick={() => router.push({ pathname: "/overview" })}
							>
								Continue
							</BottomNextButton>
						)}
						{false && (
							<div className="w-full max-w-sm flex flex-col text-gray-700 text-center items-center h-full justify-between mt-24">
								<p>
									You will be automatically redirected to the next steps in 5
									seconds. Click here you’re not automatically redirected
								</p>
							</div>
						)}
					</div>
				</div>
			) : stakingPath === "errorPage" ? (
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
			) : stakingPath === "transfer" ? (
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
					// setStakingLoading={setStakingLoading}
					setStakingEvent={setStakingEvent}
					setLoaderError={setLoaderError}
					setSuccessHeading={setSuccessHeading}
					setIsSuccessful={setIsSuccessful}
					setStakingPath={setStakingPath}
					setTransactionHash={setTransactionHash}
					senderAccount={senderAccount}
					setSenderAccount={setSenderAccount}
					transferFunds={transact}
					transferFundsAmount={transferFundsAmount}
					setTransferFundsAmount={setTransferFundsAmount}
					ysFees={ysFees}
				/>
			) : stakingPath === "secure" ? (
				<SecureStakingSetup
					accounts={accounts}
					balances={balances}
					stakingInfo={stakingInfo}
					apiInstance={apiInstance}
					selectedAccount={selectedAccount}
					controllerAccount={controllerAccount}
					networkInfo={networkInfo}
					transactionState={transactionState}
					accountsControllerStashInfo={accountsControllerStashInfo}
					accountsBalances={accountsBalances}
					ysFees={ysFees}
					setTransactionState={setTransactionState}
					selected={selected}
					confirmedControllerAccount={confirmedControllerAccount}
					setSelected={setSelected}
					setConfirmedControllerAccount={setConfirmedControllerAccount}
					controllerTransferAmount={controllerTransferAmount}
					onConfirm={transact}
					toggleIsAuthPopoverOpen={toggleIsAuthPopoverOpen}
					transactionFee={transactionFee}
					setTransactionFee={setTransactionFee}
					transactionType={transactionType}
					setTransactionType={setTransactionType}
					setTransactions={setTransactions}
					setInjectorAccount={setInjectorAccount}
					stakingAmount={stakingAmount}
					selectedValidators={selectedValidators}
				/>
			) : stakingPath === "express" ? (
				<Confirmation
					accounts={accounts}
					balances={balances}
					stakingInfo={stakingInfo}
					apiInstance={apiInstance}
					selectedAccount={selectedAccount}
					networkInfo={networkInfo}
					transactionState={transactionState}
					setTransactionState={setTransactionState}
					onConfirm={transact}
					toggleIsAuthPopoverOpen={toggleIsAuthPopoverOpen}
					ysFees={ysFees}
					transactionFee={transactionFee}
					setTransactions={setTransactions}
					setInjectorAccount={setInjectorAccount}
					setTransactionFee={setTransactionFee}
					transactionType={transactionType}
					stakingAmount={stakingAmount}
					selectedValidators={selectedValidators}
					setTransactionType={setTransactionType}
				/>
			) : stakingPath === "distinct" ? (
				<StakeToEarn
					stakingInfo={stakingInfo}
					apiInstance={apiInstance}
					selectedAccount={selectedAccount}
					controllerAccount={controllerAccount}
					balances={balances}
					controllerBalances={controllerBalances}
					networkInfo={networkInfo}
					transactionState={transactionState}
					toggleIsAuthPopoverOpen={toggleIsAuthPopoverOpen}
					toggleIsAuthPopoverOpen={toggleIsAuthPopoverOpen}
					ysFees={ysFees}
					transactionFee={transactionFee}
					setTransactionFee={setTransactionFee}
					setTransactions={setTransactions}
					setInjectorAccount={setInjectorAccount}
					stakingAmount={stakingAmount}
					selectedValidators={selectedValidators}
				/>
			) : (
				<></>
			)}
		</div>
	);
};

export default Staking;
