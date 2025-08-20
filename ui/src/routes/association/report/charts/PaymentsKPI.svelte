<script>
    export let data;
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="font-weight-bolder h3 mb-4">Indicatori chiave di prestazione (KPI)</label>
<div class="d-flex" style="gap: 1rem;height: 91px">
    <div class="card" style="width: 50%">
        <div class="card-body" style="padding: .5rem 1rem;">
            <div class="card-title align-items-start flex-column d-flex justify-content-center h-100">
                <span class="card-label font-weight-bolder font-size-h4 text-dark-75">Entrate da iscrizioni</span>
                <span class="card-label mt-2 font-weight-bolder font-size-h3 text-success">{Number(data?.total_subscriptions || 0).toLocaleString("it-IT", {minimumFractionDigits: 2})} €</span>
            </div>
        </div>
    </div>
    <div class="card" style="width: 50%">
        <div class="card-body" style="padding: .5rem 1rem;">
            <div class="card-title align-items-start flex-column d-flex justify-content-center h-100">
                <span class="card-label font-weight-bolder font-size-h4 text-dark-75">Pagamenti effettuati</span>
                <span class="card-label mt-2 font-weight-bolder font-size-h3 text-primary">{data?.total_payments || '0'} {data?.total_payments == 1 ? 'pagamento' : 'pagamenti'}</span>
            </div>
        </div>
    </div>
</div>
<div class="d-flex pt-4" style="gap: 1rem;height: 91px">
    <div class="card" style="width: 50%">
        <div class="card-body" style="padding: .5rem 1rem;">
            <div class="card-title align-items-start flex-column d-flex justify-content-center h-100">
                <span class="card-label font-weight-bolder font-size-h4 text-dark-75">Entrate da attività</span>
                <span class="card-label mt-2 font-weight-bolder font-size-h3 text-success">{Number(data?.total_activities || 0).toLocaleString("it-IT", {minimumFractionDigits: 2})} €</span>
            </div>
        </div>
    </div>
    <div class="card" style="width: 50%">
        <div class="card-body" style="padding: .5rem 1rem;">
            <div class="card-title align-items-start flex-column d-flex justify-content-center h-100">
                <span class="card-label font-weight-bolder font-size-h4 text-dark-75">Ricevute emesse</span>
                <span class="card-label mt-2 font-weight-bolder font-size-h3 text-primary">{data?.total_invoices || '0'} {data?.total_payments == 1 ? 'ricevuta' : 'ricevute'}</span>
            </div>
        </div>
    </div>
</div>
