<script>
    import {sessionToken} from 'store/stores.js';
    import {scale, slide} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import {onMount, onDestroy, createEventDispatcher} from 'svelte';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import DeleteButton from 'components/buttons/DeleteButton.svelte';
    import EditButton from 'components/buttons/EditButton.svelte';
    import EditModal from './modals/EditModal.svelte';
    import {waitForElementAndExecute} from 'utils/Functions';
    import Portal from 'svelte-portal';
    import {Circle} from 'svelte-loading-spinners';
    import {canPerformAction} from 'utils/Permissions';
    import {toast} from 'svelte-sonner';
    import {PlusCircle} from 'phosphor-svelte';
    import AddCarnetModal from 'routes/association/course/carnet/detail/modals/AddCarnetModal.svelte';
    import ConnectCourseCarnetModal from './modals/ConnectCourseCarnetModal.svelte';

    const dispatch = createEventDispatcher();

    sessionToken.useLocalStorage();

    export let info = {};
    export let courses = [];
    let carnets = [];
    let options;
    let selectedCourseId;
    let selectedCarnet;
    let selectedCarnetId;
    let updating = false;

    $: carnets, jQuery('#kt_datatable_carnet').KTDatatable('reload');

    async function fetchData() {
        const res = await apiFetch(
            `${__bakney.env.API.CARNET_SUBSCRIPTION.LIST}?subscription_id=${info.subscription_id}`,
            {
                method: 'GET',
            }
        );

        if (!res.error) {
            carnets = res.response.data;
            KTDatatablePayments.init(carnets);
        } else {
            toast.error('Qualcosa è andato storto.');
        }
    }

    onMount(async () => {
        await fetchData();

        jQuery(document).ready(function () {
            jQuery('body').tooltip({selector: '[data-toggle=tooltip]', trigger: 'hover'});
        });
    });

    onDestroy(() => {
        document.querySelectorAll('.popover').forEach(popover => popover.remove());
        document.querySelectorAll('.tooltip').forEach(popover => popover.remove());
    });

    window.selectCarnetSub = function (carnet_sub_id, carnet_id) {
        // selectedCarnet = carnet_sub_id;
        // selectedCarnetId = carnet_id;

        let connectCourseCarnetModal = new ConnectCourseCarnetModal({
            target: document.body,
            props: {
                show: true,
                carnetSubscriptionId: carnet_sub_id,
                carnetId: carnet_id,
                subscriptionId: info.subscription_id,
                courses: courses,
                assignedCourses: info.courses,
            },
        });

        connectCourseCarnetModal.$on('update', () => {
            dispatch('reset', 'carnet');
        });
    };

    function assignCarnet(carnet_id, subscription_id, course_id, carnet_subscription_id) {
        return apiFetch(
            replaceUID(replaceUID(__bakney.env.API.CARNET.ASSIGN, carnet_id), subscription_id, '<sub_uid>'),
            {
                method: 'POST',
                body: JSON.stringify({
                    course_id: course_id,
                    carnet_subscription_id: carnet_subscription_id,
                }),
            }
        );
    }

    window.unsubscribeCarnetSub = function (course_subscription_id, carnet_subscription_id) {
        swal.fire({
            text: `Vuoi rimuovere l'assegnazione del carnet al corso?`,
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
                        replaceUID(__bakney.env.API.CARNET_SUBSCRIPTION.DELETE, carnet_subscription_id),
                        course_subscription_id,
                        '<sub_uid>'
                    ),
                    {
                        method: 'DELETE',
                    }
                );

                KTApp.unblockPage();

                if (!response.error) {
                    dispatch('reset', 'carnet');
                    toast.success('Assegnazione rimossa!');
                } else {
                    toast.error('Qualcosa è andato storto.');
                }
            }
        });
    };

    let KTDatatablePayments = (function (source) {
        // Private functions

        options = {
            // datasource definition
            data: {
                responsive: true,
                type: 'local',
                source: carnets,
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
                input: jQuery('#kt_datatable_search_query_carnet'),
                //onEnter: true,
                key: 'generalSearch',
            },

            // columns definition
            columns: [
                {
                    field: 'title',
                    title: 'Nome',
                    autoHide: false,
                    minWidth: '100%',
                    width: 80,
                    template: function (row) {
                        return (
                            '<a class="font-weight-bolder" href="/#/course/carnet/list/detail/' +
                            row.carnet_id +
                            '/info">' +
                            row.title +
                            '</a>'
                        );
                    },
                },
                {
                    field: 'amount',
                    title: 'Importo',
                    sortable: true,
                    minWidth: '100%',
                    width: 80,
                    responsive: {
                        visible: 'lg',
                        hidden: 'md',
                    },
                    template: function (row) {
                        let amount =
                            "<span style='font-weight:700;color:#2eb132'>€ " +
                            String(row.payment?.amount).replace('.', ',') +
                            '</span>';
                        return amount;
                    },
                },
                {
                    field: 'course',
                    title: 'Corso',
                    minWidth: '100%',
                    width: 200,
                    template: function (row) {
                        let contentText = '';
                        if (row.course.length == 0) {
                            contentText = `<span class="label label-light-success label-inline font-weight-bolder label-lg">Valido per tutti i corsi</span>`;
                        }
                        for (let i = 0; i < row.course.length; i++) {
                            contentText +=
                                '<span style="cursor:pointer" class="mr-1 label label-xl label-inline label-light-primary">' +
                                (canPerformAction('association.carnet.update')
                                    ? '<span onclick=unsubscribeCarnetSub("' +
                                      row.course[i].course_subscription_id +
                                      '",' +
                                      `"${row.carnet_subscription_id}"` +
                                      ')><i class="fas fa-times mr-2 text-primary" style="font-size: 11px;"></i></span>'
                                    : '') +
                                "<a href='/#/course/overview/" +
                                row.course[i].course_id +
                                '\'><span class="navi-text font-weight-bolder" style="cursor: pointer">' +
                                row.course[i].course_title +
                                '</span></a></span>';
                        }

                        /*
                        Iterate over courses of this subscription and show the button if there is at least one course
                        that is not assigned to this carnet subscription.
                        */
                        let unassignedCourses = courses?.filter(
                            x => !row.course.map(x => x.course_id).includes(x.course_id)
                        );

                        if (row.course.length == 0 && unassignedCourses.length <= 0) {
                            contentText = 'Nessun corso associato';
                        }
                        if (unassignedCourses.length > 0) {
                            contentText +=
                                `<button onclick="selectCarnetSub('${row.carnet_subscription_id}', '${row.carnet_id}')" class="btn btn-xs btn-light font-weight-bolder text-dark-50 m-1" style="padding: 0.2rem 0.5rem;"` +
                                ` aria-haspopup="true"` +
                                ` data-toggle="tooltip" data-placement="bottom" title="Collega ad un corso">` +
                                '<i class="fas fa-plus text-dark-50 mr-1"></i>collega corso</button>';
                        }
                        return contentText;
                    },
                },
                {
                    field: 'creation_date',
                    title: 'Data',
                    type: 'date',
                    width: 80,
                    minWidth: '100%',
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
                    field: 'meta',
                    title: 'Lezioni',
                    sortable: false,
                    textAlign: 'right',
                    width: 70,
                    minWidth: '100%',
                    autoHide: false,
                    template: function (row) {
                        return (
                            '<span class="font-weight-bolder text-primary" style="word-break: keep-all;">' +
                            '<span class="text-success">' +
                            row.lessons_left +
                            '</span>' +
                            '/' +
                            row.lessons_counter +
                            '<span>'
                        );
                    },
                },
                {
                    field: '',
                    title: '',
                    sortable: false,
                    textAlign: 'right',
                    width: info.archived ? 0 : 80,
                    autoHide: false,
                    minWidth: '100%',
                    template: function (row) {
                        if (info.archived) return '';

                        waitForElementAndExecute(`#action-col-${row.carnet_subscription_id}`, () => {
                            if (document.querySelector(`#action-col-${row.carnet_subscription_id}`))
                                document.querySelector(`#action-col-${row.carnet_subscription_id}`).innerHTML = '';

                            let editBtn = new EditButton({
                                target: document.querySelector(`#action-col-${row.carnet_subscription_id}`),
                                intro: true,
                                props: {
                                    disabled: !canPerformAction('association.carnet.update'),
                                    hidden: false,
                                },
                            });

                            let editModal = new EditModal({
                                target: document.querySelector(`#action-col-${row.carnet_subscription_id}`),
                                intro: true,
                                props: {
                                    id: row.carnet_subscription_id,
                                    row: row,
                                },
                            });

                            editBtn.$on('open', data => {
                                jQuery(`#editModal-${row.carnet_subscription_id}`).modal('show');
                            });

                            editModal.$on('update', e => {
                                dispatch('reset', 'carnet');

                                jQuery('#kt_datatable_carnet').KTDatatable('reload');
                            });

                            let deleteBtn = new DeleteButton({
                                target: document.querySelector(`#action-col-${row.carnet_subscription_id}`),
                                intro: true,
                                props: {
                                    disabled: !canPerformAction('association.carnet.delete'),
                                },
                            });

                            deleteBtn.$on('open', data => {
                                swal.fire({
                                    text: `Vuoi eliminare il carnet?`,
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
                                                replaceUID(__bakney.env.API.CARNET.UNASSIGN, row.carnet_id),
                                                row.carnet_subscription_id,
                                                '<sub_uid>'
                                            ),
                                            {
                                                method: 'DELETE',
                                            }
                                        );

                                        KTApp.unblockPage();

                                        if (!response.error) {
                                            dispatch('reset', 'carnet');
                                            toast.success('Carnet eliminato!');
                                        } else {
                                            toast.error(response.response?.msg || 'Qualcosa è andato storto.');
                                        }
                                    }
                                });
                            });
                        });
                        return `<div id="action-col-${row.carnet_subscription_id}" class="action-column pr-4"></div>`;
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
                input: jQuery('#kt_datatable_search_query_carnet'),
                //onEnter: true,
                key: 'generalSearch',
            };

            var datatable = jQuery('#kt_datatable_carnet').KTDatatable(options);

            jQuery('#kt_datatable_search_status').on('change', function () {
                datatable.search(jQuery(this).val().toLowerCase(), 'disabled');
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
            init: function (datasource) {
                if (datasource) options.data.source = datasource;
                localSelectorDemo();
                //serverSelectorDemo();
            },
        };
    })();
</script>

<!--begin::Entry-->
<div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}}>
    <div class="row">
        <div class="col-10 mt-2">
            <h3 class="card-label font-size-h2">
                Carnet
                <span class="d-block text-muted pt-2 font-size-sm"
                    >Lista dei carnet assegnati a questa anagrafica.</span>
            </h3>
        </div>
        <div class="col-2 mt-2 d-flex justify-content-end align-items-center">
            <button
                disabled={!canPerformAction('association.carnet.create')}
                on:click={() => {
                    let addCarnetModal = new AddCarnetModal({
                        target: document.body,
                        intro: true,
                        props: {
                            show: true,
                            value: info.subscription_id,
                            selectableCarnet: true,
                        },
                    });

                    addCarnetModal.$on('update', () => {
                        dispatch('reset', 'carnet');
                    });
                }}
                class="btn btn-sm btn-primary font-weight-bolder d-flex align-items-center">
                <PlusCircle size={16} weight="bold" class="mr-1" />
                <span class="d-none d-md-inline-block">Assegna carnet</span>
            </button>
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
                                        id="kt_datatable_search_query_carnet" />
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
            <div class="datatable datatable-bordered datatable-head-custom" id="kt_datatable_carnet" />
            <!--end: Datatable-->
        </div>
    </div>
</div>
