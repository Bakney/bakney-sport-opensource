<script>
    export let payments;
    export let chart;

    $: payments, initApexCharts(payments);

    function initApexCharts(payments) {
        if (!payments) {
            return;
        }
        // init payments chart
        _initChart(payments);
    }

    function _initChart(payments) {
        var element = document.getElementById('payments-chart');
        if (!element) {
            return;
        }

        var options = {
            series: [
                {
                    name: 'Pagamenti',
                    data: payments.y,
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
                type: 'bar',
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                curve: 'smooth',
            },
            xaxis: {
                categories: payments.x,
            },
            yaxis: {
                title: {
                    text: '€ pagati',
                },
                labels: {
                    formatter: function (val) {
                        return Number(val).toLocaleString('it-IT', {minimumFractionDigits: 2}) + ' €';
                    },
                },
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
<label class="font-weight-bolder h3 mb-4">Flusso Incassi</label>
<div class="card">
    <div class="card-body" style="padding: 1.25rem;">
        {#if !payments}
            <div class="text-center d-flex align-items-center justify-content-center" style="height: 50px;width: 100%">
                <span class="text-muted font-weight-bolder">Dati non ancora disponibili</span>
            </div>
        {:else}
            <div id="payments-chart" style="height: 200px;width: 100%" />
        {/if}
    </div>
</div>
