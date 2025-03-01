<script module>
	let notification = $state();

	/**
	 * @param {Object} detail - Notification details
	 */
	export function notify(detail) {
		notification = detail;
	}
</script>

<script>
	import { fade } from 'svelte/transition';
	import { ToastNotification } from 'carbon-components-svelte';
	const defaults = { timeout: 3000, kind: 'success', title: 'Notification' };
</script>

{#if notification}
	<div class="toast" transition:fade>
		<ToastNotification
			{...{ ...defaults, ...notification }}
			on:close={() => (notification = null)}
		/>
	</div>
{/if}
