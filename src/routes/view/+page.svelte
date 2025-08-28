<script>
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { Button, InlineNotification, Link, Loading, Search } from 'carbon-components-svelte';
	import JumpLink from 'carbon-icons-svelte/lib/JumpLink.svelte';

	import { fetchImageObjectById } from '$lib/db';
	import { formatBytes } from '$lib/storage';
	import AddFeaturesFromJson from '@components/AddFeaturesFromJson.svelte';
	import Viewer from '@components/Viewer.svelte';

	/** @type {ImageObject | undefined | null} */
	let imageObject = $state();
	let featureId = $state();

	let search = $state();
	let markedCount = $state(0);

	let viewer = $state();

	/** @param {number} count */
	const setMarkedCount = (count) => (markedCount = count);

	$effect(() => {
		if (imageObject) return;
		const idStr = $page.url.searchParams.get('id');
		featureId = $page.url.searchParams.get('feat');
		let id;
		if (idStr !== null && (id = parseInt(idStr, 10))) {
			// Promised resolves with undefined if not found
			//  (but we want null for an invalid ID)
			fetchImageObjectById(id).then((_imageObject) => (imageObject = _imageObject || null));
		} else {
			imageObject = null;
		}
	});
</script>

<svelte:head>
	<title>{imageObject ? `${imageObject.name}` : 'Viewer'} | Map ATR Explorer</title>
	<meta name="description" content="Application for investigating MapReader Text-Spotter outputs" />
</svelte:head>

{#if imageObject === null}
	<InlineNotification hideCloseButton kind="error" title="Invalid Image ID">
		<span slot="subtitle">
			Please specify a valid ID in the URL or
			<Link inline href="{base}/dataset/">explore the dataset.</Link>.
		</span>
	</InlineNotification>
{:else if imageObject === undefined}
	<Loading />
{:else}
	<div class="container">
		<div class="info">
			{#if imageObject}
				<dl>
					<dt>Name</dt>
					<dd>{imageObject.name}</dd>
					<dt>Image Dimensions:</dt>
					<dd>{imageObject.width.toLocaleString()} x {imageObject.height.toLocaleString()}px</dd>
					<dt>Image Size:</dt>
					<dd>{formatBytes(imageObject.imageBlob.size)}</dd>
					<dt>Feature Count</dt>
					<dd>
						{#if imageObject.features}
							{imageObject.features.length.toLocaleString()}
						{:else}
							<AddFeaturesFromJson {imageObject} />
						{/if}
					</dd>
				</dl>
			{/if}
			<div class="search">
				<Search bind:value={search} />
				{#if search}
					<span class="marked-count">
						{#if markedCount}
							<div>
								{markedCount} feature{markedCount > 1 ? 's' : ''} marked
								<Button
									size="small"
									iconDescription="Jump to next feature"
									icon={JumpLink}
									{...{
										/* Using the old-style Svelte event handler syntax here;
										 * using the native handled (in the Svelte 5 style) is
										 * resulting in dropped or delayed events, for reasons
										 * I don't understand :(
										 */
									}}
									on:click={viewer.panToNextMarked}
								/>
							</div>
						{:else}
							No features matched!
						{/if}
					</span>
				{/if}
			</div>
		</div>
		<Viewer {imageObject} {search} {setMarkedCount} {featureId} bind:this={viewer} />
	</div>
{/if}

<style>
	.container {
		display: flex;
		flex-direction: column;
		height: 100%;
		position: relative;
		gap: 2rem;
	}

	.info {
		display: flex;
		flex-direction: row;
		gap: 2rem;
	}

	dl {
		display: grid;
		gap: 0.5rem 2rem;
		grid-template-columns: auto 1fr;
		margin: 0.5rem 0;

		& > * {
			margin: 0;
		}
	}

	.search {
		display: flex;
		align-items: flex-end;
		gap: 1rem;
		flex-direction: column;
	}

	.marked-count {
		white-space: nowrap;

		& > div {
			display: flex;
			align-items: center;
			gap: 0.5rem;
		}
	}
</style>
