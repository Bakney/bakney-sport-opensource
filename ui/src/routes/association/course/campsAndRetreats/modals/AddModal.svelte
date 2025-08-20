<script>
    import BasicModal from 'components/modals/BasicModal.svelte';
    import {TextArea, TextInput} from 'components/formBuilder/preview-blocks/index.js';
    import {getDataFromForm} from 'utils/Functions.js';
    import {apiFetch} from 'utils/ApiMiddleware.js';
    import {push} from 'svelte-spa-router';
    import {toast} from 'svelte-sonner';

    export let id;
    export let show;
    export let data;
    export let elements;
    export let ktdatable;
    let loading = false;

    let campsAndRetreatsForm;

    async function create(data) {
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Creazione...',
        });

        const url = __bakney.env.API.CAMPS_AND_RETREATS.ADD;

        const res = await apiFetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        // spinner stop
        KTApp.unblockPage();

        if (res.status == 200 || res.status == 201) {
            ktdatable.reload();
            document.getElementById('camps_and_retreats_form').reset();

            toast.success('Creato con successo.');

            push(`/course/camps-and-retreats/overview/${res.response.camp_and_retreat.camps_and_retreats_id}`);
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

    function initForm() {
        campsAndRetreatsForm?.destroy();
        campsAndRetreatsForm = FormValidation.formValidation(document.getElementById('camps_and_retreats_form'), {
            fields: {
                title: {
                    validators: {
                        notEmpty: {
                            message: 'Il nome è obbligatorio.',
                        },
                    },
                },
                description: {
                    validators: {
                        notEmpty: {
                            message: 'La descrizione è obbligatoria.',
                        },
                    },
                },
            },
            plugins: {
                trigger: new FormValidation.plugins.Trigger(),
                bootstrap: new FormValidation.plugins.Bootstrap(),
                // submitButton: new FormValidation.plugins.SubmitButton(),
            },
        });
    }

    function handleValidation(e) {
        if (!campsAndRetreatsForm) initForm();
        campsAndRetreatsForm?.validate().then(function (status) {
            if (status === 'Valid') {
                create(getDataFromForm(e));
                show = false;
            } else {
                swal.fire({
                    text: 'Per favore, inserisci tutti i dati e riprova.',
                    icon: 'error',
                    buttonsStyling: false,
                    confirmButtonText: 'Ok, capito!',
                    customClass: {
                        confirmButton: 'btn font-weight-bold btn-light-primary',
                    },
                });
            }
        });
    }
</script>

<div>
    <BasicModal
        id={`camps-and-retreats`}
        bind:show
        title="Crea nuovo Camp o Ritiro"
        showTitle={true}
        showActionButton={true}
        showCancelButton={true}
        showFooter={false}
        modalSize={'md'}
        scrollable={true}
        bodyClass={'py-2 px-0'}
        actionButton="Crea"
        dataHeight={300}>
        {#if !loading}
            <form id="camps_and_retreats_form" on:submit|preventDefault={handleValidation}>
                <div class="text-left">
                    <TextInput
                        customClasses={'px-4 mx-4 my-4'}
                        editable={false}
                        active={false}
                        props={{
                            id: 'title',
                            name: 'title',
                            label: 'Titolo',
                            placeholder: 'Inserisci il nome del Camp o Ritiro',
                            required: true,
                            value: data?.title,
                        }} />
                    <TextArea
                        customClasses={'px-4 mx-4 my-4'}
                        editable={false}
                        active={false}
                        props={{
                            id: 'description',
                            name: 'description',
                            label: 'Descrizione',
                            placeholder: 'Inserisci la descrizione del Camp o Ritiro',
                            required: true,
                            value: data?.title,
                        }} />
                </div>
                <div class="modal-footer d-flex justify-content-end mt-2">
                    <button
                        type="button"
                        class="btn btn-light-primary font-weight-bold"
                        on:click={() => (show = false)}>
                        Annulla
                    </button>
                    <button type="submit" class="btn btn-primary font-weight-bold">Crea</button>
                </div>
            </form>
        {:else}
            <div class="text-center py-20 d-flex justify-content-center">
                <div class="spinner spinner-primary spinner-lg" />
            </div>
        {/if}
    </BasicModal>
</div>
