<script>
    import BasicModal from 'components/modals/BasicModal.svelte';
    import {Datepicker, Currency, FileInput, TextArea, TextInput} from 'components/formBuilder/preview-blocks/index.js';
    import {getDataFromForm, toBase64Safe} from 'utils/Functions.js';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware.js';
    import {toast} from 'svelte-sonner';
    import {createEventDispatcher, onMount} from 'svelte';
    import {File, TrashSimple} from 'phosphor-svelte';

    const dispatch = createEventDispatcher();

    export let show;
    export let data = {};
    export let edit = false;
    export let target = '#portal-elements-foreground';
    let loading = false;
    let form;

    async function prepareJSONData(formData) {
        formData.price = parseFloat(formData.price.replaceAll(',', '.'));

        if (!Array.isArray(formData.attached_membership_documents)) {
            formData.attached_membership_documents = [formData.attached_membership_documents];
        }

        if (
            formData.attached_membership_documents &&
            String(formData.attached_membership_documents) !== '{}' &&
            Array.isArray(formData.attached_membership_documents) &&
            formData.attached_membership_documents.length > 0
        ) {
            const documentPromises = Array.from(formData.attached_membership_documents).map(async file => {
                const base64 = await toBase64Safe(file);
                return {
                    document: base64,
                    filename: file.name,
                };
            });
            formData.documents_data = await Promise.all(documentPromises);
            // Remove the files where document is "" or undefined or filename is "" or undefined
            formData.documents_data = formData.documents_data.filter(
                file => file.document !== '' && file.filename !== ''
            );
        } else {
            formData.documents_data = [];
        }

        return formData;
    }

    async function create(formData) {
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Creazione...',
        });

        const url = __bakney.env.API.SUBSCRIPTION.MEMBERSHIPS.ADD;

        data = await prepareJSONData(formData);

        const res = await apiFetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
        });

        KTApp.unblockPage();

        if (res.status == 200 || res.status == 201) {
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

    async function update(formData) {
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Aggiornamento...',
        });

        const url = replaceUID(__bakney.env.API.SUBSCRIPTION.MEMBERSHIPS.UPDATE, data.subscription_membership_id);

        data = await prepareJSONData(formData);

        const res = await apiFetch(url, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });

        KTApp.unblockPage();

        if (res.status == 200 || res.status == 201) {
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

    function handleValidation(e) {
        if (edit) {
            update(getDataFromForm(e));
        } else {
            create(getDataFromForm(e));
        }
        show = false;
    }

    onMount(() => {
        if (edit) {
            data.price = String(data.price).replaceAll('.', ',');
        }
    });
</script>

<div>
    <BasicModal
        id={`membership-modal`}
        bind:show
        {target}
        title="{edit ? 'Modifica' : 'Crea Nuovo'} Tesseramento"
        showTitle={true}
        showActionButton={true}
        showCancelButton={true}
        showFooter={false}
        modalSize={'lg'}
        scrollable={true}
        hideOnClickOutside={false}
        bodyClass={'py-2 px-0'}>
        <form id="membership_form" on:submit|preventDefault={handleValidation}>
            <div class="text-left px-5">
                {#if edit}
                    <input type="hidden" name="subscription_membership_id" value={data?.subscription_membership_id} />
                {/if}

                <input type="hidden" name="associate" value={data?.associate_id} />

                <div class="d-flex justify-content-between row mx-0 px-0">
                    <TextInput
                        customClasses={'mx-2 px-0 col-12 col-md-7'}
                        editable={false}
                        active={false}
                        props={{
                            id: 'membership_type',
                            name: 'membership_type',
                            label: 'Tipo Tesseramento',
                            placeholder: 'Inserisci il tipo di tesseramento',
                            required: true,
                            value: data?.membership_type,
                        }} />

                    <TextInput
                        customClasses={'mx-2 px-0 col-12 col-md-4 mr-2'}
                        editable={false}
                        active={false}
                        props={{
                            id: 'membership_number',
                            name: 'membership_number',
                            label: 'Numero Tesseramento',
                            placeholder: 'Inserisci il numero di tesseramento',
                            type: 'number',
                            required: false,
                            value: data?.membership_number,
                        }} />
                </div>

                <div class="d-flex justify-content-between row mx-0 px-0">
                    <Datepicker
                        customClasses={'mx-2 px-0 col-12 col-md-4'}
                        editable={false}
                        active={false}
                        props={{
                            id: 'start_date',
                            name: 'start_date',
                            label: 'Data Inizio',
                            required: true,
                            format: 'DD/MM/YYYY',
                            value: data?.start_date ? moment(data?.start_date).format('DD/MM/YYYY') : null,
                        }} />

                    <Datepicker
                        customClasses={'mx-2 px-0 col-12 col-md-4'}
                        editable={false}
                        active={false}
                        props={{
                            id: 'end_date',
                            name: 'end_date',
                            label: 'Data Fine',
                            required: true,
                            format: 'DD/MM/YYYY',
                            value: data?.end_date ? moment(data?.end_date).format('DD/MM/YYYY') : null,
                        }} />

                    <Currency
                        customClasses={'mx-2 px-0 col-12 col-md-3'}
                        editable={false}
                        active={false}
                        props={{
                            id: 'price',
                            name: 'price',
                            label: 'Prezzo',
                            placeholder: '0,00',
                            required: true,
                            value: data?.price,
                        }} />
                </div>

                <TextArea
                    customClasses={'mx-2 px-0'}
                    editable={false}
                    active={false}
                    props={{
                        id: 'description',
                        name: 'description',
                        label: 'Descrizione',
                        placeholder: 'Inserisci una descrizione',
                        required: false,
                        rows: 4,
                        value: data?.description,
                    }} />

                <FileInput
                    customClasses={'mx-2 px-0'}
                    editable={false}
                    active={false}
                    props={{
                        id: 'attached_membership_documents',
                        name: 'attached_membership_documents',
                        label: 'Documenti allegati',
                        placeholder: 'Inserisci allegati',
                        noPadding: true,
                        required: false,
                        multiple: true,
                    }} />

                {#if edit && data.attached_membership_documents && data.attached_membership_documents.length > 0}
                    <h5 class="font-size-h6 mx-2 text-dark">Documenti</h5>
                    <div class="px-0 mx-2 my-4 border rounded-lg bg-light">
                        {#each data.attached_membership_documents as doc, idx}
                            <div
                                class="d-flex align-items-center justify-content-between m-0 p-0 {idx !==
                                data.attached_membership_documents.length - 1
                                    ? 'border-bottom'
                                    : ''} font-weight-boldest font-size-sm px-3">
                                <div>
                                    <File size={14} weight="bold" class="mr-1 text-primary" />
                                    <a
                                        href="{__bakney.env.API.DOCUMENT.RETRIEVE}/{doc.document_id}?token={doc.token}"
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
                                            data.attached_membership_documents =
                                                data.attached_membership_documents.filter(
                                                    d => d.document_id !== doc.document_id
                                                );
                                            toast.success('Documento eliminato con successo');
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
                <button type="button" class="btn btn-light-primary font-weight-bold" on:click={() => (show = false)}>
                    Annulla
                </button>
                <button type="submit" class="btn btn-primary font-weight-bold">
                    {edit ? 'Modifica' : 'Crea'}
                </button>
            </div>
        </form>
    </BasicModal>
</div>
