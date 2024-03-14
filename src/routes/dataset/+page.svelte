<script>
	import {
		Button,
		DataTable,
		Loading,
		OverflowMenu,
		OverflowMenuItem,
		Toolbar,
		ToolbarSearch,
		ToolbarContent
	} from 'carbon-components-svelte';
	import TrashCan from 'carbon-icons-svelte/lib/TrashCan.svelte';
	import { liveQueryAllImageObjects, removeImageObjectById, upsertImageObject } from '$lib/db';
	import { formatBytes } from '$lib/storage';
	import AddNewImages from '@/components/AddNewImages.svelte';
	import { notify } from '@components/Notifications.svelte';

	let rows = liveQueryAllImageObjects(); // returns a svelte store

	const headers = [
		{ key: 'id', value: 'ID' },
		{ key: 'name', value: 'Name' },
		{ key: 'features', value: '# Features' },
		{ key: 'size', value: 'Image Size' },
		{ key: 'bytes', value: 'Size in Database' },
		{ key: 'imageData', value: 'Image' },
		{ key: 'actions', empty: true }
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

<div class="container">
	<AddNewImages redirectOnAdd={false} class="add-image" />
	{#if !$rows}
		<Loading />
	{:else if $rows.length === 0}
		<p>Add some images to get started!</p>
	{:else}
		<DataTable {headers} rows={$rows} stickyHeader class="dataset-table">
			<Toolbar>
				<ToolbarContent>
					<ToolbarSearch
						placeholder="Coming Soon..."
						on:change={() => {
							notify({
								title: 'Search',
								subtitle: 'Table filtering not yet implemented (sorry!)...'
							});
						}}
					/>
					<Button iconDescription="Delete all" icon={TrashCan}>Delete All</Button>
				</ToolbarContent>
			</Toolbar>

			<svelte:fragment slot="cell" let:row let:cell>
				{#if cell.key === 'imageData'}
					<img src={cell.value} alt={cell.value} height="80px" />
				{:else if cell.key === 'features'}
					{cell.value?.length || 0}
				{:else if cell.key === 'size'}
					{row.width}x{row.height}
				{:else if cell.key === 'bytes'}
					{formatBytes(row.imageData.length)}
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
</div>

<style>
	.container {
		display: grid;
		gap: 1rem;
		grid-template-columns: 1fr;
		grid-template-rows: auto 1fr;
		height: 100%;
		overflow: hidden;
	}

	p {
		font-size: 1.2rem;
		margin-left: 1rem;
	}

	:global(.dataset-table) {
		max-height: 100%;
		max-width: 1200px;
		min-height: 0;
	}

	:global(.dataset-table .bx--data-table_inner-container) {
		height: 100%;
	}

	:global(.dataset-table table) {
		height: 100%;
		max-height: fit-content;
	}

	:global(.dataset-table tbody) {
		height: calc(100% - 50px);
	}

	:global(.dataset-table tr) {
		height: fit-content;
	}

	:global(.dataset-table tr > :first-child),
	:global(.dataset-table tr > :last-child) {
		max-width: 10rem;
		text-align: center;
		width: 10rem;
	}

	:global(.dataset-table :is(td, th)) {
		align-items: center;
		justify-content: center;
	}

	:global(.dataset-table tr > :nth-child(2)) {
		justify-content: left;
	}

	img {
		margin: 0.5rem 0;
		transform-origin: 90% 10%;
		transition: all 200ms ease-out;

		&:hover {
			border-radius: 4px;
			box-shadow: 0 0 4px 2px #fff5;
			scale: 4;
			transition: all 400ms ease;
		}
	}
</style>
