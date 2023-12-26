<script>
	import { Button, Modal, Dialog, TextField } from 'attractions';
	import { showNameSelection, placeholderName, name, nameErrors, isSpectator } from '../stores/pokieStore.js'
	import messenger from '../webSocketManager.js'

	function joinTheTable() {
		if(!$name) $name = $placeholderName
		$showNameSelection = false
		messenger.sendMessage({type: 'playerUpdate', user: $name, points: null})
	}

	function joinSpectator() {
		$isSpectator = true
		$showNameSelection = false
		messenger.sendMessage({type: 'getPlayers'})
	}
</script>

{#if $showNameSelection}
	<Modal bind:open={$showNameSelection} noClickaway>
	  <Dialog title="What's your name?" class="name-modal">
		<form on:submit={joinTheTable} style="margin-bottom: 8px" >
			<TextField
				placeholder={$placeholderName}
				bind:value={$name}
				tabindex="0"
				error={$nameErrors}
			/>
		</form>
		<div class="flex flex-gap">
			<Button on:click={joinTheTable}>Let's Pokie</Button>
			<Button on:click={joinSpectator}>Spectate</Button>
		</div>
	  </Dialog>
	</Modal>
{/if}