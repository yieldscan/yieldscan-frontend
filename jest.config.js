// Jest.config.js
module.exports = {
	// Automatically clear mock calls and instances between every test
	clearMocks: true,
	transformIgnorePatterns: [
		// Change MODULE_NAME_HERE to your module that isn't being compiled
		// "/node_modules/(?!MODULE_NAME_HERE).+\\.js$",
		"/node_modules/(?!@polkadot|@babel/runtime/helpers/esm/)",
	],
	transform: {
		"^.+\\.(js|jsx|ts|tsx)$": "<rootDir>/node_modules/babel-jest",
	},
	// The directory where Jest should output its coverage files
	coverageDirectory: ".coverage",
	moduleNameMapper: {
		"^@components(.*)$": "<rootDir>/components$1",
		"^@lib(.*)$": "<rootDir>/lib$1",
		"yieldscan.config": "<rootDir>/yieldscan.config",
	},
	// A list of paths to modules that run some code to configure or set up the testing framework before each test
	setupFilesAfterEnv: ["./jest.setup.js"],
	globalSetup: "<rootDir>/setupEnv",
};
