<script>
	import { tick, unstate } from 'svelte';
	import { Loading } from 'carbon-components-svelte';

	/**
	 * @typedef {Object} FeatureClipProps
	 * @property {ImageObject} imageObject Image object to view
	 * @property {Feature} feature Feature to clip
	 */

	/** @type {FeatureClipProps} */
	let { imageObject, feature, wipWorker } = $props();

	let croppedImageBlob = $state();

	/** @param {number[][]} coordinates */
	const getRectangle = (coordinates) => {
		return [
			Math.min(...coordinates.map(([x]) => x)),
			Math.min(...coordinates.map(([, y]) => y)),
			Math.max(...coordinates.map(([x]) => x)),
			Math.max(...coordinates.map(([, y]) => y))
		];
	};

	$effect(() => {
		if (!imageObject || !feature) return;

		const vertices = feature.geometry.coordinates[0].map(([x, y]) => [x, 1 - y]);
		const rect = getRectangle(unstate(vertices));
		const height = rect[3] - rect[1];
		const width = rect[2] - rect[0];

		console.log(rect, height, width);

		// const img = new Image();
		// img.onload = () => {
		// 	// Note: using img.decode here was resulting in a weird race-condition-like error
		// 	//       whereby only one image (non-determinate) was decoding properly.
		// 	//       Using img.onload seems to work okay, though? 🤷
		// 	const canvas = document.createElement('canvas');
		// 	const ctx = canvas.getContext('2d');
		// 	canvas.width = width;
		// 	canvas.height = height;

		// 	ctx?.drawImage(img, rect[0], rect[1], width, height, 0, 0, width, height);
		// 	canvas.toBlob((blob) => {
		// 		croppedImageBlob = blob;
		// 	});

		// };

		// tick().then(() => (img.src = URL.createObjectURL(imageObject.imageBlob)));

		const channel = new MessageChannel();

		channel.port2.onmessage = async function (event) {
			console.log('gotmsg', event.data);
			// URL.revokeObjectURL(img_dom.src);
			croppedImageBlob = event.data;
		};

		const msg = {
			imageBlob: imageObject.imageBlob,
			x: rect[0],
			y: rect[1],
			w: width,
			h: height
		};

		wipWorker.postMessage(msg, [channel.port1]);
	});
</script>

{#if croppedImageBlob}
	<img
		src={croppedImageBlob}
		alt={`"${feature.properties.text}" (${imageObject.name})`}
		loading="lazy"
	/>
{:else}
	<Loading withOverlay={false} small />
{/if}

<style>
	img {
		max-height: 100%;
		max-width: 100%;
		height: 40px;
	}
</style>
