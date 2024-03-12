import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

/**
 * @typedef {Object.<string,*>} TooltipParams
 * @property {string} [content] - Custom content to display in the tooltip.
 */

/**
 * Generates a tooltip for the given node with optional parameters.
 *
 * @param {HTMLElement|SVGElement} node - The DOM node to attach the tooltip to.
 * @param {TooltipParams} [params] - Optional parameters for customizing the tooltip behavior.
 * @return {Object} An object with update and destroy methods for managing the tooltip instance.
 */
function tooltip(node, params) {
	// Prefer custom content, then TML title attribute then the aria-label in that order.
	let content = params?.content || (node instanceof HTMLElement ? node.title : null);
	const label = node.getAttribute('aria-label');
	content = content ?? label;

	// Set the"aria-label" attribute if required
	// https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_aria-label_attribute
	if (!label) node.setAttribute('aria-label', content);

	// Clear out the HTML title attribute
	if (node instanceof HTMLElement) node.title = '';

	// Support Tippy props by forwarding params
	// https://atomiks.github.io/tippyjs/v6/all-props/
	const tip = tippy(node, { content, ...params });

	return {
		// Update the Tippy instance when props change
		update: (/** @type Object */ newParams) => tip.setProps({ content, ...newParams }),

		// Clean up the Tippy instance on unmount:
		destroy: () => tip.destroy()
	};
}

export { tooltip };
