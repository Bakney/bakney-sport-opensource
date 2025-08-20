<script>
    import {onMount} from 'svelte';

    import ComposerPreview from 'components/formBuilder/composer-preview.svelte';
    import ComposerSidebar from 'components/formBuilder/composer-sidebar.svelte';

    export let userData;

    onMount(() => {
        if (!userData?.sport_association?.additional_fields) {
            userData.sport_association.additional_fields = [];
        }
    });
</script>

<div class="row d-flex justify-content-start flex-column mx-0">
    <h2 class="text-dark font-weight-boldest">Campi aggiuntivi</h2>
    <p class="text-dark-75 font-size-sm font-weight-bold">Aggiungi campi aggiuntivi all'anagrafica dell'atleta.</p>
</div>

{#if userData?.sport_association?.additional_fields}
    <div class="d-flex flex-column flex-md-row justify-content-center mx-0 mt-4">
        <ComposerSidebar
            bind:elements={userData.sport_association.additional_fields}
            title="Campi disponibili"
            resetLabel="Reset"
            availableElements={['text', 'email', 'textArea', 'datepicker']} />
        <ComposerPreview
            title="Anteprima"
            showSendButton={false}
            bind:elements={userData.sport_association.additional_fields} />
    </div>
{/if}
