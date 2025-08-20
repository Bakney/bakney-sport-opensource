<script>
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import Portal from 'svelte-portal';
    import {getDataFromForm} from 'utils/Functions';
    import {onMount, createEventDispatcher} from 'svelte';
    import Select from 'svelte-select';
    import {Info} from 'phosphor-svelte';
    import {canPerformAction} from 'utils/Permissions';

    const dispatch = createEventDispatcher();

    export let instructors = [];
    export let row;

    let selectedInstructor = null;
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
            },
            plugins: {
                trigger: new FormValidation.plugins.Trigger(),
                bootstrap: new FormValidation.plugins.Bootstrap(),
                // submitButton: new FormValidation.plugins.SubmitButton(),
            },
        });
    }

    async function save(data) {
        return dispatch('save', data);
    }

    async function deleteEvent(groupId, before) {
        return dispatch('delete', {
            groupId: groupId || null,
            before: before,
        });
    }

    function handleValidation(e) {
        if (!form) initForm();
        form?.validate().then(function (status) {
            if (status === 'Valid') {
                jQuery('#editEventElement').modal('hide');
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
                }).then(function () {
                    KTUtil.scrollTop();
                });
            }
        });
    }

    function closeModal() {
        dispatch('close');
    }

    onMount(async () => {
        // get element with name instructor
        // let inst = document.getElementById('instructor-select');
        // inst.value = row.extendedProps?.instructor?.value || null;
        // check if row.extendedProps?.instructor is an Array
        if (Array.isArray(row.extendedProps?.instructor)) {
            selectedInstructor = row.extendedProps?.instructor || [];
        } else if (row.extendedProps?.instructor) {
            selectedInstructor = [row.extendedProps?.instructor] || [];
        }
        jQuery('#editEventElement').modal('show');
        jQuery('#editEventElement').on('hidden.bs.modal', function () {
            document.querySelectorAll('#form_add_calendar_event').forEach(item => {
                // delete all
                item.remove();
            });
        });
    });
</script>

<!-- svelte-ignore missing-declaration -->
<!-- Modal-->
<form class="form" id="form_add_calendar_event" on:submit|preventDefault={handleValidation}>
    <div
        class="modal fade"
        id="editEventElement"
        tabindex="-1"
        role="dialog"
        aria-labelledby="staticBackdrop"
        aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Lezione</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" on:click={closeModal}>
                        <i aria-hidden="true" class="ki ki-close" />
                    </button>
                </div>
                <div class="modal-body" style="overflow: visible">
                    <div>
                        <div class="row">
                            <div class="col-12">
                                <div
                                    class="d-flex align-items-center text-bold text-info bg-light-info p-4 mb-4"
                                    style="border-radius: .35rem;">
                                    <Info size={18} weight="duotone" class="mr-2" />
                                    {#if row.allDay == 'on' || row.allDay == true}
                                        La lezione si terrà il giorno {moment(row.start).format('DD/MM/YYYY')}
                                    {:else}
                                        La lezione si terrà il giorno {moment(row.start).format('DD/MM/YYYY')} dalle ore
                                        {moment(row.start).format('HH:mm')} alle ore {moment(row.end).format('HH:mm')}
                                    {/if}
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label>Nome*</label>
                            <input
                                bind:value={row.title}
                                name="event_title"
                                type="text"
                                class="form-control form-control-solid form-control-lg margin-tb-2"
                                placeholder="Nome lezione" />
                        </div>
                        <div class="row mt-2 mb-4">
                            <div class="form-group col-12 mb-0">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label class="font-size-h6 font-weight-bold">Descrizione</label>
                                <textarea
                                    value={row.extendedProps?.description || ''}
                                    class="form-control form-control-solid"
                                    rows="3"
                                    name="description"
                                    label="Descrizione"
                                    placeholder="Inserisci una descrizione" />
                            </div>
                        </div>
                        <div class="form-group" style="z-index:9000">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label>Istruttore lezione</label>
                            <Select
                                hideEmptyState={true}
                                multiple={true}
                                id="instructor-select"
                                bind:items={instructors}
                                placeholder="Seleziona l'istruttore"
                                name="instructor"
                                bind:value={selectedInstructor} />
                        </div>
                    </div>
                    {#if row.extendedProps?.groupId && canPerformAction('association.courses.update')}
                        <div class="row px-4">
                            <!-- vuoi eliminare tutti gli eventi periodici? -->
                            <div
                                class="col-12"
                                style="border: 1px solid #e6e9ee; padding: 1rem 1.5rem; border-radius: 0.55rem;">
                                <h6 class="mb-2">Eliminazione periodici associati</h6>
                                <button
                                    type="button"
                                    class="btn btn-sm btn-light-danger font-weight-bold mb-0 mt-2"
                                    data-dismiss="modal"
                                    on:click={() => {
                                        deleteEvent(row.extendedProps?.groupId);
                                        closeModal();
                                    }}>Tutti</button>
                                <button
                                    type="button"
                                    class="btn btn-sm btn-light-danger font-weight-bold mb-0 mt-2"
                                    data-dismiss="modal"
                                    on:click={() => {
                                        deleteEvent(row.extendedProps?.groupId, false);
                                        closeModal();
                                    }}>Questo e successivi</button>
                                <button
                                    type="button"
                                    class="btn btn-sm btn-light-danger font-weight-bold mb-0 mt-2"
                                    data-dismiss="modal"
                                    on:click={() => {
                                        deleteEvent(row.extendedProps?.groupId, true);
                                        closeModal();
                                    }}>Questo e precedenti</button>
                            </div>
                        </div>
                    {/if}
                </div>
                <div class="modal-footer">
                    <button
                        type="button"
                        disabled={!canPerformAction('association.courses.update')}
                        class="btn btn-light-danger font-weight-bold"
                        data-dismiss="modal"
                        on:click={() => {
                            deleteEvent();
                            closeModal();
                        }}>Elimina</button>
                    <button type="button" class="btn btn-light-primary font-weight-bold" data-dismiss="modal"
                        >Chiudi</button>
                    <button
                        disabled={!canPerformAction('association.courses.update')}
                        type="submit"
                        class="btn btn-primary font-weight-bold">Salva</button>
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
