<script>
	import { DataTable, Loading, OverflowMenu, OverflowMenuItem } from 'carbon-components-svelte';
	import { liveQueryAllImageObjects, removeImageObjectById, upsertImageObject } from '$lib/db';
	import AddNewImage from '@components/AddNewImage.svelte';
	import { notify } from '@components/Notifications.svelte';

	let rows = liveQueryAllImageObjects(); // returns a svelte store

	const headers = [
		{ key: 'id', value: 'ID', width: '8rem' },
		{ key: 'name', value: 'Name' },
		{ key: 'features', value: '# Features' },
		{ key: 'size', value: 'Size' },
		{ key: 'imageData', value: 'Image' },
		{ key: 'actions', empty: true, width: '8rem' }
	];

	/** @param {ImageObject} imageObject*/
	async function clearFeatures(imageObject) {
		imageObject.features = undefined;
		await upsertImageObject(imageObject);
		notify({
			title: 'Features cleared',
			subtitle: `Features cleared for image "${imageObject.name}"`
		});
	}

	/** @param {ImageObject & { id: number } } imageObject*/
	async function removeImage(imageObject) {
		await removeImageObjectById(imageObject.id);
		notify({ title: 'Image removed', subtitle: `Image "${imageObject.name}" removed` });
	}
</script>

<svelte:head>
	<title>Dataset | MRM Explorer</title>
	<meta name="description" content="Application for investigating MRM outputs" />
</svelte:head>

<AddNewImage redirectOnAdd={false} class="add-image" />
{#if !$rows}
	<Loading />
{:else if $rows.length === 0}
	<p>Add some images to get started!</p>
{:else}
	<DataTable {headers} rows={$rows} class="dataset-table">
		<svelte:fragment slot="cell" let:row let:cell>
			{#if cell.key === 'imageData'}
				<img src={cell.value} alt={cell.value} height="80px" />
			{:else if cell.key === 'features'}
				{cell.value?.length || 0}
			{:else if cell.key === 'size'}
				{row.width}x{row.height}
			{:else if cell.key === 'actions'}
				<OverflowMenu flipped>
					<OverflowMenuItem text="View" href={`/view/?id=${row.id}`} />
					<OverflowMenuItem text="Add/Update Features from MRM GeoJSON" />
					<OverflowMenuItem
						danger
						text="Delete Features"
						disabled={!row.features}
						onclick={() => clearFeatures(/** @type {ImageObject} */ (row))}
					/>
					<OverflowMenuItem
						danger
						text="Delete Image"
						onclick={() => removeImage(/** @type {ImageObject & { id: number }} */ (row))}
					/>
				</OverflowMenu>
			{:else}
				{cell.value}
			{/if}
		</svelte:fragment>
	</DataTable>
{/if}

<style>
	:global(.dataset-table) {
		max-width: 1200px;
	}

	img {
		margin: 0.5rem 0;
		transform-origin: 10% 10%;
		transition: all 200ms ease-out;

		&:hover {
			border-radius: 4px;
			box-shadow: 0 0 4px 2px #fff5;
			scale: 4;
			transition: all 400ms ease;
		}
	}
</style>
