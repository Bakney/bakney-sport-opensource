<script>
    import {onMount} from 'svelte';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import MarkAttendees from './modals/MarkAttendees.svelte';
    import {
        Pencil,
        Trash,
        ClockCountdown,
        CalendarCheck,
        Student,
        ListChecks,
        TrashSimple,
        ChalkboardTeacher,
        User,
        CheckCircle,
        Placeholder,
    } from 'phosphor-svelte';
    import ContentLoader from 'svelte-content-loader';
    import {canPerformAction} from 'utils/Permissions';
    import {toast} from 'svelte-sonner';

    export let courseId;
    export let events = [];
    export let loadRegistry = false;

    export let fetchRegistryData = () => {};

    let courseSubscriptions = [];
    let filteredEvents = [];
    let searchKey = '';
    // $: events, updateFilteredEvents();

    // $: {
    //     updateFilteredEvents();
    // }

    function updateFilteredEvents() {
        if (searchKey === '') {
            filteredEvents = structuredClone(events);
            return;
        }
        filteredEvents = [
            ...events?.filter(event => {
                return (
                    String(new Date(event.date).toLocaleString().split(',')[0])?.includes(searchKey) ||
                    event?.title?.toLowerCase()?.includes(searchKey?.toLowerCase())
                );
            }),
        ];
    }
    async function deleteData(event) {
        swal.fire({
            text: 'Desideri eliminare la data dal registro presenze?',
            footer: '<b class="text-danger">Attenzione: perderai le assenze segnalate.</b>',
            icon: 'warning',
            buttonsStyling: true,
            showCancelButton: true,
            cancelButtonText: 'Annulla',
            confirmButtonText: 'Elimina',
            reverseButtons: true,
            confirmButtonColor: 'danger',
        }).then(async function (result) {
            if (result.isConfirmed) {
                KTApp.blockPage({
                    overlayColor: '#000000',
                    state: 'primary',
                    message: 'Eliminazione in corso...',
                });
                const response = await apiFetch(
                    replaceUID(__bakney.env.API.ATTENDANCE_DAY.DELETE, event.attendance_day_id),
                    {
                        method: 'DELETE',
                    }
                );

                KTApp.unblockPage();

                if (!response.error) {
                    await fetchRegistryData();
                    updateFilteredEvents();
                    toast.success('Assenza segnalata!');
                } else {
                    toast.error('Qualcosa è andato storto.');
                }
            }
        });
    }

    async function fetchCourseSubscriptions() {
        const res = await apiFetch(
            `${__bakney.env.API.COURSE_SUBSCRIPTIONS.LIST}?course_id=${courseId}&include_deleted=true`
        );
        if (!res.error) {
            courseSubscriptions = res.response.data;
            // Parse courseSubscriptions to assign medical_label from subscription.associate
            courseSubscriptions = [
                ...courseSubscriptions?.map(subscription => {
                    if (subscription.medical_label) {
                        subscription.subscription.associate.medical_label = subscription.medical_label;
                    }
                    return subscription;
                }),
            ];
        } else {
            toast.error('Qualcosa è andato storto.');
        }
    }

    onMount(async () => {
        await fetchRegistryData();
        updateFilteredEvents();
        await fetchCourseSubscriptions();
    });
</script>

