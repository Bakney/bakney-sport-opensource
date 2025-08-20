<script>
    import {onMount, onDestroy, createEventDispatcher} from 'svelte';
    import {sessionToken} from 'store/stores.js';
    import {writable} from 'svelte/store';
    import {slide} from 'svelte/transition';
    import Portal from 'svelte-portal';
    import {Circle} from 'svelte-loading-spinners';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import DeleteButton from 'components/buttons/DeleteButton.svelte';
    import AddModal from '../modals/AddModal.svelte';
    import {waitForElementAndExecute} from 'utils/Functions';
    import {canPerformAction} from 'utils/Permissions';
    import RepeatOnce from 'components/buttons/RepeatOnce.svelte';
    import {toast} from 'svelte-sonner';
    import DetailDrawer from 'routes/association/Members/detail/DetailDrawer.svelte';

    const dispatch = createEventDispatcher();

    sessionToken.useLocalStorage();

    export let info;

    let courses = writable([]);
    let selectedCourseId;
    let updating = false;
    let selectedCarnet;
    let subscriptions = [];

    let KTDatatableCourses = (function () {
        var datatable;
        // Private functions

        var options = {
            // datasource definition
            data: {
                responsive: true,
                type: 'local',
                source: info.subscriptions,
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
                    field: 'associate',
                    title: 'Nome e Cognome',
                    autoHide: false,
                    sortable: false,
                    fireClick: true,
                    width: 80,
                    minWidth: '100%',
                    template: function (row) {
                        return (
                            '</div style="cursor:pointer"><span><div class="d-flex justify-content-start align-items-center"><div class="mr-1">' +
                            '</div><span class="navi-text font-weight-bolder text-primary" style="cursor: pointer"><b>' +
                            row.subscription.associate.first_name +
                            ' ' +
                            row.subscription.associate.last_name +
                            '</b></span></div>'
                        );
                    },
                },
                {
                    field: 'creation_date',
                    title: 'Creato il',
                    type: 'date',
                    width: 30,
                    fireClick: true,
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
                    field: 'course',
                    title: 'Corsi',
                    sortable: false,
                    minWidth: '100%',
                    template: function (row) {
                        let contentText = '';
                        if (row.course.length == 0) {
                            contentText = `<span class="label label-light-success label-inline font-weight-bolder label-lg">Valido per tutti i corsi</span>`;
                        }
                        for (let i = 0; i < row.course.length; i++) {
                            contentText +=
                                '<span style="cursor:pointer" class="mr-1 label label-xl label-inline label-light-primary">' +
                                (canPerformAction('association.carnet.update')
                                    ? '<span onclick=unsubscribeCarnet("' +
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
                        // get the subscription
                        let subscription = info.subscriptions.find(
                            sub => sub.carnet_subscription_id === row.carnet_subscription_id
                        );
                        // get the courses of the subscription
                        let subscriptionCourses = subscription.course?.map(x => x.course_id);
                        // filter out the courses that are already assigned to this carnet subscription
                        let unassignedCourses = subscription.courses?.filter(
                            x => !subscriptionCourses.includes(x.course_id)
                        );
                        // console.info(unassignedCourses, subscription.course, subscription.courses);
                        // if there is at least one unassigned course, show the button
                        if (unassignedCourses.length > 0) {
                            contentText +=
                                (!canPerformAction('association.carnet.update') ? `<button disabled` : `<button `) +
                                ` onclick=selectCarnet("${row.carnet_subscription_id}") class="btn btn-xs btn-secondary font-weight-bolder text-dark-50 m-1" style="padding: 0.2rem 0.5rem;"` +
                                ` aria-haspopup="true" data-menu-toggle="hover" data-toggle="modal" data-target="#assign-course-${row.carnet_subscription_id}"` +
                                ` data-toggle="tooltip" data-placement="bottom" title="Collega ad un corso">` +
                                '<i class="fas fa-plus text-dark-50 mr-1"></i>collega corso</button>';
                        }
                        return contentText;
                    },
                },
                {
                    field: 'meta',
                    title: 'Lezioni',
                    sortable: false,
                    textAlign: 'right',
                    width: 20,
                    minWidth: '100%',
                    template: function (row) {
                        return (
                            '<span class="font-weight-bolder text-primary" style="word-break: keep-all;">' +
                            '<span class="text-success">' +
                            row.meta.lessons_left +
                            '</span>' +
                            '/' +
                            row.meta.lessons_counter +
                            '<span>'
                        );
                    },
                },
                {
                    field: '',
                    title: '',
                    sortable: false,
                    textAlign: 'right',
                    width: 30,
                    autoHide: false,
                    minWidth: '100%',
                    template: function (row) {
                        waitForElementAndExecute(`#action-col-${row.carnet_subscription_id}`, () => {
                            if (document.querySelector(`#action-col-${row.carnet_subscription_id}`))
                                document.querySelector(`#action-col-${row.carnet_subscription_id}`).innerHTML = '';

                            let topUpCarnet = new RepeatOnce({
                                target: document.querySelector(`#action-col-${row.carnet_subscription_id}`),
                                intro: true,
                                props: {
                                    disabled: !canPerformAction('association.carnet.update'),
                                    popover_text: 'Ricarica carnet',
                                },
                            });

                            topUpCarnet.$on('open', data => {
                                swal.fire({
                                    text: `Vuoi riassegnare un nuovo carnet con le stesse impostazioni a ${row.subscription.associate.first_name} ${row.subscription.associate.last_name}?`,
                                    icon: 'question',
                                    buttonsStyling: true,
                                    showCancelButton: true,
                                    cancelButtonText: 'Annulla',
                                    confirmButtonText: 'Ricarica',
                                    reverseButtons: true,
                                    confirmButtonColor: '#d63030',
                                }).then(async function (result) {
                                    if (result.isConfirmed) {
                                        KTApp.blockPage({
                                            overlayColor: '#000000',
                                            state: 'primary',
                                            message: 'Ricarica carnet in corso...',
                                        });

                                        const response = await apiFetch(
                                            replaceUID(
                                                __bakney.env.API.CARNET_SUBSCRIPTION.TOP_UP,
                                                row.carnet_subscription_id
                                            ),
                                            {
                                                method: 'POST',
                                            }
                                        );

                                        KTApp.unblockPage();

                                        if (!response.error) {
                                            window.location.reload();
                                            toast.success('Carnet Ricaricato!');
                                        } else {
                                            toast.error('Qualcosa è andato storto.');
                                        }
                                    }
                                });
                            });

                            let deleteBtn = new DeleteButton({
                                target: document.querySelector(`#action-col-${row.carnet_subscription_id}`),
                                intro: true,
                                props: {
                                    disabled: !canPerformAction('association.carnet.update'),
                                },
                            });

                            deleteBtn.$on('open', data => {
                                swal.fire({
                                    text: `Vuoi eliminare il carnet assegnato a ${row.subscription.associate.first_name} ${row.subscription.associate.last_name}?`,
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
                                            window.location.reload();
                                            toast.success('Carnet eliminato!');
                                        } else {
                                            toast.error('Qualcosa è andato storto.');
                                        }
                                    }
                                });
                            });
                        });
                        return `<div id="action-col-${row.carnet_subscription_id}" class="action-column pr-4"></div>`;
                    },
                },
            ],

            rows: {
                clicked: function (td, obj) {
                    let basicDrawer = new DetailDrawer({
                        target: document.querySelector(`#drawer-elements`),
                        intro: true, // This enables the mount animation
                        props: {
                            subscriptionId: obj.subscription?.subscription_id,
                            title: `${obj.subscription?.associate?.first_name || ''} ${
                                obj.subscription?.associate?.last_name || ''
                            }`,
                        },
                    });
                    basicDrawer.$on('close', () => {
                        dispatch('updateCarnet');
                        // reload datatable
                        setTimeout(() => {
                            jQuery('#kt_datatable').KTDatatable('reload');
                        }, 2000);
                    });
                },
            },
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
            reload: function (source) {
                options.data.source = source;
                datatable.reload();
            },
        };
    })();

    onMount(() => {
        fetchSubscriptions();
        initOnMount();
    });

    onDestroy(() => {
        document.querySelectorAll('.popover').forEach(popover => popover.remove());
    });

    function fetchSubscriptions() {
        return apiFetch(`${__bakney.env.API.SUBSCRIPTION.LIST}?m=1&filter=all`).then(res => {
            subscriptions = [];
            Object.keys(res.response.data).forEach(key => {
                subscriptions.push({
                    value: res.response.data[key].subscription_id,
                    label:
                        res.response.data[key].associate.first_name + ' ' + res.response.data[key].associate.last_name,
                });
            });
        });
    }

    window.selectCarnet = function (carnet_id) {
        selectedCarnet = carnet_id;
    };

    window.unsubscribeCarnet = function (course_subscription_id, carnet_subscription_id) {
        // alert('unsubscribeCarnet');

        // alert(course_subscription_id);
        // course_subscription_id;
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
                    window.location.reload();
                    toast.success('Assegnazione rimossa!');
                } else {
                    toast.error('Qualcosa è andato storto.');
                }
            }
        });
    };

    function initOnMount() {
        localStorage.removeItem('kt_datatable-1-meta');
        KTDatatableCourses.init();
        jQuery('body').tooltip({selector: '[data-toggle=tooltip]', trigger: 'hover'});
        jQuery('body').popover({selector: '[data-toggle=popover]', trigger: 'hover'});

        // fetching courses
        fetchCourses();
    }

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

    async function updateData(subscription_id, course_id, carnet_subscription_id) {
        updating = true;
        const res = await assignCarnet(info.carnet_id, subscription_id, course_id, carnet_subscription_id);
        dispatch('updateCarnet');
        updating = false;
        if (res.status == 200) toast.success(`Nuovo carnet assegnato.`);
        else toast.error(`Errore nell'assegnazione del carnet.`);
        // close modal assign-course-selectedCarnet
        jQuery(`#assign-course-${selectedCarnet}`).modal('hide');
        // reload datatable
        window.location.reload();
    }

    async function fetchCourses() {
        const res = await fetch(__bakney.env.HOST + '/course/list?all=1', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + $sessionToken,
            },
        });
        if (res.status == 200) {
            const content = await res.json();
            $courses = Object.values(content.data);
        }
    }
