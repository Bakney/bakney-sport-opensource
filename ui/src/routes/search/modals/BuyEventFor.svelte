<script>
    import Checkout from 'routes/stripe/Checkout.svelte';
    import {onMount} from 'svelte';
    import {toast} from 'svelte-sonner';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import {toBase64} from 'utils/Functions.js';

    export let id = '';
    export let sport_association_id = '';
    export let event = '';
    export let callback = () => {
        console.info('reload');
    };
    export let loading = true;
    export let associates = [];
    let subscribe_athlete = 'altro';
    let subscribe_type_id = 0;
    let payment;

    let pages = {
        data: 0,
        payment: 1,
        active: 0,
    };

    let subscriptionObj = {
        subscription_id: '',
        first_name: '',
        last_name: '',
        full_name: '',
        tax_code: '',
        sex: 'F',
        address_cap: '',
        address_city: '',
        born_city: '',
        born_date: '',
        address: '',
        selected: false,
    };

    onMount(async () => {
        // loading = true;
        await fetchData();
        subscribe_athlete = event?.open_to == 2 ? associates[0]?.subscription_id : 'altro';
        loading = false;
    });

    export function reset() {
        fetchData();
    }

    export async function fetchData() {
        let res = await apiFetch(__bakney.env.API.SUBSCRIPTION.LIST, {method: 'GET'});
        if (!res.error) {
            associates = (Object.values(res.response.data) || [])
                .filter(x => x.sport_association.sport_association_id == sport_association_id)
                .map(x => {
                    return {
                        subscription_id: x.subscription_id,
                        full_name: x.associate.first_name + ' ' + x.associate.last_name,
                        selected: false,
                    };
                });
        }
    }

    async function createEventSubscription() {
        // let subscribe_type_data = event?.subscription_types?.find(x => x.id == subscribe_type_id);
        let subscribe_type_data = {};
        subscribe_type_data.event = event.event_id;
        subscribe_type_data.medical_certificate = subscriptionObj?.medical_certificate || null;
        subscribe_type_data.associate = {
            first_name: subscriptionObj?.first_name,
            last_name: subscriptionObj?.last_name,
            born_date: moment(subscriptionObj?.born_date).format('DD/MM/YYYY'), // format with moment to DD/MM/YYYY
            born_city: subscriptionObj?.born_city,
            address: subscriptionObj?.address,
            address_cap: subscriptionObj?.address_cap,
            address_city: subscriptionObj?.address_city,
            sex: subscriptionObj?.sex,
            tax_code: subscriptionObj?.tax_code,
        };
        subscribe_type_data.subscription_id = subscribe_athlete;
        subscribe_type_data.subscription = event.subscription_types.find(x => x.id == subscribe_type_id);

        let response = await apiFetch(replaceUID(__bakney.env.API.EVENT.SUBSCRIPTION.ADD, id), {
            method: 'POST',
            body: JSON.stringify(subscribe_type_data),
        });

        if (!response.error) {
            // toast.success('Evento aggiunto!');
            payment = response.response.data.payment;
            pages.active = pages.payment;
        } else {
            let modalText =
                response.status == 403 ? 'Operazione non permessa.' : 'Scusa, ho individuato degli errori, riprova.';
            toast.error(modalText);
        }
    }
</script>

