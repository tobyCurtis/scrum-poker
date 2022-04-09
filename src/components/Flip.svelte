<script>
    export let flipped;
    let _class = null;
    export { _class as class };
</script>

<div class="flip-card {_class}">
    <div class="flip-card-inner {flipped && 'card-is-flipped'}">
        <div class="flip-card-front">
            <slot name="front"></slot>
        </div>
        <div class="flip-card-back">
            <slot name="back"></slot>
        </div>
    </div>
</div>

<style>
    .flip-card {
        background-color: transparent;
        perspective: 1000px;
    }

    .flip-card-inner {
        position: relative;
        width: 100%;
        height: 100%;
        transition: transform 0.6s;
        transform-style: preserve-3d;
    }

    .card-is-flipped {
        transform: rotateY(180deg);
    }

    .flip-card-front, .flip-card-back {
        position: absolute;
        width: 100%;
        height: 100%;
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
    }

    .flip-card-back {
        transform: rotateY(180deg);
    }
</style>
