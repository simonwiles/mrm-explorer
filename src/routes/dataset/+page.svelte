<script>
	import { DataTable, Loading } from 'carbon-components-svelte';
	import { fetchAllImageObjects } from '$lib/db';

	let rows = $state();

	const headers = [
		{ key: 'id', value: 'ID' },
		{ key: 'name', value: 'Name' },
		{ key: 'features', value: 'Features' },
		{ key: 'width', value: 'Size' },
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
			{:else if cell.key === 'width'}
				{cell.value}x{row.height}
			{:else}
				{cell.value}
			{/if}
		</svelte:fragment>
	</DataTable>
{/if}
