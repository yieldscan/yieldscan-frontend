import {
	Avatar,
	Box,
	Flex,
	Image,
	Link,
	Popover,
	PopoverArrow,
	PopoverBody,
	PopoverContent,
	PopoverTrigger,
	SimpleGrid,
	Stack,
	Text,
} from "@chakra-ui/core";
import {
	FaGithub,
	FaGlobe,
	FaLinkedin,
	FaQuoteLeft,
	FaTwitter,
} from "react-icons/fa";

const members = [
	{
		avatar_url: "/images/team/saumya-karan.png",
		bio:
			"Truth seeker. Spending mindspace in solving UX problems in onboarding people to decentralized economic networks.",
		name: "Saumya Karan",
		twitter_username: "saumya_karan",
		blog: "https://saumyakaran.com/",
		url: "https://github.com/saumyakaran",
		linked_in: "skrn",
		role: "Co-founder, CEO",
	},
	{
		avatar_url: "/images/team/sahil-nanda.png",
		bio:
			"Studying validator & nominator relationships across various PoS stakes.",
		name: "Sahil Nanda",
		url: "https://github.com/sahilnanda1995",
		linked_in: "sahil-nanda-8b1b88143",
		role: "Co-founder, CTO",
	},
	{
		avatar_url: "/images/team/prastut-kumar.png",
		bio:
			"Insatiably curious. Currently a student of cryptoeconomics and reality.",
		name: "Prastut Kumar",
		twitter_username: "prastutkumar",
		blog: "https://prastutkumar.com/",
		url: "https://github.com/prastut",
		linked_in: "prastut",
		role: "Co-founder, Head of Strategy",
	},
	{
		bio:
			"aspiring flat-earther • trying not to sleep walk through life • dropped on the head as an infant",
		name: "Suryansh Singh",
		twitter_username: "surpsi",
		url: "https://github.com/Lord-of-Codes",
		role: "Strategist",
	},
];

const contributors = [
	{
		avatar_url:
			"https://avatars1.githubusercontent.com/u/6816349?s=400&u=57c6da8e57015d5a1d4768fc0290e0b785ab06b0&v=4",
		name: "Abhinav Thukral",
		url: "https://github.com/AbhinavThukral97",
	},
	{
		avatar_url:
			"https://avatars1.githubusercontent.com/u/22184427?s=400&u=3aa937cb3ba837591bc92cce04fc1bc019ca79a9&v=4",
		name: "Akshat Bhargava",
		url: "https://github.com/akshatbhargava123",
	},
];

const SocialLink = ({ icon, href }) => {
	return (
		<Link
			display="inline-flex"
			alignItems="center"
			justifyContent="center"
			rounded="full"
			href={href}
			mr={2}
			isExternal
			color="gray.600"
			_focus={{ boxShadow: "none" }}
			_hover={{ color: "teal.500" }}
		>
			{/* <Icon
				as={icon}
				transition="all 0.2s"
				_hover={{ color: "teal.600" }}
				fontSize="xl"
				color="teal.500"
			/> */}
			{icon}
		</Link>
	);
};

const Member = ({ member }) => {
	const {
		avatar_url: avatarUrl,
		bio,
		name,
		twitter_username: twitterUsername,
		blog: websiteUrl,
		url,
		role,
		linked_in: linkedIn,
	} = member;

	return (
		<Box>
			<Stack direction="row" spacing={6}>
				<Avatar size="xl" src={avatarUrl} />
				<Stack spacing={3} maxW="320px">
					<Text fontWeight="semibold" fontSize="md" color="gray.600">
						{name}
						{role && (
							<Text as="span" display="block" fontSize="xs" fontWeight="normal">
								{role}
							</Text>
						)}
					</Text>

					<Text fontSize="sm" color="gray.500">
						{bio}
					</Text>
					<Stack isInline align="center" spacing={2}>
						<SocialLink href={url} icon={<FaGithub />} />
						{twitterUsername && (
							<SocialLink
								href={`https://twitter.com/${twitterUsername}`}
								icon={<FaTwitter />}
							/>
						)}
						{linkedIn && (
							<SocialLink
								href={`https://www.linkedin.com/in/${linkedIn}`}
								icon={<FaLinkedin />}
							/>
						)}
						{websiteUrl && <SocialLink href={websiteUrl} icon={<FaGlobe />} />}
					</Stack>
				</Stack>
			</Stack>
		</Box>
	);
};

