<script>
    import {sessionToken} from 'store/stores.js';
    import {scale} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import {onMount, onDestroy} from 'svelte';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import XCircle from 'components/buttons/XCircle.svelte';
    import {waitForElementAndExecute} from 'utils/Functions';
    import {canPerformAction} from 'utils/Permissions';
    import {toast} from 'svelte-sonner';

    sessionToken.useLocalStorage();

    export let info = {};
    let transfers = [];
    let options;
    let datatable;

    const statusTextDictionary = {
        1: '<span class="label label-light-warning label-inline font-weight-bolder label-lg">in attesa</span>',
        2: '<span class="label label-light-success label-inline font-weight-bolder label-lg">accettata</span>',
        3: '<span class="label label-light-danger label-inline font-weight-bolder label-lg">rifiutata</span>',
        4: '<span class="label label-light-primary label-inline font-weight-bolder label-lg">scaduta</span>',
    };

    $: transfers, jQuery('#kt_datatable_transfers').KTDatatable('reload');

    async function fetchData() {
        const res = await apiFetch(`${__bakney.env.API.SUBSCRIPTION.TRANSFER.LIST}`, {
            method: 'GET',
        });

        if (!res.error) {
            transfers = res.response.data?.filter(item => item.subscription?.subscription_id == info.subscription_id);
        } else {
            toast.error('Qualcosa è andato storto.');
        }
    }

    onMount(async () => {
        await fetchData();

        jQuery(document).ready(function () {
            KTDatatableComp.init(transfers);
            jQuery('body').tooltip({selector: '[data-toggle=tooltip]', trigger: 'hover'});
        });
    });

    onDestroy(() => {
        document.querySelectorAll('.popover').forEach(popover => popover.remove());
        document.querySelectorAll('.tooltip').forEach(popover => popover.remove());
    });

    let KTDatatableComp = (function (source) {
        // Private functions

        options = {
            // datasource definition
            data: {
                responsive: true,
                type: 'local',
                source: transfers,
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
                input: jQuery('#kt_datatable_transfers_search_query'),
                //onEnter: true,
                key: 'generalSearch',
            },

            // columns definition
            columns: [
                {
                    field: 'recipient',
                    title: 'Dai accesso a',
                    autoHide: false,
                    template: function (row) {
                        if (row.recipient)
                            return (
                                `<a class="font-weight-bolder" href="/#/search/profile/${row.recipient.username}" >` +
                                row.recipient.first_name +
                                ' ' +
                                row.recipient.last_name +
                                '</a>'
                            );
                        else return 'Nessun utente associato';
                    },
                },
                {
                    field: 'status',
                    title: 'Stato',
                    width: 80,
                    autoHide: false,
                    sortCallback: function (data, sort, column) {
                        let statusArray = Object.values(data);

                        statusArray.sort(function (a, b) {
                            let timeA = parseInt(a['status']);
                            let timeB = parseInt(b['status']);
                            if (sort === 'asc') {
                                return timeA > timeB ? 1 : timeA < timeB ? -1 : 0;
                            } else {
                                return timeA < timeB ? 1 : timeA > timeB ? -1 : 0;
                            }
                        });
                        let newData = {};
                        for (let i = 0; i < statusArray.length; i++) {
                            newData[i] = statusArray[i];
                        }

                        return newData;
                    },
                    template: function (row) {
                        return statusTextDictionary[row.status];
                    },
                },
                {
                    field: 'expires_at',
                    title: 'Scade il',
                    type: 'date',
                    width: 80,
                    responsive: {
                        visible: 'lg',
                        hidden: 'md',
                    },
                    sortCallback: function (data, sort, column) {
                        let dataArray = Object.values(data);
                        dataArray.sort(function (a, b) {
                            let timeA = new Date(a['expires_at']).getTime();
                            let timeB = new Date(b['expires_at']).getTime();
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
                        return moment(new Date(row.expires_at)).format('DD/MM/YYYY');
                    },
                },
                // {
                //     field: 'meta',
                //     title: 'Lezioni',
                //     autoHide: false,
                //     sortable: false,
                //     textAlign: 'right',
                //     width: 70,
                //     minWidth: '100%',
                //     template: function (row) {
                //         return (
                //             '<span class="font-weight-bolder text-primary" style="word-break: keep-all;">' +
                //             '<span class="text-success">' +
                //             row.lessons_left +
                //             '</span>' +
                //             '/' +
                //             row.lessons_counter +
                //             '<span>'
                //         );
                //     },
                // },
                {
                    field: '',
                    title: '',
                    sortable: false,
                    textAlign: 'right',
                    width: 30,
                    autoHide: false,
                    minWidth: '100%',
                    template: function (row) {
                        waitForElementAndExecute(`#action-col-${row.subscription_transfer_id}`, () => {
                            if (document.querySelector(`#action-col-${row.subscription_transfer_id}`))
                                document.querySelector(`#action-col-${row.subscription_transfer_id}`).innerHTML = '';

                            let reject = new XCircle({
                                target: document.querySelector(`#action-col-${row.subscription_transfer_id}`),
                                intro: true,
                                props: {
                                    disabled:
                                        row.is_expired ||
                                        row.status != 1 ||
                                        !canPerformAction('association.members.update'),
                                    popover_text: 'Annulla invito',
                                },
                            });

                            reject.$on('open', data => {
                                swal.fire({
                                    text: `Vuoi cancellare l'invito?`,
                                    icon: 'warning',
                                    buttonsStyling: true,
                                    showCancelButton: true,
                                    cancelButtonText: 'Annulla',
                                    confirmButtonText: 'Cancella',
                                    reverseButtons: true,
                                    confirmButtonColor: '#d63030',
                                }).then(async function (result) {
                                    if (result.isConfirmed) {
                                        KTApp.blockPage({
                                            overlayColor: '#000000',
                                            state: 'primary',
                                            message: 'Operazione in corso...',
                                        });

                                        const response = await apiFetch(
                                            replaceUID(
                                                replaceUID(
                                                    __bakney.env.API.SUBSCRIPTION.TRANSFER.EXPIRE,
                                                    info.subscription_id
                                                ),
                                                row.subscription_transfer_id,
                                                '<transfer_uid>'
                                            ),
                                            {
                                                method: 'PATCH',
                                            }
                                        );

                                        KTApp.unblockPage();

                                        if (response.status == 200) {
                                            setTimeout(async () => {
                                                window.location.reload();
                                            }, 500);
                                            toast.success('Invito di accesso cancellato!');
                                        } else {
                                            toast.error('Qualcosa è andato storto.');
                                        }
                                    }
                                });
                            });
                        });
                        return `<div id="action-col-${row.subscription_transfer_id}" class="action-column pr-4"></div>`;
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
                input: jQuery('#kt_datatable_transfers_search_query'),
                //onEnter: true,
                key: 'generalSearch',
            };

            datatable = jQuery('#kt_datatable_transfers').KTDatatable(options);

            jQuery('#kt_datatable_transfers_search_status').on('change', function () {
                datatable.search(jQuery(this).val().toLowerCase(), 'disabled');
            });

            jQuery('#kt_datatable_transfers_search_status').selectpicker();

            datatable.on('datatable-on-check datatable-on-uncheck', function (e) {
                var checkedNodes = datatable.rows('.datatable-row-active').nodes();
                var count = checkedNodes.length;
                jQuery('#kt_datatable_transfers_selected_records').html(count);
                if (count > 0) {
                    jQuery('#kt_datatable_transfers_group_action_form').collapse('show');
                } else {
                    jQuery('#kt_datatable_transfers_group_action_form').collapse('hide');
                }
            });

            jQuery('#kt_datatable_transfers_fetch_modal')
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
                    jQuery('#kt_datatable_transfers_fetch_display').append(c);
                })
                .on('hide.bs.modal', function (e) {
                    jQuery('#kt_datatable_transfers_fetch_display').empty();
                });
        };

        return {
            // public functions
            init: function (datasource) {
                if (datasource) options.data.source = datasource;
                localSelectorDemo();
                //serverSelectorDemo();
            },
            reload: () => {
                datatable.reload();
            },
        };
    })();
</script>

<!--begin::Entry-->
<div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}}>
    <div class="row">
        <div class="col-12 mt-2">
            <h3 class="card-label font-size-h2">
                Accessi da {__bakney.OEM_CONFIG?.name}
                <span class="d-block text-muted pt-2 font-size-sm"
                    >Lista delle richieste di accesso da {__bakney.OEM_CONFIG?.name} legate a questa iscrizione.</span>
            </h3>
        </div>
    </div>
    <div class="row">
        <div class="col-12 mt-4">
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
                                        id="kt_datatable_transfers_search_query" />
                                    <span>
                                        <i class="flaticon2-search-1 text-muted" />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!--begin: Datatable-->
            <div class="datatable datatable-bordered datatable-head-custom" id="kt_datatable_transfers" />
            <!--end: Datatable-->
        </div>
    </div>
</div>
