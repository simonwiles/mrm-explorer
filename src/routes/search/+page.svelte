<script>
	import { page } from '$app/stores';
	import { Search } from 'carbon-components-svelte';
	import { db } from '$lib/db';
	import { debounce } from '$lib/debounce';
	import WIPWorker from '$lib/wasm-image-processing/worker?worker';
	import FeatureClip from '@components/FeatureClip.svelte';

	/** @type {FeatureMatch[] | undefined} */
	let matches = $state();
	let search = $state();
	let totalImages = $state(0);
	let totalFeatures = $state(0);
	let wipWorker;

	$effect(() => {
		wipWorker = new WIPWorker();
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
		}
	});

	const doSearch = debounce((/** @type {string | undefined} */ search) => {
		if (!search) {
			matches = undefined;
			return;
		}

		/** @type {FeatureMatch[]} */
		const newMatches = [];
		db.table('images')
			.each((imageObject) => {
				if (imageObject.features) {
					for (const [featureIdx, feature] of imageObject.features.entries()) {
						if (feature.properties.text.toLowerCase().includes(search.toLowerCase())) {
							newMatches.push({
								imageObject,
								feature,
								featureIdx,
								key: `${imageObject.id}-${featureIdx}`
							});
						}
					}
				}
			})
			.then(() => (matches = newMatches.slice(0, 50)));
	}, 500);

	$effect(() => doSearch(search));
</script>

<svelte:head>
	<title>Search | MRM Explorer</title>
	<meta name="description" content="Application for investigating MRM outputs" />
</svelte:head>

<div class="container">
	<div class="search">
		<Search bind:value={search} />
		<span>
			Searching {totalFeatures.toLocaleString()} features across {totalImages.toLocaleString()} images
			{#if matches}-- found {matches?.length.toLocaleString()} matches{/if}
		</span>
	</div>

	{#if search && matches && matches.length === 0}
		<p>No results found for "{search}"</p>
	{:else if matches}
		<ul>
			{#each matches as match (match.key)}
				<li>
					{match.imageObject.name} - ({match.featureIdx}) {match.feature.properties.text}
					<FeatureClip imageObject={match.imageObject} feature={match.feature} {wipWorker} />
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
