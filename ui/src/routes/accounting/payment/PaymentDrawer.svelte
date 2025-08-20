<script>
    import BasicDrawer from 'components/drawer/basic-drawer.svelte';
    import {createEventDispatcher} from 'svelte';
    import PaymentOverview from './partials/payment-overview.svelte';

    const dispatch = createEventDispatcher();

    export let data;
    export let title = '';
    export let isOpen = true;
</script>

<BasicDrawer {isOpen} {title} on:close={() => dispatch('close')} width="40vw">
    <svelte:fragment slot="content">
        <PaymentOverview
            {data}
            on:close={() => {
                isOpen = false;
                dispatch('close');
            }} />
    </svelte:fragment>
</BasicDrawer>
