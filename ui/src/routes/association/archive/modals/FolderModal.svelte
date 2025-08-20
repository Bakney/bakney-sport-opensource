<script>
    import BasicModal from 'components/modals/BasicModal.svelte';
    import {TextInput} from 'components/formBuilder/preview-blocks/index.js';
    import {getDataFromForm} from 'utils/Functions.js';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware.js';
    import {toast} from 'svelte-sonner';
    import {createEventDispatcher} from 'svelte';

    const dispatch = createEventDispatcher();

    export let show;
    export let data;
    export let edit = false;
    let loading = false;

    let form;

    async function create(data) {
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Creazione...',
        });

        data.parent = data.parent != '' ? parseInt(data.parent) : null;

        const res = await apiFetch(__bakney.env.API.FOLDERS.ADD, {
            method: 'POST',
            body: JSON.stringify(data),
        });

        KTApp.unblockPage();

        if (res.status == 200 || res.status == 201) {
            toast.success('Creata con successo.');
            dispatch('update');
        } else {
            swal.fire({
                text: 'Scusa, ho individuato degli errori, riprova.',
                icon: 'error',
                buttonsStyling: false,
                confirmButtonText: 'Ok',
                customClass: {
                    confirmButton: 'btn font-weight-bold btn-light-primary',
                },
            });
        }
    }

    async function update(data) {
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Aggiornamento...',
        });

        const url = replaceUID(__bakney.env.API.FOLDERS.UPDATE, data.folder_id);

        const res = await apiFetch(url, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });

        KTApp.unblockPage();

        if (res.status == 200 || res.status == 201) {
            toast.success('Rinominata con successo.');
            dispatch('update');
        } else {
            swal.fire({
                text: 'Scusa, ho individuato degli errori, riprova.',
                icon: 'error',
                buttonsStyling: false,
                confirmButtonText: 'Ok',
                customClass: {
                    confirmButton: 'btn font-weight-bold btn-light-primary',
                },
            });
        }
    }

    function initForm() {
        form?.destroy();
        form = FormValidation.formValidation(document.getElementById('folders_form'), {
            fields: {
                name: {
                    validators: {
                        notEmpty: {
                            message: 'Il nome è obbligatorio.',
                        },
                    },
                },
            },
            plugins: {
                trigger: new FormValidation.plugins.Trigger(),
                bootstrap: new FormValidation.plugins.Bootstrap(),
            },
        });
    }

    function handleValidation(e) {
        if (!form) initForm();
        form?.validate().then(function (status) {
            if (status === 'Valid') {
                if (edit) {
                    update(getDataFromForm(e));
                } else {
                    create(getDataFromForm(e));
                }
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
        id={`folders`}
        bind:show
        title="{edit ? 'Modifica' : 'Crea Nuova'} Cartella"
        showTitle={true}
        showActionButton={true}
        showCancelButton={true}
        showFooter={false}
        modalSize={'md'}
        scrollable={true}
        bodyClass={'py-2 px-0'}
        dataHeight={300}>
        {#if !loading}
            <form id="folders_form" on:submit|preventDefault={handleValidation}>
                <div class="text-left">
                    <input type="hidden" name="parent" value={data?.parent || null} />
                    <TextInput
                        customClasses={'px-4 mx-4 my-4'}
                        editable={false}
                        active={false}
                        props={{
                            id: 'name',
                            name: 'name',
                            label: 'Nome Cartella',
                            placeholder: 'Inserisci il nome della cartella',
                            required: true,
                            value: data?.name,
                        }} />
                </div>
                <div class="modal-footer d-flex justify-content-end mt-2">
                    <button
                        type="button"
                        class="btn btn-light-primary font-weight-bold"
                        on:click={() => (show = false)}>
                        Annulla
                    </button>
                    <button type="submit" class="btn btn-primary font-weight-bold"
                        >{edit == true ? 'Modifica' : 'Crea'}</button>
                </div>
            </form>
        {:else}
            <div class="text-center py-20 d-flex justify-content-center">
                <div class="spinner spinner-primary spinner-lg" />
            </div>
        {/if}
    </BasicModal>
</div>
