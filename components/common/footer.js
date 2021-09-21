import Link from 'next/link'
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
							<Link href="/about">
								<a className="text-base text-gray-500 hover:text-gray-900">
									About
								</a>
							</Link>
						</div>

						<div className="px-5 py-2">
							<Link href="https://medium.com/yieldscan">
								<a className="text-base text-gray-500 hover:text-gray-900" target="_blank">
									Blog
								</a>
							</Link>
						</div>

						<div className="px-5 py-2">
							<Link href="/careers">
								<a className="text-base text-gray-500 hover:text-gray-900">
									Jobs
								</a>
							</Link>
						</div>

						<div className="px-5 py-2">
							<Link href="/privacy">
								<a className="text-base text-gray-500 hover:text-gray-900">
									Privacy
								</a>
							</Link>
						</div>

						<div className="px-5 py-2">
							<Link href="/terms">
								<a className="text-base text-gray-500 hover:text-gray-900">
									Terms
								</a>
							</Link>
						</div>

						<div className="px-5 py-2">
							<Link href="/disclaimer">
								<a className="text-base text-gray-500 hover:text-gray-900">
									Disclaimer
								</a>
							</Link>
						</div>
					</nav>
					<div className="mt-8 flex justify-center space-x-6">

						<Link href="https://twitter.com/yieldscan">
							<a className="text-gray-500 hover:text-gray-600">
								<span className="sr-only">Twitter</span>
								<FaTwitter className="h-6 w-6" />
							</a>
						</Link>

						<Link href="https://github.com/yieldscan">
							<a className="text-gray-500 hover:text-gray-600">
								<span className="sr-only">GitHub</span>
								<FaGithub className="h-6 w-6" />
							</a>
						</Link>

						<Link href="https://t.me/yieldscan">
							<a className="text-gray-500 hover:text-gray-600">
								<span className="sr-only">Telegram</span>
								<FaTelegram className="h-6 w-6" />
							</a>
						</Link>

						<Link href="https://discord.gg/5Dggqx8">
							<a className="text-gray-500 hover:text-gray-600">
								<span className="sr-only">Discord</span>
								<FaDiscord className="h-6 w-6" />
							</a>
						</Link>

						<Link href="mailto:contact@yieldscan.app">
							<a className="text-gray-500 hover:text-gray-600">
								<span className="sr-only">Email</span>
								<FaEnvelope className="h-6 w-6" />
							</a>
						</Link>

					</div>
				</div>
			</footer>
		)
	);
};

export default Footer;
