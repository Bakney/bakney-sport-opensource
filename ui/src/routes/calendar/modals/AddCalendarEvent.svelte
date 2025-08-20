<script>
    import Portal from 'svelte-portal';
    import {getDataFromForm} from 'utils/Functions';
    import {onMount, createEventDispatcher} from 'svelte';
    import Select from 'svelte-select';
    import {apiFetch} from 'utils/ApiMiddleware';
    import MarkAttendees from 'routes/association/course/overview/components/modals/MarkAttendees.svelte';
    import {BellRinging, BellSlash} from 'phosphor-svelte';
    import {canPerformAction} from 'utils/Permissions';

    const dispatch = createEventDispatcher();

    export let instructors = [];
    export let row;
    export let edit = false;

    let form;
    let courses = [];
    let selectedInstructor = [];
    function initForm() {
        form?.destroy();
        form = FormValidation.formValidation(document.getElementById('form_add_calendar_event'), {
            fields: {
                event_title: {
                    validators: {
                        notEmpty: {
                            message: "Il nome dell'evento è obbligatorio.",
                        },
                    },
                },
                event_start: {
                    validators: {
                        notEmpty: {
                            message: 'Seleziona una data valida.',
                        },
                    },
                },
            },
            plugins: {
                trigger: new FormValidation.plugins.Trigger(),
                bootstrap: new FormValidation.plugins.Bootstrap(),
                // submitButton: new FormValidation.plugins.SubmitButton(),
            },
        });
    }

    async function fetchCourses() {
        let res = await apiFetch(__bakney.env.API.COURSE.LIST + '?all=1');
        let response = res.response.data;
        // convert the dict to an array
        response = Object.keys(response).map(key => response[key]);
        let tmpCourses = response || [];
        courses = [];
        tmpCourses?.forEach(item => {
            courses = [
                ...courses,
                {
                    value: item.course_id,
                    course_id: item.course_id,
                    label: item.title,
                },
            ];
        });
    }

    async function save(data) {
        data.reminder_enabled = row.extendedProps.reminder_enabled || false;
        // data.color = row.color;
        dispatch('save', data);
        return;
    }

    function handleValidation(e) {
        if (!form) initForm();
        form?.validate().then(function (status) {
            if (status === 'Valid') {
                jQuery('#addElement').modal('hide');
                save(getDataFromForm(e));
            } else {
                swal.fire({
                    text: 'Per favore, inserisci tutti i dati e riprova.',
                    icon: 'error',
                    buttonsStyling: false,
                    confirmButtonText: 'Ok, capito!',
                    customClass: {
                        confirmButton: 'btn font-weight-bold btn-light-primary',
                    },
                });
            }
        });
    }

    function closeModal() {
        jQuery('#addElement').modal('hide');
        dispatch('close');
    }

    function saveModal(e) {
        // get data from the form form_add_calendar_event
        let data = getDataFromForm(e);
        data.id = row.id;
        try {
            data.course = JSON.parse(data.course)?.value;
        } catch (e) {
            data.course = null;
        }

        try {
            data.instructor = JSON.parse(data.instructor);
        } catch (e) {
            data.instructor = null;
        }

        try {
            data.color = JSON.parse(data.color)?.value;
        } catch (e) {
            data.color = 'fc-event-solid-primary';
        }
        // data.reminder_amount = row.extendedProps.reminder_amount || 0;
        // data.reminder_unit = row.extendedProps.reminder_unit || 'minutes';
        data.reminder_enabled = row.extendedProps.reminder_enabled || false;
        jQuery('#addElement').modal('hide');
        dispatch('save', data);
    }

    onMount(async () => {
        if (Array.isArray(row.extendedProps?.instructor)) {
            selectedInstructor = row.extendedProps?.instructor || null;
        } else {
            if (row.extendedProps?.instructor) {
                selectedInstructor = [row.extendedProps?.instructor];
            }
        }
        await fetchCourses();
        jQuery('#addElement').modal('show');
    });
</script>