<div
    class="modal fade"
    id="subscription-event-{id}"
    tabindex="-1"
    role="dialog"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">
                    <span class="font-weight-boldest">{event.title}</span>
                </h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <i aria-hidden="true" class="ki ki-close" />
                </button>
            </div>
            <div class="modal-body">
                {#if pages.active == pages.data}
                    <div class="scroll scroll-pull" data-scroll="true" data-height="400">
                        <p>Partecipa ad un evento compilando con i tuoi dati.</p>

                        <div class="form-group row mb-0">
                            <div class="col-12 col-form-label">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Quota iscrizione</label>
                                <select
                                    class="form-control form-control-solid"
                                    placeholder="Seleziona atleta"
                                    bind:value={subscribe_type_id}>
                                    {#each event.subscription_types || [] as sub}
                                        {#if sub.default}
                                            <option value={sub.id} selected="selected">
                                                {new Intl.NumberFormat('it-IT', {
                                                    style: 'currency',
                                                    currency: 'EUR',
                                                }).format(sub.amount || '0')}</option>
                                        {:else}
                                            <option value={sub.id}>
                                                {new Intl.NumberFormat('it-IT', {
                                                    style: 'currency',
                                                    currency: 'EUR',
                                                }).format(sub.amount || '0')}</option>
                                        {/if}
                                    {/each}
                                </select>
                            </div>
                        </div>
                        <div class="form-group row mb-0">
                            <div class="col-12 col-form-label">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Atleta da iscrivere</label>
                                <select
                                    class="form-control form-control-solid"
                                    placeholder="Seleziona atleta"
                                    bind:value={subscribe_athlete}>
                                    {#if event.open_to == 1}
                                        <option value="altro" selected="selected"
                                            >Inserisci informazioni manualmente</option>
                                    {/if}
                                    {#each associates || [] as associate, idx}
                                        {#if event.open_to == 2 && idx == 0}
                                            <option value={associate.subscription_id} selected="selected"
                                                >{associate.full_name}</option>
                                        {:else}
                                            <option value={associate.subscription_id}>{associate.full_name}</option>
                                        {/if}
                                    {/each}
                                </select>
                            </div>
                        </div>
                        {#if subscribe_athlete == 'altro'}
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Nome</label>
                                <input
                                    type="text"
                                    class="form-control form-control-solid"
                                    placeholder="Nome"
                                    bind:value={subscriptionObj.first_name} />
                            </div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Cognome</label>
                                <input
                                    type="text"
                                    class="form-control form-control-solid"
                                    placeholder="Cognome"
                                    bind:value={subscriptionObj.last_name} />
                            </div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Sesso</label>
                                <select class="form-control form-control-solid" bind:value={subscriptionObj.sex}>
                                    <option value="M">Maschio</option>
                                    <option value="F">Femmina</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Data di nascita</label>
                                <input
                                    type="date"
                                    class="form-control form-control-solid"
                                    placeholder="Data di nascita"
                                    bind:value={subscriptionObj.born_date} />
                            </div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Luogo di nascita</label>
                                <input
                                    type="text"
                                    class="form-control form-control-solid"
                                    placeholder="Luogo di nascita"
                                    bind:value={subscriptionObj.born_city} />
                            </div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Codice fiscale</label>
                                <input
                                    type="text"
                                    class="form-control form-control-solid"
                                    placeholder="Codice fiscale"
                                    bind:value={subscriptionObj.tax_code} />
                            </div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Indirizzo</label>
                                <input
                                    type="text"
                                    class="form-control form-control-solid"
                                    placeholder="Indirizzo"
                                    bind:value={subscriptionObj.address} />
                            </div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>CAP</label>
                                <input
                                    type="text"
                                    class="form-control form-control-solid"
                                    placeholder="CAP"
                                    bind:value={subscriptionObj.address_cap} />
                            </div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Città</label>
                                <input
                                    type="text"
                                    class="form-control form-control-solid"
                                    placeholder="Città"
                                    bind:value={subscriptionObj.address_city} />
                            </div>
                            {#if event.subscription_types[subscribe_type_id].medical_certificate_required}
                                <div class="form-group" style="font-size:1rem;">
                                    <!-- svelte-ignore a11y-label-has-associated-control -->
                                    <label>Certificato medico</label>
                                    <div class="custom-file" style="font-size:1rem;">
                                        <input
                                            style="font-size:1rem;"
                                            type="file"
                                            class="custom-file form-control form-control-solid"
                                            id="certificato-medico-{id}"
                                            name="certificato-medico-{id}"
                                            accept="image/png, image/jpeg, application/pdf"
                                            on:change={async () => {
                                                const file = document.querySelector('#certificato-medico-' + id)
                                                    .files[0];
                                                let base64 = await toBase64(file);
                                                subscriptionObj.medical_certificate = base64;
                                                document.querySelector('#certificato-medico-label-' + id).innerHTML =
                                                    file.name;
                                            }} />
                                        <label
                                            class="custom-file-label"
                                            id="certificato-medico-label-{id}"
                                            for="certificato-medico-{id}"
                                            style="font-size:1rem;background: #f3f6f9;border: 0.1rem solid #e5ecf3;"
                                            >Seleziona file</label>
                                    </div>
                                </div>
                            {/if}
                        {/if}
                    </div>
                {:else}
                    <div class="scroll scroll-pull" data-scroll="true" data-height="400">
                        {#if event.online_pay_available}
                            <Checkout
                                bind:id={payment}
                                inModal={true}
                                {event}
                                {subscriptionObj}
                                {subscribe_type_id}
                                {subscribe_athlete} />
                        {:else}
                            <div class="text-center">
                                Iscrizione effettuata con successo! Contatta l'associazione per il pagamento
                            </div>
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <!-- svelte-ignore a11y-missing-attribute -->
                        {/if}
                    </div>
                {/if}
            </div>
            <div class="modal-footer">
                <!-- {#if pages.active == pages.data} -->
                <button type="button" class="btn btn-light-primary font-weight-bolder" data-dismiss="modal"
                    >Chiudi</button>
                <!-- {:else}
                    <button
                        type="button"
                        class="btn btn-light-primary font-weight-bolder"
                        on:click={() => {
                            pages.active = pages.data;
                        }}>Indietro</button>
                {/if} -->
                {#if pages.active == pages.data}
                    <button
                        type="button"
                        disabled={subscribe_athlete == 'altro' &&
                            (!subscriptionObj.first_name ||
                                !subscriptionObj.last_name ||
                                !subscriptionObj.sex ||
                                !subscriptionObj.born_date ||
                                !subscriptionObj.born_city ||
                                !subscriptionObj.tax_code ||
                                !subscriptionObj.address ||
                                !subscriptionObj.address_cap ||
                                subscriptionObj.address_cap.length > 5 ||
                                !subscriptionObj.address_city ||
                                (event.subscription_types[subscribe_type_id].medical_certificate_required &&
                                    !subscriptionObj.medical_certificate))}
                        class="btn btn-primary font-weight-bold"
                        on:click={async () => {
                            await createEventSubscription();
                        }}>Vai alla cassa</button>
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
    .custom-file-label::after {
        content: 'Scegli file';
    }
    .checkbox-darker {
        font-size: 1rem;
        padding: 1rem;
        background: #f7f7f7;
        border-radius: 0.5rem;
        word-break: break-word;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        border: 1px solid #351dc205;
    }
    .checkbox-darker > span {
        background-color: #d5d5d7;
    }
    .checkbox-darker > input:checked ~ span {
        background-color: #351dc2;
    }

    .selected-checkbox-container {
        background-color: #e7e6e6 !important;
        font-weight: 600;
    }
</style>
