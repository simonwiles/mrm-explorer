<script>
	import { unstate } from 'svelte';
	import { Loading } from 'carbon-components-svelte';

	/**
	 * @typedef {Object} FeatureClipProps
	 * @property {ImageObject} imageObject Image object to view
	 * @property {Feature} feature Feature to clip
	 * @property {Worker} imageWorker Worker to use for image processing
	 */

	/** @type {FeatureClipProps} */
	let { imageObject, feature, imageWorker } = $props();

	let canvas = $state();
	let canvasReady = $state(false);

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

		canvas.width = width;
		canvas.height = height;
		const offscreen = canvas.transferControlToOffscreen();

		const channel = new MessageChannel();
		channel.port2.onmessage = async function (event) {
			if (event.data === 'success') canvasReady = true;
		};

		createImageBitmap(imageObject.imageBlob).then((imageBitmap) => {
			const msg = {
				imageBitmap,
				canvas: offscreen,
				x: rect[0],
				y: rect[1],
				w: width,
				h: height
			};
			imageWorker.postMessage(msg, [offscreen, channel.port1, imageBitmap]);
		});
	});
</script>

{#if !canvasReady}
	<Loading withOverlay={false} small />
{/if}
<canvas bind:this={canvas} class:loaded={canvasReady} />

<style>
	canvas {
		scale: 0;
		transition: scale 0.3s ease-in-out;

		&.loaded {
			scale: 1;
		}
	}
</style>
