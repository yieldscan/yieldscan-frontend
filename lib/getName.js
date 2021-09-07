import { isNil } from "lodash";

export function fitDisplayName(str) {
	if (str.length > 17) {
		return str.slice(0, 7) + "..." + str.slice(-7);
	} else return str;
}

export function getName(name, parentName, stashId) {
	if (isNil(name) && isNil(parentName)) {
		return stashId.slice(0, 7) + "..." + stashId.slice(-7);
	} else {
		const fullName = isNil(parentName) ? name : parentName + "/" + name;
		return fitDisplayName(fullName);
	}
}
