<script>
	import PlayingCard from './components/PlayingCard.svelte'
	import Flip from './components/Flip.svelte'
	import { Button, Modal, Dialog, TextField, Headline, Divider, H2 } from 'attractions';

	const heartbeatTimeInMilliseconds = 50000
	let wshost = location.origin.replace(/^http/, 'ws') + '/ws'
	// let wshost = 'ws://localhost:3000/ws'
	let ws = new WebSocket(wshost)

	let showNameSelection = true
	let name = ''
	let nameErrors = []
	let pointOptions = [1, 2, 3, 5, 8, 13]
	let mySelection = null
	let players = []
	let cardsFlipped = false
	let playersStillChoosing = ''
	
	function joinTheTable() {
		if(name) {
			showNameSelection = false
			ws.send(JSON.stringify({type: 'playerUpdate', user: name, points: null}))
		} else {
			nameErrors = ['No Anons :(']
		}
	}
	
	function sendPoints(event) {
		if(cardsFlipped === false) {
			let points = event.detail.value
			if(points === mySelection) points = null
			mySelection = points
			ws.send(JSON.stringify({type: 'playerUpdate', user: name, points}))
		}
	}

	function cardFlip() {
		ws.send(JSON.stringify({type: 'cardFlip'}))
	}

	function nextIssue() {
		ws.send(JSON.stringify({type: 'nextIssue'}))
	}

	ws.addEventListener('message', msg => {
		let message = JSON.parse(msg.data)

		if(message.type === 'playerUpdate') {
			players = message.players
			playersStillChoosing = getPlayersStillChoosing()
		} else if (message.type === 'cardFlip') {
			cardsFlipped = true
		} else if (message.type === 'nextIssue') {
			mySelection = null
			cardsFlipped = false
			players = message.players
		}
	})

	setInterval(keepAlive, [heartbeatTimeInMilliseconds]);
	function keepAlive() {
		try {
			ws.send(JSON.stringify({type: 'heartbeat'}))
		} catch (error) {
			console.log('error', error)
			let refresh = confirm('Hit a snag, refresh?')
			if(refresh) location.reload()
		}
	}

	function getPlayersStillChoosing() {
		let playersStillThinking = players.filter(player => !player.points).map(player => player.user)
		console.log('choose players', playersStillThinking)

		if(playersStillThinking.length <= 2) {
			return playersStillThinking.join(' and ')
		} else {
			playersStillThinking[playersStillThinking.length - 1] = ` and ${playersStillThinking[playersStillThinking.length - 1]}`
			return playersStillThinking.join(', ')
		}
	}
</script>

<div class="container">
	{#if !showNameSelection }
		<Headline class="flex flex-center">
			Scrum Poker
		</Headline>
		<Divider />
		<div class="flex flex-center flex-wrap flex-gap">
			{#each players as {user, points}, i}
				<div>
					<Flip flipped={cardsFlipped} class="playing-card">
						<PlayingCard slot="front" selected={!!points} />
						<PlayingCard slot="back" value={points || ''} />
					</Flip>
					<p class="text-center">{user}</p>
				</div>
			{/each}
		</div>
		
		<div class="flex flex-center actions">

			{#if mySelection === null}
				<H2>Pick a card</H2>
			{:else if cardsFlipped}
				<Button on:click={nextIssue}>Vote Next Issue</Button>
			{:else if players.length && !players.find(player => !player.points) && !cardsFlipped}
				<Button on:click={cardFlip}>Show Cards</Button>
			{:else}
				<H2>Waiting for {playersStillChoosing} to choose</H2>
			{/if}

		</div>
	
		<div class="flex flex-center flex-wrap flex-gap">
			{#each pointOptions as pointValue, i}
				<PlayingCard value={pointValue} selected={mySelection === pointValue} on:click={sendPoints} />
			{/each}
		</div>
	{/if}

</div>


{#if showNameSelection}
	<Modal bind:open={showNameSelection}>
	  <Dialog title="What's your name?" class="name-modal">
		<form on:submit={joinTheTable} style="margin-bottom: 8px">
			<TextField
				placeholder="The Guttmanator"
				bind:value={name}
				tabindex="0"
				error={nameErrors}
			/>
		</form>
		<Button on:click={joinTheTable}>Submit</Button>
	  </Dialog>
	</Modal>
{/if}

<style>
	.container {
		max-width: 40%;
		margin: 0 auto;
	}

	@media only screen and (max-width: 700px) {
		.container {
			max-width: 90%;
			margin: 0 auto;
		}

	}

	.actions {
		margin: 20px 0 20px 0;
		height: 51px;
	}

</style>