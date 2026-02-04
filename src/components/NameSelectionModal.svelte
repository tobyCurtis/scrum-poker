<script>
	import { Button, Modal, Dialog, TextField } from 'attractions';
	import { showNameSelection, placeholderName, name, nameErrors, isSpectator, roomId, players } from '../stores/pokieStore.js'
	import messenger from '../webSocketManager.js'

	function joinTheTable() {
		if(!$name) $name = $placeholderName
		if(!$roomId) $roomId = 'main'
		updateRoomInUrl($roomId)
		messenger.sendMessage({type: 'playerUpdate', user: $name, points: null})
		messenger.sendMessage({type: 'getPlayers'})
		$showNameSelection = false
		players.set([{ user: $name, points: null }])
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

	function handleKey(event) {
		if (!$showNameSelection) return;
		if (event.key === 'Enter') {
			event.preventDefault();
			joinTheTable();
		}
	}
</script>
<svelte:window on:keydown={handleKey} />

{#if $showNameSelection}
	<Modal bind:open={$showNameSelection} noClickaway>
	  <Dialog class="name-modal">
		<form on:submit|preventDefault={joinTheTable} style="margin-bottom: 8px" >
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
			<div class="flex flex-gap">
				<Button type="submit">Let's Pokie</Button>
				<Button type="button" on:click={joinSpectator}>Spectate</Button>
			</div>
		</form>
	  </Dialog>
	</Modal>
{/if}

<style>
	.room-field {
		margin-top: 8px;
		display: block;
	}

	:global(.text-field.outline label) {
		top: 0;
		left: 1.4em;
		transform: translate(-0.25em, -55%);
		background: #fff;
		padding: 0 0.25em;
	}
</style>
