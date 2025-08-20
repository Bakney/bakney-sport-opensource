<script>
    import {sessionToken} from 'store/stores.js';
    import {scale} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import {onDestroy, createEventDispatcher, onMount} from 'svelte';
    import {Plus, PlusCircle} from 'phosphor-svelte';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import AddCourseModal from './modals/AddCourseModal.svelte';
    import {canPerformAction} from 'utils/Permissions';
    import {toast} from 'svelte-sonner';
    import AddEditCourseSubscriptionModal from 'routes/association/course/overview/modals/AddEditCourseSubscriptionModal.svelte';
    import AddEditMembershipModal from 'routes/association/course/overview/modals/AddEditMembershipModal.svelte';
    import ChooseCourseModal from './modals/ChooseCourseModal.svelte';
    import DeleteButton from 'components/buttons/DeleteButton.svelte';
    import {waitForElementAndExecute} from 'utils/Functions';
    import EditButton from 'components/buttons/EditButton.svelte';

    const dispatch = createEventDispatcher();
    sessionToken.useLocalStorage();

    export let courses = {};
    export let info = {};
    let options;
    let showAddCourseModal = false;

    const courseTypeDictionary = {
        1: '<span class="label label-light-primary label-inline font-weight-bolder label-lg">Corso</span>',
        2: '<span class="label label-light-primary label-inline font-weight-bolder label-lg">Corso quote multiple</span>',
        3: '<span class="label label-light-primary label-inline font-weight-bolder label-lg">Abbonamento</span>',
    };

    let availableCourses = [];
    let loadingCourses = true;

    async function fetchAvailableCourses() {
        loadingCourses = true;
        let res = await apiFetch(`${__bakney.env.API.COURSE.LIST}?all=1&subscription_id=${info.subscription_id}`);
        if (!res.error) {
            availableCourses = [
                ...Object.keys(res.response.data)?.map(key => {
                    return {
                        ...res.response.data[key],
                    };
                }),
            ];
        }
        loadingCourses = false;
    }

    onMount(() => {
        fetchAvailableCourses();
    });

    onDestroy(() => {
        document.querySelectorAll('.popover').forEach(popover => popover.remove());
        document.querySelectorAll('.tooltip').forEach(popover => popover.remove());
        // destroy datatable
        jQuery('#kt_datatable_courses').KTDatatable('destroy');
    });

    let KTDatatableCourses = (function () {
        // Private functions

        options = {
            // datasource definition
            data: {
                responsive: true,
                type: 'local',
                source: courses,
                pageSize: 10,
                serverPaging: false,
                serverFiltering: false,
                serverSorting: false,
                autoColumns: false, // autocols
            },

            // layout definition
            layout: {
                scroll: false, // enable/disable datatable scroll both horizontal and
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
                input: jQuery('#kt_datatable_courses_search_query'),
                //onEnter: true,
                key: 'generalSearch',
            },

            // columns definition

            columns: [
                {
                    field: 'title',
                    title: 'Corso',
                    autoHide: false,
                    minWidth: '100%',
                    // width: 120,
                    sortable: false,
                    template: function (row) {
                        return `<a class="text-primary font-weight-bolder" href='#/course/overview/${row.course_id}'>${row.title}</a>`;
                    },
                },
                {
                    field: 'description',
                    title: 'Descrizione',
                    autoHide: false,
                    minWidth: '100%',
                    // width: 120,
                    sortable: false,
                    template: function (row) {
                        return `<div class="description-course text-truncate" data-toggle="tooltip" data-html="true" title="${
                            row.description
                        }">${row.description
                            .replace(/&lt;/g, '<')
                            .replace(/&gt;/g, '>')
                            .replace('<br>', '')
                            ?.substring(0, 100)}</div>`;
                    },
                },
                {
                    field: 'type',
                    title: 'Tipo',
                    width: 150,
                    sortable: false,
                    template: function (row) {
                        return courseTypeDictionary[row.course_type];
                    },
                },
                {
                    field: 'creation_date',
                    title: 'Iscritto il',
                    width: 100,
                    type: 'date',
                    minWidth: '100%',
                    responsive: {
                        visible: 'lg',
                        hidden: 'md',
                    },
                    sortCallback: function (data, sort, column) {
                        let dataArray = Object.values(data);
                        dataArray.sort(function (a, b) {
                            let timeA = new Date(a['course_subscription']['creation_date']).getTime();
                            let timeB = new Date(b['course_subscription']['creation_date']).getTime();
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
                        return new Date(row?.course_subscription?.creation_date).toLocaleDateString('it-IT');
                    },
                },
                {
                    field: 'Azioni',
                    title: '',
                    sortable: false,
                    overflow: 'visible',
                    textAlign: 'right',
                    autoHide: false,
                    width: info.archived ? 0 : 98,
                    minWidth: '100%',
                    template: function (row) {
                        waitForElementAndExecute(
                            `#action-col-${row.course_subscription.course_subscription_id}`,
                            () => {
                                if (
                                    document.querySelector(
                                        `#action-col-${row.course_subscription.course_subscription_id}`
                                    )
                                )
                                    document.querySelector(
                                        `#action-col-${row.course_subscription.course_subscription_id}`
                                    ).innerHTML = '';

                                if (row.course_type === 3) {
                                    let editBtn = new EditButton({
                                        target: document.querySelector(
                                            `#action-col-${row.course_subscription.course_subscription_id}`
                                        ),
                                        intro: true,
                                        props: {
                                            disabled: !canPerformAction('association.courses.update'),
                                            popover_text: 'Modifica',
                                        },
                                    });
                                    editBtn.$on('open', () => {
                                        let addModal = new AddEditMembershipModal({
                                            target: document.body,
                                            props: {
                                                show: true,
                                                data: {...row.course_subscription},
                                                edit: true,
                                                info: {...row},
                                            },
                                        });
                                        addModal.$on('update', () => {
                                            dispatch('reset', 'courses');
                                        });
                                    });
                                } else if (row.course_type == 1 || row.course_type == 2) {
                                    let editBtn = new EditButton({
                                        target: document.querySelector(
                                            `#action-col-${row.course_subscription.course_subscription_id}`
                                        ),
                                        intro: true,
                                        props: {
                                            disabled: !canPerformAction('association.courses.update'),
                                            popover_text: 'Modifica',
                                        },
                                    });

                                    editBtn.$on('open', () => {
                                        let addModal = new AddEditCourseSubscriptionModal({
                                            target: document.body,
                                            props: {
                                                show: true,
                                                data: {...row.course_subscription},
                                                edit: true,
                                                info: {...row},
                                            },
                                        });
                                        addModal.$on('update', () => {
                                            dispatch('reset', 'courses');
                                        });
                                    });
                                }

                                let deleteBtn = new DeleteButton({
                                    target: document.querySelector(
                                        `#action-col-${row.course_subscription.course_subscription_id}`
                                    ),
                                    intro: true,
                                    props: {
                                        disabled: !canPerformAction('association.courses.update'),
                                        popover_text: 'Elimina',
                                    },
                                });

                                deleteBtn.$on('open', () => {
                                    swal.fire({
                                        title: "Eliminare l'iscrizione?",
                                        text: 'Saranno eliminate le eventuali rate non pagate. Questa azione è irreversibile.',
                                        icon: 'warning',
                                        showCancelButton: true,
                                        reverseButtons: true,
                                        confirmButtonColor: '#d63030',
                                        confirmButtonText: 'Elimina',
                                        cancelButtonText: 'Annulla',
                                    }).then(async result => {
                                        if (result.isConfirmed) {
                                            let res = await apiFetch(
                                                replaceUID(
                                                    __bakney.env.API.COURSE_SUBSCRIPTIONS.DELETE,
                                                    row.course_subscription.course_subscription_id
                                                ),
                                                {
                                                    method: 'DELETE',
                                                }
                                            );
                                            if (res.status === 200 || res.status === 204) {
                                                dispatch('reset', 'courses');
                                                toast.success('Eliminato con successo');
                                            } else {
                                                toast.error("Errore nell'eliminazione");
                                            }
                                        }
                                    });
                                });
                            }
                        );
                        return `<div id="action-col-${row.course_subscription.course_subscription_id}" class="action-column pr-4"></div>`;
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
                input: jQuery('#kt_datatable_courses_search_query'),
                //onEnter: true,
                key: 'generalSearch',
            };

            var datatable = jQuery('#kt_datatable_courses').KTDatatable(options);

            jQuery('#kt_datatable_courses_search_status').on('change', function () {
                datatable.search(jQuery(this).val().toLowerCase(), 'paid');
            });

            jQuery('#kt_datatable_courses_search_status').selectpicker();

            datatable.on('datatable-on-check datatable-on-uncheck', function (e) {
                var checkedNodes = datatable.rows('.datatable-row-active').nodes();
                var count = checkedNodes.length;
                jQuery('#kt_datatable_courses_selected_records').html(count);
                if (count > 0) {
                    jQuery('#kt_datatable_courses_group_action_form').collapse('show');
                } else {
                    jQuery('#kt_datatable_courses_group_action_form').collapse('hide');
                }
            });

            jQuery('#kt_datatable_courses_fetch_modal')
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
                    jQuery('#kt_datatable_courses_fetch_display').append(c);
                })
                .on('hide.bs.modal', function (e) {
                    jQuery('#kt_datatable_courses_fetch_display').empty();
                });
        };

        return {
            // public functions
            init: function (datasource) {
                if (datasource) options.data.source = datasource;
                localSelectorDemo();
                //serverSelectorDemo();
            },
        };
    })();

    jQuery(document).ready(function () {
        KTDatatableCourses.init();
        jQuery('body').tooltip({selector: '[data-toggle=tooltip]', trigger: 'hover'});
    });
</script>

<!--begin::Entry-->
<div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}}>
    <div class="row">
        <div class="col-10 mt-2">
            <h3 class="card-label font-size-h2">
                Corsi e abbonamenti
                <span class="d-block text-muted pt-2 font-size-sm">Lista dei corsi e abbonamenti del tesserato.</span>
            </h3>
        </div>
        <div class="col-2 mt-2 d-flex justify-content-end align-items-center">
            {#if !info.archived && canPerformAction('association.courses.create')}
                <button
                    class="btn btn-sm btn-primary font-weight-bolder d-flex align-items-center"
                    on:click={() => {
                        let chooseCourseModal = new ChooseCourseModal({
                            target: document.body,
                            props: {
                                show: true,
                                availableCourses: [...availableCourses],
                            },
                        });

                        chooseCourseModal.$on('confirm', e => {
                            if (e.detail.info.course_type !== 3) {
                                let addModal = new AddEditCourseSubscriptionModal({
                                    target: document.body,
                                    props: {
                                        show: true,
                                        data: {
                                            subscription_id: info.subscription_id,
                                            associate: {
                                                first_name: info.associate.first_name,
                                                last_name: info.associate.last_name,
                                            },
                                            disable_selection_of_athletes: true,
                                        },
                                        info: {...e.detail.info},
                                    },
                                });

                                addModal.$on('update', () => {
                                    dispatch('reset', 'courses');
                                });
                            } else {
                                e.detail.info.fee = parseFloat(e.detail.info.fee);
                                let addModal = new AddEditMembershipModal({
                                    target: document.body,
                                    props: {
                                        show: true,
                                        data: {
                                            subscription_id: info.subscription_id,
                                            associate: {
                                                first_name: info.associate.first_name,
                                                last_name: info.associate.last_name,
                                            },
                                            disable_selection_of_athletes: true,
                                        },
                                        info: {...e.detail.info},
                                    },
                                });

                                addModal.$on('update', () => {
                                    dispatch('reset', 'courses');
                                });
                            }
                        });
                    }}>
                    <PlusCircle size={16} class="mr-0 mr-md-1" weight="bold" />
                    <span class="d-none d-md-inline">Corso o abbonamento</span>
                </button>
            {/if}
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
                                        id="kt_datatable_courses_search_query" />
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
            <div class="datatable datatable-bordered datatable-head-custom" id="kt_datatable_courses" />
            <!--end: Datatable-->
        </div>
    </div>
</div>
<AddCourseModal
    bind:show={showAddCourseModal}
    bind:availableCourses
    bind:loading={loadingCourses}
    on:confirm={async e => {
        let course_id = e.detail.course_id;
        if (course_id) {
            let res = await apiFetch(
                replaceUID(
                    replaceUID(__bakney.env.API.COURSE.OVERVIEW_ADD, course_id),
                    info.subscription_id,
                    '<sub_uid>'
                ),
                {
                    method: 'POST',
                    body: JSON.stringify({course_id}),
                }
            );

            if (!res.error) {
                showAddCourseModal = false;
                toast.success('Corso aggiunto con successo.');
                dispatch('reset', 'courses');
            } else {
                toast.error('Qualcosa è andato storto.');
            }
        }
    }} />

<svelte:head>
    <style>
        .swal2-content {
            padding: 0;
        }
        .swal2-container .swal2-html-container {
            max-height: 400px;
        }
        .wide-swal {
            width: 50em !important;
        }
    </style>
</svelte:head>
