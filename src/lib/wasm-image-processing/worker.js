(() => {
	// ../pkg/wasm_crop.js
	var import_meta = {};
	var wasm;
	var cachegetUint8Memory0 = null;
	function getUint8Memory0() {
		if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
			cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
		}
		return cachegetUint8Memory0;
	}
	var WASM_VECTOR_LEN = 0;
	function passArray8ToWasm0(arg, malloc) {
		const ptr = malloc(arg.length * 1);
		getUint8Memory0().set(arg, ptr / 1);
		WASM_VECTOR_LEN = arg.length;
		return ptr;
	}
	var cachegetInt32Memory0 = null;
	function getInt32Memory0() {
		if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
			cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
		}
		return cachegetInt32Memory0;
	}
	function getArrayU8FromWasm0(ptr, len) {
		return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
	}
	function crop(file, x, y, w, h) {
		try {
			const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
			var ptr0 = passArray8ToWasm0(file, wasm.__wbindgen_malloc);
			var len0 = WASM_VECTOR_LEN;
			wasm.crop(retptr, ptr0, len0, x, y, w, h);
			var r0 = getInt32Memory0()[retptr / 4 + 0];
			var r1 = getInt32Memory0()[retptr / 4 + 1];
			var v1 = getArrayU8FromWasm0(r0, r1).slice();
			wasm.__wbindgen_free(r0, r1 * 1);
			return v1;
		} finally {
			wasm.__wbindgen_add_to_stack_pointer(16);
		}
	}
	async function load(module, imports) {
		if (typeof Response === 'function' && module instanceof Response) {
			if (typeof WebAssembly.instantiateStreaming === 'function') {
				try {
					return await WebAssembly.instantiateStreaming(module, imports);
				} catch (e) {
					if (module.headers.get('Content-Type') != 'application/wasm') {
						console.warn(
							'`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n',
							e
						);
					} else {
						throw e;
					}
				}
			}
			const bytes = await module.arrayBuffer();
			return await WebAssembly.instantiate(bytes, imports);
		} else {
			const instance = await WebAssembly.instantiate(module, imports);
			if (instance instanceof WebAssembly.Instance) {
				return { instance, module };
			} else {
				return instance;
			}
		}
	}
	async function init(input) {
		if (typeof input === 'undefined') {
			input = new URL('wasm_crop_bg.wasm', import_meta.url);
		}
		const imports = {};
		if (
			typeof input === 'string' ||
			(typeof Request === 'function' && input instanceof Request) ||
			(typeof URL === 'function' && input instanceof URL)
		) {
			input = fetch(input);
		}
		const { instance, module } = await load(await input, imports);
		wasm = instance.exports;
		init.__wbindgen_wasm_module = module;
		return wasm;
	}
	var wasm_crop_default = init;

	// worker.mjs
	wasm_crop_default('./wasm_crop_bg.wasm');
	console.log('Hello from worker');
	onmessage = async function (event) {
		const port = event.ports[0];
		console.log(event);
		const { imageBlob, x, y, w, h } = event.data;
		console.log('Cropping in worker: ' + imageBlob);
		// const response = await fetch(originalImgUrl);
		// const arrayBuffer = await response.arrayBuffer();

		// const arrayBuffer = await imageBlob.arrayBuffer();
		// const cropped = crop(new Uint8Array(arrayBuffer), x, y, w, h);
		// const croppedUrl = URL.createObjectURL(new Blob([cropped]));
		// port.postMessage(croppedUrl);

		// const croppedUrl = await canvasCrop(imageBlob, x, y, w, h);

		canvasCrop(imageBlob, x, y, w, h, port);
	};
})();

async function canvasCrop(imageBlob, x, y, w, h, port) {
	const img = new Image();
	img.onload = () => {
		// Note: using img.decode here was resulting in a weird race-condition-like error
		//       whereby only one image (non-determinate) was decoding properly.
		//       Using img.onload seems to work okay, though? 🤷
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		canvas.width = w;
		canvas.height = h;
		ctx?.drawImage(img, x, y, w, h, 0, 0, w, h);
		canvas.toBlob((blob) => {
			// croppedImageBlob = blob;
			port.postMessage(blob);
		});
	};
	// tick().then(() => (img.src = URL.createObjectURL(imageBlob)));
}
