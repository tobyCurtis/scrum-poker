<script>
    export let text;
    export let name;
    export let hasSelection;
</script>

<div class="user-card-container">
	<div class="card {hasSelection ? 'selected' : ''}">
        <div>{text}</div>
    </div>
	<div>{name}</div>
</div>

<style>
	.user-card-container {
		text-align: center;
		width: 50px;
        display: flex;
        flex-direction: column;
        align-items: center;
	}

    .card {
		height: 100px;
        width: 100%;
        font-weight: bold;
		border-radius: 10%;
		border: 1px solid black;
		background-color: aliceblue;
        display: flex;
        align-items: center;
        justify-content: center;
	}

    .selected {
        background-color: cornflowerblue;
        color: white
    }
</style>
