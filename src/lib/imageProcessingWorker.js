onmessage = async function (event) {
	const { imageBitmap, canvas, x, y, w, h } = event.data;
	const port = event.ports[0];
	const ctx = canvas.getContext('bitmaprenderer');
	const croppedBitmap = await createImageBitmap(imageBitmap, x, y, w, h);
	ctx.transferFromImageBitmap(croppedBitmap);
	imageBitmap.close();
	croppedBitmap.close();
	port.postMessage('success');
};
