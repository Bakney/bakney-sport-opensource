<script>
    import {
        Currency,
        Datepicker,
        NumberInput,
        TextArea,
        TextInput,
    } from 'components/formBuilder/preview-blocks/index.js';
    import {getDataFromForm} from 'utils/Functions.js';
    import {createEventDispatcher} from 'svelte';

    const dispatch = createEventDispatcher();

    export let id;
    export let data;

    export let show = false;
    export let isInModal = false;

    let campsAndRetreatsForm;

    export let handleValidation = function (e) {
        if (!campsAndRetreatsForm) initForm();
        campsAndRetreatsForm?.validate().then(function (status) {
            if (status === 'Valid') {
                dispatch('sumbit', {
                    valid: true,
                    data: getDataFromForm(e),
                });
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
    };

    function initForm() {
        campsAndRetreatsForm?.destroy();
        campsAndRetreatsForm = FormValidation.formValidation(
            document.getElementById('camps_and_retreats_periods_form'),
            {
                fields: {
                    start_date: {
                        validators: {
                            notEmpty: {
                                message: 'La data di inizio è obbligatoria.',
                            },
                        },
                    },
                    end_date: {
                        validators: {
                            notEmpty: {
                                message: 'La data di fine è obbligatoria.',
                            },
                        },
                    },
                    fee: {
                        validators: {
                            notEmpty: {
                                message: 'La quota di partecipazione è obbligatoria.',
                            },
                        },
                    },
                    title: {
                        validators: {
                            notEmpty: {
                                message: 'Il nome è obbligatorio.',
                            },
                        },
                    },
                    description: {
                        validators: {
                            notEmpty: {
                                message: 'La descrizione è obbligatoria.',
                            },
                        },
                    },
                },
                plugins: {
                    trigger: new FormValidation.plugins.Trigger(),
                    bootstrap: new FormValidation.plugins.Bootstrap(),
                    // submitButton: new FormValidation.plugins.SubmitButton(),
                },
            }
        );
    }
</script>

<form id="camps_and_retreats_periods_form" on:submit|preventDefault={handleValidation}>
    <input type="hidden" name="camps_and_retreats" value={id} />
    <div class="text-left">
        <div class="row px-0 mx-0">
            <div class="col-12 col-md-6">
                <Datepicker
                    customClasses={'pl-4 my-4'}
                    editable={false}
                    active={false}
                    props={{
                        id: 'start_date',
                        name: 'start_date',
                        label: 'Data di inizio',
                        placeholder: 'Seleziona data',
                        format: 'DD/MM/YYYY',
                        required: true,
                        value: data?.start_date,
                    }} />
            </div>
            <div class="col-12 col-md-6">
                <Datepicker
                    customClasses={'pr-4 my-4'}
                    editable={false}
                    active={false}
                    props={{
                        id: 'end_date',
                        name: 'end_date',
                        label: 'Data di fine',
                        format: 'DD/MM/YYYY',
                        placeholder: 'Seleziona data',
                        required: true,
                        value: data?.end_date,
                    }} />
            </div>
        </div>
        <div class="row px-0 mx-0">
            <div class="col-12 col-md-6">
                <Currency
                    customClasses={'pl-4 my-4'}
                    editable={false}
                    active={false}
                    props={{
                        id: 'fee',
                        name: 'fee',
                        label: 'Quota di partecipazione',
                        placeholder: 'Inserisci la quota di partecipazione',
                        required: true,
                        value: data?.fee || null,
                    }} />
            </div>
            <div class="col-12 col-md-6">
                <NumberInput
                    customClasses={'pr-4 my-4'}
                    editable={false}
                    active={false}
                    props={{
                        id: 'max_participants',
                        name: 'max_participants',
                        label: 'Numero massimo di partecipanti',
                        placeholder: 'Inserisci il numero massimo di partecipanti',
                        helperLabel: 'Lascia vuoto per non limitare il numero di partecipanti',
                        required: false,
                        value: data?.max_participants || null,
                    }} />
            </div>
        </div>
        <TextInput
            customClasses={'px-4 mx-4 my-4'}
            editable={false}
            active={false}
            props={{
                id: 'title',
                name: 'title',
                label: 'Titolo',
                placeholder: 'Inserisci il nome della settimana/periodo',
                required: true,
                value: data?.title,
            }} />
        <TextArea
            customClasses={'px-4 mx-4 my-4'}
            editable={false}
            active={false}
            props={{
                id: 'description',
                name: 'description',
                label: 'Descrizione',
                placeholder: 'Inserisci la descrizione del settimana/periodo',
                required: true,
                value: data?.description,
            }} />
    </div>
    {#if isInModal}
        <div class="modal-footer d-flex justify-content-end mt-2">
            <button type="button" class="btn btn-light-primary font-weight-bold" on:click={() => (show = false)}>
                Annulla
            </button>
            <button type="submit" class="btn btn-primary font-weight-bold">Crea</button>
        </div>
    {/if}
    <slot name="footer" />
</form>
