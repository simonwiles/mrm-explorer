<script>
	import { unstate } from 'svelte';
	import { page } from '$app/stores';
	import { InlineLoading, Search } from 'carbon-components-svelte';
	import { db } from '$lib/db';
	import { debounce } from '$lib/debounce';
	import FeatureClip from '@components/FeatureClip.svelte';

	/** @type {FeatureMatch[]} */
	let matches = $state([]);
	let searching = $state(false);
	let search = $state();
	let totalImages = $state(0);
	let totalFeatures = $state(0);
	let totalMatches = $state(0);

	const maxResults = 1000;

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

	/** @param {ImageObject} imageObject */
	async function searchImage(imageObject) {
		let imageBitmap;
		if (imageObject.features) {
			for (const [featureId, feature] of imageObject.features.entries()) {
				if (feature.properties.text.toLowerCase().includes(search.toLowerCase())) {
					totalMatches++;
					if (matches.length >= maxResults) continue;
					if (!imageBitmap) {
						imageBitmap = await createImageBitmap(imageObject.imageBlob);
					}
					const { croppedBitmap, width, height } = getClip(imageBitmap, feature);
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
		if (imageBitmap) imageBitmap.close();
	}

	const doSearch = debounce(async (/** @type {string | undefined} */ search) => {
		totalMatches = 0;
		matches = [];
		searching = false;
		if (!search) return;
		searching = true;

		db.table('images')
			.toArray()
			.then(async (images) => {
				for (const image of images) await searchImage(image);
				searching = false;
			});
	}, 500);

	$effect(() => {
		// `doSearch` is debounced, so set `searching` to `true` immediately
		//  to avoid "no matches found" while typing
		searching = true;
		doSearch(search);
	});
</script>

<svelte:head>
	<title>Search | MRM Explorer</title>
	<meta name="description" content="Application for investigating MRM outputs" />
</svelte:head>

<div class="container">
	<div class="search">
		<div class="search-input">
			<Search bind:value={search} />
		</div>
		<div class="search-status">
			{#if searching}
				<InlineLoading description="Searching..." />
			{:else if matches.length}
				{totalMatches.toLocaleString()} matches found
				{#if totalMatches > maxResults}(max 1,000 shown){/if}
			{:else if search !== ''}
				<p>No results found for "{search}"</p>
			{/if}
			<span>
				Searching {totalFeatures.toLocaleString()} features across {totalImages.toLocaleString()} images
			</span>
		</div>
	</div>

	{#if matches}
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

	.search-status {
		align-items: center;
		display: flex;
		gap: 1rem;
		height: 1rem;
		margin-bottom: 1rem;

		span {
			flex: 1 0 auto;
			text-align: right;
		}
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
