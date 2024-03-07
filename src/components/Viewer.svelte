<script>
	import { ToastNotification, Loading } from 'carbon-components-svelte';
	import { FileUploaderDropContainer } from 'carbon-components-svelte';
	import { Grid, Row, Column, Toolbar, ToolbarContent, Button } from 'carbon-components-svelte';
	import { CloseLarge } from 'carbon-icons-svelte';
	import { db } from '$lib/db.js';
	import { fade } from 'svelte/transition';

	let showNotification = $state();
	let image = $state();

	let imageScale = $state(1);
	let imageToX = $state(0);
	let imageToY = $state(0);

	/**
	 * @param {string} imgName
	 * @param {string | ArrayBuffer | null} imgData
	 */
	async function addImage(imgName, imgData) {
		try {
			const id = await db.images.add({ name: imgName, image: imgData });
			console.log(`Image ${imgName} successfully added. Got id ${id}`);
			image = { id: id, name: imgName, image: imgData };
		} catch (error) {
			console.error(`Failed to add ${imgName}: ${error}`);
		}
	}

	async function removeImage() {
		await db.images.delete(image.id);
		showNotification = image.name;
		image = false;
	}

	$effect.pre(async () => {
		const images = await db.images.toArray();
		if (images.length > 0) {
			image = images[0];
		} else {
			image = false;
		}
	});
</script>

{#if image === undefined}
	<Loading />
{/if}

{#if image === false}
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

{#if image}
	<Grid fullWidth>
		<Row>
			<Column>
				<Toolbar size="sm">
					<ToolbarContent>
						<Button
							icon={CloseLarge}
							iconDescription="Close"
							on:click={removeImage}
							tooltipPosition="left"
							tooltipAlignment="end"
						/>
					</ToolbarContent>
				</Toolbar>
			</Column>
		</Row>
		<Row>
			<Column>
				<div
					class="image-container"
					style="--scale: {imageScale}; --transform-origin-X: {imageToX}px; --transform-origin-Y: {imageToY}px"
					on:wheel|nonpassive|preventDefault={(e) => {
						console.log(e);
						imageToX = e.layerX;
						imageToY = e.layerY;
						if (e.deltaY < 0) {
							imageScale *= 1.1;
						} else {
							imageScale /= 1.1;
							if (imageScale < 1) imageScale = 1;
						}
					}}
				>
					<img src={image.image} alt={image.name} />
				</div>
			</Column>
		</Row>
	</Grid>
{/if}

{#if showNotification}
	<div class="toast" transition:fade>
		<ToastNotification
			timeout={3000}
			kind="success"
			title="Image removed."
			subtitle={`Removed image: ${showNotification}`}
			on:close={() => (showNotification = false)}
		/>
	</div>
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

	.toast {
		position: absolute;
		top: calc(48px + 1rem);
		right: 1rem;
	}

	.image-container {
		overflow: hidden;

		img {
			width: 100%;
			transform: scale(var(--scale));
			transform-origin: var(--transform-origin-X) var(--transform-origin-Y);
		}
	}
</style>
