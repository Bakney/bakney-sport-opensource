<script>
    import {onMount} from 'svelte';
    import {apiFetch} from 'utils/ApiMiddleware';
    import {replaceUID} from 'utils/ApiMiddleware.js';
    import {toast} from 'svelte-sonner';
    import SupplierCustomerForm from '../../partials/supplier-customer-form.svelte';
    import {createEventDispatcher} from 'svelte';

    const dispatch = createEventDispatcher();

    export let supplierId;
    export let edit = false;

    let supplierData = null;

    async function loadSupplierData() {
        if (!supplierId) return;

        const res = await apiFetch(replaceUID(__bakney.env.API.SUPPLIER.INFO, supplierId));
        if (res.status === 200) {
            supplierData = res.response.data;
            // Populate form fields if needed
        }
    }

    async function editData(e) {
        const response = await apiFetch(replaceUID(__bakney.env.API.SUPPLIER.UPDATE, supplierId), {
            method: 'PATCH',
            body: JSON.stringify(e.detail),
        });

        if (response.status === 200) {
            toast.success('Anagrafica aggiornata con successo');
            loadSupplierData();
        } else {
            toast.error("Errore durante l'aggiornamento");
        }
    }

    async function createData(e) {
        const response = await apiFetch(replaceUID(__bakney.env.API.SUPPLIER.ADD), {
            method: 'POST',
            body: JSON.stringify(e.detail),
        });

        if (response.status === 201) {
            toast.success('Anagrafica creata con successo');
            dispatch('close');
        } else {
            toast.error('Errore durante la creazione');
        }
    }

    async function handleSubmit(e) {
        e.detail.type = JSON.parse(e.detail.type).value;
        if (edit) editData(e);
        else createData(e);
    }

    onMount(async () => {
        if (edit) {
            await loadSupplierData();
        } else {
            supplierData = {
                name: '',
                address: '',
                tax_code: '',
                vat_number: '',
                type: 'supplier',
                note: '',
            };
        }
    });
</script>

{#if supplierData}
    <div class="container px-0">
        <SupplierCustomerForm bind:supplierData on:submit={handleSubmit} />
    </div>
{:else}
    <div
        class="d-flex justify-content-center align-items-center text-primary font-size-h6 font-weight-boldest"
        style="height: 50vh;">
        <div class="spinner-border spinner-border-lg mr-2 text-primary" role="status" aria-hidden="true" />
        Caricamento...
    </div>
{/if}
