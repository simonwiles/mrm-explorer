<script>
	import { page } from '$app/stores';
	import { Button, DataTable, Pagination, Search } from 'carbon-components-svelte';
	import { db } from '$lib/db';
	import { debounce } from '$lib/debounce';
	import ImageProcessingWorker from '$lib/imageProcessingWorker?worker';
	import FeatureClip from '@components/FeatureClip.svelte';

	/** @type {FeatureMatch[] | undefined} */
	let matches = $state();
	let search = $state();
	let totalImages = $state(0);
	let totalFeatures = $state(0);
	/** @type {Worker | undefined} */
	let imageWorker = $state();

	$effect(() => {
		// initialize a worker that can be passed to FeatureClip components
		imageWorker = new ImageProcessingWorker();
	});

	let pageSize = $state(10);
	let currentPage = $state(1);

	const dataTableHeaders = [
		{ key: 'imageName', value: 'Image' },
		{ key: 'featureText', value: 'Feature Text' },
		{ key: 'clip', value: 'Clipped Image', sort: false }
	];

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
							// newMatches.push({
							// 	imageObject,
							// 	feature,
							// 	featureIdx,
							// 	id: `${imageObject.id}-${featureIdx}`
							// });
							newMatches.push({
								id: `${imageObject.id}-${featureIdx}`,
								imageName: imageObject.name,
								featureText: feature.properties.text,
								imageObject,
								feature
							});
						}
					}
				}
			})
			.then(() => (matches = newMatches));
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
			<Search bind:value={search} />
		</div>
		<span>
			Searching {totalFeatures.toLocaleString()} features across {totalImages.toLocaleString()} images
			{#if matches}-- found {matches?.length.toLocaleString()} matches{/if}
		</span>
	</div>

	{#if search && matches && matches.length === 0}
		<p>No results found for "{search}"</p>
	{:else if matches && imageWorker}
		<!-- <ul>
			{#each matches as match (match.key)}
				<li>
					{match.imageObject.name} - ({match.featureIdx}) {match.feature.properties.text}
					<FeatureClip imageObject={match.imageObject} feature={match.feature} {imageWorker} />
				</li>
			{/each}
		</ul> -->
		<DataTable headers={dataTableHeaders} rows={matches} sortable {pageSize} page={currentPage}>
			<svelte:fragment slot="cell" let:row let:cell>
				{#if cell.key === 'clip'}
					<FeatureClip imageObject={row.imageObject} feature={row.feature} {imageWorker} />
				{:else}
					{cell.value}
				{/if}
			</svelte:fragment>
		</DataTable>

		<Pagination
			bind:pageSize
			bind:page={currentPage}
			totalItems={matches.length}
			pageSizeInputDisabled
		/>
	{/if}
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		height: 100%;
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
