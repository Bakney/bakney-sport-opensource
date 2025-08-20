<script>
    import {createEventDispatcher, onMount} from 'svelte';
    import {slide} from 'svelte/transition';
    import {EURcurrency} from 'utils/Functions.js';
    import {ArrowRight, Warning} from 'phosphor-svelte';

    export let periods = [];

    export let selectedPeriods = {};
    export let selectedServices = {};
    export let paidPeriods = {};
    export let currentPeriods = [];

    const dispatch = createEventDispatcher();

    function togglePeriod(periodId) {
        selectedPeriods[periodId] = !selectedPeriods[periodId];
        updateSelection();
    }

    function isServiceSelected(periodId, serviceId) {
        return selectedServices[periodId]?.[serviceId] || false;
    }

    function handleServiceChange(periodId, serviceId, event) {
        if (!selectedServices[periodId]) {
            selectedServices[periodId] = {};
        }
        selectedServices[periodId][serviceId] = event.target.checked;
        updateSelection();
    }

    function updateSelection() {
        const selection = {
            periods: Object.keys(selectedPeriods)
                .filter(id => selectedPeriods[id])
                .map(periodId => {
                    const period = periods.find(p => p.camps_and_retreats_period_id === periodId);
                    return {
                        camps_and_retreats_period: periodId,
                        title: period.title,
                        description: period.description,
                        fee: period.fee,
                        services: period.services
                            .filter(
                                service => selectedServices[periodId]?.[service.camps_and_retreats_period_service_id]
                            )
                            .map(service => ({
                                camps_and_retreats_period_service_id: service.camps_and_retreats_period_service_id,
                                payment_category: service.payment_category,
                                fee: service.fee,
                                title: service.title,
                            })),
                    };
                }),
        };
        dispatch('selectionChange', selection);
    }

    onMount(() => {
        updateSelection();
    });
</script>

<div class="accordion border rounded-lg overflow-hidden" id="periodsAccordion">
    {#each periods as period, index}
        {@const currentPayment = currentPeriods.find(
            p => p.camps_and_retreats_period.camps_and_retreats_period_id === period.camps_and_retreats_period_id
        )?.payment}
        {#if paidPeriods[period.camps_and_retreats_period_id] === true}
            <div
                class="d-flex mx-6 mt-8 align-items-center text-warning bg-light-warning p-4 mb-4 py-3 px-4 mb-4 font-weight-bold font-size-sm"
                style="border-radius: .35rem;">
                <Warning size={18} weight="duotone" class="mr-2" />
                Il periodo {period.title} ({period.start_date} - {period.end_date}) è già stato pagato. Non è possibile
                modificarlo.
                <a
                    class="mx-1 font-weight-boldest text-warning"
                    href="/#/payment/list/{currentPayment.payment_id}"
                    target="_blank"><u>Vedi pagamento</u> <ArrowRight size={12} weight="bold" /></a>
            </div>
        {:else if currentPayment === null}
            <div
                class="d-flex mx-6 mt-8 align-items-center justify-content-between text-dark bg-light py-3 px-4 mb-4 font-weight-bold font-size-sm"
                style="border-radius: .35rem;">
                Pagamento non associato al periodo
                <button
                    type="submit"
                    class="btn btn-dark btn-sm py-1 px-3 ml-3 mb-0 mr-0 font-size-sm font-weight-boldest">Crea</button>
            </div>
        {:else if currentPayment?.paid === false}
            <div
                class="d-flex mx-6 mt-8 align-items-center justify-content-between text-primary bg-light-primary py-3 px-4 mb-4 font-weight-bold font-size-sm"
                style="border-radius: .35rem;">
                <span>
                    Pagamento in attesa (<span class="font-weight-boldest"
                        >{EURcurrency.format(parseFloat(String(currentPayment.amount).replace(',', '.')))}</span
                    >)
                </span>
                <a class="mx-1 font-weight-boldest" href="/#/payment/list/{currentPayment.payment_id}" target="_blank"
                    ><u>Vedi pagamento</u></a>
            </div>
        {/if}
        <div
            class="cursor-pointer border-bottom"
            class:opacity-50={paidPeriods[period.camps_and_retreats_period_id] === true}>
            <div class="font-weight-boldest text-primary d-flex justify-content-between py-5 px-6" id="heading{index}">
                <div>
                    <label class="checkbox checkbox-rounded">
                        <input
                            type="checkbox"
                            disabled={paidPeriods[period.camps_and_retreats_period_id] === true}
                            on:change={() => {
                                togglePeriod(period.camps_and_retreats_period_id);
                            }}
                            bind:checked={selectedPeriods[period.camps_and_retreats_period_id]} />
                        <span class="mr-4" />
                        {period.title} ({period.start_date} - {period.end_date})
                    </label>
                </div>

                <div class="text-dark">
                    {#if period.services && period.services.length > 0}
                        <span class="badge badge-secondary badge-pill mr-2">
                            {period.services.length} Servizi
                        </span>
                    {/if}
                    {EURcurrency.format(parseFloat(String(period.fee).replace(',', '.')))}
                </div>
            </div>
            {#if selectedPeriods[period.camps_and_retreats_period_id]}
                <div
                    id="collapse{index}"
                    transition:slide={{duration: 250}}
                    aria-labelledby="heading{index}"
                    data-parent="#periodsAccordion">
                    <div class="px-6 py-3">
                        <h5 class="font-weight-bolder">Descrizione</h5>
                        <p>{period.description}</p>
                        {#if period.services && period.services.length > 0}
                            <h5 class="font-weight-bolder mb-4">Seleziona i servizi aggiuntivi</h5>
                            {#each period.services as service}
                                <div class="border rounded-xl bg-light my-2 py-4 px-4">
                                    <label class="checkbox checkbox-rounded">
                                        <input
                                            type="checkbox"
                                            disabled={paidPeriods[period.camps_and_retreats_period_id] === true}
                                            checked={isServiceSelected(
                                                period.camps_and_retreats_period_id,
                                                service.camps_and_retreats_period_service_id
                                            )}
                                            on:change={event =>
                                                handleServiceChange(
                                                    period.camps_and_retreats_period_id,
                                                    service.camps_and_retreats_period_service_id,
                                                    event
                                                )} />
                                        <span class="mr-4" />
                                        <b class="text-primary font-weight-boldest">{service.title}</b>
                                    </label>
                                    <div class="d-flex justify-content-between mt-4 text-dark">
                                        <p class="mb-0">{service.description}</p>
                                        <span class="text-dark font-weight-boldest"
                                            >{EURcurrency.format(
                                                parseFloat(String(service.fee).replace(',', '.'))
                                            )}</span>
                                    </div>
                                </div>
                            {/each}
                        {/if}
                    </div>
                </div>
            {/if}
        </div>
    {/each}
</div>
