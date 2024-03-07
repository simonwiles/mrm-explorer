<script>
	import { FileUploaderDropContainer } from 'carbon-components-svelte';

	let imgName = $state();
	let imgData = $state();
</script>

{#if !imgData}
	<FileUploaderDropContainer
		on:change={({ detail: files }) => {
			const file = files[0];
			if (!file.type || !file.type.startsWith('image/')) {
				alert('Only image files are accepted');
				return;
			}
			imgName = file.name;
			const reader = new FileReader();
			reader.addEventListener('load', () => (imgData = reader.result), false);
			reader.readAsDataURL(file);
		}}
	>
		<span slot="labelText">Drag and drop map or other image here<br />(or click to upload)</span>
	</FileUploaderDropContainer>
{/if}

{#if imgData}
	<img src={imgData} alt={imgName} />
{/if}

<style>
	span {
		align-items: center;
		display: flex;
		height: 100%;
		justify-content: center;
		text-align: center;
		vertical-align: middle;
		width: 100%;
	}
</style>
