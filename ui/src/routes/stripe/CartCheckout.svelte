<script>
    import {scale} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import {apiFetch} from 'utils/ApiMiddleware';
    import {replace} from 'svelte-spa-router';
    import {fade} from 'svelte/transition';
    import {Circle} from 'svelte-loading-spinners';
    import {onMount} from 'svelte';
    import {Files, PersonSimpleRun, Wallet} from 'phosphor-svelte';

    export let inModal = false;
    export let id;

    const subjectMap = {
        1: {
            value: 'subscription',
            text: 'Iscrizione',
        },
        2: {
            value: 'course',
            text: 'Corso',
        },
        0: {
            value: 'other',
            text: 'Evento',
        },
    };
    let data = {
        subject: 1,
        amount: '0.00',
        info: {},
    };
    let stripeData = {
        client_secret: '',
        stripe_account: '',
    };
    let loaded = false;
    let isPaying = false;

    // $: $params, checkParamsId();

    // async function checkParamsId() {
    //     loaded = false;
    //     // if ($params?.id) {
    //     KTApp.blockPage({
    //         overlayColor: '#000000',
    //         state: 'primary',
    //         message: 'Caricamento in corso...',
    //     });
    //     // await fetchPaymentInfo($params.id);
    //     data = sessionStorage.getItem('cartPayments');
    //     await fetchPaymentIntent();
    //     await loadStripeComponent();
    //     // }
    //     loaded = true;
    // }

    onMount(async () => {
        // if (!$params?.id && id) {
        loaded = false;
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Caricamento in corso...',
        });
        // await fetchPaymentInfo(id);
        await fetchPaymentIntent();
        loaded = true;
        setTimeout(async () => {
            await loadStripeComponent();
        }, 300);
        // }
    });

    /**
     * fetch payment info
     * @param id
     */
    // async function fetchPaymentInfo(id) {
    //     if (!id) return;
    //     const res = await apiFetch(replaceUID(__bakney.env.API.PAYMENT.INFO, id));
    //     data = res.response.data;
    // }

    /**
     * fetch stripe intent or create a new one if doesn't exists
     * @param id
     */
    async function fetchPaymentIntent() {
        const res = await apiFetch(__bakney.env.API.STRIPE.MULTIPLE_PAY, {
            method: 'POST',
            body: JSON.stringify({payments: JSON.parse(sessionStorage.getItem('cartPayments'))}),
        });
        if (!res.error && res?.response?.data?.status != 'paid') {
            stripeData.client_secret = res?.response?.data?.client_secret || '';
            stripeData.stripe_account = res?.response?.data?.stripe_account || '';
            data.info = res?.response?.data?.info;
        } else {
            replace('/payment/list');
        }
    }

    async function initStripe(stripe_account) {
        if (!stripe_account)
            return console.warn('[STRIPE] Cannot load Stripe Component because of missing stripe_account in init');
        return Stripe(__bakney.STRIPE_KEY, {stripeAccount: stripe_account});
    }

    async function loadStripeComponent() {
        const client_secret = stripeData.client_secret || null;
        const stripe_account = stripeData.stripe_account || null;
        const stripe = await initStripe(stripe_account);

        // check that both values are loaded
        if (client_secret == null || stripe_account == null)
            return console.warn('[STRIPE] Cannot load Stripe Component because of client_secret or/and stripe_account');

        const options = {
            clientSecret: client_secret,
            // Fully customizable with appearance API.
            appearance: {
                theme: 'flat',
                variables: {
                    colorPrimary: '#351DC2',
                    colorBackground: '#F3F6F9',
                },
            },
        };

        // Set up Stripe.js and Elements to use in checkout form, passing the client secret obtained in step 2
        const elements = stripe.elements(options);

        // Create and mount the Payment Element
        const paymentElement = elements.create('payment');
        // mounting the component on the UI
        paymentElement.mount('#payment-element');
        // create the payment form
        const form = document.getElementById('payment-form');

        // listen for the submit event
        form.addEventListener('submit', async event => {
            event.preventDefault();
            isPaying = true;
            const prefix = __bakney.env.DOMAIN || 'https://app.bakney.com/';
            const {error} = await stripe.confirmPayment({
                //`Elements` instance that was used to create the Payment Element
                elements,
                confirmParams: {
                    return_url: `${prefix}/#/stripe/payment/done`,
                },
            });

            isPaying = false;

            if (error) {
                // This point will only be reached if there is an immediate error when
                // confirming the payment. Show error to your customer (for example, payment
                // details incomplete)
                const messageContainer = document.querySelector('#error-message');
                messageContainer.textContent = error.message;
            } else {
                // Your customer will be redirected to your `return_url`. For some payment
                // methods like iDEAL, your customer will be redirected to an intermediate
                // site first to authorize the payment, then redirected to the `return_url`.
            }
        });

        paymentElement.on('ready', () => {
            loaded = true;
            // spinner stop
            KTApp.unblockPage();
        });

        paymentElement.on('loaderror', () => {
            // spinner stop
            KTApp.unblockPage();
            swal.fire({
                text: 'Scusa, ho individuato degli errori, riprova.',
                icon: 'error',
                buttonsStyling: false,
                confirmButtonText: 'Ok!',
                customClass: {
                    confirmButton: 'btn font-weight-bold btn-light-primary',
                },
            }).then(function () {
                replace('/payment/list');
                KTUtil.scrollTop();
            });
        });
    }
