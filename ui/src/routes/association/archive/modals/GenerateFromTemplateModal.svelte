<script>
    import BasicModal from 'components/modals/BasicModal.svelte';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware.js';
    import {toast} from 'svelte-sonner';
    import {createEventDispatcher, onMount} from 'svelte';
    import {SmartSelect} from 'components/formBuilder/preview-blocks';

    const dispatch = createEventDispatcher();

    export let show;
    export let additionalData;

    let loading = false;
    let templates = [];
    let selectedTemplate = null;

    async function create() {
        if (!selectedTemplate) {
            toast.error('Per favore, seleziona un modello.');
            return;
        }

        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Creazione...',
        });

        const res = await apiFetch(replaceUID(__bakney.env.API.DOCUMENT.TEMPLATE, selectedTemplate), {
            method: 'POST',
            body: JSON.stringify({
                template: selectedTemplate,
                additionalData: additionalData,
            }),
        });

        KTApp.unblockPage();

        if (res.status == 200 || res.status == 201) {
            toast.success('Documento generato con successo.');
            dispatch('update');
        } else {
            toast.error('Errore nella creazione del documento.');
        }
    }

    function handleValidation(e) {
        create();
    }

    async function fetchTemplate() {
        const res = await apiFetch(__bakney.env.API.TEMPLATES.LIST, {
            method: 'GET',
        });

        if (res.status == 200) {
            templates = res.response;
        } else {
            toast.error('Errore nel recupero dei modelli.');
        }
    }

    onMount(async () => {
        await fetchTemplate();
    });
</script>

<div>
    <BasicModal
        id={`generate-from-template`}
        bind:show
        title="Genera Documento"
        showTitle={true}
        showActionButton={true}
        showCancelButton={true}
        showFooter={false}
        modalSize={'md'}
        scrollable={false}
        bodyClass={'py-2 px-0'}
        dataHeight={300}>
        {#if !loading}
            <form id="generate-from-template-form" on:submit|preventDefault={handleValidation}>
                <div class="text-left px-7 mb-7">
                    <p class="text-dark-75 font-size-sm">
                        Seleziona le informazioni necessarie per generare il documento che desideri.
                    </p>
                </div>
                <div class="text-left">
                    <SmartSelect
                        customClasses={'mx-7'}
                        editable={false}
                        active={false}
                        bind:value={selectedTemplate}
                        props={{
                            placeholder: 'Seleziona il modello',
                            required: true,
                            id: 'selectedTemplate',
                            name: 'selectedTemplate',
                            clearable: false,
                            label: 'Seleziona il modello',
                            required: true,
                            showChevron: true,
                            options: templates.map(template => ({
                                label: template.name,
                                value: template.sport_association_module_templates_id,
                            })),
                            value: selectedTemplate,
                        }} />
                </div>
                {#if additionalData.parent}
                    <div class="text-left px-7 mb-7">Il documento verrà aggiunto nella cartella corrente.</div>
                {/if}
                <div class="modal-footer d-flex justify-content-end mt-2">
                    <button
                        type="button"
                        class="btn btn-light-primary font-weight-bold"
                        on:click={() => (show = false)}>
                        Annulla
                    </button>
                    <button type="submit" class="btn btn-primary font-weight-bold">Genera Documento</button>
                </div>
            </form>
        {:else}
            <div class="text-center py-20 d-flex justify-content-center">
                <div class="spinner spinner-primary spinner-lg" />
            </div>
        {/if}
    </BasicModal>
</div>
