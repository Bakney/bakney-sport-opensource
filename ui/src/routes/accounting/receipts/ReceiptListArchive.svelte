<script>
    import ShareButton from '../../../components/buttons/ShareButton.svelte';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware.js';
    import {sessionToken, userData, permissions} from 'store/stores.js';
    import DocumentButton from 'components/buttons/DocumentButton.svelte';
    import {canPerformAction, isFreePlan} from 'utils/Permissions.js';
    import ShareModal from './modals/ShareModal.svelte';
    import {waitForElementAndExecute} from 'utils/Functions';
    import Tabs from 'components/Tabs.svelte';
    import InvoicePreviewModal from 'components/modals/InvoicePreviewModal.svelte';
    import DeleteButton from 'components/buttons/DeleteButton.svelte';
    import {toast} from 'svelte-sonner';

    sessionToken.useLocalStorage();
    permissions.useLocalStorage();

    let mobileCols = KTUtil.isMobileDevice()
        ? [
              {
                  field: 'informazioni',
                  title: 'Informazioni',
                  width: 150,
                  sortable: false,
                  autoHide: false,
                  template: function (row) {
                      let amount =
                          "<span style='font-weight:700;color:#2eb132'>€ " +
                          (parseFloat(row.membership_fee) + parseFloat(row.activity_fee))
                              .toFixed(2)
                              .replace(',', '-')
                              .replace('.', ',')
                              .replace('-', '.') +
                          '</span>';
                      let invoiceNumber = "<span style='font-weight:700;'>" + row.number + '</span>';

                      let url = `/#/search/profile/${row.payment?.user?.username}`;
                      // if user is not defined we open the associate details
                      if (row.payment?.subscription_id)
                          url = `/#/members/list/detail/${row.payment?.subscription_id}/info`;

                      let nameInfo =
                          `<a href="${url}">` +
                          '<b>' +
                          (row.payment?.associate?.first_name + ' ' + row.payment?.associate?.last_name).toUpperCase() +
                          '</b></a>';

                      let composeHtml = `
                            <div class="d-flex" style="flex-direction: column;">
                                <div class="mb-2">
                                    ${invoiceNumber} (${amount})
                                </div>
                                <div>
                                    ${nameInfo}
                                </div>
                            </div>`;
                      return composeHtml;
                  },
              },
          ]
        : [];

    let KTDatatableInvoices = (function () {
        // Private functions

        var options = {
            // datasource definition
            data: {
                responsive: true,
                type: 'remote',
                source: {
                    read: {
                        url: __bakney.env.HOST + '/invoice/list',
                        method: 'GET',
                        params: {
                            // API params
                            'query[archived]': 'True',
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
                ...mobileCols,
                {
                    field: 'user',
                    title: 'Intestato a',
                    width: 200,
                    autoHide: false,
                    sortable: false,
                    responsive: {
                        visible: 'lg',
                        hidden: 'md',
                    },
                    template: function (row) {
                        if (row.payment?.imported_from_associami)
                            return `<div class="font-size-md font-weight-boldest text-dark" style="line-height:1.2;">${row.payment?.customer_name}</div>`;
                        let url = null;
                        // if user is not defined we open the associate details
                        if (row.payment?.subscription_id)
                            url = `/#/members/list/detail/${row.payment?.subscription_id}/info`;

                        return (
                            `<div class="font-size-sm" style="line-height:1.2;">` +
                            (url ? `<a href="${url}" target="_blank">` : '') +
                            '<b>' +
                            (
                                (row.payment?.associate?.first_name ??
                                    row.payment?.supplier?.name ??
                                    'Ricevuta n.' + row.number) +
                                ' ' +
                                (row.payment?.associate?.last_name ?? '')
                            ).toUpperCase() +
                            '</b>' +
                            (url ? '</a>' : '') +
                            '<small>' +
                            (row.cancelled
                                ? row.no_payment
                                    ? '<br>(ricevuta annullata e pagamento eliminato)'
                                    : '<br>(ricevuta annullata)'
                                : row.no_payment
                                ? '<br>(pagamento eliminato)'
                                : '') +
                            '</small></div>'
                        );
                    },
                },
                {
                    field: 'number',
                    title: 'Numero',
                    width: 70,
                    sortable: false,
                    // autoHide: false,
                    responsive: {
                        visible: 'lg',
                        hidden: 'md',
                    },
                    template: function (row) {
                        let amount = "<span style='font-weight:700;'>" + row.number + '</span>';
                        return amount;
                    },
                },
                {
                    field: 'amount',
                    title: 'Importo',
                    width: 70,
                    sortable: false,
                    // autoHide: false,
                    responsive: {
                        visible: 'lg',
                        hidden: 'md',
                    },
                    template: function (row) {
                        let amount =
                            "<span style='font-weight:700;color:#2eb132'>€ " +
                            (parseFloat(row.membership_fee) + parseFloat(row.activity_fee))
                                .toFixed(2)
                                .replace(',', '-')
                                .replace('.', ',')
                                .replace('-', '.') +
                            '</span>';
                        return amount;
                    },
                },
                {
                    field: 'creation_date',
                    title: 'Data',
                    width: 90,
                    type: 'date',
                    responsive: {
                        visible: 'xl',
                        hidden: 'lg',
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
                        return moment(new Date(row.creation_date)).format('DD/MM/YYYY');
                    },
                },
                {
                    field: 'description',
                    title: 'Descrizione',
                    width: 400,
                    responsive: {
                        visible: 'xxl',
                        hidden: 'xl',
                    },
                    minWidth: '100%',
                    sortable: false,
                    template: function (row) {
                        return `<div class="font-size-sm" style="line-height: 1.4;">${row.description}</div>`;
                    },
                },
                {
                    field: '',
                    title: '',
                    width: 140,
                    sortable: false,
                    overflow: 'visible',
                    textAlign: 'right',
                    autoHide: false,
                    minWidth: '100%',
                    template: function (row) {
                        let canDelete = Date.now() < new Date(row.creation_date).getTime() + 24 * 7 * 60 * 60 * 1000;
                        let pdfLink = __bakney.env.HOST + '/document/retrieve/' + row.document_pdf;
                        waitForElementAndExecute(`#action-col-${row.invoice_id}`, () => {
                            if (document.querySelector(`#action-col-${row.invoice_id}`))
                                document.querySelector(`#action-col-${row.invoice_id}`).innerHTML = '';

                            let shareBtn = new ShareButton({
                                target: document.querySelector(`#action-col-${row.invoice_id}`),
                                intro: true,
                                props: {
                                    disabled: row.document_token === null,
                                    hidden: false,
                                    popover_text: 'Condividi ricevuta',
                                },
                            });

                            let shareModal = new ShareModal({
                                target: document.querySelector(`#action-col-${row.invoice_id}`),
                                intro: true,
                                props: {
                                    id: row.invoice_id,
                                    row: row,
                                    ktdatable: KTDatatableInvoices,
                                    pdfLink: pdfLink + '?download=true&token=' + row.document_token || '',
                                },
                            });

                            shareBtn.$on('open', data => {
                                jQuery(`#shareModal-${row.invoice_id}`).modal('show');
                            });

                            let documentButton = new DocumentButton({
                                target: document.querySelector(`#action-col-${row.invoice_id}`),
                                intro: true,
                                props: {
                                    disabled: false,
                                    popover_text: `Ricevuta n.${row.number}`,
                                },
                            });

                            documentButton.$on('open', data => {
                                // dispatch onboarding-checklist-event
                                document.dispatchEvent(
                                    new CustomEvent('onboarding-checklist-event', {detail: {key: 'download_invoice'}})
                                );
                                let filePreview = new InvoicePreviewModal({
                                    target: document.querySelector(`#action-col-${row.invoice_id}`),
                                    intro: true,
                                    props: {
                                        pdfLink: pdfLink + '?download=false&token=' + row?.document_token,
                                        row: row,
                                        id: row.invoice_id,
                                        title: `Ricevuta n.${row.number}`,
                                    },
                                });
                            });

                            let deleteBtn = new DeleteButton({
                                target: document.querySelector(`#action-col-${row.invoice_id}`),
                                intro: true,
                                props: {
                                    disabled: !canPerformAction('bookeeping.documents.invoices.delete'),
                                    popover_text: 'Elimina Ricevuta',
                                },
                            });

                            deleteBtn.$on('open', data => {
                                let id = row.invoice_id;
                                swal.fire({
                                    text: 'Vuoi eliminare definitivamente la ricevuta?',
                                    icon: 'question',
                                    buttonsStyling: true,
                                    showCancelButton: true,
                                    cancelButtonText: 'Annulla',
                                    confirmButtonText: 'Elimina',
                                    reverseButtons: true,
                                }).then(function (result) {
                                    if (result.isConfirmed) {
                                        KTApp.blockPage({
                                            overlayColor: '#000000',
                                            state: 'primary',
                                            message: 'Eliminazione in corso...',
                                        });

                                        const url = replaceUID(__bakney.env.API.INVOICE.DELETE, id);

                                        apiFetch(url, {method: 'POST'})
                                            .then(() => {
                                                toast.success('Eliminazione avvenuta con Successo.');
                                                jQuery('#kt_datatable').KTDatatable('reload');
                                                jQuery('body').tooltip({
                                                    selector: '[data-toggle=tooltip]',
                                                    trigger: 'hover',
                                                });
                                            })
                                            .catch(() => {
                                                let modalText =
                                                    response.status == 403
                                                        ? 'Operazione non permessa.'
                                                        : 'Scusa, ho individuato degli errori, riprova.';
                                                toast.error(modalText);
                                            })
                                            .finally(() => {
                                                KTApp.unblockPage();
                                            });
                                    }
                                });
                            });
                        });
                        return `<div id="action-col-${row.invoice_id}" class="action-column pr-4"></div>`;
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

            var datatable = jQuery('#kt_datatable').KTDatatable(options);

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

    function exportCSV() {
        // show loading
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Esportazione in corso...',
        });
        apiFetch(__bakney.env.API.INVOICE.EXPORT + '?archived=True')
            .then(res => {
                window.downloadCSV(res.response.data.filename, res.response.data.file);
            })
            .finally(() => {
                KTApp.unblockPage();
            });
    }

    function exportXLSX() {
        // show loading
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Esportazione in corso...',
        });
        // for older office .xsl the mime is "application/vnd.ms-excel"
        apiFetch(`${__bakney.env.API.INVOICE.EXPORT}?m=xlsx&archived=True`)
            .then(res => {
                window.downloadFile(
                    res.response.data.filename,
                    res.response.data.file,
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                );
            })
            .finally(() => {
                KTApp.unblockPage();
            });
    }

    jQuery(document).ready(function () {
        KTDatatableInvoices.init();
        jQuery('body').tooltip({selector: '[data-toggle=tooltip]', trigger: 'hover'});
    });
</script>

<!--begin::Entry-->
<div class="d-flex flex-column-fluid">
    <!--begin::Container-->
    <div class="container">
        <!--begin::Card-->
        <div class="card card-custom gutter-b">
            <Tabs
                navigationPages={[
                    {
                        title: 'Ricevute',
                        url: '/invoice/list',
                        icon: 'book',
                    },
                    {
                        title: 'Archivio',
                        url: '/invoice/archive',
                        icon: 'archive',
                    },
                ]} />
            <div class="card-header flex-wrap border-0 p-0">
                <div class="card-title">
                    <h3 class="card-label font-size-h2">
                        Archivio Ricevute
                        <span class="d-block text-muted pt-2 font-size-sm">Archivio storico delle ricevute.</span>
                    </h3>
                </div>
                <div class="card-toolbar">
                    <!--begin::Dropdown-->
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <div
                        class="dropdown dropdown-inline m-2"
                        on:click={() => {
                            if (isFreePlan()) location.href = '/#/subscription/upgrade';
                        }}>
                        <button
                            disabled={!canPerformAction('bookeeping.documents.invoices.archive.read')}
                            type="button"
                            class="btn btn-light-primary font-weight-bolder dropdown-toggle"
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false">
                            <span class="svg-icon svg-icon-md">
                                <!--begin::Svg Icon | path:assets/media/svg/icons/Design/PenAndRuller.svg-->
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    xmlns:xlink="http://www.w3.org/1999/xlink"
                                    width="24px"
                                    height="24px"
                                    viewBox="0 0 24 24"
                                    version="1.1">
                                    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                        <rect x="0" y="0" width="24" height="24" />
                                        <path
                                            d="M3,16 L5,16 C5.55228475,16 6,15.5522847 6,15 C6,14.4477153 5.55228475,14 5,14 L3,14 L3,12 L5,12 C5.55228475,12 6,11.5522847 6,11 C6,10.4477153 5.55228475,10 5,10 L3,10 L3,8 L5,8 C5.55228475,8 6,7.55228475 6,7 C6,6.44771525 5.55228475,6 5,6 L3,6 L3,4 C3,3.44771525 3.44771525,3 4,3 L10,3 C10.5522847,3 11,3.44771525 11,4 L11,19 C11,19.5522847 10.5522847,20 10,20 L4,20 C3.44771525,20 3,19.5522847 3,19 L3,16 Z"
                                            fill="#000000"
                                            opacity="0.3" />
                                        <path
                                            d="M16,3 L19,3 C20.1045695,3 21,3.8954305 21,5 L21,15.2485298 C21,15.7329761 20.8241635,16.200956 20.5051534,16.565539 L17.8762883,19.5699562 C17.6944473,19.7777745 17.378566,19.7988332 17.1707477,19.6169922 C17.1540423,19.602375 17.1383289,19.5866616 17.1237117,19.5699562 L14.4948466,16.565539 C14.1758365,16.200956 14,15.7329761 14,15.2485298 L14,5 C14,3.8954305 14.8954305,3 16,3 Z"
                                            fill="#000000" />
                                    </g>
                                </svg>
                                <!--end::Svg Icon-->
                            </span><span class="d-none d-md-inline-block">Esporta Archivio</span></button>
                        <!--begin::Dropdown Menu-->
                        <div class="dropdown-menu dropdown-menu-sm dropdown-menu-right">
                            <!--begin::Navigation-->
                            <ul class="navi flex-column navi-hover py-2">
                                <li
                                    class="navi-header font-weight-bolder text-uppercase font-size-sm text-primary pb-2">
                                    Scegli un formato:
                                </li>
                                <li class="navi-item">
                                    <!-- svelte-ignore a11y-missing-attribute -->
                                    <a class="navi-link" on:click={exportCSV}>
                                        <span class="navi-icon">
                                            <i class="la la-file-text-o" />
                                        </span>
                                        <span class="navi-text">CSV</span>
                                    </a>
                                </li>
                                <li class="navi-item">
                                    <!-- svelte-ignore a11y-missing-attribute -->
                                    <a class="navi-link" on:click={exportXLSX}>
                                        <span class="navi-icon">
                                            <i class="la la-file-text-o" />
                                        </span>
                                        <span class="navi-text">Excel</span>
                                    </a>
                                </li>
                            </ul>
                            <!--end::Navigation-->
                        </div>
                        <!--end::Dropdown Menu-->
                    </div>
                    <!--end::Dropdown-->
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

<!--end::Entry-->
<style>
    .navi-link {
        cursor: pointer;
    }
</style>
