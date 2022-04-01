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

<div class="choice {selected ? 'selected' : ''}" on:click={emitPoints} >
	<span>{points}</span>
</div>

<style>
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
		background-color: cornflowerblue;
		color: white
	}
</style>
