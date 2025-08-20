<script>
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware.js';
    import {sessionToken, permissions} from 'store/stores.js';
    import {scale} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import DeleteButton from 'components/buttons/DeleteButton.svelte';
    import {PlusCircle, Smiley} from 'phosphor-svelte';
    import {onMount} from 'svelte';
    import {getDataFromForm, waitForElementAndExecute} from 'utils/Functions';
    import {writable} from 'svelte/store';
    import InvoiceForm from 'components/invoice/InvoiceForm.svelte';
    import Portal from 'svelte-portal';
    import DocumentButton from 'components/buttons/DocumentButton.svelte';
    import DocumentPreviewModal from 'components/modals/DocumentPreviewModal.svelte';
    import {canPerformAction} from 'utils/Permissions.js';
    import {toast} from 'svelte-sonner';

    sessionToken.useLocalStorage();
    permissions.useLocalStorage();

    let showAddModal = false;
    let customersInvoiceForm;
    let customers = [];
    let customers_store = writable(customers);
    let stats = writable({});
    let accounts_available = false;
    let accounts = [];
    let datatable;
    let lines = [];
    let payment_total_amount;
    let KTDatatableCustomersInvoices = (function () {
        // Private functions

        var options = {
            // datasource definition
            data: {
                responsive: true,
                type: 'remote',
                source: {
                    read: {
                        url: __bakney.env.HOST + '/invoice-customers/list',
                        method: 'GET',
                        params: {
                            // API params
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
                serverPaging: false,
                serverFiltering: false,
                serverSorting: false,
                autoColumns: false, // autocols
            },

            // layout definition
            layout: {
                scroll: true, // enable/disable datatable scroll both horizontal and
                footer: false, // display/hide footer
            },

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
                input: jQuery('#kt_datatable_search_query'),
                //onEnter: true,
                key: 'generalSearch',
            },

            // columns definition

            columns: [
                {
                    field: 'invoice_identifier',
                    title: 'Identificativo',
                    width: 120,
                    sortable: false,
                    responsive: {
                        visible: 'xl',
                        hidden: 'md',
                    },
                    maxWidth: '100%',
                    template: function (row) {
                        return (
                            "<span style='font-weight:700;'>" +
                            row.prefix +
                            ' ' +
                            row.number +
                            '/' +
                            row.fiscal_year +
                            '</span>'
                        );
                    },
                },
                {
                    field: 'payment_total_amount',
                    title: 'Importo',
                    width: 80,
                    sortable: false,
                    autoHide: false,
                    maxWidth: '100%',
                    template: function (row) {
                        let amount =
                            "<span style='font-weight:700;'>€ " +
                            parseFloat(row.payment_total_amount)
                                .toFixed(2)
                                .replace(',', '-')
                                .replace('.', ',')
                                .replace('-', '.') +
                            '</span>';
                        return amount;
                    },
                },
                {
                    field: 'transferor_denomination',
                    title: 'Cliente',
                    width: 150,
                    sortable: false,
                    autoHide: false,
                    maxWidth: '100%',
                    template: function (row) {
                        if (!row.transferor_denomination) return '<span>-</span>';
                        return '<span>' + row.transferor_denomination || '-' + '</span>';
                    },
                },
                {
                    field: 'payment_expiry_date',
                    title: 'Scade il',
                    width: 90,
                    type: 'date',
                    responsive: {
                        visible: 'xl',
                        hidden: 'lg',
                    },
                    sortCallback: function (data, sort, column) {
                        let dataArray = Object.values(data);
                        dataArray.sort(function (a, b) {
                            let timeA = new Date(a['expire_date']).getTime();
                            let timeB = new Date(b['expire_date']).getTime();
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
                        return moment(new Date(row.payment_expiry_date)).format('DD/MM/YYYY');
                    },
                },
                {
                    field: '',
                    title: '',
                    width: 100,
                    sortable: false,
                    overflow: 'visible',
                    textAlign: 'right',
                    autoHide: false,
                    minWidth: '100%',
                    template: function (row) {
                        let pdfLink =
                            __bakney.env.HOST +
                            '/document/retrieve/' +
                            row.pdf +
                            '?download=false&token=' +
                            row.pdf_token;
                        waitForElementAndExecute(`#action-col-${row.customer_invoice_id}`, () => {
                            if (document.querySelector(`#action-col-${row.customer_invoice_id}`))
                                document.querySelector(`#action-col-${row.customer_invoice_id}`).innerHTML = '';

                            // let editBtn = new EditButton({
                            //     target: document.querySelector(`#action-col-${row.customer_invoice_id}`),
                            //     intro: true,
                            //     props: {
                            //         disabled: false,
                            //         hidden: false,
                            //     },
                            // });

                            // let editModal = new EditModal({
                            //     target: document.querySelector(`#action-col-${row.customer_invoice_id}`),
                            //     intro: true,
                            //     props: {
                            //         id: row.customer_invoice_id,
                            //         row: row,
                            //         ktdatable: KTDatatableCustomersInvoices,
                            //         customers: $customers_store,
                            //     },
                            // });

                            // editBtn.$on('open', data => {
                            //     jQuery(`#editModal-${row.customer_invoice_id}`).modal('show');
                            // });

                            let pdfDocumentButton = new DocumentButton({
                                target: document.querySelector(`#action-col-${row.customer_invoice_id}`),
                                intro: true,
                                props: {
                                    disabled: row.pdf == null,
                                    popover_text: 'Scarica Fattura',
                                    type: 'pdf',
                                },
                            });

                            pdfDocumentButton.$on('open', data => {
                                let filePreview = new DocumentPreviewModal({
                                    target: document.querySelector(`#action-col-${row.customer_invoice_id}`),
                                    intro: true,
                                    props: {
                                        pdfLink: pdfLink,
                                        id: row.customer_invoice_id,
                                        title: `Fattura ${row.prefix} ${row.number}/${row.fiscal_year}`,
                                    },
                                });
                            });

                            let documentButton = new DocumentButton({
                                target: document.querySelector(`#action-col-${row.customer_invoice_id}`),
                                intro: true,
                                props: {
                                    disabled: row.xml == null,
                                    popover_text: 'Scarica Fattura',
                                },
                            });

                            documentButton.$on('open', data => {
                                // transform row.xml in base64
                                let xml = window.Base64.encode(row.xml);
                                window.downloadFile(
                                    `Fattura ${row.prefix}${row.number}/${row.fiscal_year}.xml`,
                                    xml,
                                    'text/xml'
                                );
                            });

                            let deleteBtn = new DeleteButton({
                                target: document.querySelector(`#action-col-${row.customer_invoice_id}`),
                                intro: true,
                                props: {
                                    disabled: !canPerformAction('bookeeping.documents.clientinvoices.delete'),
                                    popover_text: 'Elimina Fattura',
                                },
                            });

                            deleteBtn.$on('open', data => {
                                swal.fire({
                                    text: 'Vuoi eliminare la fattura?',
                                    icon: 'warning',
                                    buttonsStyling: true,
                                    showCancelButton: true,
                                    cancelButtonText: 'Annulla',
                                    confirmButtonText: 'Elimina',
                                    reverseButtons: true,
                                    confirmButtonColor: '#d63030',
                                }).then(async function (result) {
                                    if (result.isConfirmed) {
                                        deleteInvoice(row.customer_invoice_id);
                                    }
                                });
                            });
                        });
                        return `<div id="action-col-${row.customer_invoice_id}" class="action-column pr-4"></div>`;
                    },
                },
            ],
        };

        // basic demo
        var localSelectorDemo = function () {
            // enable extension
            options.extensions = {
                // boolean or object (extension options)
                checkbox: true,
            };

            options.search = {
                input: jQuery('#kt_datatable_search_query'),
                //onEnter: true,
                key: 'generalSearch',
            };

            datatable = jQuery('#kt_datatable').KTDatatable(options);

            jQuery('#kt_datatable_search_status').on('change', function () {
                datatable.search(jQuery(this).val().toLowerCase(), 'paid');
            });

            jQuery('#kt_datatable_search_status').selectpicker();

            datatable.on('datatable-on-check datatable-on-uncheck', function (e) {
                var checkedNodes = datatable.rows('.datatable-row-active').nodes();
                var count = checkedNodes.length;
                jQuery('#kt_datatable_selected_records').html(count);
                if (count > 0) {
                    jQuery('#kt_datatable_group_action_form').collapse('show');
                } else {
                    jQuery('#kt_datatable_group_action_form').collapse('hide');
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
            init: function () {
                localSelectorDemo();
                //serverSelectorDemo();
            },
            reload: function () {
                datatable.reload();
            },
        };
    })();

    async function fetchStats() {
        $stats = (await apiFetch(__bakney.env.API.INVOICE_CUSTOMERS.STATS)).response;
    }

    function exportCSV() {
        apiFetch(__bakney.env.API.INVOICE_CUSTOMERS.EXPORT).then(res => {
            window.downloadCSV(res.response.data.filename, res.response.data.file);
        });
    }

    function exportXLSX() {
        // for older office .xsl the mime is "application/vnd.ms-excel"
        apiFetch(`${__bakney.env.API.INVOICE_CUSTOMERS.EXPORT}?m=xlsx`).then(res => {
            window.downloadFile(
                res.response.data.filename,
                res.response.data.file,
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
        });
    }

    function deleteInvoice(id) {
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Eliminazione in corso...',
        });

        const url = replaceUID(__bakney.env.API.INVOICE_CUSTOMERS.DELETE, id);

        apiFetch(url, {method: 'DELETE'})
            .then(() => {
                toast.success('Eliminazione avvenuta con Successo.');
                KTDatatableCustomersInvoices.reload();
                jQuery('body').tooltip({selector: '[data-toggle=tooltip]', trigger: 'hover'});
            })
            .catch(response => {
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
            })
            .finally(() => {
                KTApp.unblockPage();
            });
    }

    async function create(data) {
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Creazione...',
        });

        // // add to payment_date the current time if the date is today in UTC via "%Y-%m-%dT%H:%M:%S.%fZ"
        // if (moment(data.payment_date).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
        //     data.payment_date = moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ');
        // } else {
        //     data.payment_date = moment(data.payment_date).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
        // }

        // if (moment(data.expire_date).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
        //     data.expire_date = moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ');
        // } else {
        //     data.expire_date = moment(data.expire_date).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
        // }

        // data.paid = JSON.parse(data.paid).value || false;
        // data.amount = parseFloat(data.amount.replace(',', '.'));
        // data.supplier_id = JSON.parse(data.supplier).value;
        // delete data.supplier;

        const url = __bakney.env.API.INVOICE_CUSTOMERS.ADD;

        data.lines = lines;
        data.payment_total_amount = payment_total_amount;

        const res = await apiFetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        // spinner stop
        KTApp.unblockPage();

        if (res.status == 200 || res.status == 201) {
            KTDatatableCustomersInvoices.reload();
            showAddModal = false;
            setTimeout(() => {
                document.getElementById('invoice_form').reset();
                showAddModal = true;
                setTimeout(() => {
                    initializeAddModalComponents();
                }, 200);
            }, 200);

            toast.success('Creato con successo.');
        } else {
            swal.fire({
                text: 'Scusa, ho individuato degli errori, riprova.',
                icon: 'error',
                buttonsStyling: false,
                confirmButtonText: 'Ok, capito!',
                customClass: {
                    confirmButton: 'btn font-weight-bold btn-light-primary',
                },
            }).then(function () {
                KTUtil.scrollTop();
            });
        }
    }

    function initForm() {
        customersInvoiceForm?.destroy();
        customersInvoiceForm = FormValidation.formValidation(document.getElementById('invoice_form'), {
            fields: {},
            plugins: {
                trigger: new FormValidation.plugins.Trigger(),
                bootstrap: new FormValidation.plugins.Bootstrap(),
                // submitButton: new FormValidation.plugins.SubmitButton(),
            },
        });
    }

    function handleValidation(e) {
        if (!customersInvoiceForm) initForm();
        customersInvoiceForm?.validate().then(function (status) {
            if (status === 'Valid') {
                create(getDataFromForm(e));
                jQuery('#addInvoiceModal').modal('hide');
                fetchStats();
            } else {
                swal.fire({
                    text: 'Per favore, inserisci tutti i dati e riprova.',
                    icon: 'error',
                    buttonsStyling: false,
                    confirmButtonText: 'Ok, capito!',
                    customClass: {
                        confirmButton: 'btn font-weight-bold btn-light-primary',
                    },
                }).then(function () {
                    KTUtil.scrollTop();
                });
            }
        });
    }

    async function fetchCustomAccounts() {
        const res = await apiFetch(__bakney.env.API.BALANCE_SHEET_ACCOUNTS.LIST, {
            method: 'GET',
        });
        if (!res.error) {
            accounts = Array.from(res?.response?.data || []);
            accounts_available = true;
        } else {
            if (res.status != 403 && res.status != 401) toast.error('Qualcosa è andato storto.');
        }
        setTimeout(() => {
            jQuery('#custom_accounts').selectpicker();
        }, 200);
        return;
    }

    onMount(async () => {
        fetchStats();
        // await fetchCustomAccounts();
        // let res = await apiFetch(__bakney.env.API.SUPPLIER.LIST);
        // if (res.status == 200) {
        //     customers = res.response.data.map(supplier => {
        //         return {
        //             value: supplier.supplier_id,
        //             data: supplier,
        //             label: `${supplier.name} (${supplier.tax_code})`,
        //         };
        //     });
        //     $customers_store = customers;
        // }

        jQuery(document).ready(function () {
            KTDatatableCustomersInvoices.init();
            jQuery('body').tooltip({selector: '[data-toggle=tooltip]', trigger: 'hover'});
        });
        showAddModal = true;
        // setTimeout(() => {
        //     initializeAddModalComponents();
        // }, 500);
    });
</script>

<!--begin::Entry-->
<div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}} class="d-flex flex-column-fluid">
    <!--begin::Container-->
    <div class="container">
        <div
            class="d-none d-flex justify-content-start mb-2 mt-2 mt-md-0 mb-md-2 pb-2 pb-md-0 overflow-auto"
            style="flex-wrap: wrap;">
            <div class="col-12 col-md-6 p-2 pr-md-4" in:scale={{duration: 250, start: 0.92}}>
                <div class="card-widget card p-0 m-0 h-100">
                    <div class="card-body p-4">
                        <div
                            class="d-flex justify-content-between font-weight-bolder my-1 mx-2"
                            style="font-size: 1.4rem;">
                            totale crediti
                            <span
                                >{Number($stats?.invoices_total || 0).toLocaleString('it-IT', {
                                    maximumFractionDigits: 2,
                                    minimumFractionDigits: 2,
                                })} €</span>
                        </div>
                        <div
                            class="d-flex justify-content-between font-weight-bolder text-success my-1 mx-2"
                            style="font-size: 1.4rem;">
                            totale crediti saldati
                            <span
                                >{Number($stats?.invoices_paid || 0).toLocaleString('it-IT', {
                                    maximumFractionDigits: 2,
                                    minimumFractionDigits: 2,
                                })} €</span>
                        </div>
                        <div
                            class="d-flex justify-content-between font-weight-bolder text-danger my-1 mx-2"
                            style="font-size: 1.4rem;">
                            totale crediti da saldare
                            <span
                                >{Number($stats?.invoices_unpaid || 0).toLocaleString('it-IT', {
                                    maximumFractionDigits: 2,
                                    minimumFractionDigits: 2,
                                })} €</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-12 col-md-6 p-2" in:scale={{duration: 250, start: 0.92}}>
                <div class="card-widget card p-0 m-0 h-100">
                    <div class="card-body p-4">
                        <div class="mb-0">
                            <h6 class="font-weight-boldest text-center mb-0" style="font-size: 1rem;">
                                FATTURE IN SCADENZA
                            </h6>
                        </div>
                        {#each Array.from($stats?.invoices_expiring?.slice(0, 3) || []) as invoice}
                            <div class="d-flex justify-content-between font-weight-bolder mt-2 mx-2">
                                <span>
                                    {new Date(invoice.payment_expiry_date).toLocaleDateString('it-IT', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                    })}
                                    <span class="font-weight-boldest text-primary"
                                        >({invoice.prefix} {invoice.number}/{invoice.fiscal_year})
                                    </span>
                                </span>
                                <span
                                    >{Number(invoice.payment_total_amount || 0).toLocaleString('it-IT', {
                                        maximumFractionDigits: 2,
                                        minimumFractionDigits: 2,
                                    })} €</span>
                            </div>
                        {/each}
                        {#if $stats?.invoices_expiring?.length == 0}
                            <div class="d-flex justify-content-center font-weight-bolder mt-3 mx-2 py-4">
                                <span><Smiley weight="duotone" size="40" /> Nessuna fattura in scadenza </span>
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        </div>

        <!--begin::Card-->
        <div class="card card-custom gutter-b">
            <div class="card-header flex-wrap border-0 p-0">
                <div class="card-title">
                    <h3 class="card-label font-size-h2">
                        Fatture Clienti
                        <span class="d-block text-muted pt-2 font-size-sm">Storico delle fatture verso i clienti.</span>
                    </h3>
                </div>
                <div class="card-toolbar">
                    <!--begin::Dropdown-->
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!--end::Dropdown-->
                    {#if canPerformAction('bookeeping.documents.clientinvoices.create')}
                        <span
                            data-toggle="modal"
                            style={showAddModal ? '' : 'opacity: .5;pointer-events: none;'}
                            data-target="#addInvoiceModal"
                            class="btn btn-sm btn-primary font-weight-bolder m-2 d-flex align-items-center">
                            <PlusCircle size={18} weight="duotone" />
                            <span class="ml-0 ml-md-1"><span class="d-none d-md-inline-block">Fattura</span></span>
                        </span>
                    {/if}
                </div>
            </div>
            <div class="card-body p-0">
                <!--begin: Search Form-->
                <!--begin::Search Form-->
                <div class="mb-2">
                    <div class="row align-items-center">
                        <div class="col-lg-9 col-xl-8">
                            <div class="row align-items-center">
                                <div class="col-md-4 my-2 my-md-0">
                                    <div class="input-icon">
                                        <input
                                            type="text"
                                            class="form-control form-control-solid mb-0"
                                            placeholder="Cerca..."
                                            id="kt_datatable_search_query" />
                                        <span>
                                            <i class="flaticon2-search-1 text-muted" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!--end::Search Form-->
                <!--begin: Datatable-->
                <div class="datatable datatable-bordered datatable-head-custom" id="kt_datatable" />
                <!--end: Datatable-->
            </div>
        </div>
        <!--end::Card-->
    </div>
    <!--end::Container-->
</div>

<Portal>
    <form class="form" id="invoice_form" on:submit|preventDefault={handleValidation}>
        {#if showAddModal}
            <div
                class="modal fade"
                id="addInvoiceModal"
                tabindex="-1"
                role="dialog"
                aria-labelledby="staticBackdrop"
                aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-xl" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="exampleModalLabel">Nuova Fattura</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <i aria-hidden="true" class="ki ki-close" />
                            </button>
                        </div>
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <div class="modal-body" style="overflow-y: visible;">
                            <InvoiceForm bind:lines bind:payment_total_amount />
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-light-primary font-weight-bold" data-dismiss="modal"
                                >Chiudi</button>
                            <button type="submit" class="btn btn-primary font-weight-bold">Salva</button>
                        </div>
                    </div>
                </div>
            </div>
        {/if}
    </form>
</Portal>

<!--end::Entry-->
<style>
    .navi-link {
        cursor: pointer;
    }
</style>
