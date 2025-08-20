<script>
    import BasicModal from 'components/modals/BasicModal.svelte';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware.js';
    import {createEventDispatcher} from 'svelte';
    import CampsAndRetreatsSubscriptionsForm from './camps-and-retreats-subscriptions-form.svelte';
    import {toast} from 'svelte-sonner';

    const dispatch = createEventDispatcher();

    export let id;
    export let show;
    export let data;
    export let datatable;
    let loading = false;

    async function update(formData) {
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Modifica...',
        });

        formData.periods = JSON.parse(formData?.periods);

        const url = replaceUID(__bakney.env.API.CAMPS_AND_RETREATS.SUBSCRIPTIONS.UPDATE, id);

        const res = await apiFetch(url, {
            method: 'PATCH',
            body: JSON.stringify(formData),
        });
        // spinner stop
        KTApp.unblockPage();

        if (res.status == 200 || res.status == 201) {
            document.getElementById('camps_and_retreats_subscriptions_form')?.reset();
            toast.success('Modificato con successo.');

            // fire event to update the data
            dispatch('update');
            show = false;
        } else {
            swal.fire({
                text: 'Scusa, ho individuato degli errori, riprova.',
                icon: 'error',
                buttonsStyling: false,
                confirmButtonText: 'Ok, capito!',
                customClass: {
                    confirmButton: 'btn font-weight-bold btn-light-primary',
                },
            });
        }
    }
</script>

<div>
    <BasicModal
        id={`camps-and-retreats-add-subscription-modal`}
        bind:show
        title="Aggiungi Iscritto"
        showTitle={true}
        showActionButton={true}
        showCancelButton={true}
        showFooter={false}
        modalSize={'lg'}
        scrollable={true}
        bodyClass={'py-2 px-0'}
        actionButton="Crea"
        dataHeight={300}>
        {#if !loading}
            <CampsAndRetreatsSubscriptionsForm
                bind:show
                isInModal={true}
                {id}
                {data}
                {datatable}
                isEdit={true}
                on:sumbit={e => {
                    if (e.detail.valid) {
                        update(e.detail.data);
                    }
                }} />
        {:else}
            <div class="text-center py-20 d-flex justify-content-center">
                <div class="spinner spinner-primary spinner-lg" />
            </div>
        {/if}
    </BasicModal>
</div>
