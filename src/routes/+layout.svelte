<script>
	import { Header, SkipToContent, Content } from 'carbon-components-svelte';
	import Notifications from '@/components/Notifications.svelte';
	import '@/carbon-theming.css';

	import logo from '../img/sul.41x40.png';
</script>

<Header platformName="MRM Explorer">
	<img slot="company" src={logo} alt="Stanford University Libraries" />
	<svelte:fragment slot="skip-to-content">
		<SkipToContent />
	</svelte:fragment>
</Header>

<Content>
	<slot />
</Content>

<Notifications />

<style>
	img {
		height: 30px;
		margin: 0 1rem 0 0;
		vertical-align: text-bottom;
	}

	:global(.tippy-box) {
		box-shadow: 0 0 4px 0px white;
	}

	:global(.toast) {
		position: absolute;
		top: 4rem;
		right: 2rem;
	}
</style>
