<script>
    import SmoothSignature from 'components/signature/SmoothSignature.svelte';
    import {ArrowLeft, ArrowRight} from 'phosphor-svelte';
    import {t} from 'svelte-i18n';
    import {showSection} from 'utils/Functions';

    export let wizardData;

    let thereIsSignature = false;

    // $: $thereIsSignature = wizardData?.formData?.signature?.is_there_signature;

    function validateNextStep() {
        if (
            wizardData.formData.signature.there_is_signature ||
            !wizardData?.sportAssociationData?.user?.sport_association?.configuration?.mandatory_signature
        ) {
            wizardData.nextStep();
        } else {
            alert('Devi firmare il modulo di iscrizione');
        }
    }
</script>

<div>
    <h2>Accetto le seguenti clausole</h2>
    <div class="accordion accordion-light accordion-toggle-arrow" id="modulo-accordion">
        {#each wizardData?.sportAssociationData?.user?.sport_association?.additional_sections as section, idx}
            {#if showSection(wizardData?.formData?.associate_data?.type, section, 'additional_sections')}
                <div class="card" style="border-bottom: 1px solid #e0e0e0;">
                    <div class="card-header">
                        <div
                            class="card-title collapsed font-weight-boldest text-primary"
                            data-toggle="collapse"
                            data-target="#section-{idx}">
                            {section.name}
                        </div>
                    </div>
                    <div id="section-{idx}" class="collapse" data-parent="#modulo-accordion">
                        <div class="card-body">
                            {@html section.text}
                        </div>
                    </div>
                </div>
            {/if}
        {/each}
        {#if showSection(wizardData?.formData?.associate_data?.type, wizardData?.sportAssociationData?.user?.sport_association, 'regulation')}
            <div class="card" style="border-bottom: 1px solid #e0e0e0;">
                <div class="card-header">
                    <div
                        class="card-title collapsed font-weight-boldest text-primary"
                        data-toggle="collapse"
                        data-target="#regulation">
                        REGOLAMENTO
                    </div>
                </div>
                <div id="regulation" class="collapse" data-parent="#modulo-accordion">
                    <div class="card-body">
                        {@html wizardData?.sportAssociationData?.user?.sport_association?.regulation}
                    </div>
                </div>
            </div>
        {/if}
        {#if showSection(wizardData?.formData?.associate_data?.type, wizardData?.sportAssociationData?.user?.sport_association, 'demand')}
            <div class="card" style="border-bottom: 1px solid #e0e0e0;">
                <div class="card-header">
                    <div
                        class="card-title font-weight-boldest text-primary"
                        data-toggle="collapse"
                        data-target="#demand">
                        RICHIESTA
                    </div>
                </div>
                <div id="demand" class="collapse show" data-parent="#modulo-accordion">
                    <div class="card-body">
                        {@html wizardData?.sportAssociationData?.user?.sport_association?.demand}
                    </div>
                </div>
            </div>
        {/if}
    </div>
    <h2 class="py-4">Firma Modulo d'Iscrizione</h2>
    <SmoothSignature
        signature={wizardData.formData.signature}
        on:update={e => {
            thereIsSignature = e.detail.there_is_signature;
            wizardData.formData.signature = e.detail;
        }} />

    <p class="font-size-sm font-weight-bold text-primary">
        Procedendo con la firma del modulo di iscrizione, dichiaro di aver letto e accettato le clausole sopra riportate
        e di aver preso visione del regolamento e della richiesta di iscrizione.
    </p>
    <hr class="mt-10" />
    <div class="d-flex justify-content-between align-items-center">
        <button
            type="button"
            class="btn btn-sm btn-ghost font-weight-bolder font-size-h6 px-8 py-4 my-3 mr-3"
            on:click={wizardData.prevStep}>
            <ArrowLeft size={24} /> Indietro
        </button>
        <button
            disabled={!thereIsSignature &&
                wizardData?.sportAssociationData?.user?.sport_association?.configuration?.mandatory_signature}
            type="button"
            class="btn btn-sm btn-primary font-weight-bolder font-size-h6 px-8 py-4 my-3 mr-4"
            on:click={validateNextStep}>
            Continua <ArrowRight size={24} />
        </button>
    </div>
</div>
