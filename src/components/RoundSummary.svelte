<script>
	import { options, cardsFlipped } from '../stores/pokieStore.js'
	import { chart } from "svelte-apexcharts";
</script>

{#if $cardsFlipped}
	<div class="flex flex-center flex-wrap">
		<div use:chart={$options} />
	</div>
{/if}