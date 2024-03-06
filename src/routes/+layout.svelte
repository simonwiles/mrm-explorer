<script>
	import { Header, SkipToContent, Content, Grid, Row, Column } from 'carbon-components-svelte';
	import 'carbon-components-svelte/css/g90.css';
</script>

<Header company="SUL" platformName="MRM Explorer">
	<svelte:fragment slot="skip-to-content">
		<SkipToContent />
	</svelte:fragment>
</Header>

<Content>
	<Grid>
		<Row>
			<Column>
				<slot />
			</Column>
		</Row>
	</Grid>
</Content>
