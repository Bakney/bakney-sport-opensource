<script>
    import XCircleBtn from 'components/buttons/XCircle.svelte';
    import {slide} from 'svelte/transition';
    import {sessionToken, userData} from 'store/stores.js';
    import {onDestroy, onMount} from 'svelte';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware.js';
    import {PaperPlaneTilt, PlusCircle, TrashSimple, XCircle as XCircleIcon} from 'phosphor-svelte';
    import {canPerformAction} from 'utils/Permissions';
    import DeleteButton from 'components/buttons/DeleteButton.svelte';
    import KtDatatable from 'components/tables/KTDatatable.svelte';
    import {toast} from 'svelte-sonner';
    import {debounce, waitForElementAndExecute} from 'utils/Functions';
    import PaymentDrawer from 'routes/accounting/payment/PaymentDrawer.svelte';
    import AddEditModal from 'routes/accounting/payment/modals/AddEditModal.svelte';
    import DocumentButton from 'components/buttons/DocumentButton.svelte';
    import InvoicePreviewModal from 'components/modals/InvoicePreviewModal.svelte';
    import ApproveButton from 'components/buttons/ApproveButton.svelte';
    import EditButton from 'components/buttons/EditButton.svelte';
    import {SmartSelect} from 'components/formBuilder/preview-blocks';
    import {personasPaymentListFilter, personasPaymentListFilterDatatable} from 'store/stores.js';

    sessionToken.useLocalStorage();
    userData.useLocalStorage();

    export let associateId;
    let datatable;

    let categories = [];
    let selectedCounter = 0;
    let visibleMultiaction = false;

    const statusTextDictionary = {
        false: '<span class="label label-light-warning label-inline font-weight-bolder label-lg">In attesa</span>',
        true: '<span class="label label-light-success label-inline font-weight-bolder label-lg">Pagato</span>',
    };

    const subjectDictionary = {
        0: 'Altro',
        1: 'Iscrizione',
        2: 'Corso',
    };
    const accountType = {
        1: 'Cassa',
        2: 'Banca',
        3: 'Altro',
    };

    const typeTextDictionary = {
        default: '<span>-</span>',
        cash: '<span>Contanti</span>',
        stripe: '<span>stripe</span>',
        transfer: '<span>Bonifico</span>',
        online: '<span>Online</span>',
        'sepa-transfer': '<span>Bonifico SEPA</span>',
        pos: '<span>PoS</span>',
    };

    const paymentSubjectsMap = [
        {
            key: '0',
            value: 'Altro',
        },
        {
            key: '1',
            value: 'Iscrizione',
        },
        {
            key: '2',
            value: 'Corso',
        },
        {
            key: '3',
            value: 'Giroconto',
        },
    ];

    let paymentTypesMap = [
        {
            key: 'default',
            value: 'non definito',
        },
        {
            key: 'cash',
            value: 'contanti',
        },
        {
            key: 'transfer',
            value: 'Bonifico Bancario',
        },
        {
            key: 'online',
            value: 'Altro mezzo Online',
        },
        {
            key: 'sepa-transfer',
            value: 'Bonifico SEPA',
        },
        {
            key: 'stripe',
            value: 'Stripe',
        },
        {
            key: 'pos',
            value: 'PoS',
        },
    ];

    async function requestPaymentsSelected() {
        swal.fire({
            title: 'Sollecita pagamenti',
            html: `
                <p>Vuoi sollecitare ${selectedCounter} pagementi?</p>
                <div class="d-flex flex-column align-items-center">
                    <button 
                        class="btn btn-primary mt-4 mx-0 font-weight-boldest w-100" 
                        type="button" 
                        id="emailButton">
                        Sollecita via Email
                    </button>
                    <button 
                        class="btn btn-success mt-4 mx-0 font-weight-boldest w-100" 
                        type="button" 
                        id="whatsappButton">
                        Sollecita via WhatsApp
                    </button>
                    <button 
                        class="btn btn-secondary mt-4 mx-0 font-weight-boldest w-100" 
                        type="button" 
                        id="cancelButton">
                        Annulla
                    </button>
                </div>
            `,
            target: document.querySelector(`#portal-elements-foreground`),
            showConfirmButton: false,
            showCancelButton: false,
            didOpen: () => {
                let records = jQuery('#kt_datatable_payments_' + associateId).KTDatatable('getSelectedRecords').dataSet;
                let checkedNodes = datatable?.getSelectedRecords();
                // get an array of the selected row ids
                let selectedRowIds = Array.from(checkedNodes || []).map(node => node.dataset.row);

                const createWhatsAppLink = () => {
                    let text = `Buongiorno,\n`;

                    let unpaidPayments =
                        records?.filter((record, i) => !record.paid && selectedRowIds.includes(String(i))) || [];
                    let counterUnpaidPayments = 0;
                    let textDescription = '';
                    unpaidPayments.forEach((record, i) => {
                        textDescription += `Pagamento ${i + 1}:\n`;
                        textDescription += `Importo da pagare: ${record.amount}€\n`;
                        textDescription += `Informazioni: ${record.description}\n`;
                        textDescription += `Data scadenza: ${moment(record.creation_date).format('DD/MM/YYYY')}\n\n`;
                        counterUnpaidPayments++;
                    });
                    text += `Le ricordiamo che ha ${
                        counterUnpaidPayments > 1 ? 'dei pagamenti in sospeso' : 'un pagamento in sospeso'
                    }.\n\n`;
                    text += textDescription;
                    text += `La preghiamo di regolarizzare la sua posizione.\n`;
                    text += `Grazie\n\n`;
                    text += `Cordialmente,\n${$userData?.sport_association?.denomination || ''}`;

                    return `https://wa.me/?text=${encodeURIComponent(text)}`;
                };

                document.getElementById('whatsappButton')?.addEventListener('click', () => {
                    window.open(createWhatsAppLink(), '_blank');
                    swal.close();
                });

                document.getElementById('emailButton')?.addEventListener('click', async () => {
                    swal.close();
                    KTApp.blockPage({
                        overlayColor: '#000000',
                        state: 'primary',
                        message: 'Invio email in corso...',
                    });

                    let results = [];
                    if (selectedCounter > 0) {
                        for (let i = 0; i < selectedCounter; i++) {
                            let id = checkedNodes[i].dataset.row;
                            results.push(
                                new Promise(async (resolve, reject) => {
                                    let r = await apiFetch(
                                        replaceUID(__bakney.env.API.PAYMENT.REQUEST, records[id].payment_id),
                                        {
                                            method: 'POST',
                                        }
                                    );
                                    resolve(r.status == 200);
                                })
                            );
                        }
                    }

                    Promise.all(results).then(values => {
                        KTApp.unblockPage();

                        if (values.length > 0) {
                            if (values.length != selectedCounter) {
                                toast.warning(`${values.length} Pagamenti sollecitati su ${selectedCounter}.`);
                            } else if (values.every(r => r)) {
                                toast.success(`${values.length} Pagamenti sollecitati.`);
                            } else {
                                let valid = values.filter(r => r).length;
                                toast.warning(`${valid} Pagamenti sollecitati su ${selectedCounter}.`);
                            }
                        } else {
                            toast.warning(`Nessun pagamento sollecitato.`);
                        }

                        datatable.reload();
                        visibleMultiaction = false;
                    });
                });

                document.getElementById('cancelButton')?.addEventListener('click', () => {
                    swal.close();
                });
            },
            willClose: () => {
                document.getElementById('whatsappButton')?.removeEventListener('click', () => {});
                document.getElementById('emailButton')?.removeEventListener('click', () => {});
                document.getElementById('cancelButton')?.removeEventListener('click', () => {});
            },
        });
    }

    async function deletePaymentsSelected() {
        swal.fire({
            text: `Vuoi eliminare ${selectedCounter} pagament${selectedCounter > 1 ? 'i' : 'o'}?`,
            icon: 'question',
            target: document.querySelector(`#portal-elements-foreground`),
            buttonsStyling: true,
            showCancelButton: true,
            cancelButtonText: 'Annulla',
            confirmButtonText: 'Elimina',
            reverseButtons: true,
        }).then(async function (result) {
            if (result.isConfirmed) {
                let records = jQuery('#kt_datatable_payments_' + associateId).KTDatatable('getSelectedRecords').dataSet;
                let checkedNodes = datatable?.getSelectedRecords();
                let count = checkedNodes.length;
                KTApp.blockPage({
                    overlayColor: '#000000',
                    state: 'primary',
                    message: 'Eliminazione in corso...',
                });
                let payment_ids = [];
                for (let i = 0; i < count; i++) {
                    let id = checkedNodes[i].dataset.row;
                    payment_ids.push(records[id].payment_id);
                }

                let result = await apiFetch(__bakney.env.API.PAYMENT.BULK_DELETE, {
                    method: 'POST',
                    body: JSON.stringify({
                        payment_ids: payment_ids,
                    }),
                });

                KTApp.unblockPage();

                if (!result.error) {
                    toast.success(`${selectedCounter} Pagamenti Eliminati.`);
                } else {
                    toast.warning(`Nessun pagamento eliminato.`);
                }
                visibleMultiaction = false;
                datatable.reload();
            }
        });
    }

    let markAsPaid = async (id, payment_date, expense = false) => {
        payment_date = payment_date
            ? moment(new Date(payment_date)).format('YYYY-MM-DD')
            : moment().format('YYYY-MM-DD');
        swal.fire({
            title: expense ? 'Segna come pagato?' : 'Incassare il pagamento?',
            icon: 'question',
            target: document.querySelector(`#portal-elements-foreground`),
            buttonsStyling: true,
            html: `
            <div class="form-group px-4">
                <label for="payment_date font-weight-boldest">${!expense ? 'Data Incasso' : 'Data Pagamento'}</label>
                <input type="date" value=${payment_date} class="form-control form-control-solid form-control-lg" id="payment_date_${id}" value name="payment_date" placeholder="${
                !expense ? 'Data Incasso' : 'Data Pagamento'
            }" />
                   <div id="receipt_email_container_${id}" style="display: ${expense ? 'none' : 'block'};">
                    <div class="form-group mt-6">
                         <div class="checkbox-inline font-weight-boldest font-size-sm">
                            <label class="checkbox" class="font-weight-boldest font-size-sm">
                                <input type="checkbox" id="generate_invoice_${id}" checked>
                                <span></span>
                                Genera ricevuta
                            </label>
                        </div>
                        <div class="checkbox-inline font-weight-boldest font-size-sm">
                            <label class="checkbox">
                                <input type="checkbox" id="send_receipt_email_${id}">
                                <span></span>
                                Invia email
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            `,
            showCancelButton: true,
            cancelButtonText: 'Annulla',
            confirmButtonText: expense ? 'Segna come pagato' : 'Incassa',
            reverseButtons: true,
        }).then(function (result) {
            if (result.isConfirmed) {
                KTApp.blockPage({
                    overlayColor: '#000000',
                    state: 'primary',
                    message: 'Conferma in corso...',
                });

                const url = __bakney.env.HOST + '/payment/' + id + '/approve';

                let body = {
                    payment_date: document.getElementById(`payment_date_${id}`).value || null,
                    send_receipt_email: document.getElementById(`send_receipt_email_${id}`).checked || false,
                    generate_invoice: document.getElementById(`generate_invoice_${id}`).checked || false,
                };

                window
                    .fetch(url, {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            Authorization: 'Bearer ' + $sessionToken,
                        },
                        body: JSON.stringify(body),
                    })
                    .then(async response => {
                        let res = await response.json();
                        // refresh detail view
                        if (response.status == 200) {
                            // spinner stop
                            KTApp.unblockPage();

                            if (res.data.payment) {
                                let paymentDrawer = new PaymentDrawer({
                                    target: document.querySelector(`#portal-elements`),
                                    intro: true,
                                    props: {
                                        isOpen: true,
                                        data: res.data.payment,
                                        title: 'Pagamento',
                                    },
                                });
                                paymentDrawer.$on('close', e => {
                                    datatable?.reload();
                                });
                            }

                            // dispatch('reset', {
                            //     page: 'payments',
                            //     searchKey: id,
                            // });
                        } else {
                            let modalText =
                                response.status == 403
                                    ? 'Operazione non permessa.'
                                    : 'Scusa, ho individuato degli errori, riprova.';
                            swal.fire({
                                text: modalText,
                                icon: 'error',
                                target: document.querySelector(`#portal-elements-foreground`),
                                buttonsStyling: false,
                                confirmButtonText: 'Ok!',
                                customClass: {
                                    confirmButton: 'btn font-weight-bold btn-light-primary',
                                },
                            }).then(function () {
                                KTUtil.scrollTop();
                            });
                            // spinner stop
                            KTApp.unblockPage();
                        }
                    });
            }
        });
    };

    async function fetchCategories() {
        let res = await apiFetch(__bakney.env.API.PAYMENT.CATEGORY.LIST);

        if (!res.error) categories = res.response.data || [];
        else if (res.status != 403 && res.status != 401) toast.error('Qualcosa è andato storto.');
    }

    onMount(async () => {
        await fetchCategories();
        $personasPaymentListFilter.associateId = associateId;
    });

    onDestroy(() => {
        document.querySelectorAll('.popover').forEach(popover => popover.remove());
        document.querySelectorAll('.tooltip').forEach(popover => popover.remove());
    });
