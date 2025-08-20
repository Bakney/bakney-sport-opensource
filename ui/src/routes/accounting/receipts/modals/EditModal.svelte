<script>
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import Portal from 'svelte-portal';
    import {getDataFromForm} from 'utils/Functions';
    import {createEventDispatcher, onMount} from 'svelte';
    import {toast} from 'svelte-sonner';

    const dispatch = createEventDispatcher();

    export let id;
    export let row;
    export let ktdatable;

    let editForm;
    let selectedTutor;

    function initForm() {
        editForm?.destroy();
        editForm = FormValidation.formValidation(document.getElementById('form_edit_' + id), {
            fields: {
                number: {
                    validators: {
                        notEmpty: {
                            message: 'Inserisci un numero valido.',
                        },
                        integer: {
                            message: 'Inserisci un numero valido.',
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

    async function update(data) {
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Modifica in corso...',
        });

        const url = replaceUID(__bakney.env.API.INVOICE.UPDATE, id);
        // if tutor is not a number
        if (isNaN(data.tutor)) {
            delete data.tutor;
        }

        if (selectedTutor) {
            data.selected_tutor = selectedTutor;
        }

        // if switch on set to true
        data.cancelled = data.cancelled == 'on' ? true : false;

        const res = await apiFetch(url, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
        // spinner stop
        KTApp.unblockPage();

        if (res.status == 200) {
            toast.success('Modificato con successo.');
            dispatch('update', {invoice: res.response.invoice});
        } else {
            toast.error('Si è verificato un errore.');
        }
        ktdatable?.reload();
    }

    function handleValidation(e) {
        if (!editForm) initForm();
        editForm?.validate().then(function (status) {
            if (status === 'Valid') {
                update(getDataFromForm(e));
                jQuery('#editModal-' + id).modal('hide');
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

    onMount(() => {
        row.payment.payment_date = moment(row.payment.payment_date).format('YYYY-MM-DD');
    });
</script>

<!-- svelte-ignore missing-declaration -->
<Portal target="#portal-elements-foreground">
    <!-- Modal-->
    <form class="form" id="form_edit_{id}" on:submit|preventDefault={handleValidation}>
        <div
            class="modal fade"
            id="editModal-{id}"
            tabindex="-1"
            role="dialog"
            aria-labelledby="staticBackdrop"
            aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Modifica ricevuta</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <i aria-hidden="true" class="ki ki-close" />
                        </button>
                    </div>
                    <div class="modal-body">
                        <div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Numero</label>
                                <input
                                    name="number"
                                    class="form-control form-control-solid form-control-lg margin-tb-2"
                                    type="number"
                                    bind:value={row.number} />
                                <!-- <span class="form-text text-muted">Per favore inserisci il nome.</span> -->
                            </div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Data ricevuta</label>
                                <input
                                    name="payment_date"
                                    class="form-control form-control-solid form-control-lg margin-tb-2"
                                    type="date"
                                    bind:value={row.payment.payment_date} />
                                <span class="form-text text-muted">Verrà modificata anche la data di pagamento.</span>
                            </div>
                            {#if row.payment?.associate?.available_tutors?.length > 0}
                                <div class="form-group">
                                    <label class="mr-2">Cambia tutore</label>
                                    <select
                                        name="tutor"
                                        class="form-control form-control-solid form-control-lg margin-tb-2"
                                        on:change={e => {
                                            selectedTutor = e.target.value;
                                        }}
                                        value={row.payment.associate.available_tutors[0]?.tutor?.associate_id}>
                                        {#each row.payment.associate.available_tutors as tutor}
                                            <option value={tutor.tutor.associate_id}
                                                >{tutor.tutor.first_name} {tutor.tutor.last_name}</option>
                                        {/each}
                                    </select>
                                </div>
                            {/if}
                        </div>
                        <div>
                            <div class="form-group d-flex justify-content-start align-items-baseline">
                                <div class="d-flex align-items-center">
                                    <span class="switch switch-solid switch-icon switch-light-primary">
                                        <label>
                                            <input type="checkbox" bind:checked={row.cancelled} name="cancelled" />
                                            <span />
                                        </label>
                                    </span>
                                    <span class="ml-2 font-weight-bold">Annulla Ricevuta (senza eliminarla)</span>
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
