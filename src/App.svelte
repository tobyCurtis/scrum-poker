<script>
	import Card from './components/Card.svelte'
	import Choice from './components/Choice.svelte'
	import Modal from './components/Modal.svelte'
	let ws = new WebSocket('ws://localhost:3000/ws')

	let showNameSelection = true
	let name = ''
	let pointOptions = [1, 2, 3, 5, 8, 13]
	let mySelection = null
	let players = []
	let cardsFlipped = false
	
	function joinTheTable() {
		showNameSelection = false
		ws.send(JSON.stringify({type: 'playerUpdate', user: name, points: null}))
	}
	
	function sendPoints(event) {
		let points = event.detail.points
		if(points === mySelection) points = null
		mySelection = points
		ws.send(JSON.stringify({type: 'playerUpdate', user: name, points}))
	}

	function cardFlip() {
		ws.send(JSON.stringify({type: 'cardFlip'}))
	}

	function nextIssue() {
		ws.send(JSON.stringify({type: 'nextIssue'}))
	}

	ws.addEventListener('message', msg => {
		let message = JSON.parse(msg.data)
		console.log(message)
		if(message.type === 'playerUpdate') {
			players = message.players
		} else if (message.type === 'cardFlip') {
			cardsFlipped = true
		} else if (message.type === 'nextIssue') {
			mySelection = null
			cardsFlipped = false
			players = message.players
		}
	})
</script>

<div class="container">
	<h1>
		Scrum Poker
	</h1>
	<div class="flex-container">
		{#each players as {user, points}, i}
			<Card hasSelection={points} text={cardsFlipped && points || 'I am card'} name={user}/>
		{/each}
	</div>
	
	<div class="button-container">
		{#if players.find(player => player.points) && !cardsFlipped}
			<button on:click={cardFlip}>Show Cards</button>
		{:else if cardsFlipped}
			<button on:click={nextIssue}>Vote Next Issue</button>
		{/if}
	</div>
	
	<div class="flex-container">
		{#each pointOptions as pointValue, i}
			<Choice points={pointValue} selected={pointValue === mySelection} on:click={sendPoints} />
		{/each}
	</div>
</div>


{#if showNameSelection}
	<Modal>
		<h2 slot="header">
			...do I know you?
		</h2>
		<input bind:value={name} placeholder="enter your name">
		<button slot="footer" on:click={joinTheTable}>Submit</button>
	</Modal>
{/if}

<style>
	h1 {
		text-align: center;
	}

	.container {
		max-width: 40%;
		margin: 0 auto;
	}

	.button-container {
		margin-top: 40px;
		height: 40px;
		text-align: center;
	}

	.flex-container {
		margin-top: 40px;
		display: flex;
		justify-content: space-between;
	}
</style>