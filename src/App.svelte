<script>
	import Card from './components/Card.svelte'
	import Choice from './components/Choice.svelte'
	import Modal from './components/Modal.svelte'
	const heartbeatTimeInMilliseconds = 50000
	// let wshost = location.origin.replace(/^http/, 'ws') + '/ws'
	let wshost = 'ws://localhost:3000/ws'
	let ws = new WebSocket(wshost)

	let showNameSelection = true
	let name = ''
	let pointOptions = [1, 2, 3, 5, 8, 13]
	let mySelection = null
	let players = []
	let cardsFlipped = false
	
	function joinTheTable() {
		if(name) {
			showNameSelection = false
			ws.send(JSON.stringify({type: 'playerUpdate', user: name, points: null}))
		} else {
			alert('please enter a name')
		}
	}
	
	function sendPoints(event) {
		if(cardsFlipped === false) {
			let points = event.detail.points
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
</script>

<div class="container">
	<section class="style-one">
		<div class="wordart">
			<h1 class="preview">
				Scrum Poker
			</h1>
		</div>
	</section>
	<div class="flex-container">
		{#each players as {user, points}, i}
			<Card hasSelection={points} text={points} flipped={cardsFlipped} name={user}/>
		{/each}
	</div>
	
	<div class="button-container">
		{#if players.length && !players.find(player => !player.points) && !cardsFlipped}
			<button on:click={cardFlip}>Show Cards</button>
		{:else if cardsFlipped}
			<button on:click={nextIssue}>Vote Next Issue</button>
		{/if}
	</div>
	
	{#if !showNameSelection }
		<div class="flex-container">
			{#each pointOptions as pointValue, i}
				<Choice points={pointValue} selected={pointValue === mySelection} on:click={sendPoints} />
			{/each}
		</div>
	{/if}

</div>


{#if showNameSelection}
	<Modal>
		<h2 slot="header">
			...do I know you?
		</h2>
		<form on:submit={joinTheTable}>
			<input tabindex="0" type="text" bind:value={name} placeholder="enter your name" autofocus>
		</form>
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

	@media only screen and (max-width: 700px) {
		.container {
			max-width: 90%;
			margin: 0 auto;
		}

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
		flex-wrap: wrap;
	}
</style>