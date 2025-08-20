<script>
    import {onMount} from 'svelte';
    import * as easing from 'svelte/easing';
    import {slide, scale} from 'svelte/transition';
    import itLocale from '@fullcalendar/core/locales/it';
    // import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
    import ContentLoader from 'svelte-content-loader';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import {toast} from 'svelte-sonner';
    import {ArrowLeft} from 'phosphor-svelte';
    import BackButton from 'components/buttons/BackButton.svelte';

    export let params = {};
    let calendar;
    let loading = true;
    let events = [];

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
                    height: 800,
                    contentHeight: 750,
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
        const res = await apiFetch(replaceUID(__bakney.env.API.SUBSCRIPTION.CALENDAR, params.subscriptionId), {
            method: 'GET',
        });

        if (!res.error) {
            events = res.response.data.events;
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
    <div class="container container-overlay">
        <!--begin::Card-->
        <div class="card card-custom gutter-b">
            <div class="card-header pt-4 pb-0 header-mobile-btn-back" style="padding-bottom: 0 !important;">
                <div class="card-toolbar d-flex gap-4" style="gap: .5rem;">
                    <BackButton />
                </div>
                <div class="card-toolbar">
                    <h3 class="card-title font-size-h2">Calendario</h3>
                </div>
                <div class="card-toolbar" />
            </div>
            <div class="card-body pt-4">
                <div class="row" in:slide={{duration: 250}}>
                    <div class="col-sm-12 p-0 m-0">
                        {#if loading}
                            <ContentLoader width="100%" height="500">
                                <rect x="15" y="15" rx="4" ry="4" width="100%" height="50" />
                                <rect x="15" y="50" rx="2" ry="2" width="100%" height="450" />
                            </ContentLoader>
                        {/if}
                        <div in:slide id="course_attendance_calendar" />
                    </div>
                </div>
            </div>
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
