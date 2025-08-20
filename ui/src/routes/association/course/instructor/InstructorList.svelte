<script>
    import {sessionToken, userData} from 'store/stores.js';
    import {scale} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import {onMount, onDestroy} from 'svelte';
    import {push} from 'svelte-spa-router';
    import {replaceUID, apiFetch} from 'utils/ApiMiddleware.js';
    import {Printer, UserPlus} from 'phosphor-svelte';
    import EditButton from 'components/buttons/EditButton.svelte';
    import DeleteButton from 'components/buttons/DeleteButton.svelte';
    import EditModal from './modals/EditModal.svelte';
    import {waitForElementAndExecute} from 'utils/Functions';
    import {canPerformAction} from 'utils/Permissions';
    import {toast} from 'svelte-sonner';
    import ReportModal from './modals/ReportModal.svelte';

    sessionToken.useLocalStorage();
    userData.useLocalStorage();

    let instructors = [];

    const connectedUser = {
        0: '<span class="label label-light-danger label-inline font-weight-bolder label-lg">nessuno</span>',
        1: '<span class="label label-light-success label-inline font-weight-bolder label-lg">associato</span>',
    };

    let KTDatatableCourses = (function () {
        // Private functions
        var datatable;

        var options = {
            // datasource definition
            data: {
                responsive: true,
                type: 'remote',
                source: {
                    read: {
                        url: __bakney.env.API.INSTRUCTOR.LIST,
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

                            if ($userData.instructor_id != null) {
                                dataSet = dataSet.filter(function (item) {
                                    return item.instructor_id == $userData.instructor_id;
                                });
                            }
                            instructors = dataSet;
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
                    field: 'name',
                    title: 'Nome e Cognome',
                    autoHide: false,
                    sortable: false,
                    minWidth: '100%',
                    template: function (row) {
                        return (
                            `<a class="link link-primary font-weight-bolder mb-0" href="/#/course/instructor/info/${row.instructor_id}" use:link >` +
                            row.first_name.toUpperCase() +
                            ' ' +
                            row.last_name.toUpperCase() +
                            '</a>'
                        );
                    },
                },
                {
                    field: 'email',
                    title: 'Email',
                    sortable: false,
                    responsive: {
                        visible: 'lg',
                        hidden: 'md',
                    },
                    template: function (row) {
                        return '<p class="text-dark-75 font-weight-bolder mb-0">' + row.email.toLowerCase() + '</p>';
                    },
                },
                {
                    field: 'phone',
                    title: 'Telefono',
                    sortable: false,
                    responsive: {
                        visible: 'lg',
                        hidden: 'md',
                    },
                    template: function (row) {
                        let phone = row.phone != '' ? row.phone : '-';
                        return '<p class="text-dark-75 font-weight-bolder mb-0">' + phone + '</p>';
                    },
                },
                {
                    field: 'associated_user_id',
                    title: 'Account',
                    sortable: false,
                    responsive: {
                        visible: 'lg',
                        hidden: 'md',
                    },
                    template: function (row) {
                        let associato = row.associated_user_id != null ? 1 : 0;
                        return connectedUser[associato];
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
                        let disablePayment = row.paid;
                        let disableAccount = true;
                        waitForElementAndExecute(`#action-col-${row.instructor_id}`, () => {
                            if (document.querySelector(`#action-col-${row.instructor_id}`))
                                document.querySelector(`#action-col-${row.instructor_id}`).innerHTML = '';

                            let editBtn = new EditButton({
                                target: document.querySelector(`#action-col-${row.instructor_id}`),
                                intro: true,
                                props: {
                                    disabled: !canPerformAction('association.instructor.update'),
                                    hidden: false,
                                },
                            });

                            let editModal = new EditModal({
                                target: document.querySelector(`#action-col-${row.instructor_id}`),
                                intro: true,
                                props: {
                                    id: row.instructor_id,
                                    row: row,
                                    ktdatable: KTDatatableCourses,
                                },
                            });

                            editBtn.$on('open', data => {
                                jQuery(`#editModal-${row.instructor_id}`).modal('show');
                            });
                            let deleteBtn = new DeleteButton({
                                target: document.querySelector(`#action-col-${row.instructor_id}`),
                                intro: true,
                                props: {
                                    disabled: row.invoice || !canPerformAction('association.instructor.delete'),
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
                                            replaceUID(__bakney.env.API.INSTRUCTOR.DELETE, row.instructor_id),
                                            {
                                                method: 'DELETE',
                                            }
                                        );

                                        KTApp.unblockPage();

                                        if (!response.error) {
                                            KTDatatableCourses.reload();
                                            toast.success('Istruttore eliminato!');
                                        } else {
                                            toast.error('Qualcosa è andato storto.');
                                        }
                                    }
                                });
                            });
                        });
                        return `<div id="action-col-${row.instructor_id}" class="action-column pr-4"></div>`;
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
                        Istruttori
                        <span class="d-block text-muted pt-2 font-size-sm"
                            >Contiene la lista completa degli istruttori.</span>
                    </h3>
                </div>
                <div class="card-toolbar">
                    <!--begin::Button-->
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <button
                        class="btn btn-sm btn-light-primary font-weight-bolder m-2"
                        on:click={() => {
                            let reportModal = new ReportModal({
                                target: document.querySelector(`#portal-elements`),
                                intro: true,
                                props: {
                                    show: true,
                                },
                            });
                        }}>
                        <Printer size={18} weight="duotone" />
                        <span class="ml-1">Stampa Report</span>
                    </button>
                    <!--end::Button-->
                    <!--begin::Button-->
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <button
                        disabled={!canPerformAction('association.instructor.create')}
                        on:click={() => push('/course/instructor/add')}
                        class="btn btn-sm btn-primary font-weight-bolder m-2">
                        <UserPlus size={18} weight="duotone" />
                        <span class="ml-1"><span class="d-none d-md-inline-block">Istruttore</span></span>
                    </button>
                    <!--end::Button-->
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