<!-- svelte-ignore missing-declaration -->
<!-- Modal-->
<Portal>
    <form
        class="form"
        id="form_add_calendar_event"
        on:submit|preventDefault={e => {
            if (edit) saveModal(e);
            else handleValidation(e);
        }}>
        <div
            class="modal fade"
            id="addElement"
            tabindex="-1"
            role="dialog"
            aria-labelledby="staticBackdrop"
            aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title font-weight-bolder" id="exampleModalLabel">
                            {edit ? 'Modifica' : 'Crea'} evento
                        </h5>
                        <button
                            type="button"
                            class="close"
                            data-dismiss="modal"
                            aria-label="Close"
                            on:click={closeModal}>
                            <i aria-hidden="true" class="ki ki-close" />
                        </button>
                    </div>
                    <div class="modal-body px-2 px-md-8 py-2" style="overflow-y: auto;overflow-x:hidden">
                        <div>
                            <div class="row">
                                <div class="form-group col-12 col-md-auto mb-2">
                                    <div style="display: flex; align-items: center; height: 4rem;">
                                        <label class="mb-0 mr-4 font-size-h6 font-weight-bold">Tutto il giorno</label>
                                        <span class="switch switch-icon switch-sm">
                                            <label>
                                                <input
                                                    disabled={edit}
                                                    on:click={() => {
                                                        // if allday input convert to date, else convert to datetime
                                                        if (!row.allDay) {
                                                            // convert with moment to YYYY-MM-DD
                                                            // alert(moment(row.start).format('YYYY-MM-DD'));
                                                            let startDate =
                                                                document.querySelector('input[name="event_start"]');
                                                            startDate.type = 'date';
                                                            startDate.value = moment(row.start).format('YYYY-MM-DD');
                                                            let endDate =
                                                                document.querySelector('input[name="event_end"]');
                                                            endDate.type = 'date';
                                                            endDate.value = null;
                                                        } else {
                                                            let startDate =
                                                                document.querySelector('input[name="event_start"]');
                                                            startDate.type = 'datetime-local';
                                                            startDate.value = moment(row.start).format(
                                                                'YYYY-MM-DDTHH:mm'
                                                            );
                                                            let endDate =
                                                                document.querySelector('input[name="event_end"]');
                                                            endDate.type = 'datetime-local';
                                                            endDate.value = moment(row.end).format('YYYY-MM-DDTHH:mm');
                                                        }
                                                    }}
                                                    type="checkbox"
                                                    bind:checked={row.allDay}
                                                    name="event_allday" />
                                                <span />
                                            </label>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <div class="row">
                                <div class="form-group col-12 col-md-auto">
                                    <label>Inizio*</label>
                                    <input
                                        disabled={edit}
                                        name="event_start"
                                        value={moment(row.start || '').format('YYYY-MM-DDTHH:mm')}
                                        type="datetime-local"
                                        class="form-control form-control-solid w-auto form-control-lg margin-tb-0" />
                                </div>
                                <div class="form-group col-12 col-md-auto">
                                    <label>Fine</label>
                                    <input
                                        disabled={row.allDay || edit}
                                        style={row.allDay ? 'opacity: 0.5' : ''}
                                        value={moment(row.end || '').format('YYYY-MM-DDTHH:mm')}
                                        name="event_end"
                                        type="datetime-local"
                                        class="form-control form-control-solid w-auto form-control-lg margin-tb-0" />
                                </div>
                            </div>
                            <div class="row">
                                <div class="form-group col-12 col-md-8 mb-0">
                                    <!-- svelte-ignore a11y-label-has-associated-control -->
                                    <label class="font-size-h6 font-weight-bold">Nome evento*</label>
                                    <input
                                        name="event_title"
                                        type="text"
                                        value={row.title || ''}
                                        class="form-control form-control-solid form-control-lg margin-tb-0"
                                        placeholder="Nome evento" />
                                </div>

                                <div class="form-group col-12 col-md-4 mb-0" style="z-index:9002">
                                    <!-- svelte-ignore a11y-label-has-associated-control -->
                                    <label class="font-size-h6 font-weight-bold">Colore</label>
                                    <Select
                                        hideEmptyState={true}
                                        name="color"
                                        value={row.className && row.className?.split(' ')?.length > 0
                                            ? row.className?.split(' ')[0]
                                            : row.className || '' || 'fc-event-solid-primary'}
                                        items={[
                                            {value: 'fc-event-solid-primary', label: 'blu', color: 'primary'},
                                            {value: 'fc-event-solid-success', label: 'verde', color: 'success'},
                                            {value: 'fc-event-solid-danger', label: 'rosso', color: 'danger'},
                                            {
                                                value: 'fc-event-solid-warning',
                                                label: 'arancione',
                                                color: 'warning',
                                            },
                                            {value: 'fc-event-solid-dark', label: 'nero', color: 'dark'},
                                            {value: 'fc-event-solid-light', label: 'grigio', color: 'light'},
                                            {value: 'fc-event-white', label: 'Bianco', color: 'white'},
                                            {value: 'fc-event-primary', label: 'Pallino Blu', color: 'primary'},
                                            {value: 'fc-event-success', label: 'Pallino Verde', color: 'success'},
                                            {value: 'fc-event-danger', label: 'Pallino Rosso', color: 'danger'},
                                            {value: 'fc-event-warning', label: 'Pallino Arancione', color: 'warning'},
                                            {value: 'fc-event-dark', label: 'Pallino Nero', color: 'dark'},
                                            {value: 'fc-event-light', label: 'Pallino Grigio', color: 'light'},
                                        ]}
                                        placeholder="Seleziona il colore">
                                        <div slot="selection" let:selection>
                                            <div class="d-flex align-items-center">
                                                <div class="symbol symbol-20 symbol-{selection.color} mr-4 shadow-sm">
                                                    <span
                                                        class={`symbol-label label label-lg label-${selection.value}`} />
                                                </div>
                                                <div class="d-flex flex-column">
                                                    <span
                                                        class="font-weight-bold text-dark-75 text-hover-primary font-size-lg">
                                                        {selection.label}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div slot="item" let:item let:index>
                                            <div class="d-flex align-items-center">
                                                <div class="symbol symbol-20 symbol-{item.color} mr-4">
                                                    <span class={`symbol-label label label-lg label-${item.value}`} />
                                                </div>
                                                <div class="d-flex flex-column">
                                                    <span
                                                        class="font-weight-bold text-dark-75 text-hover-primary font-size-lg">
                                                        {item.label}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Select>
                                </div>
                            </div>
                            <div class="row mt-2 mb-4">
                                <div class="form-group col-12 col-md-6 mb-0" style="z-index:9001">
                                    <!-- svelte-ignore a11y-label-has-associated-control -->
                                    <label class="font-size-h6 font-weight-bold">Corso</label>
                                    <Select
                                        hideEmptyState={true}
                                        disabled={edit}
                                        value={row.extendedProps?.course}
                                        name="course"
                                        bind:items={courses}
                                        placeholder="Seleziona il corso" />
                                </div>

                                <div class="form-group col-12 col-md-6 mb-0" style="z-index:9000">
                                    <!-- svelte-ignore a11y-label-has-associated-control -->
                                    <label class="font-size-h6 font-weight-bold">Istruttore</label>
                                    <Select
                                        hideEmptyState={true}
                                        multiple={true}
                                        bind:items={instructors}
                                        value={selectedInstructor}
                                        name="instructor"
                                        placeholder="Seleziona l'istruttore" />
                                </div>
                            </div>
                            <div class="row mt-2 mb-4">
                                <div class="form-group col-12 mb-0">
                                    <!-- svelte-ignore a11y-label-has-associated-control -->
                                    <label class="font-size-h6 font-weight-bold">Descrizione</label>
                                    <textarea
                                        value={row.extendedProps.description}
                                        class="form-control form-control-solid"
                                        rows="3"
                                        name="description"
                                        label="Descrizione"
                                        placeholder="Inserisci una descrizione" />
                                </div>
                            </div>
                            <div class="row mt-0 mb-4">
                                <div class="form-group col-12 mb-0">
                                    <!-- svelte-ignore a11y-label-has-associated-control -->
                                    <label class="font-size-h6 font-weight-bold">Promemoria</label>
                                    <div
                                        class="d-flex font-size-md bg-light font-weight-boldest text-primary align-items-center rounded-lg py-3 px-6">
                                        <button
                                            on:click={() => {
                                                row.extendedProps.reminder_enabled =
                                                    !row.extendedProps?.reminder_enabled;
                                            }}
                                            type="button"
                                            class="btn btn-icon btn-xs btn-light mr-4 mb-0">
                                            {#if row.extendedProps?.reminder_enabled}
                                                <BellRinging size="22" weight="duotone" class="text-primary" />
                                            {:else}
                                                <BellSlash size="22" weight="duotone" class="text-danger" />
                                            {/if}
                                        </button>
                                        <div class="mr-4 {row.extendedProps?.reminder_enabled ? '' : 'opacity-25'}">
                                            Avvisami
                                        </div>
                                        <input
                                            type="number"
                                            max="60"
                                            step="1"
                                            min="0"
                                            name="reminder_amount"
                                            on:change={e => {
                                                row.extendedProps.reminder_amount = e.target.value;
                                            }}
                                            value={row.extendedProps?.reminder_amount || 0}
                                            disabled={!row.extendedProps?.reminder_enabled}
                                            style="width: 5rem !important;"
                                            class="form-control form-control-sm border-0 font-weight-boldest text-primary input-sm w-auto mb-0 mr-2 {row
                                                .extendedProps?.reminder_enabled
                                                ? ''
                                                : 'opacity-25'}" />
                                        <select
                                            value={row.extendedProps?.reminder_unit || 'minutes'}
                                            name="reminder_unit"
                                            disabled={!row.extendedProps?.reminder_enabled}
                                            class="form-control form-control-sm border-0 font-weight-boldest text-primary input-sm w-auto mb-0 mr-4 {row
                                                .extendedProps?.reminder_enabled
                                                ? ''
                                                : 'opacity-25'}">
                                            <option value="minutes">Minuti</option>
                                            <option value="hours">Ore</option>
                                            <option value="days">Giorni</option>
                                        </select>
                                        <div class="{row.extendedProps?.reminder_enabled ? '' : 'opacity-25'} mr-2">
                                            prima
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer mt-12 d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center justify-content-left w-auto">
                            {#if row?.extendedProps?.lesson?.attendance_day_id && edit}
                                <button
                                    type="button"
                                    data-toggle="modal"
                                    data-target="#attendance-day-{row?.extendedProps?.lesson?.attendance_day_id}"
                                    class="btn btn-primary font-weight-boldest">Gestisci Presenze</button>

                                <MarkAttendees
                                    bind:this={row.extendedProps.lesson.modal}
                                    id={row?.extendedProps?.lesson?.attendance_day_id}
                                    courseId={row?.extendedProps?.lesson?.course_id}
                                    event={row?.extendedProps?.lesson}
                                    courseSubscriptions={row?.extendedProps?.lesson?.potential_attendees}
                                    dispatchRefreshOnClose={true}
                                    on:refresh={async () => {
                                        jQuery(
                                            '#attendance-day-' + row?.extendedProps?.lesson?.attendance_day_id
                                        ).modal('hide');
                                        let lessons = await apiFetch(
                                            `${__bakney.env.API.CALENDAR.EVENTS}?event_id=${row.id}&get_lesson=true`
                                        );

                                        if (lessons?.response?.data?.events?.length == 1) {
                                            row.extendedProps = structuredClone(
                                                lessons.response.data.events[0].extendedProps
                                            );
                                        }
                                    }} />
                            {/if}
                        </div>
                        <!-- delete button -->
                        <div>
                            {#if edit}
                                <button
                                    disabled={!canPerformAction('association.courses.update')}
                                    type="button"
                                    class="btn btn-light-danger font-weight-bold mr-1"
                                    on:click={() => {
                                        swal.fire({
                                            title: 'Sei sicuro?',
                                            text: "Vuoi eliminare l'evento a calendario?",
                                            icon: 'warning',
                                            showCancelButton: true,
                                            confirmButtonText: 'Elimina',
                                            cancelButtonText: 'Annulla',
                                            reverseButtons: true,
                                        }).then(result => {
                                            if (result.isConfirmed) {
                                                jQuery('#addElement').modal('hide');
                                                dispatch('delete', row);
                                            }
                                        });
                                    }}>Elimina</button>
                            {/if}
                            <button
                                type="button"
                                class="btn btn-light-primary font-weight-bold mr-1"
                                on:click={closeModal}>Chiudi</button>
                            <button
                                disabled={!canPerformAction('association.courses.update')}
                                type="submit"
                                class="btn btn-primary font-weight-bold">Salva</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </form>
</Portal>

<svelte:head>
    <style>
        .svelte-select {
            font-size: 13px !important;
            padding-left: 1rem !important;
            border: 0 !important;
            background: #f4f6f9 !important;
            font-size: 13px !important;
            color: #000 !important;
        }
        .svelte-select input:focus {
            border: 0 !important;
            outline: 0 !important;
        }
        .svelte-select input {
            font-size: 13px !important;
            color: #000 !important;
        }
        .svelte-select .selected-item {
            font-size: 13px !important;
        }
        .svelte-select-list {
            z-index: 90000 !important;
        }
        .value-container,
        .selected-item {
            overflow: visible !important;
        }
    </style>
</svelte:head>
