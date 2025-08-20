<script>
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import Portal from 'svelte-portal';
    import {getDataFromForm} from 'utils/Functions';
    import {onMount, createEventDispatcher} from 'svelte';
    import Select from 'svelte-select';

    const dispatch = createEventDispatcher();

    export let instructors = [];
    export let row;

    let form;

    function initForm() {
        form?.destroy();
        form = FormValidation.formValidation(document.getElementById('form_add_calendar_event'), {
            fields: {
                event_title: {
                    validators: {
                        notEmpty: {
                            message: 'Il nome della lezione è obbligatorio.',
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

    async function save(data) {
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
        dispatch('close');
    }

    onMount(async () => {
        jQuery('#addElement').modal('show');
    });
</script>

<!-- svelte-ignore missing-declaration -->
<!-- Modal-->
<form class="form" id="form_add_calendar_event" on:submit|preventDefault={handleValidation}>
    <div
        class="modal fade"
        id="addElement"
        tabindex="-1"
        role="dialog"
        aria-labelledby="staticBackdrop"
        aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Crea lezione</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" on:click={closeModal}>
                        <i aria-hidden="true" class="ki ki-close" />
                    </button>
                </div>
                <div class="modal-body" style="overflow: visible">
                    <div>
                        <div class="form-group mb-0">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label>Nome*</label>
                            <input
                                name="event_title"
                                type="text"
                                value={'Lezione'}
                                class="form-control form-control-solid form-control-lg margin-tb-2"
                                placeholder="Nome lezione" />
                        </div>
                        <div class="row mt-2 mb-4">
                            <div class="form-group col-12 mb-0">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label class="font-size-h6 font-weight-bold">Descrizione</label>
                                <textarea
                                    value={row.description || ''}
                                    class="form-control form-control-solid"
                                    rows="3"
                                    name="description"
                                    label="Descrizione"
                                    placeholder="Inserisci una descrizione" />
                            </div>
                        </div>
                        <div class="row">
                            <div class="form-group col-12 mb-2">
                                <div style="display: flex; align-items: center; height: 4rem;">
                                    <label class="mb-0 mr-4 font-size-h6 font-weight-bold">Tutto il giorno</label>
                                    <span class="switch switch-icon switch-sm">
                                        <label>
                                            <input
                                                on:click={() => {
                                                    // if allday input convert to date, else convert to datetime
                                                    if (!row.allDay) {
                                                        // convert with moment to YYYY-MM-DD
                                                        // alert(moment(row.start).format('YYYY-MM-DD'));
                                                        let startDate =
                                                            document.querySelector('input[name="event_start"]');
                                                        startDate.type = 'date';
                                                        startDate.value = moment(row.start).format('YYYY-MM-DD');
                                                        let endDate = document.querySelector('input[name="event_end"]');
                                                        endDate.type = 'date';
                                                        endDate.value = null;
                                                    } else {
                                                        let startDate =
                                                            document.querySelector('input[name="event_start"]');
                                                        startDate.type = 'datetime-local';
                                                        startDate.value = moment(row.start).format('YYYY-MM-DDTHH:mm');
                                                        let endDate = document.querySelector('input[name="event_end"]');
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
                            <div class="form-group col-12 col-md-6">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Inizio*</label>
                                <input
                                    name="event_start"
                                    value={row.start}
                                    type="datetime-local"
                                    class="form-control form-control-solid form-control-lg margin-tb-2" />
                            </div>
                            <div class="form-group col-12 col-md-6">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Fine</label>
                                <input
                                    disabled={row.allDay}
                                    style={row.allDay ? 'opacity: 0.5' : ''}
                                    value={row.end}
                                    name="event_end"
                                    type="datetime-local"
                                    class="form-control form-control-solid form-control-lg margin-tb-2" />
                            </div>
                        </div>
                        <div class="form-group" style="z-index:9000">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label>Istruttore lezione</label>
                            <Select
                                hideEmptyState={true}
                                multiple={true}
                                bind:items={instructors}
                                placeholder="Seleziona l'istruttore"
                                name="instructor" />
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button
                        type="button"
                        class="btn btn-light-primary font-weight-bold"
                        data-dismiss="modal"
                        on:click={closeModal}>Chiudi</button>
                    <button type="submit" class="btn btn-primary font-weight-bold">Crea</button>
                </div>
            </div>
        </div>
    </div>
</form>

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
    </style>
</svelte:head>
