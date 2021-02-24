const convertRemainingErasToSecs = (eraLength, eraProgress, remainingEras) => {
	const blocksRemaining =
		(remainingEras - 1) * eraLength + eraLength - eraProgress;

	// taking block time constant as 6secs
	return blocksRemaining * 6;
};

export default convertRemainingErasToSecs;
