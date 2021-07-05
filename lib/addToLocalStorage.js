const addToLocalStorage = (name, key, value) => {
	// Get the existing data
	const existing = window?.localStorage.getItem(name);

	// If no existing data, create an array
	// Otherwise, convert the localStorage string to an array
	const obj = existing ? JSON.parse(existing) : {};

	// Add new data to localStorage Array
	obj[key] = value;

	// Save back to localStorage
	window?.localStorage.setItem(name, JSON.stringify(obj));
};
export default addToLocalStorage;
