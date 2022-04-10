<script>
    export let value = '';
    export let selected;
    import { Card } from 'attractions';

    import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	function emitValue() {
		dispatch('click', {
			value
		});
	}
</script>

<div on:click={emitValue}>
    <Card outline tight class="flex flex-center font-size_large playing-card {selected && 'selected-card'}">
        {value}
    </Card>
</div>