<script>
    import {onMount} from 'svelte';
    import {ListLoader} from 'svelte-content-loader';
    import {apiFetch} from 'utils/ApiMiddleware';
    import {convert} from 'html-to-text';

    let data = {
        current_week_course_associates: [],
        best_courses: [],
        total_course_associates: 0,
    };
    let loading = true;

    function initWidget() {
        var element = document.getElementById('kt_dashboard_widget_best_courses');
        var height = parseInt(KTUtil.css(element, 'height'));

        if (!element) {
            return;
        }

        var options = {
            series: [
                {
                    name: 'Nuovi Iscritti',
                    data: data.current_week_course_associates,
                },
            ],
            chart: {
                type: 'area',
                height: height,
                toolbar: {
                    show: false,
                },
                zoom: {
                    enabled: false,
                },
                sparkline: {
                    enabled: true,
                },
            },
            plotOptions: {},
            legend: {
                show: false,
            },
            dataLabels: {
                enabled: false,
            },
            fill: {
                type: 'solid',
                opacity: 1,
            },
            stroke: {
                curve: 'smooth',
                show: true,
                width: 3,
                colors: [KTApp.getSettings()['colors']['theme']['base']['primary']],
            },
            xaxis: {
                categories: Array.from({length: 8}, (_, i) => 8 - i - 1 + ' giorni fa'),
                axisBorder: {
                    show: false,
                },
                axisTicks: {
                    show: false,
                },
                labels: {
                    show: false,
                    style: {
                        colors: KTApp.getSettings()['colors']['gray']['gray-500'],
                        fontSize: '12px',
                        fontFamily: KTApp.getSettings()['font-family'],
                    },
                },
                crosshairs: {
                    show: false,
                    position: 'front',
                    stroke: {
                        color: KTApp.getSettings()['colors']['gray']['gray-300'],
                        width: 1,
                        dashArray: 3,
                    },
                },
                tooltip: {
                    enabled: false,
                    formatter: undefined,
                    offsetY: 0,
                    style: {
                        fontSize: '12px',
                        fontFamily: KTApp.getSettings()['font-family'],
                    },
                },
            },
            yaxis: {
                max: Math.max(...data.current_week_course_associates) + 1,
                labels: {
                    show: false,
                    style: {
                        colors: KTApp.getSettings()['colors']['gray']['gray-500'],
                        fontSize: '12px',
                        fontFamily: KTApp.getSettings()['font-family'],
                    },
                },
            },
            states: {
                normal: {
                    filter: {
                        type: 'none',
                        value: 0,
                    },
                },
                hover: {
                    filter: {
                        type: 'none',
                        value: 0,
                    },
                },
                active: {
                    allowMultipleDataPointsSelection: false,
                    filter: {
                        type: 'none',
                        value: 0,
                    },
                },
            },
            tooltip: {
                style: {
                    fontSize: '12px',
                    fontFamily: KTApp.getSettings()['font-family'],
                },
                y: {
                    formatter: function (val) {
                        return val + ' iscritti';
                    },
                },
            },
            colors: [KTApp.getSettings()['colors']['theme']['light']['primary']],
            markers: {
                colors: [KTApp.getSettings()['colors']['theme']['light']['primary']],
                strokeColor: [KTApp.getSettings()['colors']['theme']['base']['primary']],
                strokeWidth: 3,
            },
        };

        var chart = new ApexCharts(element, options);
        chart.render();
    }

    onMount(async () => {
        const res = await apiFetch(`${__bakney.env.HOST}/statistic/dashboard?widget=bestcourses`, {
            method: 'GET',
        });
        loading = false;
        // spinner stop
        if (!res.error) {
            data = res.response.data;
        }
        initWidget();
    });
</script>

<div
    class="card card-widget card-custom rounded-xl overflow-hidden card-stretch dashboard-card dashboard-widget mb-0"
    style="padding:0!important;">
    <!--begin::Header-->
    <div class="border-0 pt-6">
        <h3 class="card-title align-items-start flex-column mb-0 text-center">
            <span class="card-label font-weight-bolder font-size-h4 text-dark">I 3 corsi con più iscritti</span>
        </h3>
    </div>
    <!--end::Header-->
    <!--begin::Body-->
    {#if loading}
        <div class="card-body pb-0">
            <ListLoader />
        </div>
    {/if}
    <div class="card-body py-0 mt-3" style={loading ? 'visibility:hidden!important;position:absolute!important' : ''}>
        {#each data.best_courses as course}
            <!--begin::Item-->
            <div class="d-flex align-items-center justify-content-between">
                <!--begin::Text-->
                <div class="d-flex flex-column col-md-10 col-8 pl-0 font-weight-boldest">
                    <a
                        href="/#/course/overview/{course.course_id}"
                        class="text-primary text-hover-primary mb-1 font-size-sm">{course.title}</a>
                </div>
                <!--end::Text-->
                <div class="d-flex flex-column">
                    <span class="text-right">
                        <span class="label label-sm label-light text-dark label-inline font-weight-boldest"
                            ><b>{course.subscriptions}</b></span>
                    </span>
                </div>
            </div>
            <!--end::Item-->
        {/each}
    </div>
    <!--end::Body-->
    <!--begin::Footer-->
    <div class="card-footer border-0" style="padding:0!important;{loading ? 'visibility:hidden!important;' : ''}">
        <!--begin::Chart-->
        <div id="kt_dashboard_widget_best_courses" class="card-rounded-bottom h-80px" />
        <!--end::Chart-->
    </div>
    <!--end::Footer-->
</div>
