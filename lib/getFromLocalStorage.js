const getFromLocalStorage = (name, key) => {
	// Get the existing data
	const existing = window?.localStorage.getItem(name);

	// If no existing data, create an array
	// Otherwise, convert the localStorage string to an array
	const data = existing ? JSON.parse(existing) : null;

	return data ? data[key] : data;
};
export default getFromLocalStorage;
