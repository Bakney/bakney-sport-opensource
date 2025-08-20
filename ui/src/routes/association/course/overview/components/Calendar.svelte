<script>
    import {userData} from 'store/stores.js';
    import Clipboard from 'svelte-clipboard';
    import {v4 as uuidv4} from 'uuid';
    import {afterUpdate, createEventDispatcher, onDestroy, onMount} from 'svelte';
    import Portal from 'svelte-portal';
    import {slide} from 'svelte/transition';
    import itLocale from '@fullcalendar/core/locales/it';
    // import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
    import ContentLoader from 'svelte-content-loader';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import {Copy, PaperPlaneRight, Plus, WhatsappLogo, PlusCircle} from 'phosphor-svelte';
    import AddCalendarEvent from './modals/AddCalendarEvent.svelte';
    import EditCalendarEvent from './modals/EditCalendarEvent.svelte';
    import Select from 'svelte-select';
    import {canPerformAction} from 'utils/Permissions';
    import {toast} from 'svelte-sonner';

    const dispatch = createEventDispatcher();

    export let showToggle = false;
    export let calendar;
    export let calendarStatus = 1;
    export let id;
    export let fetchData = () => {};
    export let google_sync_enabled = false;
    export let syncGoogleCalendar = () => {};
    let calendarVisible = true;
    let loading = true;
    let openNewEventModal = false;
    let queue_events = [];
    let currentEventName = 'Lezione';
    let createEvent;
    let instructors = [];
    let instructor = null;
    let hex;
    let copied = false;
    let periodicAllDay = true;
    let periodicStart = moment().format('HH:mm');
    let periodicEnd = moment().add(1, 'hours').format('HH:mm');

    async function saveCalendarDirectly(updateEvents) {
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
                allDay: updateEvents[i].allDay,
                title: updateEvents[i].title,
                extendedProps: updateEvents[i].extendedProps || {},
            });
        }
        const response = await apiFetch(replaceUID(__bakney.env.API.COURSE.CALENDAR_UPDATE, id), {
            method: 'POST',
            body: JSON.stringify({
                events: events,
                status: 2, // 2 = updated & published (required)
            }),
        });

        KTApp.unblockPage();

        if (!response.error) {
            await initPage();
            await fetchData();
            toast.success('Calendario aggiornato con successo!');
            calendarStatus = 2;
            if (google_sync_enabled)
                setTimeout(() => {
                    syncGoogleCalendar();
                }, 2000);
        } else {
            toast.error('Qualcosa è andato storto.');
        }
    }

    let KTCalendarListView = (function () {
        return {
            initExternalEvents: function () {},
            //main function to initiate the module
            init: function () {
                let Draggable = FullCalendarInteraction.Draggable;
                // initExternalEvents();

                // setup draggable
                document.querySelectorAll('#kt_calendar_external_events .fc-draggable-handle')?.forEach(function (el) {
                    // if (calendarStatus == 2) return;

                    new Draggable(el, {
                        itemSelector: '.fc-draggable-handle',
                        eventData: function (eventEl) {
                            return {
                                title: eventEl.innerText,
                                classNames: [eventEl.dataset.color],
                            };
                        },
                    });
                });

                var todayDate = moment().startOf('day');
                var YM = todayDate.format('YYYY-MM');
                var YESTERDAY = todayDate.clone().subtract(1, 'day').format('YYYY-MM-DD');
                var TODAY = todayDate.format('YYYY-MM-DD');
                var TOMORROW = todayDate.clone().add(1, 'day').format('YYYY-MM-DD');

                var calendarEl = document.getElementById('course_attendance_calendar');

                createEvent = function (
                    startDate,
                    title,
                    endDate,
                    instructor = null,
                    allday = false,
                    description = null
                ) {
                    instructor = instructor == '' ? null : instructor;
                    const event = {
                        id: uuidv4(), // You must use a custom id generator
                        title: title,
                        start: startDate,
                        end: endDate,
                        allDay: allday || !endDate, // If there's no end date, the event will be all day of start date
                        extendedProps: {
                            instructor: instructor,
                            description: description || null,
                        },
                    };

                    calendar.addEvent(event);
                    let updatedEvents = calendar.getEvents();
                    saveCalendarDirectly(updatedEvents);
                };

                calendar = new FullCalendar.Calendar(calendarEl, {
                    dateClick: async function (dateClickInfo) {
                        if (!canPerformAction('association.courses.update')) return;
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
                                    start: startDate, //dateClickInfo.dateStr + 'T08:00',
                                    end: endDate, //dateClickInfo.dateStr + 'T09:00',
                                },
                            },
                        });
                        addEventModal.$on('save', data => {
                            // destroy addEventModal
                            addEventModal.$destroy();
                            createEvent(
                                moment(data.detail.event_start).format(),
                                data.detail.event_title,
                                data.detail.event_end ? moment(data.detail.event_end).format() : null,
                                JSON.parse(data.detail?.instructor || null),
                                data.detail.event_allday,
                                data.detail?.description
                            );
                        });

                        addEventModal.$on('close', () => {
                            addEventModal.$destroy();
                        });
                    },
                    eventClick: async function (info) {
                        let editEventModal = new EditCalendarEvent({
                            target: document.querySelector(`body`),
                            intro: true,
                            props: {
                                row: info.event,
                                instructors: instructors,
                            },
                        });
                        editEventModal.$on('save', data => {
                            info.event.setProp('title', data.detail.event_title);
                            info.event.setExtendedProp('description', data.detail?.description);
                            try {
                                info.event.setExtendedProp('instructor', JSON.parse(data.detail?.instructor));
                            } catch (e) {
                                info.event.setExtendedProp('instructor', data.detail?.instructor);
                            }

                            let updatedEvents = calendar.getEvents();
                            saveCalendarDirectly(updatedEvents);
                            editEventModal.$destroy();

                            dispatch('refresh');
                        });

                        editEventModal.$on('close', () => {
                            editEventModal.$destroy();
                        });

                        editEventModal.$on('delete', async data => {
                            swal.fire({
                                text: `Sei sicuro di procedere all'eliminazione? Saranno eliminate anche le presenze.`,
                                icon: 'warning',
                                showCancelButton: true,
                                buttonsStyling: false,
                                confirmButtonText: 'Elimina',
                                cancelButtonText: 'Annulla',
                                // invert buttons order
                                reverseButtons: true,
                                customClass: {
                                    confirmButton: 'btn font-weight-bold btn-light-danger',
                                    cancelButton: 'btn font-weight-bold btn-light-primary',
                                },
                            }).then(async function (result) {
                                if (result.value) {
                                    KTApp.blockPage({
                                        overlayColor: '#000000',
                                        state: 'primary',
                                        message: 'Eliminazione in corso...',
                                    });

                                    const response = await apiFetch(
                                        replaceUID(__bakney.env.API.COURSE.CALENDAR_UPDATE, id),
                                        {
                                            method: 'DELETE',
                                            body: JSON.stringify({
                                                event_id: info.event.id,
                                                before: data.detail.before,
                                                groupId: data.detail.groupId,
                                            }),
                                        }
                                    );

                                    KTApp.unblockPage();

                                    if (!response.error) {
                                        info.event.remove();
                                        initPage();
                                        toast.success('Evento eliminato!');
                                    } else {
                                        toast.error('Qualcosa è andato storto.');
                                    }
                                    editEventModal.$destroy();
                                    dispatch('refresh');
                                }
                            });
                        });
                    },
                    drop: function (info) {
                        // if (calendarStatus == 2) return;
                        // if so, remove the element from the "Draggable Events" list
                        info.draggedEl.parentNode.removeChild(info.draggedEl);
                    },
                    plugins: ['interaction', 'dayGrid', 'timeGrid', 'list', 'bootstrap', 'moment'],
                    themeSystem: 'bootstrap',
                    allDaySlot: true,
                    locale: itLocale,
                    isRTL: KTUtil.isRTL(),
                    header: {
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
                    },
                    nowIndicator: true,
                    height: 600,
                    contentHeight: 550,
                    aspectRatio: 2, // see: https://fullcalendar.io/docs/aspectRatio

                    views: {
                        dayGridMonth: {
                            buttonText: 'mese',
                            eventLimit: 3,
                            locale: itLocale,
                        },
                        timeGridWeek: {buttonText: 'settimana'},
                        timeGridDay: {buttonText: 'giorno'},
                        listDay: {buttonText: 'lista'},
                        listWeek: {buttonText: 'lista'},
                    },

                    defaultView: 'dayGridMonth',
                    defaultDate: TODAY,

                    // editable: calendarStatus != 2,
                    editable: true,
                    eventLimit: true, // allow "more" link when too many events
                    navLinks: true,
                    events: [],
                    selectable: true,

                    select: function (info) {
                        if (!canPerformAction('association.courses.update')) return;
                        // if difference between start and end is more than 1 day
                        // continue, otherwise exit with guard
                        if (moment(info.end).diff(moment(info.start), 'days') <= 1) return;
                        // swal to delete
                        swal.fire({
                            text: `Sei sicuro di voler eliminare tutti gli eventi dal ${info.start.toLocaleDateString()} al ${info.end.toLocaleDateString()}?`,
                            icon: 'warning',
                            showCancelButton: true,
                            buttonsStyling: false,
                            confirmButtonText: 'Elimina',
                            cancelButtonText: 'Annulla',
                            // invert buttons order
                            reverseButtons: true,
                            customClass: {
                                confirmButton: 'btn font-weight-bold btn-light-danger',
                                cancelButton: 'btn font-weight-bold btn-light-primary',
                            },
                        }).then(async function (result) {
                            if (result.value) {
                                // delete all events from the start date to the end date
                                let events = calendar.getEvents();
                                for (let event of events) {
                                    if (
                                        moment(event.start).isSameOrAfter(info.start) &&
                                        moment(event.start).isSameOrBefore(info.end)
                                    ) {
                                        // delete event with fetch
                                        await apiFetch(replaceUID(__bakney.env.API.COURSE.CALENDAR_UPDATE, id), {
                                            method: 'DELETE',
                                            body: JSON.stringify({
                                                event_id: event.id,
                                            }),
                                        });
                                        event.remove();
                                    }
                                }
                                swal.fire({
                                    text: 'Eventi eliminati!',
                                    icon: 'success',
                                    buttonsStyling: false,
                                    confirmButtonText: 'Ok, capito!',
                                    customClass: {
                                        confirmButton: 'btn font-weight-bold btn-light-primary',
                                    },
                                });
                            } else if (result.dismiss === 'cancel') {
                                swal.fire({
                                    text: 'Eventi non eliminati!',
                                    icon: 'error',
                                    buttonsStyling: false,
                                    confirmButtonText: 'Ok, capito!',
                                    customClass: {
                                        confirmButton: 'btn font-weight-bold btn-light-primary',
                                    },
                                });
                            }
                        });
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

                    eventDrop: function (info) {
                        let updatedEvents = calendar.getEvents();
                        saveCalendarDirectly(updatedEvents);
                    },
                });

                setTimeout(() => {
                    loading = false;
                    calendar.render();
                }, 1000);
            },
        };
    })();

    async function initPage() {
        // remove the calendar if it exists
        if (calendar) calendar.destroy();
        const response = await apiFetch(replaceUID(__bakney.env.API.COURSE.CALENDAR, id));

        if (!response.error) {
            let waitMountCalendarPoller;
            waitMountCalendarPoller = setInterval(() => {
                if (calendar) {
                    clearInterval(waitMountCalendarPoller);
                    response.response?.data?.events?.forEach(event => {
                        event.id = event.event_id;
                        calendar.addEvent(event);
                    });
                    // calendar.setEvents(response.response.data.events);
                    calendarStatus = response.response.data.status;
                    google_calendar_id = response.response.data.google_calendar_id;
                    google_sync_enabled = response.response.data.google_sync_enabled;
                }
            }, 100);
        }
        KTCalendarListView.init();
        await fetchInstructors();
    }

    onMount(async () => {
        await initPage();
    });

    afterUpdate(() => {
        let Draggable = FullCalendarInteraction.Draggable;
        let queue_events_old = queue_events;
        queue_events = [];
        document.querySelectorAll('#kt_calendar_external_events .fc-draggable-handle')?.forEach(function (el) {
            queue_events = [{name: el.innerText}, ...queue_events];
            new Draggable(el, {
                itemSelector: '.fc-draggable-handle',
                eventData: function (eventEl) {
                    return {
                        title: eventEl.innerText,
                        classNames: [eventEl.dataset.color],
                    };
                },
            });
        });
    });

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

    function getDates(startDate, endDate) {
        let dates = [];
        let currentDate = moment(startDate);

        while (currentDate <= endDate) {
            dates.push(moment(currentDate).format('YYYY-MM-DD'));
            currentDate = moment(currentDate).add(1, 'days');
        }

        return dates;
    }
