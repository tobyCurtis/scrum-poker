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
		playersStillChoosing,
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
		        $players = message.players
		        $playersStillChoosing = getPlayersStillChoosing()
		    } else if (message.type === 'getPlayers') {
		        $players = message.players
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
	
	function getPlayersStillChoosing() {
		let playersStillThinking = $players.filter(player => !player.points).map(player => player.user)

		if(playersStillThinking.length <= 2) {
			return playersStillThinking.join(' and ')
		} else {
			playersStillThinking[playersStillThinking.length - 1] = ` and ${playersStillThinking[playersStillThinking.length - 1]}`
			return playersStillThinking.join(', ')
		}
	}

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