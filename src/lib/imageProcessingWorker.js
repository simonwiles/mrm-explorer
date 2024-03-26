(() => {
	onmessage = async function (event) {
		const { id, x, y, w, h, canvas } = event.data;

		const port = event.ports[0];
		const ctx = canvas.getContext('2d');
		canvas.width = w;
		canvas.height = h;
		// createImageBitmap(imageBlob).then((imageBitmap) => {
		// 	ctx.drawImage(imageBitmap, x, y, w, h, 0, 0, w, h);
		// 	port.postMessage('success');
		// });

		let db;
		let DBOpenReq = indexedDB.open('mrmExplorer', 10);

		DBOpenReq.addEventListener('success', (ev) => {
			//DB has been opened... after upgradeneeded
			db = ev.target.result;
			// console.log('success', db);
			let tx = db.transaction('images', 'readonly');
			tx.onerror = (err) => {
				console.warn(err);
			};
			tx.oncomplete = (ev) => {
				//get transaction complete
			};
			let store = tx.objectStore('images');
			let req = store.get(id);
			req.onsuccess = (ev) => {
				let request = ev.target;
				// console.log('got', request.result.imageBlob);

				createImageBitmap(request.result.imageBlob).then((imageBitmap) => {
					ctx.drawImage(imageBitmap, x, y, w, h, 0, 0, w, h);
					port.postMessage('success');
				});
			};
		});

		DBOpenReq.addEventListener('error', (err) => {
			//Error occurred while trying to open DB
			console.warn(err);
		});

		DBOpenReq.addEventListener('upgradeneeded', (err) => {
			//Error occurred while trying to open DB
			console.warn(err);
		});
	};
})();
