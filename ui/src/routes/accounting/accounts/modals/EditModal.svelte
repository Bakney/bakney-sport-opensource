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

    let accountForm;

    function initForm() {
        accountForm?.destroy();
        accountForm = FormValidation.formValidation(document.getElementById('account_form_edit_' + id), {
            fields: {
                name: {
                    validators: {
                        notEmpty: {
                            message: 'Il nome è obbligatorio.',
                        },
                    },
                },
                account_type: {
                    validators: {
                        notEmpty: {
                            message: 'Seleziona una tipologia di conto.',
                        },
                    },
                },
                initial_balance: {
                    validators: {
                        notEmpty: {
                            message: 'Seleziona un bilancio iniziale valido.',
                        },
                    },
                },
                account_code: {
                    validators: {
                        notEmpty: {
                            message: 'Seleziona un bilancio iniziale valido.',
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
            message: 'Modifica conto...',
        });

        data.initial_balance = parseFloat(data.initial_balance.replace(',', '.'));
        data.enabled = data.enabled == 1 ? true : false;

        const url = replaceUID(__bakney.env.API.BALANCE_SHEET_ACCOUNTS.UPDATE, row.custom_account_id);

        const res = await apiFetch(url, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
        // spinner stop
        KTApp.unblockPage();

        if (res.status == 200) {
            ktdatable.reload();
            toast.success('Conto modificato con successo.');
            initElements();
            initForm();
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
        if (!accountForm) initForm();
        accountForm?.validate().then(function (status) {
            if (status === 'Valid') {
                update(getDataFromForm(e));
                jQuery('#editAccountModal-' + id).modal('hide');
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

    function initElements() {
        row.initial_balance = row.initial_balance.replace('.', ',');
        jQuery('#account_type_' + id).selectpicker();
        jQuery('#enabled_' + id).selectpicker();
        setTimeout(() => {
            jQuery('#initial_balance_' + id).inputmask('[-]9{1,9},9{2}', {
                greedy: false,
                placeholder: '0',
                rightAlign: true,
                inputMode: 'decimal',
                definitions: {
                    '-': {
                        validator: '[+-]',
                    },
                },
            });
        }, 500);
    }

    onMount(() => {
        initElements();
    });
</script>

<!-- svelte-ignore missing-declaration -->
<Portal>
    <!-- Modal-->
    <form class="form" id="account_form_edit_{id}" on:submit|preventDefault={handleValidation}>
        <div
            class="modal fade"
            id="editAccountModal-{id}"
            tabindex="-1"
            role="dialog"
            aria-labelledby="staticBackdrop"
            aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Modifica conto economico</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <i aria-hidden="true" class="ki ki-close" />
                        </button>
                    </div>
                    <div class="modal-body">
                        <div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Nome<b>*</b></label>
                                <input
                                    value={row.name}
                                    name="name"
                                    type="text"
                                    class="form-control form-control-solid form-control-lg margin-t-2"
                                    placeholder="Nome"
                                    style="text-transform:capitalize" />
                                <!-- <span class="form-text text-muted">Per favore inserisci il nome.</span> -->
                            </div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Tipologia<b>*</b></label>
                                <select
                                    value={row.account_type}
                                    name="account_type"
                                    class="form-control selectpicker form-control-solid form-control-lg"
                                    id="account_type_{id}">
                                    <option value={1} data-icon="la la-wallet font-size-lg bs-icon">Cassa</option>
                                    <option value={2} data-icon="la la-bank font-size-lg bs-icon">Banca</option>
                                    <option value={3} data-icon="la la-money-bill font-size-lg bs-icon">Altro</option>
                                </select>
                                <!-- <span class="form-text text-muted">Per favore inserisci il sesso.</span> -->
                            </div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Stato<b>*</b></label>
                                <select
                                    value={row.enabled ? 1 : 0}
                                    name="enabled"
                                    class="form-control selectpicker form-control-solid form-control-lg"
                                    id="enabled_{id}">
                                    <option value={1} data-icon="la la-check font-size-lg bs-icon">Attivo</option>
                                    <option value={0} data-icon="la la-times font-size-lg bs-icon">Disattivato</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Saldo Iniziale<b>*</b></label>
                                <div class="input-group input-group-solid">
                                    <div class="input-group-prepend">
                                        <span class="input-group-text fs-1-1">€</span>
                                    </div>
                                    <input
                                        value={row.initial_balance}
                                        name="initial_balance"
                                        type="text"
                                        class="form-control fs-1-1"
                                        id="initial_balance_{id}"
                                        placeholder="0,00" />
                                </div>
                            </div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Codice<b>*</b></label>
                                <input
                                    value={row.account_code}
                                    name="account_code"
                                    type="text"
                                    class="form-control form-control-solid form-control-lg margin-t-2"
                                    placeholder="Codice"
                                    style="text-transform:uppercase" />
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
