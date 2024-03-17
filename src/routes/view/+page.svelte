<script>
	import { page } from '$app/stores';
	import { InlineNotification, Link, Loading } from 'carbon-components-svelte';

	import { fetchImageObjectById } from '$lib/db';
	import { formatBytes } from '@/lib/storage';
	import AddFeaturesFromJson from '@components/AddFeaturesFromJson.svelte';
	import Viewer from '@components/Viewer.svelte';

	/** @type {ImageObject | undefined | null} */
	let imageObject = $state();
	let idStr = $page.url.searchParams.get('id');

	$effect(() => {
		let id;
		if (idStr !== null && (id = parseInt(idStr, 10))) {
			fetchImageObjectById(id).then((_imageObject) => (imageObject = _imageObject));
		} else {
			imageObject = null;
		}
	});
</script>

<svelte:head>
	<title>Viewer {imageObject ? `"${imageObject.name}"` : ''} | MRM Explorer</title>
	<meta name="description" content="Application for investigating MRM outputs" />
</svelte:head>

{#if !idStr || imageObject === null}
	<InlineNotification hideCloseButton kind="error" title="Invalid Image ID">
		<span slot="subtitle">
			Please specify a valid ID in the URL or
			<Link inline href="/dataset/">explore the dataset.</Link>.
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
					<dd>{imageObject.width} x {imageObject.height}px</dd>
					<dt>Image Size:</dt>
					<dd>{formatBytes(imageObject.imageBlob.size)}</dd>
					<dt>Feature Count</dt>
					<dd>
						{#if imageObject.features}
							{imageObject.features.length}
						{:else}
							<AddFeaturesFromJson {imageObject} />
						{/if}
					</dd>
				</dl>
			{/if}
		</div>
		<Viewer {imageObject} />
	</div>
{/if}

<style>
	.container {
		display: flex;
		flex-direction: column;
		height: 100%;
		position: relative;
		gap: 1rem;
	}

	dl {
		display: grid;
		gap: 0.5rem 2rem;
		grid-template-columns: auto 1fr;

		& > * {
			margin: 0;
		}
	}
</style>
