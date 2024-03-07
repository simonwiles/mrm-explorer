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
	/**
	 * Applies a non-passive wheel event listener to the given element
	 * (event modifiers are deprecated in Svelte 5, and we can't express
	 *  "nonpassive" as a wrapper function.
	 *  see: https://svelte-5-preview.vercel.app/docs/event-handlers#event-modifiers)
	 * @param {HTMLElement} node
	 */
	function wheelZoom(node) {
		/** @type {EventListenerOptions & { passive: Boolean }} */
		const options = { passive: false };

		/**
		 * @param {WheelEvent} event
		 */
		function handler(event) {
			event.preventDefault();
			if (event.deltaY < 0) {
				imageToX = event.clientX;
				imageToY = event.clientY;
				imageScale *= 1.1;
			} else {
				imageScale /= 1.1;
				if (imageScale < 1) imageScale = 1;
			}
		}

		node.addEventListener('wheel', handler, options);
		return {
			destroy() {
				node.removeEventListener('wheel', handler, options);
			}
		};
	}
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
						<div class="image-name">{image.name}</div>
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
					use:wheelZoom
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
		right: 1rem;
		top: calc(48px + 1rem);
	}

	.image-name {
		align-self: center;
		flex-grow: 1;
		padding: 0 1rem;
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
