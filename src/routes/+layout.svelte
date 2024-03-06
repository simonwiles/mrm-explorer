<script>
	import { Header, SkipToContent, Content, Grid, Row, Column } from 'carbon-components-svelte';
	import 'carbon-components-svelte/css/g90.css';

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

<style>
	img {
		height: 30px;
		margin: 0 1rem 0 0;
		vertical-align: text-bottom;
	}
</style>
