<script>
	import { page } from '$app/stores';
	import { Button, Search } from 'carbon-components-svelte';
	import { db } from '$lib/db';
	import { debounce } from '$lib/debounce';
	import ImageProcessingWorker from '$lib/imageProcessingWorker?worker';
	import FeatureClip from '@components/FeatureClip.svelte';

	/** @type {FeatureMatch[]} */
	let matches = $state([]);
	/** @type {FeatureMatch[]} */
	let rows = $state([]);
	let search = $state();
	let totalImages = $state(0);
	let totalFeatures = $state(0);
	/** @type {Worker | undefined} */
	let imageWorker = $state();
	let maxResults = $state(10);

	let imageBlobs = $state(new Map());

	$effect(() => {
		// initialize a worker that can be passed to FeatureClip components
		imageWorker = new ImageProcessingWorker();
	});

	$effect(() => {
		db.table('images').each((imageObject) => {
			if (imageObject.features) totalFeatures += imageObject.features.length;
			totalImages++;
		});
	});

	$effect(() => {
		const searchStr = $page.url.searchParams.get('s');
		if (searchStr) {
			search = searchStr;
			doSearch(search);
		}
	});

	const doSearch = debounce((/** @type {string | undefined} */ search) => {
		matches = [];
		rows = [];
		if (!search) {
			return;
		}

		/** @type {FeatureMatch[]} */
		db.table('images')
			.each((imageObject) => {
				if (imageObject.features) {
					for (const [featureId, feature] of imageObject.features.entries()) {
						if (feature.properties.text.toLowerCase().includes(search.toLowerCase())) {
							matches.push({
								imageId: imageObject.id,
								imageName: imageObject.name,
								feature,
								featureId,
								key: `${imageObject.id}-${featureId}`
							});
						}
					}
				}
			})
			.then(() => {
				rows = matches.slice(0, maxResults);
				rows.forEach((row) => {
					if (!imageBlobs.has(row.imageId)) {
						imageBlobs.set(
							row.imageId,
							db
								.table('images')
								.get(row.imageId)
								.then((imageObject) => imageObject.imageBlob)
						);
					}
				});
			});
	}, 500);
</script>

<svelte:head>
	<title>Search | MRM Explorer</title>
	<meta name="description" content="Application for investigating MRM outputs" />
</svelte:head>

<div class="container">
	<div class="search">
		<div class="search-input">
			<Button on:click={() => doSearch(search)}>Search</Button>
			<Search
				bind:value={search}
				on:keyup={(event) => {
					if (event.key === 'Enter') doSearch(search);
				}}
			/>
		</div>
		<span>
			Searching {totalFeatures.toLocaleString()} features across {totalImages.toLocaleString()} images
			{#if matches}-- found {matches?.length.toLocaleString()} matches{/if}
		</span>
	</div>

	{#if search && matches && matches.length === 0}
		<p>No results found for "{search}"</p>
	{:else if rows && imageWorker}
		<ul>
			{#each rows as match (match.key)}
				<li>
					{match.imageName} - ({match.featureId}) {match.feature.properties.text}
					<FeatureClip
						imageBlob={imageBlobs.get(match.imageId)}
						feature={match.feature}
						{imageWorker}
					/>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.container {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.search {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.search-input {
		display: flex;
	}

	ul {
		list-style: disc;
		overflow-y: auto;
		padding: 2rem;
	}

	li {
		align-items: center;
		display: flex;
		gap: 1rem;
		margin: 0.5rem 0;
	}
</style>
