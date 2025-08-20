<script>
    import BasicDrawer from 'components/drawer/basic-drawer.svelte';
    import {createEventDispatcher} from 'svelte';
    import AddInfo from './AddInfo.svelte';

    const dispatch = createEventDispatcher();

    export let title = '';
    export let width = '85vw';
</script>

<BasicDrawer isOpen={true} {title} on:close={() => dispatch('close')} {width}>
    <svelte:fragment slot="content">
        <AddInfo inDrawer={true} {width} on:close={() => dispatch('close')} />
    </svelte:fragment>
</BasicDrawer>
