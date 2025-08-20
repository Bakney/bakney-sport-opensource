<script>
    import {onMount} from 'svelte';
    import {replace} from 'svelte-spa-router';
    import {apiFetch} from 'utils/ApiMiddleware';
    import {ArrowRight} from 'phosphor-svelte';

    let onBoardedSuccess = false;

    onMount(() => {
        document.body.style.backgroundColor = 'white';
        apiFetch(__bakney.env.API.STRIPE.COMPLETE_ON_BOARDING, {method: 'POST'}).then(res => {
            if (!res.error) {
                onBoardedSuccess = true;
            }
        });
    });
</script>

<div style="margin: auto; text-align: center;">
    <div class="mb-10">
        {#if onBoardedSuccess}
            <img src="/static/onboarded_ok.png" alt="" style="max-width: 100%;width: 600px;" />
            <br />
            <h2 class="display-4 text-center text-dark-75 font-weight-bolder py-3">
                <img src="/static/stripe_watermark.png" alt="" style="max-width: 50%; width: 100px;" /> <br />
                Onboarding completato!
            </h2>
        {:else}
            <img src="/static/onboarded_ko.png" alt="" style="max-width: 100%;width: 600px;" />
            <br />
            <h2 class="display-4 text-center text-dark-75 font-weight-bolder py-3">
                <img src="/static/stripe_watermark.png" alt="" style="max-width: 50%; width: 100px;" /> <br />
                Si sono verificati degli errori nel completare l'onboarding!
            </h2>
        {/if}
    </div>

    <a
        href="/#"
        on:click={() => {
            replace('/').then(() => {
                location.reload();
            });
        }}
        class="btn btn-pill btn-primary font-weight-bolder py-4 px-8">
        Continua
        <ArrowRight size={16} weight="bold" class="text-primary ml-2" />
    </a>
</div>
