<script>
    export let data;

    $: data, initApexCharts(data);

    function initApexCharts(data) {
        if (!data) {
            return;
        }
        // init data chart
        _initSubscriptionChart(data);
    }

    function _initSubscriptionChart(data) {
        var element = document.getElementById('subscriptions-chart-pie');
        if (!element) {
            return;
        }

        var options = {
            series: data.y,
            chart: {
                height: 250,
                toolbar: {
                    show: true,
                    tools: {
                        download: true,
                        selection: false,
                        zoom: false,
                        zoomin: false,
                        zoomout: false,
                        pan: false,
                        reset: false,
                    },
                },
                type: 'donut',
            },
            labels: data.x,
            dataLabels: {
                enabled: false,
            },
            legend: {
                show: true,
                position: 'right',
                offsetY: 20,
            },
            responsive: [
                {
                    breakpoint: 480,
                    options: {
                        chart: {
                            width: 200,
                        },
                    },
                },
            ],
            theme: {
                monochrome: {
                    enabled: true,
                    color: '#255aee',
                    shadeTo: 'light',
                    shadeIntensity: 0.65,
                },
            },
            yaxis: {
                labels: {
                    formatter: function (val) {
                        return val + ' soci';
                    },
                },
            },
        };

        var chart = new ApexCharts(element, options);
        chart.render();
    }
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="font-weight-bolder h3 mb-4">Stato Iscrizioni Libro Soci</label>
<div class="card">
    <div class="card-body" style="padding: 1.25rem;">
        <div id="subscriptions-chart-pie" style="height: 150px;width: 100%" />
    </div>
</div>
