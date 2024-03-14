<script>
	import { page } from '$app/stores';
	import { fetchImageObjectById } from '$lib/db';
	import { Loading } from 'carbon-components-svelte';
	import Viewer from '@components/Viewer.svelte';

	/** @type {ImageObject | false} */
	let imageObject = $state(false);
	let idStr = $page.url.searchParams.get('id');

	$effect(() => {
		let id;
		if ((id = parseInt(idStr, 10))) {
			fetchImageObjectById(id).then((_imageObject) => (imageObject = _imageObject));
		}
	});
</script>

<svelte:head>
	<title>Viewer {imageObject ? `"${imageObject.name}"` : ''} | MRM Explorer</title>
	<meta name="description" content="Application for investigating MRM outputs" />
</svelte:head>

{#if !idStr}
	<p>no id?</p>
{:else if imageObject === undefined}
	<p>bad id?</p>
{:else if !imageObject}
	<Loading />
{:else}
	<Viewer {imageObject} />
{/if}
