/**
 * Applies a non-passive wheel event listener to the given element to manipulate `--scale`,
 *  `--transform-origin-X`, and `--transform-origin-Y` CSS variable on parent container that
 *  can be used to create a zoom effect.
 * (event modifiers are deprecated in Svelte 5, and we can't express "nonpassive" as a wrapper function.
 *  see: https://svelte-5-preview.vercel.app/docs/event-handlers#event-modifiers)
 * @param {HTMLElement} node
 */
export function wheelZoom(node) {
	/** @type {EventListenerOptions & { passive: Boolean }} */
	const options = { passive: false };

	let scale = 1;
	let transformOrigin = [0, 0];

	/**
	 * @param {WheelEvent} event
	 */
	function handler(event) {
		event.preventDefault();
		if (event.deltaY < 0) {
			transformOrigin = [event.clientX - node.offsetLeft, event.clientY - node.offsetTop];
			scale *= 1.1;
		} else {
			scale /= 1.1;
			if (scale < 1) scale = 1;
		}
		node.style.setProperty('--scale', `${scale.toFixed(4)}`);
		node.style.setProperty('--transform-origin-X', `${transformOrigin[0]}px`);
		node.style.setProperty('--transform-origin-Y', `${transformOrigin[1]}px`);
	}

	node.addEventListener('wheel', handler, options);
	return {
		destroy() {
			node.removeEventListener('wheel', handler, options);
		}
	};
}
