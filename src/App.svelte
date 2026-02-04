<script>
	import messenger from './webSocketManager.js'
	import confettiGenerator from "confetti-js"

	import Header from './components/Header.svelte'
	import Players from './components/Players.svelte'
	import GameMessaging from './components/GameMessaging.svelte'
	import PointOptions from './components/PointOptions.svelte'
	import RoundSummary from './components/RoundSummary.svelte'
	import NameSelectionModal from './components/NameSelectionModal.svelte'
	import { Button, Modal, Dialog, H1 } from 'attractions'
	import { onMount } from 'svelte'
	import { fly } from 'svelte/transition'
	import { backOut } from 'svelte/easing'

	import {
		players,
		cardsFlipped,
		waitingForMessage,
		lastChosenPoints,
		showNameSelection,
		options,
		mySelection,
		confetti,
		roomId,
	} from './stores/pokieStore.js'

	// Seed room from URL param (?room=xyz) so invite links prefill and join the right room.
	if (typeof window !== 'undefined') {
		const inviteRoom = new URL(window.location.href).searchParams.get('room')
		if (inviteRoom) {
			roomId.set(inviteRoom.trim())
		}
	}

	let adminMode = false;
	let kickDialogOpen = false;
	let kickMessage = '';
	let kickTimer1;
	let kickTimer2;
	
	messenger.initWebSocket()
	.then(() => {
		messenger.ws.addEventListener('message', msg => {
		    $waitingForMessage = false
		    let message = JSON.parse(msg.data)

		    const msgRoom = message.roomId || 'main'

		    if (msgRoom !== $roomId) {
		    	return
		    }

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
		    } else if (message.type === 'kicked') {
				launchKickDialog()
		    } else if (message.type === 'heartbeat') {
				console.log('boop...')
		    }
		})

	})

	function checkForConfetti() {
		const choices = $players.reduce((allPoints, player) => {
			if (player.points != null) {
				allPoints[player.points] = true
			}
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

	function launchKickDialog() {
		kickDialogOpen = true
		kickMessage = "What's the shape of Italy?"
		clearTimeout(kickTimer1)
		clearTimeout(kickTimer2)
		kickTimer1 = setTimeout(() => {
			kickMessage = 'A BOOT!'
		}, 2000)
		kickTimer2 = setTimeout(() => {
			if (typeof window !== 'undefined') {
				window.location.reload()
			}
		}, 3000)
	}

	onMount(() => {
		const toggleControls = (event) => {
			const key = (event.key || '').toLowerCase();
			if ((event.metaKey || event.ctrlKey) && event.shiftKey && key === 'g') {
				event.preventDefault();
				adminMode = !adminMode;
			}
		}

		window.addEventListener('keydown', toggleControls);
		return () => window.removeEventListener('keydown', toggleControls);
	});

	function resetAll() {
		messenger.sendMessage({ type: 'nextIssue' })
	}

	function flipCards() {
		messenger.sendMessage({ type: 'cardFlip' })
	}

	function toggleConfetti() {
		if ($confetti && $confetti.clear) {
			stopConfetti()
			$confetti = {}
		} else {
			doConfetti()
		}
	}

	/**
	 * Drop malformed players to avoid rendering "[object Object]" or blanks.
	 */
	function sanitizePlayers(incoming = []) {
		const cleaned = (incoming || [])
			.filter(p => p && typeof p.user === 'string' && p.user.trim().length > 0)
			.map(p => ({ ...p, user: p.user.trim() }))

		if (cleaned.length !== (incoming || []).length) {
		}

		return cleaned
	}

</script>

<div id="entirePage">
	<canvas id="confetti"></canvas>
	<div class="container">
		{#if !$showNameSelection }
			<Header/>
			<Players {adminMode}/>
			<GameMessaging />
			<PointOptions />
			<RoundSummary />
		{/if}
	</div>
	{#if adminMode}
		<div class="reset-wrapper" transition:fly={{ x: 200, duration: 220, easing: backOut }}>
			<Button class="side-button" type="button" outlined on:click={resetAll}>Reset</Button>
			<Button class="side-button" type="button" on:click={flipCards}>Flip Cards</Button>
			<Button class="side-button" type="button" on:click={toggleConfetti}>Toggle Confetti</Button>
		</div>
	{/if}
</div>

{#if kickDialogOpen}
	<Modal bind:open={kickDialogOpen} noClickaway>
		<Dialog>
			<H1 style="margin: 1.5rem 0; text-align: center;">{kickMessage}</H1>
		</Dialog>
	</Modal>
{/if}

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

	.reset-wrapper {
		position: fixed;
		right: 2rem;
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		align-items: flex-end;
	}

	:global(.side-button) {
		padding: 0.6rem 1rem;
		border: none;
		border-radius: 6px;
		background: #4300b0;
		color: white;
		font-weight: 600;
		cursor: pointer;
		box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
	}

	:global(.side-button:hover) {
		background: #5a20c9;
	}

	@media only screen and (max-width: 700px) {
		.container {
			max-width: 90%;
			margin: 0 auto;
		}
	}

</style>
