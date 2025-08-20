<script>
    import BasicModal from 'components/modals/BasicModal.svelte';
    import {
        Datepicker,
        Currency,
        SmartSelect,
        FileInput,
        TextArea,
        TextInput,
    } from 'components/formBuilder/preview-blocks/index.js';
    import {getDataFromForm, toBase64Safe} from 'utils/Functions.js';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware.js';
    import {toast} from 'svelte-sonner';
    import {createEventDispatcher, onMount} from 'svelte';
    import {File, FileText, TrashSimple} from 'phosphor-svelte';
    import MetaPaymentCategories from './partials/meta-payment-categories.svelte';

    const dispatch = createEventDispatcher();

    export let show;
    export let data;
    export let edit = false;
    export let editableComplexItem = true;
    export let target = '#portal-elements';
    let loading = false;

    let form;
    let categories = [];
    let accounts = [];
    let subscriptions = [];
    let personas = [];
    let suppliers = [];
    let instructors = [];
    let complexItems = [];
    let courses = [];
    let hideGenerateInvoice = false;

    async function prepareJSONData(formData) {
        if (formData.complex_item) formData.complex_item = JSON.parse(formData.complex_item);

        if (data.meta_payment_categories) {
            formData.meta_payment_categories = [...data.meta_payment_categories];
            data.meta_payment_categories.forEach((meta, index) => {
                formData.meta_payment_categories[index].amount = parseFloat(
                    String(formData.meta_payment_categories[index].amount).replaceAll(',', '.')
                );
            });
        }

        formData.creation_date = moment(formData.creation_date, 'DD/MM/YYYY').format('YYYY-MM-DD');
        if (formData.payment_date)
            formData.payment_date = moment(formData.payment_date, 'DD/MM/YYYY').format('YYYY-MM-DD');
        else formData.payment_date = null;

        formData.custom_accounts = JSON.parse(formData.custom_accounts)?.value;
        formData.expense = JSON.parse(formData.expense)?.value;
        formData.payment_category = JSON.parse(formData.payment_category)?.value;
        formData.subject = JSON.parse(formData.subject)?.value;
        formData.type = JSON.parse(formData.type)?.value;
        formData.amount = parseFloat(formData.amount.replaceAll(',', '.'));
        if (formData.course) formData.course = JSON.parse(formData.course);

        // check if document is only one file aka not an array
        if (!Array.isArray(formData.attachments_data)) {
            formData.attachments_data = [formData.attachments_data];
        }

        // create the documents array with the base64 of the files and the filename
        if (
            formData.attachments_data &&
            String(formData.attachments_data) !== '{}' &&
            Array.isArray(formData.attachments_data) &&
            formData.attachments_data.length > 0
        ) {
            const documentPromises = Array.from(formData.attachments_data).map(async file => {
                const base64 = await toBase64Safe(file);
                return {
                    document: base64,
                    filename: file.name,
                };
            });
            formData.attachments_data = await Promise.all(documentPromises);
        } else {
            formData.attachments_data = [];
        }

        formData.attachments_data = formData.attachments_data.filter(x => x.document != '');

        return formData;
    }

    async function create(formData) {
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Creazione...',
        });

        const url = __bakney.env.API.PAYMENT.ADD;

        data = await prepareJSONData(formData);

        const res = await apiFetch(url, {
            method: 'POST',
            body: JSON.stringify(formData),
        });
        // spinner stop
        KTApp.unblockPage();

        if (res.status == 200 || res.status == 201) {
            toast.success('Creato con successo.');
            dispatch('update', {
                payment_id: res.response.payment_id,
                payment: res.response,
                creation_date: res.response.creation_date,
            });
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

        const url = replaceUID(__bakney.env.API.PAYMENT.UPDATE, data.payment_id);

        data = await prepareJSONData(formData);

        const res = await apiFetch(url, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });

        KTApp.unblockPage();

        if (res.status == 200 || res.status == 201) {
            toast.success('Aggiornato con successo.');
            dispatch('update', {
                payment_id: formData.payment_id,
                payment: res.response?.data?.payment,
            });
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
        form = FormValidation.formValidation(document.getElementById('payment_form'), {
            fields: {
                // description: {
                //     validators: {
                //         notEmpty: {
                //             message: 'La descrizione è obbligatoria.',
                //         },
                //     },
                // },
                // custom_accounts: {
                //     validators: {
                //         notEmpty: {
                //             message: 'Seleziona un conto.',
                //         },
                //     },
                // },
                // type: {
                //     validators: {
                //         notEmpty: {
                //             message: 'Seleziona un metodo di pagamento valido.',
                //         },
                //     },
                // },
                // amount: {
                //     validators: {
                //         notEmpty: {
                //             message: 'Seleziona un importo valido.',
                //         },
                //         regexp: {
                //             regexp: '^[0-9]{1,9},[0-9]{2}$',
                //             flags: 'ig',
                //             message: "L'importo deve essere > 0.",
                //         },
                //     },
                // },
                // payment_category: {
                //     validators: {
                //         notEmpty: {
                //             message: 'Seleziona una causale.',
                //         },
                //     },
                // },
                // creation_date: {
                //     validators: {
                //         notEmpty: {
                //             message: 'Seleziona una data.',
                //         },
                //         // date: {
                //         //     format: 'YYYY-MM-DD',
                //         //     message: 'Formato data non valido.',
                //         // },
                //     },
                // },
                // payment_date: {
                //     validators: {
                //         date: {
                //             format: 'YYYY-MM-DD',
                //             message: 'Formato data non valido.',
                //         },
                //     },
                // },
            },
            plugins: {
                trigger: new FormValidation.plugins.Trigger(),
                bootstrap: new FormValidation.plugins.Bootstrap(),
                // submitButton: new FormValidation.plugins.SubmitButton(),
            },
        });
    }

    function handleValidation(e) {
        initForm();
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
                    confirmButtonText: 'Ok',
                    customClass: {
                        confirmButton: 'btn font-weight-bold btn-light-primary',
                    },
                });
            }
        });
    }

    function generateInvoice() {
        show = false;
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Generazione ricevuta in corso...',
        });
        const url = replaceUID(__bakney.env.API.PAYMENT.GENERATE_INVOICE, data.payment_id);
        apiFetch(url, {
            method: 'POST',
            body: JSON.stringify({
                subscription_id: data.subscription_id || null,
            }),
        }).then(res => {
            if (res.status == 200) {
                // spinner stop
                KTApp.unblockPage();
                toast.success('Ricevuta generata con successo.');
                hideGenerateInvoice = true;
                dispatch('update', {
                    payment_id: data.payment_id,
                });
            } else {
                // spinner stop
                KTApp.unblockPage();
                toast.error('Errore nella generazione della ricevuta.');
            }
        });
    }

    async function fetchCategories() {
        let res = await apiFetch(__bakney.env.API.PAYMENT.CATEGORY.LIST);

        if (!res.error) categories = res.response.data || [];
        else if (res.status != 403 && res.status != 401) toast.error('Qualcosa è andato storto.');
    }

    async function fetchCourses() {
        let res = await apiFetch(__bakney.env.API.COURSE.LIST + '?all=1&optimized=1');

        if (!res.error) {
            // it is returned in res.response.data as an array of objects
            // we need to convert it to an array of objects with label and value
            /**
             * {data: 0: {course_id: "fdsddfds", title: "Corso di test"}}
             */
            courses = Object.values(res.response.data)?.map(x => ({
                label: x.title,
                value: x.course_id,
                description: x.description,
            }));
            // check if data.course is in the courses array otherwise add it
            if (data.course && courses?.length > 0 && !courses?.some(x => x.course_id == data.course)) {
                courses = [...courses, data.course];
            }
        } else if (res.status != 403 && res.status != 401) toast.error('Qualcosa è andato storto.');
    }

    async function fetchCustomAccounts() {
        const res = await apiFetch(__bakney.env.API.BALANCE_SHEET_ACCOUNTS.LIST + '?related=false', {
            method: 'GET',
        });
        if (!res.error) {
            accounts = Array.from(res?.response?.data || []);
        } else {
            if (res.status != 403 && res.status != 401) toast.error('Qualcosa è andato storto.');
        }
        return;
    }

    function fetchSubscriptions() {
        return apiFetch(`${__bakney.env.API.SUBSCRIPTION.LIST_ALL}`).then(res => {
            subscriptions = [];
            Object.keys(res.response.data).forEach(key => {
                if (
                    (data.subscription_id === undefined || data.subscription_id === null) &&
                    data.associate_id &&
                    res.response.data[key].associate?.associate_id == data.associate_id
                ) {
                    data.subscription_id = res.response.data[key].subscription_id;
                }
                subscriptions.push({
                    subscription_id: res.response.data[key].subscription_id,
                    label:
                        res.response.data[key].associate.first_name +
                        ' ' +
                        res.response.data[key].associate.last_name +
                        (res.response.data[key].current_year
                            ? ' <span class="my-auto label label-light-success label-inline font-weight-bolder label-lg">Stagione Corrente</span>'
                            : ` <span class="my-auto label label-light-warning label-inline font-weight-bolder label-lg">Stagione ${res.response.data[key].season}</span>`),
                });
            });
        });
    }

    function fetchPersonas() {
        return apiFetch(`${__bakney.env.API.PERSONAS.ALL}`).then(res => {
            personas = [];
            Object.keys(res.response.data).forEach(key => {
                personas.push({
                    associate_id: res.response.data[key].associate_id,
                    label: res.response.data[key].first_name + ' ' + res.response.data[key].last_name,
                });
            });
        });
    }

    async function fetchSuppliers() {
        let res = await apiFetch(`${__bakney.env.API.SUPPLIER.LIST}?all=true`);

        if (!res.error) suppliers = res.response.data || [];
        else if (res.status != 403 && res.status != 401) toast.error('Qualcosa è andato storto.');
    }

    async function fetchInstructors() {
        let res = await apiFetch(__bakney.env.API.INSTRUCTOR.LIST);

        if (!res.error) instructors = res.response.data || [];
        else if (res.status != 403 && res.status != 401) toast.error('Qualcosa è andato storto.');
    }

    function populateComplexItems() {
        complexItems = [];

        // if (expense) {
        // go through suppliers adn instructors and populate the select
        suppliers.forEach(supplier => {
            complexItems.push({
                value: supplier.supplier_id,
                supplier_id: supplier.supplier_id,
                label: supplier.name,
                group: 'Fornitori',
            });
        });
        instructors.forEach(instructor => {
            complexItems.push({
                value: instructor.instructor_id,
                instructor_id: instructor.instructor_id,
                label: instructor.first_name + ' ' + instructor.last_name,
                group: 'Istruttori',
            });
        });
        // }
        // subscriptions.forEach(subscription => {
        //     complexItems.push({
        //         value: subscription.subscription_id,
        //         subscription_id: subscription.subscription_id,
        //         label: subscription.label,
        //         group: 'Iscrizioni',
        //     });
        // });
        personas.forEach(persona => {
            complexItems.push({
                value: persona.associate_id,
                associate_id: persona.associate_id,
                label: persona.label,
                group: 'Persone',
            });
        });
    }

    function calculateAmount() {
        let initialAmount = parseFloat(data.amount);

        // loop through meta_payment_categories
        for (let i = 0; i < data.meta_payment_categories.length; i++) {
            initialAmount -= parseFloat(data.meta_payment_categories[i].amount);
        }

        return String(initialAmount).replaceAll('.', ',');
    }

    onMount(async () => {
        loading = true;
        await Promise.all([
            //fetchSubscriptions(),
            fetchPersonas(),
            fetchCustomAccounts(),
            fetchCategories(),
            fetchSuppliers(),
            fetchInstructors(),
            fetchCourses(),
        ]);
        populateComplexItems();
        if (edit && data.meta_payment_categories) {
            data.amount = calculateAmount();
        }
        if (typeof data.amount == 'string' && data.amount.includes('.')) {
            data.amount = data.amount.replace('.', ',');
        }
        loading = false;
    });
