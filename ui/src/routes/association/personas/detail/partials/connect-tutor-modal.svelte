<script>
    import BasicModal from 'components/modals/BasicModal.svelte';
    import {SmartSelect} from 'components/formBuilder/preview-blocks/index.js';
    import {createEventDispatcher} from 'svelte';
    import {apiFetch} from 'utils/ApiMiddleware.js';

    const dispatch = createEventDispatcher();

    export let show;
    export let loading = false;
    export let tutors = [];
    let selectedTutor = null;
    let availableTutors = [];

    async function loadTutors() {
        loading = true;
        try {
            const res = await apiFetch(__bakney.env.API.PERSONAS.ALL_TUTORS);
            if (res.status === 200) {
                availableTutors = res.response || [];
                availableTutors = availableTutors.filter(
                    tutor => !tutors.some(t => t.tutor.associate_id === tutor.associate_id)
                );
            }
        } catch (error) {
            console.error('Error loading tutors:', error);
        }
        loading = false;
    }

    $: if (show) {
        loadTutors();
    }

    function handleConfirm() {
        if (selectedTutor) {
            const tutorInfo = availableTutors.find(t => t.associate_id === selectedTutor);
            dispatch('confirm', {
                data: tutorInfo,
            });
        }
    }
</script>

<div>
    <BasicModal
        id="connect-tutor-modal"
        bind:show
        title="Collega tutore esistente"
        showTitle={true}
        showActionButton={true}
        showCancelButton={true}
        showFooter={true}
        modalSize={'md'}
        scrollable={false}
        hideOnClickOutside={true}
        bodyClass={'py-2 px-0'}
        target="#portal-elements-foreground"
        on:confirm={handleConfirm}>
        {#if !loading}
            <div class="px-7">
                <SmartSelect
                    customClasses="mb-4 p-0"
                    editable={false}
                    active={false}
                    on:clear={() => {
                        selectedTutor = null;
                    }}
                    props={{
                        id: 'selectedTutor',
                        name: 'selectedTutor',
                        label: 'Tutore',
                        placeholder: 'Seleziona un tutore',
                        helperLabel: 'Seleziona il tutore da collegare',
                        required: true,
                        clearable: true,
                        searchable: true,
                        showChevron: true,
                        options: availableTutors?.map(tutor => ({
                            label: `${tutor.first_name} ${tutor.last_name}`,
                            value: tutor.associate_id,
                            description: tutor.email,
                        })),
                        value: [],
                    }}
                    bind:value={selectedTutor} />
            </div>
        {:else}
            <div class="d-flex justify-content-center align-items-center" style="height: 100px;">
                <div class="spinner spinner-primary spinner-lg" />
            </div>
        {/if}
    </BasicModal>
</div>
