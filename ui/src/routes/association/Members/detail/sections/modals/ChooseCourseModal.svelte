<script>
    import BasicModal from 'components/modals/BasicModal.svelte';
    import {SmartSelect} from 'components/formBuilder/preview-blocks/index.js';
    import {createEventDispatcher} from 'svelte';

    const dispatch = createEventDispatcher();

    export let show;
    export let availableCourses = [];
    export let loading = false;

    let selectedCourse = null;
    let showArchived = true;

    function handleConfirm() {
        if (selectedCourse) {
            const courseInfo = availableCourses.find(c => c.course_id === selectedCourse);
            dispatch('confirm', {
                info: courseInfo,
            });
        }
    }
</script>

<div>
    <BasicModal
        id="choose-course-modal"
        bind:show
        title="Seleziona corso"
        showTitle={true}
        showActionButton={true}
        showCancelButton={true}
        showFooter={true}
        modalSize={'md'}
        scrollable={false}
        hideOnClickOutside={true}
        bodyClass={'py-2 px-0'}
        on:confirm={handleConfirm}>
        {#if !loading}
            <div class="px-7">
                <div class="form-group mb-3 d-flex align-items-center gap-2">
                    <label class="checkbox">
                        <input type="checkbox" id="showArchived" name="showArchived" bind:checked={showArchived} />
                        <span class="mr-2" />
                        Mostra corsi archiviati
                    </label>
                </div>
                <SmartSelect
                    customClasses="mb-4 p-0"
                    editable={false}
                    active={false}
                    on:clear={() => {
                        selectedCourse = null;
                    }}
                    props={{
                        id: 'selectedCourse',
                        name: 'selectedCourse',
                        label: 'Corso',
                        placeholder: 'Seleziona un corso',
                        helperLabel: 'Seleziona il corso da aggiungere',
                        required: true,
                        clearable: true,
                        searchable: true,
                        showChevron: true,
                        options: availableCourses
                            ?.filter(c => (!showArchived ? c.status_flag > 1 : true))
                            ?.map(course => ({
                                label: `${course.title}`,
                                value: course.course_id,
                                description: course.description,
                            })),
                        value: [],
                    }}
                    bind:value={selectedCourse} />
            </div>
            {#if selectedCourse}
                <hr class="my-4 border-light" />
                <h4 class="mb-0 mx-7 mb-4 mt-4">Informazioni sul corso selezionato</h4>
                <div class="mx-7 d-flex flex-column" style="max-height: 200px; overflow-y: auto;gap: .5rem;">
                    <div class="border rounded-xl p-3 mr-2 bg-light">
                        <h6 class="mb-0 text-dark font-weight-bolder">
                            {availableCourses.find(c => c.course_id === selectedCourse)?.title || ''}
                        </h6>
                        <div class="text-muted mb-0">
                            {@html availableCourses
                                .find(c => c.course_id === selectedCourse)
                                ?.description?.replace(/&lt;/g, '<')
                                .replace(/&gt;/g, '>') || ''}
                        </div>
                    </div>
                </div>
            {/if}
        {:else}
            <div class="d-flex justify-content-center align-items-center" style="height: 100px;">
                <div class="spinner spinner-primary spinner-lg" />
            </div>
        {/if}
    </BasicModal>
</div>
