<script>
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import {sessionToken} from 'store/stores.js';
    import {scale, slide} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import {onDestroy, onMount} from 'svelte';
    import {Calculator, Clock} from 'phosphor-svelte';
    import AddEditModal from './modals/AddEditModal.svelte';
    import {waitForElementAndExecute} from 'utils/Functions';
    import EditButton from 'components/buttons/EditButton.svelte';
    import DeleteButton from 'components/buttons/DeleteButton.svelte';
    import DocumentButton from 'components/buttons/DocumentButton.svelte';
    import DocumentPreviewModal from 'components/modals/DocumentPreviewModal.svelte';
    import {canPerformAction} from 'utils/Permissions';
    import DocumentSignatureModal from 'components/signature/DocumentSignatureModal.svelte';
    import {toast} from 'svelte-sonner';
    import BackButton from 'components/buttons/BackButton.svelte';
    sessionToken.useLocalStorage();

    export let params;
    let id = params.id;

    let data = {};
    let loading = true;
    let visibleMultiaction = false;
    let selectedCounter = 0;
    let datatable;
    let currentFilter = `${moment().startOf('month').format('DD/MM/YYYY')} al ${moment()
        .endOf('month')
        .format('DD/MM/YYYY')}`;

    const paidDict = {
        0: '<span class="label label-light-danger label-inline font-weight-bolder label-lg">da pagare</span>',
        1: '<span class="label label-light-success label-inline font-weight-bolder label-lg">pagato</span>',
    };

    let KTDatatableHours = (function () {
        var options = {
            // datasource definition
            data: {
                responsive: true,
                type: 'remote',
                source: {
                    read: {
                        url: replaceUID(__bakney.env.API.INSTRUCTOR.HOURS.LIST, id),
                        method: 'GET',
                        params: {
                            // API params
                            query: {
                                // custom query params
                                date_range: `${moment().startOf('month').format('DD/MM/YYYY')} al ${moment()
                                    .endOf('month')
                                    .format('DD/MM/YYYY')}`,
                            },
                        },
                        headers: {
                            Authorization: 'Bearer ' + $sessionToken,
                        },
                        map: function (raw) {
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
                    field: 'instructor_hours_id',
                    title: '#',
                    sortable: false,
                    width: 20,
                    selector: {
                        class: '',
                    },
                    textAlign: 'center',
                },
                {
                    field: 'date',
                    title: 'Data',
                    autoHide: false,
                    sortable: false,
                    width: 80,
                    minWidth: '100%',
                    template: function (row) {
                        return `<span class="font-weight-boldest">${moment(row.date).format('DD/MM/YYYY')}</span>`;
                    },
                },

                {
                    field: 'compensation_type',
                    title: 'TIPO',
                    sortable: false,
                    width: 80,
                    minWidth: '100%',
                    responsive: {
                        visible: 'lg',
                        hidden: 'md',
                    },
                    template: function (row) {
                        // return `<span class="font-weight-boldest text-primary">${Number(row?.hours || 0).toLocaleString(
                        //     'it-IT',
                        //     {
                        //         maximumFractionDigits: 2,
                        //         minimumFractionDigits: 2,
                        //     }
                        // )} ore</span>`;

                        return row.compensation_type == 'hourly'
                            ? '<span class="label label-light-primary label-inline font-weight-bolder label-lg">Orario</span>'
                            : '<span class="label label-light-warning label-inline font-weight-bolder label-lg">Percentuale</span>';
                    },
                },
                {
                    field: 'amount',
                    title: 'Compensi',
                    sortable: false,
                    width: 120,
                    minWidth: '100%',
                    responsive: {
                        visible: 'lg',
                        hidden: 'md',
                    },
                    template: function (row) {
                        return (
                            `<div class="font-size-sm" style="line-height: 1.2;"><span class="font-weight-boldest text-success">${Number(
                                row?.amount || 0
                            ).toLocaleString('it-IT', {
                                maximumFractionDigits: 2,
                                minimumFractionDigits: 2,
                            })} €</span><br>` +
                            (row.compensation_type == 'hourly'
                                ? `<span class="font-weight-bold font-size-sm text-primary">${Number(
                                      row?.hours || 0
                                  ).toLocaleString('it-IT', {
                                      maximumFractionDigits: 2,
                                      minimumFractionDigits: 2,
                                  })} ore · ${Number(row?.hourly_billing || 0).toLocaleString('it-IT', {
                                      maximumFractionDigits: 2,
                                      minimumFractionDigits: 2,
                                  })} €</span>`
                                : `<span class="font-weight-bold font-size-sm text-primary">${Number(
                                      row?.percentage_billing || 0
                                  ).toLocaleString('it-IT', {
                                      maximumFractionDigits: 2,
                                      minimumFractionDigits: 2,
                                  })} %</span></div>`)
                        );
                    },
                },
                {
                    field: 'paid',
                    title: 'Stato',
                    width: 80,
                    minWidth: '100%',
                    sortable: false,
                    responsive: {
                        visible: 'lg',
                        hidden: 'md',
                    },
                    template: function (row) {
                        return paidDict[row.paid ? 1 : 0];
                    },
                },
                {
                    field: 'notes',
                    title: 'Note',
                    sortable: false,
                    minWidth: '100%',
                    width: 200,
                    responsive: {
                        visible: 'lg',
                        hidden: 'md',
                    },
                    template: function (row) {
                        let notes = row.notes && row.notes != '' ? row.notes : '-';
                        if (row.payment && canPerformAction('bookeeping.payments.read')) {
                            notes += `<br><a href="/#/payment/list/${row.payment}" class="font-weight-boldest text-primary" style="font-size: .9rem;">pagamento rimborso associato</a>`;
                        }
                        return `<div class="font-size-sm" style="line-height: 1.2;">${notes}</div>`;
                    },
                },
                {
                    field: '',
                    title: '',
                    sortable: false,
                    overflow: 'visible',
                    textAlign: 'right',
                    autoHide: false,
                    width: 120,
                    minWidth: '100%',
                    template: function (row) {
                        let pdfLink =
                            __bakney.env.HOST +
                            '/document/retrieve/' +
                            row.document +
                            '?download=false&token=' +
                            row.document_token;
                        waitForElementAndExecute(`#action-col-${row.instructor_hours_id}`, () => {
                            if (document.querySelector(`#action-col-${row.instructor_hours_id}`))
                                document.querySelector(`#action-col-${row.instructor_hours_id}`).innerHTML = '';

                            if (row.document) {
                                let documentButton = new DocumentButton({
                                    target: document.querySelector(`#action-col-${row.instructor_hours_id}`),
                                    intro: true,
                                    props: {
                                        disabled: false,
                                        popover_text: `Scarica il compenso - ${moment(row.date).format('DD/MM/YYYY')}`,
                                    },
                                });

                                documentButton.$on('open', data => {
                                    let filePreview = new DocumentPreviewModal({
                                        target: document.querySelector(`#action-col-${row.instructor_hours_id}`),
                                        intro: true,
                                        props: {
                                            pdfLink: pdfLink,
                                            id: row.instructor_hours_id,
                                            title: `Compenso istruttore - ${moment(row.date).format('DD/MM/YYYY')}`,
                                            signatureButton: true,
                                            signatureFunction: () => {
                                                // init SignatureModal
                                                let signatureModal = new DocumentSignatureModal({
                                                    target: document.querySelector(
                                                        `#action-col-${row.instructor_hours_id}`
                                                    ),
                                                    props: {
                                                        id: row.payment,
                                                        show: true,
                                                        type: 'payment',
                                                    },
                                                });

                                                // listen for close event
                                                signatureModal.$on('close', data => {
                                                    // set filePreview prop show to false
                                                    filePreview.$set({show: false});
                                                    datatable.reload();
                                                });
                                            },
                                        },
                                    });
                                });
                            }

                            let editBtn = new EditButton({
                                target: document.querySelector(`#action-col-${row.instructor_hours_id}`),
                                intro: true,
                                props: {
                                    disabled: row.payment || !canPerformAction('association.instructor.hours.update'),
                                    hidden: false,
                                },
                            });

                            let editModal = new AddEditModal({
                                target: document.querySelector(`#action-col-${row.instructor_hours_id}`),
                                intro: true,
                                props: {
                                    id: row.instructor_hours_id,
                                    row: row,
                                    ktdatable: KTDatatableHours,
                                    edit: true,
                                },
                            });

                            editModal.$on('close', data => {
                                fetchInfoWidget();
                            });

                            editBtn.$on('open', data => {
                                jQuery(`#modal-${row.instructor_hours_id}`).modal('show');
                            });
                            let deleteBtn = new DeleteButton({
                                target: document.querySelector(`#action-col-${row.instructor_hours_id}`),
                                intro: true,
                                props: {
                                    disabled: row.payment || !canPerformAction('association.instructor.hours.delete'),
                                },
                            });

                            deleteBtn.$on('open', data => {
                                swal.fire({
                                    text: "Vuoi eliminare l'istruttore?",
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
                                            replaceUID(
                                                replaceUID(__bakney.env.API.INSTRUCTOR.HOURS.DELETE, row.instructor),
                                                row.instructor_hours_id,
                                                '<hour_uid>'
                                            ),
                                            {
                                                method: 'DELETE',
                                            }
                                        );

                                        KTApp.unblockPage();

                                        if (!response.error) {
                                            KTDatatableHours.reload();
                                            toast.success('Istruttore eliminato!');
                                        } else {
                                            toast.error('Qualcosa è andato storto.');
                                        }
                                    }
                                });
                            });
                        });
                        return `<div id="action-col-${row.instructor_hours_id}" class="action-column pr-4"></div>`;
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

            // jQuery('#kt_datatable_search_status').on('change', function () {
            //     datatable.search(jQuery(this).val().toLowerCase(), 'status_flag');
            // });

            // jQuery('#kt_datatable_search_status').selectpicker();

            jQuery('#date-range, #date-range_modal').daterangepicker({
                buttonClasses: ' btn',
                applyClass: 'btn-primary',
                cancelClass: 'btn-secondary',
                autoUpdateInput: true,
                startDate: moment().startOf('month'),
                endDate: moment().endOf('month'),
                ranges: {
                    Oggi: [moment(), moment()],
                    Ieri: [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    'Ultimi 30 giorni': [moment().subtract(29, 'days'), moment()],
                    'Questo mese': [moment().startOf('month'), moment().endOf('month')],
                    'Mese scorso': [
                        moment().subtract(1, 'month').startOf('month'),
                        moment().subtract(1, 'month').endOf('month'),
                    ],
                },
                locale: {
                    format: 'DD/MM/YYYY',
                    separator: ' al ',
                    cancelLabel: 'Annulla',
                    applyLabel: 'Applica',
                    fromLabel: 'Dal',
                    toLabel: 'al',
                    customRangeLabel: 'Periodo personalizzato',
                    daysOfWeek: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'],
                    monthNames: [
                        'Gennaio',
                        'Febbraio',
                        'Marzo',
                        'Aprile',
                        'Maggio',
                        'Giugno',
                        'Luglio',
                        'Agosto',
                        'Settembre',
                        'Ottobre',
                        'Novembre',
                        'Dicembre',
                    ],
                },
            });

            jQuery('#date-range').on('change', function () {
                datatable.search(jQuery(this).val().toLowerCase(), 'date_range');
                currentFilter = jQuery(this).val();
                fetchInfoWidget();
            });

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
            reinit: function () {
                // delete datatable
                datatable.destroy();
                // reinit
                localSelectorDemo();
            },
        };
    })();

    function addCompensation() {
        swal.fire({
            html: `<span class="text-center"><h6>Verrà creato il compenso solo per le ore che:</h6><br><ul class="list-unstyled text-left"><li>1. non sono ancora state pagate</li><li>2. non hanno un pagamento associato</li></ul><br></span><h6>Continuare?</h6>`,
            icon: 'warning',
            buttonsStyling: true,
            showCancelButton: true,
            cancelButtonText: 'Annulla',
            confirmButtonText: 'Crea compenso',
            reverseButtons: true,
        }).then(async function (result) {
            if (result.isConfirmed) {
                let records = jQuery('#kt_datatable').KTDatatable('getSelectedRecords').dataSet;
                let checkedNodes = datatable?.getSelectedRecords();
                let count = checkedNodes.length;
                KTApp.blockPage({
                    overlayColor: '#000000',
                    state: 'primary',
                    message: 'Operazione in corso...',
                });
                let hours = [];
                if (count > 0) {
                    for (let i = 0; i < count; i++) {
                        let id = checkedNodes[i].dataset.row;
                        hours = [...hours, records[id].instructor_hours_id];
                    }
                }

                let res = await apiFetch(replaceUID(__bakney.env.API.INSTRUCTOR.HOURS.ADD_COMPENSATION, id), {
                    method: 'POST',
                    body: JSON.stringify({
                        hours: hours,
                    }),
                });
                visibleMultiaction = false;

                KTApp.unblockPage();

                if (res.error) {
                    toast.error('Qualcosa è andato storto.');
                } else {
                    toast.success('Compensi creati');
                }

                KTDatatableHours.reinit();
            }
        });
    }

    async function fetchInfoWidget() {
        const response = await apiFetch(
            `${replaceUID(__bakney.env.API.INSTRUCTOR.INFO, id)}?date_range=${currentFilter}`,
            {
                method: 'GET',
            }
        ).then(res => {
            data = res.response;
            loading = false;
        });
    }

    onMount(async () => {
        localStorage.removeItem('kt_datatable-1-meta');
        KTDatatableHours.init();
        jQuery('body').tooltip({selector: '[data-toggle=tooltip]', trigger: 'hover'});
        jQuery('body').popover({selector: '[data-toggle=popover]', trigger: 'hover'});
        fetchInfoWidget();
    });

    onDestroy(() => {
        document.querySelectorAll('.popover').forEach(popover => popover.remove());
    });
</script>

<!--begin::Entry-->
<div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}} class="d-flex flex-column-fluid">
    <!--begin::Container-->
    <div class="container container-overlay">
        <!--begin::Card-->
        <div class="card card-custom gutter-b">
            <div class="card-header p-0 header-mobile-btn-back border-0">
                <div class="card-toolbar d-flex gap-4" style="gap: .5rem;">
                    <BackButton />
                </div>
                <div class="card-toolbar">
                    <h3 class="card-title font-size-h2">
                        {data.data?.first_name?.toUpperCase() || ''}
                        {data.data?.last_name?.toUpperCase() || ''}
                    </h3>
                </div>
                <div class="card-toolbar">
                    <!--begin::Button-->
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <button
                        disabled={!canPerformAction('association.instructor.hours.create')}
                        class="btn btn-sm btn-primary font-weight-bolder m-2"
                        on:click={() => {
                            jQuery(`#modal-${id}`).modal('show');
                        }}>
                        <Clock size={18} weight="duotone" />
                        <span class="ml-1"><span class="d-none d-md-inline-block">Aggiungi</span></span>
                    </button>
                    <!--end::Button-->
                </div>
            </div>
            <div class="card-body p-0">
                <div class="mb-2">
                    <h2>Scheda compensi</h2>
                    <span class="text-muted">Riepilogo di ore e compensi istruttore.</span>
                </div>
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

                                <div class="my-1 my-md-0 mr-2">
                                    <div class="d-flex align-items-center">
                                        <input
                                            type="text"
                                            style="max-width: 15rem;width: 14.2rem"
                                            class="form-control form-control-solid my-auto px-2 text-center"
                                            id="date-range"
                                            bind:value={currentFilter}
                                            placeholder="Seleziona un periodo" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {#if !loading}
                    <div
                        class="d-none d-md-flex justify-content-start mb-2 mt-2 mt-md-0 pb-2 pb-md-0 overflow-auto"
                        style="flex-wrap: wrap;">
                        <div class="col-12 col-md-3 p-2 pr-md-4" in:scale={{duration: 250, start: 0.92}}>
                            <div class="card-widget card p-0 m-0">
                                <div class="card-body p-4">
                                    <div class="mb-0">
                                        <h6 class="font-weight-boldest text-center mb-0" style="font-size: 1rem;">
                                            ORE LAVORATE
                                            <br />
                                        </h6>
                                    </div>
                                    <div
                                        class="text-center font-weight-bolder text-primary"
                                        style="font-size: 1.75rem;">
                                        <span class="text-primary"
                                            >{Number(data.stats?.hours || 0).toLocaleString('it-IT', {
                                                maximumFractionDigits: 2,
                                                minimumFractionDigits: 2,
                                            })}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-3 p-2 pr-md-4" in:scale={{duration: 250, start: 0.92}}>
                            <div class="card-widget card p-0 m-0">
                                <div class="card-body p-4">
                                    <div class="mb-0">
                                        <h6 class="font-weight-boldest text-center mb-0" style="font-size: 1rem;">
                                            COMPENSO TOTALE
                                            <br />
                                        </h6>
                                    </div>
                                    <div
                                        class="text-center font-weight-bolder text-primary"
                                        style="font-size: 1.75rem;">
                                        <span class="text-primary"
                                            >{Number(data.stats?.total_amount || 0).toLocaleString('it-IT', {
                                                maximumFractionDigits: 2,
                                                minimumFractionDigits: 2,
                                            })} €
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-3 p-2 pr-md-4" in:scale={{duration: 250, start: 0.92}}>
                            <div class="card-widget card p-0 m-0">
                                <div class="card-body p-4">
                                    <div class="mb-0">
                                        <h6 class="font-weight-boldest text-center mb-0" style="font-size: 1rem;">
                                            COMPENSO DA PAGARE
                                            <br />
                                        </h6>
                                    </div>
                                    <div
                                        class="text-center font-weight-bolder text-primary"
                                        style="font-size: 1.75rem;">
                                        <span class="text-danger"
                                            >{Number(data.stats?.total_amount_to_pay || 0).toLocaleString('it-IT', {
                                                maximumFractionDigits: 2,
                                                minimumFractionDigits: 2,
                                            })} €
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-3 p-2 pr-md-4" in:scale={{duration: 250, start: 0.92}}>
                            <div class="card-widget card p-0 m-0">
                                <div class="card-body p-4">
                                    <div class="mb-0">
                                        <h6 class="font-weight-boldest text-center mb-0" style="font-size: 1rem;">
                                            COMPENSO PAGATO
                                            <br />
                                        </h6>
                                    </div>
                                    <div
                                        class="text-center font-weight-bolder text-primary"
                                        style="font-size: 1.75rem;">
                                        <span class="text-success"
                                            >{Number(data.stats?.total_amount_paid || 0).toLocaleString('it-IT', {
                                                maximumFractionDigits: 2,
                                                minimumFractionDigits: 2,
                                            })} €
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                {/if}
                {#if visibleMultiaction}
                    <div in:slide={{duration: 100}} class="mt-10 mb-5" id="kt_datatable_group_action_form">
                        <div class="d-flex align-items-center">
                            <div class="font-weight-boldest mr-3 ml-2" style="font-size:1.1rem;">
                                {selectedCounter} selezionati
                            </div>
                            <button
                                disabled={!canPerformAction('association.instructor.hours.create')}
                                on:click={() => addCompensation()}
                                class="btn btn-sm btn-primary font-weight-bolder m-0 ml-2 p-2 d-flex align-items-center"
                                type="button"
                                data-toggle="tooltip"
                                data-placement="top"
                                title="Crea compenso"
                                id="kt_datatable_approve_selected">
                                <Calculator size="17" weight="duotone" class="mr-1" />

                                <span class="d-none d-md-block">Crea compenso</span></button>
                        </div>
                    </div>
                {/if}
                <div class="datatable datatable-bordered datatable-head-custom" id="kt_datatable" />
            </div>
        </div>
    </div>
    <!--end::Container-->
</div>
<!--end::Entry-->

<AddEditModal
    edit={false}
    {id}
    ktdatable={KTDatatableHours}
    bind:instructorData={data}
    on:close={() => {
        fetchInfoWidget();
    }} />
