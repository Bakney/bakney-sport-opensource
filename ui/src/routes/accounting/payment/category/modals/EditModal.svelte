<script>
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import Portal from 'svelte-portal';
    import {getDataFromForm} from 'utils/Functions';
    import {onMount} from 'svelte';
    import {toast} from 'svelte-sonner';
    import {SmartSelect} from 'components/formBuilder/preview-blocks';
    import {categoryTypes, vatTypes, deductionTypes} from '../catgoryUtils';

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
                expense: {
                    validators: {
                        notEmpty: {
                            message: 'Seleziona una tipologia di conto.',
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
            message: 'Modifica causale...',
        });

        data.tax_deductible = data.tax_deductible === 'on' ? true : false;
        // update vat management
        data.vat_management = {
            vat: JSON.parse(data['vat_management.vat']).value,
            deduction: JSON.parse(data['vat_management.deduction']).value,
        };
        // remove unused fields
        delete data['vat_management.vat'];
        delete data['vat_management.deduction'];
        // update type
        data.type = JSON.parse(data['type']).value;

        const url = replaceUID(__bakney.env.API.PAYMENT.CATEGORY.UPDATE, row.payment_category_id);

        const res = await apiFetch(url, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
        // spinner stop
        KTApp.unblockPage();

        if (res.status == 200) {
            toast.success('Causale modificata con successo.');
            ktdatable.reload();
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

    onMount(() => {
        jQuery('#type_' + id).selectpicker();
    });
</script>

<!-- svelte-ignore missing-declaration -->
<Portal target="#portal-elements">
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
                        <h5 class="modal-title" id="exampleModalLabel">Modifica causale pagamento</h5>
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
                                    placeholder="Nome" />
                                <!-- <span class="form-text text-muted">Per favore inserisci il nome.</span> -->
                            </div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Movimento<b>*</b></label>
                                <select
                                    bind:value={row.expense}
                                    name="expense"
                                    class="form-control selectpicker form-control-solid form-control-lg"
                                    id="expense_{id}">
                                    <option value={false} data-icon="la la-arrow-up font-size-lg bs-icon"
                                        >Entrata</option>
                                    <option value={true} data-icon="la la-arrow-down font-size-lg bs-icon"
                                        >Uscita</option>
                                </select>
                            </div>
                            <div class="form-group {row.expense ? 'd-none' : ''}">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Detraibile fiscalmente<b>*</b></label>
                                <span class="switch switch-sm switch-icon">
                                    <label>
                                        <input name="tax_deductible" type="checkbox" />
                                        <span />
                                    </label>
                                </span>
                                <div class="d-flex justify-content-start align-items-center mt-2">
                                    <small class="text-muted font-size-sm lh-xs">
                                        Tutti i pagamenti con questa causale saranno segnati come detraibili. L'atleta
                                        potrà produrre un documento fiscale per la dichiarazione del 730.
                                    </small>
                                </div>
                            </div>
                            <div class="form-group">
                                <SmartSelect
                                    customClasses={'p-0'}
                                    editable={false}
                                    active={false}
                                    props={{
                                        id: 'type',
                                        name: 'type',
                                        label: 'Tipologia',
                                        placeholder: 'Seleziona tipologia',
                                        required: true,
                                        options: categoryTypes,
                                        value: row?.type,
                                    }} />
                            </div>
                            <hr />
                            <div class="row px-4 mb-4">
                                <h4 class="text-center font-weight-boldest font-size-h4">Gestione IVA</h4>
                            </div>
                            <div class="form-group d-flex" style="gap: 1rem;">
                                <SmartSelect
                                    customClasses={'w-100'}
                                    editable={false}
                                    active={false}
                                    props={{
                                        id: 'vat_management.vat',
                                        name: 'vat_management.vat',
                                        label: 'Tipo IVA',
                                        placeholder: 'Seleziona tipo IVA',
                                        required: true,
                                        options: vatTypes,
                                        value: row?.vat_management?.vat || 1,
                                    }} />
                                <SmartSelect
                                    customClasses={'w-100'}
                                    editable={false}
                                    active={false}
                                    props={{
                                        id: 'vat_management.deduction',
                                        name: 'vat_management.deduction',
                                        label: 'Tipo detrazione',
                                        placeholder: 'Seleziona tipo detrazione',
                                        required: true,
                                        options: deductionTypes,
                                        value: row?.vat_management?.deduction || 0,
                                    }} />
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
