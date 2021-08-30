import axios from "axios";
// import { isNil } from "lodash";

const getRewardsSum = async (address, networkInfo) => {
	const headers = {
		"Content-Type": "application/json; charset=utf-8",
		"X-API-Key": process.env.NEXT_PUBLIC_SUBSCAN_KEY,
	};

	const rewardSum = axios
		.post(
			`https://${networkInfo.network}.api.subscan.io/api/scan/staking_history`,
			{
				row: 20,
				page: 0,
				address: address,
			},
			{
				headers: headers,
			}
		)
		.then((rewards) => {
			return rewards.data.data.sum;
		})
		.catch((err) => {
			throw err;
		});

	return rewardSum;
};

export default getRewardsSum;
