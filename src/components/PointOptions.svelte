<script>
	import PlayingCard from './PlayingCard.svelte'
	import { pointOptions, isSpectator, mySelection, lastChosenPoints, waitingForMessage, name, cardsFlipped } from '../stores/pokieStore.js'
	import messenger from '../webSocketManager.js'

	function sendPoints(event) {
		if($cardsFlipped === false) {
			let points = event.detail.value
			if(points === $mySelection) points = null
			$mySelection = points
			$waitingForMessage = true
			$lastChosenPoints = points
			messenger.sendMessage({type: 'playerUpdate', user: $name, points})
		}
	}
</script>

<!-- point-options -->
{#if !$isSpectator}
    <div class="flex flex-center flex-wrap flex-gap">
        {#each $pointOptions as pointValue, i}
            <PlayingCard value={pointValue} selected={$mySelection === pointValue} on:click={sendPoints} />
        {/each}
    </div>
{/if}