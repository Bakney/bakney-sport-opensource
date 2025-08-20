<script>
    import {CheckBoxSelect, TextInput} from 'components/formBuilder/preview-blocks';
    import BottomBarFixedSave from 'components/inputs/BottomBarFixedSave.svelte';
    import TipTapEditor from 'components/inputs/TipTapEditor.svelte';
    import {Warning} from 'phosphor-svelte';
    import {createEventDispatcher} from 'svelte';
    import {toast} from 'svelte-sonner';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';

    const dispatch = createEventDispatcher();

    export let templateId;
    export let width;
    export let edit = false;
    export let data = {
        template: '',
        name: '',
        title: '',
        footer: true,
        header: true,
    };

    async function create() {
        try {
            let res = await apiFetch(__bakney.env.API.TEMPLATES.ADD, {
                method: 'POST',
                body: JSON.stringify({
                    name: data.name,
                    template: data.template,
                    header: data.header,
                    footer: data.footer,
                    custom_header: data.custom_header,
                    custom_footer: data.custom_footer,
                    custom_footer_header: data.custom_footer_header ?? false,
                }),
            });

            if (res.status === 200 || res.status === 201) {
                toast.success('Modello creato con successo');
                dispatch('close');
            } else {
                toast.error('Errore durante la creazione del modello');
            }
        } catch (error) {
            console.error(error);
            toast.error('Errore durante la creazione del modello');
        }
    }

    async function update() {
        try {
            let res = await apiFetch(replaceUID(__bakney.env.API.TEMPLATES.UPDATE, templateId), {
                method: 'PATCH',
                body: JSON.stringify({
                    name: data.name,
                    template: data.template,
                    header: data.header,
                    footer: data.footer,
                    custom_header: data.custom_header,
                    custom_footer: data.custom_footer,
                    custom_footer_header: data.custom_footer_header ?? false,
                }),
            });

            if (res.status === 200) {
                toast.success('Modello aggiornato con successo');
                dispatch('close');
            } else {
                toast.error("Errore durante l'aggiornamento del modello");
            }
        } catch (error) {
            console.error(error);
            toast.error("Errore durante l'aggiornamento del modello");
        }
    }

    function validate() {
        let errors = [];

        if (!data.name || data.name.trim() === '') {
            errors.push('Il nome del modello è obbligatorio');
        }

        if (!data.template || data.template.trim() === '') {
            errors.push('Il contenuto del modello è obbligatorio');
        }

        return errors;
    }

    async function save() {
        const errors = validate();

        if (errors.length > 0) {
            errors.forEach(error => toast.error(error));
            return;
        }

        if (templateId) {
            await update();
        } else {
            await create();
        }
    }
</script>

<div>
    <div class="row d-flex flex-column py-2 border border-light-dark-20 rounded-xl mx-0">
        <div class="row px-4 w-100">
            <div class="col-12 col-md-4">
                <CheckBoxSelect
                    customClasses={'m-0 p-2 p-md-0'}
                    active={false}
                    editable={false}
                    props={{
                        label: 'Intestazione',
                        name: 'header',
                        required: true,
                        options: [
                            {
                                id: 'header',
                                label: 'Includi intestazione nel documento',
                                value: 'true',
                                checked: data.header || false,
                            },
                        ],
                    }}
                    on:change={e => {
                        data.header = e.detail;
                    }} />
            </div>
            <div class="col-12 col-md-4">
                <CheckBoxSelect
                    customClasses={'m-0 p-2 p-md-0'}
                    active={false}
                    editable={false}
                    props={{
                        label: 'Piè di pagina',
                        name: 'footer',
                        required: true,
                        options: [
                            {
                                id: 'footer',
                                label: 'Includi piè di pagina nel documento',
                                value: 'true',
                                checked: data.footer || false,
                            },
                        ],
                    }}
                    on:change={e => {
                        data.footer = e.detail;
                    }} />
            </div>
            <div class="col-12 col-md-4">
                <CheckBoxSelect
                    customClasses={'m-0 p-2 p-md-0'}
                    active={false}
                    editable={false}
                    props={{
                        label: 'Personalizza',
                        name: 'custom_footer_header',
                        required: true,
                        options: [
                            {
                                id: 'custom_footer_header',
                                label: 'Personalizza Intestazione e Piè di Pagina',
                                value: 'true',
                                checked: data.custom_footer_header || false,
                            },
                        ],
                    }}
                    on:change={e => {
                        data.custom_footer_header = e.detail;
                    }} />
            </div>
        </div>
        {#if data.custom_footer_header}
            <hr class="w-100" />
            <div class="row mb-2 w-full px-4">
                <div class="col-lg-12">
                    <h5 class="font-weight-bolder mb-1">Intestazione personalizzata</h5>
                    <p class="font-size-md font-size-sm text-dark-75">
                        Inserisci il contenuto dell'intestazione personalizzata.
                    </p>
                    <TipTapEditor
                        isHeader={true}
                        bind:value={data.custom_header}
                        placeholder="Inserisci il contenuto dell'intestazione..." />
                </div>
            </div>
            <div class="row w-full px-4">
                <div class="col-lg-12">
                    <h5 class="font-weight-bolder mb-1">Piè di pagina personalizzato</h5>
                    <p class="font-size-md font-size-sm text-dark-75">
                        Inserisci il contenuto del piè di pagina personalizzato.
                    </p>
                    <TipTapEditor
                        isFooter={true}
                        bind:value={data.custom_footer}
                        placeholder="Inserisci il contenuto del piè di pagina..." />
                </div>
            </div>
        {/if}
    </div>
    <div class="row mb-0 mt-1 font-size-sm font-weight-bold">
        <div class="col-lg-12">
            <div class="d-flex justify-content-end mb-4">
                Per modificare l'intestazione e il piè di pagina vai su <a
                    class="ml-1 font-weight-boldest"
                    href="/#/profile?page=profile"
                    target="_blank">Impostazioni</a
                >.
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-lg-12">
            <TextInput
                customClasses={'mx-0 px-0 w-100'}
                editable={false}
                active={false}
                on:change={e => {
                    data.name = e.detail;
                }}
                props={{
                    id: 'name',
                    name: 'name',
                    label: 'Nome del modello',
                    placeholder: 'Inserisci il nome del modello...',
                    required: true,
                    value: data?.name,
                }} />
        </div>
    </div>
    <div class="row mb-24">
        <div class="col-lg-12">
            <h5 class="font-weight-bolder mb-1">Contenuto del documento*</h5>
            <p class="font-size-md font-size-sm text-dark-75">
                Inserisci il contenuto del documento, utilizza la <b>@</b> per inserire i dati dinamici al momento della
                generazione della stampa.
            </p>
            <div style="width: 21cm!important;margin: 0 auto;">
                <TipTapEditor bind:value={data.template} placeholder="Inserisci il contenuto del documento..." />
            </div>
        </div>
    </div>

    <BottomBarFixedSave
        target="#portal-save-foreground"
        visible={true}
        customStyle={KTUtil.isMobileDevice() ? '' : `width: ${width};right: 0;left: auto;`}
        on:save={save}>
        <div slot="left" class="d-flex align-items-center">
            <Warning weight={'duotone'} size={18} class="mr-2 text-warning" />
            <p class="font-weight-boldest mb-0 text-warning text-xs">
                Ricordati di salvare per applicare le modifiche.
            </p>
        </div>
    </BottomBarFixedSave>
</div>
