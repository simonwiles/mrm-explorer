<script context="module">
	let open = $state();
	let detail = $state();
	let content = $state();

	/**
	 * @type {Object.<string,Function>}
	 */
	let response = {
		resolve: () => {},
		reject: () => {}
	};

	/**
	 * @param {Object} detail - Modal details
	 * @param {string} content - Modal content
	 * @returns {Promise<null>}
	 */
	export async function confirm(detail, content = '') {
		open = true;
		detail = detail;
		content = content;

		return new Promise((resolve, reject) => {
			response.resolve = resolve;
			response.reject = reject;
		});
	}
</script>

<script>
	import { Modal } from 'carbon-components-svelte';
	const defaults = {
		modalHeading: 'Are you sure?',
		primaryButtonText: 'Confirm',
		secondaryButtonText: 'Cancel'
	};
</script>

<Modal
	bind:open
	{...{ ...defaults, ...detail }}
	on:click:button--primary={() => {
		open = false;
		response.resolve();
	}}
	on:click:button--secondary={() => {
		open = false;
		response.reject();
	}}
>
	<p>{content}</p>
</Modal>
