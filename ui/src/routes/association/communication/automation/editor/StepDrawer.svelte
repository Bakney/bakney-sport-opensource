<script>
    import BasicDrawer from 'components/drawer/basic-drawer.svelte';
    import {createEventDispatcher} from 'svelte';

    const dispatch = createEventDispatcher();
    export let isOpen = false;
    export let title = '';
</script>

<BasicDrawer
    bind:isOpen
    {title}
    on:close={() => {
        // hide overflow
        document.body.style.overflow = 'hidden';
        dispatch('close');
    }}
    width="40vw"
    touchOverflow={false}>
    <svelte:fragment slot="content">
        <slot />
    </svelte:fragment>
</BasicDrawer>
