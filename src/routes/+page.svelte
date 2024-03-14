<script>
	import AddNewImage from '@components/AddNewImage.svelte';
</script>

<svelte:head>
	<title>MRM Explorer</title>
	<meta name="description" content="Application for investigating MRM outputs" />
</svelte:head>

<section>
	<h1>MRM Explorer</h1>

	<p>Upload an image to get started:</p>

	<AddNewImage redirectOnAdd={true} />
</section>

<style>
	section {
		margin: 0 0 2rem 2rem;

		& * {
			margin: 2rem 0;
		}
	}
</style>
