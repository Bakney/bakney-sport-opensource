<script>
    import {onMount} from 'svelte';
    import {apiFetch} from 'utils/ApiMiddleware';

    let data = {
        current_month_payments: [],
        total_payments: 0,
    };
    let loading = true;

    function initWidget() {
        var element = document.getElementById('kt_dashboard_widget_payments');

        if (!element) {
            return;
        }
        var options = {
            series: [
                {
                    name: 'Pagamenti Incassati',
                    data: data.current_month_payments,
                },
            ],
            chart: {
                locales: [apexItaSettings],
                defaultLocale: 'it',
                type: 'area',
                height: 120,
                toolbar: {
                    show: false,
                },
                style: {
                    borderradiusbottom: '$card-border-radius',
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
                colors: [KTApp.getSettings()['colors']['theme']['base']['white']],
            },
            xaxis: {
                categories: Array.from({length: 31}, (_, i) => 31 - i - 1 + ' giorni fa'),
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
                max: Math.max(...data.current_month_payments) + 1,
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
                        return '€ ' + val || '';
                    },
                },
            },
            colors: [KTApp.getSettings()['colors']['theme']['base']['success']],
            markers: {
                colors: [KTApp.getSettings()['colors']['theme']['light']['primary']],
                strokeColor: [KTApp.getSettings()['colors']['theme']['base']['white']],
                strokeWidth: 3,
            },
        };

        var chart = new ApexCharts(element, options);
        chart.setLocale('it');
        chart.render();
    }

    onMount(async () => {
        const res = await apiFetch(`${__bakney.env.HOST}/statistic/dashboard?widget=payments`, {
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
    class="card card-custom rounded-xl overflow-hidden bg-success card-stretch dashboard-widget"
    style="background-color: #01c0a0 !important;">
    <!--begin::Header-->
    <div class="card-header border-0 pt-6">
        <h3 class="card-title align-items-start flex-column">
            <span class="card-label font-weight-bolder font-size-h6 text-white">Pagamenti incassati</span>
            <span class="font-weight-bolder font-size-h1 text-white mt-2">
                {#if loading}
                    ...
                {:else}
                    {new Intl.NumberFormat('it-IT', {style: 'currency', currency: 'EUR'}).format(
                        data.total_payments || '0'
                    )}
                {/if}
            </span>
            <span class="text-white mt-2 font-weight-bold font-size-sm"
                >I ricavi medi del mese sono {new Intl.NumberFormat('it-IT', {
                    style: 'currency',
                    currency: 'EUR',
                }).format(data.total_payments / 30 || '')} al giorno.</span>
        </h3>
    </div>
    <!--end::Header-->
    <!--begin::Body-->
    <div class="card-body p-0 h-125px chart-tile-container">
        <div id="kt_dashboard_widget_payments" class="card-rounded-bottom position-absolute bottom-0 w-100" />
    </div>
    <!--end::Body-->
</div>
