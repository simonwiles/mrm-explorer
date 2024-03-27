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

		const channel = new MessageChannel();

		channel.port2.onmessage = async function (event) {
			if (event.data === 'success') canvasReady = true;
		};

		const offscreen = canvas.transferControlToOffscreen();
		const msg = {
			imageBlob: imageObject.imageBlob,
			x: rect[0],
			y: rect[1],
			w: width,
			h: height,
			canvas: offscreen
		};

		imageWorker.postMessage(msg, [offscreen, channel.port1]);
	});
</script>

{#if !canvasReady}
	<Loading withOverlay={false} small />
{/if}
<canvas bind:this={canvas} style.display={canvasReady ? 'block' : 'none'} />

<style>
	img {
		max-height: 100%;
		max-width: 100%;
		height: 40px;
	}
</style>