<script>
    import {scale} from 'svelte/transition';
    import {Users} from 'phosphor-svelte';
    import {createEventDispatcher} from 'svelte';
    import * as easing from 'svelte/easing';

    const dispatch = createEventDispatcher();

    export let disabled = false;
    export let hidden = false;
    export let popover_text = 'Utenti';
    export let dataToggle = null;
    export let dataTarget = null;

    function open(event) {
        event.preventDefault();
        dispatch('open');
    }
</script>

<span data-toggle={dataToggle} data-target={dataTarget}
    ><button
        {disabled}
        in:scale={{duration: 150, start: 0.9, easing: easing.backOut}}
        class="btn btn-xs btn-clean btn-icon text-primary m-0 mr-2 {hidden ? 'd-none' : ''}"
        data-toggle="tooltip"
        data-placement="bottom"
        title={popover_text}
        on:touchend={open}
        on:click={open}>
        <Users size="24" weight="duotone" />
    </button>
</span>
