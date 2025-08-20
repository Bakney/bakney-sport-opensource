<script>
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import Portal from 'svelte-portal';
    import {getDataFromForm} from 'utils/Functions';
    import {onMount} from 'svelte';
    import Select from 'svelte-select';
    import {toast} from 'svelte-sonner';

    export let id;
    export let ktdatable;
    export let subscriptions;

    let form;

    function initForm() {
        form?.destroy();
        form = FormValidation.formValidation(document.getElementById('form_add_carnet'), {
            fields: {},
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
            message: 'Operazione in corso...',
        });

        let subscriptionId = JSON.parse(data.subscription_id)?.value;

        const url = replaceUID(replaceUID(__bakney.env.API.CARNET.ASSIGN, id), subscriptionId, '<sub_uid>');

        const res = await apiFetch(url, {
            method: 'POST',
        });
        // spinner stop
        KTApp.unblockPage();

        if (res.status == 200) {
            toast.success('Completato con successo.');
            setTimeout(() => {
                window.location.reload();
            }, 500);
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
    }

    function handleValidation(e) {
        if (!form) initForm();
        form?.validate().then(function (status) {
            if (status === 'Valid') {
                jQuery('addCarnetAssociation').modal('hide');
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

    onMount(() => {
        jQuery('#type_' + id).selectpicker();
    });
</script>

<!-- svelte-ignore missing-declaration -->
<Portal>
    <!-- Modal-->
    <form class="form" id="form_add_carnet" on:submit|preventDefault={handleValidation}>
        <div
            class="modal fade"
            id="addCarnetAssociation"
            tabindex="-1"
            role="dialog"
            aria-labelledby="staticBackdrop"
            aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Assegna un carnet</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <i aria-hidden="true" class="ki ki-close" />
                        </button>
                    </div>
                    <div class="modal-body">
                        <div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Associa carnet a</label>
                                <Select
                                    hideEmptyState={true}
                                    bind:items={subscriptions}
                                    placeholder="Seleziona l'associato"
                                    name="subscription_id" />
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-light-primary font-weight-bold" data-dismiss="modal"
                            >Chiudi</button>
                        <button type="submit" class="btn btn-primary font-weight-bold">Aggiungi</button>
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
    </style>
</svelte:head>
