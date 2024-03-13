<script>
	import { DataTable, Loading } from 'carbon-components-svelte';
	import { fetchAllImageObjects } from '$lib/db';

	let rows = $state();

	const headers = [
		{ key: 'id', value: 'ID', width: '8rem' },
		{ key: 'name', value: 'Name' },
		{ key: 'features', value: '# Features' },
		{ key: 'size', value: 'Size' },
		{ key: 'imageData', value: 'Image' }
	];

	$effect(() => {
		fetchAllImageObjects().then((images) => (rows = images));
	});
</script>

<svelte:head>
	<title>Dataset | MRM Explorer</title>
	<meta name="description" content="Application for investigating MRM outputs" />
</svelte:head>

{#if !rows}
	<Loading />
{:else if rows.length === 0}
	<p>wot no images?</p>
{:else}
	<DataTable {headers} {rows}>
		<svelte:fragment slot="cell" let:row let:cell>
			{#if cell.key === 'imageData'}
				<img src={cell.value} alt={cell.value} height="80px" />
			{:else if cell.key === 'features'}
				{cell.value.length}
			{:else if cell.key === 'size'}
				{row.width}x{row.height}
			{:else}
				{cell.value}
			{/if}
		</svelte:fragment>
	</DataTable>
{/if}

<style>
	img {
		margin: 0.5rem 0;
		transform-origin: 10% 10%;
		transition: all 500ms ease;

		&:hover {
			border-radius: 4px;
			box-shadow: 0 0 4px 2px #fff5;
			scale: 4;
		}
	}
</style>
