<script>
    import BasicDrawer from 'components/drawer/basic-drawer.svelte';
    import {createEventDispatcher} from 'svelte';
    import EditData from './EditData.svelte';

    const dispatch = createEventDispatcher();

    export let athlete;
    export let idx;
    export let title = '';
</script>

<BasicDrawer isOpen={true} {title} on:close={() => dispatch('close')}>
    <svelte:fragment slot="content">
        <EditData {idx} {athlete} on:close={() => dispatch('close')} />
    </svelte:fragment>
</BasicDrawer>
