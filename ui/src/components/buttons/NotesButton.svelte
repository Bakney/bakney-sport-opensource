<script>
    import {scale} from 'svelte/transition';
    import {Note, NoteBlank} from 'phosphor-svelte';
    import {createEventDispatcher, onDestroy, onMount} from 'svelte';
    import * as easing from 'svelte/easing';

    const dispatch = createEventDispatcher();

    export let hidden = false;
    export let notes = '';
    export let color = 'primary';

    let id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    function open(event) {
        event.preventDefault();
        dispatch('open');
    }

    onMount(() => {
        jQuery(`#${id}`).tooltip({selector: '[data-toggle=tooltip]', trigger: 'hover'});
        jQuery(`#${id}`).popover({selector: '[data-toggle=popover]', trigger: 'hover'});
    });

    onDestroy(() => {
        jQuery(`#${id}`).tooltip('dispose');
        jQuery(`#${id}`).popover('dispose');
    });
</script>

<div class="position-relative d-inline-block" {id}>
    <div
        in:scale={{duration: 150, start: 0.9, easing: easing.backOut}}
        class="btn btn-xs btn-clean btn-icon text-{color} m-0 mr-2 {hidden ? 'd-none' : ''}"
        data-toggle="popover"
        data-trigger="hover"
        data-placement="left"
        data-html="true"
        data-content={notes}>
        <Note size="24" weight="fill" />
    </div>
</div>
