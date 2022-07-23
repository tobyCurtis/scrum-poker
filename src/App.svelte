<script>
	import PlayingCard from './components/PlayingCard.svelte'
	import Flip from './components/Flip.svelte'
	import { Button, Modal, Dialog, TextField, Headline, Divider, H2 } from 'attractions';

	import { chart } from "svelte-apexcharts";
	import ConfettiGenerator from "confetti-js";

	const heartbeatTimeInMilliseconds = 50000
	const wshost = production ? location.origin.replace(/^http/, 'ws') + '/ws' : 'ws://localhost:3000/ws'
	let ws
	initWebSocket() 

	let options = {}
	let showNameSelection = true
	let isSpectator = false
	let name = ''
	let nameErrors = []
	let pointOptions = [1, 2, 3, 5, 8, 13]
	let mySelection = null
	let players = []
	let cardsFlipped = false
	let playersStillChoosing = ''
	let waitingForMessage = false
	let confetti = {}
	let placeholderName = getRandomName()

	function checkForConfetti() {
		let choices = players.reduce((allPoints, player) => {
			allPoints[player.points] = true
			return allPoints
		}, {})

		if(Object.keys(choices).length === 1) {
			doConfetti()
		}
	}

	function doConfetti() {
		confetti = new ConfettiGenerator({ 
			target: 'confetti',
		});
		confetti.render();
	}

	function stopConfetti() {
		if(confetti.clear) confetti.clear();
	}

	function joinTheTable() {
		if(!name) name = placeholderName
		showNameSelection = false
		ws.send(JSON.stringify({type: 'playerUpdate', user: name, points: null}))
	}

	function joinSpectator() {
		isSpectator = true
		showNameSelection = false
	}
	
	function sendPoints(event) {
		if(cardsFlipped === false) {
			let points = event.detail.value
			if(points === mySelection) points = null
			mySelection = points
			waitingForMessage = true
			ws.send(JSON.stringify({type: 'playerUpdate', user: name, points}))
		}
	}

	function cardFlip() {
		ws.send(JSON.stringify({type: 'cardFlip'}))
	}

	function nextIssue() {
		ws.send(JSON.stringify({type: 'nextIssue'}))
	}

	function initWebSocket() {
		ws = new WebSocket(wshost)

		ws.addEventListener('message', msg => {
			waitingForMessage = false
			let message = JSON.parse(msg.data)
	
			if(message.type === 'playerUpdate') {
				players = message.players
				playersStillChoosing = getPlayersStillChoosing()
			} else if (message.type === 'cardFlip') {
				checkForConfetti()
				generateOptions()
				cardsFlipped = true
			} else if (message.type === 'nextIssue') {
				stopConfetti()
				mySelection = null
				cardsFlipped = false
				players = message.players
			} else if (message.type === 'heartbeat') {
				console.log('heartbeat response')
			}
		})

		setInterval(keepAlive, [heartbeatTimeInMilliseconds]);
		function keepAlive() {
			try {
				ws.send(JSON.stringify({type: 'heartbeat'}))
			} catch (error) {
				let refresh = confirm('Hit a snag, refresh?')
				if(refresh) location.reload()
			}
		}
	}


	function getPlayersStillChoosing() {
		let playersStillThinking = players.filter(player => !player.points).map(player => player.user)

		if(playersStillThinking.length <= 2) {
			return playersStillThinking.join(' and ')
		} else {
			playersStillThinking[playersStillThinking.length - 1] = ` and ${playersStillThinking[playersStillThinking.length - 1]}`
			return playersStillThinking.join(', ')
		}
	}

	function generateOptions() {
		let pointChoices = {}
		players.forEach(player => {
			if(pointChoices[player.points]) {
				pointChoices[player.points]++
			} else {
				pointChoices[player.points] = 1
			}
		})

		options = {
			colors: ['#4300b0'],
			grid: {
				show: false	
			},
			chart: {
				type: "bar",
				toolbar: {
					show: false
				},
				zoom: {
					enabled: false
				}
			},
			states: {
				hover: {
					filter: {
						type: 'none',
						value: 0
					}
				},
				active: {
					filter: {
						type: 'none',
						value: 0
					}
				},
			},
			series: [{
				name: "sales",
				data: Object.values(pointChoices) || [],
			}],
			xaxis: {
				categories: Object.keys(pointChoices) || [],
			},
			yaxis: {
				show: false,
			},
			tooltip: {
				enabled: false
			}
		};
	}

	function getRandomName() {
		let firstNames = ['Berthefried', 'Tatiana', 'Hildeburg', 'Bilbo', 'Frodo', 'Theodulph', 'Poppy', 'Daddy', 'Hilda', 'Falco', 'Bandobras','Odo','Eglantine','Gerontius','Samwise','Gorbadoc','Gormadoc','Griffo','Lotho','Andwise','Bungo','Bilbo','Mungo','Balbo','Bingo','Dudo','Drogo','Elfstan','Ferdibrand','Meriadoc','Peregrin','Hamfast','Rosamunda','Menegilda','Wiseman','Wilcom','Merry','Asphodel','Firiel','Hildigrim','Donnamira','Rosie','Filibert','Sigismond','Isembold','Hugo','Lalia','Marmadoc','Saradoc','Primula','Tobold','Mimosa','Orgulas','Frodo','Lobelia','Togo','Celandine','Wilibald','Robin','Ted','Adaldrida','Will','Adamanta','Belladonna','Flambard','Adalgrim','Hob',]
		let lastNames = ['Baggins', 'Lightfoot', 'Boulderhill', 'Bolger','Twofoot','Bracegirdle','Chubb-Baggins','Bullroarer','Proudfoot','Took','Gamgee','Broadbelt','Deepdelver','Boffin','Pimple','Roper','Baggins','Fairbarn','Brandybuck','Goold','Gamwich','Jolly','Gardner','Burrows','Fairbairn','Cotton','Clayhanger','Masterful','Scattergold','Hornblower','Bunce','Sackville-Baggins','Goodbody','Smallburrow','Sandyman','Whitfoot','Hayward']

		return `${pickRandom(firstNames)} ${pickRandom(lastNames)}`;
	}

	function pickRandom(list) {
		return list[Math.floor(Math.random() * list.length)];
	}

	document.addEventListener("visibilitychange", function() {
		const websocketNotConnected = ws.readyState !== WebSocket.OPEN
		const windowIsActive = document.visibilityState === 'visible'
		console.log('will i do something?', windowIsActive && websocketNotConnected)

		if(windowIsActive && websocketNotConnected) {
			console.log('dead on return')
			initWebSocket() 

			if(name) {
				showNameSelection = false
				ws.send(JSON.stringify({type: 'playerUpdate', user: name, points: null}))
			}
		}
	});

