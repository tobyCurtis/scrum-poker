<script>
	import { players, cardsFlipped, waitingForMessage, playersStillChoosing, isSpectator } from './stores/pokieStore.js'
    import { Button, H2 } from 'attractions';


</script>

<!--  game-messaging -->
<div class="flex flex-center actions">
    {#if !$waitingForMessage}
        {#if mySelection === null && $isSpectator === false}
            <H2>Pick a card</H2>
        {:else if $cardsFlipped}
            <Button on:click={nextIssue}>Vote Next Issue</Button>
        {:else if $players.length && !$players.find(player => !player.points) && !$cardsFlipped}
            <Button on:click={cardFlip}>Show Cards</Button>
        {:else}
            <H2>Waiting for {$playersStillChoosing} to choose</H2>
        {/if}
    {/if}
</div>