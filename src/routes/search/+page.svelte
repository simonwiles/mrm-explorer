<script>
	import { unstate } from 'svelte';
	import { page } from '$app/stores';
	import { Button, Search } from 'carbon-components-svelte';
	import { db } from '$lib/db';
	import { debounce } from '$lib/debounce';
	import FeatureClip from '@components/FeatureClip.svelte';

	/** @type {FeatureMatch[]} */
	let matches = $state([]);
	let totalMatches = $state(0);
	let search = $state();
	let totalImages = $state(0);
	let totalFeatures = $state(0);
	let maxResults = $state(100);

	let imageBitmaps = new Map();

	/** @param {number[][]} coordinates */
	const getRectangle = (coordinates) => {
		return [
			Math.min(...coordinates.map(([x]) => x)),
			Math.min(...coordinates.map(([, y]) => y)),
			Math.max(...coordinates.map(([x]) => x)),
			Math.max(...coordinates.map(([, y]) => y))
		];
	};

	/**
	 * @param {ImageBitmap} imageBitmap
	 * @param {Feature} feature
	 */
	const getClip = (imageBitmap, feature) => {
		const vertices = feature.geometry.coordinates[0].map(([x, y]) => [x, 1 - y]);
		const rect = getRectangle(unstate(vertices));
		const height = rect[3] - rect[1];
		const width = rect[2] - rect[0];
		const croppedBitmap = createImageBitmap(imageBitmap, rect[0], rect[1], width, height);
		return { croppedBitmap, width, height };
	};

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

	const doSearch = debounce(async (/** @type {string | undefined} */ search) => {
		matches = [];
		totalMatches = 0;

		if (!search) {
			return;
		}

		db.table('images').each(async (imageObject) => {
			if (imageObject.features) {
				for (const [featureId, feature] of imageObject.features.entries()) {
					if (feature.properties.text.toLowerCase().includes(search.toLowerCase())) {
						totalMatches++;
						if (matches.length >= maxResults) continue;
						if (!imageBitmaps.has(imageObject.id)) {
							imageBitmaps.set(imageObject.id, await createImageBitmap(imageObject.imageBlob));
						}
						const { croppedBitmap, width, height } = getClip(
							imageBitmaps.get(imageObject.id),
							feature
						);
						matches.push({
							key: `${imageObject.id}-${featureId}`,
							imageName: imageObject.name,
							featureId,
							text: feature.properties.text,
							width,
							height,
							croppedBitmap
						});
					}
				}
			}
			imageBitmaps.forEach((bitmap) => bitmap.close());
			imageBitmaps.clear();
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
	{:else if matches}
		<ul>
			{#each matches as match (match.key)}
				<li>
					{match.imageName} - ({match.featureId}) {match.text}
					<FeatureClip
						croppedBitmap={match.croppedBitmap}
						width={match.width}
						height={match.height}
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
