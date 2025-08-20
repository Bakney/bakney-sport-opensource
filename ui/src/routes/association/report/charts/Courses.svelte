<script>
    export let courses;
    export let chart;

    $: courses, initApexCharts(courses);

    function initApexCharts(courses) {
        if (!courses) {
            return;
        }
        // init courses chart
        _initChart(courses);
    }

    function _initChart(courses) {
        var element = document.getElementById('courses-chart');
        if (!element) {
            return;
        }

        var options = {
            series: [
                {
                    name: 'Atleti',
                    data: courses.y,
                    type: 'column',
                },
                {
                    name: 'Entrate',
                    data: courses.revenue.y,
                    type: 'line',
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
                type: 'line',
            },
            dataLabels: {
                enabled: true,
                enabledOnSeries: [1],
                formatter: function (val) {
                    return Number(val).toLocaleString("it-IT", {minimumFractionDigits: 2}) + ' €';
                },
            },
            stroke: {
                width: [0, 4],
                curve: "straight",
                dashArray: [0, 10]
            },
            xaxis: {
                categories: courses.x,
            },
            yaxis: [
                {
                    title: {
                        text: '# atleti',
                    },
                    labels: {
                        formatter: function (val) {
                            return val.toFixed(0) + ' atleti';
                        },
                    },
                },
                {
                    opposite: true,
                    title: {
                        text: 'Entrate',
                    },
                    labels: {
                        formatter: function (val) {
                            return Number(val).toLocaleString("it-IT", {minimumFractionDigits: 2}) + ' €';
                        },
                    },
                },
            ],
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
<label class="font-weight-bolder h3 mb-4 pagebreak">Panoramica dei Corsi</label>
<div class="card">
    <div class="card-body" style="padding: 1.25rem;">
        {#if !courses}
            <div class="text-center d-flex align-items-center justify-content-center" style="height: 50px;width: 100%">
                <span class="text-muted font-weight-bolder">Dati non ancora disponibili</span>
            </div>
        {:else}
            <div id="courses-chart" style="height: 200px;width: 100%" />
        {/if}
    </div>
</div>

<svelte:head>
    <style>
        @media print {
            .pagebreak {
                page-break-before: always;
            } /* page-break-after works, as well */
        }
    </style>
</svelte:head>
