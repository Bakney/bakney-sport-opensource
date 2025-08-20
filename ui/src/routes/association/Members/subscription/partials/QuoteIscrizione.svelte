<script>
    import NumberInput from 'components/inputs/NumberInput.svelte';
    import {Info} from 'phosphor-svelte';
    import {onMount} from 'svelte';
    import MultipleQuotesSubscription from './MultipleQuotesSubscription.svelte';
    import MultipleQuotesMembership from './MultipleQuotesMembership.svelte';

    export let userData;
    let subscription_fee;
    let membership_fee;
    let visibleAssociationQuotes = false;
    let visibleMembershipQuotes = false;

    onMount(async () => {
        try {
            userData.subscribe(data => {
                subscription_fee = data.sport_association.subscription_fee;
                membership_fee = data.sport_association.membership_fee;
            });
        } catch (error) {
            console.warn('Cannot subscribe to userData');
        }
    });
</script>

{#if userData}
    <div class="col-12 d-flex justify-content-start">
        <div class="text-left mt-4">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="font-weight-boldest">Associa quote iscrizione</label>
            <div class="input-group text-left mx-auto d-flex justify-content-start">
                <span class="switch switch-icon ml-0">
                    <label>
                        <input
                            type="checkbox"
                            name=""
                            bind:checked={userData.sport_association.enable_quotes_management} />
                        <span />
                    </label>
                </span>
            </div>
            <p class="text-muted font-weight-bold font-size-xs mt-2">
                Disabilitando questa opzione, non verranno create le quote associative e/o di tesseramento al momento
                dell'iscrizione.
            </p>
        </div>
    </div>
    <div class="col-12">
        <div class="mb-8">
            <div class="d-flex align-items-center text-bold text-info bg-light-info p-4 mb-4 rounded-lg">
                <div>
                    <Info size={18} weight="duotone" class="mr-4" />
                </div>
                <div>
                    Puoi anche creare quote <b>parziali</b>. Il sistema <b>assegna</b> le <b>quote successive</b> in
                    automatico. Inoltre, il socio viene
                    <b>notificato</b> per il pagamento. <br />
                </div>
            </div>
        </div>
    </div>
    <div
        class="col-12 col-xl-6 px-4"
        style="opacity: {userData.sport_association.enable_quotes_management ? 1 : 0.5};{userData.sport_association
            .enable_quotes_management
            ? ''
            : 'pointer-events:none;'}">
        <div id="quotes_subscription_module">
            <div class="row">
                <div class="col-12">
                    <h5 class="font-weight-bolder font-size-h2">Quota associativa</h5>
                    <p class="font-size-md text-dark-75">
                        Inserisci l'importo della quota associativa. Se la tua associazione prevede più tipologie di
                        quota associativa, attiva l'opzione <b>Quote multiple</b> per creare le tue quote.
                    </p>
                </div>
            </div>
            <div class="row mt-0 mb-6">
                <div class="col-md-12 col-lg-4 mt-2">
                    <!-- svelte-ignore a11y-label-has-associated-control -->
                    <label class="font-weight-boldest">Quota</label>
                    <NumberInput
                        reactive={true}
                        checkFloat={true}
                        placeholder="25,00"
                        bind:value={userData.sport_association.subscription_fee}
                        name="subscription_fee"
                        bind:disabled={userData.sport_association.multiple_subscription_fee} />
                </div>
                <div class="col-md-12 col-lg-4 mt-2">
                    <!-- svelte-ignore a11y-label-has-associated-control -->
                    <label class="font-weight-boldest">Quote multiple</label>
                    <div class="input-group">
                        <span class="switch switch-icon ml-0">
                            <label>
                                <input
                                    type="checkbox"
                                    name=""
                                    on:change={() => {
                                        if (!userData.sport_association.multiple_subscription_fee) {
                                            visibleAssociationQuotes = true;
                                        } else {
                                            visibleAssociationQuotes = false;
                                        }
                                    }}
                                    bind:checked={userData.sport_association.multiple_subscription_fee} />
                                <span />
                            </label>
                        </span>
                    </div>
                </div>
            </div>
            <MultipleQuotesSubscription bind:userData bind:visibleAssociationQuotes />
        </div>
    </div>
    <div
        class="col-12 col-xl-6 px-4"
        style="opacity: {userData.sport_association.enable_quotes_management ? 1 : 0.5};{userData.sport_association
            .enable_quotes_management
            ? ''
            : 'pointer-events:none;'}">
        <div id="membership_quotes_subscription_module">
            <div class="row">
                <div class="col-12">
                    <h5 class="font-weight-bolder font-size-h2">Quota Tesseramento</h5>
                    <p class="font-size-md text-dark-75">
                        Inserisci l'importo della quota per il tesseramento, se prevista. Se la tua associazione prevede
                        più tipologie, attiva l'opzione <b>Quote multiple</b> per creare le tue quote.
                    </p>
                </div>
            </div>
            <div class="row mt-0 mb-6">
                <div class="col-md-12 col-lg-4 mt-2">
                    <!-- svelte-ignore a11y-label-has-associated-control -->
                    <label class="font-weight-boldest">Quota</label>
                    <NumberInput
                        reactive={true}
                        checkFloat={true}
                        placeholder="25,00"
                        bind:value={userData.sport_association.membership_fee}
                        name="membership_fee"
                        bind:disabled={userData.sport_association.multiple_membership_fee} />
                </div>
                <div class="col-md-12 col-lg-4 mt-2">
                    <!-- svelte-ignore a11y-label-has-associated-control -->
                    <label class="font-weight-boldest">Quote multiple</label>
                    <div class="input-group">
                        <span class="switch switch-icon ml-0">
                            <label>
                                <input
                                    type="checkbox"
                                    name=""
                                    on:change={() => {
                                        if (!userData.sport_association.multiple_membership_fee) {
                                            visibleMembershipQuotes = true;
                                        } else {
                                            visibleMembershipQuotes = false;
                                        }
                                    }}
                                    bind:checked={userData.sport_association.multiple_membership_fee} />
                                <span />
                            </label>
                        </span>
                    </div>
                </div>
            </div>
            <MultipleQuotesMembership bind:userData bind:visibleMembershipQuotes />
        </div>
    </div>
{/if}
