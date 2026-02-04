<script>
    import { Headline, Divider, Button } from 'attractions';
    import LinkIcon from './LinkIcon.svelte';
    import CheckIcon from './CheckIcon.svelte';
    import { tippy } from 'svelte-tippy';
    import 'svelte-tippy/dist/svelte-tippy.css';
    import { fade, scale } from 'svelte/transition';

    let copied = false;
    let resetTimer;
    let tooltipEl;

    async function copyPath() {
        try {
            await navigator.clipboard.writeText(window.location.href);
            copied = true;
            tooltipEl?._tippy?.hide(0);
            clearTimeout(resetTimer);
            resetTimer = setTimeout(() => (copied = false), 1500);
        } catch (err) {
            console.error('Failed to copy URL', err);
        }
    }
</script>

<style>
    .header {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        gap: 0.75rem;
        padding-inline: 0.75rem;
    }

    .btn-container {
        justify-self: end;
        width: 48px;
    }

    :global(.icon-btn) {
        margin: 0;
    }

    :global(.tippy-box[data-theme='dark']) {
        background-color: rgba(0, 0, 0, 0.6);
        color: rgba(255, 255, 255, 0.9);
        font-weight: 600;
        font-size: 0.85rem;
        border-radius: 6px;
        padding: 4px 8px;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.22);
        overflow: visible; /* let the arrow show */
    }

</style>

<!-- header -->
<div class="header">
    <div aria-hidden="true"></div>
    <Headline class="title">Scrum Poker</Headline>
    <div
        class="btn-container"
        bind:this={tooltipEl}
        use:tippy={{
            content: 'Copy Invite Link',
            placement: 'bottom',
            theme: 'dark',
            arrow: true,
            delay: 700
        }}
    >
        <Button
            class="icon-btn"
            round
            neutral
            aria-label="Copy invite link"
            on:click={copyPath}
        >
            {#if copied}
                <CheckIcon size={40} />
            {:else}
                <LinkIcon size={40} />
            {/if}
        </Button>
    </div>
</div>
<Divider />
