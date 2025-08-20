<script>
    import {createEventDispatcher, onMount} from 'svelte';
    import BasicModal from 'components/modals/BasicModal.svelte';
    import SmoothSignature from 'components/signature/SmoothSignature.svelte';
    import {apiFetch} from 'utils/ApiMiddleware';
    import Portal from 'svelte-portal';
    import {toast} from 'svelte-sonner';

    const dispatch = createEventDispatcher();
    export let id;
    export let show;
    export let signature;
    export let type = 'payment';
    let hideBack = false;

    const typeEndpointMapper = {
        payment: __bakney.env.API.PAYMENT.SIGN,
        subscription: __bakney.env.API.SUBSCRIPTION.SIGN,
    };
</script>

<div class={hideBack ? 'd-none' : ''}>
    <!-- svelte-ignore missing-declaration -->
    <BasicModal
        id={`signature-modal-${id}`}
        bind:show
        title="Firma documento"
        actionButton={'Firma'}
        showActionButton={true}
        on:confirm={async () => {
            show = false;
            KTApp.blockPage({
                overlayColor: '#000000',
                state: 'primary',
                message: 'Firma documento...',
            });
            let res = await apiFetch(typeEndpointMapper[type], {
                method: 'POST',
                body: JSON.stringify({
                    payment_id: id,
                    signature: signature,
                }),
            });
            if (!res.error) {
                toast.success('Firma aggiunta con successo.');
            } else {
                toast.error('Qualcosa è andato storto.');
            }
            KTApp.unblockPage();
            dispatch('close');
        }}
        scrollable={false}>
        <h2 class="text-center py-8">Firma il documento</h2>
        <SmoothSignature
            {signature}
            on:update={e => {
                signature = e.detail;
            }} />
    </BasicModal>
</div>
