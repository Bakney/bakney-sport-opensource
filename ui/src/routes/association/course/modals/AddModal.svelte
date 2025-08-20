<script>
    import BasicModal from 'components/modals/BasicModal.svelte';
    import {FileInput, TextArea, TextInput} from 'components/formBuilder/preview-blocks/index.js';
    import {getDataFromForm} from 'utils/Functions.js';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware.js';
    import {toast} from 'svelte-sonner';
    import {createEventDispatcher} from 'svelte';
    import {File, TrashSimple} from 'phosphor-svelte';

    const dispatch = createEventDispatcher();

    export let show;
    export let data;
    export let ktdatable;
    export let edit = false;
    let loading = false;

    let form;

    async function create(data) {
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Creazione...',
        });

        const url = __bakney.env.API.COURSE.LOCATIONS.ADD;

        // check if document is only one file aka not an array
        if (!Array.isArray(data.documents_data)) {
            data.documents_data = [data.documents_data];
        }

        // create the documents array with the base64 of the files and the filename
        if (
            data.documents_data &&
            String(data.documents_data) !== '{}' &&
            Array.isArray(data.documents_data) &&
            data.documents_data.length > 0
        ) {
            const documentPromises = Array.from(data.documents_data).map(async file => {
                const base64 = await toBase64(file);
                return {
                    document: base64,
                    filename: file.name,
                };
            });
            data.documents_data = await Promise.all(documentPromises);
        } else {
            data.documents_data = [];
        }

        data.documents_data = data.documents_data.filter(x => x.document != '');

        const res = await apiFetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        // spinner stop
        KTApp.unblockPage();

        if (res.status == 200 || res.status == 201) {
            ktdatable?.reload();

            toast.success('Creato con successo.');
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

    function toBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
        });
    }

    async function update(data) {
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Aggiornamento...',
        });

        const url = replaceUID(__bakney.env.API.COURSE.LOCATIONS.UPDATE, data.course_location_id);

        // check if document is only one file aka not an array
        if (!Array.isArray(data.documents_data)) {
            data.documents_data = [data.documents_data];
        }

        // create the documents array with the base64 of the files and the filename
        if (
            data.documents_data &&
            String(data.documents_data) !== '{}' &&
            Array.isArray(data.documents_data) &&
            data.documents_data.length > 0
        ) {
            const documentPromises = Array.from(data.documents_data).map(async file => {
                const base64 = await toBase64(file);
                return {
                    document: base64,
                    filename: file.name,
                };
            });
            data.documents_data = await Promise.all(documentPromises);
        } else {
            data.documents_data = [];
        }

        data.documents_data = data.documents_data.filter(x => x.document != '');

        const res = await apiFetch(url, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });

        KTApp.unblockPage();

        if (res.status == 200 || res.status == 201) {
            ktdatable?.reload();

            toast.success('Aggiornato con successo.');
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
        form = FormValidation.formValidation(document.getElementById('locations_form'), {
            fields: {
                title: {
                    validators: {
                        notEmpty: {
                            message: 'Il nome è obbligatorio.',
                        },
                    },
                },
                address: {
                    validators: {
                        string: {
                            message: "L'indirizzo deve essere un testo.",
                        },
                    },
                },
                description: {
                    validators: {
                        string: {
                            message: 'La descrizione deve essere un testo.',
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
        id={`locations`}
        bind:show
        title="{edit ? 'Modifica' : 'Crea Nuova'} Struttura"
        showTitle={true}
        showActionButton={true}
        showCancelButton={true}
        showFooter={false}
        modalSize={'md'}
        scrollable={true}
        bodyClass={'py-2 px-0'}
        dataHeight={300}>
        {#if !loading}
            <form id="locations_form" on:submit|preventDefault={handleValidation}>
                <div class="text-left">
                    {#if edit}
                        <input type="hidden" name="course_location_id" value={data?.course_location_id} />
                    {/if}
                    <TextInput
                        customClasses={'px-4 mx-4 my-4'}
                        editable={false}
                        active={false}
                        props={{
                            id: 'title',
                            name: 'title',
                            label: 'Nome Struttura',
                            placeholder: 'Inserisci il nome della struttura',
                            required: true,
                            value: data?.title,
                        }} />
                    <TextInput
                        customClasses={'px-4 mx-4 my-4'}
                        editable={false}
                        active={false}
                        props={{
                            id: 'address',
                            name: 'address',
                            label: 'Indirizzo',
                            placeholder: "Inserisci l'indirizzo della struttura",
                            required: false,
                            value: data?.address,
                        }} />
                    <TextArea
                        customClasses={'px-4 mx-4 my-4'}
                        editable={false}
                        active={false}
                        props={{
                            id: 'description',
                            name: 'description',
                            label: 'Descrizione',
                            placeholder: 'Inserisci la descrizione della struttura',
                            required: false,
                            value: data?.description,
                        }} />
                    <FileInput
                        customClasses={'px-4 mx-4 my-4'}
                        editable={false}
                        active={false}
                        props={{
                            id: 'documents_data',
                            name: 'documents_data',
                            label: 'Documenti allegati',
                            placeholder: 'Inserisci allegati',
                            required: false,
                            multiple: true,
                        }} />
                    {#if edit && data.documents && data.documents.length > 0}
                        <h5 class="font-size-h6 mx-8 text-dark">Documenti</h5>
                        <div class="px-0 mx-8 my-4 border rounded-lg bg-light">
                            {#each data.documents as doc, idx}
                                <div
                                    class="d-flex align-items-center justify-content-between m-0 p-0 {idx !==
                                    data.documents.length - 1
                                        ? 'border-bottom'
                                        : ''} font-weight-boldest font-size-sm px-3">
                                    <div>
                                        <File size={14} weight="bold" class="mr-1 text-primary" />
                                        <a
                                            href="{__bakney.env.API.DOCUMENT
                                                .RETRIEVE}/{doc.document_id}?token={doc.token}"
                                            target="_blank">{doc.filename}</a>
                                    </div>
                                    <button
                                        class="btn btn-sm btn-clean btn-icon m-0 p-0"
                                        on:click|preventDefault={async () => {
                                            let res = await apiFetch(
                                                replaceUID(__bakney.env.API.DOCUMENT.DELETE, doc.document_id),
                                                {
                                                    method: 'DELETE',
                                                }
                                            );
                                            if (res.status === 200 || res.status === 204) {
                                                data.documents = data.documents.filter(
                                                    d => d.document_id !== doc.document_id
                                                );
                                                toast.success('Documento eliminato con successo');
                                                ktdatable?.reload();
                                            } else {
                                                toast.error("Errore nell'eliminazione del documento");
                                            }
                                        }}>
                                        <TrashSimple size={18} weight="duotone" class="text-danger" />
                                    </button>
                                </div>
                            {/each}
                        </div>
                    {/if}
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
