<script>
    import PlayingCard from './PlayingCard.svelte'
	import Flip from './Flip.svelte'
	import KickIcon from './KickIcon.svelte'
	import { players, cardsFlipped } from '../stores/pokieStore.js'
	import messenger from '../webSocketManager.js'

	export let adminMode = false;

	function kickPlayer(user) {
		if (!adminMode || !user) return;
		// Optimistically remove locally
		players.set($players.filter(p => p.user !== user))
		messenger.sendMessage({ type: 'kickPlayer', target: user });
	}
</script>

<!-- players -->
<!-- flex component -->
<div class="flex flex-center flex-wrap flex-gap">
    {#each $players as {user, points}, i}
        {@const debugIndex = i}
        {@const debugUser = user}
        
        <div class="flex flex-column flex-center">
            <div class="card-wrapper">
			{#if adminMode}
				<span class="kick-x" role="button" tabindex="0" aria-label="Kick player" on:click|stopPropagation={() => kickPlayer(user)} on:keydown|stopPropagation={(e) => (e.key === 'Enter' || e.key === ' ') && kickPlayer(user)}>
					<KickIcon />
				</span>
			{/if}
                <Flip flipped={$cardsFlipped} class="playing-card">
                    <PlayingCard slot="front" selected={!!points} />
                    <PlayingCard slot="back" value={$cardsFlipped && points || ''} />
                </Flip>
            </div>
            <p class="text-center player-name">{user}</p>
        </div>
    {/each}
</div>

<style>
	.card-wrapper {
		position: relative;
		width: 80px;
		height: 140px;
	}

	.player-name {
		margin-top: 6px;
		position: relative;
		z-index: 2;
		background: transparent;
	}

	.kick-x {
		position: absolute;
        z-index: 10;
		right: -10px;
		top: -10px;
		border: none;
		width: 24px;
		height: 24px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		line-height: 18px;
		font-weight: 700;
		cursor: pointer;
		user-select: none;
	}

	.kick-x:focus {
		outline: 2px solid #fff;
		outline-offset: 2px;
	}
</style>