const Contributor = ({ contributor }) => {
	const { avatar_url: avatarUrl, name, url } = contributor;
	return (
		<Popover trigger="hover" placement="top" usePortal>
			<PopoverTrigger>
				<Link
					href={url}
					mx={6}
					mb={4}
					rounded="full"
					transition="ease-in 0.125s"
					isExternal
					_focus={{ boxShadow: "none" }}
					_hover={{ transform: "scale(1.1)" }}
				>
					<Avatar size="lg" name={name} src={avatarUrl} />
				</Link>
			</PopoverTrigger>
			<PopoverContent
				rounded="lg"
				_focus={{ outline: "none" }}
				bg="gray.600"
				border="none"
				w="fit-content"
				color="white"
			>
				<PopoverArrow />
				<PopoverBody>{name}</PopoverBody>
			</PopoverContent>
		</Popover>
	);
};

const About = () => {
	return (
		<div className="pt-24 w-full min-h-full px-4 sm:px-8 md:px-12 lg:px-20 xl:px-32 flex flex-col items-center">
			<h1 className="text-6xl">👨‍💻👩‍💻</h1>
			<h1 className="text-5xl text-gray-700 font-bold text-center">
				We are creators
			</h1>
			<Text maxW="48ch" mx="auto" fontSize="lg" textAlign="center" color="gray.600">
				Our joy lies in making things that catalyze human progress.<br /> We strive to spark magical emotions that transcend rationality for those who use our products.
			</Text>
			<h1 className="text-3xl text-gray-700 font-bold text-center mt-20 mb-16">
				💪🏻 Core team
			</h1>
			<SimpleGrid columns={[1, 1, 2]} spacing="40px" pt="3">
				{members.map((member) => (
					<Member key={member.name} member={member} />
				))}
			</SimpleGrid>
			<h1 className="text-3xl text-gray-700 font-bold text-center mt-48 mb-16">
				📜 Our story
			</h1>
			<Text maxW="70ch" mx="auto" color="gray.600" textAlign="center">
				The foundation for YieldScan was laid during mid-2019, when we noticed
				that information asymmetry in the decentralized finance (DeFi) space
				leads to a high barrier of entry for newcomers and non-technical
				enthusiasts.
			</Text>
			<blockquote className="rounded-xl text-gray-700 my-8 pt-8 pb-12  flex flex-col items-center bg-gray-100 px-16">
				<span className="rounded-full bg-gray-700 h-12 w-12 flex justify-center items-center mb-4">
					<FaQuoteLeft color="white" />
				</span>
				<p className="text-center text-xl">
					The future is already here — it's just not evenly distributed.
				</p>
				<p className="mt-4 text-xs text-right">William Ford Gibson</p>
			</blockquote>
			<Text maxW="70ch" mx="auto" color="gray.600" textAlign="center" mb={16}>
				DeFi is the future and YieldScan is our attempt to distribute it
				equally.
			</Text>
			<Stack spacing={8} mt={{ base: "40px", md: "100px" }}>
				<h1 className="text-3xl text-gray-700 font-bold text-center mt-20 mb-16">
					💖 Project Contributors
				</h1>
				<Flex flexWrap="wrap" justifyContent="center" maxW="lg" mx="auto">
					{contributors.map((contributor) => (
						<Contributor key={contributor.name} contributor={contributor} />
					))}
				</Flex>
			</Stack>
			<div className="w-screen bg-teal-500 py-8 flex justify-center items-center mt-32">
				<p className="text-2xl text-white mr-8">
					Looking to build the future?
				</p>
				<Link
					href="https://www.notion.so/Careers-at-YieldScan-aea97220f05b4362be6cd18d49217f7a"
					className="min-w-max-content"
					color="teal.500"
					backgroundColor="white"
					rounded="md"
					fontWeight="normal"
					fontSize="lg"
					py={2}
					px={12}
					_hover={{ bg: "white", transform: "scale(1.03)" }}
					_focus={{ boxShadow: "none" }}
				>
					See careers
				</Link>
			</div>
			<div className="max-w-65-rem mb-32">
				<h1 className="text-3xl text-gray-700 font-bold text-center mt-32 mb-16">
					We’re backed by the best
				</h1>
				<div className="flex items-center justify-between">
					<div className="w-1/3">
						<Image
							src="/images/web3foundation_grants_badge_black.png"
							alt="Web3 Foundation Grants Badge"
							w={300}
							h={120}
							mr={-2}
						/>
					</div>
					<Box
						h="fill-available"
						minH={300}
						borderRightWidth={1}
						borderColor="gray-300"
					/>
					<p className="w-1/3 text-gray-700">
						YieldScan is funded by{" "}
						<span className="font-semibold">Web3 Foundation</span> under{" "}
						<span className="font-semibold">Wave 6</span> of the General Grants
						Program. See{" "}
						<Link
							href="https://medium.com/web3foundation/web3-foundation-grants-wave-6-recipients-5ed8d5cc179"
							color="teal.500"
							isExternal
						>
							official announcement
						</Link>
						. <br />
						<br /> Web3 Foundation funds development work driving advancement
						and adoption of decentralized software protocols.
					</p>
				</div>
			</div>
		</div>
	);
};

export default About;
