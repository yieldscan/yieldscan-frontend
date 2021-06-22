/**
 * @jest-environment jsdom
 */
import HomePage from "../pages/index";
import { render, act } from "@testing-library/react";
import addToLocalStorage from "@lib/addToLocalStorage";
import calculateReward from "@lib/calculate-reward";
import fetchPrice from "@lib/fetch-price";
import formatCurrency from "@lib/format-currency";
import getRewards from "@lib/getRewards";

const networkInfo = {
	id: "polkadot-cc1",
	name: "Polkadot",
	network: "polkadot",
	isTestNetwork: false,
	denom: "DOT",
	coinGeckoDenom: "polkadot",
	decimalPlaces: 10,
	twitterUrl: "@Polkadot",
	addressPrefix: 0,
	nodeWs: process.env.NEXT_PUBLIC_POLKADOT,
	erasPerDay: 1,
	lockUpPeriod: 28,
	minAmount: 1,
	recommendedAdditionalAmount: 50,
	about: "Polkadot is a heterogeneous multi‑chain technology.",
};

const validators = [
	{
		_id: "60cdd27bc7d4a50cda544fd0",
		stashId: "12HgRTrU7VP8jJPHXmpn9x22CYh5esTm4qvcJ8qtPpzoBbQv",
		commission: 1,
		totalStake: 2174134.5742118503,
		estimatedPoolReward: 998.5240503699762,
		numOfNominators: 120,
		rewardsPer100KSM: 0.04546606063536714,
		riskScore: 0.30689548060507726,
		oversubscribed: false,
		name: "CABLE-X 01",
		ownStake: 11334.8747389956,
		othersStake: 2162799.699472855,
	},
	{
		_id: "60cdd27bc7d4a50cda544fd1",
		stashId: "15KDFYfFjdqhp3MDFEtHuyu9kLpXbT7k1zjx78MphViFdCaU",
		commission: 3,
		totalStake: 2173066.8692374625,
		estimatedPoolReward: 1016.6790331039758,
		numOfNominators: 159,
		rewardsPer100KSM: 0.045379794624648154,
		riskScore: 0.2995372687244331,
		oversubscribed: false,
		name: "redpenguin",
		ownStake: 11528.1829288476,
		othersStake: 2161538.686308615,
	},
	{
		_id: "60cdd27bc7d4a50cda544fd2",
		stashId: "16Ar9KjX2LQf2CdTrTxbyxPjDNswhL7qPhnwcr8ocMynBRWo",
		commission: 2,
		totalStake: 2170845.99834284,
		estimatedPoolReward: 954.6704312909973,
		numOfNominators: 42,
		rewardsPer100KSM: 0.04309536134843227,
		riskScore: 0.45311459361663603,
		oversubscribed: false,
		name: "01",
		ownStake: 5264.9044060748,
		othersStake: 2165581.093936765,
	},
	{
		_id: "60cdd27bc7d4a50cda544fd3",
		stashId: "12CJw9KNkC7FzVVg3dvny4PWHjjkvdyM17mmNfXyfucp8JfM",
		commission: 2,
		totalStake: 2303822.511526739,
		estimatedPoolReward: 961.8128558722035,
		numOfNominators: 15,
		rewardsPer100KSM: 0.04091181860670057,
		riskScore: 0.39032869494292033,
		oversubscribed: false,
		name: "Dionysus🍇",
		ownStake: 10819.2777574867,
		othersStake: 2293003.2337692524,
	},
	{
		_id: "60cdd27bc7d4a50cda544fd4",
		stashId: "16aFDVsp6zd6VxUSgd34es3r23nWRkoj3NdLTS5Fk1Ez9MU1",
		commission: 3,
		totalStake: 2173978.84757375,
		estimatedPoolReward: 889.5941539659789,
		numOfNominators: 105,
		rewardsPer100KSM: 0.03969066394762978,
		riskScore: 0.3102256428867582,
		oversubscribed: false,
		name: "ARCHIPEL VALIDATOR 1",
		ownStake: 11323.3310971598,
		othersStake: 2162655.51647659,
	},
	{
		_id: "60cdd27bc7d4a50cda544fd5",
		stashId: "14ices1G5qTmqhMfDVBECh4jotNDGTLu8fhE9YktWT3cLF2F",
		commission: 1,
		totalStake: 2174656.171054109,
		estimatedPoolReward: 871.0757939974674,
		numOfNominators: 230,
		rewardsPer100KSM: 0.039653412531277125,
		riskScore: 0.3109925610146295,
		oversubscribed: false,
		name: "V1",
		ownStake: 10212.1104031375,
		othersStake: 2164444.0606509717,
	},
];

// `describe` is not required, but it helps the tests read nicely
describe("tests for reward caculation", () => {
	// Each test for the component will get an `it` block
	test("test with negative value to throw error", () => {
		calculateReward(1, validators, -1, 12, "months", true, networkInfo)
			.then(() => {})
			.catch((err) => {
				expect(err.message).toEqual("Amount cannot be negative.");
			});
	});
	test("test with 0 amount inputs", () => {
		calculateReward(1, validators, 0, 12, "months", true, networkInfo).then(
			(data) =>
				expect(data).toEqual({
					returns: {
						currency: 0,
						subCurrency: 0,
					},
					portfolioValue: {
						currency: 0,
						subCurrency: 0,
					},
					yieldPercentage: 0,
				})
		);
	});
});

describe("test fetchPrice", () => {
	// Each test for the component will get an `it` block
	test("test for testnets", () => {
		fetchPrice(1, null).then((data) => {
			expect(data).toEqual(0);
		});
	});
	test("test for Polkadot", () => {
		fetchPrice(null, "polkadot").then((data) => {
			expect(data).toBeGreaterThan(0);
		});
	});
	test("test for kusama", () => {
		fetchPrice(null, "kusama").then((data) => {
			expect(data).toBeGreaterThan(0);
		});
	});
});

describe("test format balances", () => {
	// Each test for the component will get an `it` block
	test("throw on invalid input", () => {
		expect(() =>
			formatCurrency.methods.formatAmount(10.1213, networkInfo)
		).toThrow();
	});
	test("test for Polkadot", () => {
		expect(
			formatCurrency.methods.formatAmount(10000000000, networkInfo)
		).toEqual("1.0000 DOT");
	});
});

describe("test fetching rewards", () => {
	// Each test for the component will get an `it` block
	test("test for Polkadot address", () => {
		getRewards(
			"12VrmvZWmcWR5swfUkirXUBjYmkTZtw3Ue4D25SAFvvmBkEU",
			networkInfo
		).then((data) => {
			expect(data).toBeGreaterThan(0);
		});
	});
});
