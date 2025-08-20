<script>
    import {signature} from 'store/stores.js';
    import SmoothSignature from 'components/signature/SmoothSignature.svelte';

    signature.useLocalStorage();

    export let configuration = {};
    export let currentWizardStep = 0;

    $: {
        if ($signature.there_is_signature && currentWizardStep == 3) {
            if (configuration?.mandatory_signature && document.getElementById('next-step'))
                document.getElementById('next-step').disabled = true;
        } else {
            if (document.getElementById('next-step')) document.getElementById('next-step').disabled = false;
        }
    }
</script>

<div class="pb-5" data-wizard-type="step-content">
    <h4 class="mb-10 font-weight-bold text-dark wizard-title-info">Firma del documento</h4>

    {#if currentWizardStep == 3}
        <SmoothSignature
            on:update={e => {
                $signature.there_is_signature = e.detail.there_is_signature;
                $signature.data = e.detail.data;
            }} />
    {/if}
</div>