</script>

<div id="entirePage">
	<canvas id="confetti"></canvas>
	<div class="container">
		{#if !showNameSelection }
			<Headline class="flex flex-center">
				Scrum Poker
			</Headline>
			<Divider />
			<div class="flex flex-center flex-wrap flex-gap">
				{#each players as {user, points}, i}
					<div class="flex flex-column flex-center">
						<Flip flipped={cardsFlipped} class="playing-card">
							<PlayingCard slot="front" selected={!!points} />
							<PlayingCard slot="back" value={cardsFlipped && points || ''} />
						</Flip>
						<p class="text-center">{user}</p>
					</div>
				{/each}
			</div>
			
			<div class="flex flex-center actions">
				{#if !waitingForMessage}
					{#if mySelection === null && isSpectator === false}
						<H2>Pick a card</H2>
					{:else if cardsFlipped}
						<Button on:click={nextIssue}>Vote Next Issue</Button>
					{:else if players.length && !players.find(player => !player.points) && !cardsFlipped}
						<Button on:click={cardFlip}>Show Cards</Button>
					{:else}
						<H2>Waiting for {playersStillChoosing} to choose</H2>
					{/if}
				{/if}
			</div>
		
			{#if !isSpectator}
				<div class="flex flex-center flex-wrap flex-gap">
					{#each pointOptions as pointValue, i}
						<PlayingCard value={pointValue} selected={mySelection === pointValue} on:click={sendPoints} />
					{/each}
				</div>
			{/if}
	
			{#if cardsFlipped}
				<div class="flex flex-center flex-wrap">
					<div use:chart={options} />
				</div>
			{/if}
		{/if}
	
	</div>
</div>


{#if showNameSelection}
	<Modal bind:open={showNameSelection} noClickaway>
	  <Dialog title="What's your name?" class="name-modal">
		<form on:submit={joinTheTable} style="margin-bottom: 8px">
			<TextField
				placeholder={placeholderName}
				bind:value={name}
				tabindex="0"
				error={nameErrors}
			/>
		</form>
		<div class="flex flex-gap">
			<Button on:click={joinTheTable}>Let's Pokie</Button>
			<Button on:click={joinSpectator}>Spectate</Button>
		</div>
	  </Dialog>
	</Modal>
{/if}

<style>
	.container {
		max-width: 70%;
		margin: 0 auto;
		position: relative;
	}
	
	#entirePage {
		position: relative;
	}

	#confetti {
		position: absolute;
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
		text-align: center;
	}

</style>