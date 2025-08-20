<script>
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware.js';
    import {sessionToken, userData, permissions} from 'store/stores.js';
    import {scale} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import DeleteButton from 'components/buttons/DeleteButton.svelte';
    import EditButton from 'components/buttons/EditButton.svelte';
    import EditModal from './modals/EditModal.svelte';
    import {PlusCircle, Smiley} from 'phosphor-svelte';
    import {onMount} from 'svelte';
    import {getDataFromForm, waitForElementAndExecute} from 'utils/Functions';
    import Select from 'svelte-select';
    import {writable} from 'svelte/store';
    import {canPerformAction} from 'utils/Permissions.js';
    import {toast} from 'svelte-sonner';

    sessionToken.useLocalStorage();
    permissions.useLocalStorage();

    let showAddModal = false;
    let suppliersInvoiceForm;
    let suppliers = [];
    let suppliers_store = writable(suppliers);
    let stats = writable({});
    let accounts_available = false;
    let accounts = [];
    let datatable;
    let KTDatatableSuppliersInvoices = (function () {
        // Private functions

        var options = {
            // datasource definition
            data: {
                responsive: true,
                type: 'remote',
                source: {
                    read: {
                        url: __bakney.env.HOST + '/invoice-suppliers/list',
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
                serverPaging: true,
                serverFiltering: true,
                serverSorting: true,
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
                    template: function (row) {
                        return "<span style='font-weight:700;'>" + row.invoice_identifier + '</span>';
                    },
                },
                {
                    field: 'amount',
                    title: 'Importo',
                    width: 120,
                    sortable: false,
                    autoHide: false,
                    template: function (row) {
                        let amount =
                            "<span style='font-weight:700;'>€ " +
                            parseFloat(row.amount).toFixed(2).replace(',', '-').replace('.', ',').replace('-', '.') +
                            '</span>';
                        return amount;
                    },
                },
                {
                    field: 'supplier',
                    title: 'Fornitore',
                    width: 120,
                    sortable: false,
                    autoHide: false,
                    template: function (row) {
                        if (!row.supplier) return '<span>-</span>';
                        return '<span>' + row.supplier?.name || '-' + '</span>';
                    },
                },
                {
                    field: 'expire_date',
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
                        return moment(new Date(row.expire_date)).format('DD/MM/YYYY');
                    },
                },
                {
                    field: 'payment_date',
                    title: 'Pagata il',
                    width: 90,
                    type: 'date',
                    responsive: {
                        visible: 'xl',
                        hidden: 'lg',
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
                        return row.paid ? moment(new Date(row.payment_date)).format('DD/MM/YYYY') : '-';
                    },
                },
                {
                    field: 'notes',
                    title: 'Note',
                    responsive: {
                        visible: 'lg',
                        hidden: 'md',
                    },
                    sortable: false,
                    template: function (row) {
                        return row.notes ? row.notes : '-';
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
                        waitForElementAndExecute(`#action-col-${row.invoice_supplier_id}`, () => {
                            if (document.querySelector(`#action-col-${row.invoice_supplier_id}`))
                                document.querySelector(`#action-col-${row.invoice_supplier_id}`).innerHTML = '';

                            let editBtn = new EditButton({
                                target: document.querySelector(`#action-col-${row.invoice_supplier_id}`),
                                intro: true,
                                props: {
                                    disabled: !canPerformAction('bookeeping.documents.supplierinvoices.update'),
                                    hidden: false,
                                },
                            });

                            let editModal = new EditModal({
                                target: document.querySelector(`#action-col-${row.invoice_supplier_id}`),
                                intro: true,
                                props: {
                                    id: row.invoice_supplier_id,
                                    row: row,
                                    ktdatable: KTDatatableSuppliersInvoices,
                                    suppliers: $suppliers_store,
                                },
                            });

                            editBtn.$on('open', data => {
                                jQuery(`#editModal-${row.invoice_supplier_id}`).modal('show');
                            });

                            let deleteBtn = new DeleteButton({
                                target: document.querySelector(`#action-col-${row.invoice_supplier_id}`),
                                intro: true,
                                props: {
                                    disabled: !canPerformAction('bookeeping.documents.supplierinvoices.delete'),
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
                                        deleteInvoice(row.invoice_supplier_id);
                                    }
                                });
                            });
                        });
                        return `<div id="action-col-${row.invoice_supplier_id}" class="action-column pr-4"></div>`;
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
        $stats = (await apiFetch(__bakney.env.API.INVOICE_SUPPLIERS.STATS)).response;
    }

    function exportCSV() {
        apiFetch(__bakney.env.API.INVOICE_SUPPLIERS.EXPORT).then(res => {
            window.downloadCSV(res.response.data.filename, res.response.data.file);
        });
    }

    function exportXLSX() {
        // for older office .xsl the mime is "application/vnd.ms-excel"
        apiFetch(`${__bakney.env.API.INVOICE_SUPPLIERS.EXPORT}?m=xlsx`).then(res => {
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

        const url = replaceUID(__bakney.env.API.INVOICE_SUPPLIERS.DELETE, id);

        apiFetch(url, {method: 'DELETE'})
            .then(() => {
                toast.success('Eliminazione avvenuta con Successo.');
                KTDatatableSuppliersInvoices.reload();
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

    function initializeAddModalComponents() {
        jQuery('#amount').inputmask('9{1,9},9{2}', {
            greedy: false,
            placeholder: '0',
            rightAlign: true,
        });
        jQuery('#payment_date').datetimepicker({
            format: 'L',
            locale: 'it',
            format: 'YYYY-MM-DD',
            useCurrent: true, // workaround the bug that maxDate overwrites defaultDate
            defaultDate: moment(),
        });
        jQuery('#expire_date').datetimepicker({
            format: 'L',
            locale: 'it',
            format: 'YYYY-MM-DD',
            useCurrent: true, // workaround the bug that maxDate overwrites defaultDate
            defaultDate: moment(),
        });
    }

    async function create(data) {
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Creazione...',
        });

        // add to payment_date the current time if the date is today in UTC via "%Y-%m-%dT%H:%M:%S.%fZ"
        if (moment(data.payment_date).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
            data.payment_date = moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ');
        } else {
            data.payment_date = moment(data.payment_date).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
        }

        if (moment(data.expire_date).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
            data.expire_date = moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ');
        } else {
            data.expire_date = moment(data.expire_date).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
        }

        data.paid = JSON.parse(data.paid).value || false;
        data.amount = parseFloat(data.amount.replace(',', '.'));
        data.supplier_id = JSON.parse(data.supplier).value;
        delete data.supplier;

        const url = __bakney.env.API.INVOICE_SUPPLIERS.ADD;

        const res = await apiFetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        // spinner stop
        KTApp.unblockPage();

        if (res.status == 200 || res.status == 201) {
            KTDatatableSuppliersInvoices.reload();
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
        suppliersInvoiceForm?.destroy();
        suppliersInvoiceForm = FormValidation.formValidation(document.getElementById('invoice_form'), {
            fields: {
                invoice_identifier: {
                    validators: {
                        notEmpty: {
                            message: "L'indenfiticativo è obbligatorio.",
                        },
                    },
                },
                expire_date: {
                    validators: {
                        notEmpty: {
                            message: 'La data di scadenza è obbligatoria.',
                        },
                    },
                },
                paid: {
                    validators: {
                        notEmpty: {
                            message: 'Lo stato del pagamento è obbligatorio.',
                        },
                    },
                },
                amount: {
                    validators: {
                        notEmpty: {
                            message: 'Seleziona un importo valido.',
                        },
                        regexp: {
                            regexp: '^[0-9]{1,9},[0-9]{2}$',
                            flags: 'ig',
                            message: "L'importo deve essere > 0.",
                        },
                    },
                },
                payment_date: {
                    validators: {
                        notEmpty: {
                            message: 'Seleziona una data.',
                        },
                    },
                },
                supplier: {
                    validators: {
                        notEmpty: {
                            message: 'Seleziona un fornitore.',
                        },
                    },
                },
                custom_accounts: {
                    validators: {
                        notEmpty: {
                            message: 'Seleziona un conto.',
                        },
                        callback: {
                            message: 'Deve essere un conto presente nella sezione conti.',
                            callback: function (input) {
                                return accounts.some(account => account.custom_account_id === input.value);
                            },
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
        if (!suppliersInvoiceForm) initForm();
        suppliersInvoiceForm?.validate().then(function (status) {
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
        await fetchCustomAccounts();
        let res = await apiFetch(`${__bakney.env.API.SUPPLIER.LIST}?all=true`);
        if (res.status == 200) {
            suppliers = res.response.data.map(supplier => {
                return {
                    value: supplier.supplier_id,
                    data: supplier,
                    label: `${supplier.name} (${supplier.tax_code})`,
                };
            });
            $suppliers_store = suppliers;
        }

        jQuery(document).ready(function () {
            KTDatatableSuppliersInvoices.init();
            jQuery('body').tooltip({selector: '[data-toggle=tooltip]', trigger: 'hover'});
        });
        showAddModal = true;
        setTimeout(() => {
            initializeAddModalComponents();
        }, 500);
    });
</script>

<!--begin::Entry-->
<div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}} class="d-flex flex-column-fluid">
    <!--begin::Container-->
    <div class="container">
        <div
            class="d-none d-flex justify-content-start mb-2 mt-2 mt-md-0 mb-md-3 pb-2 pb-md-0 overflow-auto"
            style="flex-wrap: wrap;">
            <div class="col-12 col-md-6 p-2 pr-md-4" in:scale={{duration: 250, start: 0.92}}>
                <div class="card-widget card p-0 m-0 h-100">
                    <div class="card-body p-4">
                        <div
                            class="d-flex justify-content-between font-weight-bolder my-1 mx-2"
                            style="font-size: 1.4rem;">
                            totale debiti
                            <span
                                >{Number($stats?.invoices_total || 0).toLocaleString('it-IT', {
                                    maximumFractionDigits: 2,
                                    minimumFractionDigits: 2,
                                })} €</span>
                        </div>
                        <div
                            class="d-flex justify-content-between font-weight-bolder text-success my-1 mx-2"
                            style="font-size: 1.4rem;">
                            totale debiti pagati
                            <span
                                >{Number($stats?.invoices_paid || 0).toLocaleString('it-IT', {
                                    maximumFractionDigits: 2,
                                    minimumFractionDigits: 2,
                                })} €</span>
                        </div>
                        <div
                            class="d-flex justify-content-between font-weight-bolder text-danger my-1 mx-2"
                            style="font-size: 1.4rem;">
                            totale debiti da saldare
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
                                    {new Date(invoice.expire_date).toLocaleDateString('it-IT', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                    })}
                                    <span>
                                        {invoice.invoice_identifier} ({invoice.supplier__name || 'N.D.'})
                                    </span>
                                </span>
                                <span
                                    >{Number(invoice.amount || 0).toLocaleString('it-IT', {
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
                        Fatture fornitori
                        <span class="d-block text-muted pt-2 font-size-sm"
                            >Storico delle fatture verso i fornitori.</span>
                    </h3>
                </div>
                <div class="card-toolbar">
                    <!--begin::Dropdown-->
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!--end::Dropdown-->
                    {#if canPerformAction('bookeeping.documents.supplierinvoices.create')}
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

<form class="form" id="invoice_form" on:submit|preventDefault={handleValidation}>
    {#if showAddModal}
        <div
            class="modal fade"
            id="addInvoiceModal"
            tabindex="-1"
            role="dialog"
            aria-labelledby="staticBackdrop"
            aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Nuova Fattura</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <i aria-hidden="true" class="ki ki-close" />
                        </button>
                    </div>
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <div class="modal-body" style="overflow-y: visible;">
                        <div class="row p-0">
                            <div class="form-group col-12 col-md-6">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Identificativo<b>*</b></label>
                                <input
                                    name="invoice_identifier"
                                    type="text"
                                    class="form-control form-control-solid form-control-lg margin-t-2"
                                    placeholder="Identificativo fattura" />
                                <!-- <span class="form-text text-muted">Per favore inserisci il nome.</span> -->
                            </div>

                            <div class="form-group col-12 col-md-6">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Importo<b>*</b></label>
                                <div class="input-group input-group-solid">
                                    <div class="input-group-prepend">
                                        <span class="input-group-text fs-1-1">€</span>
                                    </div>
                                    <input
                                        name="amount"
                                        type="text"
                                        class="form-control fs-1-1"
                                        id="amount"
                                        placeholder="0,00" />
                                </div>
                            </div>
                        </div>

                        <div class="row p-0">
                            <div class="form-group col-12 col-md-4">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Data pagamento<b>*</b></label>
                                <div
                                    class="input-group input-group-solid date"
                                    id="payment_date"
                                    data-target-input="nearest">
                                    <input
                                        id="date_banktransfer"
                                        name="payment_date"
                                        type="text"
                                        class="form-control form-control-solid form-control-lg datetimepicker-input"
                                        placeholder="Seleziona Data"
                                        data-target="#payment_date" />
                                    <div
                                        class="input-group-append"
                                        data-target="#payment_date"
                                        data-toggle="datetimepicker">
                                        <span class="input-group-text">
                                            <i class="ki ki-calendar" />
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div class="form-group col-12 col-md-4">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Data scadenza<b>*</b></label>
                                <div
                                    class="input-group input-group-solid date"
                                    id="expire_date"
                                    data-target-input="nearest">
                                    <input
                                        id="date_banktransfer"
                                        name="expire_date"
                                        type="text"
                                        class="form-control form-control-solid form-control-lg datetimepicker-input"
                                        placeholder="Seleziona Data"
                                        data-target="#expire_date" />
                                    <div
                                        class="input-group-append"
                                        data-target="#expire_date"
                                        data-toggle="datetimepicker">
                                        <span class="input-group-text">
                                            <i class="ki ki-calendar" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group col-12 col-md-4">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Conto<b>*</b></label>
                                {#if accounts_available}
                                    <div>
                                        <select
                                            value={accounts[0]?.custom_account_id || ''}
                                            name="custom_accounts"
                                            class="form-control selectpicker form-control-solid form-control-lg"
                                            id="custom_accounts">
                                            <option value=""> Seleziona un conto</option>
                                            {#each Array.from(accounts || []) as account, idx}
                                                <option value={account.custom_account_id}>
                                                    {account.name}
                                                </option>
                                            {/each}
                                        </select>
                                    </div>
                                {/if}
                            </div>
                        </div>
                        <div class="row p-0">
                            <div class="form-group col-12 col-md-8">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Fornitore<b>*</b></label>
                                <!-- class="form-control selectpicker form-control-solid form-control-lg" -->
                                <Select
                                    hideEmptyState={true}
                                    id="supplier"
                                    bind:items={suppliers}
                                    placeholder="Seleziona fornitore"
                                    name="supplier" />
                            </div>

                            <div class="form-group col-12 col-md-4">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Pagata<b>*</b></label>
                                <Select
                                    hideEmptyState={true}
                                    items={[
                                        {value: false, label: 'Non pagata'},
                                        {value: true, label: 'Pagata'},
                                    ]}
                                    placeholder="Seleziona stato"
                                    name="paid" />
                                <!-- <span class="form-text text-muted">Per favore inserisci il sesso.</span> -->
                            </div>
                        </div>
                        <div class="form-group">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label>Note</label>
                            <textarea
                                name="notes"
                                style="resize: none;"
                                rows="4"
                                class="form-control form-control-solid form-control-lg margin-t-2"
                                placeholder="Aggiungi delle note" />
                            <!-- <span class="form-text text-muted">Per favore inserisci il nome.</span> -->
                        </div>
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

<!--end::Entry-->
<style>
    .navi-link {
        cursor: pointer;
    }
</style>
