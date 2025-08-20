<script>
    import {createEventDispatcher, onMount} from 'svelte';
    import BasicModal from 'components/modals/BasicModal.svelte';
    import SmoothSignature from 'components/signature/SmoothSignature.svelte';
    import {apiFetch} from 'utils/ApiMiddleware';
    import {toast} from 'svelte-sonner';

    const dispatch = createEventDispatcher();
    export let id;
    export let show;
    export let signature;
    export let confirmAction = async () => {
        let res = await apiFetch(__bakney.env.API.SUBSCRIPTION.SIGN, {
            method: 'POST',
            body: JSON.stringify({
                subscription_id: id,
                signature: signature,
            }),
        });
        if (!res.error) {
            toast.success('Firma aggiunta con successo.');
        } else {
            toast.error('Qualcosa è andato storto.');
        }
    };

    let hideBack = false;
    let ktdatable;

    async function fetchData() {
        ktdatable?.destroy();
    }

    onMount(() => {
        fetchData();
    });
</script>

<div class={hideBack ? 'd-none' : ''}>
    <!-- svelte-ignore missing-declaration -->
    <BasicModal
        id={`signature-modal-${id}`}
        bind:show
        title="Firma modulo"
        actionButton={'Firma'}
        showActionButton={true}
        hideOnClickOutside={false}
        on:confirm={async () => {
            confirmAction();
            dispatch('close');
        }}
        scrollable={false}>
        <h2 class="text-center py-8">Firma il modulo</h2>
        <SmoothSignature
            {signature}
            on:update={e => {
                signature = e.detail;
            }} />
    </BasicModal>
</div>
