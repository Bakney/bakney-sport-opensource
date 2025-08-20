<script>
    import {sessionToken} from 'store/stores.js';
    import {replaceUID} from 'utils/ApiMiddleware.js';
    import {onDestroy} from 'svelte';
    import {scale} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import {waitForElementAndExecute} from 'utils/Functions.js';
    import ArchiveButton from 'components/buttons/ArchiveButton.svelte';
    import RepeatButton from 'components/buttons/RepeatButton.svelte';
    import {canPerformAction} from 'utils/Permissions.js';
    import NavigationTab from './shared/NavigationTab.svelte';
    import {toast} from 'svelte-sonner';
    import RenewalModal from './modals/RenewalModal.svelte';
    sessionToken.useLocalStorage();

    const statusTextDictionary = {
        1: '<span class="label label-light-info label-inline font-weight-bolder label-lg">Non Firmata</span>',
        2: '<span class="label label-light-warning label-inline font-weight-bolder label-lg">In Attesa</span>',
        3: '<span class="label label-light-danger label-inline font-weight-bolder label-lg">Rifiutata</span>',
        4: '<span class="label label-light-success label-inline font-weight-bolder label-lg">Accettata</span>',
        5: '<span class="label label-light-dark label-inline font-weight-bolder label-lg">Archiviata</span>',
    };

    onDestroy(() => {
        document.querySelectorAll('.popover').forEach(popover => popover.remove());
        document.querySelectorAll('.tooltip').forEach(popover => popover.remove());
    });

    let KTDatatableRecordSelectionDemo = (function () {
        // Private functions
        var datatable;

        var options = {
            // datasource definition
            data: {
                responsive: true,
                type: 'remote',
                source: {
                    read: {
                        url: __bakney.env.HOST + '/subscription/list/archived',
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
                    field: 'associate',
                    title: 'Tesserato',
                    autoHide: false,
                    sortable: false,
                    template: function (row) {
                        let name = capitalizeWords(`${row.associate.first_name} ${row.associate.last_name}`);
                        if (name == ' ') name = '- -';
                        let content =
                            "<div class='font-weight-200 ml-2 mr-2'><div class='mb-2'>" +
                            row.associate?.born_date +
                            ' (' +
                            (row.associate?.is_minor ? 'Minore' : 'Adulto') +
                            ')' +
                            "</div><div class='mb-2'>" +
                            (row.associate?.sex == 'F'
                                ? "Femmina <i class='fas fa-female ml-2 mr-2'></i>"
                                : row.associate?.sex == 'M'
                                ? "Maschio <i class='fas fa-male ml-2 mr-2'></i>"
                                : "Altro <i class='fas fa-transgender ml-2 mr-2'></i>") +
                            "</div><div class='mb-0'> C.F. " +
                            row.associate?.tax_code?.toUpperCase() +
                            '</div></div>';
                        return KTUtil.isMobileDevice()
                            ? `<a class="navi-text font-weight-bolder text-hover-primary" href="javascript:openDetail('/members/list/detail/${row.subscription_id}/info')">` +
                                  name +
                                  '</span></a>'
                            : `<a class="navi-text font-weight-bolder text-hover-primary" href="javascript:openDetail('/members/list/detail/${row.subscription_id}/info')">` +
                                  '<span id="popover-sub-detail" style="cursor:pointer" ' +
                                  'data-toggle="popover" data-trigger="hover" title="' +
                                  row.associate.first_name?.charAt(0)?.toUpperCase() +
                                  row.associate.first_name?.slice(1) +
                                  (name == '- -' ? '-' : '') +
                                  ' ' +
                                  row.associate.last_name?.charAt(0)?.toUpperCase() +
                                  row.associate.last_name?.slice(1) +
                                  (name == '- -' ? '-' : '') +
                                  '" data-html="true" ' +
                                  'data-content="' +
                                  content +
                                  '">' +
                                  name +
                                  '</span></a>';
                    },
                },
                {
                    field: 'status_flag',
                    title: 'Stato',
                    width: 100,
                    autoHide: false,
                    sortCallback: function (data, sort, column) {
                        let statusArray = Object.values(data);

                        statusArray.sort(function (a, b) {
                            let timeA = parseInt(a['status_flag']);
                            let timeB = parseInt(b['status_flag']);
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
                        return statusTextDictionary[row.status_flag];
                    },
                },
                {
                    field: 'creation_date',
                    title: 'Data',
                    width: 90,
                    type: 'date',
                    responsive: {
                        visible: 'lg',
                        hidden: 'md',
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
                    field: 'user',
                    title: 'Utente',
                    checked: true,
                    sortable: false,
                    width: 120,
                    minWidth: '100%',
                    responsive: {
                        visible: 'lg',
                        hidden: 'md',
                    },
                    template: function (row) {
                        return `<a class="navi-text font-weight-bold text-lowercase text-hover-primary" href="/#/search/profile/${row.user?.username}">${row.user?.username}</a>`;
                    },
                },
                {
                    field: '',
                    title: '',
                    sortable: false,
                    textAlign: 'right',
                    autoHide: false,
                    minWidth: '100%',
                    template: function (row) {
                        waitForElementAndExecute(`#action-col-${row.subscription_id}`, () => {
                            if (document.querySelector(`#action-col-${row.subscription_id}`))
                                document.querySelector(`#action-col-${row.subscription_id}`).innerHTML = '';

                            if (!row?.current_year && !row?.next_years) {
                                let renewBtn = new RepeatButton({
                                    target: document.querySelector(`#action-col-${row.subscription_id}`),
                                    intro: true,
                                    props: {
                                        disabled: !row.renewal_available,
                                        hidden: false,
                                        popover_text: 'Rinnova Iscrizione',
                                    },
                                });
                                renewBtn.$on('open', data => {
                                    // window.renewSubscription(row.associate?.associate_id);

                                    let renewalModal = new RenewalModal({
                                        target: document.querySelector(`#action-col-${row.subscription_id}`),
                                        props: {
                                            id: row.subscription_id,
                                            show: true,
                                            formData: row,
                                        },
                                    });

                                    // listen for confirm event
                                    renewalModal.$on('confirm', data => {
                                        // reload datatable
                                        jQuery('#kt_datatable').KTDatatable('reload');
                                        // delete renewal modal
                                        renewalModal.$destroy();
                                    });
                                });
                            }

                            let archiveBtn = new ArchiveButton({
                                target: document.querySelector(`#action-col-${row.subscription_id}`),
                                intro: true,
                                props: {
                                    disabled: !canPerformAction('association.members.archive.update'),
                                    // hidden: !row.editable,
                                },
                            });

                            archiveBtn.$on('open', async data => {
                                let result = {isConfirmed: false};

                                result = await swal.fire({
                                    text: "Vuoi spostare l'atleta nel libro soci?",
                                    icon: 'question',
                                    buttonsStyling: true,
                                    showCancelButton: true,
                                    cancelButtonText: 'Annulla',
                                    confirmButtonText: 'Sposta nel libro soci',
                                    reverseButtons: true,
                                });
                                if (result.isConfirmed) {
                                    KTUtil.scrollTop();
                                    KTApp.blockPage({
                                        overlayColor: '#000000',
                                        type: 'v2',
                                        state: 'primary',
                                        message: 'Sposto in libro soci...',
                                    });
                                    const url = replaceUID(__bakney.env.API.SUBSCRIPTION.ARCHIVE, row.subscription_id);

                                    let response = await window.fetch(url, {
                                        method: 'POST',
                                        headers: {
                                            Accept: 'application/json',
                                            'Content-Type': 'application/json',
                                            Authorization: 'Bearer ' + $sessionToken,
                                        },
                                    });
                                    response.json();
                                    KTApp.unblockPage();
                                    if (response.status === 200) {
                                        toast.success('Iscrizione spostata nel libro soci.');
                                        // clear datatable
                                        jQuery('#kt_datatable').KTDatatable('destroy');
                                        KTDatatableRecordSelectionDemo.init();
                                    } else {
                                        let modalText =
                                            response.status === 403
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
                                    }
                                }
                            });
                        });

                        return `<div id="action-col-${row.subscription_id}" class="action-column pr-4"></div>`;
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
                datatable.search(jQuery(this).val().toLowerCase(), 'status_flag');
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

    jQuery(document).ready(function () {
        KTDatatableRecordSelectionDemo.init();
        jQuery('body').tooltip({selector: '[data-toggle=tooltip]', trigger: 'hover'});
        jQuery('body').popover({selector: '[data-toggle=popover]', trigger: 'hover'});
    });
</script>

<!--begin::Entry-->
<div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}} class="d-flex flex-column-fluid">
    <!--begin::Container-->
    <div class="container">
        <!--begin::Card-->
        <div class="card card-custom gutter-b">
            <NavigationTab />
            <div class="card-header flex-wrap border-0 p-0">
                <div class="card-title">
                    <h1 class="card-label font-size-h1 font-weight-bolder">
                        Archivio
                        <span class="d-block text-muted pt-2 font-size-sm">Soci e tesserati archiviati.</span>
                    </h1>
                </div>
                <div class="card-toolbar" />
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
