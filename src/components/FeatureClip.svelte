<script>
	import { Loading } from 'carbon-components-svelte';

	/**
	 * @typedef {Object} FeatureClipProps
	 * @property {Promise<ImageBitmap>} croppedBitmap
	 * @property {number} width
	 * @property {number} height
	 */

	/** @type {FeatureClipProps} */
	let { croppedBitmap, width, height } = $props();

	let canvas = $state();
	let canvasReady = $state(false);

	$effect(() => {
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext('2d');
		croppedBitmap.then((croppedBitmap) => {
			ctx.drawImage(croppedBitmap, 0, 0);
			croppedBitmap.close();
			canvasReady = true;
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
