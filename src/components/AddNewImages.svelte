<script>
	import { base } from '$app/paths';
	import { FileUploaderDropContainer } from 'carbon-components-svelte';

	import { upsertImageObject } from '$lib/db';
	import { notify } from '@components/Notifications.svelte';

	let { redirectOnAdd, ...props } = $props();

	/** @type {File[]} */
	let files = $state([]);

	/**
	 * @param {string} name name of the image
	 * @param {Blob} imageBlob image blob
	 */
	async function addImageToDb(name, imageBlob) {
		/** @type {ImageObject} */
		const _imageObject = { name, imageBlob };
		const img = new Image();
		img.src = URL.createObjectURL(imageBlob);
		img.decode().then(() => {
			_imageObject.width = img.naturalWidth;
			_imageObject.height = img.naturalHeight;
			upsertImageObject(_imageObject).then(([, newImageObject]) => {
				if (newImageObject === null) {
					console.error(`Failed to add ${name}: ${_imageObject}`);
					return;
				}
				notify({
					title: 'Image Added',
					subtitle: `Image "${newImageObject.name}" added (ID is ${newImageObject.id})`
				});

				if (redirectOnAdd) {
					window.location.href =
						files.length === 1 ? `${base}/view/?id=${newImageObject.id}` : `/dataset/`;
				}

				files = [];
			});
		});
	}

	/**
	 * @param {File} file
	 */
	function processFile(file) {
		if (!file.type || !file.type.startsWith('image/')) {
			alert(`Only image files are accepted (file "${file.name}" rejected).`);
			return;
		}
		addImageToDb(file.name, file);
	}
</script>

<FileUploaderDropContainer
	multiple
	bind:files
	on:change={({ detail: files }) => {
		files.forEach((file) => processFile(file));
	}}
	{...props}
>
	<span class="file-upload-dropzone" slot="labelText">
		Drag and drop map or other image here<br />(or click to upload)
	</span>
</FileUploaderDropContainer>

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
