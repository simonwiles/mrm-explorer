/**
 * Creates a debounced function.
 * @param {Function} callback - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @return {Function} The debounced function
 */
export const debounce = (callback, wait) => {
	/** @type {number | null} */
	let timeoutId = null;
	return (/** @type {any[]} */ ...args) => {
		timeoutId && window.clearTimeout(timeoutId);
		timeoutId = window.setTimeout(() => callback(...args), wait);
	};
};