</script>

<div class="card card-custom gutter-b">
    <div class="card-body p-0 border-0">
        <div class="row">
            <div class="col-10 mt-2">
                <h3 class="card-label font-size-h2">
                    Pagamenti
                    <span class="d-block text-muted pt-2 font-size-sm">Lista dei pagamenti.</span>
                </h3>
            </div>
            <div class="col-2 mt-2 d-flex justify-content-end align-items-center">
                {#if canPerformAction('bookeeping.payments.create')}
                    <button
                        on:click={() => {
                            let addModal = new AddEditModal({
                                target: document.querySelector(`#portal-elements-foreground`),
                                props: {
                                    show: true,
                                    editableComplexItem: false,
                                    data: {
                                        type: 'cash',
                                        expense: false,
                                        associate_id: associateId,
                                        associate: {
                                            associate_id: associateId,
                                        },
                                        meta_payment_categories: [],
                                    },
                                },
                            });

                            addModal.$on('update', e => {
                                let drawer = new PaymentDrawer({
                                    target: document.querySelector(`#portal-elements-foreground`),
                                    props: {
                                        data: e.detail?.payment,
                                        title: 'Dettagli Pagamento',
                                        isOpen: true,
                                    },
                                });

                                drawer.$on('close', () => {
                                    datatable.reload();
                                });
                            });
                        }}
                        class="btn btn-sm btn-primary font-weight-bolder m-2 my-4">
                        <PlusCircle size={16} weight="bold" />
                        <span class="ml-0 ml-md-1"><span class="d-none d-md-inline-block">Pagamento</span></span>
                    </button>
                {/if}
            </div>
        </div>
        <div class="row">
            <div class="col-12 mt-4">
                <KtDatatable
                    id={`kt_datatable_payments_${associateId}`}
                    bind:datatable
                    bind:selectedCounter
                    bind:visibleMultiaction
                    showDividerFilter={false}
                    url={__bakney.env.API.PAYMENT.LIST}
                    columns={[
                        {
                            field: 'payment_id',
                            title: '#',
                            sortable: false,
                            width: 20,
                            autoHide: false,
                            selector: {
                                class: '',
                            },
                            textAlign: 'center',
                        },
                        {
                            field: 'subject',
                            title: 'Attività',
                            width: 150,
                            autoHide: false,
                            minWidth: '100%',
                            fireClick: true,
                            sortable: false,
                            template: function (row) {
                                let categoryDescription = null;
                                if (row.subject == 0 && row.payment_category && !row.description) {
                                    categoryDescription =
                                        categories?.find(
                                            category => category.payment_category_id == row.payment_category
                                        )?.name || '';
                                } else if (row.subject == 0 && row.payment_category && row.description) {
                                    categoryDescription = row.description;
                                }
                                // check when subscription
                                if (row.subject == 1) {
                                    // $userData?.sport_association?.subscription_fee_plans?.forEach(p => {
                                    //     if (p.subscription_fee == row.amount) categoryDescription = '(' + (p.name || '') + ')';
                                    // });

                                    categoryDescription = `${row.meta?.subscription_data?.name || 'quota singola'}`;
                                }
                                // check if course
                                else if (row.subject == 2) {
                                    if (row.is_carnet) {
                                        categoryDescription = `Carnet (${row.carnet?.title})`;
                                    } else {
                                        categoryDescription = row.description ?? '-';
                                    }
                                }
                                if (row.meta?.description && row.meta?.description != row.description) {
                                    categoryDescription += '<br>';
                                    categoryDescription += row?.meta?.description ?? '';
                                }
                                return (
                                    '<div class="d-flex flex-column flex-wrap" style="line-height: 1.1"><span class="font-size-md font-weight-boldest">' +
                                    (subjectDictionary[row.subject] || '') +
                                    (categoryDescription
                                        ? ` <br><span class="font-weight-bold font-size-xs">${categoryDescription}</span>`
                                        : '') +
                                    '</span></div>'
                                );
                            },
                        },
                        {
                            field: 'amount',
                            title: 'Importo',
                            fireClick: true,
                            width: 60,
                            minWidth: '100%',
                            sortable: false,
                            responsive: {
                                visible: 'lg',
                                hidden: 'md',
                            },
                            template: function (row) {
                                let amount =
                                    parseFloat(row.amount) >= 0
                                        ? '<span class="text-success" style=\'font-weight:700;\'>€ ' +
                                          row.amount.replace('.', ',') +
                                          '</span>'
                                        : '<span class="text-danger" style=\'font-weight:700;\'>€ ' +
                                          row.amount.replace('.', ',') +
                                          '</span>';
                                return amount;
                            },
                        },
                        {
                            field: 'type',
                            title: 'Metodo',
                            fireClick: true,
                            checked: true,
                            width: 70,
                            autoHide: false,
                            sortable: true,
                            responsive: {
                                visible: 'xxl',
                                hidden: 'xl',
                            },
                            template: function (row) {
                                return typeTextDictionary[row.type];
                            },
                        },
                        {
                            field: 'expense',
                            title: 'Tipo',
                            checked: true,
                            fireClick: true,
                            width: 50,
                            autoHide: false,
                            sortable: true,
                            responsive: {
                                visible: 'lg',
                                hidden: 'md',
                            },
                            template: function (row) {
                                return row.expense ? 'Uscita' : 'Entrata';
                            },
                        },
                        {
                            field: 'custom_account_type',
                            title: 'Conto',
                            checked: true,
                            fireClick: true,
                            width: 70,
                            autoHide: false,
                            sortable: false,
                            minWidth: '100%',
                            responsive: {
                                visible: 'lg',
                                hidden: 'md',
                            },
                            template: function (row) {
                                return `<div class="font-size-sm d-flex flex-column flex-wrap" style="line-height: 1.3">
                                    <span class="font-weight-bolder">${accountType[row.custom_account_type]}</span>
                                    <span class="font-size-xs text-dark-65">${row.custom_account_name}</span>
                                    </div>`;
                            },
                        },
                        {
                            field: 'creation_date',
                            title: 'Data',
                            fireClick: true,
                            width: 70,
                            type: 'date',
                            minWidth: '100%',
                            responsive: {
                                visible: 'md',
                                hidden: 'sm',
                            },
                            sortCallback: function (data, sort, column) {
                                let dataArray = Object.values(data);
                                dataArray.sort(function (a, b) {
                                    let timeA = new Date(a['creation_date']).getTime();
                                    let timeB = new Date(b['creation_date']).getTime();
                                    if (sort === 'asc') {
                                        return parseFloat(timeA) > parseFloat(timeB)
                                            ? 1
                                            : parseFloat(timeA) < parseFloat(timeB)
                                            ? -1
                                            : 0;
                                    } else {
                                        return parseFloat(timeA) < parseFloat(timeB)
                                            ? 1
                                            : parseFloat(timeA) > parseFloat(timeB)
                                            ? -1
                                            : 0;
                                    }
                                });
                                let newData = {};
                                for (let i = 0; i < dataArray.length; i++) {
                                    newData[i] = dataArray[i];
                                }

                                return newData;
                            },
                            template: function (row) {
                                // format row.creation_date to dd/mm/yyyy with moment
                                let date = moment(row.creation_date).format('DD/MM/YYYY');
                                return date;
                            },
                        },
                        {
                            field: 'payment_date',
                            title: 'Pagato',
                            fireClick: true,
                            width: 70,
                            type: 'date',
                            minWidth: '100%',
                            responsive: {
                                visible: 'lg',
                                hidden: 'md',
                            },
                            sortCallback: function (data, sort, column) {
                                let dataArray = Object.values(data);
                                dataArray.sort(function (a, b) {
                                    let timeA = new Date(a['payment_date']).getTime();
                                    let timeB = new Date(b['payment_date']).getTime();
                                    if (sort === 'asc') {
                                        return parseFloat(timeA) > parseFloat(timeB)
                                            ? 1
                                            : parseFloat(timeA) < parseFloat(timeB)
                                            ? -1
                                            : 0;
                                    } else {
                                        return parseFloat(timeA) < parseFloat(timeB)
                                            ? 1
                                            : parseFloat(timeA) > parseFloat(timeB)
                                            ? -1
                                            : 0;
                                    }
                                });
                                let newData = {};
                                for (let i = 0; i < dataArray.length; i++) {
                                    newData[i] = dataArray[i];
                                }

                                return newData;
                            },
                            template: function (row) {
                                if (row.payment_date == null) return '-';
                                // format row.payment_date to dd/mm/yyyy with moment
                                return moment(row.payment_date).format('DD/MM/YYYY');
                            },
                        },
                        {
                            field: 'paid',
                            title: 'Stato',
                            fireClick: true,
                            width: 65,
                            minWidth: '100%',
                            autoHide: false,
                            responsive: {
                                visible: 'sm',
                                hidden: 'xs',
                            },
                            sortable: false,
                            template: function (row) {
                                return statusTextDictionary[row.paid];
                            },
                        },
                        {
                            field: '',
                            title: '',
                            sortable: false,
                            overflow: 'visible',
                            textAlign: 'right',
                            autoHide: false,
                            width: 140,
                            minWidth: '100%',
                            template: function (row) {
                                let pdfLink =
                                    __bakney.env.HOST +
                                    '/document/retrieve/' +
                                    row.invoice?.document_pdf +
                                    '?download=false&token=' +
                                    row.invoice?.document_token;
                                waitForElementAndExecute(`#action-col-${row.payment_id}`, () => {
                                    if (document.querySelector(`#action-col-${row.payment_id}`))
                                        document.querySelector(`#action-col-${row.payment_id}`).innerHTML = '';

                                    if (row.invoice && row.invoice.document_pdf) {
                                        let documentButton = new DocumentButton({
                                            target: document.querySelector(`#action-col-${row.payment_id}`),
                                            intro: true,
                                            props: {
                                                disabled: false,
                                                popover_text: `Ricevuta n.${row.invoice.number}`,
                                            },
                                        });

                                        documentButton.$on('open', data => {
                                            let filePreview = new InvoicePreviewModal({
                                                target: document.querySelector(`#action-col-${row.payment_id}`),
                                                intro: true,
                                                props: {
                                                    pdfLink: pdfLink,
                                                    row: row.invoice,
                                                    id: row.invoice.invoice_id,
                                                    title: `Ricevuta n.${row.invoice.number}`,
                                                    target: `#portal-elements-foreground`,
                                                },
                                            });
                                        });
                                    }
                                    if (row.paid) {
                                        let rejectBtn = new XCircleBtn({
                                            target: document.querySelector(`#action-col-${row.payment_id}`),
                                            intro: true,
                                            props: {
                                                disabled: !canPerformAction('bookeeping.payments.update'),
                                                hidden: false,
                                                popover_text: 'Annulla pagamento',
                                            },
                                        });
                                        rejectBtn.$on('open', async data => {
                                            swal.fire({
                                                title: 'Vuoi annullare il pagamento?',
                                                text: "Il pagamento verrà segnato come non pagato e sarà segnata come annullata l'eventuale ricevuta associata.",
                                                icon: 'warning',
                                                target: document.querySelector(`#portal-elements-foreground`),
                                                buttonsStyling: true,
                                                showCancelButton: true,
                                                cancelButtonText: 'Annulla',
                                                confirmButtonText: 'Conferma',
                                                reverseButtons: true,
                                                confirmButtonColor: '#d63030',
                                            }).then(async function (result) {
                                                if (result.isConfirmed) {
                                                    KTApp.blockPage({
                                                        overlayColor: '#000000',
                                                        state: 'primary',
                                                        message: 'Annullamento in corso...',
                                                    });

                                                    const response = await apiFetch(
                                                        replaceUID(__bakney.env.API.PAYMENT.CANCEL, row.payment_id),
                                                        {
                                                            method: 'POST',
                                                        }
                                                    );

                                                    KTApp.unblockPage();

                                                    if (!response.error) {
                                                        let drawer = new PaymentDrawer({
                                                            target: document.querySelector(`#portal-elements`),
                                                            props: {
                                                                data: response.response.data.payment,
                                                                title: 'Dettagli Pagamento',
                                                                isOpen: true,
                                                            },
                                                        });

                                                        drawer.$on('close', () => {
                                                            datatable?.reload();
                                                        });
                                                        toast.success('Pagamento annullato!');
                                                    } else {
                                                        toast.error('Qualcosa è andato storto.');
                                                    }
                                                }
                                            });
                                        });
                                    } else {
                                        let approveBtn = new ApproveButton({
                                            target: document.querySelector(`#action-col-${row.payment_id}`),
                                            intro: true,
                                            props: {
                                                disabled: row.paid || !canPerformAction('bookeeping.payments.update'),
                                                popover_text: 'Segna come pagato',
                                            },
                                        });
                                        approveBtn.$on('open', data => {
                                            markAsPaid(row.payment_id, row.payment_date, row.expense);
                                        });
                                    }

                                    let editBtn = new EditButton({
                                        target: document.querySelector(`#action-col-${row.payment_id}`),
                                        intro: true,
                                        props: {
                                            disabled:
                                                !row.sport_association ||
                                                !canPerformAction('bookeeping.payments.update'),
                                            hidden: !row.sport_association,
                                        },
                                    });

                                    editBtn.$on('open', data => {
                                        let editModal = new AddEditModal({
                                            target: document.querySelector(`#portal-elements`),
                                            props: {
                                                show: true,
                                                data: {...row},
                                                edit: true,
                                            },
                                        });

                                        editModal.$on('update', e => {
                                            let drawer = new PaymentDrawer({
                                                target: document.querySelector(`#portal-elements`),
                                                props: {
                                                    data: e.detail?.payment,
                                                    title: 'Dettagli Pagamento',
                                                    isOpen: true,
                                                },
                                            });

                                            drawer.$on('close', () => {
                                                datatable?.reload();
                                            });
                                        });
                                    });
                                    let deleteBtn = new DeleteButton({
                                        target: document.querySelector(`#action-col-${row.payment_id}`),
                                        intro: true,
                                        props: {
                                            disabled: !canPerformAction('bookeeping.payments.delete'), //row.invoice,
                                        },
                                    });

                                    deleteBtn.$on('open', data => {
                                        swal.fire({
                                            title: 'Vuoi eliminare il pagamento?',
                                            text: "Sarà annullata l'eventuale ricevuta associata.",
                                            target: document.querySelector(`#portal-elements-foreground`),
                                            icon: 'warning',
                                            buttonsStyling: true,
                                            showCancelButton: true,
                                            cancelButtonText: 'Annulla',
                                            confirmButtonText: 'Elimina',
                                            reverseButtons: true,
                                            confirmButtonColor: '#d63030',
                                        }).then(async function (result) {
                                            if (result.isConfirmed) {
                                                KTApp.blockPage({
                                                    overlayColor: '#000000',
                                                    state: 'primary',
                                                    message: 'Eliminazione in corso...',
                                                });

                                                const response = await apiFetch(
                                                    replaceUID(__bakney.env.API.PAYMENT.DELETE, row.payment_id),
                                                    {
                                                        method: 'DELETE',
                                                    }
                                                );

                                                KTApp.unblockPage();

                                                if (!response.error) {
                                                    datatable?.reload();
                                                    toast.success('Pagamento eliminato!');
                                                } else {
                                                    toast.error('Qualcosa è andato storto.');
                                                }
                                            }
                                        });
                                    });
                                });
                                return `<div id="action-col-${row.payment_id}" class="action-column pr-4"></div>`;
                            },
                        },
                    ]}
                    clicked={(td, obj) => {
                        let basicDrawer = new PaymentDrawer({
                            target: document.querySelector(`#portal-elements-foreground`),
                            intro: true, // This enables the mount animation
                            props: {
                                data: obj,
                                title: 'Dettagli Pagamento',
                            },
                        });
                        basicDrawer.$on('close', () => {
                            datatable.reload();
                        });
                    }}
                    mapFunction={raw => {
                        if (typeof raw.data !== 'undefined') {
                            return raw.data;
                        }
                        return [];
                    }}
                    params={{
                        associate_id: associateId,
                    }}
                    serverPaging={true}
                    serverFiltering={true}
                    showSearch={false}
                    serverSorting={true}>
                    <div slot="search-header">
                        <div
                            class="col-12 col-md-auto p-0 m-0 d-flex flex-column flex-md-row align-items-center justify-content-start">
                            <div class="col-md-4 col-12 my-2 my-md-0 p-0 px-md-2">
                                <div class="input-icon d-flex">
                                    <input
                                        type="text"
                                        bind:value={$personasPaymentListFilter.generalSearch}
                                        on:keyup={debounce(() => {
                                            datatable?.setDataSourceParams($personasPaymentListFilterDatatable);
                                        }, 300)}
                                        class="form-control form-control-solid mb-0 {$personasPaymentListFilter.generalSearch !=
                                        ''
                                            ? 'border border-secondary border-2 bg-light'
                                            : 'border border-secondary border-dashed bg-white'}"
                                        placeholder="Cerca..."
                                        id="kt_datatable_search_query" />
                                    <span>
                                        <i class="flaticon2-search-1 text-muted" />
                                    </span>

                                    <button
                                        style="position: absolute;right:0;"
                                        class="btn btn-icon btn-ghost mb-0"
                                        class:d-none={$personasPaymentListFilter.generalSearch == ''}
                                        on:click={() => {
                                            $personasPaymentListFilter.generalSearch = '';
                                            datatable?.setDataSourceParams($personasPaymentListFilterDatatable);
                                        }}>
                                        <XCircleIcon size={19} weight="duotone" />
                                    </button>
                                </div>
                            </div>
                            <div class="my-1 my-md-0 mr-2">
                                <SmartSelect
                                    customClasses={'m-0 p-0 filter-select min-w-5'}
                                    selectClasses={$personasPaymentListFilter.paid != ''
                                        ? 'query-filter-select border border-secondary border-2 bg-light'
                                        : 'query-filter-select border border-secondary border-dashed bg-white'}
                                    editable={false}
                                    active={false}
                                    on:change={() => {
                                        datatable?.setDataSourceParams($personasPaymentListFilterDatatable);
                                    }}
                                    bind:value={$personasPaymentListFilter.paid}
                                    props={{
                                        id: 'kt_datatable_search_paid',
                                        name: 'paid',
                                        label: null,
                                        placeholder: 'Stato',
                                        required: true,
                                        clearable: false,
                                        showChevron: true,
                                        options: [
                                            {label: 'Stato', value: ''},
                                            {label: 'Pagato', value: 'true'},
                                            {label: 'In attesa', value: 'false'},
                                        ],
                                        value: $personasPaymentListFilter.paid,
                                    }} />
                            </div>
                            <div class="my-1 my-md-0 mr-2">
                                <SmartSelect
                                    customClasses={'m-0 p-0 filter-select min-w-7'}
                                    selectClasses={$personasPaymentListFilter.type != ''
                                        ? 'query-filter-select border border-secondary border-2 bg-light'
                                        : 'query-filter-select border border-secondary border-dashed bg-white'}
                                    editable={false}
                                    active={false}
                                    on:change={() => {
                                        datatable?.setDataSourceParams($personasPaymentListFilterDatatable);
                                    }}
                                    bind:value={$personasPaymentListFilter.type}
                                    props={{
                                        id: 'kt_datatable_search_type',
                                        name: 'type',
                                        label: null,
                                        placeholder: 'Metodo',
                                        required: true,
                                        clearable: false,
                                        showChevron: true,
                                        options: [
                                            {label: 'Metodo', value: ''},
                                            ...Array.from(paymentTypesMap || []).map(type => ({
                                                label: type.value,
                                                value: type.key,
                                            })),
                                        ],
                                        value: $personasPaymentListFilter.type,
                                    }} />
                            </div>
                            <div class="my-1 my-md-0 mr-2">
                                <SmartSelect
                                    customClasses={'m-0 p-0 filter-select min-w-5'}
                                    selectClasses={$personasPaymentListFilter.expense != ''
                                        ? 'query-filter-select border border-secondary border-2 bg-light'
                                        : 'query-filter-select border border-secondary border-dashed bg-white'}
                                    editable={false}
                                    active={false}
                                    on:change={() => {
                                        datatable?.setDataSourceParams($personasPaymentListFilterDatatable);
                                    }}
                                    bind:value={$personasPaymentListFilter.expense}
                                    props={{
                                        id: 'kt_datatable_search_expense',
                                        name: 'expense',
                                        label: null,
                                        placeholder: 'Tipo',
                                        required: true,
                                        clearable: false,
                                        showChevron: true,
                                        options: [
                                            {label: 'Tipo', value: ''},
                                            {label: 'Uscite', value: 'true'},
                                            {label: 'Entrate', value: 'false'},
                                        ],
                                        value: $personasPaymentListFilter.expense,
                                    }} />
                            </div>
                            <SmartSelect
                                customClasses={'m-0 p-0 filter-select min-w-5'}
                                selectClasses={$personasPaymentListFilter.subject != ''
                                    ? 'query-filter-select border border-secondary border-2 bg-light'
                                    : 'query-filter-select border border-secondary border-dashed bg-white'}
                                editable={false}
                                active={false}
                                on:change={() => {
                                    datatable?.setDataSourceParams($personasPaymentListFilterDatatable);
                                }}
                                bind:value={$personasPaymentListFilter.subject}
                                props={{
                                    id: 'kt_datatable_search_subject',
                                    name: 'subject',
                                    label: null,
                                    placeholder: 'Attività',
                                    required: true,
                                    clearable: false,
                                    showChevron: true,
                                    options: [
                                        {label: 'Attività', value: ''},
                                        ...Array.from(paymentSubjectsMap || []).map(subject => ({
                                            label: subject.value,
                                            value: subject.key,
                                        })),
                                    ],
                                    value: $personasPaymentListFilter.subject,
                                }} />
                        </div>
                    </div>
                    <div slot="multiactions">
                        {#if visibleMultiaction}
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <!-- svelte-ignore a11y-no-static-element-interactions -->
                            <div
                                in:slide={{duration: 100}}
                                class="d-flex align-items-center mb-5 mx-2"
                                id="kt_datatable_personas_multiactions">
                                <div class="d-flex align-items-center">
                                    <div class="font-weight-boldest mr-3 font-size-sm text-dark-65">
                                        {selectedCounter} selezionati
                                    </div>
                                </div>
                                <button
                                    on:click={requestPaymentsSelected}
                                    class="btn btn-sm py-1 px-3 btn-primary font-weight-bolder ml-2"
                                    style="margin:0;"
                                    data-toggle="tooltip"
                                    data-placement="top"
                                    title="Sollecita i pagamenti selezionati">
                                    <PaperPlaneTilt size={16} weight="bold" class="mr-1" />
                                    Sollecita</button>
                                <!-- svelte-ignore a11y-click-events-have-key-events -->
                                <button
                                    on:click={deletePaymentsSelected}
                                    class="btn btn-sm py-1 px-3 btn-light-danger font-weight-bolder ml-2"
                                    style="margin:0;">
                                    <TrashSimple size={16} weight="bold" class="mr-1" />
                                    <span class="d-none d-md-inline font-weight-boldest">Elimina</span>
                                </button>
                            </div>
                        {/if}
                    </div>
                </KtDatatable>
            </div>
        </div>
    </div>
</div>
