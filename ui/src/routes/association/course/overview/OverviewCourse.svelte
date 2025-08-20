<script>
    import {onMount} from 'svelte';
    import {sessionToken, userData, permissions} from 'store/stores.js';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import {scale, slide} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import Calendar from './components/Calendar.svelte';
    import Registry from './components/Registry.svelte';
    import {
        PlusCircle,
        Trash,
        ShareNetwork,
        ArrowCounterClockwise,
        Export,
        CheckCircle,
        ArrowsClockwise,
        Info,
        Square,
        ArrowLeft,
    } from 'phosphor-svelte';
    import {push} from 'svelte-spa-router';
    import QuillEditor from 'components/inputs/QuillEditor.svelte';
    import {canPerformAction} from 'utils/Permissions';
    import {toast} from 'svelte-sonner';
    import CourseNavigationTab from './components/CourseNavigationTab.svelte';
    import MultipleQuotes from '../add/sections/partials/multiple-quotes.svelte';
    import {Datepicker, SmartMultiSelect} from 'components/formBuilder/preview-blocks/index.js';
    import AddModal from '../modals/AddModal.svelte';
    import Membership from '../add/sections/partials/membership.svelte';
    import MembershipList from './partials/membership-list.svelte';
    import CourseSubscriptionsList from './partials/course-subscriptions-list.svelte';
    import BackButton from 'components/buttons/BackButton.svelte';

    sessionToken.useLocalStorage();
    userData.useLocalStorage();
    permissions.useLocalStorage();

    export let params;
    let id = params.id;
    let courseInfo = {
        course: {
            title: null,
            description: null,
            creation_date: null,
            fee: 0.0,
        },
        course_subscriptions: [],
        partial: 0.0,
        total: 0.0,
        waiting: 0,
    };
    let calendar;
    let calendarStatus = 1;
    let google_sync_enabled = false;
    let google_calendar_id = null;
    let attendanceRegistryEvents = [];
    let availableStructures = [];
    let allStructures = [];

    let visibleMultiaction = false;
    let selectedCounter = 0;
    let datatable;
    let updateBtn;
    let editingInfo = false;

    let loadRegistry = false;

    async function fetchRegistryData() {
        loadRegistry = true;
        attendanceRegistryEvents = null;
        const response = await apiFetch(replaceUID(__bakney.env.API.COURSE.ATTENDEES, id));
        if (!response.error) {
            attendanceRegistryEvents = response.response?.data?.events;
            // sort events by most recent
            attendanceRegistryEvents = [
                ...attendanceRegistryEvents.sort((a, b) => new Date(b.date) - new Date(a.date)),
            ];
        }
        loadRegistry = false;
    }

    export let fetchData = async function () {
        // fetch attendance fetchRegistryData
        fetchRegistryData();
        const url = __bakney.env.HOST + '/course/' + id + '/overview';
        const res = await apiFetch(url, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + $sessionToken,
            },
        });

        if (!res.error) {
            courseInfo = res.response.data;
            courseInfo.course.creation_date = new Date(courseInfo.course.creation_date).toLocaleDateString('it-IT');
            // read sanitized XSS description
            if (courseInfo?.course?.description)
                courseInfo.course.description = courseInfo?.course?.description
                    ?.replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>');

            if (courseInfo?.course?.multiple_quotes === null) {
                courseInfo.course.multiple_quotes = [];
            }
        }
        // fetch calendar status
        const calendarResponse = await apiFetch(replaceUID(__bakney.env.API.COURSE.CALENDAR, id));
        if (!calendarResponse.error) {
            calendarStatus = calendarResponse.response.data.status;
        }

        courseInfo.course.fee = courseInfo.course.fee.replace('.', ',');
        courseInfo.course.one_fee = courseInfo.course.one_fee.replace('.', ',');
    };

    async function syncGoogleCalendar() {
        if (!google_sync_enabled) {
            // info swal to enable in settings the google calendar integration
            swal.fire({
                text: "Per sincronizzare il calendario con Google, devi prima attivare l'integrazione.",
                icon: 'info',
                buttonsStyling: true,
                showCancelButton: false,
                confirmButtonText: 'Vai alle impostazioni',
                reverseButtons: true,
            }).then(function (result) {
                if (result.isConfirmed) {
                    push('/profile?page=integrations');
                }
            });
            return;
        }
        swal.fire({
            text: 'Vuoi sincronizzare il calendario con Google?',
            icon: 'question',
            buttonsStyling: true,
            showCancelButton: true,
            cancelButtonText: 'Annulla',
            confirmButtonText: 'Sincronizza',
            reverseButtons: true,
        }).then(async function (result) {
            if (result.isConfirmed) {
                // block page until the request is completed
                KTApp.blockPage({
                    overlayColor: '#000000',
                    state: 'primary',
                    message: 'Sincronizzazione in corso...',
                });
                let res = await apiFetch(
                    replaceUID(__bakney.env.API.GOOGLE.CALENDAR_COURSE_SYNC, courseInfo.course.course_id),
                    {
                        method: 'POST',
                    }
                );
                if (res.status == 200) {
                    toast.success('Calendario sincronizzato con Google');
                    google_sync_enabled = true;
                    google_calendar_id = res.response.google_calendar_id;
                } else {
                    if (res.status == 403) {
                        toast.error('Ci sono state troppe richieste, attendi qualche minuto e riprova');
                    } else if (res.status == 400) {
                        toast.error('Impossibile creare il calendario su google, contatta il supporto');
                    } else {
                        toast.error('Qualcosa è andato storto.');
                    }
                }
                KTApp.unblockPage();
            }
        });
    }

    async function saveCalendar(status = 'publish') {
        let statusMap = {
            publish: 2,
            draft: 1,
        };
        // check if reset
        if (status == 'reset') {
            return swal
                .fire({
                    text: 'Vuoi davvero resettare il calendario e perdere tutti i dati del registro presenze?',
                    icon: 'question',
                    footer: '<b class="text-danger">Tutti gli eventi verranno eliminati e perderai anche il <strong>registro presenze</strong></b>',
                    buttonsStyling: true,
                    showCancelButton: true,
                    cancelButtonText: 'Annulla',
                    confirmButtonText: 'Elimina definitivamente',
                    confirmButtonColor: '#d33',
                    focusConfirm: false,
                    reverseButtons: true,
                })
                .then(async function (result) {
                    if (result.isConfirmed) {
                        KTApp.blockPage({
                            overlayColor: '#000000',
                            state: 'primary',
                            message: 'Reset calendario in corso...',
                        });

                        const response = await apiFetch(replaceUID(__bakney.env.API.COURSE.CALENDAR_UPDATE, id), {
                            method: 'DELETE',
                        });

                        KTApp.unblockPage();

                        if (!response.error) {
                            await fetchData();
                            toast.success('Calendario resettato con successo!');
                            calendarStatus = 1;
                            calendar.removeAllEvents();
                        } else {
                            toast.error('Qualcosa è andato storto.');
                        }
                    }
                });
        }
        swal.fire({
            text: 'Vuoi salvare le modifiche al calendario?',
            icon: 'question',
            footer:
                statusMap[status] == 1
                    ? '<b class="text-warning">Il calendario sarà salvato come bozza e potrai modificarlo in seguito.</b>'
                    : '<b class="text-danger">Il calendario sarà pubblicato e reso disponibile per tutti gli atleti.</b>',
            buttonsStyling: true,
            showCancelButton: true,
            cancelButtonText: 'Annulla',
            confirmButtonText: statusMap[status] == 1 ? 'Salva come bozza' : 'Pubblica',
            reverseButtons: true,
        }).then(async function (result) {
            if (result.isConfirmed) {
                KTApp.blockPage({
                    overlayColor: '#000000',
                    state: 'primary',
                    message: 'Salvataggio in corso...',
                });

                // alert(JSON.stringify(calendar.getEvents()));
                let updateEvents = await calendar.getEvents();
                let events = [];
                for (let i = 0; i < updateEvents.length; i++) {
                    events.push({
                        event_id: updateEvents[i].id,
                        start: updateEvents[i].start,
                        end: updateEvents[i].end,
                        allDay: updateEvents[i].allDay,
                        title: updateEvents[i].title,
                        extendedProps: updateEvents[i].extendedProps || {},
                    });
                }
                const response = await apiFetch(replaceUID(__bakney.env.API.COURSE.CALENDAR_UPDATE, id), {
                    method: 'POST',
                    body: JSON.stringify({
                        events: events,
                        status: statusMap[status], // 2 = updated & published (required)
                    }),
                });

                KTApp.unblockPage();

                if (!response.error) {
                    await fetchData();
                    toast.success('Calendario aggiornato con successo!');
                    calendarStatus = statusMap[status];
                    if (google_sync_enabled)
                        setTimeout(() => {
                            syncGoogleCalendar();
                        }, 2000);
                } else {
                    toast.error('Qualcosa è andato storto.');
                }
            }
        });
    }

    async function fetchAvailableStructures() {
        const res = await apiFetch(__bakney.env.API.COURSE.LOCATIONS.LIST);

        if (!res.error) {
            availableStructures = res.response.data?.map(x => ({label: x.title, value: x.course_location_id}));
            allStructures = res.response.data;
        }
    }

    onMount(async () => {
        await fetchData();
        await fetchAvailableStructures();
        jQuery('body').tooltip({selector: '[data-toggle=tooltip]', trigger: 'hover'});
    });

    async function updateData() {
        KTUtil.btnWait(updateBtn, 'spinner spinner-right spinner-white pr-15', '');

        const res = await apiFetch(replaceUID(__bakney.env.API.COURSE.UPDATE, courseInfo?.course.course_id), {
            method: 'PATCH',
            body: JSON.stringify({
                title: courseInfo?.course.title,
                description: courseInfo?.course.description,
                fee: courseInfo?.course.fee.replace(',', '.'),
                one_fee: courseInfo?.course.one_fee.replace(',', '.'),
                events: courseInfo?.course.events,
                multiple_quotes: courseInfo?.course?.multiple_quotes || null,
                locations: courseInfo?.course?.locations || [],
                billed_duration_is_sport_season: courseInfo?.course.billed_duration_is_sport_season,
                billed_frequency: courseInfo?.course.billed_frequency,
                billed_from_subscription_date: courseInfo?.course.billed_from_subscription_date,
                billed_from_day_of_month: courseInfo?.course.billed_from_day_of_month,
                auto_renewal: courseInfo?.course.auto_renewal,
                start_date: courseInfo?.course.start_date || null,
                end_date: courseInfo?.course.end_date || null,
            }),
        });
        setTimeout(() => {
            editingInfo = false;

            if (!res.error) {
                toast.success('Corso aggiornato con successo.');
            } else {
                toast.error('Qualcosa è andato storto.');
            }
            KTUtil.btnRelease(updateBtn);
            fetchData();
        }, 500);
    }
    function toggleEdit(e) {
        editingInfo = !editingInfo;
        // remove focus from button
        e.target.blur();

        setTimeout(() => {
            jQuery('#kt_inputmask_fee').inputmask('9{1,4},9{2}', {
                greedy: false,
                placeholder: '0',
                rightAlign: true,
            });
            jQuery('#kt_inputmask_fee').change(function () {
                courseInfo.course.fee = document.getElementById('kt_inputmask_fee').value.replace(',', '.');
                totalAmount = courseInfo.course.fee;
            });

            jQuery('#kt_inputmask_one_fee').inputmask('9{1,4},9{2}', {
                greedy: false,
                placeholder: '0',
                rightAlign: true,
            });
            jQuery('#kt_inputmask_one_fee').change(function () {
                courseInfo.course.one_fee = document.getElementById('kt_inputmask_one_fee').value.replace(',', '.');
                totalAmount = courseInfo.course.one_fee;
            });
        }, 100);

        // if editingInfo is false, then remove new events
        if (!editingInfo) {
            courseInfo.course.events = [...courseInfo.course.events.filter(e => !e.new_event)];
        }
    }
