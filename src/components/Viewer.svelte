<script>
	import { tick } from 'svelte';
	import { panZoom } from '$lib/actions/pan-zoom';
	import { tooltip } from '$lib/actions/tooltip';

	/**
	 * @typedef {Object} ViewerProps
	 * @property {ImageObject} imageObject Image object to view
	 * @property {string | function} [search] String to search for or callback function to use for marking features
	 * @property {function} [setMarkedCount] Callback which will be called when the number of matched features is updated
	 */

	/** @type {ViewerProps} */
	let { imageObject, search, setMarkedCount } = $props();

	/** @type {function} */
	let markFeature = $state(() => false);

	let markedCount = 0;

	$effect(() => {
		markedCount = 0;
		if (!search) {
			markFeature = () => false;
			if (setMarkedCount) setMarkedCount(0);
			return;
		}
		markFeature = (/** @type {FeatureProperty} */ featureProps) => {
			const mark =
				typeof search === 'function'
					? search(featureProps)
					: featureProps.text.toLowerCase().includes(/** @type string */ (search));
			if (mark) markedCount++;
			return mark;
		};
		if (setMarkedCount) tick().then(() => /** @type {function} */ (setMarkedCount)(markedCount));
	});
</script>

<div class="outer">
	<div
		class="panzoom-container"
		use:panZoom
		style="--aspect-ratio: {imageObject.width} / {imageObject.height}"
	>
		<img src={URL.createObjectURL(imageObject.imageBlob)} alt={imageObject.name} />
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox={`0 0 ${imageObject.width} ${imageObject.height}`}
		>
			{#each imageObject.features || [] as feature, i}
				{@const vertices = feature.geometry.coordinates[0].map(([x, y]) => [x, 1 - y])}
				<path
					d={`M ${vertices[0][0]} ${vertices[0][1]} ${vertices
						.slice(1)
						.map(([x, y]) => `L ${x} ${y}`)
						.join(' ')} Z`}
					data-idx={i}
					data-text={feature.properties.text}
					data-score={feature.properties.score.toFixed(4)}
					data-tippy-content={`text: ${feature.properties.text}<br>score: ${feature.properties.score}`}
					use:tooltip={{ allowHTML: true }}
					class:marked={markFeature(feature.properties)}
				/>
			{/each}
		</svg>
	</div>
</div>

<style>
	.outer {
		height: 100%;
		width: 100%;
	}

	.panzoom-container {
		aspect-ratio: var(--aspect-ratio);
		height: 100%;
		overflow: hidden;
		position: relative;
		width: 100%;

		img {
			max-height: 100%;
			max-width: 100%;
		}

		svg {
			left: 0;
			max-height: 100%;
			max-width: 100%;
			position: absolute;
			top: 0;
		}

		svg :global(path) {
			fill: transparent;
			stroke: #44f8;
			stroke-width: 6px;
		}

		svg :global(path.marked) {
			opacity: 0.6;
			stroke: lime;
		}

		svg :global(path.active),
		svg :global(path:hover) {
			opacity: 1;
			stroke: hotpink;
		}
	}
</style>
