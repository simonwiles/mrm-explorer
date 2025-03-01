<script>
	import { tick } from 'svelte';
	import { FileUploaderDropContainer } from 'carbon-components-svelte';
	import { upsertImageObject } from '$lib/db';

	/** @type {{imageObject: ImageObject}} */
	let { imageObject } = $props();

	/**
	 * @param {{features: Array<Feature>}} mrmGeoJson
	 */
	async function addFeaturesToImage(mrmGeoJson) {
		imageObject.features = mrmGeoJson.features;
		await tick();
		// createFeaturePaths(mrmGeoJson.features);
		upsertImageObject($state.snapshot(imageObject));
	}
</script>

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
			() => typeof reader.result === 'string' && addFeaturesToImage(JSON.parse(reader.result)),
			false
		);
		reader.readAsText(file);
	}}
/>

<style>
	:global(.add-json) {
		inline-size: fit-content;
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
</style>
