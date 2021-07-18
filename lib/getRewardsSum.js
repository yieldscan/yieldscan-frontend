import axios from "axios";
// import { isNil } from "lodash";

const getRewardsSum = async (address, networkInfo) => {
	const rewardSum = axios
		.post(
			`https://${networkInfo.network}.subscan.io/api/scan/staking_history`,
			{
				row: 20,
				page: 0,
				address: address,
			}
		)
		.then((rewards) => {
			return rewards.data.data.sum;
		})
		.catch((err) => {
			console.error(`Couldn't fetch data from subscan. Error: ${err}`);
		});

	return rewardSum;
};

export default getRewardsSum;
