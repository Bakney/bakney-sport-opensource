<script>
    import BasicDrawer from 'components/drawer/basic-drawer.svelte';
    import Detail from './Detail.svelte';
    import {createEventDispatcher} from 'svelte';

    const dispatch = createEventDispatcher();

    export let templateId;
    export let title = '';
    export let width = '85vw';
</script>

<BasicDrawer isOpen={true} {title} on:close={() => dispatch('close')} {width}>
    <svelte:fragment slot="content">
        <Detail {templateId} inDrawer={true} {width} on:close={() => dispatch('close')} />
    </svelte:fragment>
</BasicDrawer>
