<script>
    import {beforeUpdate, createEventDispatcher, onDestroy} from 'svelte';
    import RateElement from './RateElement.svelte';

    let dispatch = createEventDispatcher();

    export let events = [];
    export let totalAmount = '0.00';
    export let isSubscription = false;
    export let storeData = {
        type: 'inst-divided', // => inst-recurrent: recurrent payment, inst-divided: divided payment
        events: [],
        wizardState: 'on-generate',
        periods: 2,
        instCanBeDifferent: false,
    };
    export let description =
        'La rateizzazione della quota permette di suddividere l\'importo in più pagamenti. <br />\
            Con la funzione\
            <span class="font-weight-bold">"Permetti rate di import diversi"</span>\
            attiva puoi inserire rate di importo diverso; in questo caso l\'importo totale verrà calcolato automaticamente.\
            <br /><span class="font-weight-bold text-warning">\
                Attenzione: le rate saranno disponibili per il pagamamento 30 giorni prima della loro data di scadenza.</span>';

    let validRateNumber = false;

    onDestroy(() => {
        events = [];
        storeData = {
            type: 'inst-divided', // => inst-recurrent: recurrent payment, inst-divided: divided payment
            events: [],
            wizardState: 'on-generate',
            periods: 2,
            instCanBeDifferent: false,
        };
    });

    beforeUpdate(() => {
        dispatch('update', events);
    });

    $: {
        if (events.length == 0) storeData.wizardState = 'on-generate';

        if (storeData.type == 'inst-divided') {
            if (storeData.instCanBeDifferent) {
                totalAmount = events.reduce((acc, e) => acc + parseFloat(e.amount), 0).toFixed(2);
                dispatch('amountUpdated', totalAmount);
            } else {
                events.forEach(e => (e.amount = (parseFloat(totalAmount) / events.length).toFixed(2)));
                events = [...events];
                dispatch('update', events);
            }
        }
    }

    $: storeData.periods, (validRateNumber = storeData.periods > 1 && storeData.periods <= 30);

    function generateEvents() {
        if (storeData.periods < 1 || storeData.periods > 30) return;
        let eventAmount = (parseFloat(totalAmount) / storeData.preiods).toPrecision(2);
        for (let i = 0; i < storeData.periods; i++) {
            events.push({
                id: i,
                amount: eventAmount,
                payment_date: moment(new Date(Date.now()), 'DD-MM-YYYY').add(i, 'M').format('DD/MM/YYYY'),
            });
        }
        dispatch('update', events);
        storeData.wizardState = 'on-edit';
    }
</script>

{#if storeData.wizardState == 'on-generate'}
    <div
        class="col-12 col-md-6 col-xl-8 m-auto ml-0 pl-0"
        style="margin-bottom:1rem!important;padding-left:0!important;">
        {#if !validRateNumber}
            <p class="m-auto text-danger font-size-sm">Numero rate non valido, inserisci un numero tra 2 e 30</p>
        {:else if storeData.type == 'inst-recurrent'}
            <p class="m-auto">Per quante volte vuoi richiedere questo importo?</p>
        {:else if storeData.type == 'inst-divided'}
            <p class="m-auto">In quante rate vuoi dividere l'importo?</p>
        {:else}
            <p class="m-auto">Qualcosa è andato storto.</p>
        {/if}
    </div>
    <div class="col-6 col-md-3 col-xl-2 ml-0 m-md-auto">
        <input
            style="max-width: 6rem;"
            class="form-control form-control-solid form-control-sm"
            type="number"
            bind:value={storeData.periods}
            min="2"
            max="12" />
    </div>
    <div class="col-6 col-md-3 col-xl-2 m-auto text-right">
        <!-- svelte-ignore a11y-missing-attribute -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <a class="btn btn-primary btn-sm m-auto {!validRateNumber ? 'disabled' : ''}" on:click={generateEvents}
            >Crea Rate</a>
    </div>
{/if}

{#if storeData.wizardState != 'on-generate' && events.length > 0 && storeData.wizardState == 'on-edit'}
    <div class="col-12 m-0 p-0">
        <p>
            {@html description}
        </p>
    </div>
    <div class="form-group row col-8">
        <p class="col-8 font-size m-auto pl-0" style="margin-left: 0!important;margin-right: 0!important">
            Permetti rate di importi diversi
        </p>
        <div class="col-2 ml-0 pl-0">
            <span class="switch switch-icon m-auto ml-0">
                <label>
                    <input type="checkbox" name="" bind:checked={storeData.instCanBeDifferent} />
                    <span />
                </label>
            </span>
        </div>
    </div>
    {#each events as event}
        <RateElement
            bind:event
            editableAmounts={storeData.instCanBeDifferent}
            bind:isSubscription
            on:update={data => {
                events = events.map(e => {
                    if (e.id == data.detail.id) {
                        e = data.detail;
                    }
                    return e;
                });
            }}
            on:removeEvent={data => {
                events = events.filter(e => e.id != data.detail);
                events.forEach((e, i) => {
                    e.id = i;
                });
            }} />
    {/each}
{/if}