</script>

<div>
    <BasicModal
        id={`payment-modal`}
        bind:show
        title="{edit ? 'Modifica' : 'Crea Nuovo'} Pagamento"
        showTitle={true}
        {target}
        showActionButton={true}
        showCancelButton={true}
        showFooter={false}
        modalSize={'xl'}
        scrollable={true}
        hideOnClickOutside={false}
        bodyClass={'py-2 px-0'}>
        <!-- <pre class="font-size-xs">
{JSON.stringify(data, null, 2)}
</pre> -->
        {#if !loading && data?.expense !== null && accounts.length > 0}
            <form id="payment_form" on:submit|preventDefault={handleValidation}>
                <div class="text-left px-5">
                    {#if edit}
                        <input type="hidden" name="payment_id" value={data?.payment_id} />
                    {/if}
                    <div class="d-flex flex-column flex-md-row justify-content-between">
                        <TextInput
                            customClasses={'mx-2 px-0 w-100'}
                            editable={false}
                            active={false}
                            on:change={e => {
                                data.description = e.detail;
                            }}
                            props={{
                                id: 'description',
                                name: 'description',
                                label: 'Descrizione',
                                placeholder: 'Inserisci una descrizione',
                                required: true,
                                value: data?.description,
                            }} />
                        <Currency
                            customClasses={'mx-2 px-0 min-w-10'}
                            editable={false}
                            on:change={e => {
                                data.amount = e.detail;
                            }}
                            props={{
                                label: 'Importo',
                                name: 'amount',
                                id: 'amount',
                                placeholder: '0,00',
                                required: true,
                                value: data.amount,
                            }} />
                    </div>
                    <div class="d-flex flex-column flex-md-row justify-content-between flex-wrap">
                        <SmartSelect
                            hideEmptyState={true}
                            customClasses={'mx-2 px-0 col-12 col-md-5'}
                            editable={false}
                            active={false}
                            virtualListMode={true}
                            on:change={e => {
                                data.complex_item = e.detail.value;
                            }}
                            on:clear={e => {
                                data.complex_item = null;
                            }}
                            props={{
                                id: 'complex_item',
                                name: 'complex_item',
                                label: 'Intestato a',
                                placeholder: 'Seleziona a chi è intestato',
                                required: false,
                                options: complexItems,
                                disabled: !editableComplexItem,
                                clearable: true,
                                searchable: true,
                                showChevron: false,
                                groupBy: item => item.group,
                                value:
                                    data.complex_item ||
                                    data?.associate?.associate_id ||
                                    data?.subscription_id ||
                                    data?.supplier_id ||
                                    data?.instructor_id ||
                                    null,
                            }} />
                        <SmartSelect
                            hideEmptyState={true}
                            customClasses={'mx-2 px-0 col-12 col-md-3'}
                            editable={false}
                            active={false}
                            on:change={e => {
                                data.custom_accounts = e.detail.value;
                                const account = accounts.filter(x => x.custom_account_id == e.detail.value)[0];
                                // set category to cash
                                if (parseInt(account.account_type) == 1) {
                                    data.type = 'cash';
                                } else if (parseInt(account.account_type) == 2) {
                                    data.type = 'transfer';
                                }
                            }}
                            props={{
                                id: 'custom_accounts',
                                name: 'custom_accounts',
                                label: 'Conto',
                                placeholder: 'Seleziona la causale',
                                required: true,
                                options: accounts?.map(x => {
                                    return {
                                        label: x.name,
                                        value: x.custom_account_id,
                                    };
                                }),
                                clearable: false,
                                searchable: false,
                                showChevron: true,
                                value: data?.custom_accounts || accounts[0].custom_account_id,
                            }} />
                        <SmartSelect
                            hideEmptyState={true}
                            customClasses={'mx-2 px-0 col-12 col-md-3'}
                            editable={false}
                            active={false}
                            bind:value={data.type}
                            props={{
                                id: 'type',
                                name: 'type',
                                label: 'Metodo di pagamento',
                                placeholder: 'Seleziona il metodo di pagamento',
                                required: false,
                                options: [
                                    {value: 'default', label: 'non specificato'},
                                    {value: 'cash', label: 'contanti'},
                                    {value: 'transfer', label: 'Bonifico Bancario'},
                                    {value: 'online', label: 'Altro mezzo Online'},
                                    {value: 'sepa-transfer', label: 'Bonifico SEPA'},
                                    {value: 'stripe', label: 'Stripe'},
                                    {value: 'pos', label: 'PoS'},
                                ],
                                clearable: false,
                                searchable: false,
                                showChevron: true,
                                value: data?.type || 'cash',
                            }} />
                    </div>
                    <div class="d-flex flex-column flex-md-row justify-content-between">
                        <SmartSelect
                            hideEmptyState={true}
                            customClasses={'mx-2 px-0 min-w-6 col-12 col-md-2'}
                            editable={false}
                            active={false}
                            bind:value={data.expense}
                            props={{
                                id: 'expense',
                                name: 'expense',
                                label: 'Tipologia',
                                placeholder: 'Seleziona la causale',
                                required: true,
                                options: [
                                    {label: 'Entrata', value: false},
                                    {label: 'Uscita', value: true},
                                ],
                                clearable: false,
                                searchable: false,
                                showChevron: true,
                                value: data?.expense || false,
                            }} />
                        <Datepicker
                            customClasses={'mx-2 px-0 max-w-8 col-12 col-md-3'}
                            editable={false}
                            active={false}
                            on:change={e => {
                                data.creation_date = moment(e.detail, 'DD/MM/YYYY').format('YYYY-MM-DD');
                            }}
                            props={{
                                id: 'creation_date',
                                name: 'creation_date',
                                label: data?.expense ? 'Data Prevista Uscita' : 'Data Prevista Incasso',
                                required: true,
                                format: 'DD/MM/YYYY',
                                value: data?.creation_date
                                    ? moment(data?.creation_date).format('DD/MM/YYYY')
                                    : moment().format('DD/MM/YYYY'),
                            }} />
                        <Datepicker
                            customClasses={'mx-2 px-0 max-w-8 col-12 col-md-3'}
                            editable={false}
                            active={false}
                            on:change={e => {
                                if (e.detail) {
                                    data.payment_date = moment(e.detail, 'DD/MM/YYYY').format('YYYY-MM-DD');
                                } else {
                                    data.payment_date = null;
                                }
                            }}
                            props={{
                                id: 'payment_date',
                                name: 'payment_date',
                                label: data?.expense ? 'Data Pagamento' : 'Data Incasso',
                                required: false,
                                format: 'DD/MM/YYYY',
                                value: data?.payment_date ? moment(data?.payment_date).format('DD/MM/YYYY') : null,
                            }} />

                        <SmartSelect
                            customClasses={'mx-2 px-0 col-12 col-md-3'}
                            editable={false}
                            active={false}
                            on:change={e => {
                                data.subject = e.detail.value;
                                if (e.detail.value == 2) {
                                    fetchCourses();
                                }
                            }}
                            props={{
                                id: 'subject',
                                name: 'subject',
                                label: 'Tipo Quota',
                                placeholder: 'Seleziona tipologia quota',
                                required: true,
                                clearable: false,
                                searchable: false,
                                showChevron: true,
                                options: [
                                    {value: 0, label: 'Altro'},
                                    {value: 1, label: 'Iscrizione'},
                                    {value: 2, label: 'Corso'},
                                ],
                                value: data?.subject || 0,
                            }} />
                    </div>
                    {#if data.subject == 2}
                        <div class="d-flex flex-column flex-md-row justify-content-between pr-0 pr-md-4">
                            <SmartSelect
                                customClasses={'mx-2 px-0 col-12 col-md-12'}
                                editable={false}
                                active={false}
                                on:change={e => {
                                    data.course = e.detail;
                                }}
                                props={{
                                    id: 'course',
                                    name: 'course',
                                    label: 'Corso associato',
                                    placeholder: 'Seleziona il corso (opzionale)',
                                    required: false,
                                    clearable: true,
                                    searchable: true,
                                    showChevron: true,
                                    options: courses?.length > 0 ? courses : [],
                                    value: data?.course?.value || null,
                                }} />
                        </div>
                    {/if}
                    <div class="d-flex flex-column flex-md-row justify-content-between pr-0 pr-md-4">
                        <SmartSelect
                            customClasses={'mx-2 px-0 col-12'}
                            editable={false}
                            active={false}
                            on:change={e => {
                                data.payment_category_id = e.detail.value;
                            }}
                            props={{
                                id: 'payment_category',
                                name: 'payment_category',
                                label: 'Causale',
                                placeholder: 'Seleziona la causale',
                                required: true,
                                clearable: false,
                                searchable: false,
                                showChevron: true,
                                options: data.expense
                                    ? categories
                                          .filter(x => x.expense)
                                          ?.map(x => {
                                              return {label: x.name, value: x.payment_category_id};
                                          })
                                    : categories
                                          .filter(x => !x.expense)
                                          ?.map(x => {
                                              return {label: x.name, value: x.payment_category_id};
                                          }),
                                value:
                                    data?.payment_category_id ||
                                    data?.payment_category ||
                                    (data?.expense
                                        ? categories?.filter(x => x.name == 'Compensi e Rimborsi Spese')[0]
                                              ?.payment_category_id
                                        : categories?.filter(x => x.name == 'entrate e proventi da attività tipiche')[0]
                                              ?.payment_category_id),
                            }} />
                    </div>
                    <MetaPaymentCategories bind:data bind:categories />
                    <TextArea
                        customClasses={'mx-2 px-0'}
                        editable={false}
                        active={false}
                        on:change={e => {
                            data.notes = e.detail;
                        }}
                        props={{
                            id: 'notes',
                            name: 'notes',
                            label: 'Note',
                            placeholder: 'Inserisci delle note',
                            required: false,
                            rows: 4,
                            value: data?.notes,
                        }} />
                    <FileInput
                        customClasses={'mx-2 px-0'}
                        editable={false}
                        active={false}
                        props={{
                            id: 'attachments_data',
                            name: 'attachments_data',
                            label: 'Documenti allegati',
                            placeholder: 'Inserisci allegati',
                            noPadding: true,
                            required: false,
                            multiple: true,
                        }} />
                    {#if edit && data.attachments && data.attachments.length > 0}
                        <h5 class="font-size-h6 mx-2 text-dark">Documenti</h5>
                        <div class="px-0 mx-2 my-4 border rounded-lg bg-light">
                            {#each data.attachments as doc, idx}
                                <div
                                    class="d-flex align-items-center justify-content-between m-0 p-0 {idx !==
                                    data.attachments.length - 1
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
                                                data.attachments = data.attachments.filter(
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
                    {#if !data.expense && data.paid && (!data.invoice || !data.invoice.document_pdf) && !hideGenerateInvoice}
                        <button
                            disabled={!data.subscription_id}
                            type="button"
                            class="btn btn-success font-weight-bold"
                            on:click={generateInvoice}
                            ><FileText size="16" weight="bold" class="mr-1" />Genera Ricevuta</button>
                    {/if}
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
