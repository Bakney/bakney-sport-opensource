<script>
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import Portal from 'svelte-portal';
    import {getDataFromForm} from 'utils/Functions';
    import Select from 'svelte-select';
    import {onMount} from 'svelte';
    import {toast} from 'svelte-sonner';

    export let id;
    export let row;
    export let ktdatable;
    export let suppliers = [];

    let editForm;

    function initForm() {
        editForm?.destroy();
        editForm = FormValidation.formValidation(document.getElementById('form_edit_' + id), {
            fields: {
                invoice_identifier: {
                    validators: {
                        notEmpty: {
                            message: "L'indenfiticativo è obbligatorio.",
                        },
                    },
                },
                expire_date: {
                    validators: {
                        notEmpty: {
                            message: 'La data di scadenza è obbligatoria.',
                        },
                    },
                },
                paid: {
                    validators: {
                        notEmpty: {
                            message: 'Lo stato del pagamento è obbligatorio.',
                        },
                    },
                },
                payment_date: {
                    validators: {
                        notEmpty: {
                            message: 'Seleziona una data.',
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

        data.paid = JSON.parse(data.paid).value || false;
        delete data.payment;
        delete data.supplier;
        delete data.amount;

        const url = replaceUID(__bakney.env.API.INVOICE_SUPPLIERS.UPDATE, id);

        const res = await apiFetch(url, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
        // spinner stop
        KTApp.unblockPage();

        if (res.status == 200) {
            toast.success('Modificato con successo.');
            //ktdatable.reload();
            jQuery('#kt_datatable').KTDatatable('reload');
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
        if (!editForm) initForm();
        editForm?.validate().then(function (status) {
            if (status === 'Valid') {
                update(getDataFromForm(e));
                jQuery('#editModal-' + id).modal('hide');
                ktdatable.reload();
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

    function initializeAddModalComponents() {
        jQuery(`#amount_${id}`).inputmask('9{1,9},9{2}', {
            greedy: false,
            placeholder: '0',
            rightAlign: true,
        });
        jQuery(`#payment_date_${id}`).datetimepicker({
            format: 'L',
            locale: 'it',
            format: 'YYYY-MM-DD',
            useCurrent: true, // workaround the bug that maxDate overwrites defaultDate
            defaultDate: moment(),
        });
        jQuery(`#expire_date_${id}`).datetimepicker({
            format: 'L',
            locale: 'it',
            format: 'YYYY-MM-DD',
            useCurrent: true, // workaround the bug that maxDate overwrites defaultDate
            defaultDate: moment(),
        });
    }

    onMount(() => {
        setTimeout(() => {
            initializeAddModalComponents();
        }, 500);
    });
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
            <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Modifica fattura</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <i aria-hidden="true" class="ki ki-close" />
                        </button>
                    </div>
                    <div class="modal-body" style="overflow-y: visible;">
                        <div class="row p-0">
                            <div class="form-group col-12 col-md-6">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Identificativo<b>*</b></label>
                                <input
                                    value={row.invoice_identifier}
                                    name="invoice_identifier"
                                    type="text"
                                    class="form-control form-control-solid form-control-lg margin-t-2"
                                    placeholder="Identificativo fattura" />
                                <!-- <span class="form-text text-muted">Per favore inserisci il nome.</span> -->
                            </div>

                            <div class="form-group col-12 col-md-6">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Importo<b>*</b></label>
                                <div class="input-group input-group-solid">
                                    <div class="input-group-prepend">
                                        <span class="input-group-text fs-1-1">€</span>
                                    </div>
                                    <input
                                        disabled
                                        value={row.amount}
                                        name="amount"
                                        type="text"
                                        class="form-control fs-1-1"
                                        id="amount_{id}"
                                        placeholder="0,00" />
                                </div>
                            </div>
                        </div>

                        <div class="row p-0">
                            <div class="form-group col-12 col-md-4">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Data pagamento<b>*</b></label>
                                <div
                                    class="input-group input-group-solid date"
                                    id="payment_date_{id}"
                                    data-target-input="nearest">
                                    <input
                                        id="payment_date_{id}"
                                        name="payment_date"
                                        value={row.payment_date}
                                        type="text"
                                        class="form-control form-control-solid form-control-lg datetimepicker-input"
                                        placeholder="Seleziona Data"
                                        data-target="#payment_date_{id}" />
                                    <div
                                        class="input-group-append"
                                        data-target="#payment_date_{id}"
                                        data-toggle="datetimepicker">
                                        <span class="input-group-text">
                                            <i class="ki ki-calendar" />
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div class="form-group col-12 col-md-4">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Data scadenza<b>*</b></label>
                                <div
                                    class="input-group input-group-solid date"
                                    id="expire_date_{id}"
                                    data-target-input="nearest">
                                    <input
                                        id="expire_date_{id}"
                                        name="expire_date"
                                        value={row.expire_date}
                                        type="text"
                                        class="form-control form-control-solid form-control-lg datetimepicker-input"
                                        placeholder="Seleziona Data"
                                        data-target="#expire_date" />
                                    <div
                                        class="input-group-append"
                                        data-target="#expire_date_{id}"
                                        data-toggle="datetimepicker">
                                        <span class="input-group-text">
                                            <i class="ki ki-calendar" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group col-12 col-md-4">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Conto<b>*</b></label>
                                <div>
                                    <input
                                        disabled
                                        style="opacity: .5;pointer-events: none;"
                                        value={row.payment?.custom_account_name.toUpperCase()}
                                        class="form-control form-control-solid form-control-lg margin-t-2" />
                                </div>
                            </div>
                        </div>
                        <div class="row p-0">
                            <div class="form-group col-12 col-md-8">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Fornitore<b>*</b></label>
                                <!-- class="form-control selectpicker form-control-solid form-control-lg" -->
                                <span style="opacity:.5;">
                                    <Select
                                        hideEmptyState={true}
                                        id="supplier"
                                        disabled={true}
                                        value={{
                                            value: row.supplier ? row.supplier?.supplier_id : '',
                                            label: row.supplier ? row.supplier?.name : 'Non definito',
                                        }}
                                        bind:items={suppliers}
                                        placeholder="Seleziona fornitore"
                                        name="supplier" />
                                </span>
                            </div>

                            <div class="form-group col-12 col-md-4">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Pagata<b>*</b></label>
                                <Select
                                    hideEmptyState={true}
                                    items={[
                                        {value: false, label: 'Non pagata'},
                                        {value: true, label: 'Pagata'},
                                    ]}
                                    value={{value: row.paid, label: row.paid ? 'Pagata' : 'Non pagata'}}
                                    id="paid_{id}"
                                    placeholder="Seleziona stato"
                                    name="paid" />
                                <!-- <span class="form-text text-muted">Per favore inserisci il sesso.</span> -->
                            </div>
                        </div>
                        <div class="form-group">
                            {row?.payment?.custom_account_name}
                        </div>
                        <div class="form-group">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label>Note</label>
                            <textarea
                                name="notes"
                                value={row.notes}
                                style="resize: none;"
                                rows="4"
                                class="form-control form-control-solid form-control-lg margin-t-2"
                                placeholder="Aggiungi delle note" />
                            <!-- <span class="form-text text-muted">Per favore inserisci il nome.</span> -->
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