</script>

{#if calendarVisible}
    <div class="row" in:slide={{duration: 250}}>
        <div class="col-md-9 col-sm-12">
            {#if loading}
                <ContentLoader width="100%" height="600">
                    <rect x="15" y="15" rx="4" ry="4" width="100%" height="50" />
                    <rect x="15" y="50" rx="2" ry="2" width="100%" height="450" />
                </ContentLoader>
            {/if}
            <div in:slide id="course_attendance_calendar" />
        </div>
        <div class="col-md-3 col-sm-12">
            <h4 class="card-label font-size-h4 mb-4">
                <!-- style={calendarStatus == 2 ? 'opacity:0.5;pointer-events:none' : ''}> -->
                Crea lezioni
                <span class="d-block text-muted pt-2 font-size-sm">
                    Premi su <span style="font-weight: 800 !important;">Crea lezioni periodiche</span> per creare più lezioni
                    in un click.</span>
            </h4>
            <!-- <div class="p-0 text-right" style={calendarStatus == 2 ? 'opacity:0.5;pointer-events:none' : ''}> -->
            <div class="p-0 text-right">
                {#if openNewEventModal}
                    <div class="font-size-xs">
                        <div class="form-group text-left mb-3">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="font-weight-bold" style="font-size: .9rem">Nome<b>*</b></label>
                            <input
                                bind:value={currentEventName}
                                type="text"
                                class="form-control form-control-solid form-control-sm margin-tb-1"
                                placeholder="Nome" />
                            <!-- <span class="form-text text-muted">Per favore inserisci il cognome.</span> -->
                        </div>
                    </div>
                    <div class="font-size-xs">
                        <div class="form-group text-left mb-3">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="font-weight-bold" style="font-size: .9rem">Ripeti nei giorni<b>*</b></label>
                            <div id="days-checkboxes" class="checkbox-list font-sm" style="font-size: .9rem">
                                <label class="checkbox mb-1" style="font-size: 1rem">
                                    <input type="checkbox" name="monday" />
                                    <span />
                                    Lunedì
                                </label>
                                <label class="checkbox mb-1" style="font-size: 1rem">
                                    <input type="checkbox" name="tuesday" />
                                    <span />
                                    Martedì
                                </label>
                                <label class="checkbox mb-1" style="font-size: 1rem">
                                    <input type="checkbox" name="wednesday" />
                                    <span />
                                    Mercoledì
                                </label>
                                <label class="checkbox mb-1" style="font-size: 1rem">
                                    <input type="checkbox" name="thursday" />
                                    <span />
                                    Giovedì
                                </label>
                                <label class="checkbox mb-1" style="font-size: 1rem">
                                    <input type="checkbox" name="friday" />
                                    <span />
                                    Venerdì
                                </label>
                                <label class="checkbox mb-1" style="font-size: 1rem">
                                    <input type="checkbox" name="saturday" />
                                    <span />
                                    Sabato
                                </label>
                                <label class="checkbox mb-1" style="font-size: 1rem">
                                    <input type="checkbox" name="sunday" />
                                    <span />
                                    Domenica
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="font-size-xs">
                        <div class="form-group text-left mb-3">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="font-weight-bold" style="font-size: .9rem"
                                >Ripeti fino al giorno (escluso)<b>*</b></label>
                            <div class="input-group input-group-solid date" id="event_date" data-target-input="nearest">
                                <input
                                    id="event_date"
                                    name="event_date"
                                    type="text"
                                    class="form-control form-control-solid form-control-sm datetimepicker-input"
                                    placeholder="Seleziona Data"
                                    data-target="#event_date" />
                                <div class="input-group-append" data-target="#event_date" data-toggle="datetimepicker">
                                    <span class="input-group-text">
                                        <i class="ki ki-calendar" />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label class="mb-0">Tutto il giorno </label>
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <div style="display: flex; align-items: center; height: 4rem;">
                            <span class="switch switch-sm switch-icon">
                                <label>
                                    <input type="checkbox" bind:checked={periodicAllDay} name="event_allday" />
                                    <span />
                                </label>
                            </span>
                        </div>
                    </div>
                    <div
                        class="font-size-xs d-flex justify-content-between"
                        style={periodicAllDay ? 'opacity: 0.5' : ''}>
                        <div class="form-group text-left mb-0">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="font-weight-bold" style="font-size: .9rem">Inizio</label>
                            <input
                                disabled={periodicAllDay}
                                name="event_start"
                                bind:value={periodicStart}
                                type="time"
                                class="form-control form-control-solid form-control-sm m-0" />
                        </div>
                        <div class="form-group text-left mb-0">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="font-weight-bold" style="font-size: .9rem">Fine</label>
                            <input
                                disabled={periodicAllDay}
                                bind:value={periodicEnd}
                                name="event_end"
                                type="time"
                                class="form-control form-control-solid form-control-sm m-0" />
                        </div>
                    </div>
                    <div class="form-group text-left mt-4">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label class="font-weight-bold" style="font-size: .9rem">Istruttore lezione</label>
                        <Select
                            hideEmptyState={true}
                            multiple={true}
                            bind:value={instructor}
                            bind:items={instructors}
                            placeholder="Seleziona l'istruttore"
                            name="instructor" />
                    </div>
                {/if}
                <!-- svelte-ignore a11y-missing-attribute -->
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div class="d-flex align-items-center justify-content-center">
                    {#if openNewEventModal}
                        <button
                            class="btn btn-sm btn-light-dark font-weight-boldest mr-2 d-flex align-items-center"
                            on:click={() => (openNewEventModal = false)}>
                            Chiudi
                        </button>
                    {/if}
                    {#if canPerformAction('association.courses.update')}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-missing-attribute -->
                        <button
                            class="btn btn-sm btn-primary font-white font-weight-boldest d-flex align-items-center"
                            style={openNewEventModal && String(currentEventName).length < 3
                                ? 'opacity: 0.6;pointer-events:none'
                                : ''}
                            on:click={() => {
                                if (openNewEventModal) {
                                    // generate events based on the selected days, the event name and the end date
                                    const selectedDays = document.querySelectorAll(
                                        '#days-checkboxes input[type="checkbox"]:checked'
                                    );

                                    let eventDate = jQuery('#event_date').datetimepicker('date');

                                    // get a list of all the dates between the start date and the end date + 30 days
                                    const dates = getDates(moment(), moment(eventDate));
                                    // get the selected days
                                    const days = Array.from(selectedDays).map(d => d.name);
                                    // get the dates that match the selected days
                                    const selectedDates = dates.filter(d =>
                                        days.includes(moment(d).format('dddd').toLowerCase())
                                    );

                                    let groupId = uuidv4();
                                    // create the events
                                    let newEvents = selectedDates.map(d => {
                                        let startDate = moment(d).format('YYYY-MM-DD');
                                        let endDate = moment(d).format('YYYY-MM-DD');

                                        if (!periodicAllDay) {
                                            // add the start and end time to the dates
                                            startDate = moment(d).format('YYYY-MM-DD') + 'T' + periodicStart + ':00';
                                            endDate = moment(d).format('YYYY-MM-DD') + 'T' + periodicEnd + ':00';
                                            // console.info(startDate, endDate);
                                        }
                                        let extendedProps = {
                                            groupId: groupId,
                                        };
                                        if (instructor !== undefined && instructor != null)
                                            extendedProps.instructor = instructor;

                                        return {
                                            id: uuidv4(),
                                            title: String(currentEventName),
                                            start: moment(startDate).format(),
                                            end: moment(endDate).format(),
                                            allDay: periodicAllDay,
                                            extendedProps: extendedProps,
                                            // className: 'bg-light-primary',
                                        };
                                    });

                                    // add the events to the calendar
                                    for (let i = 0; i < newEvents.length; i++) {
                                        try {
                                            calendar.addEvent(newEvents[i]);
                                        } catch (e) {
                                            console.error(e);
                                        }
                                    }
                                    openNewEventModal = false;
                                    currentEventName = 'Lezione';
                                    instructor = null;
                                    saveCalendarDirectly(calendar.getEvents());
                                } else {
                                    openNewEventModal = true;
                                    setTimeout(() => {
                                        jQuery('#event_date').datetimepicker({
                                            format: 'LT',
                                            locale: 'it',
                                            format: 'DD/MM/YYYY',
                                            useCurrent: true, // workaround the bug that maxDate overwrites defaultDate
                                            defaultDate: moment(),
                                        });
                                    }, 500);
                                }
                            }}>
                            <PlusCircle size={14} weight="bold" class="font-white mr-1" />
                            Crea lezioni periodiche
                        </button>
                    {/if}
                </div>
            </div>
        </div>
    </div>
{/if}

{#if showToggle}
    <button
        class="btn btn-primary"
        on:click={() => {
            calendarVisible = !calendarVisible;

            let calendarMounted = false;

            let calendarShowPoller = setInterval(() => {
                if (!calendarMounted && calendarVisible && document.getElementById('course_attendance_calendar'))
                    KTCalendarListView.init();
                calendarMounted = true;
            }, 100);

            setTimeout(() => {
                clearInterval(calendarShowPoller);
                if (!calendarMounted) console.warn('calendar not mounted');
            }, 300);
        }}>Mostra Calendario</button>
{/if}

<div class="modal fade" id="share-link" tabindex="-1" role="dialog" aria-labelledby="staticBackdrop" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header border-0 pb-0">
                <h5 class="modal-title" id="exampleModalLabel">Condividi calendario</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <i aria-hidden="true" class="ki ki-close" />
                </button>
            </div>
            <div class="modal-body">
                <div class="alert alert-custom alert-light-info fade show mb-5" role="alert">
                    <div class="alert-icon"><i class="flaticon-info" /></div>
                    <div class="alert-text">
                        Condividi il seguente link con i tuoi soci per permettere loro di visualizzare il calendario del
                        corso. Puoi anche copiare il codice HTML per incorporarlo nel tuo sito.
                    </div>
                    <div class="alert-close">
                        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">
                                <i class="ki ki-close" />
                            </span>
                        </button>
                    </div>
                </div>
                <div class="input-group link-share-group">
                    <!-- svelte-ignore missing-declaration -->
                    <Clipboard
                        text="{__bakney.env.DOMAIN}/#/shared-calendar/{id}"
                        let:copy
                        on:copy={() => {
                            copied = true;
                            setTimeout(() => {
                                copied = false;
                            }, 2000);
                            toast.success('Link copiato negli appunti');
                        }}>
                        <input
                            type="text"
                            class="form-control {copied ? 'bg-light-success' : ''}"
                            style="pointer-events: none;"
                            value="{__bakney.env.DOMAIN}/#/shared-calendar/{id}" />
                        <div class="input-group-append">
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <!-- svelte-ignore a11y-missing-attribute -->
                            <a
                                on:click={copy}
                                class="btn btn-primary"
                                style="border-radius: 0 .55rem .55rem 0;"
                                data-clipboard="true"
                                data-clipboard-target="#kt_clipboard_1">
                                <Copy size={16} weight="duotone" />
                            </a>
                        </div>
                    </Clipboard>
                </div>
                <div class="input-group mt-4">
                    <!-- svelte-ignore missing-declaration -->
                    <!-- svelte-ignore a11y-label-has-associated-control -->
                    <label class="font-weight-bold">Codice HTML da incorporare nel tuo sito</label>
                    <textarea
                        class="text-left"
                        style="width: 100%; border-radius: 0.35rem; border: 1px solid #e4e6ef; background: #f1f2f7; padding: 1rem;resize: none;"
                        rows="4"
                        value={`<iframe src="${__bakney.env.DOMAIN}/#/shared-calendar/${id}" frameborder="0" style="overflow:hidden;height:100%;width:100%" height="100%" width="100%"></iframe>`} />
                </div>
            </div>
            <div class="modal-footer border-0 pt-0 d-flex justify-content-between">
                <div class="d-flex">
                    <button
                        type="button"
                        style="background-color: #22ceba; border-color: #22ceba;"
                        class="btn btn-primary font-weight-bold d-flex align-items-center"
                        on:click={() => {
                            window.open(
                                `https://api.whatsapp.com/send/?text=` +
                                    encodeURIComponent(
                                        `Ciao 👋\nQuesto è il link del calendario per il corso:\n${`${__bakney.env.DOMAIN}/#/shared-calendar/${id}`} \n\nCordiali saluti,\n${
                                            $userData.sport_association.denomination
                                        }`
                                    )
                            );
                        }}><WhatsappLogo size="20" weight="fill" class="mr-2" />Whatsapp</button>
                    <button
                        type="button"
                        class="btn btn-primary font-weight-bold d-flex align-items-center ml-2"
                        on:click={() => {
                            window.open(
                                "mailto:user@example.com?subject=Compila il modulo d'iscrizione&body=" +
                                    encodeURIComponent(
                                        `Ciao,\nQuesto è il link per il corso:\n${`${__bakney.env.DOMAIN}/#/shared-calendar/${id}`}\n\nCordiali saluti,\n${
                                            $userData.sport_association.denomination
                                        }`
                                    )
                            );
                        }}><PaperPlaneRight size="20" weight="fill" class="mr-2" /> Invia Email</button>
                </div>
                <button type="button" class="btn mt-0 btn-secondary font-weight-bold" data-dismiss="modal"
                    >Chiudi</button>
            </div>
        </div>
    </div>
</div>
