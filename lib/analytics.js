import { isNil } from "lodash";
import * as Fathom from "fathom-client";

const amplitude_token = isNil(process.env.NEXT_PUBLIC_AMPLITUDE_API_TOKEN)
	? ""
	: process.env.NEXT_PUBLIC_AMPLITUDE_API_TOKEN;

let amplitude;

const trackEvent = async (eventName = "", eventProperties = {}) => {
	if (!window) return;
	const obj = localStorage.getItem(
		"metomic-consented-pol:" + process.env.NEXT_PUBLIC_METOMIC_CONSENT_ID
	);
	if (obj && JSON.parse(obj).enabled) {
		if (!amplitude) {
			const Amplitude = await import("amplitude-js");
			amplitude = Amplitude.getInstance();
			amplitude.init(amplitude_token, null, {
				includeUtm: true,
				includeReferrer: true,
				includeGclid: true,
			});
		}

		amplitude.logEvent(eventName, eventProperties);
	}
};

const setUserProperties = async (userProperties = {}) => {
	if (!window) return;
	const obj = localStorage.getItem(
		"metomic-consented-pol:" + process.env.NEXT_PUBLIC_METOMIC_CONSENT_ID
	);
	if (obj && JSON.parse(obj).enabled) {
		if (!amplitude) {
			const Amplitude = await import("amplitude-js");
			amplitude = Amplitude.getInstance();
			amplitude.init(amplitude_token, null, {
				includeUtm: true,
				includeReferrer: true,
				includeGclid: true,
			});
			amplitude.clearUserProperties();
		}
		amplitude.setUserProperties(userProperties);
	}
};

const track = (goalCode = '') => {
    if (typeof window != "undefined") 
	{ 
		Fathom.trackGoal(goalCode, 0) 
	}
  };


const Events = {
	// General
	PAGE_VIEW: "Visited Page",

	LANDING_CTA_CLICK: "User clicked CTA to redirect to reward calculator",

	// Wallet connection popover
	WALLET_CONNECTED: "Wallet successfully authorized",
	EXTENSION_AUTH_REJECTED: "Extension auth rejected or extension unavailable",
	INTENT_CONNECT_WALLET: "Intention to connect wallet",
	INTENT_ACCOUNT_SELECTION: "Intention to select account",
	ACCOUNT_SELECTED: "Account Selected",
	AUTH_REJECTED: "extension auth rejected or no extension available",
	AUTH_ALLOWED: "Wallet successfully connected, auth approved",

	USER_ACCOUNT_SELECTION: "USER_ACCOUNT_SELECTION",

	// Reward Calculator
	REWARD_CALCULATED:
		"User changed at least one of the inputs on the calculator (boolean)",
	INTENT_ADVANCED_SELECTION: "INTENT_ADVANCED_SELECTION",
	CALCULATOR_CTA_CLICK: "User clicked CTA to redirect to confirmation",
	INTENT_STAKING: "INTENT_STAKING",

	// Payment steps (confirmation, reward destination and final transaction)

	TOGGLE_VALIDATORS: "User toggled show/hide suggested validators",
	TOGGLE_ADV_PREFS: "User toggled show/hide advanced preferences",
	ADV_PREFS_EDIT: "User edited an advanced preference",

	PAYMENT_STEP_UPDATED: "PAYMENT_STEP_UPDATED",
	INTENT_TRANSACTION: "INTENT_TRANSACTION",
	TRANSACTION_SENT: "Transaction successfully sent to chain",
	TRANSACTION_SUCCESS: "TRANSACTION_SUCCESS",
	TRANSACTION_FAILED: "TRANSACTION_FAILED",
};

const goalCodes = {
	
	OVERVIEW: {
		INTENT_CONNECT_WALLET: "3OQQGKS1",
		INTENT_UNBOND: "XTLIJNSS",
		INTENT_BOND_EXTRA: "6NYQPLQS",
		INTENT_REBOND: "H0HPGZRP",

		CHECKED_UNBONDING_PERIOD: "SAWAOS0R",
		CHECKED_VALIDATORS: "FHMPGJSW",

		BOND_EXTRA_SUCCESSFUL:"4TSE6XRW",
		UNBOND_SUCCESSFUL: "XS9PBNPI",
		REBOND_SUCCESSFUL: "QCSEWTTG",

		BOND_EXTRA_UNSUCCESSFUL: "PYHAWFI4",
		UNBOND_UNSUCCESSFUL: "M15QOJRM",
		REBOND_UNSUCCESSFUL: "UQQWPPN6",
	},

	GLOBAL: {
		WALLET_CONNECTED: "N66PMOVF",
		ACCOUNT_SELECTED: "ACEHTV4U",
	}
	
}

export { setUserProperties, trackEvent, track, Events, goalCodes};

