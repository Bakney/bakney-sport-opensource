<script>
    import {toast} from 'svelte-sonner';
    import {apiFetch} from 'utils/ApiMiddleware';
    import AssociateForm from './partials/associate-form.svelte';
    import {createEventDispatcher} from 'svelte';

    const dispatch = createEventDispatcher();

    export let width = '85vw';

    let associate = {
        first_name: '',
        last_name: '',
        sex: '',
        born_date: new Date(),
        born_city: '',
        tax_code: '',
        address: '',
        address_city: '',
        address_cap: '',
        nationality: 'Italiana',
        nationality_residence: 'Italia',
        email: '',
        phone: '',
        phone_label: '',
        phone_2: '',
        phone_2_label: '',
        phone_3: '',
        phone_3_label: '',
        phone_4: '',
        phone_4_label: '',
        tutors: [],
        id_number: '',
        picture_path: '',
    };

    async function createData(associateData) {
        let res = await apiFetch(__bakney.env.API.PERSONAS.ADD, {
            method: 'POST',
            body: JSON.stringify(associateData),
        });
        if (res.status === 200 || res.status === 201) {
            associate = {...res.response};
            toast.success('Anagrafica aggiunta con successo');
            dispatch('close');
        } else {
            toast.error("Errore nell'aggiunta dell'anagrafica");
        }
    }

    function handleIncomplete(e) {
        const associateData = e.detail;
        createData(associateData);
    }

    async function handleSubmit(e) {
        const associateData = e.detail;
        createData(associateData);
    }
</script>

<div class="px-8">
    <AssociateForm {associate} on:submit={handleSubmit} {width} on:incomplete={handleIncomplete} />
</div>
