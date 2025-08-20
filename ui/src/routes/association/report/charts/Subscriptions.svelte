<script>
    export let subscriptions;
    export let chart;

    $: subscriptions, initApexCharts(subscriptions);

    function initApexCharts(subscriptions) {
        if (!subscriptions) {
            return;
        }
        // init subscriptions chart
        _initSubscriptionChart(subscriptions);
    }

    function _initSubscriptionChart(subscriptions) {
        var element = document.getElementById('subscriptions-chart');
        if (!element) {
            return;
        }

        var options = {
            series: [
                {
                    name: 'Iscrizioni',
                    data: subscriptions.y,
                },
            ],
            chart: {
                redrawOnParentResize: true,
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
                type: 'area',
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                curve: 'smooth',
            },
            xaxis: {
                categories: subscriptions.x,
            },
            yaxis: {
                title: {
                    text: '# iscrizioni',
                },
                labels: {
                    formatter: function (val) {
                        return val.toFixed(0);
                    },
                },
                max: Math.max(...subscriptions.y),
            },
            legend: {
                show: true,
            },
            grid: {
                borderColor: '#eaf1f7',
                strokeDashArray: 3,
                yaxis: {
                    lines: {
                        show: true,
                    },
                },
            },
        };

        chart = new ApexCharts(element, options);
        chart.render();
    }
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="font-weight-bolder h3 mb-4">Andamento Iscrizioni</label>
<div class="card">
    <div class="card-body" style="padding: 1.25rem;">
        {#if !subscriptions}
            <div class="text-center d-flex align-items-center justify-content-center" style="height: 50px;width: 100%">
                <span class="text-muted font-weight-bolder">Dati non ancora disponibili</span>
            </div>
        {:else}
            <div id="subscriptions-chart" style="height: 200px;width: 100%" />
        {/if}
    </div>
</div>
