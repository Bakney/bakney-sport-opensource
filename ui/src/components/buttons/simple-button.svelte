<script>
    import {createEventDispatcher} from 'svelte';

    const dispatch = createEventDispatcher();

    export let label;
    export let variant = 'primary';
    export let size = 'md';
    export let classList = '';

    let click = () => {
        dispatch('click');
    };
</script>

<button on:click={click} class="{classList} btn btn-{variant} btn-{size} d-flex align-items-center font-weight-boldest">
    <slot>
        {label}
    </slot>
</button>
