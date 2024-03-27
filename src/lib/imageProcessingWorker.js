onmessage = async function (event) {
	const { imageBlob, x, y, w, h, canvas } = event.data;
	const port = event.ports[0];
	canvas.width = w;
	canvas.height = h;
	const ctx = canvas.getContext('bitmaprenderer');
	const imageBitmap = await createImageBitmap(imageBlob);
	const croppedBitmap = await createImageBitmap(imageBitmap, x, y, w, h);
	ctx.transferFromImageBitmap(croppedBitmap);
	imageBitmap.close();
	croppedBitmap.close();
	port.postMessage('success');
};
