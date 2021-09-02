import { NextButton } from "@components/common/BottomButton";
import * as Sentry from "@sentry/node";
import Image from "next/image";
const ChainErrorPage = ({ onConfirm, errMessage }) => {
	return (
		<div className="mx-10 mt-8 mb-20 flex flex-col text-center items-center space-y-4">
			<Image
				src="/images/polkadot_alert.png"
				alt="alert"
				width="120"
				height="120"
			/>
			<h3 className="mt-4 text-2xl">
				Oops. There was an error processing this staking request
			</h3>
			<span className="mt-1 px-4 text-sm text-gray-500">
				If you think this is an error on our part, please share this with the
				help center and we will do our best to help. We typically respond within
				2-3 days.
			</span>
			{/* <a
                href={`https://polkascan.io/kusama/transaction/${transactionHash}`}
                className="mt-6 text-gray-500"
                target="_blank"
            >
                Track this transaction on PolkaScan
            </a> */}
			<NextButton onClick={onConfirm}>Retry</NextButton>
			<NextButton
				onClick={() => {
					window?.open("https://discord.gg/nQYhcg9RPU", "_blank");

					Sentry.showReportDialog({
						eventId: Sentry.captureException(errMessage),
					});
				}}
			>
				Share this with the help center
			</NextButton>
		</div>
	);
};

export default ChainErrorPage;
