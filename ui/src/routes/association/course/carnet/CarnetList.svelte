<script>
    import {sessionToken} from 'store/stores.js';
    import {scale} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import {onMount, onDestroy} from 'svelte';
    import {link} from 'svelte-spa-router';
    import {replaceUID} from 'utils/ApiMiddleware.js';
    import DeleteButton from 'components/buttons/DeleteButton.svelte';
    import {waitForElementAndExecute} from 'utils/Functions';
    import {PlusCircle} from 'phosphor-svelte';
    import {canPerformAction} from 'utils/Permissions';
    import {toast} from 'svelte-sonner';

    sessionToken.useLocalStorage();

    let carnets = [];
    const statusTextDictionary = {
        false: '<span class="label label-light-info label-inline font-weight-bolder label-lg">privato</span>',
        true: '<span class="label label-light-success label-inline font-weight-bolder label-lg">pubblico</span>',
    };

    window.deleteCarnet = id => {
        swal.fire({
            text: 'Vuoi eliminare definitivamente il carnet? Non influirà sui carnet già venduti.',
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

                const url = replaceUID(__bakney.env.API.CARNET.DELETE, id);

                window
                    .fetch(url, {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            Authorization: 'Bearer ' + $sessionToken,
                        },
                    })
                    .then(response => {
                        response.json();
                        // spinner stop
                        KTApp.unblockPage();
                        if (response.status == 200) {
                            toast.success('Corso Eliminato!');
                            jQuery('#kt_datatable').KTDatatable('reload');
                            jQuery('body').tooltip({selector: '[data-toggle=tooltip]', trigger: 'hover'});
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
                        }
                    });
            }
        });
    };

    let KTDatatableCourses = (function () {
        // Private functions

        var options = {
            // datasource definition
            data: {
                responsive: true,
                type: 'remote',
                source: {
                    read: {
                        url: __bakney.env.API.CARNET.LIST,
                        method: 'GET',
                        params: {
                            // API params
                        },
                        headers: {
                            Authorization: 'Bearer ' + $sessionToken,
                        },
                        map: function (raw) {
                            var dataSet = raw;
                            if (typeof raw.data !== 'undefined') {
                                dataSet = raw.data;
                            }
                            carnets = dataSet;
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
                    field: 'title',
                    title: 'Titolo',
                    autoHide: false,
                    sortable: false,
                    template: function (row) {
                        return (
                            '</div style="cursor:pointer"><a href=\'/#/course/carnet/list/detail/' +
                            row.carnet_id +
                            '\'><div class="d-flex justify-content-start align-items-center"><div class="mr-1">' +
                            '</div><span class="navi-text font-weight-bolder text-hover-primary" style="cursor: pointer"><b>' +
                            row.title.charAt(0).toUpperCase() +
                            row.title.slice(1) +
                            '</b></span></div></a>'
                        );
                    },
                },
                {
                    field: 'description',
                    title: 'Descrizione',
                    sortable: false,
                    responsive: {
                        visible: 'lg',
                        hidden: 'md',
                    },
                    template: function (row) {
                        let lenSubstring = 20;
                        return (
                            '<span style="word-break: keep-all;">' +
                            row.description.substring(0, lenSubstring) +
                            (row.description.length > lenSubstring ? '[...]' : '') +
                            '<span>'
                        );
                    },
                },
                {
                    field: 'public',
                    title: 'Stato',
                    width: 70,
                    sortable: false,
                    responsive: {
                        visible: 'lg',
                        hidden: 'md',
                    },
                    responsive: {
                        visible: 'lg',
                        hidden: 'md',
                    },
                    template: function (row) {
                        return statusTextDictionary[row.public];
                    },
                },
                {
                    field: 'fee',
                    title: 'Costo',
                    width: 70,
                    sortable: false,
                    responsive: {
                        visible: 'lg',
                        hidden: 'md',
                    },
                    template: function (row) {
                        let amount = "<span style='font-weight:600'>€ " + row.fee.replace('.', ',') + '</span>';
                        return amount;
                    },
                },
                {
                    field: 'creation_date',
                    title: 'Data Creazione',
                    type: 'date',
                    width: 120,
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
                    field: '',
                    title: '',
                    sortable: false,
                    overflow: 'visible',
                    textAlign: 'right',
                    autoHide: false,
                    width: 70,
                    minWidth: '100%',
                    template: function (row) {
                        waitForElementAndExecute(`#action-col-${row.carnet_id}`, () => {
                            if (document.querySelector(`#action-col-${row.carnet_id}`))
                                document.querySelector(`#action-col-${row.carnet_id}`).innerHTML = '';
                            let deleteBtn = new DeleteButton({
                                target: document.querySelector(`#action-col-${row.carnet_id}`),
                                intro: true,
                                props: {
                                    disabled: !canPerformAction('association.carnet.delete'),
                                },
                            });

                            deleteBtn.$on('open', data => {
                                swal.fire({
                                    text: 'Vuoi eliminare il carnet?',
                                    icon: 'warning',
                                    buttonsStyling: true,
                                    showCancelButton: true,
                                    cancelButtonText: 'Annulla',
                                    confirmButtonText: 'Elimina',
                                    reverseButtons: true,
                                    confirmButtonColor: '#d63030',
                                }).then(async function (result) {
                                    if (result.isConfirmed) {
                                        deleteCarnet(row.carnet_id);
                                    }
                                });
                            });
                        });
                        return `<div id="action-col-${row.carnet_id}" class="action-column pr-4"></div>`;
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
        };
    })();

    onMount(() => {
        localStorage.removeItem('kt_datatable-1-meta');
        KTDatatableCourses.init();
        jQuery('body').tooltip({selector: '[data-toggle=tooltip]', trigger: 'hover'});
        jQuery('body').popover({selector: '[data-toggle=popover]', trigger: 'hover'});
    });

    onDestroy(() => {
        document.querySelectorAll('.popover').forEach(popover => popover.remove());
    });
</script>

<!--begin::Entry-->
<div
    in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}}
    class="d-flex flex-column-fluid font-weight-bold text-dark-50">
    <!--begin::Container-->
    <div class="container">
        <!--begin::Card-->
        <div class="card card-custom gutter-b">
            <div class="card-header flex-wrap border-0 p-0">
                <div class="card-title">
                    <h3 class="card-label font-size-h2">
                        Carnet
                        <span class="d-block text-muted pt-2 font-size-sm"
                            >Contiene la lista completa dei carnet entrate che hai creato.</span>
                    </h3>
                </div>
                <div class="card-toolbar">
                    {#if canPerformAction('association.carnet.create')}
                        <a
                            href="/course/carnet/add"
                            use:link
                            class="btn btn-primary btn-sm m-2 d-flex align-items-center font-weight-boldest">
                            <PlusCircle size={18} weight="duotone" class="mr-1" />Carnet</a>
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
                                <div class="col-md-4 my-2 my-md-0">
                                    <div class="d-flex align-items-center">
                                        <!-- svelte-ignore a11y-label-has-associated-control -->
                                        <label class="mr-3 mb-0 d-none d-md-block font-weight-bold">Stato</label>
                                        <select class="form-control" id="kt_datatable_search_status">
                                            <option value="">Tutto</option>
                                            <option value="1">in bozza</option>
                                            <option value="2">pubblicato</option>
                                        </select>
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
