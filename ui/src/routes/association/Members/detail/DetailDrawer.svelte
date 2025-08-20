<script>
    import BasicDrawer from 'components/drawer/basic-drawer.svelte';
    import Detail from './Detail.svelte';
    import {createEventDispatcher} from 'svelte';

    const dispatch = createEventDispatcher();

    export let subscriptionId;
    export let title = '';
</script>

<BasicDrawer isOpen={true} {title} on:close={() => dispatch('close')}>
    <svelte:fragment slot="content">
        <Detail {subscriptionId} inDrawer={true} on:close={() => dispatch('close')} />
    </svelte:fragment>
</BasicDrawer>