</script>

<!--begin::Entry-->
<div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}} class="d-flex flex-column-fluid">
    <!--begin::Container-->
    <div class="container {inModal ? 'p-0' : ''}">
        <!-- svelte-ignore missing-declaration -->
        <div class="{!inModal ? 'card card-custom' : ''} gutter-b">
            {#if !inModal}
                <div class="card-header px-0 bg-white">
                    <div class="card-title d-flex align-items-center justify-content-between w-100">
                        <div class="font-size-h3 font-weight-boldest text-primary">Cassa</div>

                        <div class="d-flex align-items-center">
                            <span class="text-dark font-weight-boldest font-size-h5 py-2 mr-4"> Totale </span>
                            <span class="text-dark font-weight-boldest font-size-h5 py-2">
                                €{parseFloat(
                                    JSON.parse(sessionStorage.getItem('cartPayments'))?.reduce(
                                        (acc, curr) => acc + parseFloat(curr.amount.replace(',', '.')),
                                        0
                                    ) || 0
                                )
                                    .toFixed(2)
                                    .replace('.', ',')}
                            </span>
                        </div>
                    </div>
                </div>
            {/if}
            <div class="card-body px-0">
                <div class="row" style={!loaded ? 'opacity:0.3;pointer-events:none' : ''}>
                    <div class="col-12 {!inModal ? 'col-lg-7 px-3' : ''}" style="padding-top: 1rem !important;">
                        <div class="mb-8">
                            <h4>Riepilogo Costi</h4>
                            <div>
                                <div class="card-body p-0 pt-7">
                                    <!--begin::Item-->

                                    <!--end::Item-->
                                    <!--begin::Item-->
                                    {#each JSON.parse(sessionStorage.getItem('cartPayments')) || [] as data, idx}
                                        <div
                                            id="accordion-payment-details-{idx}"
                                            class="accordion accordion-light accordion-toggle-arrow">
                                            <div
                                                class="d-flex align-items-center justify-content-between p-0 rounded gutter-b collapsed"
                                                data-toggle="collapse"
                                                data-target="#info-payment-invoice-{idx}"
                                                style="cursor: pointer;">
                                                <!--begin::Icon-->
                                                <div
                                                    class="d-none d-lg-flex align-items-center gap-2 bg-light rounded-lg px-3 py-2">
                                                    {#if subjectMap[data?.subject]?.value == 'subscription'}
                                                        <Files size={24} weight="duotone" />
                                                        <span class="text-dark-75 font-weight-bolder font-size-lg mb-0">
                                                            {subjectMap[data?.subject]?.text}
                                                        </span>
                                                    {:else if subjectMap[data?.subject]?.value == 'course'}
                                                        <PersonSimpleRun size={24} weight="duotone" />
                                                        <span class="text-dark-75 font-weight-bolder font-size-lg mb-0">
                                                            {subjectMap[data?.subject]?.text}
                                                        </span>
                                                    {:else if subjectMap[data?.subject]?.value == 'other'}
                                                        <Wallet size={24} weight="duotone" />
                                                        <span class="text-dark-75 font-weight-bolder font-size-lg mb-0">
                                                            {subjectMap[data?.subject]?.text}
                                                        </span>
                                                    {/if}
                                                </div>
                                                <!--end::Icon-->
                                                <!--begin::Description-->
                                                <div class="ml-1 p-0">
                                                    <h3 class="text-dark-75 font-weight-bolder font-size-lg">
                                                        {data?.meta?.type || ''} -
                                                        {#if data?.subject == 1}
                                                            {data?.sport_association_denomination || ''}
                                                        {:else}
                                                            {data?.meta?.name || ''}
                                                        {/if}
                                                    </h3>
                                                </div>
                                                <div class="ml-1 p-4">
                                                    <span class="text-dark-80 font-weight-bold font-size-lg"
                                                        >€{data?.amount?.replace(',', '').replace('.', ',') || ''} x 1</span>
                                                </div>
                                                <!--end::Description-->
                                            </div>
                                            <div
                                                id="info-payment-invoice-{idx}"
                                                data-parent="#accordion-payment-details-{idx}"
                                                class="p-2 mb-5 collapse show"
                                                style="max-width:100%;">
                                                <!--begin::Description-->
                                                <div>
                                                    <h4 class="mb-6">Informazioni Ricevuta</h4>
                                                    <span class="text-primary font-weight-bolder font-size-lg py-2 mr-4"
                                                        >Intestatario</span>
                                                    <br />
                                                    <span class="text-dark font-weight-bolder font-size-lg py-2"
                                                        >{data?.associate?.first_name || ''}
                                                        {data?.associate?.last_name || ''}</span>
                                                    <br /><br />
                                                </div>
                                                <!--end::Description-->
                                            </div>
                                        </div>
                                    {/each}
                                    <!--end::Item-->
                                    <!--begin::Item-->
                                    <div class="d-flex align-items-center" style="border-top: 0.2rem solid #e6edf3;">
                                        <!--begin::Content-->
                                        <div class="d-flex align-items-center flex-wrap flex-row-fluid p-2">
                                            <!--begin::Text-->
                                            <div class="d-flex flex-column pr-5 flex-grow-1" />
                                            <!--end::Text-->
                                            <!--begin::Label-->
                                            <span class="text-dark font-weight-boldest font-size-h3 py-2 mr-4"
                                                >Totale</span>

                                            <span class="text-dark font-weight-boldest font-size-h3 py-2"
                                                >€ {parseFloat(
                                                    JSON.parse(sessionStorage.getItem('cartPayments'))?.reduce(
                                                        (acc, curr) => acc + parseFloat(curr.amount.replace(',', '.')),
                                                        0
                                                    ) || 0
                                                )
                                                    .toFixed(2)
                                                    .replace('.', ',')}
                                                <!-- {data?.amount?.replace(',', '').replace('.', ',') || ''} -->
                                            </span>
                                            <!--end::Label-->
                                        </div>
                                        <!--end::Content-->
                                    </div>
                                    <!--end::Item-->
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 {!inModal ? 'col-lg-5 p-4 p-lg-8' : ''}" style="padding-top: 1rem !important;">
                        <form id="payment-form">
                            <div class="mb-8">
                                <h4>Dati pagamento</h4>
                            </div>
                            {#if data?.info?.checkout_info && data?.info?.checkout_info !== '' && data?.info?.checkout_info !== '<p><br></p>'}
                                <div class="border border-secondary rounded-xl p-4 mb-6">
                                    <h6
                                        class="text-dark
                                    font-weight-boldest mb-4">
                                        Informazioni aggiuntive
                                    </h6>
                                    <div>
                                        {@html data?.info?.checkout_info}
                                    </div>
                                </div>
                            {/if}
                            <div id="payment-element">
                                <!-- Elements will create form elements here -->
                            </div>
                            {#if loaded}
                                <button
                                    in:fade
                                    class="btn btn-primary mt-8 w-100 d-flex align-items-center justify-content-center"
                                    id="submit">
                                    {#if isPaying}
                                        <Circle size="18" color="#FFFFFF" unit="px" duration="1s" />
                                        <span class="ml-2">Pagamento in corso</span>
                                    {:else}
                                        <li class="fas fa-lock mr-2" />
                                        Paga ora
                                    {/if}
                                </button>
                            {/if}
                            <div id="error-message">
                                <!-- Display error message to your customers here -->
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
