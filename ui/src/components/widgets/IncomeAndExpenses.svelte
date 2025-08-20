<script>
    import {ArrowDown, ArrowUp, ChartLineDown, ChartLineUp} from 'phosphor-svelte';
    import {onMount} from 'svelte';
    import {apiFetch} from 'utils/ApiMiddleware';

    let data = {
        today_income: 0,
        last_month_income: 0,
        total_income: 0,
        today_expenses: 0,
        last_month_expenses: 0,
        total_expenses: 0,
    };
    let loading = true;

    onMount(async () => {
        const res = await apiFetch(`${__bakney.env.HOST}/statistic/dashboard?widget=incomeAndExpenses`, {
            method: 'GET',
        });
        loading = false;
        // spinner stop
        if (!res.error) {
            data = res.response.data;
        }
    });
</script>

<div class="card card-custom rounded-xl overflow-hidden bg-dark card-stretch dashboard-widget">
    <div class="card-header border-0 pt-6">
        <h3 class="card-title align-items-start flex-column" style="width:100%;">
            <span class="card-label font-weight-bolder font-size-h6 text-white">Riepilogo Pagamenti</span>
            <span class="font-weight-bolder font-size-h1 text-white mt-2" style="width:100%;">
                {#if loading}
                    ...
                {:else}
                    <div class="d-flex justify-content-between mt-2">
                        <div class="text-left">
                            <h4 class="d-flex mb-0 font-weight-bolder">
                                <ArrowUp size={20} class="text-white mr-1" weight="duotone" />
                                Entrate
                            </h4>
                            <div class="text-white font-weight mt-3" style="font-size: .9rem;">Oggi</div>
                            <div style="font-size: 1.35rem;">
                                {new Intl.NumberFormat('it-IT', {style: 'currency', currency: 'EUR'}).format(
                                    data.today_income || '0'
                                )}
                            </div>

                            <div class="text-white font-weight-bold mt-3" style="font-size: .9rem;">Ultimi 30gg</div>
                            <div style="font-size: 1.35rem;">
                                {new Intl.NumberFormat('it-IT', {style: 'currency', currency: 'EUR'}).format(
                                    data.last_month_income || '0'
                                )}
                            </div>

                            <div class="text-white font-weight-bold mt-3" style="font-size: .9rem;">Da inizio anno</div>
                            <div style="font-size: 1.35rem;">
                                {new Intl.NumberFormat('it-IT', {style: 'currency', currency: 'EUR'}).format(
                                    data.total_income || '0'
                                )}
                            </div>
                        </div>
                        <div class="text-right">
                            <h4 class="d-flex mb-0 font-weight-bolder">
                                <ArrowDown size={20} class="text-white mr-1" weight="duotone" />
                                Uscite
                            </h4>
                            <div class="text-white font-weight-bold mt-3" style="font-size: .9rem;">Oggi</div>
                            <div style="font-size: 1.35rem;">
                                {new Intl.NumberFormat('it-IT', {style: 'currency', currency: 'EUR'}).format(
                                    data.today_expenses || '0'
                                )}
                            </div>

                            <div class="text-white font-weight-bold mt-3" style="font-size: .9rem;">Ultimi 30gg</div>
                            <div style="font-size: 1.35rem;">
                                {new Intl.NumberFormat('it-IT', {style: 'currency', currency: 'EUR'}).format(
                                    data.last_month_expenses || '0'
                                )}
                            </div>

                            <div class="text-white font-weight-bold mt-3" style="font-size: .9rem;">Da inizio anno</div>
                            <div style="font-size: 1.35rem;">
                                {new Intl.NumberFormat('it-IT', {style: 'currency', currency: 'EUR'}).format(
                                    data.total_expenses || '0'
                                )}
                            </div>
                        </div>
                    </div>
                {/if}
            </span>
        </h3>
    </div>
</div>
