<script>
    import {ArrowRight} from 'phosphor-svelte';

    export let currentStep = 0;
    export let isLoading = false;
</script>

<div class="d-flex align-items-center justify-content-{currentStep === 0 ? 'end' : 'between'} mt-12">
    {#if currentStep !== 0}
        <button
            class="btn btn-secondary font-weight-boldest mb-0"
            on:click={() => {
                if (currentStep > 0) currentStep -= 1;
            }}>Indietro</button>
    {/if}
    <button class="btn btn-primary font-weight-boldest mb-0" disabled={isLoading}
        >{#if currentStep === 2 && !isLoading}
            Vai al gestionale
            <ArrowRight weight="bold" />
        {:else if isLoading}
            <span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true" />
            Preparo il tuo gestionale...
        {:else}
            Continua
        {/if}
    </button>
</div>
