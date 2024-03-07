<script>
	import { FileUploaderDropContainer } from 'carbon-components-svelte';
	import { db } from '$lib/db.js';

	let imgName = $state();
	let imgData = $state();

	/**
	 * @param {string} _imgName
	 * @param {string | ArrayBuffer | null} _imgData
	 */
	async function addImage(_imgName, _imgData) {
		imgName = _imgName;
		imgData = _imgData;
		try {
			const id = await db.images.add({ name: imgName, image: imgData });
			console.log(`Image ${imgName} successfully added. Got id ${id}`);
		} catch (error) {
			console.error(`Failed to add ${imgName}: ${error}`);
		}
	}

	$effect.pre(async () => {
		const images = await db.images.toArray();
		if (images.length > 0) {
			imgName = images[0].name;
			imgData = images[0].image;
		} else {
			imgData = false;
		}
	});
</script>

{#if imgData === false}
	<FileUploaderDropContainer
		on:change={({ detail: files }) => {
			const file = files[0];
			if (!file.type || !file.type.startsWith('image/')) {
				alert('Only image files are accepted');
				return;
			}
			const reader = new FileReader();
			reader.addEventListener('load', () => addImage(file.name, reader.result), false);
			reader.readAsDataURL(file);
		}}
	>
		<span class="file-upload-dropzone" slot="labelText">
			Drag and drop map or other image here<br />(or click to upload)
		</span>
	</FileUploaderDropContainer>
{/if}

{#if imgData}
	<img src={imgData} alt={imgName} />
{/if}

<style>
	.file-upload-dropzone {
		align-items: center;
		display: flex;
		height: 100%;
		justify-content: center;
		text-align: center;
		vertical-align: middle;
		width: 100%;
	}
</style>
