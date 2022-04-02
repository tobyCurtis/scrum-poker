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
		margin-bottom: 10px;
		width: 50px;
		height: 100px;
		border-radius: 10%;
		border: 2px solid #3993ff;
		background-color: white;
		text-align: center;
		color: #333;
        display: flex;
        align-items: center;
        justify-content: center;
		color: #3993ff;
        font-size: 30px;
        font-weight: 700;
	}

	.selected {
		background-color: cornflowerblue;
		color: white
	}
</style>
