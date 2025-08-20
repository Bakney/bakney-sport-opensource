<script>
    import {onMount} from 'svelte';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import {ArrowRight} from 'phosphor-svelte';

    let paymentSuccess = false;
    let showResult = false;
    let redirTo = sessionStorage.getItem('redirTo') || '/#/payment/list';

    onMount(() => {
        var urlParams;
        (window.onpopstate = function () {
            var match,
                pl = /\+/g, // Regex for replacing addition symbol with a space
                search = /([^&=]+)=?([^&]*)/g,
                decode = function (s) {
                    return decodeURIComponent(s.replace(pl, ' '));
                },
                query = window.location.search.substring(1);

            urlParams = {};
            while ((match = search.exec(query))) urlParams[decode(match[1])] = decode(match[2]);
        })();

        apiFetch(
            `${replaceUID(__bakney.env.API.STRIPE.PAY, 'stripe-checkout')}?payment_intent_id=${
                urlParams.payment_intent
            }`,
            {method: 'POST'}
        );

        if (urlParams.redirect_status) {
            if (urlParams.redirect_status == 'succeeded') {
                paymentSuccess = true;
            }
        }
        showResult = true;
        redirTo = sessionStorage.getItem('redirTo') || '/#/payment/list';
    });
</script>

{#if showResult}
    <div style="margin: auto; text-align: center;">
        <div class="mb-10">
            {#if paymentSuccess}
                <img src="/static/onboarded_ok.png" alt="" style="max-width: 100%;width: 600px;" />
                <br />
                <h2 class="display-4 text-center text-dark-75 font-weight-bolder py-3">
                    <img src="/static/stripe_watermark.png" alt="" style="max-width: 50%; width: 100px;" /> <br />
                    Pagamento effettuato con successo!
                </h2>
            {:else}
                <img src="/static/onboarded_ko.png" alt="" style="max-width: 100%;width: 600px;" />
                <br />
                <h2 class="display-4 text-center text-dark-75 font-weight-bolder py-3">
                    <img src="/static/stripe_watermark.png" alt="" style="max-width: 50%; width: 100px;" /> <br />
                    Si sono verificati degli errori nel completare il pagamento!
                </h2>
            {/if}
        </div>
        <a
            href={redirTo}
            on:click={() => sessionStorage.removeItem('redirTo')}
            class="btn btn-pill btn-primary font-weight-bolder py-4 px-8">
            Continua
            <ArrowRight size={16} weight="bold" class="text-primary ml-2" />
        </a>
    </div>
{/if}
