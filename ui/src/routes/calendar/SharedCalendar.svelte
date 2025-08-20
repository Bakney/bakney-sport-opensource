<script>
    import {onMount} from 'svelte';
    import * as easing from 'svelte/easing';
    import {slide, scale} from 'svelte/transition';
    import itLocale from '@fullcalendar/core/locales/it';
    // import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
    import ContentLoader from 'svelte-content-loader';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import {toast} from 'svelte-sonner';

    export let params = {};
    let calendar;
    let loading = true;
    let events = [];
    let data;

    let KTCalendarListView = (function () {
        return {
            initExternalEvents: function (events) {},
            //main function to initiate the module
            init: function () {
                var todayDate = moment().startOf('day');
                var TODAY = todayDate.format('YYYY-MM-DD');

                var calendarEl = document.getElementById('course_attendance_calendar');

                calendar = new FullCalendar.Calendar(calendarEl, {
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
                        listDay: {buttonText: 'lista'},
                        listWeek: {buttonText: 'lista'},
                    },

                    defaultView: 'dayGridMonth',
                    defaultDate: TODAY,

                    // editable: calendarStatus != 2,
                    editable: false,
                    eventLimit: true, // allow "more" link when too many events
                    navLinks: true,
                    events: events,

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
                }, 1000);
            },
        };
    })();

    async function fetchData() {
        const res = await apiFetch(replaceUID(__bakney.env.API.COURSE.CALENDAR, params.id), {
            method: 'GET',
        });

        if (!res.error) {
            events = res.response.data.events;
            data = res.response.data;
        } else {
            toast.error('Qualcosa è andato storto.');
        }
    }

    onMount(async () => {
        await fetchData();
        KTCalendarListView.init(events);
    });
</script>

<!--begin::Entry-->
<div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}} class="d-flex flex-column-fluid">
    <!--begin::Container-->
    <div class="container container-overlay bg-white p-12 text-center">
        <h1 class="text-dark font-weight-bold mb-10">{data?.course?.title}</h1>
        {#if loading}
            <ContentLoader width="100%" height="500">
                <rect x="15" y="15" rx="4" ry="4" width="100%" height="50" />
                <rect x="15" y="50" rx="2" ry="2" width="100%" height="450" />
            </ContentLoader>
        {/if}
        <div in:slide id="course_attendance_calendar" />
        <div class="d-flex justify-content-between align-items-center pt-8">
            {#if __bakney.OEM_CONFIG?.isReseller}
                <div>
                    <img id="logo" class="h-30px mr-8" src={__bakney.OEM_CONFIG?.logo} alt="logo" />
                    <img id="logo" class="h-30px" src={data?.sport_association?.logo} alt="logo" />
                </div>
                <span
                    >Calendario fornito da <b class="text-primary">Bakney</b> in collaborazione con
                    <b class="text-primary">{data?.sport_association?.denomination}</b></span>
            {/if}
        </div>
    </div>
    <!--end::Container-->
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
