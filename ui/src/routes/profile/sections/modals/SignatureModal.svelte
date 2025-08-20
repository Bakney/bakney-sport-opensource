<script>
    import {createEventDispatcher, onMount} from 'svelte';
    import BasicModal from 'components/modals/BasicModal.svelte';
    import SmoothSignature from 'components/signature/SmoothSignature.svelte';
    import {apiFetch} from 'utils/ApiMiddleware';

    const dispatch = createEventDispatcher();
    export let id;
    export let show;
    export let signature;
    let hideBack = false;
    let ktdatable;
    let tmpSignature;

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
        on:confirm={async () => {
            dispatch('close', tmpSignature);
        }}
        scrollable={false}>
        <h2 class="text-center py-8">Firma del presidente</h2>
        <SmoothSignature
            {signature}
            on:update={e => {
                tmpSignature = e.detail.data;
            }} />
    </BasicModal>
</div>
