<script>
    import {onDestroy, onMount} from 'svelte';
    import {canPerformAction} from 'utils/Permissions.js';
    import * as easing from 'svelte/easing';
    import {slide, scale} from 'svelte/transition';
    import itLocale from '@fullcalendar/core/locales/it';
    import ContentLoader from 'svelte-content-loader';
    import {Export, Printer} from 'phosphor-svelte';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import AddCalendarEvent from './modals/AddCalendarEvent.svelte';
    import {v4 as uuidv4} from 'uuid';
    import {toast} from 'svelte-sonner';

    let calendar;
    let loading = true;
    let events = [];
    let instructors = [];
    let instructor = null;
    let course = null;
    let createEvent = null;

    async function saveCalendarDirectly(updateEvents, id) {
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Salvataggio in corso...',
        });

        // alert(JSON.stringify(calendar.getEvents()));
        let events = [];
        for (let i = 0; i < updateEvents.length; i++) {
            events.push({
                event_id: updateEvents[i].id,
                start: updateEvents[i].start,
                end: updateEvents[i].end,
                className: updateEvents[i].className,
                allDay: updateEvents[i].allDay,
                title: updateEvents[i].title,
                extendedProps: updateEvents[i].extendedProps || {},
            });
        }
        let response;
        if (id) {
            response = await apiFetch(replaceUID(__bakney.env.API.COURSE.CALENDAR_UPDATE, id), {
                method: 'POST',
                body: JSON.stringify({
                    events: events,
                    status: 2, // 2 = updated & published (required)
                }),
            });
        } else {
            response = await apiFetch(__bakney.env.API.CALENDAR.UPDATE, {
                method: 'POST',
                body: JSON.stringify({
                    events: events,
                }),
            });
        }

        KTApp.unblockPage();

        if (!response.error) {
            KTCalendarListView.destory();
            KTCalendarListView.init(events);
            await fetchInstructors();
            toast.success('Successo.', 'Calendario aggiornato con successo!');
        } else {
            toast.error('Qualcosa è andato storto.');
        }
    }

    let KTCalendarListView = (function () {
        return {
            initExternalEvents: function (events) {},
            destory: function () {
                var calendarEl = document.getElementById('general_calendar');
                if (calendarEl) calendarEl.innerHTML = '';
            },
            //main function to initiate the module
            init: function () {
                var todayDate = moment().startOf('day');
                var TODAY = todayDate.format('YYYY-MM-DD');

                var calendarEl = document.getElementById('general_calendar');
                if (calendarEl) calendarEl.innerHTML = '';

                createEvent = function (
                    startDate,
                    title,
                    endDate,
                    instructor = null,
                    allday = false,
                    course = null,
                    color = null,
                    description = null,
                    reminder_amount = null,
                    reminder_enabled = false,
                    reminder_unit = null
                ) {
                    instructor = instructor == '' ? null : instructor;
                    course = course == '' ? null : course;
                    color = color == '' ? null : color.value;

                    const event = {
                        id: uuidv4(), // You must use a custom id generator
                        title: title,
                        start: startDate,
                        end: endDate,
                        allDay: allday || !endDate, // If there's no end date, the event will be all day of start date
                        // backgroundColor: color,
                        className: color,
                        // className: foregroundColor,
                        extendedProps: {
                            instructor: instructor,
                            course: course?.course_id || course,
                            description: description,
                            reminder_amount: reminder_amount || null,
                            reminder_enabled: reminder_enabled || false,
                            reminder_unit: reminder_unit || null,
                        },
                    };

                    calendar.addEvent(event);

                    let updatedEvents = calendar.getEvents();
                    if (course) {
                        updatedEvents = updatedEvents.filter(e => {
                            return e.extendedProps?.course == course.course_id;
                        });

                        updatedEvents = updatedEvents.map(e => {
                            if (e.id == event.id) {
                                return {
                                    id: e.id,
                                    title: e.title,
                                    start: e.start,
                                    end: e.end,
                                    allDay: e.allDay,
                                    className: event.className,
                                    extendedProps: {
                                        instructor: event.extendedProps.instructor,
                                        course: event.extendedProps.course,
                                        description: event.extendedProps.description,
                                        reminder_amount: event.extendedProps.reminder_amount || null,
                                        reminder_enabled: event.extendedProps.reminder_enabled || false,
                                        reminder_unit: event.extendedProps.reminder_unit || null,
                                    },
                                };
                            } else {
                                return {
                                    id: e.id,
                                    title: e.title,
                                    start: e.start,
                                    end: e.end,
                                    allDay: e.allDay,
                                    className: e.className,
                                    extendedProps: {
                                        instructor: e.extendedProps.instructor,
                                        course: e.extendedProps.course,
                                        description: e.extendedProps.description,
                                        reminder_amount: e.extendedProps.reminder_amount || null,
                                        reminder_enabled: e.extendedProps.reminder_enabled || false,
                                        reminder_unit: e.extendedProps.reminder_unit || null,
                                    },
                                };
                            }
                        });
                        saveCalendarDirectly(updatedEvents, course.course_id);
                    } else {
                        updatedEvents = updatedEvents.filter(e => {
                            return e.extendedProps?.course == null;
                        });

                        updatedEvents = updatedEvents.map(e => {
                            if (e.id == event.id) {
                                return {
                                    id: e.id,
                                    title: e.title,
                                    start: e.start,
                                    end: e.end,
                                    allDay: e.allDay,
                                    className: event.className,
                                    extendedProps: {
                                        instructor: event.extendedProps.instructor,
                                        course: event.extendedProps.course,
                                        description: event.extendedProps.description,
                                        reminder_amount: event.extendedProps.reminder_amount || null,
                                        reminder_enabled: event.extendedProps.reminder_enabled || false,
                                        reminder_unit: event.extendedProps.reminder_unit || null,
                                    },
                                };
                            } else {
                                return {
                                    id: e.id,
                                    title: e.title,
                                    start: e.start,
                                    end: e.end,
                                    allDay: e.allDay,
                                    className: e.className,
                                    extendedProps: {
                                        instructor: e.extendedProps.instructor,
                                        course: e.extendedProps.course,
                                        description: e.extendedProps.description,
                                        reminder_amount: e.extendedProps.reminder_amount || null,
                                        reminder_enabled: e.extendedProps.reminder_enabled || false,
                                        reminder_unit: e.extendedProps.reminder_unit || null,
                                    },
                                };
                            }
                        });

                        saveCalendarDirectly(updatedEvents, null);
                    }
                };

                calendar = new FullCalendar.Calendar(calendarEl, {
                    plugins: ['interaction', 'dayGrid', 'timeGrid', 'list', 'bootstrap', 'moment', 'adaptivePlugin'],
                    themeSystem: 'bootstrap',
                    allDaySlot: true,
                    locale: itLocale,
                    isRTL: KTUtil.isRTL(),
                    header: {
                        left: window.innerWidth > 600 ? 'prev,next today' : 'prev,next',
                        center: 'title',
                        right:
                            window.innerWidth > 600
                                ? 'dayGridMonth,timeGridWeek,timeGridDay,listDay,listWeek'
                                : 'dayGridMonth,timeGridWeek,timeGridDay,listDay,listWeek',
                    },
                    nowIndicator: true,
                    height: 700,
                    contentHeight: 650,
                    aspectRatio: 3, // see: https://fullcalendar.io/docs/aspectRatio

                    views: {
                        dayGridMonth: {
                            buttonText: 'mese',
                            eventLimit: 3,
                            locale: itLocale,
                        },
                        timeGridWeek: {buttonText: 'settimana'},
                        timeGridDay: {buttonText: 'giorno'},
                        listDay: {buttonText: 'lista giorno'},
                        listWeek: {buttonText: 'lista settimana'},
                    },

                    defaultView: 'listDay',
                    defaultDate: TODAY,

                    // editable: calendarStatus != 2,
                    editable: false, // set to true to enable moving and resizing events
                    selectable: false,
                    eventLimit: true, // allow "more" link when too many events
                    navLinks: true,
                    events: [],

                    events: async function (fetchInfo, successCallback, failureCallback) {
                        const startStr = moment(fetchInfo.start).format('YYYY-MM-DD');
                        const endStr = moment(fetchInfo.end).format('YYYY-MM-DD');

                        KTApp.blockPage({
                            overlayColor: '#000000',
                            state: 'primary',
                            message: 'Caricamento in corso...',
                        });

                        const res = await apiFetch(
                            `${__bakney.env.API.CALENDAR.EVENTS}?start=${startStr}&end=${endStr}&get_lesson=false`
                        );

                        if (!res.error) {
                            let events = res.response.data.events || [];
                            KTApp.unblockPage();
                            successCallback(events);
                        } else {
                            toast.error('Qualcosa è andato storto.');
                            failureCallback(res.error);
                        }
                    },

                    dateClick: async function (dateClickInfo) {
                        if (!canPerformAction('association.courses.update')) return;
                        document.querySelectorAll('#addElement').forEach(n => {
                            n.remove();
                        });

                        // console.info(dateClickInfo);
                        // if dateClickInfo.dateStr is missing the time, add it to it at 8:00
                        dateClickInfo.dateStr = dateClickInfo.dateStr.includes('T')
                            ? dateClickInfo.dateStr
                            : dateClickInfo.dateStr + 'T08:00';
                        // remove : from the date string end
                        let startDate = moment(dateClickInfo.dateStr).format('YYYY-MM-DDTHH:mm:ss');
                        let endDate = moment(dateClickInfo.dateStr).add(1, 'hours').format('YYYY-MM-DDTHH:mm:ss');
                        // drop the timezone, we always assume the europe rome timezone
                        // startDate = startDate.substring(0, startDate.length - 1);
                        // endDate = endDate.substring(0, endDate.length - 1);
                        // console.info(startDate, endDate);
                        let addEventModal = new AddCalendarEvent({
                            target: document.querySelector(`body`),
                            intro: true,
                            props: {
                                instructors: instructors,
                                row: {
                                    title: '',
                                    start: startDate, //dateClickInfo.dateStr + 'T08:00',
                                    end: endDate, //dateClickInfo.dateStr + 'T09:00',
                                    extendedProps: {
                                        instructor: [],
                                        course: null,
                                        description: null,
                                    },
                                },
                            },
                        });
                        addEventModal.$on('save', data => {
                            // jQuery('#addElement').modal('hide');
                            addEventModal.$destroy();
                            createEvent(
                                moment(data.detail.event_start).format(),
                                data.detail.event_title,
                                data.detail.event_end ? moment(data.detail.event_end).format() : null,
                                JSON.parse(data.detail?.instructor || null),
                                data.detail.event_allday,
                                JSON.parse(data.detail.course || null),
                                JSON.parse(data.detail.color),
                                data.detail.description,
                                data.detail.reminder_amount,
                                data.detail.reminder_enabled,
                                data.detail.reminder_unit
                            );
                        });

                        addEventModal.$on('close', () => {
                            // jQuery('#addElement').modal('hide');
                            addEventModal.$destroy();
                        });

                        addEventModal.$on('refresh', async data => {});
                    },

                    eventDragStop: async function (info) {
                        console.info(info);
                    },

                    eventResizeStop: async function (info) {
                        console.info(info);
                    },

                    eventClick: async function (info) {
                        document.querySelectorAll('#addElement').forEach(n => {
                            n.remove();
                        });
                        // transform info.event to a json object

                        let jsonEvent = {
                            id: info.event.id,
                            title: info.event.title,
                            start: info.event.start,
                            end: info.event.end,
                            allDay: info.event.allDay,
                            className: info.event.classNames[0],
                            extendedProps: structuredClone(info.event.extendedProps),
                        };

                        // call the endpoint with the event id and get the lessons
                        let lessons = await apiFetch(
                            `${__bakney.env.API.CALENDAR.EVENTS}?event_id=${jsonEvent.id}&get_lesson=true`
                        );
                        if (lessons?.response?.data?.events?.length == 1) {
                            jsonEvent.extendedProps = structuredClone(lessons.response.data.events[0].extendedProps);
                        }

                        let editEventModal = new AddCalendarEvent({
                            target: document.querySelector(`body`),
                            intro: true,
                            props: {
                                row: jsonEvent,
                                instructors: instructors,
                                edit: true,
                            },
                        });
                        editEventModal.$on('save', data => {
                            jQuery('#addElement').modal('hide');
                            editEventModal.$destroy();

                            // debugger;
                            // if (data.detail?.instructor == '') data.detail.instructor = null;
                            // info.event.setProp('title', data.detail?.event_title);
                            // info.event.setProp('classNames', [JSON.parse(data.detail?.color).value]);
                            // info.event.setExtendedProp('instructor', data.detail?.extendedProps.instructor);
                            // info.event.setExtendedProp('course', data.detail?.extendedProps.course);
                            // info.event.setExtendedProp('description', data.detail?.extendedProps.description);
                            let updatedEvents = calendar.getEvents();
                            if (data.detail?.course) {
                                updatedEvents = updatedEvents.filter(e => {
                                    return e.extendedProps?.course == data.detail?.course;
                                });
                                // remove lessons from extendedProps
                                updatedEvents = updatedEvents.map(e => {
                                    if (e.id == data.detail.id) {
                                        return {
                                            id: e.id,
                                            title: data.detail?.event_title,
                                            start: e.start,
                                            end: e.end,
                                            allDay: e.allDay,
                                            className: data.detail?.color,
                                            extendedProps: {
                                                instructor: data.detail?.instructor,
                                                course: data.detail?.course,
                                                description: data.detail?.description,
                                                reminder_amount: data.detail?.reminder_amount || null,
                                                reminder_enabled: data.detail?.reminder_enabled || false,
                                                reminder_unit: data.detail?.reminder_unit || null,
                                            },
                                        };
                                    } else {
                                        return {
                                            id: e.id,
                                            title: e.title,
                                            start: e.start,
                                            end: e.end,
                                            allDay: e.allDay,
                                            className: e.className,
                                            extendedProps: {
                                                instructor: e.extendedProps.instructor,
                                                course: e.extendedProps.course,
                                                description: e.extendedProps.description,
                                                reminder_amount: e.extendedProps.reminder_amount || null,
                                                reminder_enabled: e.extendedProps.reminder_enabled || false,
                                                reminder_unit: e.extendedProps.reminder_unit || null,
                                            },
                                        };
                                    }
                                });

                                saveCalendarDirectly(updatedEvents, data.detail?.course);
                            } else {
                                updatedEvents = updatedEvents.filter(e => {
                                    return e.extendedProps?.course == null;
                                });

                                updatedEvents = updatedEvents.map(e => {
                                    if (e.id == data.detail.id) {
                                        return {
                                            id: e.id,
                                            title: data.detail?.event_title,
                                            start: e.start,
                                            end: e.end,
                                            allDay: e.allDay,
                                            className: data.detail?.color,
                                            extendedProps: {
                                                instructor: data.detail?.instructor,
                                                course: data.detail?.course,
                                                description: data.detail?.description,
                                                reminder_amount: data.detail?.reminder_amount || null,
                                                reminder_enabled: data.detail?.reminder_enabled || false,
                                                reminder_unit: data.detail?.reminder_unit || null,
                                            },
                                        };
                                    } else {
                                        return {
                                            id: e.id,
                                            title: e.title,
                                            start: e.start,
                                            end: e.end,
                                            allDay: e.allDay,
                                            className: e.className,
                                            extendedProps: {
                                                instructor: e.extendedProps.instructor,
                                                course: e.extendedProps.course,
                                                description: e.extendedProps.description,
                                                reminder_amount: e.extendedProps.reminder_amount || null,
                                                reminder_enabled: e.extendedProps.reminder_enabled || false,
                                                reminder_unit: e.extendedProps.reminder_unit || null,
                                            },
                                        };
                                    }
                                });

                                saveCalendarDirectly(updatedEvents, null);
                            }
                        });

                        editEventModal.$on('close', () => {
                            jQuery('#addElement').modal('hide');
                            editEventModal.$destroy();
                        });

                        editEventModal.$on('delete', async data => {
                            KTApp.blockPage({
                                overlayColor: '#000000',
                                state: 'primary',
                                message: 'Eliminazione in corso...',
                            });

                            if (data.detail?.extendedProps.course) {
                                const response = await apiFetch(
                                    replaceUID(
                                        __bakney.env.API.COURSE.CALENDAR_UPDATE,
                                        data.detail?.extendedProps.course
                                    ),
                                    {
                                        method: 'DELETE',
                                        body: JSON.stringify({
                                            event_id: data.detail.id,
                                            before: data.detail.before || null,
                                            groupId: data.detail.groupId || null,
                                        }),
                                    }
                                );

                                KTApp.unblockPage();

                                if (!response.error) {
                                    info.event.remove();
                                    toast.success('Evento eliminato!');
                                } else {
                                    toast.error('Qualcosa è andato storto.');
                                }
                            } else {
                                info.event.remove();
                                let updatedEvents = calendar.getEvents();
                                updatedEvents = updatedEvents.filter(e => {
                                    return e.extendedProps?.course == null;
                                });

                                saveCalendarDirectly(updatedEvents, null);
                                toast.success('Evento eliminato!');
                            }
                            editEventModal.$destroy();
                        });

                        editEventModal.$on('refresh', async data => {});
                    },

                    eventRender: function (info) {
                        var element = jQuery(info.el);

                        if (info.event.extendedProps && info.event.extendedProps.description) {
                            if (element.hasClass('fc-day-grid-event')) {
                                element.data('content', info.event.extendedProps.description);
                                element.data('placement', 'top');
                                KTApp.initPopover(element);
                            } else if (element.hasClass('fc-time-grid-event')) {
                                element
                                    .find('.fc-title')
                                    .append(
                                        '<div class="fc-description">' + info.event.extendedProps.description + '</div>'
                                    );
                            } else if (element.find('.fc-list-item-title').lenght !== 0) {
                                element
                                    .find('.fc-list-item-title')
                                    .append(
                                        '<div class="fc-description">' + info.event.extendedProps.description + '</div>'
                                    );
                            }
                        }
                    },
                });

                setTimeout(() => {
                    loading = false;
                    calendar.render();
                }, 20);
            },
        };
    })();

    async function fetchInstructors() {
        let res = await apiFetch(__bakney.env.API.INSTRUCTOR.LIST);
        let response = res.response;
        let tmpInstructors = response.data || [];
        instructors = [];
        tmpInstructors?.forEach(item => {
            instructors = [
                ...instructors,
                {
                    value: item.instructor_id,
                    instructor_id: item.instructor_id,
                    label: `${item.first_name} ${item.last_name}`,
                },
            ];
        });
    }

    onMount(async () => {
        KTCalendarListView.init(events);
        await fetchInstructors();
    });
    onDestroy(() => {
        var calendarEl = document.getElementById('general_calendar');
        if (calendarEl) calendarEl.innerHTML = '';
    });
