<script>
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import Portal from 'svelte-portal';
    import {getDataFromForm} from 'utils/Functions';
    import Datepicker from 'components/inputs/Datepicker.svelte';
    import {toBase64} from 'utils/Functions.js';
    import {toast} from 'svelte-sonner';

    export let id;
    export let row;
    export let ktdatable;

    let updateForm;

    function initForm() {
        updateForm?.destroy();
        updateForm = FormValidation.formValidation(document.getElementById('form_edit' + id), {
            fields: {
                start_date: {
                    validators: {
                        notEmpty: {
                            message: 'La data non può essere vuota.',
                        },
                        // date validation
                        regexp: {
                            regexp: '^[0-9]{4}-[0-9]{2}-[0-9]{2}$',
                            flags: 'ig',
                            message: 'La data non è valida',
                        },
                        date: {
                            format: 'YYYY-MM-DD',
                            message: 'La data deve essere nel formato YYYY-MM-DD',
                        },
                    },
                },
                end_date: {
                    validators: {
                        notEmpty: {
                            message: 'La data non può essere vuota.',
                        },
                        // date validation
                        regexp: {
                            regexp: '^[0-9]{4}-[0-9]{2}-[0-9]{2}$',
                            flags: 'ig',
                            message: 'La data non è valida',
                        },
                        date: {
                            format: 'YYYY-MM-DD',
                            message: 'La data deve essere nel formato YYYY-MM-DD',
                        },
                        callback: {
                            message: 'Deve essere successiva o uguale alla data di inizio.',
                            callback: function (input) {
                                return moment(input.value).isSameOrAfter(
                                    moment(updateForm.elements.start_date[0].value),
                                    'day'
                                );
                            },
                        },
                    },
                },
                title: {
                    validators: {
                        notEmpty: {
                            message: 'Il titolo non può essere vuoto.',
                        },
                    },
                },
                description: {
                    validators: {
                        notEmpty: {
                            message: 'La descrizione non può essere vuota.',
                        },
                    },
                },
                open_to: {
                    validators: {
                        notEmpty: {
                            message: 'Seleziona chi può iscriversi.',
                        },
                    },
                },
            },
            plugins: {
                trigger: new FormValidation.plugins.Trigger(),
                bootstrap: new FormValidation.plugins.Bootstrap(),
            },
        });
    }

    async function update(data) {
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Modifica...',
        });

        const url = replaceUID(__bakney.env.API.EVENT.UPDATE, row.event_id);
        data.locandina = row.locandina;

        const res = await apiFetch(url, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
        // spinner stop
        KTApp.unblockPage();

        if (res.status == 200) {
            toast.success('Modificato con successo.');
            ktdatable.reload();
        } else {
            swal.fire({
                target: '#portal-elements',
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
    }

    function handleValidation(e) {
        if (!updateForm) initForm();
        updateForm?.validate().then(function (status) {
            if (status === 'Valid') {
                update(getDataFromForm(e));
                jQuery('#editModal-' + id).modal('hide');
            } else {
                swal.fire({
                    target: '#portal-elements',
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

<!-- svelte-ignore missing-declaration -->
<Portal target="#portal-elements">
    <!-- Modal-->
    <form class="form" id="form_edit{id}" on:submit|preventDefault={handleValidation}>
        <div
            class="modal fade"
            id="editModal-{id}"
            tabindex="-1"
            role="dialog"
            aria-labelledby="staticBackdrop"
            aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Modifica fornitore</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <i aria-hidden="true" class="ki ki-close" />
                        </button>
                    </div>
                    <div class="modal-body">
                        <div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Titolo<b>*</b></label>
                                <input
                                    name="title"
                                    bind:value={row.title}
                                    type="text"
                                    class="form-control form-control-solid form-control-lg margin-t-2"
                                    placeholder="Titolo dell'evento che stai per organizzare" />
                                <!-- <span class="form-text text-muted">Per favore inserisci il nome.</span> -->
                            </div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Descrizione<b>*</b></label>
                                <textarea
                                    name="description"
                                    style="resize: none;"
                                    bind:value={row.description}
                                    rows="4"
                                    class="form-control form-control-solid form-control-lg margin-t-2"
                                    placeholder="Descrivi l'evento che stai per organizzare" />
                                <!-- <span class="form-text text-muted">Per favore inserisci il nome.</span> -->
                            </div>
                            <div class="row p-0">
                                <div class="form-group col-12 col-md-4 px-0 px-md-4">
                                    <!-- svelte-ignore a11y-label-has-associated-control -->
                                    <label>Data inizio evento<b>*</b></label>
                                    <Datepicker id="start_date" name="start_date" random={id} value={row.start_date} />
                                </div>
                                <div class="form-group col-12 col-md-4 px-0 px-md-4">
                                    <!-- svelte-ignore a11y-label-has-associated-control -->
                                    <label>Data fine evento<b>*</b></label>
                                    <Datepicker id="end_date" name="end_date" random={id} value={row.end_date} />
                                </div>
                                <div class="form-group col-12 col-md-4 px-0 px-md-4">
                                    <!-- svelte-ignore a11y-label-has-associated-control -->
                                    <label>Chi si può iscrivere?<b>*</b></label>
                                    <div>
                                        <select
                                            bind:value={row.subscription_type}
                                            name="open_to"
                                            class="form-control selectpicker form-control-solid form-control-lg"
                                            id="open_to">
                                            <option value={1}>Tutti</option>
                                            <option value={2}>Solo tesserati</option>
                                        </select>
                                    </div>
                                </div>
                                {#each row.subscription_types as event_type}
                                    <div
                                        style="padding: 1rem 0rem !important; border: 2px dashed #e4e6ef; border-radius: 1rem; margin: .5rem 1rem; background: #fff;"
                                        class="row p-0 d-flex align-items-center w-100 p-2 text-center">
                                        <div class="col-12 col-md-6">
                                            <span class="input input-solid font-weight-bold"
                                                >{Number(event_type.amount).toLocaleString('it-IT', {
                                                    style: 'currency',
                                                    currency: 'EUR',
                                                    minimumFractionDigits: 2,
                                                })}</span>
                                        </div>
                                        <div class="col-12 col-md-5">
                                            Certificato medico {event_type.medical_certificate_required ? '' : 'non'} richiesto
                                        </div>
                                    </div>
                                {/each}
                                <div class="form-group col-12">
                                    <!-- svelte-ignore a11y-label-has-associated-control -->
                                    <label>Locandina</label>

                                    <div class="custom-file">
                                        <input
                                            type="file"
                                            id="locandina-{id}"
                                            name="locandina-{id}"
                                            accept="image/png, image/jpeg"
                                            on:change={async () => {
                                                const file = document.querySelector('#locandina-' + id).files[0];
                                                let base64 = await toBase64(file);
                                                row.locandina = base64;
                                                document.querySelector('#locandina-preview-' + id).src = base64;
                                                document.querySelector('#locandina-preview-' + id).alt = file.name;
                                                document.querySelector('#locandina-preview-' + id).style.display =
                                                    'block';
                                            }} />
                                        <label class="custom-file-label" for="locandina-{id}"
                                            >Scegli il file della locandina</label>
                                    </div>
                                </div>
                                <div class="form-group m-auto" id="locandina-preview-container-{id}">
                                    <!-- svelte-ignore a11y-label-has-associated-control -->
                                    <div class="d-flex">
                                        <img
                                            class="mr-0 border-0"
                                            width="200"
                                            id="locandina-preview-{id}"
                                            style={!row.locandina ? 'display: none;' : ''}
                                            src={row.locandina}
                                            alt="" />
                                        {#if !row.locandina}
                                            Nessuna locandina caricata.
                                        {/if}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-light-primary font-weight-bold" data-dismiss="modal"
                            >Chiudi</button>
                        <button type="submit" class="btn btn-primary font-weight-bold">Salva</button>
                    </div>
                </div>
            </div>
        </div>
    </form>
</Portal>
