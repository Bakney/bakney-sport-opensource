<script>
    import BasicModal from './BasicModal.svelte';
    import {userData} from 'store/stores.js';
    import {CaretCircleDown, CaretCircleUp, PaperPlane} from 'phosphor-svelte';
    import {createEventDispatcher, onDestroy, onMount} from 'svelte';
    import {toast} from 'svelte-sonner';
    import {apiFetch} from 'utils/ApiMiddleware';

    const dispatch = createEventDispatcher();

    export let id;
    export let title = 'Emetti quote associative parziali';
    export let cancelButton = 'Chiudi';
    export let actionButton = 'Emetti quote';
    export let dataHeight = 'auto';
    export let fullHeight = true;
    let show = true;
    let showFooter = true;
    let modalSize = 'lg';
    let scrollable = true;
    let showCancelButton = true;
    let showActionButton = true;
    let alignFooterCenter = false;

    let date = moment().format('YYYY-MM-DD');
    let subscriptionPlansConsidered = [];

    let quotesToEmit = [];

    userData.useLocalStorage();

    async function fetchPlansData() {
        let res = await apiFetch(__bakney.env.API.PAYMENT.SIMULATION.PARTIAL_QUOTES + `?date=${date}`);

        if (!res.error) {
            subscriptionPlansConsidered = [...res.response.subscription_plans_considered];
            quotesToEmit = [...res.response.quotes_to_emit];

            toast.success('Quote associative parziali caricate con successo.');
        } else {
            toast.error(res.error);
        }
    }

    async function applyQuotes() {
        let res = await apiFetch(__bakney.env.API.PAYMENT.SIMULATION.PARTIAL_QUOTES_APPLY + `?date=${date}`, {
            method: 'GET',
        });

        if (!res.error) {
            toast.success('Quote associative parziali emesse con successo.');
            show = false;
        } else {
            toast.error(res.error);
        }
    }

    onMount(() => {
        // set body overflow hidden and body height 100vh when modal is open
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100vh';
        fetchPlansData();
    });

    function clearBody() {
        document.body.style = 'overflow:auto;';
    }

    onDestroy(() => {
        clearBody();
    });
</script>

<BasicModal
    {id}
    {show}
    {fullHeight}
    {title}
    {cancelButton}
    {showCancelButton}
    {showFooter}
    {showActionButton}
    {actionButton}
    {scrollable}
    {dataHeight}
    {alignFooterCenter}
    {modalSize}
    on:cancel={clearBody}
    on:confirm={async () => {
        await applyQuotes();
        clearBody();
        location.reload();
        dispatch('close');
    }}>
    <div class="my-4">
        <h1>{title}</h1>
    </div>
    <div class="row">
        <div class="col-12">
            <!-- Seleziona giorno -->
            <div class="form-group row">
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <label class="col-12 col-form-label font-weight-bold">Seleziona giorno</label>
                <div class="col-12">
                    <input
                        bind:value={date}
                        type="date"
                        class="form-control"
                        on:change={() => {
                            fetchPlansData();
                        }} />
                </div>
                <span class="form-text text-muted col-12"
                    >Seleziona il giorno in cui emettere le quote associative parziali.</span>
            </div>
        </div>
        <!-- quote associative considerate -->
        <div class="col-12">
            <div class="form-group row">
                <!-- show all the quotes considered -->
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <label class="col-12 col-form-label font-weight-bold">Quote associative considerate</label>
                <div class="col-12">
                    {#each subscriptionPlansConsidered as plan}
                        <div class="d-flex justify-content-between">
                            <span>{plan.name}</span>
                            <span>{plan.subscription_fee} €</span>
                        </div>
                    {/each}
                    {#if subscriptionPlansConsidered.length === 0}
                        <span class="form-text text-muted">Nessuna quota associativa considerata.</span>
                    {/if}
                </div>
            </div>
        </div>
        <!-- quote associative da emettere -->
        <div class="col-12">
            <div class="form-group row">
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <label class="col-12 col-form-label font-weight-bold">Quote da emettere a gli atleti</label>
                <div class="col-12">
                    {#each quotesToEmit as plan, idx}
                        <div class="d-flex justify-content-between font-weight-bold font-size-lg align-items-center">
                            <div class="col-4">{plan.associate?.first_name} {plan.associate?.last_name}</div>
                            <div class="col-4">
                                {Number(plan.amount).toLocaleString('it-IT', {
                                    maximumFractionDigits: 2,
                                    minimumFractionDigits: 2,
                                })} €
                            </div>
                            <div class="col-4 d-flex justify-content-end">
                                <!-- svelte-ignore a11y-click-events-have-key-events -->
                                <!-- svelte-ignore a11y-missing-attribute -->
                                <a
                                    on:click={() => {
                                        // check if the div is hidden or not
                                        if (document.getElementById(idx).classList.contains('d-none')) {
                                            document.getElementById(idx).classList.toggle('d-none');
                                        } else {
                                            document.getElementById(idx).classList.toggle('d-none');
                                        }
                                    }}
                                    class="btn btn-icon btn-primary btn-sm">
                                    <CaretCircleDown weight="duotone" size={20} />
                                </a>
                            </div>
                        </div>
                        <!-- by clicking paper plane expand this div -->
                        <div id={idx} class="d-none font-size-sm">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="col-12 col-form-label font-weight-bold font-size-sm"
                                >Email che verrà inviata
                            </label>
                            <p class="p-4 mx-3 bg-light rounded">
                                {#if plan.message}
                                    {@html plan.message}
                                {:else}
                                    Non verrà inviata nessuna email perché l'utente è sprovvisto di email o l'iscrizione
                                    è legata all'account dell'associazione.
                                {/if}
                            </p>
                        </div>
                        <hr />
                    {/each}
                    {#if quotesToEmit.length === 0}
                        <span class="form-text text-muted">Nessuna quota da emettere.</span>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</BasicModal>