</script>

<!--begin::Entry-->
<div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}} class="d-flex flex-column-fluid">
    <!--begin::Container-->
    <div class="container">
        <!--begin::Card-->
        <div class="card card-custom gutter-b">
            <div
                class="card-header px-0 pt-0 pb-0 mb-6 header-mobile-btn-back border-0"
                style="padding-bottom: 0 !important;min-height: auto !important;">
                <div class="card-toolbar m-0">
                    <h3 class="card-title font-size-h2">Eventi e Promemoria</h3>
                </div>
                <div class="card-toolbar m-0 d-none d-md-flex">
                    <button
                        type="button"
                        on:click={() => {
                            const style = document.createElement('style');
                            style.innerHTML =
                                '@media print { @page { size: A3 landscape; } .aside, .card-header {display: none !important; } .fc-header-toolbar {display: none !important;} .content, .wrapper { border: 0 !important;} }';
                            document.head.appendChild(style);
                            window.print();
                            document.head.removeChild(style);
                        }}
                        class="btn btn-light-primary font-weight-bold d-flex align-items-center mb-0 mr-2">
                        <Printer size={18} weight="duotone" />
                        <span class="d-none d-md-block ml-md-2">Stampa</span>
                    </button>
                    <button
                        type="button"
                        on:click={() => {
                            let sessionToken = JSON.parse(localStorage.getItem('sessionToken'));

                            fetch(__bakney.env.API.CALENDAR.EXPORT, {
                                method: 'GET',
                                headers: {
                                    Authorization: `Bearer ${sessionToken}`,
                                },
                            })
                                .then(res => res.blob())
                                .then(blob => {
                                    // Create a URL for the blob
                                    const url = window.URL.createObjectURL(blob);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.setAttribute(
                                        'download',
                                        `${new Date().toISOString().split('T')[0]}_calendario_completo.ics`
                                    ); // Set the file name for download
                                    document.body.appendChild(link);
                                    link.click(); // Programmatically click the link to trigger the download
                                    document.body.removeChild(link); // Clean up
                                })
                                .catch(error => {
                                    console.error('Download failed', error);
                                    toast.error('Qualcosa è andato storto.');
                                });
                        }}
                        class="btn btn-primary font-weight-bold d-flex align-items-center mb-0"
                        style="margin-left: auto;">
                        <Export size={18} weight="duotone" />
                        <span class="d-none d-md-block ml-md-2"> Esporta </span>
                    </button>
                </div>
            </div>
            <div class="card-body pt-0 px-4">
                <div class="row" in:slide={{duration: 250}}>
                    <div class="col-sm-12 p-0 m-0">
                        {#if loading}
                            <ContentLoader width="100%" height="500">
                                <rect x="15" y="15" rx="4" ry="4" width="100%" height="50" />
                                <rect x="15" y="50" rx="2" ry="2" width="100%" height="450" />
                            </ContentLoader>
                        {/if}
                        <div style={loading ? 'display: none' : ''} in:slide id="general_calendar" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<!--end::Entry-->

<svelte:head>
    <style>
        .nav-link {
            cursor: pointer;
        }
        .nav-link.active {
            border-bottom: 4px solid #351dc2 !important;
        }
        .nav-link:hover {
            border-bottom: 4px solid #351dc2 !important;
        }
        .card-toolbar::-webkit-scrollbar {
            display: none;
        }
    </style>
</svelte:head>
