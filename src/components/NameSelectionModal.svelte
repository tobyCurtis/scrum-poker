<script>
	import { Button, Modal, Dialog, TextField } from 'attractions';
	import { showNameSelection, placeholderName, name, nameErrors, isSpectator, roomId } from '../stores/pokieStore.js'
	import messenger from '../webSocketManager.js'

	function joinTheTable() {
		if(!$name) $name = $placeholderName
		if(!$roomId) $roomId = 'main'
		updateRoomInUrl($roomId)
		$showNameSelection = false
		console.log('joining room', $roomId, 'as', $name)
		messenger.sendMessage({type: 'playerUpdate', user: $name, points: null})
		messenger.sendMessage({type: 'getPlayers'})
	}

	function joinSpectator() {
		$isSpectator = true
		if(!$roomId) $roomId = 'main'
		updateRoomInUrl($roomId)
		$showNameSelection = false
		messenger.sendMessage({type: 'getPlayers'})
	}

	function updateRoomInUrl(room) {
		if (typeof window === 'undefined') return;
		const url = new URL(window.location.href);
		url.searchParams.set('room', room);
		window.history.replaceState({}, '', url);
	}
</script>

{#if $showNameSelection}
	<Modal bind:open={$showNameSelection} noClickaway>
	  <Dialog class="name-modal">
		<form on:submit={joinTheTable} style="margin-bottom: 8px" >
			<TextField
				placeholder={$placeholderName}
				label="Name"
				bind:value={$name}
				tabindex="0"
				outline
				error={$nameErrors}
			/>
			<TextField
				label="Room"
				placeholder="main"
				bind:value={$roomId}
				outline
				class="room-field"
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
	.room-field {
		margin-top: 8px;
		display: block;
	}
</style>
