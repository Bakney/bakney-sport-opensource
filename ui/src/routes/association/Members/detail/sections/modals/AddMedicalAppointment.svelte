<script>
    import RadioSelect from 'components/formBuilder/preview-blocks/radio-select.svelte';
    import TextInput from 'components/inputs/TextInput.svelte';
    import BasicModal from 'components/modals/BasicModal.svelte';
    import {userData} from 'store/stores';
    import {createEventDispatcher} from 'svelte';
    import {toast} from 'svelte-sonner';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import {getDataFromForm} from 'utils/Functions';

    const dispatch = createEventDispatcher();

    userData.useLocalStorage();

    export let id;
    export let show;
    export let loading = false;
    export let datatable;

    let hideBack = false;
    let selectedType = 'non-agonistica';
    let form;

    let appointmentsTypes = {
        // 'Visita Agonistica Emilia Romagna': 'agonistica-emilia-romagna',
        // 'Visita Agonistica Lombardia': 'agonistica-lombardia',
        // 'Visita Agonistica Piemonte': 'agonistica-piemonte',
        'Visita Agonistica Piemonte Biella': 'agonistica-piemonte-biella',
        // 'Visita Agonistica Sicilia': 'agonistica-sicilia',
        // 'Visita Agonistica Toscana': 'agonistica-toscana',
        'Visita Agonistica': 'agonistica',
        // 'Visita Non Agonistica Emilia Romagna': 'non-agonistica-emilia-romagna',
        // 'Visita Non Agonistica Sicilia': 'non-agonistica-sicilia',
        'Visita Non Agonistica': 'non-agonistica',
    };

    function initForm() {
        form?.destroy();
        form = FormValidation.formValidation(document.getElementById('add-medical-appointment'), {
            fields: {
                date: {
                    validators: {
                        notEmpty: {
                            message: 'Seleziona una data.',
                        },
                        date: {
                            format: 'YYYY-MM-DD',
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

    async function create(data) {
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Aggiunta in corso...',
        });

        if (data?.meta) {
            let metaOptions = data?.meta.split(',');
            data.meta = {};
            for (let option in metaOptions) {
                data.meta[metaOptions[option]] = true;
            }
        }

        data.date = moment(data.date).format('DD/MM/YYYY');

        const url = replaceUID(__bakney.env.API.SUBSCRIPTION.MEDICAL_APPOINTMENTS.ADD, id);

        const res = await apiFetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
        });

        if (res.status == 200) {
            toast.success('Visita medica aggiunta con successo.');
            datatable?.reload();
        } else {
            swal.fire({
                text: 'Scusa, ho individuato degli errori, riprova.',
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

        setTimeout(() => {
            // spinner stop
            KTApp.unblockPage();
        }, 500);
    }

    function handleValidation(e) {
        if (!form) initForm();
        form?.validate().then(function (status) {
            if (status === 'Valid') {
                create(getDataFromForm(e));
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
</script>

<div class={hideBack ? 'd-none' : ''}>
    <BasicModal
        id={`add-medical-appointment`}
        bind:show
        title="Visita Medica"
        showActionButton={true}
        scrollable={true}
        modalSize={'md'}
        showFooter={false}
        dataHeight={50}>
        <form on:submit|preventDefault={handleValidation}>
            {#if !loading}
                <div class="pt-4">
                    <h1 class="mb-8">Aggiungi visita medica</h1>
                    <div style="max-height:500px;">
                        <div class="row p-0">
                            <div class="form-group col-12">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Data<b>*</b></label>
                                <input
                                    value={moment().format('YYYY-MM-DD') || ''}
                                    name="date"
                                    type="date"
                                    class="form-control form-control-solid form-control-lg"
                                    placeholder="Seleziona Data" />
                            </div>
                            <div class="form-group col-12">
                                <label for="region">Tipo di visita medica<b>*</b></label>
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <select
                                    class="form-control form-control-solid form-control-lg"
                                    name="region"
                                    bind:value={selectedType}>
                                    {#each Object.keys(appointmentsTypes) as appointmentType}
                                        <option value={appointmentsTypes[appointmentType]}>{appointmentType}</option>
                                    {/each}
                                </select>
                            </div>
                            {#if selectedType === 'agonistica'}
                                <div class="form-group col-12">
                                    <p class="font-weight-bold text-warning bg-light-warning py-2 px-4 rounded-lg mb-4">
                                        Per le visite mediche agonistiche puoi già barrare l'opzione
                                    </p>
                                    <div class="border rounded-lg">
                                        <RadioSelect
                                            editable={false}
                                            props={{
                                                id: 'select-agonistica-meta',
                                                required: false,
                                                label: "Seleziona un'opzione",
                                                name: 'meta',
                                                options: [
                                                    {
                                                        id: 'first_affiliation',
                                                        label: 'Prima affiliazione',
                                                        value: 'first_affiliation',
                                                    },
                                                    {
                                                        id: 'renewal',
                                                        label: 'Rinnovo',
                                                        value: 'renewal',
                                                    },
                                                ],
                                            }} />
                                    </div>
                                </div>
                            {/if}
                            <div class="form-group col-12 mb-0">
                                <TextInput
                                    name="sport"
                                    label="Sport"
                                    placeholder="Inserisci Sport"
                                    required={false}
                                    helperLabel="Inserisci lo sport per cui vuoi richiedere la visita medica." />
                            </div>
                            {#if selectedType == 'agonistica-piemonte-biella'}
                                <div class="form-group col-12">
                                    <!-- svelte-ignore a11y-label-has-associated-control -->
                                    <label>Data compilazione<b>*</b></label>
                                    <input
                                        value={moment().format('YYYY-MM-DD HH:mm') || ''}
                                        name="creation_date"
                                        type="datetime-local"
                                        class="form-control form-control-solid form-control-lg"
                                        placeholder="Seleziona la data e l'ora di compilazione" />
                                </div>
                                <div class="form-group col-12 mb-0">
                                    <TextInput
                                        value={$userData.sport_association.address_city}
                                        name="address"
                                        label="Indirizzo compilazione"
                                        placeholder="Inserisci indirizzo compilazione"
                                        required={false}
                                        helperLabel="Inserisci la città." />
                                </div>
                            {/if}
                        </div>
                    </div>
                </div>
            {:else}
                <div class="text-center py-20 d-flex justify-content-center">
                    <div class="spinner spinner-primary spinner-lg" />
                </div>
            {/if}

            <div class="modal-footer px-0 pb-2">
                <button
                    type="button"
                    class="btn btn-secondary"
                    on:click={() => {
                        show = false;
                    }}>Annulla</button>
                <button
                    type="submit"
                    class="btn btn-primary font-weight-boldest"
                    on:click={() => {
                        show = false;
                    }}
                    >Crea
                </button>
            </div>
        </form>
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