</script>

<div class="row pt-0 pb-4">
    <div class="col-12">
        <h2 class="pb-8 pt-4">Utilizzo del Carnet</h2>
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

<Portal target={document.body}>
    <!-- MODAL for assign carnet -->
    {#each info?.subscriptions || [] as sub}
        {#if selectedCarnet == sub.carnet_subscription_id}
            <div
                class="modal fade"
                id="assign-course-{sub.carnet_subscription_id}"
                data-backdrop="static"
                tabindex="-1"
                role="dialog">
                <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Assegna carnet ad un corso</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <i data-dismiss="modal" class="ki ki-close" />
                            </button>
                        </div>
                        <div class="modal-body px-2 py-2">
                            <form class="p-4 pt-8">
                                {#if sub.courses?.length == 0}
                                    <div class="alert alert-custom alert-light-info fade show" role="alert">
                                        <div class="alert-icon">
                                            <span class="svg-icon svg-icon-3x svg-icon-info">
                                                <!--begin::Svg Icon | path:/keen/theme/demo1/dist/assets/media/svg/icons/Code/Info-circle.svg-->
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    xmlns:xlink="http://www.w3.org/1999/xlink"
                                                    width="24px"
                                                    height="24px"
                                                    viewBox="0 0 24 24"
                                                    version="1.1">
                                                    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                                        <rect x="0" y="0" width="24" height="24" />
                                                        <circle fill="#000000" opacity="0.3" cx="12" cy="12" r="10" />
                                                        <rect
                                                            fill="#000000"
                                                            x="11"
                                                            y="10"
                                                            width="2"
                                                            height="7"
                                                            rx="1" />
                                                        <rect fill="#000000" x="11" y="7" width="2" height="2" rx="1" />
                                                    </g>
                                                </svg>
                                                <!--end::Svg Icon-->
                                            </span>
                                        </div>
                                        <div class="alert-text font-weight-bold">
                                            Nessun corso disponibile per questo atleta.
                                        </div>
                                    </div>
                                {/if}
                                <!-- must filter out the already assigned -->
                                {#each Array.from(sub.courses || []) as course, idx}
                                    {#if !sub.course?.map(i => i.course_id)?.includes(course.course_id)}
                                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                                        <div
                                            in:slide={{duration: 100, delay: (1 + idx) * 5}}
                                            on:click={e => {
                                                selectedCourseId = course.course_id;
                                                // scale animation on click via svelte (no scale class available)
                                                e.target.style.transform = 'scale(.99)';
                                                setTimeout(() => {
                                                    e.target.style.transform = 'scale(1)';
                                                }, 100);
                                            }}
                                            style="cursor:pointer;min-height: 3rem; background: #f6f6f6;border: 0.125rem solid #ebedf3; border-radius: 0.55rem; padding: 1.5rem 2rem;"
                                            class="d-flex align-items-center justify-content-between mb-3 pl-4 list-item-attendees">
                                            <div class="h5 m-0">
                                                <strong>{course.title}</strong>
                                            </div>
                                            <div>
                                                <label class="radio radio-lg">
                                                    <input
                                                        type="radio"
                                                        bind:group={selectedCourseId}
                                                        value={course.course_id}
                                                        name="carnet-select" />
                                                    <span />
                                                </label>
                                            </div>
                                        </div>
                                    {/if}
                                {/each}
                            </form>
                        </div>
                        <div class="modal-footer">
                            <!-- svelte-ignore a11y-missing-attribute -->
                            <a class="btn btn-light-primary font-weight-bolder" data-dismiss="modal">Chiudi</a>
                            <!-- svelte-ignore a11y-missing-attribute -->
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <button
                                disabled={selectedCourseId === null || updating || sub.courses?.length == 0}
                                class="btn btn-primary font-weight-bold"
                                on:click={() =>
                                    updateData(
                                        sub.subscription.subscription_id,
                                        selectedCourseId,
                                        sub.carnet_subscription_id
                                    )}>
                                {#if updating}
                                    <Circle size="18" color="#ffffff" unit="px" duration="1s" />
                                {:else}
                                    Assegna carnet
                                {/if}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        {/if}
    {/each}
</Portal>

<!-- <AddModal bind:id={info.carnet_id} bind:ktdatable={KTDatatableCourses} bind:subscriptions /> -->
