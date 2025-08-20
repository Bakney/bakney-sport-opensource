<script>
    import {
        ArrowLeft,
        ArrowRight,
        Browsers,
        Copy,
        Gear,
        PaperPlaneRight,
        Printer,
        QrCode as QrCodeIcon,
        WhatsappLogo,
    } from 'phosphor-svelte';
    import ComposerPreview from './composer-preview.svelte';
    import ComposerSidebar from './composer-sidebar.svelte';
    import Switch from 'components/inputs/Switch.svelte';
    import {Datepicker, SmartSelect, Select} from 'components/formBuilder/preview-blocks/index.js';
    import Clipboard from 'svelte-clipboard';
    import QrCode from 'svelte-qrcode';
    import {sessionToken, userData} from 'store/stores';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import {onMount} from 'svelte';
    import {toast} from 'svelte-sonner';
    export let elements = [];
    export let title = 'Nuovo Modulo';

    export let custom_link = Math.random().toString(36).substring(2);
    export let require_approval = false;
    export let start_date = moment().format('DD/MM/YYYY');
    export let end_date = moment().add(30, 'days').format('DD/MM/YYYY');
    export let always_active = true;
    export let max_responses;
    export let queue_mode;
    export let only_users;
    export let payment_required;
    export let payment_data = {
        amount: 0.0,
        description: 'pagamento modulo',
        category: '',
    };
    export let response_message = 'Grazie per aver compilato il modulo.';
    export let allow_attachments;
    export let is_edit = false;
    export let module_id;
    let copied = false;

    userData.useLocalStorage();
    sessionToken.useLocalStorage();
    let tabbedWizard = {
        current: 0,
        currentValid: false,
        tabs: [
            {
                step: 0,
                label: 'Modulo',
                icon: Browsers,
            },
            {
                step: 1,
                label: 'Configurazione',
                icon: Gear,
            },
            {
                step: 2,
                label: 'Condividi',
                icon: QrCodeIcon,
            },
        ],
    };

    let configurationFormValidator = {
        element: '#configuration-form',
        form: null,
        fields: {
            title: {
                validators: {
                    notEmpty: {
                        message: 'Inserisci il titolo',
                    },
                },
            },
            custom_link: {
                validators: {
                    notEmpty: {
                        message: 'Inserisci un link valido',
                    },
                    remote: {
                        message: 'Link già utilizzato, cambialo',
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${$sessionToken}`,
                            Module: module_id,
                        },
                        url: __bakney.env.API.MODULES.CHECK_LINK,
                    },
                },
            },
            start_date: {
                enabled: !always_active,
                validators: {
                    notEmpty: {
                        message: 'Seleziona una data',
                    },
                    date: {
                        format: 'DD/MM/YYYY',
                        message: 'La data non è in un formato valido',
                    },
                },
            },
            end_date: {
                enabled: !always_active,
                validators: {
                    notEmpty: {
                        message: 'Seleziona una data',
                    },
                    date: {
                        format: 'DD/MM/YYYY',
                        message: 'La data non è in un formato valido',
                    },
                },
            },
            max_responses: {
                enabled: max_responses != null && max_responses != undefined,
                validators: {
                    integer: {
                        thousandsSeparator: '',
                        decimalSeparator: ',',
                        message: 'Inserisci un numero valido',
                    },
                },
            },
            'payment_data.amount': {
                enabled: payment_required,
                validators: {
                    integer: {
                        thousandsSeparator: '',
                        decimalSeparator: ',',
                        message: 'Inserisci un numero valido',
                    },
                },
            },
            'payment_data.description': {
                enabled: payment_required,
                validators: {
                    notEmpty: {
                        message: 'Inserisci una descrizione',
                    },
                },
            },
        },
        init: function () {
            configurationFormValidator.form?.destroy();
            configurationFormValidator.form = FormValidation.formValidation(
                document.querySelector(configurationFormValidator.element),
                {
                    fields: configurationFormValidator.fields,
                    plugins: {
                        trigger: new FormValidation.plugins.Trigger(),
                        bootstrap: new FormValidation.plugins.Bootstrap(),
                        excluded: new FormValidation.plugins.Excluded(),
                    },
                }
            );
        },
    };

    $: {
        if (elements.length > 0 && tabbedWizard.current == 0) {
            tabbedWizard.currentValid = true;
        } else if (tabbedWizard.current == 1) {
            tabbedWizard.currentValid = true;
            // configurationFormValidator.init();
            // setTimeout(async () => {
            //     // console.error(configurationForm?.validate());
            //     let status = await configurationFormValidator.form?.validate();
            //     if (status === 'Valid') {
            //         // tabbedWizard.current += 1;
            //         tabbedWizard.currentValid = true;
            //     } else {
            //         swal.fire({
            //             text: 'Per favore, inserisci tutti i dati e riprova.',
            //             icon: 'error',
            //             buttonsStyling: false,
            //             confirmButtonText: 'Ok, capito!',
            //             customClass: {
            //                 confirmButton: 'btn font-weight-bold btn-light-primary',
            //             },
            //         });
            //     }
            // }, 200);
        } else if (tabbedWizard.current == 2) {
            tabbedWizard.currentValid = false;
        } else {
            tabbedWizard.currentValid = false;
        }
    }
    let categories = [];

    async function fetchCategories() {
        let res = await apiFetch(__bakney.env.API.PAYMENT.CATEGORY.LIST);

        if (!res.error)
            categories =
                res.response.data
                    ?.filter(x => !x.expense)
                    .map(x => {
                        return {
                            value: x.payment_category_id,
                            label: x.name,
                        };
                    }) || [];
        else if (res.status != 403 && res.status != 401) toast.error('Qualcosa è andato storto.');
    }

    onMount(async () => {
        await fetchCategories();
    });
</script>

<div class="d-flex justify-content-between px-8 mt-8">
    <div>
        <button
            class="btn btn-sm btn-light-primary font-weight-bolder mr-2"
            type="button"
            on:click={() => {
                window.history.back();
            }}>
            Esci
        </button>
    </div>
    <div>
        <h3 class="font-weight-bolder">{title}</h3>
    </div>
</div>
<div class="d-flex justify-content-center px-8 mb-8 mt-4">
    {#each tabbedWizard.tabs as tab}
        <div
            class:bg-light-primary={tab.step <= tabbedWizard.current}
            class:text-primary={tab.step <= tabbedWizard.current}
            class:border-light-primary={tab.step <= tabbedWizard.current}
            class="border py-2 px-3 mx-2 rounded-lg font-weight-bolder d-flex align-items-center">
            <svelte:component this={tab.icon} size={20} weight="bold" class="mr-2" />
            {tab.label}
        </div>
    {/each}
</div>
<div class="w-full d-flex px-8 mt-10 flex-column flex-md-row">
    {#if tabbedWizard.current == 0}
        <ComposerSidebar bind:elements />
        <ComposerPreview bind:elements />
    {:else if tabbedWizard.current == 1}
        <form id="configuration-form" class="w-100">
            <div class="d-flex flex-column w-100">
                <h1 class="mb-8">Configurazione del modulo</h1>
                <div class="row">
                    <div class="form-group col-12 col-md-4">
                        <label for class="font-weight-bolder">Titolo del modulo</label>
                        <input
                            type="text"
                            name="title"
                            class="form-control form-control-solid form-control-sm"
                            bind:value={title}
                            placeholder="Inserisci titolo form"
                            required />
                    </div>
                    <div class="form-group col-12 col-md-5">
                        <label for class="font-weight-bolder">Link personalizzato</label>
                        <div class="d-flex align-items-center">
                            <span class="mr-1 font-weight-bolder text-primary font-size-lg"
                                >{__bakney.env.DOMAIN}/#/forms/</span>
                            <input
                                type="text"
                                class="form-control form-control-solid form-control-sm"
                                bind:value={custom_link}
                                name="custom_link"
                                placeholder="Inserisci link presonalizzato"
                                required />
                        </div>
                    </div>
                    <!-- allow attachments -->
                </div>
                <hr class="w-100" />
                <h3 class="font-weight-bolder mt-4 mb-8">Gestione risposte</h3>
                <div class="row">
                    <div class="col-12 col-md-3">
                        <Switch
                            label="Approvazione risposte"
                            bind:checked={require_approval}
                            name={'require_approval'}
                            helpText="Le risposte inviate devono essere approvare." />
                    </div>
                    <div class="col-12 col-md-3">
                        <Switch
                            label="Coda d'attesa"
                            bind:checked={queue_mode}
                            name={'queue_mode'}
                            helpText="Esaurito il numero massimo di risposte gli utenti saranno messi in una coda d'attesa." />
                    </div>
                    <div class="col-12 col-md-3">
                        <Switch
                            label="Solo utenti registrati"
                            bind:checked={only_users}
                            name={'only_users'}
                            helpText="Accetta risposte solo da utenti registrati." />
                    </div>
                    <div class="form-group col-12 col-md-3">
                        <label for class="font-weight-bolder">Numero massimo risposte</label>
                        <input
                            type="number"
                            step="10"
                            class="form-control form-control-solid form-control-sm"
                            bind:value={max_responses}
                            name="max_responses" />
                        <div class="text-muted font-size-sm mt-1">
                            Numero massimo di risposte. Lascialo vuoto per accettare un numero illimitato di risposte.
                        </div>
                    </div>
                </div>
                <hr class="w-100" />
                <h3 class="font-weight-bolder mt-4 mb-8">Visibilità del modulo</h3>
                <div class="row">
                    <div class="col-12 col-md-4">
                        <Switch
                            label="Rendi sempre visibile"
                            bind:checked={always_active}
                            name={'always_active'}
                            helpText="Il modulo è sempre visibile al link." />
                    </div>
                    {#if !always_active}
                        <div class="col-12 col-md-4">
                            <Datepicker
                                customClasses={''}
                                editable={false}
                                active={false}
                                bind:value={start_date}
                                props={{
                                    id: 'start_date',
                                    name: 'start_date',
                                    label: 'Dal al',
                                    format: 'DD/MM/YYYY',
                                    placeholder: 'Seleziona data',
                                    required: true,
                                    value: start_date,
                                }} />
                            <!-- <div class="form-group">
                                <label for class="font-weight-bolder mb-1">Accetta risposte dal</label>
                                <Datepicker
                                    id="start_date"
                                    required={true}
                                    name={'start_date'}
                                    bind:value={start_date}
                                    format={'DD/MM/YYYY'} />
                            </div> -->
                        </div>
                        <div class="col-12 col-md-4">
                            <Datepicker
                                customClasses={''}
                                editable={false}
                                active={false}
                                bind:value={end_date}
                                props={{
                                    id: 'end_date',
                                    name: 'end_date',
                                    label: 'Fino al',
                                    format: 'DD/MM/YYYY',
                                    placeholder: 'Seleziona data',
                                    required: true,
                                    value: end_date,
                                }} />
                            <!--  <div class="form-group">
                                <label for class="font-weight-bolder mb-1">Fino al</label>
                                <Datepicker
                                    id="end_date"
                                    required={true}
                                    name={'end_date'}
                                    bind:value={end_date}
                                    format={'DD/MM/YYYY'} />
                            </div> -->
                        </div>
                    {/if}
                </div>
                <hr class="w-100" />

                <h3 class="font-weight-bolder mt-4 mb-8">Dopo la risposta</h3>
                <div class="row">
                    <div class="col-12 col-md-8">
                        <div class="form-group">
                            <label for class="font-weight-bolder mb-1">Messaggio personalizzato</label>
                            <textarea
                                type="text"
                                class="form-control form-control-solid form-control-sm"
                                bind:value={response_message}
                                name="response_message"
                                placeholder="Inserisci un messaggio personalizzato."
                                required />
                            <div class="text-muted font-size-sm mt-1">
                                Sarà visualizzato dopo aver inviato la risposta.
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-4">
                        <Switch
                            label="Permetti di aggiungere allegati"
                            bind:checked={allow_attachments}
                            name={'allow_attachments'}
                            helpText="Una volta compilato il modulo possono essere aggiunti degli allegati." />
                    </div>
                </div>

                <div class="d-none">
                    <hr class="w-100" />
                    <h3 class="font-weight-bolder mt-4 mb-8">Pagamento</h3>
                    <div class="row">
                        <div class="col-12 col-md-4">
                            <Switch
                                label="Richiedi pagamento"
                                bind:checked={payment_required}
                                name={'payment_required'}
                                helpText="Al termine dell'invio della risposta è richiesto un pagamento." />
                        </div>
                        {#if payment_required}
                            <div class="col-12 col-md-2">
                                <div class="form-group">
                                    <label for class="mb-1">Importo*</label>
                                    <input
                                        type="number"
                                        class="form-control form-control-solid form-control-sm"
                                        bind:value={payment_data.amount}
                                        name="payment_data.amount"
                                        required />
                                    <div class="text-muted font-size-sm mt-1">Inserisci l'importo del pagamento</div>
                                </div>
                            </div>
                            <div class="col-12 col-md-6">
                                <div class="form-group">
                                    <label for class="mb-1">Descrizione*</label>
                                    <input
                                        type="text"
                                        class="form-control form-control-solid form-control-sm"
                                        bind:value={payment_data.description}
                                        name="payment_data.description"
                                        placeholder="Inserisci una descrizione del pagamento"
                                        required />
                                </div>
                            </div>
                        {/if}
                    </div>
                    <div class="row">
                        {#if categories && categories.length > 0}
                            <SmartSelect
                                hideEmptyState={true}
                                customClasses={'mx-4'}
                                editable={false}
                                active={false}
                                props={{
                                    id: 'payment_data.category',
                                    name: 'payment_data.category',
                                    label: 'Causale',
                                    placeholder: 'Seleziona la causale',
                                    helperLabel:
                                        "Genera una nuova causale da <a class='ml-1' href='/#/payment/category/list' target='_blank'><u>qui</u></a>.",
                                    required: true,
                                    options: categories,
                                    clearable: false,
                                    searchable: true,
                                    showChevron: true,
                                    value: payment_data.category || categories[0]?.value || '',
                                }} />
                        {/if}
                    </div>
                </div>
            </div>
        </form>
    {:else if tabbedWizard.current == 2}
        <div class="flex-column d-flex mx-auto">
            <div class="d-flex justify-content-center flex-column mx-auto">
                <div style="text-align: center" id="qr-code-subscriptions">
                    <QrCode value="{__bakney.env.DOMAIN}/#/forms/{String(custom_link).toLowerCase()}" />
                </div>
                <h3 class="p-4 text-center font-weight-boldest">
                    Scarica e stampa il QR code per far compilare il modulo.
                </h3>
            </div>
            <div class="input-group">
                <!-- svelte-ignore missing-declaration -->
                <Clipboard
                    text="{__bakney.env.DOMAIN}/#/forms/{String(custom_link).toLowerCase()}"
                    let:copy
                    on:copy={() => {
                        copied = true;
                        setTimeout(() => {
                            copied = false;
                        }, 2000);
                        toast.success('Link copiato negli appunti');
                    }}>
                    <input
                        type="text"
                        class="form-control {copied ? 'bg-light-success' : ''}"
                        style="pointer-events: none;"
                        value="{__bakney.env.DOMAIN}/#/forms/{String(custom_link).toLowerCase()}" />
                    <div class="input-group-append">
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-missing-attribute -->
                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                        <a
                            on:click={copy}
                            class="btn btn-primary"
                            style="border-radius: 0 .55rem .55rem 0;"
                            data-clipboard="true"
                            data-clipboard-target="#kt_clipboard_1">
                            <Copy size={16} weight="duotone" />
                        </a>
                    </div>
                </Clipboard>

                <div class="d-flex mt-4 mx-auto m-md-auto">
                    <button
                        type="button"
                        style="background-color: #22ceba; border-color: #22ceba;"
                        class="btn btn-sm btn-primary font-weight-boldest d-flex align-items-center mb-0 ml-2"
                        on:click={() => {
                            window.open(
                                `https://api.whatsapp.com/send/?text=` +
                                    encodeURIComponent(
                                        `Ciao 👋\nQuesto è il link per compilare il modulo:\n\n
                                        ${__bakney.env.DOMAIN}/#/forms/${String(custom_link).toLowerCase()}\n\n
                                        Cordiali saluti,\n${$userData.sport_association.denomination}`
                                    )
                            );
                        }}><WhatsappLogo size="20" weight="duotone" class="mr-2" />Whatsapp</button>
                    <button
                        type="button"
                        class="btn btn-sm btn-primary font-weight-boldest d-flex align-items-center ml-2 mb-0"
                        on:click={() => {
                            window.open(
                                "mailto:user@example.com?subject=Compila il modulo d'iscrizione&body=" +
                                    encodeURIComponent(
                                        `Ciao,\nQuesto è il link per compilare il modulo:\n\n${
                                            __bakney.env.DOMAIN
                                        }/#/forms/${String(custom_link).toLowerCase()}\n\n
                                        Cordiali saluti,\n${$userData.sport_association.denomination}`
                                    )
                            );
                        }}><PaperPlaneRight size="20" weight="fill" class="mr-2" />Invia Email</button>

                    <button
                        type="button"
                        class="btn btn-sm btn-primary font-weight-boldest d-flex align-items-center ml-2 mb-0"
                        on:click={() => {
                            let printDiv = document.getElementById('qr-code-subscriptions');
                            let printContents = printDiv.innerHTML;

                            // set print window
                            let printWindow = window.open(
                                '',
                                '',
                                'height=400,width=800,left=0,top=0,toolbar=0,scrollbars=0,status=0'
                            );
                            // set print content
                            printWindow.document.write(`
                            <html>
                                <head>
                                    <title>QR code</title>
                                    <style>
                                        @media print {
                                            .no-print {
                                                display: none;
                                            }
                                        }
                                        #content img {
                                            width: 100%;
                                        }
                                    </style>
                                </head>
                                <body>
                                    <div class="no-print">
                                        <button type="button" class="btn btn-primary font-weight-bold d-flex align-items-center" onclick="window.print();"><Printer size="20" weight="fill" class="mr-2" />Stampa</button>
                                    </div>
                                    <div id="content">
                                        ${printContents}
                                        <div class="text-center" style="font-family:sans-serif;text-align:center; font-size: 1.2rem;">
                                            <h1 class="text-center">Scannerizza il QR code per compilare il modulo</h1>
                                            <div>
                                                <br>oppure vai su:
                                            </div>
                                            <div>
                                                ${__bakney.env.DOMAIN}/#/forms/${String(custom_link).toLowerCase()}
                                                </div>
                                        </div>
                                    </div>
                                </body>
                            </html>
                        `);
                            printWindow.document.close();
                            printWindow.focus();
                            printWindow.print();
                        }}><Printer size="20" weight="fill" class="mr-2" />QR code</button>
                </div>
            </div>
        </div>
    {/if}
</div>

<div class="d-flex justify-content-end px-8 mt-8">
    {#if tabbedWizard.current > 0 && tabbedWizard.current < 2}
        <button
            type="button"
            class="btn btn-sm btn-secondary mb-0 font-weight-bolder font-size-lg mr-4"
            on:click={() => {
                if (tabbedWizard.current > 0) tabbedWizard.current -= 1;
            }}>
            Indietro
        </button>
    {/if}
    {#if tabbedWizard.current < 1}
        <button
            type="submit"
            disabled={!tabbedWizard.currentValid}
            class="btn btn-sm btn-primary mb-0 font-weight-bolder font-size-lg"
            on:click={() => {
                if (tabbedWizard.current < 2) {
                    if (tabbedWizard.current == 1) {
                        configurationFormValidator.init();
                        setTimeout(async () => {
                            // console.error(configurationForm?.validate());
                            let status = await configurationFormValidator.form?.validate();
                            if (status === 'Valid') {
                                tabbedWizard.current += 1;
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
                        }, 200);
                    } else {
                        tabbedWizard.current += 1;
                        if (tabbedWizard.current == 1) {
                            setTimeout(() => {
                                configurationFormValidator.init();
                            }, 500);
                        }
                    }
                }
            }}>
            Avanti <ArrowRight size={16} weight="bold" />
        </button>
    {:else if tabbedWizard.current == 1}
        <button
            on:click={() => {
                if (tabbedWizard.current == 1) {
                    configurationFormValidator.init();
                    setTimeout(async () => {
                        // console.error(configurationForm?.validate());
                        let status = await configurationFormValidator.form?.validate();
                        if (status === 'Valid') {
                            let method = is_edit ? 'PATCH' : 'POST';
                            let url = is_edit
                                ? replaceUID(__bakney.env.API.MODULES.UPDATE, module_id)
                                : __bakney.env.API.MODULES.ADD;
                            // remove the props value from the elements
                            let cleanedElements = elements.map(element => {
                                if (element.type == 'signature') {
                                    delete element.props.value;
                                }
                                return element;
                            });
                            let res = await apiFetch(url, {
                                method: method,
                                body: JSON.stringify({
                                    elements: cleanedElements,
                                    title: title,
                                    custom_link: custom_link,
                                    require_approval: require_approval,
                                    start_date: start_date,
                                    end_date: end_date,
                                    always_active: always_active,
                                    max_responses: max_responses,
                                    queue_mode: queue_mode,
                                    only_users: only_users,
                                    payment_required: payment_required,
                                    payment_data: payment_data,
                                    allow_attachments: allow_attachments,
                                    response_message: response_message,
                                }),
                            });
                            if (!res.error) {
                                tabbedWizard.current += 1;
                                toast.success('Modulo creato con successo', 'Modulo creato');
                            } else {
                                swal.fire({
                                    text: 'Qualcosa è andato è storto, riprova.',
                                    icon: 'error',
                                    buttonsStyling: false,
                                    confirmButtonText: 'Ok, capito!',
                                    customClass: {
                                        confirmButton: 'btn font-weight-bold btn-light-primary',
                                    },
                                });
                            }
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
                    }, 200);
                }
            }}
            class="btn btn-sm btn-primary mb-0 font-weight-bolder font-size-lg"
            disabled={!tabbedWizard.currentValid}>
            Salva
        </button>
    {/if}
</div>
