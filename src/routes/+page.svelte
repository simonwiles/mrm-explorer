<script>
	import { countImageObjects } from '$lib/db';
	import { formatBytes, storageUsage } from '$lib/storage';
	import { Button, Loading, Tile } from 'carbon-components-svelte';
	import ArrowRight from 'carbon-icons-svelte/lib/ArrowRight.svelte';
	import AddNewImages from '@/components/AddNewImages.svelte';

	const countPromise = countImageObjects();
	const storageUsagePromise = storageUsage();
</script>

<svelte:head>
	<title>MRM Explorer</title>
	<meta name="description" content="Application for investigating MRM outputs" />
</svelte:head>

<section>
	<h1>MRM Explorer</h1>

	{#await countPromise}
		<Loading withOverlay={false} />
	{:then count}
		{#if count === 0}
			<p>Upload an image to get started:</p>
		{:else}
			<div>
				<div>
					{#if count === 1}
						<p>There is {count} image in the database.</p>
					{:else}
						<p>There are {count} images in the database.</p>
					{/if}
					{#await storageUsagePromise then usage}
						{#if usage && usage.usage !== undefined && usage.quota !== undefined}
							<p>
								Local storage used {formatBytes(usage.usage)} (max. {formatBytes(usage.quota)} available).
							</p>
						{/if}
					{:catch error}
						<p>{error.message}</p>
					{/await}
				</div>
				<Button href="/dataset" icon={ArrowRight}>Explore the dataset</Button>
			</div>
		{/if}
	{/await}

	<AddNewImages redirectOnAdd={true} />
</section>

<style>
	section {
		margin: 0 0 2rem 2rem;

		& > * {
			margin: 2rem 0;
		}
	}

	section > div {
		align-items: center;
		display: flex;
		gap: 2rem;
	}
</style>
