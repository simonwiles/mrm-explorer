/**
 * Retrieves the current usage and available quota for the origin bucket
 * 	usage.usage -> Bytes used.
 *	usage.quota -> Maximum number of bytes available.
 * See https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/estimate
 * @return {Promise<StorageEstimate | undefined >} The storage estimate object containing usage and quota information
 */
export const storageUsage = async () => {
	try {
		if (navigator.storage && navigator.storage.estimate) {
			const usage = await navigator.storage.estimate();
			return usage;
		}
		throw new Error('navigator.storage is not available');
	} catch (error) {
		console.error(`Failed to get storage stats: ${error}`);
		new Error(`error: ${error}`);
	}
};

/**
 * Format bytes as a human-readable string
 * @param {number} bytes
 * @return {string}
 */
export const formatBytes = (bytes) => {
	const units = ['bytes', 'KiB', 'MiB', 'GiB'];
	let l = 0;
	let n = bytes;
	while (n >= 1024 && ++l) {
		n = n / 1024;
	}
	return n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l];
};
