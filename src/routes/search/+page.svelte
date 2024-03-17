<script>
	import { Search } from 'carbon-components-svelte';
	import { db } from '$lib/db';

	/** @type {FeatureMatch[]} */
	let matches = $state([]);
	let search = $state();
	let totalImages = $state(0);
	let totalFeatures = $state(0);

	$effect(() => {
		db.table('images').each((imageObject) => {
			if (imageObject.features) totalFeatures += imageObject.features.length;
			totalImages++;
		});
	});

	$effect(() => {
		matches = [];
		if (!search) return;
		db.table('images').each((imageObject) => {
			if (imageObject.features) {
				for (const [featureIdx, feature] of imageObject.features.entries()) {
					if (feature.properties.text.toLowerCase().includes(search.toLowerCase())) {
						matches.push({ imageObject, feature, featureIdx });
					}
				}
			}
		});
	});
</script>

<svelte:head>
	<title>Search | MRM Explorer</title>
	<meta name="description" content="Application for investigating MRM outputs" />
</svelte:head>

<div class="container">
	<div class="search">
		<Search bind:value={search} />
		<span>
			Searching {totalFeatures} features across {totalImages} images{#if matches.length > 0}
				-- found {matches.length} matches{/if}
		</span>
	</div>

	{#if search && matches.length === 0}
		<p>No results found for "{search}"</p>
	{:else}
		<ul>
			{#each matches as match}
				<li>
					{match.imageObject.name} - {match.feature.properties.text}
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
		margin: 0.5rem 0;
	}
</style>
