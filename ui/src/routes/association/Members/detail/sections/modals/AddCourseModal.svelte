<script>
    import {slide} from 'svelte/transition';
    import BasicModal from 'components/modals/BasicModal.svelte';
    import {createEventDispatcher} from 'svelte';

    const dispatch = createEventDispatcher();

    export let id;
    export let show;
    export let availableCourses = [];
    export let loading = false;
    let selectedCourseId = null;
    let hideBack = false;
</script>

<div class={hideBack ? 'd-none' : ''}>
    <BasicModal
        id={`add-course-modal-${id}`}
        bind:show
        title="Pagamenti"
        showActionButton={true}
        scrollable={true}
        on:confirm={() => {
            dispatch('confirm', {course_id: selectedCourseId});
        }}
        dataHeight={50}>
        {#if !loading}
            <div class="py-8">
                <h1 class="mb-8">Seleziona un corso</h1>
                <div style="max-height:500px;">
                    {#if availableCourses.length === 0}
                        <p class="text-center">Nessun corso disponibile</p>
                    {/if}
                    {#each Array.from(availableCourses) as course, idx}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <div
                            in:slide={{duration: 100, delay: (1 + idx) * 5}}
                            on:click={e => {
                                selectedCourseId = course.course_id;
                                // scale animation on click via svelte (no scale class available)
                                e.target.style.transform = 'scale(.99)';
                                setTimeout(() => {
                                    e.target.style.transform = 'scale(1)';
                                }, 100);
                            }}
                            style="cursor:pointer;min-height: 3rem; background: #f6f6f6;border: 0.125rem solid #ebedf3; border-radius: 0.55rem; padding: 1.5rem 2rem;"
                            class="d-flex align-items-center justify-content-between mb-3 pl-4 list-item-attendees">
                            <div class="h5 m-0">
                                <strong>{course.title}</strong><br />
                                <small class="mb-0">
                                    {@html course.description.replace(/&lt;/g, '<').replace(/&gt;/g, '>')}
                                </small>
                            </div>
                            <div>
                                <label class="radio radio-lg">
                                    <input
                                        type="radio"
                                        bind:group={selectedCourseId}
                                        value={course.course_id}
                                        name="carnet-select" />
                                    <span />
                                </label>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        {:else}
            <div class="text-center py-20 d-flex justify-content-center">
                <div class="spinner spinner-primary spinner-lg" />
            </div>
        {/if}
    </BasicModal>
</div>

<svelte:head>
    <style>
        p {
            margin-top: 0.5rem;
            margin-bottom: 0;
        }
    </style>
</svelte:head>
