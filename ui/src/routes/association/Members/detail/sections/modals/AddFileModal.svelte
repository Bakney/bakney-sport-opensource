<script>
    import BasicModal from 'components/modals/BasicModal.svelte';
    import {createEventDispatcher} from 'svelte';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware.js';
    import {toast} from 'svelte-sonner';
    import {toBase64Safe} from 'utils/Functions';

    import {FileInput} from 'components/formBuilder/preview-blocks/index.js';

    const dispatch = createEventDispatcher();

    export let show = false;
    export let id;

    async function handleSubmit(e) {
        e.preventDefault();

        const fileInput = document.getElementById('upload-file');
        const file = fileInput.files[0];

        if (!file) {
            toast.error('Seleziona un file da caricare');
            return;
        }

        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Caricamento...',
        });

        const base64 = await toBase64Safe(file);

        const res = await apiFetch(replaceUID(__bakney.env.API.SUBSCRIPTION.UPLOAD_DOCUMENT, id), {
            method: 'POST',
            body: JSON.stringify({
                document: base64,
                filename: file.name,
            }),
        });

        KTApp.unblockPage();

        if (res.status === 200) {
            toast.success('File caricato con successo');
            dispatch('update');
            show = false;
            fileInput.value = '';
        } else {
            toast.error('Errore durante il caricamento del file');
        }
    }
</script>

<BasicModal
    id="add-file-modal"
    bind:show
    title="Carica File"
    showTitle={true}
    showActionButton={true}
    showCancelButton={true}
    showFooter={false}
    modalSize={'md'}
    scrollable={false}
    hideOnClickOutside={false}
    bodyClass={'py-2 px-0'}>
    <form on:submit|preventDefault={handleSubmit}>
        <div class="text-left px-5">
            <FileInput
                customClasses={'mx-2 px-0'}
                editable={false}
                active={false}
                props={{
                    id: 'upload-file',
                    name: 'file',
                    label: 'Seleziona file da caricare',
                    placeholder: 'Inserisci allegato',
                    noPadding: true,
                    required: true,
                    multiple: false,
                }} />
        </div>

        <div class="modal-footer d-flex justify-content-end mt-2">
            <button type="button" class="btn btn-light-primary font-weight-bold" on:click={() => (show = false)}>
                Annulla
            </button>
            <button type="submit" class="btn btn-primary font-weight-bold"> Carica </button>
        </div>
    </form>
</BasicModal>
