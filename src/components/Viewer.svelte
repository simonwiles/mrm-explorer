<script>
	import '$lib/types.js';

	import { tick, unstate } from 'svelte';

	import {
		Button,
		FileUploaderDropContainer,
		Loading,
		Toolbar,
		ToolbarContent
	} from 'carbon-components-svelte';
	import { CloseLarge } from 'carbon-icons-svelte';

	import { fetchAllImageObjects, removeImageObject, upsertImageObject } from '$lib/db';
	import { tooltip } from '$lib/actions/tooltip';
	import { wheelZoom } from '$lib/actions/wheel-zoom';

	import { notify } from '@components/Notifications.svelte';

	let imageObject = $state();
	let svg = $state();

	/**
	 * @param {string} name name of the image
	 * @param {string} imageData base64 encoded image
	 */
	async function addImage(name, imageData) {
		/** @type {ImageObject} */
		const _imageObject = { name, imageData };
		const img = new Image();
		img.src = imageData;
		img.decode().then(() => {
			_imageObject.width = img.naturalWidth;
			_imageObject.height = img.naturalHeight;
			upsertImageObject(_imageObject).then(([_, newImageObject]) => {
				imageObject = newImageObject;
			});
		});
	}

	/**
	 * @param {{features: Array<Feature>}} mrmGeoJson
	 */
	async function addFeaturesToImage(mrmGeoJson) {
		imageObject.features = mrmGeoJson.features;
		await tick();
		createFeaturePaths(mrmGeoJson.features);
		upsertImageObject(unstate(imageObject));
	}

	async function removeImage() {
		await removeImageObject(imageObject);
		notify({ title: 'Image removed', subtitle: `Image "${imageObject.name}" removed` });
		imageObject = false;
	}

	const scale = 4416 / 1000;

	/**
	 * @param {number[][]} vertices
	 * @param {number} scale
	 * @returns {number[][]}
	 */
	const scale_coords = (vertices, scale) => vertices.map(([x, y]) => [x / scale, 1 - y / scale]);

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
		const vertices = scale_coords(feature.geometry.coordinates[0], scale);
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
		fetchAllImageObjects().then((images) => {
			if (images.length > 0) {
				imageObject = images[0];
				if (imageObject.features) {
					tick().then(() => createFeaturePaths(imageObject.features));
				}
			} else {
				imageObject = false;
			}
		});
	});
</script>

{#if imageObject === undefined}
	<Loading />
{/if}

{#if imageObject === false}
	<FileUploaderDropContainer
		on:change={({ detail: files }) => {
			const file = files[0];
			if (!file.type || !file.type.startsWith('image/')) {
				alert('Only image files are accepted');
				return;
			}
			const reader = new FileReader();
			reader.addEventListener(
				'load',
				() => typeof reader.result === 'string' && addImage(file.name, reader.result),
				false
			);
			reader.readAsDataURL(file);
		}}
	>
		<span class="file-upload-dropzone" slot="labelText">
			Drag and drop map or other image here<br />(or click to upload)
		</span>
	</FileUploaderDropContainer>
{/if}

{#if imageObject}
	<div class="viewer">
		<Toolbar size="sm">
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
					on:click={removeImage}
					tooltipPosition="left"
					tooltipAlignment="end"
				/>
			</ToolbarContent>
		</Toolbar>

		<div class="image-container" use:wheelZoom>
			<img src={imageObject.imageData} alt={imageObject.name} />
			{#if imageObject.features}
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 750" bind:this={svg}></svg>
			{/if}
		</div>
	</div>
{/if}

<style>
	:global(#main-content) {
		height: calc(100vh - 3rem);
		overflow: hidden;
	}

	.viewer {
		max-height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.file-upload-dropzone {
		align-items: center;
		display: flex;
		height: 100%;
		justify-content: center;
		text-align: center;
		vertical-align: middle;
		width: 100%;
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
		display: grid;
		grid-template-columns: auto;
		grid-template-rows: auto;
		overflow: hidden;
		position: relative;
		max-width: 100%;
		max-height: 100%;
		aspect-ratio: 1200 / 900;

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
