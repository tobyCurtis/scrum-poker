<script>
	import messenger from './webSocketManager.js'
	import confettiGenerator from "confetti-js"

	import Header from './components/Header.svelte'
	import Players from './components/Players.svelte'
	import GameMessaging from './components/GameMessaging.svelte'
	import PointOptions from './components/PointOptions.svelte'
	import RoundSummary from './components/RoundSummary.svelte'
	import NameSelectionModal from './components/NameSelectionModal.svelte'

	import {
		players,
		cardsFlipped,
		waitingForMessage,
		lastChosenPoints,
		showNameSelection,
		options,
		mySelection,
		confetti,
	} from './stores/pokieStore.js'
	
	messenger.initWebSocket()
	.then(() => {
		messenger.ws.addEventListener('message', msg => {
		    $waitingForMessage = false
		    let message = JSON.parse(msg.data)
	
		    if(message.type === 'playerUpdate') {
		        $players = sanitizePlayers(message.players)
		    } else if (message.type === 'getPlayers') {
		        $players = sanitizePlayers(message.players)
		    } else if (message.type === 'cardFlip') {
		        checkForConfetti()
		        generateChartOptions()
		        $cardsFlipped = true
		    } else if (message.type === 'nextIssue') {
		        stopConfetti()
		        $mySelection = null
		        $cardsFlipped = false
		        $players = message.players
		        $lastChosenPoints = null
		    } else if (message.type === 'heartbeat') {
		        console.log('heartbeat response')
		    }
		})

	})

	function checkForConfetti() {
		let choices = $players.reduce((allPoints, player) => {
			allPoints[player.points] = true
			return allPoints
		}, {})

		if(Object.keys(choices).length === 1) {
			doConfetti()
		}
	}
	
	function doConfetti() {
		$confetti = new confettiGenerator({ 
			target: 'confetti',
		});
		$confetti.render();
	}
	
	function generateChartOptions() {
		let pointChoices = {}
		$players.forEach(player => {
			if(pointChoices[player.points]) {
				pointChoices[player.points]++
			} else {
				pointChoices[player.points] = 1
			}
		})

		$options = {
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

	function stopConfetti() {
		if($confetti.clear) $confetti.clear();
	}

	/**
	 * Drop malformed players to avoid rendering "[object Object]" or blanks.
	 */
	function sanitizePlayers(incoming = []) {
		const cleaned = (incoming || [])
			.filter(p => p && typeof p.user === 'string' && p.user.trim().length > 0)
			.map(p => ({ ...p, user: p.user.trim() }))

		if (cleaned.length !== (incoming || []).length) {
			console.warn('Dropping invalid player records', { incoming, cleaned })
		}

		return cleaned
	}

</script>

<div id="entirePage">
	<canvas id="confetti"></canvas>
	<div class="container">
		{#if !$showNameSelection }
			<Header/>
			<Players/>
			<GameMessaging />
			<PointOptions />
			<RoundSummary />
		{/if}
	</div>
</div>

<NameSelectionModal />

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

</style>
