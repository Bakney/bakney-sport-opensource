<script>
    import {sessionToken} from 'store/stores.js';
    import {scale} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import {onMount, onDestroy} from 'svelte';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import {toast} from 'svelte-sonner';
    import BaseNumberWidget from 'components/widgets/BaseNumberWidget.svelte';

    sessionToken.useLocalStorage();

    export let info = {};
    let list = [];
    let courses = [];
    let stats = {
        total_attendance_last_30_days: 0,
        total_absences_last_30_days: 0,
        total_attendance: 0,
        total_absences: 0,
    };
    let options;
    let selectedCourse = 'all';

    $: list, jQuery('#kt_datatable_attendance').KTDatatable('reload');

    async function fetchData(updateCourses = true) {
        const res = await apiFetch(
            `${replaceUID(__bakney.env.API.SUBSCRIPTION.ATTENDANCE, info.subscription_id)}?course=${selectedCourse}`,
            {
                method: 'GET',
            }
        );

        if (!res.error) {
            list = res.response.data.attendance_days;
            stats = res.response.data.stats;
            if (updateCourses) {
                courses = res.response.data.courses;
            }
        } else {
            toast.error('Qualcosa è andato storto.');
        }
    }

    onMount(async () => {
        await fetchData();

        jQuery(document).ready(function () {
            KTDatatablePayments.init(list);
            jQuery('body').tooltip({selector: '[data-toggle=tooltip]', trigger: 'hover'});
        });
    });

    onDestroy(() => {
        document.querySelectorAll('.popover').forEach(popover => popover.remove());
        document.querySelectorAll('.tooltip').forEach(popover => popover.remove());
    });

    let KTDatatablePayments = (function (source) {
        // Private functions

        options = {
            // datasource definition
            data: {
                responsive: true,
                type: 'local',
                source: list,
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
                input: jQuery('#kt_datatable_attendance_search_query'),
                //onEnter: true,
                key: 'generalSearch',
            },

            // columns definition
            columns: [
                {
                    field: 'title',
                    title: 'Nome lezione',
                    template: function (row) {
                        return row.title;
                    },
                },
                {
                    field: 'course',
                    title: 'Corso',
                    autoHide: false,
                    template: function (row) {
                        return row.course
                            ? '<a class="font-weight-bolder" href="/#/course/overview/' +
                                  row.course?.course_id +
                                  '">' +
                                  row.course?.title +
                                  '</a>'
                            : 'Nessun corso associato';
                    },
                },
                {
                    field: 'creation_date',
                    title: 'Data',
                    type: 'date',
                    autoHide: false,
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
                        return moment(new Date(row.date)).format('DD/MM/YYYY');
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
                input: jQuery('#kt_datatable_attendance_search_query'),
                //onEnter: true,
                key: 'generalSearch',
            };

            var datatable = jQuery('#kt_datatable_attendance').KTDatatable(options);

            datatable.on('datatable-on-check datatable-on-uncheck', function (e) {
                var checkedNodes = datatable.rows('.datatable-row-active').nodes();
                var count = checkedNodes.length;
                jQuery('#kt_datatable_attendance_selected_records').html(count);
                if (count > 0) {
                    jQuery('#kt_datatable_attendance_group_action_form').collapse('show');
                } else {
                    jQuery('#kt_datatable_attendance_group_action_form').collapse('hide');
                }
            });

            jQuery('#kt_datatable_attendance_fetch_modal')
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
                    jQuery('#kt_datatable_attendance_fetch_display').append(c);
                })
                .on('hide.bs.modal', function (e) {
                    jQuery('#kt_datatable_attendance_fetch_display').empty();
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
    <div class="row mb-2 d-flex justify-content-start">
        <BaseNumberWidget
            title="Presenze ultimi 30 giorni"
            value={stats.total_attendance_last_30_days}
            valueSuffix="presenze" />
        <BaseNumberWidget title="Presenze totali" value={stats.total_attendance} valueSuffix="presenze" />
    </div>
    <div class="row">
        <div class="col-12 mt-2">
            <h3 class="card-label font-size-h2">
                Registro Presenze
                <span class="d-block text-muted pt-2 font-size-sm">Lista completa delle presenze ai corsi.</span>
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
                                        id="kt_datatable_attendance_search_query" />
                                    <span>
                                        <i class="flaticon2-search-1 text-muted" />
                                    </span>
                                </div>
                            </div>
                            <div class="col-md-4 my-2 my-md-0">
                                <div class="d-flex align-items-center">
                                    <!-- svelte-ignore a11y-label-has-associated-control -->
                                    <select
                                        class="form-control form-control-solid"
                                        id="kt_datatable_attendance_search_status"
                                        on:change={async e => {
                                            selectedCourse = e.target.value;
                                            await fetchData(false);
                                            // destroy the current datatable
                                            jQuery('#kt_datatable_attendance').KTDatatable('destroy');
                                            // reinitialize the datatable
                                            KTDatatablePayments.init(list);
                                        }}>
                                        <option value="all">Tutti i corsi</option>
                                        {#each courses as course}
                                            <option value={course.course_id}>{course.title}</option>
                                        {/each}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!--begin: Datatable-->
            <div class="datatable datatable-bordered datatable-head-custom" id="kt_datatable_attendance" />
            <!--end: Datatable-->
        </div>
    </div>
</div>