</script>

<!--begin::Entry-->
<div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}} class="d-flex flex-column-fluid">
    <!--begin::Container-->
    <div class="container container-overlay">
        <!--begin::Card-->
        <div class="card card-custom">
            <div class="card-header py-0 px-0 border-0">
                <div class="card-toolbar p-0">
                    <BackButton />
                </div>
                <h3 class="card-title font-size-h2">
                    <span class="d-none d-md-inline-block">{courseInfo.course.title}</span>
                </h3>
                <div class="card-toolbar">
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <button
                        type="reset"
                        on:click={e => toggleEdit(e)}
                        class="btn btn-{editingInfo ? 'light-' : ''}primary font-weight-boldest mr-2">
                        {editingInfo ? 'Annulla' : 'Modifica'}
                    </button>
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    {#if editingInfo}
                        <button
                            bind:this={updateBtn}
                            disabled={!editingInfo}
                            type="reset"
                            on:click={updateData}
                            class="btn btn-primary font-weight-bolder">
                            Salva
                        </button>
                    {/if}
                </div>
            </div>
            <div class="card-body py-0 px-0 mb-4">
                <!--begin::Top-->
                <div class="d-flex flex-column w-100">
                    {#if !editingInfo}
                        <div
                            class="d-flex align-items-center text-dark text-hover-primary font-weight-bold mr-3 mb-2 justify-content-center">
                            <div class="d-flex border rounded-xl font-weight-bolder px-4 py-1 bg-light">
                                Il corso è
                                {#if courseInfo.course.start_date && courseInfo.course.end_date}
                                    attivo dal <span class="text-primary font-weight-boldest mx-1"
                                        >{moment(courseInfo.course.start_date).format('DD/MM/YYYY')}</span>
                                    fino al
                                    <span class="text-primary font-weight-boldest mx-1"
                                        >{moment(courseInfo.course.end_date).format('DD/MM/YYYY')}</span>
                                {:else if courseInfo.course.start_date}
                                    attivo dal <span class="text-primary font-weight-boldest mx-1"
                                        >{moment(courseInfo.course.start_date).format('DD/MM/YYYY')}</span>
                                {:else if courseInfo.course.end_date}
                                    attivo fino al <span class="text-primary font-weight-boldest mx-1"
                                        >{moment(courseInfo.course.end_date).format('DD/MM/YYYY')}</span>
                                {:else}
                                    <span class="text-success font-weight-boldest mx-1">sempre attivo</span>
                                {/if}
                            </div>
                        </div>
                    {:else}
                        <div class="d-flex flex-wrap my-2 mt-0 mb-4" style="gap: 2rem;">
                            <Datepicker
                                customClasses={'mx-2 px-0 max-w-8 col-12 col-md-3'}
                                editable={false}
                                active={false}
                                on:clear={() => {
                                    courseInfo.course.start_date = null;
                                }}
                                on:change={e => {
                                    if (e.detail) {
                                        courseInfo.course.start_date = moment(e.detail, 'DD/MM/YYYY').format(
                                            'YYYY-MM-DD'
                                        );
                                    } else {
                                        courseInfo.course.start_date = null;
                                    }
                                }}
                                props={{
                                    id: 'start_date',
                                    name: 'start_date',
                                    label: 'Attivo dal',
                                    required: false,
                                    format: 'DD/MM/YYYY',
                                    defaultDateNull: true,
                                    value:
                                        courseInfo.course.start_date != null
                                            ? moment(courseInfo.course.start_date).format('DD/MM/YYYY')
                                            : null,
                                }} />
                            <Datepicker
                                customClasses={'mx-2 px-0 max-w-8 col-12 col-md-3'}
                                editable={false}
                                active={false}
                                on:clear={() => {
                                    courseInfo.course.end_date = null;
                                }}
                                on:change={e => {
                                    if (e.detail) {
                                        courseInfo.course.end_date = moment(e.detail, 'DD/MM/YYYY').format(
                                            'YYYY-MM-DD'
                                        );
                                    } else {
                                        courseInfo.course.end_date = null;
                                    }
                                }}
                                props={{
                                    id: 'end_date',
                                    name: 'end_date',
                                    label: 'Fino al',
                                    required: false,
                                    format: 'DD/MM/YYYY',
                                    placeholder: 'Seleziona una data',
                                    defaultDateNull: true,
                                    value:
                                        courseInfo.course.end_date != null
                                            ? moment(courseInfo.course.end_date).format('DD/MM/YYYY')
                                            : null,
                                }} />
                        </div>
                    {/if}
                    {#if courseInfo.course?.course_type === 1 || courseInfo.course?.one_fee_payment}
                        {#if editingInfo}
                            <div class="d-flex justify-content-between align-items-center mb-2 mt-4">
                                <h6 class="font-weight-bold mb-0 font-size-h2">Pagamenti</h6>
                            </div>
                        {/if}
                        <div class="d-flex flex-wrap my-2 font-size-h7 mt-0 mb-4" style="gap: 2rem;">
                            {#if courseInfo.course?.course_type === 1}
                                <!-- svelte-ignore a11y-invalid-attribute -->
                                <span class="text-hover-primary font-weight-bold mb-0 border rounded-xl py-2 px-3">
                                    <span class="font-size-sm font-weight-boldest">Prezzo totale </span>
                                    {#if !editingInfo}
                                        <div
                                            class="d-flex align-items-center font-weight-boldest font-size-h4 text-success mt-0">
                                            {parseFloat(courseInfo.course.fee) == 0
                                                ? 'gratuito'
                                                : courseInfo.course.fee + ' €'}
                                        </div>
                                    {:else}
                                        <div
                                            class="input-group input-group-solid rounded-xl py-0 pr-4 d-flex align-items-center justify-content-center mt-1"
                                            style={courseInfo.course.events?.length > 0
                                                ? 'pointer-events: none;opacity: 0.6;'
                                                : ''}>
                                            <div class="input-group-prepend">
                                                <span class="input-group-text fs-1-1">€</span>
                                            </div>
                                            <input
                                                name="fee"
                                                type="text"
                                                bind:value={courseInfo.course.fee}
                                                class="form-control fs-1-1 rounded-xl p-0"
                                                placeholder="" />
                                        </div>
                                    {/if}
                                </span>
                            {/if}
                            {#if courseInfo.course.one_fee_payment}
                                <span class="text-hover-primary font-weight-bold mb-0 border rounded-xl py-2 px-3">
                                    <span class="font-size-sm font-weight-boldest">Unica soluzione </span>
                                    {#if !editingInfo}
                                        <div
                                            class="d-flex align-items-center font-weight-boldest font-size-h4 text-success mt-0">
                                            {courseInfo.course.one_fee + ' €'}
                                        </div>
                                    {:else}
                                        <div
                                            class="input-group input-group-solid rounded-xl py-0 pr-4 d-flex align-items-center justify-content-center mt-1">
                                            <div class="input-group-prepend">
                                                <span class="input-group-text fs-1-1">€</span>
                                            </div>
                                            <input
                                                name="fee"
                                                type="text"
                                                bind:value={courseInfo.course.one_fee}
                                                class="form-control fs-1-1 rounded-xl p-0"
                                                id="kt_inputmask_one_fee"
                                                placeholder="" />
                                        </div>
                                    {/if}
                                </span>
                            {/if}
                        </div>
                    {/if}
                    {#if !editingInfo}
                        <span
                            class="d-flex align-items-center text-dark text-hover-primary font-size-h2 font-weight-bold mr-3"
                            >{courseInfo.course.title}</span>
                    {:else}
                        <h6 class="font-weight-bold mb-0 font-size-h2 mb-2">Titolo</h6>
                        <input
                            type="text"
                            bind:value={courseInfo.course.title}
                            class="form-control form-control-solid h-auto font-size-h4 font-weight-bold text-dark rounded-xl"
                            placeholder="Titolo" />
                    {/if}

                    {#if !editingInfo}
                        <div
                            class="d-flex align-items-center flex-wrap justify-content-between font-size-h5 mt-4 mb-2"
                            style="padding: 1rem !important; margin-top: 1rem; border: 0.124rem solid #e9eff6; border-radius: 0.55rem; background: #e7edf452;overflow-x: scroll;">
                            <div
                                id="description-container"
                                class="flex-grow-1 text-dark-75 py-2 py-lg-2 mr-5"
                                style="font-weight: 400;">
                                {@html courseInfo.course.description}
                            </div>
                        </div>
                    {/if}
                    {#if editingInfo}
                        <div class="my-4">
                            <h6 class="font-weight-bold mb-0 font-size-h2 mb-2">Descrizione</h6>
                            <QuillEditor bind:value={courseInfo.course.description} />
                        </div>
                    {/if}

                    <div class="d-flex mb-2">
                        <div class="d-flex flex-column w-100">
                            <div class="d-flex justify-content-between align-items-center mb-2 mt-4">
                                <h6 class="font-weight-bold mb-0 font-size-h2">Strutture</h6>
                            </div>

                            <div class="d-flex flex-wrap mt-2 w-100" style="gap: 2rem;">
                                {#if editingInfo}
                                    <SmartMultiSelect
                                        customClasses={'min-w-100 mb-0'}
                                        editable={false}
                                        active={false}
                                        minNumberOfSelectedItems={0}
                                        on:change={e => {
                                            let locs = e.detail;
                                            if (Array.isArray(locs)) {
                                                courseInfo.course.locations = allStructures.filter(s => {
                                                    return locs.some(loc => loc.value === s.course_location_id);
                                                });
                                            } else {
                                                courseInfo.course.locations = courseInfo.course.locations.filter(s => {
                                                    return locs.value !== s.course_location_id;
                                                });
                                            }
                                        }}
                                        props={{
                                            id: `course_locations`,
                                            name: `course_locations`,
                                            label: 'Seleziona le strutture',
                                            placeholder: 'Seleziona le strutture',
                                            required: false,
                                            clearable: false,
                                            searchable: true,
                                            showChevron: true,
                                            options: availableStructures,
                                            value:
                                                availableStructures.filter(s => {
                                                    return courseInfo?.course?.locations
                                                        ?.map(l => l.course_location_id)
                                                        .includes(s.value);
                                                }) || [],
                                        }}>
                                        <div slot="list-append" class="w-100 d-flex justify-content-center">
                                            <button
                                                type="button"
                                                class="btn btn-sm btn-light-primary font-weight-boldest mx-auto mt-2"
                                                on:click={() => {
                                                    let modal = new AddModal({
                                                        target: document.body,
                                                        props: {
                                                            show: true,
                                                            ktdatable: null,
                                                        },
                                                    });
                                                    modal.$on('update', () => {
                                                        fetchAvailableStructures();
                                                    });
                                                }}>
                                                Aggiungi Struttura
                                            </button>
                                        </div>
                                    </SmartMultiSelect>
                                {:else if courseInfo.course.locations && courseInfo.course.locations.length > 0}
                                    {#each courseInfo.course.locations as location}
                                        <div class="font-weight-bold d-flex flex-column">
                                            <div class="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <h6 class="font-weight-boldest text-primary mb-1">
                                                        {location.title?.toUpperCase()}
                                                    </h6>
                                                    <p class="text-muted mb-0 font-size-sm">
                                                        {location.address || 'Nessun indirizzo'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    {/each}
                                {:else}
                                    <div
                                        class="text-center py-1 px-3 border rounded-lg d-flex align-items-center justify-content-center font-weight-bold">
                                        <p class="text-muted mb-0 font-size-sm">Nessuna struttura associata</p>
                                    </div>
                                {/if}
                            </div>
                        </div>
                    </div>
                </div>
                <!--end::Top-->
                <!--end::Info-->
                {#if courseInfo.course.multi_payments}
                    <!--begin::Separator-->
                    <!-- <div class="separator separator-solid my-7" /> -->
                    <div class="my-7" />
                    <h3 class="card-title font-size-h2 mb-4">Piano Rate</h3>

                    {#if editingInfo}
                        <span
                            class="d-flex align-items-center text-info font-weight-semibold mx-0 p-3 bg-light-info rounded-lg text-xs mb-6"
                            style="width: fit-content">
                            <Info size={20} weight="duotone" class="mr-1" />
                            <div class="ml-4">
                                <b class="mr-1">Gli atleti esistenti non verranno modificati,</b> per modificarli:
                                <br />
                                <div class="mb-0">
                                    <div>
                                        1. Seleziona l'atleta nella lista dall'icona <Square
                                            size={16}
                                            weight="duotone"
                                            class="text-info" />
                                    </div>
                                    <div>2. Clicca su <b>Operazioni su selezionati</b></div>
                                </div>
                            </div>
                        </span>
                    {/if}
                    <!--end::Separator-->
                    <div class="row mx-0 px-0" style="gap: 1rem;">
                        {#each Array.from(courseInfo.course?.events || []) as event}
                            <div
                                class="m-0 p-3 bg-light text-center rounded-xl border border-secondary"
                                style="width:10rem">
                                <div class="mb-1">
                                    <span class="font-size-lg text-dark font-weight-boldest">{event.id + 1}° rata</span>
                                </div>
                                {#if !editingInfo}
                                    <span
                                        class="label label-light-success label-inline font-weight-bolder label-lg mb-3">
                                        {event.amount.replaceAll('.', ',')} €
                                    </span>
                                {:else}
                                    <input bind:value={event.amount} type="hidden" />
                                    <input
                                        name="fee"
                                        style="height: 2.2rem; width: 7rem; margin: auto; text-align: center;"
                                        type="text"
                                        on:change={() => {
                                            // check is a valid decimal number (can have . or ,)
                                            // alway have a fixed number of 2 decimal
                                            // get value from kt_inputmask_fee_{event.id}
                                            let value = document.getElementById(`kt_inputmask_fee_${event.id}`).value;

                                            // convert to decimal numer with 2 decimal
                                            value = parseFloat(value.replace(',', '.')).toFixed(2);
                                            // update the event.amount
                                            event.amount = value;
                                            courseInfo.course.fee = courseInfo.course.events
                                                .map(e => parseFloat(e.amount))
                                                .reduce((a, b) => a + b, 0)
                                                .toFixed(2);
                                        }}
                                        value={event.amount.replaceAll('.', ',')}
                                        class="form-control"
                                        id="kt_inputmask_fee_{event.id}"
                                        placeholder="" />
                                {/if}
                                <div class="font-size-sm">
                                    scade il <br />
                                    <span class="font-weight-bolder">
                                        {#if !editingInfo}
                                            {event.payment_date}
                                        {:else}
                                            <input bind:value={event.payment_date} type="hidden" />
                                            <input
                                                name="fee"
                                                style="height: 2.2rem; margin: auto; text-align: center;padding: 0rem !important;"
                                                type="date"
                                                on:change={() => {
                                                    // get value from kt_inputmask_payment_date_{event.id}
                                                    event.payment_date = document.getElementById(
                                                        `kt_inputmask_payment_date_${event.id}`
                                                    ).value;
                                                    // format to dd/mm/yyyy the date
                                                    event.payment_date = moment(event.payment_date).format(
                                                        'DD/MM/YYYY'
                                                    );
                                                }}
                                                value={moment(event.payment_date, 'DD/MM/YYYY').format('YYYY-MM-DD')}
                                                data-date-format="DD/MM/YYYY"
                                                class="form-control"
                                                id="kt_inputmask_payment_date_{event.id}"
                                                placeholder="" />
                                        {/if}
                                    </span>
                                </div>
                                {#if editingInfo}
                                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                                    <div
                                        class="mt-1"
                                        style="cursor:pointer"
                                        on:click={() => {
                                            courseInfo.course.events = [
                                                ...courseInfo.course.events.filter(e => e.id !== event.id),
                                            ];
                                            // update the id of the events
                                            courseInfo.course.events.forEach((e, i) => {
                                                e.id = i;
                                            });
                                            courseInfo.course.fee = courseInfo.course.events
                                                .map(e => parseFloat(e.amount))
                                                .reduce((a, b) => a + b, 0)
                                                .toFixed(2);
                                        }}>
                                        <Trash size="1.2rem" color="red" />
                                        <span style="color: red">Elimina</span>
                                    </div>
                                {/if}
                            </div>
                        {/each}
                        {#if editingInfo}
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <div
                                on:click={() => {
                                    // today date in format dd/mm/yyyy with moment.js
                                    let today = moment().format('DD/MM/YYYY');
                                    courseInfo.course.events = [
                                        ...courseInfo.course.events,
                                        {
                                            id: courseInfo.course.events.length,
                                            amount: '0.00',
                                            payment_date: today,
                                            new_event: true,
                                        },
                                    ];
                                    courseInfo.course.fee = courseInfo.course.events
                                        .map(e => parseFloat(e.amount))
                                        .reduce((a, b) => a + b, 0)
                                        .toFixed(2);
                                }}
                                class="p-3 bg-light text-center rounded-xl"
                                style="width:10rem;border: 2px; border-style: dashed; border-color: #becde3;cursor:pointer;">
                                <div
                                    class="d-flex justify-content-center align-items-center"
                                    style="width: 100%; height: 100%;">
                                    <PlusCircle size="5rem" color="#becde3" />
                                </div>
                            </div>
                        {/if}
                    </div>
                {/if}

                {#if courseInfo.course?.course_type === 2}
                    <div class="mt-{editingInfo ? '8' : '4'}" />
                    <MultipleQuotes bind:course={courseInfo.course} bind:editable={editingInfo} />
                {/if}

                {#if courseInfo.course?.course_type === 3}
                    <div class="mt-{editingInfo ? '8' : '4'}" />
                    <Membership bind:course={courseInfo.course} bind:editable={editingInfo} />
                {/if}
            </div>
        </div>

        <!--end::Card-->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div>
            {#key params.page}
                <!--begin::Card-->
                <div class="mx-0 border-top pt-8">
                    {#if courseInfo?.course?.course_type}
                        <CourseNavigationTab
                            url={params.id}
                            bind:type={courseInfo.course.course_type}
                            bind:currentPage={params.page}
                            on:change={async data => {
                                if (!data.detail.includes('calendar') && !data.detail.includes('attendance')) {
                                    await fetchData();
                                    jQuery('body').tooltip({selector: '[data-toggle=tooltip]', trigger: 'hover'});
                                }
                            }} />
                    {/if}
                </div>

                {#if !params.page && courseInfo?.course?.course_type}
                    {#if courseInfo.course.course_type === 3}
                        <MembershipList info={courseInfo.course} />
                    {:else}
                        <CourseSubscriptionsList info={courseInfo.course} />
                    {/if}
                {/if}

                {#if params.page === 'calendar'}
                    {#if canPerformAction('association.courses.read')}
                        <div class="card card-custom mb-20 px-0">
                            <div class="card-header border-0 pt-0 pb-0 d-flex justify-content-center">
                                <div class="card-title">
                                    <h3 class="card-label font-size-h2">Calendario delle lezioni</h3>
                                </div>
                            </div>
                            <div class="card-body pt-0 px-0" in:slide={{duration: 250}}>
                                <div class="d-flex justify-content-between mb-10">
                                    <div>
                                        {#if calendarStatus != 1 && canPerformAction('association.courses.update')}
                                            <div class="mt-4 text-right">
                                                <button
                                                    on:click={syncGoogleCalendar}
                                                    type="button"
                                                    class="btn btn-{google_calendar_id
                                                        ? google_sync_enabled
                                                            ? 'light-success'
                                                            : 'light-warning'
                                                        : 'light-primary'} btn-sm font-weight-bold"
                                                    style="margin-left:auto">
                                                    {#if google_calendar_id}
                                                        <CheckCircle size={15} weight="duotone" class="mr-1" />
                                                    {:else}
                                                        <ArrowsClockwise size={15} weight="duotone" class="mr-1" />
                                                    {/if}
                                                    <span class="d-none d-md-inline">
                                                        {google_calendar_id
                                                            ? google_sync_enabled
                                                                ? 'Sincronizzato'
                                                                : 'Sincronizzato in passato'
                                                            : 'Sincronizza con Google'}
                                                    </span>
                                                </button>
                                            </div>
                                        {/if}
                                    </div>
                                    <div class="d-flex justify-content-end">
                                        <div class="mt-4 text-right ml-2">
                                            <button
                                                type="button"
                                                on:click={() => {
                                                    let sessionToken = JSON.parse(localStorage.getItem('sessionToken'));

                                                    fetch(
                                                        __bakney.env.API.CALENDAR.EXPORT +
                                                            `?course_id=${courseInfo.course.course_id}`,
                                                        {
                                                            method: 'GET',
                                                            headers: {
                                                                Authorization: `Bearer ${sessionToken}`,
                                                            },
                                                        }
                                                    )
                                                        .then(res => res.blob())
                                                        .then(blob => {
                                                            // Create a URL for the blob
                                                            const url = window.URL.createObjectURL(blob);
                                                            const link = document.createElement('a');
                                                            link.href = url;
                                                            link.setAttribute(
                                                                'download',
                                                                `${courseInfo.course.title}_calendario.ics`
                                                            ); // Set the file name for download
                                                            document.body.appendChild(link);
                                                            link.click(); // Programmatically click the link to trigger the download
                                                            document.body.removeChild(link); // Clean up
                                                        })
                                                        .catch(error => {
                                                            console.error('Download failed', error);
                                                            toast.error('Qualcosa è andato storto.');
                                                        });
                                                }}
                                                class="btn btn-light-primary btn-sm font-weight-bold"
                                                style="margin-left:auto">
                                                <Export size={15} weight="duotone" class="mr-0 mr-md-1" />
                                                <span class="d-none d-md-inline"> Esporta .ics </span>
                                            </button>
                                        </div>
                                        <div class="mt-4 text-right ml-2">
                                            <!-- svelte-ignore a11y-missing-attribute -->
                                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                                            <a
                                                class="btn btn-sm btn-light-success font-weight-bold"
                                                data-toggle="modal"
                                                data-target="#share-link"
                                                ><ShareNetwork size="15" weight="duotone" class="mr-0 mr-md-1" />

                                                <span class="d-none d-md-inline"> Condividi </span>
                                            </a>
                                        </div>
                                        {#if canPerformAction('association.courses.update')}
                                            <div class="mt-4 text-right ml-2">
                                                <!-- svelte-ignore a11y-missing-attribute -->
                                                <!-- svelte-ignore a11y-click-events-have-key-events -->
                                                <a
                                                    class="btn btn-sm btn-light-danger font-weight-bold"
                                                    on:click={() => saveCalendar('reset')}>
                                                    <ArrowCounterClockwise
                                                        size="15"
                                                        weight="duotone"
                                                        class="mr-0 mr-md-1" />

                                                    <span class="d-none d-md-inline"> Reset calendario </span>
                                                </a>
                                            </div>
                                        {/if}
                                    </div>
                                </div>
                                <Calendar
                                    bind:calendar
                                    bind:calendarStatus
                                    bind:id={params.id}
                                    {fetchData}
                                    {google_sync_enabled}
                                    {syncGoogleCalendar} />
                            </div>
                        </div>
                    {:else}
                        <div class="card card-custom">
                            <div class="card-header flex-wrap border-0 pt-6 pb-6">
                                <div class="card-title">
                                    <h3 class="card-label font-size-h2">
                                        Calendario
                                        <span class="d-block text-muted pt-2 font-size-sm">
                                            Per vedere questa sezione richiedi l'accesso all'amministratore.
                                        </span>
                                    </h3>
                                </div>
                            </div>
                        </div>
                    {/if}
                {/if}
                <!--end::Card-->

                {#if params.page === 'attendance'}
                    <!--begin::Card-->
                    {#if canPerformAction('association.courses.attendance.read')}
                        <div class="card card-custom mb-20">
                            <div class="card-header border-0 pt-6 pb-6 d-flex justify-content-center">
                                <div class="card-title">
                                    <h3 class="card-label font-size-h2">Registro delle presenze</h3>
                                </div>
                            </div>
                            <div class="card-body p-0" in:slide={{duration: 250}}>
                                <Registry
                                    {loadRegistry}
                                    {fetchRegistryData}
                                    bind:events={attendanceRegistryEvents}
                                    bind:courseId={id} />
                            </div>
                        </div>
                    {:else}
                        <div class="card card-custom">
                            <div class="card-header flex-wrap border-0 pt-6 pb-6">
                                <div class="card-title">
                                    <h3 class="card-label font-size-h2">
                                        Registro presenze
                                        <span class="d-block text-muted pt-2 font-size-sm">
                                            Per vedere questa sezione richiedi l'accesso all'amministratore.
                                        </span>
                                    </h3>
                                </div>
                            </div>
                        </div>
                    {/if}
                    <!--end::Card-->
                {/if}
            {/key}
        </div>
    </div>
    <!--end::Container-->
</div>
<!--end::Entry-->

<svelte:head>
    <style>
        #description-container p {
            margin-bottom: 0;
        }
        .swal2-content {
            padding: 0;
        }
        .swal2-container .swal2-html-container {
            max-height: 400px;
        }
        .wide-swal {
            width: 50em !important;
        }
    </style>
</svelte:head>
