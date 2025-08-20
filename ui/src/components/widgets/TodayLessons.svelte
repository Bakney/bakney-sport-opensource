<script>
    import {ArrowRight, ThumbsUp} from 'phosphor-svelte';
    import MarkAttendees from 'routes/association/course/overview/components/modals/MarkAttendees.svelte';
    import {permissions} from 'store/stores';
    import {onDestroy, onMount} from 'svelte';
    import {link, push} from 'svelte-spa-router';
    import {apiFetch} from 'utils/ApiMiddleware';
    import {isFreePlan} from 'utils/Permissions';

    permissions.useLocalStorage();

    let data = {
        lessons: [],
    };
    let loading = true;

    function fetchData() {
        apiFetch(`${__bakney.env.HOST}/statistic/dashboard?widget=todaylessons`, {
            method: 'GET',
        }).then(res => {
            loading = false;
            if (!res.error) {
                data = res.response.data;
            }
        });
    }

    onMount(async () => {
        fetchData();
        jQuery('#today-lessons-widget').tooltip({selector: '[data-toggle=tooltip]', trigger: 'hover'});
        jQuery('#today-lessons-widget').popover({selector: '[data-toggle=popover]', trigger: 'hover'});
    });

    onDestroy(() => {
        jQuery('#today-lessons-widget').tooltip('dispose');
        jQuery('#today-lessons-widget').popover('dispose');
    });
</script>

<div
    id="today-lessons-widget"
    class="card card-widget card-custom rounded-xl overflow-hidden bg-white card-stretch dashboard-widget"
    style="max-height: fit-content;">
    <!--begin::Header-->
    <div class="border-0 pt-6 mb-0 px-8">
        <h3 class="card-title align-items-start flex-column mb-0 text-center">
            <span class="card-label font-weight-bolder font-size-h4">Registro presenze lezioni</span>
        </h3>
    </div>
    <!--end::Header-->
    <!--begin::Body-->
    <div class="card-body d-flex mx-0 mt-3 mb-0 pb-3 py-0 px-1 scroll scroll-pull" style="overflow-x:auto">
        {#if Array.from(data.lessons).length === 0}
            <div class="d-flex flex-column align-items-center w-full h-full justify-content-center m-auto">
                <ThumbsUp size={60} class="my-4" weight="duotone" />
                <span class="font-size-lg font-weight-bolder text-muted">Nessuna lezione oggi</span>
            </div>
        {:else}
            <div class="d-flex justify-content-start align-items-center flex-grow-1 pr-4">
                {#each data.lessons as lesson}
                    <div
                        class="font-weight-bolder border-right border-light"
                        style="width: 12rem;max-width:12rem;min-width:12rem;">
                        <div class="d-flex flex-column justify-content-center align-items-center">
                            <span class="font-size-xs text-dark font-weight-boldest mb-1"
                                >{moment(lesson.date).format('DD/MM/YYYY')}</span>
                            <a
                                href="/course/overview/{lesson?.course_id}"
                                use:link
                                class="font-weight-boldest font-size text-center px-2 mb-1 d-flex align-items-center justify-content-center overflow-hidden"
                                style="max-width:11.5rem;max-height:6rem;height:2.5rem;overflow-wrap:break-word"
                                >{lesson?.title}</a>
                            {#if lesson?.extended_props?.instructor?.label}
                                <span
                                    class="font-size-xs font-weight-boldest text-center col-12 mx-auto text-dark bg-light px-2 py-1 my-0"
                                    >{lesson?.extended_props?.instructor?.label || 'non specificato'}</span>
                            {:else if Array.isArray(lesson?.extended_props?.instructor)}
                                <span
                                    class="font-size-xs font-weight-boldest text-center col-12 mx-auto text-dark bg-light px-2 py-1 my-0 cursor-pointer"
                                    data-toggle="popover"
                                    data-placement="top"
                                    data-content={Array.from(lesson?.extended_props?.instructor)
                                        .map(i => i.label)
                                        .join(', ')}
                                    >{Array.from(lesson?.extended_props?.instructor).length} istruttori</span>
                            {:else}
                                -
                            {/if}
                            <span class="font-size-xs px-2 mt-2 text-info font-weight-boldest">
                                {lesson?.total_attendees || 0} / {lesson?.total_expected_total}
                                presenti
                            </span>
                            <span class="font-size-xs px-2 mb-1"
                                ><span class="text-warning font-weight-boldest"
                                    >{lesson?.total_expected_absences || 0} non ci sarò</span
                                ></span>

                            {#if isFreePlan()}
                                <a
                                    href="/subscription/upgrade"
                                    use:link
                                    class="btn btn-sm btn-outline-secondary mt-3 font-weight-boldest"
                                    disabled>Presenze</a>
                            {:else}
                                <button
                                    data-toggle="modal"
                                    data-target="#attendance-day-{lesson?.attendance_day_id}"
                                    class="btn btn-sm py-1 px-2 btn-outline-secondary mt-1 font-weight-boldest"
                                    >Presenze</button>
                            {/if}
                        </div>
                    </div>
                    <MarkAttendees
                        bind:this={lesson.modal}
                        id={lesson?.attendance_day_id}
                        courseId={lesson?.course_id}
                        event={lesson}
                        courseSubscriptions={lesson?.potential_attendees}
                        on:refresh={fetchData} />
                {/each}
            </div>
        {/if}
    </div>
    <!--end::Body-->
</div>

<style>
    ::-webkit-scrollbar {
        height: 0.8rem; /* height of horizontal scrollbar ← You're missing this */
        width: 1rem; /* width of vertical scrollbar */
    }
</style>
