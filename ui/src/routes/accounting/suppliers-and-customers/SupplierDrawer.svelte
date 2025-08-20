<script>
    import BasicDrawer from 'components/drawer/basic-drawer.svelte';
    import Detail from './detail/Detail.svelte';
    import {createEventDispatcher} from 'svelte';

    const dispatch = createEventDispatcher();

    export let supplierId;
    export let title = '';
    export let width = '85vw';
    export let edit = false;

    let isOpen = true;
</script>

<BasicDrawer bind:isOpen {title} on:close={() => dispatch('close')} {width}>
    <svelte:fragment slot="content">
        <Detail
            {supplierId}
            inDrawer={true}
            on:close={() => {
                isOpen = false;
                dispatch('close');
            }}
            {edit} />
    </svelte:fragment>
</BasicDrawer>
