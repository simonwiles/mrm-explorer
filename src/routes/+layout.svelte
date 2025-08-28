<script>
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import {
		Content,
		Header,
		SideNav,
		SideNavDivider,
		SideNavItems,
		SideNavLink,
		SkipToContent
	} from 'carbon-components-svelte';
	import DataBase from 'carbon-icons-svelte/lib/DataBase.svelte';
	import Home from 'carbon-icons-svelte/lib/Home.svelte';
	import LogoGithub from 'carbon-icons-svelte/lib/LogoGithub.svelte';
	import SearchLocate from 'carbon-icons-svelte/lib/SearchLocate.svelte';

	import Notifications from '@components/Notifications.svelte';
	import ConfirmationModal from '@components/ConfirmationModal.svelte';
	import '@/carbon-theming.css';

	import logo from '../img/sul.41x40.png';

	let isSideNavOpen = false;
</script>

<Header platformName="Map ATR Explorer" bind:isSideNavOpen>
	<img slot="company" src={logo} alt="Stanford University Libraries" class="sul-logo" />
	<svelte:fragment slot="skip-to-content">
		<SkipToContent />
	</svelte:fragment>
</Header>

<SideNav bind:isOpen={isSideNavOpen} rail>
	<SideNavItems>
		<SideNavLink icon={Home} text="Home" href="{base}/" isSelected={$page.url.pathname == '/'} />
		<SideNavLink
			icon={DataBase}
			text="Dataset"
			href="{base}/dataset/"
			isSelected={$page.url.pathname == '/dataset'}
		/>
		<SideNavLink
			icon={SearchLocate}
			text="Search Interface"
			href="{base}/search/"
			isSelected={$page.url.pathname == '/search'}
		/>
		<SideNavDivider />
		<SideNavLink
			icon={LogoGithub}
			text="GitHub"
			href="https://github.com/sul-rds/map-atr-explorer"
		/>
	</SideNavItems>
</SideNav>

<Content>
	<slot />
</Content>

<Notifications />
<ConfirmationModal />

<style>
	:global(#main-content) {
		height: calc(100vh - 3rem);
		overflow: hidden;
	}

	.sul-logo {
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
