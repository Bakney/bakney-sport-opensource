<script>
    import {onMount, createEventDispatcher} from 'svelte';
    import {toast} from 'svelte-sonner';
    import {getDataFromForm} from 'utils/Functions';
    import BottomBarFixedSave from 'components/inputs/BottomBarFixedSave.svelte';
    import {Warning, Phone, User} from 'phosphor-svelte';
    import {TextInput, SmartSelect, TextArea} from 'components/formBuilder/preview-blocks/index.js';
    import TipTapEditor from 'components/inputs/TipTapEditor.svelte';

    export let supplierData = {};
    export let width = '85vw';
    export let disableSave = false;

    const dispatch = createEventDispatcher();
    let supplierForm;

    onMount(() => {
        initForm();
    });

    function initForm() {
        supplierForm?.destroy();
        supplierForm = FormValidation.formValidation(document.getElementById('supplier_form'), {
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
                type: {
                    validators: {
                        notEmpty: {
                            message: 'Seleziona una tipologia di Anagrafica (fornitore o cliente).',
                        },
                        callback: {
                            message: 'Il tipo deve essere "Fornitore" o "Cliente".',
                            callback: function (value) {
                                return (
                                    JSON.parse(value.element.value).value === 'supplier' ||
                                    JSON.parse(value.element.value).value === 'customer'
                                );
                            },
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
            },
            plugins: {
                trigger: new FormValidation.plugins.Trigger(),
                bootstrap: new FormValidation.plugins.Bootstrap(),
                // submitButton: new FormValidation.plugins.SubmitButton(),
            },
        });
    }

    function handleValidation(e) {
        e.preventDefault();
        disableSave = true;
        initForm();
        supplierForm?.validate().then(function (status) {
            if (status === 'Valid') {
                let data = getDataFromForm(e);
                data.note =
                    supplierData.note && supplierData.note.length > 0 && supplierData.note !== '<p></p>'
                        ? supplierData.note
                        : null;
                dispatch('submit', data);
            } else {
                toast.error('Per favore, controlla i dati inseriti e riprova.');
            }
        });

        setTimeout(() => {
            disableSave = false;
        }, 1000);
    }

    const typeOptions = [
        {value: 'supplier', label: 'Fornitore'},
        {value: 'customer', label: 'Cliente'},
    ];
</script>

<div class="row">
    <div class="col-10 mt-2 mb-4">
        <h3 class="card-label font-size-h2 font-weight-boldest">
            Dati anagrafici
            <span class="d-block text-muted pt-2 font-size-sm">Informazioni fornitore/cliente.</span>
        </h3>
    </div>
</div>

<form id="supplier_form" on:submit={handleValidation} class="mb-14">
    <div class="row mt-4 d-none">
        <div class="col-12 text-right">
            <button
                id="save_button_supplier_customer"
                disabled={disableSave}
                type="submit"
                class="btn btn-sm btn-primary font-weight-boldest">
                {#if disableSave}
                    <span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true" />
                {/if}
                Salva
            </button>
        </div>
    </div>

    <div class="row">
        <div class="col-12 col-md-4 mb-3">
            <TextInput
                customClasses={'m-0 p-0'}
                active={false}
                editable={false}
                props={{
                    label: 'Nome',
                    name: 'name',
                    id: 'name',
                    value: supplierData?.name || '',
                    required: true,
                    placeholder: 'Nome',
                    style: 'text-transform:capitalize',
                }}
                on:change={e => (supplierData.name = e.detail)} />
        </div>
        <div class="col-12 col-md-4 mb-3">
            <TextInput
                customClasses={'m-0 p-0'}
                active={false}
                editable={false}
                props={{
                    label: 'Indirizzo',
                    name: 'address',
                    id: 'address',
                    value: supplierData?.address || '',
                    placeholder: 'Indirizzo',
                    style: 'text-transform:capitalize',
                }}
                on:change={e => (supplierData.address = e.detail)} />
        </div>
        <div class="col-12 col-md-4 mb-3">
            <TextInput
                customClasses={'m-0 p-0'}
                active={false}
                editable={false}
                props={{
                    label: 'Codice fiscale',
                    name: 'tax_code',
                    id: 'tax_code',
                    value: supplierData?.tax_code || '',
                    placeholder: 'Codice fiscale',
                    style: 'text-transform:uppercase',
                }}
                on:change={e => (supplierData.tax_code = e.detail)} />
        </div>
        <div class="col-12 col-md-4 mb-3">
            <TextInput
                customClasses={'m-0 p-0'}
                active={false}
                editable={false}
                props={{
                    label: 'Partita IVA',
                    name: 'vat_number',
                    id: 'vat_number',
                    value: supplierData?.vat_number || '',
                    placeholder: 'Partita IVA',
                    style: 'text-transform:uppercase',
                }}
                on:change={e => (supplierData.vat_number = e.detail)} />
        </div>
        <div class="col-12 col-md-4 mb-3">
            <SmartSelect
                customClasses={'m-0 p-0'}
                active={false}
                editable={false}
                props={{
                    label: 'Tipo',
                    name: 'type',
                    id: 'type',
                    value: supplierData?.type || 'supplier',
                    options: typeOptions,
                    placeholder: 'Seleziona il tipo',
                }}
                on:change={e => {
                    supplierData.type = e.detail.value;
                }} />
        </div>
        <div class="col-12 col-md-4 mb-3">
            <TextInput
                customClasses={'m-0 p-0'}
                active={false}
                editable={false}
                props={{
                    label: 'Email',
                    name: 'email',
                    id: 'email',
                    value: supplierData?.email || '',
                    placeholder: 'Email',
                }}
                on:change={e => (supplierData.email = e.detail)} />
        </div>
        <div class="col-12 col-md-4 mb-3">
            <div class="form-group mb-0">
                <label class="font-weight-bolder mb-2">Telefono</label>
                <div class="input-group input-group-lg input-group-solid">
                    <Phone size="16" weight="duotone" class="mx-4 text-dark-25" />
                    <input
                        on:change={e => (supplierData.phone_number = e.detail)}
                        value={supplierData?.phone_number || ''}
                        name="phone_number"
                        type="text"
                        class="form-control form-control-solid form-control-lg"
                        placeholder="Telefono" />
                </div>
            </div>
        </div>
        <div class="col-12 col-md-4 mb-3">
            <TextInput
                customClasses={'m-0 p-0'}
                active={false}
                editable={false}
                props={{
                    label: 'Città',
                    name: 'city',
                    id: 'city',
                    value: supplierData?.city || '',
                    placeholder: 'Città',
                    style: 'text-transform:capitalize',
                }}
                on:change={e => (supplierData.city = e.detail)} />
        </div>
        <div class="col-12 col-md-4 mb-3">
            <TextInput
                customClasses={'m-0 p-0'}
                active={false}
                editable={false}
                props={{
                    label: 'CAP',
                    name: 'cap',
                    id: 'cap',
                    value: supplierData?.cap || '',
                    placeholder: 'CAP',
                }}
                on:change={e => (supplierData.cap = e.detail)} />
        </div>
        <div class="col-12 col-md-4 mb-3">
            <TextInput
                customClasses={'m-0 p-0'}
                active={false}
                editable={false}
                props={{
                    label: 'Provincia',
                    name: 'state',
                    id: 'state',
                    value: supplierData?.state || '',
                    placeholder: 'Provincia',
                    style: 'text-transform:capitalize',
                }}
                on:change={e => (supplierData.state = e.detail)} />
        </div>
        <div class="col-12 col-md-4 mb-3">
            <TextInput
                customClasses={'m-0 p-0'}
                active={false}
                editable={false}
                props={{
                    label: 'Paese',
                    name: 'country',
                    id: 'country',
                    value: supplierData?.country || 'Italia',
                    placeholder: 'Paese',
                    style: 'text-transform:capitalize',
                }}
                on:change={e => (supplierData.country = e.detail)} />
        </div>
        <div class="col-12 col-md-4 mb-3">
            <TextInput
                customClasses={'m-0 p-0'}
                active={false}
                editable={false}
                props={{
                    label: 'Nazionalità',
                    name: 'nationality',
                    id: 'nationality',
                    value: supplierData?.nationality || 'Italiana',
                    placeholder: 'Nazionalità',
                    style: 'text-transform:capitalize',
                }}
                on:change={e => (supplierData.nationality = e.detail)} />
        </div>
    </div>

    <div class="row mt-4 mx-0">
        <div class="col-12 px-0">
            <h3 class="text-dark font-weight-boldest mb-4">Note</h3>
            <TipTapEditor mentions={false} bind:value={supplierData.note} placeholder="Inserisci delle note..." />
        </div>
    </div>

    <BottomBarFixedSave
        target="#portal-save-foreground"
        visible={true}
        customStyle={KTUtil.isMobileDevice() ? '' : `width: ${width};right: 0;left: auto;`}
        on:save={() => {
            // submit the form by Id
            document.getElementById('save_button_supplier_customer').click();
        }}>
        <div slot="left" class="d-flex align-items-center w-100">
            <Warning weight={'duotone'} size={18} class="mr-2 text-warning" />
            <p class="font-weight-boldest mb-0 text-warning text-xs">
                Ricordati di salvare per applicare le modifiche.
            </p>
        </div>
    </BottomBarFixedSave>
</form>
