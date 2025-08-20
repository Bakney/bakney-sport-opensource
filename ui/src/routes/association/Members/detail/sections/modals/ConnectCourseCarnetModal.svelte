<script>
    import BasicModal from 'components/modals/BasicModal.svelte';
    import {SmartSelect} from 'components/formBuilder/preview-blocks/index.js';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware.js';
    import {toast} from 'svelte-sonner';
    import {createEventDispatcher} from 'svelte';

    const dispatch = createEventDispatcher();

    export let show = false;
    export let carnetSubscriptionId;
    export let subscriptionId;
    export let carnetId;
    export let courses = [];
    export let assignedCourses = [];

    let selectedCourseId = null;
    let loading = false;

    async function updateData() {
        if (!selectedCourseId) {
            toast.error('Seleziona un corso');
            return;
        }

        loading = true;
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Collegamento in corso...',
        });

        const res = await apiFetch(
            replaceUID(replaceUID(__bakney.env.API.CARNET.ASSIGN, carnetId), subscriptionId, '<sub_uid>'),
            {
                method: 'POST',
                body: JSON.stringify({
                    course_id: selectedCourseId,
                    carnet_subscription_id: carnetSubscriptionId,
                }),
            }
        );

        KTApp.unblockPage();
        loading = false;

        if (res.status === 200) {
            toast.success('Corso collegato con successo');
            dispatch('update');
            show = false;
        } else {
            alert(res.response);
            toast.error(res.response?.msg || 'Errore durante il collegamento del corso');
        }
    }
</script>

<div>
    <BasicModal
        id="connect-course-modal"
        bind:show
        title="Collega carnet ad un corso"
        showTitle={true}
        showActionButton={true}
        showCancelButton={true}
        showFooter={false}
        modalSize={'md'}
        scrollable={false}
        hideOnClickOutside={true}
        bodyClass={'py-2 px-0'}>
        {#if !loading}
            <form id="connect_course_form" on:submit|preventDefault={updateData}>
                <div class="px-7">
                    <SmartSelect
                        customClasses="mb-4"
                        editable={false}
                        props={{
                            id: 'selectedCourse',
                            name: 'selectedCourse',
                            label: 'Corso',
                            placeholder: 'Seleziona il corso',
                            required: true,
                            clearable: false,
                            searchable: true,
                            showChevron: true,
                            options:
                                courses
                                    ?.filter(x => !assignedCourses.includes(x.course_id))
                                    ?.map(course => ({
                                        label: course.title,
                                        value: course.course_id,
                                    })) || [],
                            value: selectedCourseId,
                        }}
                        on:change={e => {
                            selectedCourseId = e.detail.value;
                        }} />
                </div>

                <div class="modal-footer d-flex justify-content-end mt-2">
                    <button
                        type="button"
                        class="btn btn-light-primary font-weight-bold"
                        on:click={() => (show = false)}>
                        Annulla
                    </button>
                    <button type="submit" class="btn btn-primary font-weight-bold" disabled={loading}> Collega </button>
                </div>
            </form>
        {:else}
            <div class="d-flex justify-content-center align-items-center" style="height: 100px;">
                <div class="spinner spinner-primary spinner-lg" />
            </div>
        {/if}
    </BasicModal>
</div>
