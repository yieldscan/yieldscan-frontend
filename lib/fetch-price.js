import _axios from "axios";
import { isNil, get } from "lodash";

// TODO: don't fetch again and again on every change.
const fetchPrice = async (
	price,
	coingeckoDenom
	// subCurrency = "USD"
) => {
	if (isNil(coingeckoDenom)) {
		return 0;
	}

	if (isNil(price)) {
		const res = await _axios(
			`https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoDenom}&vs_currencies=usd`
		);
		const data = res.data;
		return get(data, coingeckoDenom + ".usd");
	} else return price;
};

export default fetchPrice;
