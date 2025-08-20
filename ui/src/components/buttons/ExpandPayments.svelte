<script>
    import {scale} from 'svelte/transition';
    import {ArrowSquareOut} from 'phosphor-svelte';
    import {createEventDispatcher} from 'svelte';
    import * as easing from 'svelte/easing';

    const dispatch = createEventDispatcher();

    export let disabled = false;
    export let hidden = false;
    export let popover_text = 'Modifica';
    export let color = 'dark';
    export let text = 'pagati';

    function open(event) {
        event.preventDefault();
        dispatch('open');
    }
</script>

<button
    {disabled}
    in:scale={{duration: 150, start: 0.9, easing: easing.backOut}}
    class="btn btn-xs btn-clean d-flex align-items-center justify-content-center text-sm font-weight-boldest text-{color} p-0 m-0 {hidden
        ? 'd-none'
        : ''}"
    data-toggle="tooltip"
    data-placement="bottom"
    style="text-decoration: underline;"
    title={popover_text}
    on:touchend={open}
    on:click={open}>
    <ArrowSquareOut size="16" weight="duotone" class="mr-2" />
    {text}
</button>
