<script>
    import {scale} from 'svelte/transition';
    import {FileText, FilePdf} from 'phosphor-svelte';
    import {createEventDispatcher} from 'svelte';
    import * as easing from 'svelte/easing';

    const dispatch = createEventDispatcher();

    export let disabled = false;
    export let hidden = false;
    export let popover_text = 'Documento';
    export let type = 'generic';

    function open(event) {
        event.preventDefault();
        dispatch('open');
    }
</script>

<button
    {disabled}
    in:scale={{duration: 150, start: 0.9, easing: easing.backOut}}
    class="btn btn-xs btn-clean btn-icon text-primary m-0 mr-2 {hidden ? 'd-none' : ''}"
    data-toggle="tooltip"
    data-placement="bottom"
    title={popover_text}
    on:touchend={open}
    on:click={open}>
    {#if type == 'generic'}
        <FileText size="24" weight="duotone" />
    {:else if type == 'pdf'}
        <FilePdf size="24" weight="duotone" />
    {:else}
        Documento
    {/if}
</button>
