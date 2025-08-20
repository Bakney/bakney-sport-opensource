<script>
    import {onMount} from 'svelte';
    import {toast} from 'svelte-sonner';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import AssociateForm from '../partials/associate-form.svelte';

    export let associateId;
    export let width = '85vw';

    let associate;

    async function fetchData() {
        let res = await apiFetch(replaceUID(__bakney.env.API.PERSONAS.INFO, associateId));
        if (res.status === 200) {
            associate = res.response;
        } else {
            toast.error('Errore nel caricamento dei dati');
        }
    }

    async function updateData(associateData, incomplete = false) {
        let res = await apiFetch(replaceUID(__bakney.env.API.PERSONAS.UPDATE, associateId), {
            method: 'PATCH',
            body: JSON.stringify({...associateData, incomplete}),
        });
        if (res.status === 200) {
            associate = {...res.response};
            toast.success('Dati aggiornati con successo');
        } else {
            toast.error("Errore nell'aggiornamento dei dati");
        }
    }

    async function handleSubmit(e) {
        const associateData = e.detail;
        updateData(associateData);
    }

    function handleIncomplete(e) {
        const associateData = e.detail;
        updateData(associateData, true);
    }

    onMount(async () => {
        await fetchData();
    });
</script>

{#if associate}
    <AssociateForm {associate} on:submit={handleSubmit} {width} on:incomplete={handleIncomplete} />
{:else}
    <div
        class="d-flex justify-content-center align-items-center text-primary font-size-h6 font-weight-boldest"
        style="height: 50vh;">
        <div class="spinner-border spinner-border-lg mr-2 text-primary" role="status" aria-hidden="true" />
        Caricamento...
    </div>
{/if}
