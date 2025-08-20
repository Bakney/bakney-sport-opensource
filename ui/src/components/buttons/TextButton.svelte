<script>
    import {scale} from 'svelte/transition';
    import {createEventDispatcher} from 'svelte';
    import * as easing from 'svelte/easing';
    import {Coins, CoinVertical, HandCoins} from 'phosphor-svelte';

    const dispatch = createEventDispatcher();

    export let disabled = false;
    export let hidden = false;
    export let text = 'Registra';
    export let popover_text = 'Modifica';

    function open(event) {
        event.preventDefault();
        dispatch('open');
    }
</script>

<button
    {disabled}
    in:scale={{duration: 150, start: 0.9, easing: easing.backOut}}
    class="btn btn-xs btn-primary m-0 mr-3 py-1 px-2 font-weight-boldest font-size-sm {hidden ? 'd-none' : ''}"
    style="outline: 1px solid var(--primary) !important;border-top: 1px solid #7a68df"
    data-toggle="tooltip"
    data-placement="bottom"
    title={popover_text}
    on:touchend={open}
    on:click={open}>
    <div class="d-flex align-items-center" style="gap:0.5rem">
        <Coins size={18} weight="fill" />
        <span class="d-none d-md-inline">
            {text.toUpperCase()}
        </span>
    </div>
</button>
