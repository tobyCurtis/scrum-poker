<script>
    export let text;
    export let name;
    export let hasSelection;
    export let flipped;
</script>

<div class="user-card-container">
	<div class="card {flipped ? '' : 'cardBack'} {hasSelection && !flipped ? 'selected' : ''}">
        <div>{flipped ? text : ''}</div>
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
        margin-bottom: 10px;
	}

    .card {
		height: 100px;
        width: 100%;
		border-radius: 10%;
        border: 2px solid #3993ff;
        display: flex;
        align-items: center;
        justify-content: center;
        content: '🂠';
        background-color: white;
        color: #3993ff;
        font-size: 30px;
        font-weight: 700;
	}

    .cardBack {
        background-color: #e5e5f7;
        opacity: 0.8;
        background-image:  linear-gradient(30deg, #ffffff 12%, transparent 12.5%, transparent 87%, #ffffff 87.5%, #ffffff), linear-gradient(150deg, #ffffff 12%, transparent 12.5%, transparent 87%, #ffffff 87.5%, #ffffff), linear-gradient(30deg, #ffffff 12%, transparent 12.5%, transparent 87%, #ffffff 87.5%, #ffffff), linear-gradient(150deg, #ffffff 12%, transparent 12.5%, transparent 87%, #ffffff 87.5%, #ffffff), linear-gradient(60deg, #ffffff77 25%, transparent 25.5%, transparent 75%, #ffffff77 75%, #ffffff77), linear-gradient(60deg, #ffffff77 25%, transparent 25.5%, transparent 75%, #ffffff77 75%, #ffffff77);
        background-size: 20px 35px;
        background-position: 0 0, 0 0, 10px 18px, 10px 18px, 0 0, 10px 18px;
    }

    .selected {
        background-color: #e5e5f7;
        opacity: 0.8;
        background-image:  linear-gradient(30deg, #0064fa 12%, transparent 12.5%, transparent 87%, #0064fa 87.5%, #0064fa), linear-gradient(150deg, #0064fa 12%, transparent 12.5%, transparent 87%, #0064fa 87.5%, #0064fa), linear-gradient(30deg, #0064fa 12%, transparent 12.5%, transparent 87%, #0064fa 87.5%, #0064fa), linear-gradient(150deg, #0064fa 12%, transparent 12.5%, transparent 87%, #0064fa 87.5%, #0064fa), linear-gradient(60deg, #0064fa77 25%, transparent 25.5%, transparent 75%, #0064fa77 75%, #0064fa77), linear-gradient(60deg, #0064fa77 25%, transparent 25.5%, transparent 75%, #0064fa77 75%, #0064fa77);
        background-size: 20px 35px;
        background-position: 0 0, 0 0, 10px 18px, 10px 18px, 0 0, 10px 18px;
    }
</style>