<div class="row" style="margin:0;">
    <div class="col-12 pl-14" style="padding: 0rem !important;">
        <div class="timeline timeline-5">
            <div
                class="timeline-items pl-8"
                style="display: flex; flex-direction: column; max-width: 70rem; margin: auto;">
                {#if events?.length == 0 && !loadRegistry}
                    <div class="d-flex flex-column align-items-center py-10">
                        <div class="symbol symbol-50 symbol-secondary mb-4">
                            <span class="symbol-label">
                                <Placeholder size={32} weight="duotone" />
                            </span>
                        </div>
                        <span class="text-muted font-weight-bold font-size-lg ml-4"
                            >Aggiungi un evento a calendario per inserire una evento nel registro.</span>
                    </div>
                {:else if loadRegistry}
                    <div class="d-flex flex-column align-items-center py-10 w-full">
                        <div class="w-full">
                            <ContentLoader height="50" width="100%">
                                <rect x="0" y="0" rx="3" ry="3" width="100%" height="50" />
                            </ContentLoader>
                        </div>
                        <span class="text-muted font-weight-bold font-size-lg mt-10">Caricamento in corso...</span>
                    </div>
                {:else}
                    <div class="form-group">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <div class="input-icon">
                            <input
                                bind:value={searchKey}
                                on:keyup={updateFilteredEvents}
                                type="text"
                                class="form-control"
                                placeholder="Data o nome lezione..." />
                            <span><i class="flaticon2-search-1 icon-md" /></span>
                        </div>
                    </div>
                    {#if filteredEvents?.length == 0}
                        <p class="text-center mb-10">nessun evento trovato.</p>
                    {/if}
                    {#each filteredEvents || [] as event}
                        <div class="timeline-item mr-6 pb-10">
                            <!--begin::Icon-->
                            <div
                                class="timeline-media p-0 bg-primary"
                                style="height:12px;width:12px;left:-3px;z-index:10;" />
                            <!--end::Icon-->
                            <!--begin::Info-->
                            <div class="d-flex justify-content-between align-items-top mb-4">
                                <div class="timeline-desc timeline-desc-light-primary pt-0" style="width:14rem;">
                                    <span class="font-weight-bolder text-primary font-size-h6"
                                        >{new Date(event.date).toLocaleString().split(',')[0]}</span>
                                    <!-- if not allDay show time -->
                                    {#if !event.allDay && event.start && event.end}
                                        <p class="text-dark-75 font-weight-bold mb-0">
                                            {new moment(event.start).format('HH:mm')} - {new moment(event.end).format(
                                                'HH:mm'
                                            )}
                                        </p>
                                    {/if}
                                    <p class="font-weight-bolder text-dark pb-0 mb-2">{event.title}</p>
                                    <p class="mb-0">
                                        {#if new Date(event.date) > new Date()}
                                            <span
                                                class="label label-xs label-secondary label-inline d-flex align-items-center font-weight-boldest">
                                                <ClockCountdown size={16} weight="duotone" class="mr-1" />
                                                programmata
                                            </span>
                                        {:else}
                                            <span
                                                class="label label-xs label-success label-inline font-weight-boldest d-flex align-items-center"
                                                ><CheckCircle size={16} weight="duotone" class="mr-1" />conclusa
                                            </span>
                                        {/if}
                                    </p>
                                </div>
                                <div
                                    class="d-flex pt-2 mx-2"
                                    style="flex-direction: column !important; align-items: start !important; justify-content: center !important;width:100%;">
                                    <!-- instructor -->
                                    {#if event.extended_props != undefined && event.extended_props?.instructor != undefined}
                                        <div
                                            class="d-none d-md-flex timeline-desc timeline-desc-light-primary pt-0 ml-0"
                                            style="padding:0!important;">
                                            <span class="label label-xs label-dark font-weight-bolder label-inline">
                                                <User size={16} weight="duotone" class="mr-1" />
                                                {#if typeof event.extended_props.instructor == 'string'}
                                                    {JSON.parse(event.extended_props.instructor).label || ''}
                                                {:else if Array.isArray(event.extended_props.instructor)}
                                                    {#each event.extended_props.instructor as instructor, i}
                                                        {instructor.label}
                                                        {#if i < event.extended_props.instructor.length - 1}
                                                            {`, `}
                                                        {/if}
                                                    {/each}
                                                {:else}
                                                    {event.extended_props.instructor.label || ''}
                                                {/if}
                                                <b />
                                            </span>
                                        </div>
                                    {/if}
                                    <!-- actual_absences -->
                                    {#if event.expected_absences.length > 0}
                                        <div
                                            class="d-none d-md-flex mt-1 font-weight-bold hide-scrollbar"
                                            style="height: fit-content; background: rgb(243 243 243); border-radius: 0.35rem; border: 0.12rem solid #ededed; max-width: 35rem; overflow-x: scroll;white-space: nowrap;">
                                            <span class="mr-2 text-black font-weight-boldest">ASSENTI SEGNALATI: </span>
                                            {#each event.expected_absences as absence, idx}
                                                <span>{absence}</span>
                                                {#if idx < event.expected_absences.length - 1}
                                                    <span class="mr-2">, </span>
                                                {/if}
                                            {/each}
                                        </div>
                                    {/if}
                                </div>

                                <!-- svelte-ignore a11y-click-events-have-key-events -->
                                <!-- svelte-ignore a11y-missing-attribute -->
                                <div class="d-flex justify-content-between align-items-center">
                                    <a
                                        class="btn btn-icon btn-light-primary btn-xs p-0"
                                        data-toggle="modal"
                                        data-target="#attendance-day-{event.attendance_day_id}">
                                        <ListChecks size="18" weight="duotone" />
                                        <!-- <span class="navi-text"></span> -->
                                    </a>
                                    {#if canPerformAction('association.courses.attendance.update')}
                                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                                        <a
                                            class="btn btn-icon btn-light-danger btn-xs ml-2 p-0"
                                            on:click={() => deleteData(event)}>
                                            <TrashSimple size={18} weight="duotone" />
                                        </a>
                                    {/if}
                                </div>
                            </div>
                            <!--end::Info-->
                        </div>
                        <!-- ADD TO COURSE MODAL -->
                        <MarkAttendees
                            bind:this={event.modal}
                            bind:event
                            bind:events
                            bind:courseId
                            {courseSubscriptions}
                            id={event.attendance_day_id}
                            on:refresh={async () => {
                                await fetchRegistryData();
                                updateFilteredEvents();
                            }} />
                    {/each}
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
    .hide-scrollbar::-webkit-scrollbar {
        display: none;
    }

    .timeline.timeline-5 .timeline-items .timeline-item .timeline-desc::before {
        content: '';
        position: absolute;
        width: 4px;
        height: 95%;
        background-color: #ebedf3;
        border-radius: 6px;
        top: 11px;
        left: 1px;
    }

    .timeline.timeline-5 .timeline-items .timeline-item .timeline-desc {
        padding: 0px 0 0 20px;
    }
</style>
