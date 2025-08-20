<script>
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import Portal from 'svelte-portal';
    import {getDataFromForm} from 'utils/Functions';
    import {toast} from 'svelte-sonner';

    export let id;
    export let row;
    export let ktdatable;

    let updateForm;

    function initForm() {
        updateForm?.destroy();
        updateForm = FormValidation.formValidation(document.getElementById('form_edit' + id), {
            fields: {
                name: {
                    validators: {
                        notEmpty: {
                            message: 'Il nome è obbligatorio.',
                        },
                        stringLength: {
                            max: 255,
                            message: 'Il nome non può superare i 255 caratteri.',
                        },
                    },
                },
                address: {
                    validators: {
                        stringLength: {
                            max: 255,
                            message: "L'indirizzo non può superare i 255 caratteri.",
                        },
                    },
                },
                tax_code: {
                    validators: {
                        stringLength: {
                            max: 30,
                            message: 'Il codice fiscale non può superare i 30 caratteri.',
                        },
                    },
                },
                vat_number: {
                    validators: {
                        stringLength: {
                            max: 30,
                            message: 'La partita IVA non può superare i 30 caratteri.',
                        },
                    },
                },
                email: {
                    validators: {
                        emailAddress: {
                            message: 'Inserisci un indirizzo email valido.',
                        },
                    },
                },
                phone_number: {
                    validators: {
                        stringLength: {
                            max: 20,
                            message: 'Il numero di telefono non può superare i 20 caratteri.',
                        },
                    },
                },
                city: {
                    validators: {
                        stringLength: {
                            max: 100,
                            message: 'La città non può superare i 100 caratteri.',
                        },
                    },
                },
                cap: {
                    validators: {
                        stringLength: {
                            max: 10,
                            message: 'Il CAP non può superare i 10 caratteri.',
                        },
                    },
                },
                state: {
                    validators: {
                        stringLength: {
                            max: 50,
                            message: 'La provincia non può superare i 50 caratteri.',
                        },
                    },
                },
                country: {
                    validators: {
                        stringLength: {
                            max: 50,
                            message: 'Il paese non può superare i 50 caratteri.',
                        },
                    },
                },
                nationality: {
                    validators: {
                        stringLength: {
                            max: 100,
                            message: 'La nazionalità non può superare i 100 caratteri.',
                        },
                    },
                },
                note: {
                    validators: {
                        stringLength: {
                            max: 1000,
                            message: 'Le note non possono superare i 1000 caratteri.',
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
            message: 'Modifica...',
        });

        const url = replaceUID(__bakney.env.API.SUPPLIER.UPDATE, row.supplier_id);

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
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" role="document">
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
                                <label>Nome<b>*</b></label>
                                <input
                                    value={row.name}
                                    name="name"
                                    type="text"
                                    class="form-control form-control-solid form-control-lg margin-t-2"
                                    placeholder="Nome"
                                    style="text-transform:capitalize" />
                            </div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Indirizzo</label>
                                <input
                                    value={row.address}
                                    name="address"
                                    type="text"
                                    class="form-control form-control-solid form-control-lg margin-t-2"
                                    placeholder="Indirizzo"
                                    style="text-transform:capitalize" />
                            </div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>P.IVA / Codice fiscale</label>
                                <input
                                    value={row.tax_code}
                                    name="tax_code"
                                    type="text"
                                    class="form-control form-control-solid form-control-lg margin-t-2"
                                    placeholder="P.IVA / Codice fiscale"
                                    style="text-transform:uppercase" />
                            </div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Partita IVA</label>
                                <input
                                    value={row.vat_number || ''}
                                    name="vat_number"
                                    type="text"
                                    class="form-control form-control-solid form-control-lg margin-t-2"
                                    placeholder="Partita IVA"
                                    style="text-transform:uppercase" />
                            </div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Tipo</label>
                                <select name="type" class="form-control form-control-solid form-control-lg margin-t-2">
                                    <option value="supplier" selected={row.type === 'supplier'}>Fornitore</option>
                                    <option value="customer" selected={row.type === 'customer'}>Cliente</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Email</label>
                                <input
                                    value={row.email || ''}
                                    name="email"
                                    type="email"
                                    class="form-control form-control-solid form-control-lg margin-t-2"
                                    placeholder="Email" />
                            </div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Telefono</label>
                                <input
                                    value={row.phone_number || ''}
                                    name="phone_number"
                                    type="text"
                                    class="form-control form-control-solid form-control-lg margin-t-2"
                                    placeholder="Telefono" />
                            </div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Città</label>
                                <input
                                    value={row.city || ''}
                                    name="city"
                                    type="text"
                                    class="form-control form-control-solid form-control-lg margin-t-2"
                                    placeholder="Città"
                                    style="text-transform:capitalize" />
                            </div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>CAP</label>
                                <input
                                    value={row.cap || ''}
                                    name="cap"
                                    type="text"
                                    class="form-control form-control-solid form-control-lg margin-t-2"
                                    placeholder="CAP" />
                            </div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Provincia</label>
                                <input
                                    value={row.state || ''}
                                    name="state"
                                    type="text"
                                    class="form-control form-control-solid form-control-lg margin-t-2"
                                    placeholder="Provincia"
                                    style="text-transform:capitalize" />
                            </div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Paese</label>
                                <input
                                    value={row.country || 'Italia'}
                                    name="country"
                                    type="text"
                                    class="form-control form-control-solid form-control-lg margin-t-2"
                                    placeholder="Paese"
                                    style="text-transform:capitalize" />
                            </div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Nazionalità</label>
                                <input
                                    value={row.nationality || 'Italiana'}
                                    name="nationality"
                                    type="text"
                                    class="form-control form-control-solid form-control-lg margin-t-2"
                                    placeholder="Nazionalità"
                                    style="text-transform:capitalize" />
                            </div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Note</label>
                                <textarea
                                    name="note"
                                    class="form-control form-control-solid form-control-lg margin-t-2"
                                    placeholder="Note"
                                    rows="3">{row.note || ''}</textarea>
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
