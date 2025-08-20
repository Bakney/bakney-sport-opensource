<script>
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import Portal from 'svelte-portal';
    import {getDataFromForm} from 'utils/Functions';
    import {createEventDispatcher} from 'svelte';
    import {toast} from 'svelte-sonner';

    const dispatch = createEventDispatcher();

    export let id;
    export let row;

    let editForm;

    function initForm() {
        editForm?.destroy();
        editForm = FormValidation.formValidation(document.getElementById('form_edit_' + id), {
            fields: {
                lessons_left: {
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

        data.lessons_left = parseInt(data.lessons_left);

        const url = replaceUID(__bakney.env.API.CARNET_SUBSCRIPTION.UPDATE, id);

        const res = await apiFetch(url, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
        // spinner stop
        KTApp.unblockPage();

        if (res.status == 200) {
            dispatch('update');
            toast.success('Modificato con successo.');
            jQuery(`#editModal-${id}`).modal('hide');
        } else {
            toast.error(res.response?.msg || 'Errore durante la modifica.');
        }
    }

    function handleValidation(e) {
        if (!editForm) initForm();
        editForm?.validate().then(function (status) {
            if (status === 'Valid') {
                update(getDataFromForm(e));
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

<!-- svelte-ignore missing-declaration -->
<Portal>
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
                        <h5 class="modal-title" id="exampleModalLabel">Modifica presenze</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <i aria-hidden="true" class="ki ki-close" />
                        </button>
                    </div>
                    <div class="modal-body">
                        <div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Lezioni rimanenti</label>
                                <input
                                    name="lessons_left"
                                    class="form-control form-control-solid form-control-lg margin-tb-2"
                                    type="number"
                                    bind:value={row.lessons_left} />
                                <!-- <span class="form-text text-muted">Per favore inserisci il nome.</span> -->
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
