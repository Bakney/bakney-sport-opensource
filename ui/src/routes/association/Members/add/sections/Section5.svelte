<script>
    import {paymentMethod} from 'store/stores.js';

    paymentMethod.useLocalStorage();
</script>

<div class="pb-5" data-wizard-type="step-content">
    <h4 class="mb-10 font-weight-bold text-dark wizard-title-info">Scegli il tipo di pagamento</h4>

    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="subtitle-label">Vuoi pagare online?</label>
    <span class="form-text text-muted" style="display: block;">
        Puoi pagare <b>subito</b> attraverso la piattaforma <b>{__bakney.OEM_CONFIG?.name}</b>, altrimenti puoi
        scegliere altre tipologie di pagamento come <b>Bonifico Manuale</b> o <b>Cash (contanti)</b>.
    </span>

    <div class="row">
        <form class="form">
            <div class="card-body" style="padding-left: 1rem;">
                <div class="form-group m-0">
                    <!-- svelte-ignore a11y-label-has-associated-control -->
                    <div class="row">
                        <div class="col-lg-12">
                            <label class="option">
                                <span class="option-control">
                                    <span class="radio">
                                        <input
                                            type="radio"
                                            name="payment_option"
                                            value="cash"
                                            bind:group={$paymentMethod.type}
                                            checked={$paymentMethod.type == 'cash'} />
                                        <span />
                                    </span>
                                </span>
                                <span class="option-label">
                                    <span class="option-head">
                                        <span class="option-title"> Contanti (cash) </span>
                                    </span>
                                    <span class="option-body">
                                        Scegliendo questo tipo di pagamento dovrai pagare con soldi contanti
                                        l'associazione.
                                    </span>
                                </span>
                            </label>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-lg-12">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="option">
                                <span class="option-control">
                                    <span class="radio">
                                        <input
                                            type="radio"
                                            name="payment_option"
                                            value="transfer"
                                            bind:group={$paymentMethod.type}
                                            checked={$paymentMethod.type == 'transfer'} />
                                        <span />
                                    </span>
                                </span>
                                <span class="option-label">
                                    <span class="option-head">
                                        <span class="option-title"> Bonifico (manuale) </span>
                                    </span>
                                    <span class="option-body">
                                        Scegliendo questo tipo di pagamento dovrai effettuare un bonifico
                                        all'associazione con l'importo corretto.
                                    </span>
                                </span>
                            </label>
                        </div>
                    </div>

                    <div class="row" style="opacity: 0.2;">
                        <div class="col-lg-12">
                            <div class="overlay">Sarà disponibile a breve.</div>
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="option">
                                <span class="option-control">
                                    <span class="radio">
                                        <input
                                            type="radio"
                                            name="payment_option"
                                            value="online"
                                            bind:group={$paymentMethod.type}
                                            checked={$paymentMethod.type == 'online'}
                                            disabled />
                                        <span />
                                    </span>
                                </span>
                                <span class="option-label">
                                    <span class="option-head">
                                        <span class="option-title"> ONLINE (carta prepagata o di credito) </span>
                                    </span>
                                    <span class="option-body">
                                        Scegliendo questo tipo di pagamento potrai pagare online e <b>subito</b> l'associazione.
                                    </span>
                                </span>
                            </label>
                        </div>
                    </div>

                    <div class="row" style="opacity: 0.2;">
                        <div class="col-lg-12">
                            <div class="overlay">Sarà disponibile a breve.</div>
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="option">
                                <span class="option-control">
                                    <span class="radio">
                                        <input
                                            type="radio"
                                            name="payment_option"
                                            value="sepa-transfer"
                                            bind:group={$paymentMethod.type}
                                            checked={$paymentMethod.type == 'sepa-transfer'}
                                            disabled />
                                        <span />
                                    </span>
                                </span>
                                <span class="option-label">
                                    <span class="option-head">
                                        <span class="option-title"> Bonifico (SEPA) </span>
                                    </span>
                                    <span class="option-body">
                                        Scegliendo questo tipo di pagamento potrai effettuare bonifici SEPA direttamente
                                        dall'app, tuttavia ogni operazione richiederà un codice OTP inviato via email o
                                        tramite SMS.
                                    </span>
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </div>
</div>

<style>
    .overlay {
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgb(41 41 41 / 67%);
        z-index: 2;
        cursor: pointer;
        color: #fff;
        margin: 0 1rem 0 1rem;
        line-height: 8rem;
        font-size: 1.2rem;
        text-align: center;
        font-weight: 600;
        margin: 0.1rem 1rem 0.6rem 1rem;
        text-shadow: 0.1rem 0.2rem 5px #000000;
        border-radius: 0.2rem;
    }
</style>
