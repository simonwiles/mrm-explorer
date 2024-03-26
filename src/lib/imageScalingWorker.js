(() => {
	onmessage = async function (event) {
		const { imageBlob, w, h } = event.data;
		const port = event.ports[0];
		const canvas = new OffscreenCanvas(w, h);
		const ctx = canvas.getContext('2d');
		canvas.width = w;
		canvas.height = h;
		createImageBitmap(imageBlob)
			.then((imageBitmap) => {
				ctx?.drawImage(imageBitmap, 0, 0, w, h);
			})
			.then(() => {
				canvas.convertToBlob().then((blob) => port.postMessage(blob));
			});
	};
})();
