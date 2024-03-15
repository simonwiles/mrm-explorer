<script>
	import { tick, unstate } from 'svelte';

	import {
		Button,
		FileUploaderDropContainer,
		Toolbar,
		ToolbarContent
	} from 'carbon-components-svelte';
	import { CloseLarge } from 'carbon-icons-svelte';

	import { upsertImageObject } from '$lib/db';
	import { tooltip } from '$lib/actions/tooltip';
	import { wheelZoom } from '$lib/actions/wheel-zoom';

	/** @type {{imageObject: ImageObject}} */
	let { imageObject } = $props();
	let imageEl = $state();
	let toolbarWidth = $state();
	let svg = $state();

	/**
	 * @param {{features: Array<Feature>}} mrmGeoJson
	 */
	async function addFeaturesToImage(mrmGeoJson) {
		imageObject.features = mrmGeoJson.features;
		await tick();
		createFeaturePaths(mrmGeoJson.features);
		upsertImageObject(unstate(imageObject));
	}

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
			tick().then(() => createFeaturePaths(imageObject.features || []));
		}
	});

	$effect(() => {
		// This is a horrible hack to force the toolbar to be the same width as the image
		//  on Firefox specifically -- it is not required on Chromium-based browsers.
		// In addition to `grid-template-columns: max-content;` seemingly not working on
		//  Firefox, FF also reports `imageEl.width` as 0 unless the `setTimeout` is used.
		// This hack is also not responsive to viewport changes.  It will have to go
		//  sooner rather than later.
		imageEl && setTimeout(() => (toolbarWidth = imageEl.width + 'px'), 0);
	});
</script>

{#if imageObject}
	<div class="viewer">
		<Toolbar size="sm" style={toolbarWidth ? `max-width: ${toolbarWidth}` : ''}>
			<ToolbarContent>
				<div class="image-name">{imageObject.name}</div>
				{#if !imageObject.features}
					<FileUploaderDropContainer
						labelText="Add JSON"
						class="add-json"
						on:change={({ detail: files }) => {
							const file = files[0];
							if (!file.type || !['application/geo+json', 'application/json'].includes(file.type)) {
								alert('Only JSON / GEOJSON files are accepted');
								return;
							}
							const reader = new FileReader();
							reader.addEventListener(
								'load',
								() =>
									typeof reader.result === 'string' &&
									addFeaturesToImage(JSON.parse(reader.result)),
								false
							);
							reader.readAsText(file);
						}}
					></FileUploaderDropContainer>
				{/if}
				<Button
					icon={CloseLarge}
					iconDescription="Close"
					href="/"
					tooltipPosition="left"
					tooltipAlignment="end"
				/>
			</ToolbarContent>
		</Toolbar>

		<div
			class="image-container"
			use:wheelZoom
			style="--aspect-ratio: {imageObject.width} / {imageObject.height}"
		>
			<img
				src={URL.createObjectURL(imageObject.imageBlob)}
				alt={imageObject.name}
				bind:this={imageEl}
			/>
			{#if imageObject.features}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox={`0 0 ${imageObject.width} ${imageObject.height}`}
					bind:this={svg}
				></svg>
			{/if}
		</div>
	</div>
{/if}

<style>
	.viewer {
		display: grid;
		grid-template-columns: max-content;
		grid-template-rows: max-content;
		height: 100%;
	}

	.image-name {
		align-self: center;
		flex-grow: 1;
		padding: 0 1rem;
	}

	:global(.add-json) {
		inline-size: auto;
		overflow: hidden;
	}

	:global(.add-json .bx--file-browse-btn) {
		height: 100%;
		margin: 0;
	}

	:global(.add-json .bx--file__drop-container) {
		border: 0;
		display: grid;
		height: 100%;
		padding: 0 1rem;
		place-content: center;
	}

	.image-container {
		--scale: 1;
		aspect-ratio: var(--aspect-ratio);
		display: grid;
		grid-template-columns: auto;
		grid-template-rows: auto;
		height: 100%;
		max-height: 100%;
		max-width: 100%;
		overflow: hidden;
		position: relative;

		img {
			transform: scale(var(--scale));
			transform-origin: var(--transform-origin-X) var(--transform-origin-Y);
			transition: transform 0.1s linear;
			max-height: 100%;
			max-width: 100%;
		}

		svg {
			max-width: 100%;
			position: absolute;
			transform: scale(var(--scale));
			transform-origin: var(--transform-origin-X) var(--transform-origin-Y);
			transition: transform 0.1s linear;
		}

		svg :global(path) {
			fill: transparent;
			stroke: #44f8;
			stroke-width: calc(6px / var(--scale));
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
