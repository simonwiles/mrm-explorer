/**
 * @param {Feature} feature
 * @returns {number[][]}
 */
export const getVertices = (feature) => feature.geometry.coordinates[0].map(([x, y]) => [x, 1 - y]);

/**
 * @param {Feature} feature
 * @returns {{left: number, top: number, right: number, bottom: number}}
 */
export const getRectangle = (feature) => {
	const vertices = getVertices(feature);
	return {
		left: Math.min(...vertices.map(([x]) => x)),
		top: Math.min(...vertices.map(([, y]) => y)),
		right: Math.max(...vertices.map(([x]) => x)),
		bottom: Math.max(...vertices.map(([, y]) => y))
	};
};

/**
 * @param {Feature} feature
 * @returns {{x: number, y: number}}
 */
export const getCenter = (feature) => {
	const rect = getRectangle(feature);
	return {
		x: rect.left + (rect.right - rect.left) / 2,
		y: rect.top + (rect.bottom - rect.top) / 2
	};
};

/**
 * @param {ImageBitmap} imageBitmap
 * @param {Feature} feature
 * @returns {{croppedBitmap: Promise<ImageBitmap>, width: number, height: number}}
 */
export const getFeatureClip = (imageBitmap, feature) => {
	const rect = getRectangle(feature);
	const height = rect.bottom - rect.top;
	const width = rect.right - rect.left;
	const croppedBitmap = createImageBitmap(imageBitmap, rect.left, rect.top, width, height);
	return { croppedBitmap, width, height };
};
