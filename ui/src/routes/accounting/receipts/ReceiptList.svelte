<script>
    import ShareButton from '../../../components/buttons/ShareButton.svelte';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware.js';
    import {sessionToken, permissions} from 'store/stores.js';
    import {scale, slide} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import DeleteButton from 'components/buttons/DeleteButton.svelte';
    import DocumentButton from 'components/buttons/DocumentButton.svelte';
    import {canPerformAction, isFreePlan} from 'utils/Permissions.js';
    import EditButton from 'components/buttons/EditButton.svelte';
    import EditModal from './modals/EditModal.svelte';
    import ShareModal from './modals/ShareModal.svelte';
    import {waitForElementAndExecute} from 'utils/Functions';
    import Tabs from 'components/Tabs.svelte';
    import {ArchiveBox, DownloadSimple, TrashSimple} from 'phosphor-svelte';
    import {toast} from 'svelte-sonner';
    import InvoicePreviewModal from 'components/modals/InvoicePreviewModal.svelte';
    import SimpleButton from 'components/buttons/simple-button.svelte';

    sessionToken.useLocalStorage();
    permissions.useLocalStorage();

    let selectedCounter = 0;
    let visibleMultiaction = false;
    let datatable;

    let mobileCols = KTUtil.isMobileDevice()
        ? [
              {
                  field: 'informazioni',
                  title: 'Informazioni',
                  width: 150,
                  sortable: false,
                  autoHide: false,
                  template: function (row) {
                      if (row.payment?.imported_from_associami)
                          return `<div class="font-size-sm font-weight-boldest text-dark" style="line-height:1.2;">${row.payment?.customer_name}</div>`;
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
                            'query[current_year]': '1',
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
                    field: 'invoice_id',
                    title: '#',
                    sortable: false,
                    autoHide: false,
                    width: 20,
                    selector: {
                        class: '',
                    },
                    textAlign: 'center',
                },
                ...mobileCols,
                {
                    field: 'user',
                    title: 'Intestato a',
                    width: 160,
                    minWidth: '100%',
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
                    width: 80,
                    sortable: true,
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
                    field: 'activity_fee',
                    title: 'Importo',
                    width: 80,
                    sortable: true,
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
                    sortable: true,
                    type: 'date',
                    responsive: {
                        visible: 'xl',
                        hidden: 'lg',
                    },
                    sortCallback: function (data, sort, column) {
                        let dataArray = Object.values(data);
                        dataArray.sort(function (a, b) {
                            let timeA = new Date(a['payment']['payment_date']).getTime();
                            let timeB = new Date(b['payment']['payment_date']).getTime();
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
                        return moment(new Date(row.payment?.payment_date || row.creation_date)).format('DD/MM/YYYY');
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
                        let pdfLink = __bakney.env.HOST + '/document/retrieve/' + row.document_pdf;
                        waitForElementAndExecute(`#action-col-${row.invoice_id}`, () => {
                            if (document.querySelector(`#action-col-${row.invoice_id}`))
                                document.querySelector(`#action-col-${row.invoice_id}`).innerHTML = '';

                            let shareBtn = new ShareButton({
                                target: document.querySelector(`#action-col-${row.invoice_id}`),
                                intro: true,
                                props: {
                                    disabled: row.document_token === null || row.imported_from_associami,
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

                            let editBtn = new EditButton({
                                target: document.querySelector(`#action-col-${row.invoice_id}`),
                                intro: true,
                                props: {
                                    disabled:
                                        !row.payment ||
                                        !canPerformAction('bookeeping.documents.invoices.update') ||
                                        row.imported_from_associami,
                                    hidden: false,
                                },
                            });

                            if (row.payment) {
                                let editModal = new EditModal({
                                    target: document.querySelector(`#action-col-${row.invoice_id}`),
                                    intro: true,
                                    props: {
                                        id: row.invoice_id,
                                        row: row,
                                        ktdatable: KTDatatableInvoices,
                                    },
                                });

                                editBtn.$on('open', data => {
                                    jQuery(`#editModal-${row.invoice_id}`).modal('show');
                                });
                            }

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
                                deleteInvoice(row.invoice_id);
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

            datatable = jQuery('#kt_datatable').KTDatatable(options);

            jQuery('#kt_datatable_show_current').on('change', function () {
                datatable.search(jQuery(this).val().toLowerCase(), 'current_year');
            });

            jQuery('#kt_datatable_show_current').selectpicker();

            datatable.on('datatable-on-check datatable-on-uncheck', function (e) {
                var checkedNodes = datatable.rows('.datatable-row-active').nodes();
                var count = checkedNodes.length;
                selectedCounter = count;
                if (count > 0) {
                    visibleMultiaction = true;
                } else {
                    visibleMultiaction = false;
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
        apiFetch(__bakney.env.API.INVOICE.EXPORT)
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
        apiFetch(`${__bakney.env.API.INVOICE.EXPORT}?m=xlsx`)
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

    function exportPrints() {
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Esportazione in corso...',
        });

        apiFetch(`${__bakney.env.API.INVOICE.EXPORT}?m=files`)
            .then(res => {
                if (res.response.status == 400) {
                    toast.error('Errore nella generazione dei file');
                } else {
                    toast.success(res.response.data.message || "Generazione dell'archivio in corso...");
                }
            })
            .finally(() => {
                KTApp.unblockPage();
            });
    }

    window.deleteInvoice = id => {
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
                        jQuery('body').tooltip({selector: '[data-toggle=tooltip]', trigger: 'hover'});
                    })
                    .catch(() => {
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
        });
    };

    async function archiveSelected() {
        swal.fire({
            text: `Vuoi archiviare ${selectedCounter} ricevute?`,
            icon: 'question',
            buttonsStyling: true,
            showCancelButton: true,
            cancelButtonText: 'Annulla',
            confirmButtonText: 'Archivia selezionati',
            reverseButtons: true,
        }).then(async function (result) {
            if (result.isConfirmed) {
                let records = jQuery('#kt_datatable').KTDatatable('getSelectedRecords').dataSet;
                let checkedNodes = datatable?.getSelectedRecords();
                let count = checkedNodes.length;
                KTApp.blockPage({
                    overlayColor: '#000000',
                    state: 'primary',
                    message: 'Archiviazione in corso...',
                });
                let invoice_ids = [];
                for (let i = 0; i < count; i++) {
                    let id = checkedNodes[i].dataset.row;
                    invoice_ids.push(records[id].invoice_id);
                }

                let result = await apiFetch(__bakney.env.API.INVOICE.BULK_ARCHIVE, {
                    method: 'POST',
                    body: JSON.stringify({
                        invoice_ids: invoice_ids,
                    }),
                });

                KTApp.unblockPage();
                visibleMultiaction = false;

                if (!result.error) {
                    toast.success(`${selectedCounter} Ricevute Archiviate.`);
                } else {
                    toast.warning(`Nessuna ricevuta archiviata.`);
                }

                jQuery('#kt_datatable').KTDatatable('reload');
                jQuery('body').tooltip({selector: '[data-toggle=tooltip]', trigger: 'hover'});
            }
        });
    }

    async function deleteSelected() {
        swal.fire({
            text: `Vuoi eliminare ${selectedCounter} ricevute?`,
            icon: 'question',
            buttonsStyling: true,
            showCancelButton: true,
            cancelButtonText: 'Annulla',
            confirmButtonText: 'Elimina selezionati',
            reverseButtons: true,
        }).then(async function (result) {
            if (result.isConfirmed) {
                let records = jQuery('#kt_datatable').KTDatatable('getSelectedRecords').dataSet;
                let checkedNodes = datatable?.getSelectedRecords();
                let count = checkedNodes.length;
                KTApp.blockPage({
                    overlayColor: '#000000',
                    state: 'primary',
                    message: 'Eliminazione in corso...',
                });
                let invoice_ids = [];
                for (let i = 0; i < count; i++) {
                    let id = checkedNodes[i].dataset.row;
                    invoice_ids.push(records[id].invoice_id);
                }

                let result = await apiFetch(__bakney.env.API.INVOICE.BULK_DELETE, {
                    method: 'DELETE',
                    body: JSON.stringify({
                        invoice_ids: invoice_ids,
                    }),
                });

                KTApp.unblockPage();
                visibleMultiaction = false;

                if (!result.error) {
                    toast.success(`${selectedCounter} Ricevute Eliminate.`);
                } else {
                    toast.warning(`Nessuna ricevuta eliminata.`);
                }

                jQuery('#kt_datatable').KTDatatable('reload');
                jQuery('body').tooltip({selector: '[data-toggle=tooltip]', trigger: 'hover'});
            }
        });
    }

    jQuery(document).ready(function () {
        KTDatatableInvoices.init();
        jQuery('body').tooltip({selector: '[data-toggle=tooltip]', trigger: 'hover'});
    });
</script>

<!--begin::Entry-->
<div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}} class="d-flex flex-column-fluid">
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
                    ...(canPerformAction('bookeeping.documents.invoices.archive.read')
                        ? [
                              {
                                  title: 'Archivio',
                                  url: '/invoice/archive',
                                  icon: 'archive',
                              },
                          ]
                        : []),
                ]} />
            <div class="card-header flex-wrap border-0 p-0">
                <div class="card-title">
                    <h3 class="card-label font-size-h2">
                        Ricevute
                        <span class="d-block text-muted pt-2 font-size-sm">Storico delle ricevute.</span>
                    </h3>
                </div>
                <div class="card-toolbar">
                    <!--begin::Dropdown-->
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <div
                        class="dropdown dropdown-inline m-2"
                        on:click={() => {
                            if (isFreePlan()) location.href = '/#/subscription/upgrade';
                        }}>
                        <button
                            disabled={!canPerformAction('bookeeping.documents.invoices.read')}
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
                            </span><span class="d-none d-md-inline-block">Esporta Tutto</span></button>
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

                    <SimpleButton
                        disabled={!canPerformAction('bookeeping.documents.invoices.read')}
                        variant={'primary'}
                        size={'md'}
                        on:click={exportPrints}
                        classList="mb-0">
                        <DownloadSimple size="18" weight="bold" class="mr-1" />
                        Esporta Stampe
                    </SimpleButton>
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
                                <div class="my-2 mx-md-2 px-0">
                                    <!-- svelte-ignore a11y-label-has-associated-control -->
                                    <select class="form-control" id="kt_datatable_show_current" value="1">
                                        <option value="-">Filtra Anno</option>
                                        <option value="1" default>Anno corrente</option>
                                        <option value="0">Anni precedenti</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!--end::Search Form-->
                {#if visibleMultiaction}
                    <div in:slide={{duration: 100}} class="mt-10 mb-5" id="kt_datatable_group_action_form">
                        <div class="d-flex align-items-center">
                            <div class="font-weight-boldest mr-3 ml-2" style="font-size:1.1rem;">
                                {selectedCounter} selezionati
                            </div>
                            <button
                                on:click={archiveSelected}
                                class="btn btn-sm btn-light-primary font-weight-bolder m-0 ml-2 p-2 d-flex align-items-center"
                                type="button"
                                data-toggle="tooltip"
                                data-placement="top"
                                title="Archivia le ricevute selezionate"
                                id="kt_datatable_archive_selected">
                                <ArchiveBox size="17" weight="duotone" class="mr-1" />
                                <span class="d-none d-md-block">Archivia</span></button>
                            <div class="dropdown mr-2">
                                <button
                                    on:click={deleteSelected}
                                    class="btn btn-sm btn-light-primary font-weight-bolder m-0 ml-2 p-2 d-flex align-items-center"
                                    type="button"
                                    data-toggle="tooltip"
                                    data-placement="top"
                                    title="Elimina le ricevute selezionate"
                                    id="kt_datatable_delete_selected">
                                    <TrashSimple size="17" weight="duotone" class="mr-1" />
                                    Elimina</button>
                            </div>
                        </div>
                    </div>
                {/if}
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
