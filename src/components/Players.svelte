<script>
    import PlayingCard from './PlayingCard.svelte'
	import Flip from './Flip.svelte'
	import { players, cardsFlipped } from '../stores/pokieStore.js'

    $: console.log('Players component received', $players)

</script>

<!-- players -->
<!-- flex component -->
<div class="flex flex-center flex-wrap flex-gap">
    {#each $players as {user, points}, i}
        {@const debugIndex = i}
        {@const debugUser = user}
        <div class="flex flex-column flex-center">
            <Flip flipped={$cardsFlipped} class="playing-card">
                <PlayingCard slot="front" selected={!!points} />
                <PlayingCard slot="back" value={$cardsFlipped && points || ''} />
            </Flip>
            <p class="text-center">{user}</p>
        </div>
    {/each}
</div>
