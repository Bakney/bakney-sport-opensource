<script>
    import {scale} from 'svelte/transition';
    import {TrashSimple} from 'phosphor-svelte';
    import {createEventDispatcher} from 'svelte';
    import * as easing from 'svelte/easing';

    const dispatch = createEventDispatcher();

    export let disabled = false;
    export let hidden = false;
    export let popover_text = 'Elimina';
    export let color = 'primary';

    function open(event) {
        event.preventDefault();
        dispatch('open');
    }
</script>

<button
    {disabled}
    in:scale={{duration: 150, start: 0.8, easing: easing.backOut}}
    class="btn btn-xs btn-clean btn-icon text-{color} m-0 mr-2 {hidden ? 'd-none' : ''}"
    data-toggle="tooltip"
    data-placement="bottom"
    title={popover_text}
    on:touchend={open}
    on:click={open}>
    <TrashSimple size="24" weight="duotone" />
</button>
