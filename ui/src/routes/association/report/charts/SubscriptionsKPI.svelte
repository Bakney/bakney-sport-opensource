<script>
    export let data;
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="font-weight-bolder h3 mb-4">KPI soci - Indicatori chiave di prestazione soci</label>
<div class="d-flex" style="gap: 1rem;height: 91px">
    <div class="card" style="width: 50%">
        <div class="card-body" style="padding: .5rem 1rem;">
            <div class="card-title align-items-start flex-column d-flex justify-content-center h-100">
                <span class="card-label font-weight-bolder font-size-h4 text-dark-75">Media iscrizioni al mese</span>
                <span class="card-label mt-2 font-weight-bolder font-size-h3 text-primary">{data?.average_subscriptions_month || '0'} {data?.average_subscriptions_month == 1 ? 'iscrizione' : 'iscrizioni'} </span>
            </div>
        </div>
    </div>
    <div class="card" style="width: 50%">
        <div class="card-body" style="padding: .5rem 1rem;">
            <div class="card-title align-items-start flex-column d-flex justify-content-center h-100">
                <span class="card-label font-weight-bolder font-size-h4 text-dark-75">Numero di soci approvati</span>
                <span class="card-label mt-2 font-weight-bolder font-size-h3 text-primary">{data?.total_subscriptions || '0'} {data?.total_subscriptions == 1 ? 'socio' : 'soci'}</span>
            </div>
        </div>
    </div>
</div>
<div class="d-flex pt-4" style="gap: 1rem;height: 91px">
    <div class="card" style="width: 50%">
        <div class="card-body" style="padding: .5rem 1rem;">
            <div class="card-title align-items-start flex-column d-flex justify-content-center h-100">
                <span class="card-label font-weight-bolder font-size-h4 text-dark-75">Età media soci approvati</span>
                <span class="card-label mt-2 font-weight-bolder font-size-h3 text-primary">{data?.average_age || '0.00'} anni</span>
            </div>
        </div>
    </div>
    <div class="card" style="width: 50%">
        <div class="card-body" style="padding: .5rem 1rem;">
            <div class="card-title align-items-start flex-column d-flex justify-content-center h-100">
                <span class="card-label font-weight-bolder font-size-h4 text-dark-75">Distribuzione per sesso di nascita</span>
                <div class="card-label mt-2 font-weight-bolder font-size-h3 d-flex justify-content-between w-100">
                    <div>🙍‍♀️ {data?.female || '0'}</div>
                    <div>{data?.male || '0'} 🙎‍♂️</div>
                    <!-- <div>{data?.other || '0'} ⚧️</div> -->
                </div>
            </div>
        </div>
    </div>
</div>

<svelte:head>
    <style>
        @media (max-width: 768px) {
            .card-title .card-label {
                font-size: 1rem !important;
            }
        }
    </style>
</svelte:head>
