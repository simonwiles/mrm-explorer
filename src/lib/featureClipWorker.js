import { fetchImageObjectById, insertFeature } from './db';

// async function clipFeature({ imageBitmap, x, y, w, h }) {
// 	let canvas = new OffscreenCanvas(w, h);
// 	const ctx = canvas.getContext('bitmaprenderer');
// 	// createImageBitmap(imageBlob).then((imageBitmap) => {
// 	// 	ctx.drawImage(imageBitmap, x, y, w, h, 0, 0, w, h);
// 	// 	port.postMessage('success');
// 	// });

// 	ctx?.drawImage(imageBitmap, x, y, w, h, 0, 0, w, h);
// 	const blob = await canvas.convertToBlob();
// 	canvas = undefined;
// 	return blob;
// }

const getRectangle = (coordinates) => {
	return [
		Math.min(...coordinates.map(([x]) => x)),
		Math.min(...coordinates.map(([, y]) => y)),
		Math.max(...coordinates.map(([x]) => x)),
		Math.max(...coordinates.map(([, y]) => y))
	];
};

onmessage = async function (event) {
	console.log(performance.now(), 'starting worker');
	const { imageId, features } = event.data;
	// const port = event.ports[0];

	const imageObject = await fetchImageObjectById(imageId);
	const imageBitmap = await createImageBitmap(imageObject.imageBlob);
	for (const [featureId, feature] of features.entries()) {
		const [x, y, w, h] = getRectangle(feature.geometry.coordinates[0].map(([x, y]) => [x, 1 - y]));
		console.log(performance.now(), featureId, feature.properties.text, [x, y, w, h]);
		const croppedBitmap = await createImageBitmap(imageBitmap, x, y, w, h);
		let canvas = new OffscreenCanvas(w, h);
		const ctx = canvas.getContext('bitmaprenderer');
		ctx.transferFromImageBitmap(croppedBitmap);
		const featureImage = await canvas.convertToBlob();
		croppedBitmap.close();

		insertFeature({
			imageId,
			featureId,
			text: feature.properties.text,
			score: feature.properties.score,
			featureImage
			// featureImage: await clipFeature({ imageBitmap, x, y, w, h })
		});
	}
	imageBitmap.close();
};

//  const canvas = new OffscreenCanvas(w, h);
// 	const ctx = canvas.getContext('2d');
// 	canvas.width = w;
// 	canvas.height = h;
// 	createImageBitmap(imageBlob)
// 		.then((imageBitmap) => {
// 			ctx?.drawImage(imageBitmap, 0, 0, w, h);
// 		})
// 		.then(() => {
// 			canvas.convertToBlob().then((blob) => port.postMessage(blob));
// 		});
// };
