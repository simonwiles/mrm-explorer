(() => {
	onmessage = async function (event) {
		const { imageBlob, x, y, w, h, canvas } = event.data;
		const port = event.ports[0];
		const ctx = canvas.getContext('2d');
		canvas.width = w;
		canvas.height = h;
		createImageBitmap(imageBlob).then((imageBitmap) => {
			ctx.drawImage(imageBitmap, x, y, w, h, 0, 0, w, h);
			port.postMessage('success');
		});
	};
})();
