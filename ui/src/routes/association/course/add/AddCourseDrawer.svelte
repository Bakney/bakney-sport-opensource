<script>
    import BasicDrawer from 'components/drawer/basic-drawer.svelte';
    import {createEventDispatcher} from 'svelte';
    import AddCourse from './AddCourse.svelte';

    const dispatch = createEventDispatcher();

    export let title = '';
    let isOpen = true;
</script>

{#if isOpen}
    <BasicDrawer bind:isOpen {title} width="50vw" on:close={() => dispatch('close')}>
        <svelte:fragment slot="content">
            <AddCourse
                on:close={() => {
                    isOpen = false;
                    dispatch('close');
                }} />
        </svelte:fragment>
    </BasicDrawer>
{/if}
