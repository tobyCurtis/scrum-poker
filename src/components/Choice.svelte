<script>
	export let points;
	export let selected;
	
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	function emitPoints() {
		dispatch('click', {
			points
		});
	}

</script>

<div class="choice-container">
	<div class="choice {selected ? 'selected' : ''}" on:click={emitPoints} >
		<span>{points}</span>
	</div>
</div>


<style>
	.choice-container {
		position: relative;
		width: 50px;
	}

	.choice {
		font-weight: bold;
		width: 50px;
		height: 100px;
		border-radius: 10%;
		border: 1px solid blue;
		background-color: white;
		text-align: center;
		color: #333;
        display: flex;
        align-items: center;
        justify-content: center;
	}

	.selected {
		margin-bottom: 10px;
		background-color: cornflowerblue;
		position: absolute;
		top: -10px;
		color: white
	}
</style>
