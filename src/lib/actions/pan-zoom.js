import Panzoom from '@panzoom/panzoom';

/**
 * Initializes the Panzoom functionality on the given node.
 * @param {HTMLElement} node - The HTML element to initialize
 * @return {void}
 */
export function panZoom(node) {
	const panzoom = Panzoom(node, {
		contain: 'outside',
		canvas: true,
		panOnlyWhenZoomed: true,
		startScale: 1,
		minScale: 1,
		maxScale: 20
	});
	const parent = node.parentElement;
	if (parent === null) {
		throw new Error('PanZoom node has no parent element');
	}
	parent.addEventListener('wheel', panzoom.zoomWithWheel);
}
