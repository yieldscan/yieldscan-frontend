import { useAccounts, useHeaderLoading } from "@lib/store";
import React from "react";
import { FaDiscord, FaEnvelope, FaGithub, FaTelegram, FaTwitter } from "react-icons/fa";

const Footer = () => {
	const { accountInfoLoading } = useAccounts();
	const { headerLoading } = useHeaderLoading();
	return (
		!accountInfoLoading &&
		!headerLoading && (
			<footer className="bg-white">
				<div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
					<nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
						<div className="px-5 py-2">
							<a href="/about" className="text-base text-gray-500 hover:text-gray-900">
								About
							</a>
						</div>

						<div className="px-5 py-2">
							<a href="https://medium.com/yieldscan" className="text-base text-gray-500 hover:text-gray-900" target="_blank">
								Blog
							</a>
						</div>

						<div className="px-5 py-2">
							<a href="/careers" className="text-base text-gray-500 hover:text-gray-900">
								Jobs
							</a>
						</div>

						<div className="px-5 py-2">
							<a href="/privacy" className="text-base text-gray-500 hover:text-gray-900">
								Privacy
							</a>
						</div>

						<div className="px-5 py-2">
							<a href="/terms" className="text-base text-gray-500 hover:text-gray-900">
								Terms
							</a>
						</div>

						<div className="px-5 py-2">
							<a href="/disclaimer" className="text-base text-gray-500 hover:text-gray-900">
								Disclaimer
							</a>
						</div>
					</nav>
					<div className="mt-8 flex justify-center space-x-6">

						<a href="https://twitter.com/yieldscan" className="text-gray-500 hover:text-gray-600">
							<span className="sr-only">Twitter</span>
							<FaTwitter className="h-6 w-6" />
						</a>

						<a href="https://github.com/yieldscan" className="text-gray-500 hover:text-gray-600">
							<span className="sr-only">GitHub</span>
							<FaGithub className="h-6 w-6" />
						</a>

						<a href="https://t.me/yieldscan" className="text-gray-500 hover:text-gray-600">
							<span className="sr-only">Telegram</span>
							<FaTelegram className="h-6 w-6" />
						</a>

						<a href="https://discord.gg/5Dggqx8" className="text-gray-500 hover:text-gray-600">
							<span className="sr-only">Discord</span>
							<FaDiscord className="h-6 w-6" />
						</a>
						
						<a href="hmailto:contact@yieldscan.app" className="text-gray-500 hover:text-gray-600">
							<span className="sr-only">Email</span>
							<FaEnvelope className="h-6 w-6" />
						</a>
					</div>
				</div>
			</footer>
		)
	);
};

export default Footer;
