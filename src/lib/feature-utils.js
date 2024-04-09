/** @param {Feature} feature */
export const getVertices = (feature) => feature.geometry.coordinates[0].map(([x, y]) => [x, 1 - y]);

/** @param {number[][]} coordinates */
export const getRectangle = (coordinates) => {
	return [
		Math.min(...coordinates.map(([x]) => x)),
		Math.min(...coordinates.map(([, y]) => y)),
		Math.max(...coordinates.map(([x]) => x)),
		Math.max(...coordinates.map(([, y]) => y))
	];
};

/**
 * @param {ImageBitmap} imageBitmap
 * @param {Feature} feature
 */
export const getFeatureClip = (imageBitmap, feature) => {
	const vertices = getVertices(feature);
	const rect = getRectangle(vertices);
	const height = rect[3] - rect[1];
	const width = rect[2] - rect[0];
	const croppedBitmap = createImageBitmap(imageBitmap, rect[0], rect[1], width, height);
	return { croppedBitmap, width, height };
};
