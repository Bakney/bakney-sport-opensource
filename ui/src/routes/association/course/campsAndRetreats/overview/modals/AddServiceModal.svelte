<script>
    import BasicModal from 'components/modals/BasicModal.svelte';
    import {apiFetch} from 'utils/ApiMiddleware.js';
    import {createEventDispatcher} from 'svelte';
    import CampsAndRetreatsServicesForm from './camps-and-retreats-services-form.svelte';
    import {toast} from 'svelte-sonner';

    const dispatch = createEventDispatcher();

    export let id;
    export let show;
    export let data;
    let loading = false;

    async function create(formData) {
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Creazione...',
        });

        // convert fee to float
        formData.fee = parseFloat(String(formData.fee).replace(',', '.'));

        const url = __bakney.env.API.CAMPS_AND_RETREATS.PERIODS.SERVICES.ADD;

        const res = await apiFetch(url, {
            method: 'POST',
            body: JSON.stringify(formData),
        });
        // spinner stop
        KTApp.unblockPage();

        if (res.status == 200 || res.status == 201) {
            document.getElementById('camps_and_retreats_services_form')?.reset();
            toast.success('Creato con successo.');

            // fire event to update the data
            dispatch('update');
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
        id={`camps-and-retreats-add-modal`}
        bind:show
        title="Aggiungi Servizio"
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
            <CampsAndRetreatsServicesForm
                bind:show
                isInModal={true}
                {id}
                {data}
                on:sumbit={e => {
                    if (e.detail.valid) {
                        create(e.detail.data);
                        show = false;
                    }
                }} />
        {:else}
            <div class="text-center py-20 d-flex justify-content-center">
                <div class="spinner spinner-primary spinner-lg" />
            </div>
        {/if}
    </BasicModal>
</div>
