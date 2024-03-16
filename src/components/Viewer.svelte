<script>
	import { panZoom } from '@/lib/actions/pan-zoom';
	import { tooltip } from '$lib/actions/tooltip';

	/** @type {{imageObject: ImageObject}} */
	let { imageObject } = $props();
	let svg = $state();

	/**
	 * @param {Array<Feature>} features
	 */
	const createFeaturePaths = (features) => {
		features.forEach((feature, i) => {
			const featurePath = createFeaturePath(feature, i);
			svg.appendChild(featurePath);

			tooltip(featurePath, {
				placement: 'top',
				arrow: true,
				allowHTML: true
			});
		});
	};

	/**
	 * @param {Feature} feature
	 * @param {number} i
	 */
	const createFeaturePath = (feature, i) => {
		const featurePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		const vertices = feature.geometry.coordinates[0].map(([x, y]) => [x, 1 - y]);
		const path = [];
		path.push(`M ${vertices[0][0]} ${vertices[0][1]}`);
		vertices.slice(1).forEach(([x, y]) => path.push(`L ${x} ${y}`));
		path.push('Z');
		featurePath.setAttribute('d', path.join(' '));
		featurePath.setAttribute('data-idx', `${i}`);
		featurePath.setAttribute('data-text', feature.properties.text);
		featurePath.setAttribute('data-score', feature.properties.score.toFixed(4));
		featurePath.setAttribute(
			'data-tippy-content',
			`text: ${feature.properties.text}<br>score: ${feature.properties.score}`
		);
		return featurePath;
	};

	$effect(() => {
		if (imageObject.features) {
			createFeaturePaths(imageObject.features || []);
		}
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
			bind:this={svg}
		></svg>
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
