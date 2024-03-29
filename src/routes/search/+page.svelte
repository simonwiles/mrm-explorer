<script>
	import { page } from '$app/stores';
	import { Button, Search } from 'carbon-components-svelte';
	import { db } from '$lib/db';
	import { debounce } from '$lib/debounce';
	import ImageProcessingWorker from '$lib/imageProcessingWorker?worker';
	import FeatureClip from '@components/FeatureClip.svelte';

	/** @type {FeatureMatch[]} */
	let matches = $state([]);
	let totalMatches = $state(0);
	let search = $state();
	let totalImages = $state(0);
	let totalFeatures = $state(0);
	/** @type {Worker | undefined} */
	let imageWorker = $state();
	let maxResults = $state(10);

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
		totalMatches = 0;

		if (!search) {
			return;
		}

		/** @type {FeatureMatch[]} */
		db.table('images').each((imageObject) => {
			if (imageObject.features) {
				for (const [featureIdx, feature] of imageObject.features.entries()) {
					if (feature.properties.text.toLowerCase().includes(search.toLowerCase())) {
						totalMatches++;
						if (matches.length >= maxResults) continue;
						matches.push({
							imageObject,
							feature,
							featureIdx,
							key: `${imageObject.id}-${featureIdx}`
						});
					}
				}
			}
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
			{#if totalMatches}-- found {totalMatches.toLocaleString()} matches{/if}
		</span>
	</div>

	{#if search && matches && matches.length === 0}
		<p>No results found for "{search}"</p>
	{:else if matches && imageWorker}
		<ul>
			{#each matches as match (match.key)}
				<li>
					{match.imageObject.name} - ({match.featureIdx}) {match.feature.properties.text}
					<FeatureClip imageObject={match.imageObject} feature={match.feature} {imageWorker} />
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
