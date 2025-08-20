<script>
    import {sessionToken, userData} from 'store/stores.js';
    import {scale} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import {onDestroy, onMount} from 'svelte';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import {canPerformAction} from 'utils/Permissions.js';
    import {PaperPlaneTilt, PlusCircle, TrashSimple, X, XCircle} from 'phosphor-svelte';
    import {waitForElementAndExecute} from 'utils/Functions';
    import DocumentButton from 'components/buttons/DocumentButton.svelte';
    import ApproveButton from 'components/buttons/ApproveButton.svelte';
    import EditButton from 'components/buttons/EditButton.svelte';
    import DeleteButton from 'components/buttons/DeleteButton.svelte';
    import InvoicePreviewModal from 'components/modals/InvoicePreviewModal.svelte';
    import XCircleBtn from 'components/buttons/XCircle.svelte';
    import {toast} from 'svelte-sonner';
    import AddEditModal from 'routes/accounting/payment/modals/AddEditModal.svelte';
    import PaymentDrawer from 'routes/accounting/payment/PaymentDrawer.svelte';
    sessionToken.useLocalStorage();
    userData.useLocalStorage();

    export let uuid = Math.random().toString(36).substring(7);
    export let layoutOptions = {
        scroll: true,
        footer: false,
    };
    export let info = {};
    export let payments = {};
    export let searchKey = '';
    let options;

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
            key: 0,
            value: 'Altro',
        },
        {
            key: 1,
            value: 'Iscrizione',
        },
        {
            key: 2,
            value: 'Corso',
        },
        {
            key: 3,
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

    let categories = [];
    let selectedCounter = 0;
    let datatable;

    export let ktdatable;

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
            showConfirmButton: false,
            showCancelButton: false,
            didOpen: () => {
                let records = jQuery('#kt_datatable_payments_' + uuid).KTDatatable('getSelectedRecords').dataSet;
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
                        jQuery('#kt_datatable_group_action_form_' + uuid).collapse('hide');
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
            buttonsStyling: true,
            showCancelButton: true,
            cancelButtonText: 'Annulla',
            confirmButtonText: 'Elimina',
            reverseButtons: true,
        }).then(async function (result) {
            if (result.isConfirmed) {
                let records = jQuery('#kt_datatable_payments_' + uuid).KTDatatable('getSelectedRecords').dataSet;
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
                jQuery('#kt_datatable_group_action_form_' + uuid).collapse('hide');
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
                                    ktdatable.reload();
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

    ktdatable = (function () {
        // Private functions
        let url = replaceUID(__bakney.env.API.SUBSCRIPTION.PAYMENTS, uuid);
        options = {
            // datasource definition
            data: {
                responsive: true,
                type: 'remote',
                source: {
                    read: {
                        url: url,
                        method: 'GET',
                        params: {
                            // API params
                            query: {
                                generalSearch: searchKey,
                            },
                        },
                        headers: {
                            Authorization: 'Bearer ' + $sessionToken,
                        },
                        map: function (raw) {
                            // sample data mapping
                            var dataSet = raw;
                            if (typeof raw.data !== 'undefined') {
                                dataSet = raw.data;
                            }
                            return dataSet;
                        },
                    },
                },
                pageSize: 10,
                serverPaging: true,
                serverFiltering: true,
                serverSorting: true,
                autoColumns: false, // autocols
            },

            // layout definition
            layout: layoutOptions,

            toolbar: {
                items: {
                    pagination: {
                        pageSizeSelect: [10, 20, 30, 50],
                    },
                },
            },

            // column sorting
            sortable: true,

            pagination: true,

            search: {
                input: jQuery(`#kt_datatable_search_query_${uuid}`),
                //onEnter: true,
                key: 'generalSearch',
            },

            // columns definition

            columns: [
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
                    sortable: false,
                    template: function (row) {
                        let categoryDescription = null;
                        if (row.subject == 0 && row.payment_category && !row.description) {
                            categoryDescription =
                                categories?.find(category => category.payment_category_id == row.payment_category)
                                    ?.name || '';
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
                    width: info.archived ? 0 : 140,
                    minWidth: '100%',
                    template: function (row) {
                        if (info.archived) return '';
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
                                                    ktdatable.reload();
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
                                    disabled: !row.sport_association || !canPerformAction('bookeeping.payments.update'),
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
                                        ktdatable.reload();
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
                                    icon: 'warning',
                                    target: document.querySelector(`#portal-elements-foreground`),
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
                                            ktdatable.reload();
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
            ],

            rows: {
                clicked: function (td, obj) {
                    let basicDrawer = new PaymentDrawer({
                        target: document.querySelector(`#portal-elements`),
                        intro: true, // This enables the mount animation
                        props: {
                            data: obj,
                            title: 'Dettagli Pagamento',
                        },
                    });

                    basicDrawer.$on('close', () => {
                        ktdatable.reload();
                    });
                },
            },
        };

        // basic demo
        var localSelectorDemo = function () {
            // enable extension
            options.extensions = {
                // boolean or object (extension options)
                checkbox: true,
            };

            options.search = {
                input: jQuery(`#kt_datatable_search_query_${uuid}`),
                //onEnter: true,
                key: 'generalSearch',
            };

            datatable = jQuery(`#kt_datatable_payments_${uuid}`).KTDatatable(options);

            jQuery(`#kt_datatable_search_status_${uuid}`).on('change', function () {
                datatable.search(jQuery(this).val().toLowerCase(), 'paid');
            });

            jQuery(`#kt_datatable_search_status`).selectpicker();

            // filter expense
            jQuery('#kt_datatable_search_expense_' + uuid).on('change', function () {
                datatable.search(jQuery(this).val().toLowerCase(), 'expense');
            });
            jQuery('#kt_datatable_search_expense').selectpicker();

            // filter subject
            jQuery('#kt_datatable_search_subject_' + uuid).on('change', function () {
                datatable.search(jQuery(this).val().toLowerCase(), 'subject');
            });
            jQuery('#kt_datatable_search_subject').selectpicker();

            // filter type (payment method)
            jQuery('#kt_datatable_search_type_' + uuid).on('change', function () {
                datatable.search(jQuery(this).val().toLowerCase(), 'type');
            });
            jQuery('#kt_datatable_search_type').selectpicker();

            datatable.on('datatable-on-check datatable-on-uncheck', function (e) {
                var checkedNodes = datatable.rows('.datatable-row-active').nodes();
                var count = checkedNodes.length;
                selectedCounter = count;
                jQuery('#kt_datatable_selected_records_' + uuid).html(count);
                if (count > 0) {
                    jQuery('#kt_datatable_group_action_form_' + uuid).collapse('show');
                } else {
                    jQuery('#kt_datatable_group_action_form_' + uuid).collapse('hide');
                }
            });

            jQuery('#kt_datatable_fetch_modal')
                .on('show.bs.modal', function (e) {
                    var ids = datatable
                        .rows('.datatable-row-active')
                        .nodes()
                        .find('.checkbox > [type="checkbox"]')
                        .map(function (i, chk) {
                            return jQuery(chk).val();
                        });
                    var c = document.createDocumentFragment();
                    for (var i = 0; i < ids.length; i++) {
                        var li = document.createElement('li');
                        li.setAttribute('data-id', ids[i]);
                        li.innerHTML = 'Selected record ID: ' + ids[i];
                        c.appendChild(li);
                    }
                    jQuery('#kt_datatable_fetch_display').append(c);
                })
                .on('hide.bs.modal', function (e) {
                    jQuery('#kt_datatable_fetch_display').empty();
                });
        };

        return {
            // public functions
            init: function (datasource) {
                // if (datasource) options.data.source = datasource;
                localSelectorDemo();
                //serverSelectorDemo();
            },
            destroy: function () {
                jQuery(`#kt_datatable_payments_${uuid}`).KTDatatable('destroy');
            },
            reload: function (key = '') {
                jQuery(`#kt_datatable_payments_${uuid}`).KTDatatable('reload');
            },
        };
    })();

    async function fetchCategories() {
        let res = await apiFetch(__bakney.env.API.PAYMENT.CATEGORY.LIST);

        if (!res.error) categories = res.response.data || [];
        else if (res.status != 403 && res.status != 401) toast.error('Qualcosa è andato storto.');
    }

    function resetFilters(update = true) {
        document.getElementById('kt_datatable_search_query_' + uuid).value = '';

        document.getElementById('kt_datatable_search_status_' + uuid).value = '';
        jQuery('#kt_datatable_search_status_' + uuid).selectpicker('render');

        document.getElementById('kt_datatable_search_expense_' + uuid).value = '';
        jQuery('#kt_datatable_search_expense_' + uuid).selectpicker('render');

        document.getElementById('kt_datatable_search_subject_' + uuid).value = '';
        jQuery('#kt_datatable_search_subject_' + uuid).selectpicker('render');

        document.getElementById('kt_datatable_search_type_' + uuid).value = '';
        jQuery('#kt_datatable_search_type_' + uuid).selectpicker('render');

        if (update) {
            document.getElementById('kt_datatable_search_query_' + uuid).dispatchEvent(new Event('keyup'));
            ktdatable.destroy();
            ktdatable.init();
            // initTable();
        }
    }

    onMount(async () => {
        await fetchCategories();

        if (canPerformAction('bookeeping.payments.read')) ktdatable.init(payments);
        jQuery('body').tooltip({selector: '[data-toggle=tooltip]', trigger: 'hover'});

        if (searchKey && searchKey != 'payments') {
            document.getElementById('kt_datatable_search_query_' + uuid).value = searchKey;
            document.getElementById('kt_datatable_search_query_' + uuid).dispatchEvent(new Event('keyup'));
        }
        // stop scroll of body
        //document.body.style.overflow = 'hidden';
    });

    onDestroy(() => {
        document.querySelectorAll('.popover').forEach(popover => popover.remove());
        document.querySelectorAll('.tooltip').forEach(popover => popover.remove());
        searchKey = '';
        //document.body.style.overflow = 'auto';
    });
</script>

<!--begin::Entry-->
<div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}}>
    <div class="row mt-2">
        <div class="col-10">
            <h3 class="card-label font-size-h2">
                Pagamenti
                <span class="d-block text-muted pt-2 font-size-sm">Storico dei pagamenti dell'iscrizione.</span>
            </h3>
        </div>
        <div class="col-2 d-flex justify-content-end px-0">
            {#if !info.archived && canPerformAction('bookeeping.payments.create')}
                <button
                    on:click={() => {
                        // perform tasks

                        let addModal = new AddEditModal({
                            target: document.querySelector(`#portal-elements-foreground`),
                            props: {
                                show: true,
                                editableComplexItem: false,
                                data: {
                                    type: 'cash',
                                    expense: false,
                                    associate: {
                                        associate_id: info.associate.associate_id,
                                    },
                                    subscription_id: info.subscription_id,
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
                                ktdatable.reload();
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
            <div class="mb-2 px-0 mx-0">
                <div class="row align-items-center px-4">
                    <div class="col-12">
                        <div class="row align-items-center">
                            <div class="my-1 my-md-0 mr-2 d-flex">
                                <div class="input-icon d-flex">
                                    <input
                                        type="text"
                                        class="form-control form-control-solid mb-0"
                                        style="max-width: 28rem;width: 28rem"
                                        placeholder="Cerca..."
                                        id="kt_datatable_search_query_{uuid}" />
                                    <span>
                                        <i class="flaticon2-search-1 text-muted" />
                                    </span>
                                    <button
                                        style="position: absolute;right:0;"
                                        class="btn btn-icon btn-ghost mb-0"
                                        on:click={() => {
                                            // clear search input
                                            document.getElementById('kt_datatable_search_query_' + uuid).value = '';
                                            setTimeout(() => {
                                                document
                                                    .getElementById('kt_datatable_search_query_' + uuid)
                                                    .dispatchEvent(new Event('keyup'));
                                            }, 200);
                                        }}>
                                        <XCircle size={19} weight="duotone" />
                                    </button>
                                </div>
                            </div>
                            <div class="my-1 my-md-0 mr-2">
                                <div class="d-flex align-items-center">
                                    <!-- svelte-ignore a11y-label-has-associated-control -->
                                    <select
                                        class="form-control form-control-solid mb-0"
                                        id="kt_datatable_search_status_{uuid}">
                                        <option value="">Stato</option>
                                        <option value="true">Pagato</option>
                                        <option value="false">In attesa</option>
                                    </select>
                                </div>
                            </div>
                            <div class="my-1 my-md-0 mr-2">
                                <div class="d-flex align-items-center">
                                    <select
                                        class="form-control form-control-solid mb-0"
                                        id="kt_datatable_search_type_{uuid}">
                                        <option value="">Metodo</option>
                                        {#each Array.from(paymentTypesMap || []) as type}
                                            <option value={type.key}>
                                                {type.value}
                                            </option>
                                        {/each}
                                    </select>
                                </div>
                            </div>
                            <div class="my-1 my-md-0 mr-2">
                                <div class="d-flex align-items-center">
                                    <select
                                        class="form-control form-control-solid mb-0"
                                        id="kt_datatable_search_expense_{uuid}">
                                        <option value="">Tipo</option>
                                        <option value="true">Uscite</option>
                                        <option value="false">Entrate</option>
                                    </select>
                                </div>
                            </div>
                            <div class="my-1 my-md-0 mr-2">
                                <div class="d-flex align-items-center">
                                    <select
                                        class="form-control form-control-solid mb-0"
                                        id="kt_datatable_search_subject_{uuid}">
                                        <option value="">Attività</option>
                                        {#each Array.from(paymentSubjectsMap || []) as subject}
                                            <option value={subject.key}>
                                                {subject.value}
                                            </option>
                                        {/each}
                                    </select>
                                </div>
                            </div>
                            <div class="my-1 my-md-0 ml-auto">
                                <!-- svelte-ignore a11y-click-events-have-key-events -->
                                <!-- svelte-ignore a11y-missing-attribute -->
                                <!-- svelte-ignore a11y-no-static-element-interactions -->
                                <a
                                    on:click|preventDefault={resetFilters}
                                    class=" btn font-weight-bolder mb-0 cursor-pointer text-primary btn-clean btn-icon">
                                    <X size={18} weight="bold" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="mt-10 mb-5 collapse" id="kt_datatable_group_action_form_{uuid}">
                <div class="d-flex align-items-center">
                    <div class="font-weight-bold mr-3" style="font-size:1.1rem;">
                        <span id="kt_datatable_selected_records_{uuid}">0</span> selezionati
                    </div>
                    <div class="dropdown mr-2">
                        <button
                            on:click={requestPaymentsSelected}
                            class="btn btn-sm btn-primary font-weight-bolder m-0 ml-2 p-2 d-flex align-items-center"
                            type="button"
                            data-toggle="tooltip"
                            data-placement="top"
                            title="Sollecita i pagamenti selezionati"
                            id="kt_datatable_ask_selected">
                            <PaperPlaneTilt size="17" weight="duotone" class="mr-1" />
                            Sollecita</button>
                    </div>
                    <div class="dropdown mr-2">
                        <button
                            on:click={deletePaymentsSelected}
                            class="btn btn-sm btn-light-primary font-weight-bolder m-0 ml-2 p-2 d-flex align-items-center"
                            type="button"
                            data-toggle="tooltip"
                            data-placement="top"
                            title="Elimina i pagamenti selezionati se non sono stati ancora approvati"
                            id="kt_datatable_delete_selected">
                            <TrashSimple size="17" weight="duotone" class="mr-1" />
                            Elimina</button>
                    </div>
                </div>
            </div>
            <!--begin: Datatable-->
            <div class="datatable datatable-bordered datatable-head-custom" id="kt_datatable_payments_{uuid}" />
            <!--end: Datatable-->
        </div>
    </div>
</div>

<svelte:head>
    <style>
        .svelte-select {
            font-size: 13px !important;
            padding-left: 1rem !important;
            border: 0 !important;
            background: #f4f6f9 !important;
            font-size: 13px !important;
            color: #000 !important;
        }
        .svelte-select input:focus {
            border: 0 !important;
            outline: 0 !important;
        }
        .svelte-select input {
            font-size: 13px !important;
            color: #000 !important;
        }
        .svelte-select .selected-item {
            font-size: 13px !important;
        }
    </style>
</svelte:head>
