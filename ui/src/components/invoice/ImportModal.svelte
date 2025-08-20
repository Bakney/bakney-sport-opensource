<script>
    import {SmartSelect} from 'components/formBuilder/preview-blocks/index.js';
    import BasicModal from 'components/modals/BasicModal.svelte';
    import {createEventDispatcher, onMount} from 'svelte';
    import {apiFetch} from 'utils/ApiMiddleware';

    const dispatch = createEventDispatcher();

    export let show = false;
    export let target = null;
    export let selected = null;

    let data = {};
    let complexItems = [];
    let personas = [];
    let suppliers = [];
    let instructors = [];
    let loading = false;

    function fetchPersonas() {
        return apiFetch(`${__bakney.env.API.PERSONAS.ALL}`).then(res => {
            personas = [];
            Object.keys(res.response.data).forEach(key => {
                personas.push({
                    associate_id: res.response.data[key].associate_id,
                    label: res.response.data[key].first_name + ' ' + res.response.data[key].last_name,
                    info: res.response.data[key],
                });
            });
        });
    }

    async function fetchSuppliers() {
        let res = await apiFetch(`${__bakney.env.API.SUPPLIER.LIST}?all=true`);

        if (!res.error) suppliers = res.response.data || [];
        else if (res.status != 403 && res.status != 401) toast.error('Qualcosa è andato storto.');
    }

    async function fetchInstructors() {
        let res = await apiFetch(__bakney.env.API.INSTRUCTOR.LIST);

        if (!res.error) instructors = res.response.data || [];
        else if (res.status != 403 && res.status != 401) toast.error('Qualcosa è andato storto.');
    }

    function populateComplexItems() {
        complexItems = [];

        // if (expense) {
        // go through suppliers adn instructors and populate the select
        suppliers.forEach(supplier => {
            complexItems.push({
                value: supplier.supplier_id,
                // info: supplier,
                supplier_id: supplier.supplier_id,
                label: supplier.name,
                group: 'Fornitori',
            });
        });
        instructors.forEach(instructor => {
            complexItems.push({
                value: instructor.instructor_id,
                // info: instructor,
                instructor_id: instructor.instructor_id,
                label: instructor.first_name + ' ' + instructor.last_name,
                group: 'Istruttori',
            });
        });
        personas.forEach(persona => {
            complexItems.push({
                value: persona.associate_id,
                // info: persona.info,
                associate_id: persona.associate_id,
                label: persona.label,
                group: 'Persone',
            });
        });
    }

    onMount(async () => {
        loading = true;
        await Promise.all([fetchPersonas(), fetchSuppliers(), fetchInstructors()]);
        populateComplexItems();
        loading = false;
    });
</script>

<div>
    <BasicModal
        id={`import-modal`}
        bind:show
        title="Importa Anagrafica"
        showTitle={true}
        {target}
        showActionButton={true}
        showCancelButton={true}
        showFooter={true}
        actionButton="Importa"
        cancelButton="Annulla"
        modalSize={'md'}
        scrollable={true}
        hideOnClickOutside={false}
        contentOverflowVisible={true}
        on:confirm={() => {
            dispatch('import', selected);
        }}
        bodyClass={'py-2 px-0'}>
        {#if !loading}
            <SmartSelect
                hideEmptyState={true}
                customClasses={'mx-6'}
                editable={false}
                active={false}
                virtualListMode={true}
                on:change={e => {
                    selected = e.detail;
                }}
                on:clear={e => {
                    selected = null;
                }}
                props={{
                    id: 'complex_item',
                    name: 'complex_item',
                    label: 'Anagrafica',
                    placeholder: 'Seleziona anagrafica',
                    required: false,
                    options: complexItems,
                    disabled: false,
                    clearable: true,
                    searchable: true,
                    showChevron: false,
                    groupBy: item => item.group,
                    value: selected?.value || null,
                }} />
        {:else}
            <div class="text-center py-20 d-flex justify-content-center">
                <div class="spinner spinner-primary spinner-lg" />
            </div>
        {/if}
    </BasicModal>
</div>
