<script>
    import {createEventDispatcher, onDestroy, onMount} from 'svelte';
    import Payments from './../detail/sections/Payments.svelte';
    import BasicModal from 'components/modals/BasicModal.svelte';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import {toast} from 'svelte-sonner';

    const dispatch = createEventDispatcher();

    export let id;
    export let show;
    export let generalSearch = null;
    export let associate_id;
    export let subscription_id;
    let hideBack = false;
    let ktdatable;
    let payments = [];
    let loading = true;
    let uuid;
    let info;

    async function fetchData(generalSearch = null) {
        ktdatable?.destroy();
        setTimeout(async () => {
            loading = true;
            const res = await apiFetch(
                `${replaceUID(__bakney.env.API.SUBSCRIPTION.PAYMENTS, id)}${
                    generalSearch ? `?query[generalSearch]=${generalSearch}` : ''
                }`,
                {
                    method: 'GET',
                }
            );

            if (!res.error) {
                payments = [...res.response.data.payments];
            } else {
                toast.error('Qualcosa è andato storto.');
            }
            loading = false;
        }, 200);
    }

    onMount(() => {
        info = {
            associate: {
                associate_id: associate_id,
            },
            subscription_id: subscription_id,
        };
        // fetchData(generalSearch);
        // disable scroll on body
        document.body.style.overflow = 'hidden';
        loading = false;
    });

    onDestroy(() => {
        // enable scroll on body
        document.body.style.overflow = 'auto';
    });
</script>

<div class={hideBack ? 'd-none' : ''}>
    <BasicModal
        id={`payments-modal-${id}`}
        bind:show
        title="Pagamenti associato"
        showActionButton={false}
        modalSize={'xl'}
        scrollable={true}
        hideOnClickOutside={false}
        on:cancel={() => {
            dispatch('close');
            document.body.style.overflow = 'auto';
        }}
        on:close={() => {
            document.body.style.overflow = 'auto';
            dispatch('close');
        }}>
        {#if !loading}
            <div class="py-3">
                <Payments
                    layoutOptions={{
                        scroll: true,
                        footer: false,
                    }}
                    bind:info
                    bind:uuid={id}
                    bind:hideBack
                    bind:ktdatable
                    bind:payments
                    bind:searchKey={generalSearch}
                    on:reset={e => {
                        // fetchData(generalSearch);
                    }} />
            </div>
        {:else}
            <div class="text-center py-20 d-flex justify-content-center">
                <div class="spinner spinner-primary spinner-lg" />
            </div>
        {/if}
    </BasicModal>
</div>
