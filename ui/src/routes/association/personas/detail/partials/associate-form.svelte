<script>
    import GenerateTaxCodeButton from 'components/buttons/GenerateTaxCodeButton.svelte';
    import {
        TextInput,
        SmartSelect,
        Datepicker,
        CheckBoxSelect,
        ImageUpload,
    } from 'components/formBuilder/preview-blocks/index.js';
    import BottomBarFixedSave from 'components/inputs/BottomBarFixedSave.svelte';
    import {Phone, Plugs, PlusCircle, Spinner, TrashSimple, User, Warning} from 'phosphor-svelte';
    import {onMount, createEventDispatcher} from 'svelte';
    import {toast} from 'svelte-sonner';
    import {getDataFromForm} from 'utils/Functions';
    import ConnectTutorModal from './connect-tutor-modal.svelte';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import TipTapEditor from 'components/inputs/TipTapEditor.svelte';

    const dispatch = createEventDispatcher();

    export let associate = {};
    export let width = '85vw';

    let associateForm;
    let disableSave = false;
    let activeTutor = 0;

    const sexOptions = [
        {label: 'Maschio', value: 'M'},
        {label: 'Femmina', value: 'F'},
    ];

    function initForm() {
        associateForm?.destroy();
        let validationFields = {
            firstName: {
                validators: {
                    notEmpty: {
                        message: 'Il nome è obbligatorio.',
                    },
                },
            },
            lastName: {
                validators: {
                    notEmpty: {
                        message: 'Il cognome è obbligatorio.',
                    },
                },
            },
            taxCode: {
                validators: {
                    notEmpty: {
                        message: 'Il codice fiscale è obbligatorio.',
                    },
                    regexp: {
                        regexp: '^[a-zA-Z]{6}[0-9]{2}[abcdehlmprstABCDEHLMPRST]{1}[0-9]{2}([a-zA-Z]{1}[0-9]{3})[a-zA-Z]{1}$',
                        flags: 'ig',
                        message: 'Il codice fiscale non è in un formato valido',
                    },
                },
            },
            bornDate: {
                validators: {
                    notEmpty: {
                        message: 'La data di nascita è obbligatoria.',
                    },
                    date: {
                        format: 'DD/MM/YYYY',
                        message: 'La data di nascita non è in un formato valido',
                    },
                },
            },
            bornCity: {
                validators: {
                    notEmpty: {
                        message: 'La città di nascita è obbligatoria.',
                    },
                },
            },
            address: {
                validators: {
                    notEmpty: {
                        message: "L'indirizzo è obbligatorio.",
                    },
                },
            },
            addressCity: {
                validators: {
                    notEmpty: {
                        message: 'La città di residenza è obbligatoria.',
                    },
                },
            },
            addressCap: {
                validators: {
                    notEmpty: {
                        message: 'Il CAP è obbligatorio.',
                    },
                    regexp: {
                        regexp: '^[0-9]{5}$',
                        message: 'Il CAP non è in un formato valido',
                    },
                },
            },
            nationality: {
                validators: {
                    notEmpty: {
                        message: 'La nazionalità è obbligatoria.',
                    },
                },
            },
            nationalityResidence: {
                validators: {
                    notEmpty: {
                        message: 'La residenza è obbligatoria.',
                    },
                },
            },
            email: {
                validators: {
                    emailAddress: {
                        message: "L'email non è in un formato valido.",
                    },
                },
            },
            phone: {
                validators: {
                    regexp: {
                        regexp: /^\+?\d{7,15}$/,
                        message: 'Il numero di telefono non è valido.',
                    },
                },
            },
            phone_2: {
                validators: {
                    regexp: {
                        regexp: /^\+?\d{7,15}$/,
                        message: 'Il numero di telefono non è valido.',
                    },
                },
            },
            phone_3: {
                validators: {
                    regexp: {
                        regexp: /^\+?\d{7,15}$/,
                        message: 'Il numero di telefono non è valido.',
                    },
                },
            },
            phone_4: {
                validators: {
                    regexp: {
                        regexp: /^\+?\d{7,15}$/,
                        message: 'Il numero di telefono non è valido.',
                    },
                },
            },
        };

        associate.tutors?.forEach((_, index) => {
            validationFields = {
                ...validationFields,
                [`tutor_${index}_tax_code`]: {
                    validators: {
                        regexp: {
                            regexp: '^[a-zA-Z]{6}[0-9]{2}[abcdehlmprstABCDEHLMPRST]{1}[0-9]{2}([a-zA-Z]{1}[0-9]{3})[a-zA-Z]{1}$',
                            flags: 'ig',
                            message: 'Il codice fiscale non è in un formato valido',
                        },
                    },
                },
                [`tutor_${index}_born_date`]: {
                    validators: {
                        date: {
                            format: 'DD/MM/YYYY',
                            message: 'La data di nascita non è in un formato valido',
                        },
                    },
                },
                [`tutor_${index}_address_cap`]: {
                    validators: {
                        regexp: {
                            regexp: '^[0-9]{5}$',
                            message: 'Il CAP non è in un formato valido',
                        },
                    },
                },
                [`tutor_${index}_email`]: {
                    validators: {
                        emailAddress: {
                            message: "L'email non è in un formato valido.",
                        },
                    },
                },
                [`tutor_${index}_phone`]: {
                    validators: {
                        regexp: {
                            regexp: /^\+?\d{7,15}$/,
                            message: 'Il numero di telefono del tutore non è valido.',
                        },
                    },
                },
            };
        });

        associateForm = FormValidation.formValidation(document.getElementById('associate_form'), {
            fields: validationFields,
            plugins: {
                trigger: new FormValidation.plugins.Trigger(),
                bootstrap: new FormValidation.plugins.Bootstrap(),
            },
        });
    }

    function cleanData(data) {
        // clean the select and multiple select to just set the value
        data = {...associate};
        data.born_date = moment(data.born_date).format('DD/MM/YYYY');

        data.tutors_data = [...associate.tutors];
        data.notes = associate.notes && associate.notes != '' && associate.notes != '<p></p>' ? associate.notes : null;

        // refactor the born_date to be a DD/MM/YYY date for tutors
        data.tutors_data.forEach(tutor => {
            tutor.tutor.born_date = moment(tutor.tutor.born_date).format('DD/MM/YYYY');
        });

        return data;
    }

    function handleValidation(e) {
        e.preventDefault();
        disableSave = true;
        initForm();
        associateForm?.validate().then(function (status) {
            if (status === 'Valid') {
                let data = cleanData(getDataFromForm(e));
                // get the form data
                dispatch('submit', data);
            } else {
                toast.error('Per favore, controlla i dati inseriti e riprova.');
            }
        });

        setTimeout(() => {
            disableSave = false;
        }, 1000);
    }

    function handleIncomplete(e) {
        disableSave = true;
        const form = {
            target: document.getElementById('associate_form'),
        };
        try {
            const data = cleanData(getDataFromForm(form));
            dispatch('incomplete', {...data, incomplete: true});
        } catch (error) {
            console.error(error);
        }
        setTimeout(() => {
            disableSave = false;
        }, 1000);
    }

    onMount(() => {
        initForm();
    });
</script>

<div class="row">
    <div class="col-10 mt-2 mb-4">
        <h3 class="card-label font-size-h2 font-weight-boldest">
            Dati anagrafici
            <span class="d-block text-muted pt-2 font-size-sm">Informazioni personali.</span>
        </h3>
    </div>
</div>
<form id="associate_form" on:submit={handleValidation} class="mb-14">
    <div class="row mt-4 d-none">
        <div class="col-12 text-right">
            <button
                id="save_button"
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
        <div class="col-12 col-md-4">
            <div class="form-group">
                <label for="picture_path" class="font-weight-bolder mb-2">Foto personale</label>
                <ImageUpload
                    customClasses={'px-0 mx-0'}
                    editable={false}
                    active={false}
                    bind:value={associate.picture_path}
                    props={{
                        id: 'picture_path',
                        name: 'picture_path',
                        label: '',
                        placeholder: 'Inserisci una foto',
                        placeholderUpload: 'Scegli una foto',
                        previewStyle: 'width: 150px; height: 150px;',
                        imgStyle: 'width: 150px; height: auto;',
                        showUploadBelow: true,
                        required: false,
                        value: associate.picture_path || '',
                    }} />
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-12 col-md-4">
            <TextInput
                customClasses={'m-0 p-0'}
                active={false}
                editable={false}
                props={{
                    label: 'Nome',
                    name: 'firstName',
                    id: 'firstName',
                    value: associate.first_name,
                    required: true,
                    placeholder: 'Inserisci il nome',
                }}
                on:change={e => (associate.first_name = e.detail)} />
        </div>
        <div class="col-12 col-md-4">
            <TextInput
                customClasses={'m-0 p-0'}
                active={false}
                editable={false}
                props={{
                    label: 'Cognome',
                    name: 'lastName',
                    id: 'lastName',
                    value: associate.last_name,
                    required: true,
                    placeholder: 'Inserisci il cognome',
                }}
                on:change={e => (associate.last_name = e.detail)} />
        </div>
        <div class="col-12 col-md-4">
            <SmartSelect
                customClasses={'m-0 p-0'}
                active={false}
                editable={false}
                props={{
                    label: 'Sesso',
                    name: 'sex',
                    id: 'sex',
                    value: associate.sex,
                    required: true,
                    options: sexOptions,
                    placeholder: 'Seleziona il sesso',
                }}
                on:change={e => (associate.sex = e.detail.value)} />
        </div>
    </div>

    <div class="row mt-4">
        <div class="col-12 col-md-4">
            <Datepicker
                customClasses={'m-0 p-0'}
                active={false}
                editable={false}
                props={{
                    label: 'Data di Nascita',
                    name: 'bornDate',
                    id: 'bornDate',
                    value: associate?.born_date ? moment(associate.born_date).format('DD/MM/YYYY') : null,
                    required: true,
                    format: 'DD/MM/YYYY',
                    placeholder: 'Data di nascita',
                }}
                on:change={e => {
                    associate.born_date = moment(e.detail, 'DD/MM/YYYY').format('YYYY-MM-DD');
                }} />
        </div>
        <div class="col-12 col-md-4">
            <TextInput
                customClasses={'m-0 p-0'}
                active={false}
                editable={false}
                props={{
                    label: 'Città di Nascita',
                    name: 'bornCity',
                    id: 'bornCity',
                    value: associate.born_city,
                    required: true,
                    placeholder: 'Inserisci la città di nascita',
                    style: 'text-transform: capitalize;',
                }}
                on:change={e => (associate.born_city = e.detail)} />
        </div>
        <div class="col-12 col-md-4 d-flex align-items-center">
            <TextInput
                customClasses={'m-0 p-0 w-100'}
                active={false}
                editable={false}
                props={{
                    label: 'Codice Fiscale',
                    name: 'taxCode',
                    id: 'taxCode',
                    value: associate.tax_code,
                    required: true,
                    placeholder: 'Inserisci il codice fiscale',
                    style: 'text-transform:uppercase',
                }} />
            <div class="d-flex justify-content-end align-items-center mb-0 mt-8">
                <GenerateTaxCodeButton bind:data={associate} on:codice={e => (associate.tax_code = e.detail)} />
            </div>
        </div>
    </div>

    <div class="row mt-4">
        <div class="col-12 col-md-4">
            <TextInput
                customClasses={'m-0 p-0'}
                active={false}
                editable={false}
                props={{
                    label: 'Indirizzo',
                    name: 'address',
                    id: 'address',
                    value: associate.address,
                    required: true,
                    placeholder: "Inserisci l'indirizzo",
                }}
                on:change={e => (associate.address = e.detail)} />
        </div>
        <div class="col-12 col-md-4">
            <TextInput
                customClasses={'m-0 p-0'}
                active={false}
                editable={false}
                props={{
                    label: 'Città di Residenza',
                    name: 'addressCity',
                    id: 'addressCity',
                    value: associate.address_city,
                    required: true,
                    placeholder: 'Inserisci la città di residenza',
                }}
                on:change={e => (associate.address_city = e.detail)} />
        </div>
        <div class="col-12 col-md-4">
            <TextInput
                customClasses={'m-0 p-0'}
                active={false}
                editable={false}
                props={{
                    label: 'CAP',
                    name: 'addressCap',
                    id: 'addressCap',
                    value: associate.address_cap,
                    required: true,
                    placeholder: 'Inserisci il CAP',
                    maxLength: 5,
                    type: 'number',
                }}
                on:change={e => (associate.address_cap = e.detail)} />
        </div>
    </div>

    <div class="row mt-4">
        <div class="col-12 col-md-6">
            <TextInput
                customClasses={'m-0 p-0'}
                active={false}
                editable={false}
                props={{
                    label: 'Nazionalità',
                    name: 'nationality',
                    id: 'nationality',
                    value: associate.nationality,
                    required: true,
                    placeholder: 'Inserisci la nazionalità',
                }}
                on:change={e => (associate.nationality = e.detail)} />
        </div>
        <div class="col-12 col-md-6">
            <TextInput
                customClasses={'m-0 p-0'}
                active={false}
                editable={false}
                props={{
                    label: 'Paese di Residenza',
                    name: 'nationalityResidence',
                    id: 'nationalityResidence',
                    value: associate.nationality_residence,
                    required: true,
                    placeholder: 'Inserisci il paese di residenza',
                }}
                on:change={e => (associate.nationality_residence = e.detail)} />
        </div>
    </div>

    <div class="row mt-4">
        <div class="col-12 col-md-6">
            <TextInput
                customClasses={'m-0 p-0'}
                active={false}
                editable={false}
                props={{
                    label: 'Email',
                    name: 'email',
                    id: 'email',
                    value: associate.email,
                    placeholder: "Inserisci l'email",
                }}
                on:change={e => (associate.email = e.detail)} />
        </div>
        <div class="col-12 col-md-6">
            <div class="form-group">
                <label class="font-weight-bolder mb-2">Telefono</label>
                <div class="input-group input-group-lg input-group-solid">
                    <Phone size="16" weight="duotone" class="mx-4 text-dark-25" />
                    <input
                        bind:value={associate.phone}
                        name="phone"
                        type="text"
                        class="form-control form-control-solid form-control-lg"
                        placeholder="Nessun telefono" />
                    <User size="16" weight="duotone" class="mx-4 text-dark-25" />
                    <input
                        bind:value={associate.phone_label}
                        name="phone_label"
                        type="text"
                        class="form-control form-control-solid form-control-lg"
                        placeholder="Nome contatto" />
                </div>
            </div>
        </div>
    </div>

    <div class="row mt-4">
        <div class="col-12 col-md-4">
            <div class="form-group">
                <label class="font-weight-bolder mb-2">Telefono 2</label>
                <div class="input-group input-group-lg input-group-solid">
                    <Phone size="16" weight="duotone" class="mx-4 text-dark-25" />
                    <input
                        bind:value={associate.phone_2}
                        name="phone_2"
                        type="text"
                        class="form-control form-control-solid form-control-lg"
                        placeholder="Nessun telefono" />
                    <User size="16" weight="duotone" class="mx-4 text-dark-25" />
                    <input
                        bind:value={associate.phone_2_label}
                        name="phone_2_label"
                        type="text"
                        class="form-control form-control-solid form-control-lg"
                        placeholder="Nome contatto" />
                </div>
            </div>
        </div>
        <div class="col-12 col-md-4">
            <div class="form-group">
                <label class="font-weight-bolder mb-2">Telefono 3</label>
                <div class="input-group input-group-lg input-group-solid">
                    <Phone size="16" weight="duotone" class="mx-4 text-dark-25" />
                    <input
                        bind:value={associate.phone_3}
                        name="phone_3"
                        type="text"
                        class="form-control form-control-solid form-control-lg"
                        placeholder="Nessun telefono" />
                    <User size="16" weight="duotone" class="mx-4 text-dark-25" />
                    <input
                        bind:value={associate.phone_3_label}
                        name="phone_3_label"
                        type="text"
                        class="form-control form-control-solid form-control-lg"
                        placeholder="Nome contatto" />
                </div>
            </div>
        </div>
        <div class="col-12 col-md-4">
            <div class="form-group">
                <label class="font-weight-bolder mb-2">Telefono 4</label>
                <div class="input-group input-group-lg input-group-solid">
                    <Phone size="16" weight="duotone" class="mx-4 text-dark-25" />
                    <input
                        bind:value={associate.phone_4}
                        name="phone_4"
                        type="text"
                        class="form-control form-control-solid form-control-lg"
                        placeholder="Nessun telefono" />
                    <User size="16" weight="duotone" class="mx-4 text-dark-25" />
                    <input
                        bind:value={associate.phone_4_label}
                        name="phone_4_label"
                        type="text"
                        class="form-control form-control-solid form-control-lg"
                        placeholder="Nome contatto" />
                </div>
            </div>
        </div>
        <div class="col-12 col-md-4">
            <TextInput
                customClasses={'m-0 p-0'}
                active={false}
                editable={false}
                props={{
                    label: "Documento d'identità",
                    name: 'id_number',
                    id: 'id_number',
                    value: associate.id_number,
                    placeholder: 'Inserisci il numero del documento',
                }}
                on:change={e => (associate.id_number = e.detail)} />
        </div>
    </div>

    <div class="row mt-4 mx-0">
        <div class="col-12 px-0">
            <h3 class="text-dark font-weight-boldest mb-4">Note</h3>
            <TipTapEditor mentions={false} bind:value={associate.notes} placeholder="Inserisci delle note..." />
        </div>
    </div>

    <div class="row mt-4 mx-0">
        <div class="col-12 mx-0 px-0 mb-2">
            <h3 class="font-weight-boldest">Tutori e/o Genitori</h3>
        </div>
        <div class="d-flex justify-content-start">
            <div class="bg-light-light border border-light-dark-50 p-1 rounded-xl d-flex" style="gap: .2rem;">
                {#each Array.from(associate.tutors || []) as tutor, index}
                    <button
                        type="button"
                        on:click={() => (activeTutor = index)}
                        class="btn btn-xs btn-{activeTutor == index
                            ? 'dark'
                            : 'light'} font-weight-boldest m-0 rounded-lg py-2 px-3">
                        Tutore {index + 1}
                    </button>
                {/each}
                <button
                    type="button"
                    class="btn btn-xs btn-light text-primary font-weight-boldest m-0 rounded-lg py-2 px-3"
                    on:click={() => {
                        associate.tutors = [...associate.tutors, {tutor: {associate_id: null}, is_primary: false}];
                        activeTutor = associate.tutors.length - 1;
                    }}>
                    <PlusCircle size="16" weight="bold" class="mr-1" />
                    Nuovo tutore
                </button>
                <button
                    type="button"
                    class="btn btn-xs btn-light text-success font-weight-boldest m-0 rounded-lg py-2 px-3"
                    on:click={() => {
                        let connectTutorModal = new ConnectTutorModal({
                            target: document.querySelector('#portal-elements-foreground'),
                            intro: true,
                            props: {
                                show: true,
                                tutors: associate.tutors,
                            },
                        });
                        connectTutorModal.$on('confirm', async e => {
                            // call the persona info endpoint and add the tutor to the associate
                            let res = await apiFetch(
                                replaceUID(__bakney.env.API.PERSONAS.INFO, e.detail?.data?.associate_id),
                                {
                                    method: 'GET',
                                }
                            );
                            if (res.status === 200) {
                                associate.tutors = [...associate.tutors, {tutor: {...res.response}, is_primary: false}];
                                activeTutor = associate.tutors.length - 1;
                            }
                        });
                    }}>
                    <Plugs size="16" weight="bold" class="mr-1" />
                    Collega esistente
                </button>
            </div>
        </div>

        {#each associate.tutors as tutor, index}
            <input type="hidden" name={`tutor_${index}_associate_id`} value={tutor.associate_id} />
            <div class="col-12 mt-4 px-0 mx-0" class:d-none={activeTutor !== index}>
                <div class="row w-100 mx-0 px-0">
                    <div
                        class="col-12 mt-2 d-flex align-items-center justify-content-between px-4 py-2 border border-light-dark-20 rounded-xl">
                        <CheckBoxSelect
                            customClasses={'m-0 p-0'}
                            active={false}
                            editable={false}
                            props={{
                                label: 'Tutore Principale',
                                name: `tutor_${index}_is_primary`,
                                options: [
                                    {
                                        id: 'primary',
                                        label: 'Imposta come tutore principale',
                                        value: 'true',
                                        checked: tutor.is_primary || false,
                                    },
                                ],
                            }}
                            on:change={e => {
                                if (e.detail == true) {
                                    // set all the other tutors to false
                                    associate.tutors.forEach(t => {
                                        t.is_primary = false;
                                    });
                                    tutor.is_primary = true;
                                }
                            }} />
                        <button
                            type="button"
                            class="btn btn-xs btn-light-danger font-weight-boldest ml-4 mb-0"
                            on:click={() => {
                                associate.tutors = associate.tutors.filter((_, i) => i !== index);
                                activeTutor = Math.max(0, activeTutor - 1);
                            }}>
                            <TrashSimple size="16" weight="bold" class="mr-1" />
                            Rimuovi tutore
                        </button>
                    </div>
                </div>
                <div class="row">
                    <div class="col-12 col-md-4 mt-2">
                        <TextInput
                            customClasses={'m-0 p-0'}
                            active={false}
                            editable={false}
                            props={{
                                label: 'Nome',
                                name: `tutor_${index}_first_name`,
                                value: tutor.tutor.first_name,
                                required: false,
                                placeholder: 'Nome tutore',
                            }}
                            on:change={e => (tutor.tutor.first_name = e.detail)} />
                    </div>
                    <div class="col-12 col-md-4 mt-2">
                        <TextInput
                            customClasses={'m-0 p-0'}
                            active={false}
                            editable={false}
                            props={{
                                label: 'Cognome',
                                name: `tutor_${index}_last_name`,
                                value: tutor.tutor.last_name,
                                required: false,
                                placeholder: 'Cognome tutore',
                            }}
                            on:change={e => (tutor.tutor.last_name = e.detail)} />
                    </div>
                    <div class="col-12 col-md-4 mt-2">
                        <SmartSelect
                            customClasses={'m-0 p-0'}
                            active={false}
                            editable={false}
                            props={{
                                label: 'Sesso',
                                name: `tutor_${index}_sex`,
                                value: tutor.tutor.sex,
                                required: false,
                                options: sexOptions,
                                placeholder: 'Seleziona sesso',
                            }}
                            on:change={e => (tutor.tutor.sex = e.detail.value)} />
                    </div>
                    <div class="col-12 col-md-4 mt-2">
                        <Datepicker
                            customClasses={'m-0 p-0'}
                            active={false}
                            editable={false}
                            props={{
                                label: 'Data di Nascita',
                                name: `tutor_${index}_born_date`,
                                id: `tutor_${index}_born_date`,
                                value: tutor?.tutor?.born_date
                                    ? moment(tutor.tutor.born_date).format('DD/MM/YYYY')
                                    : null,
                                required: false,
                                format: 'DD/MM/YYYY',
                                placeholder: 'Data di nascita',
                            }}
                            on:change={e => {
                                tutor.tutor.born_date = moment(e.detail, 'DD/MM/YYYY').format('YYYY-MM-DD');
                            }} />
                    </div>
                    <div class="col-12 col-md-4 mt-2">
                        <TextInput
                            customClasses={'m-0 p-0'}
                            active={false}
                            editable={false}
                            props={{
                                label: 'Città di nascita',
                                name: `tutor_${index}_born_city`,
                                value: tutor.tutor.born_city,
                                required: false,
                                placeholder: 'Città di nascita tutore',
                            }}
                            on:change={e => (tutor.tutor.born_city = e.detail)} />
                    </div>
                    <div class="col-12 col-md-4 mt-2 d-flex align-items-center">
                        <TextInput
                            customClasses={'m-0 p-0 w-100'}
                            active={false}
                            editable={false}
                            on:change={e => (tutor.tutor.tax_code = e.detail)}
                            props={{
                                label: 'Codice Fiscale',
                                name: `tutor_${index}_tax_code`,
                                value: tutor.tutor.tax_code,
                                required: false,
                                placeholder: 'Inserisci il codice fiscale',
                                style: 'text-transform:uppercase',
                            }} />
                        <div class="d-flex justify-content-end align-items-center mb-0 mt-8">
                            <GenerateTaxCodeButton
                                bind:data={tutor.tutor}
                                on:codice={e => (tutor.tutor.tax_code = e.detail)} />
                        </div>
                    </div>
                    <div class="col-12 col-md-4 mt-2">
                        <TextInput
                            customClasses={'m-0 p-0'}
                            active={false}
                            editable={false}
                            props={{
                                label: 'Indirizzo',
                                name: `tutor_${index}_address`,
                                value: tutor.tutor.address,
                                required: false,
                                placeholder: 'Indirizzo tutore',
                            }}
                            on:change={e => (tutor.tutor.address = e.detail)} />
                    </div>
                    <div class="col-12 col-md-4 mt-2">
                        <TextInput
                            customClasses={'m-0 p-0'}
                            active={false}
                            editable={false}
                            props={{
                                label: 'Città di Residenza',
                                name: `tutor_${index}_address_city`,
                                value: tutor.tutor.address_city,
                                required: false,
                                placeholder: 'Città di residenza tutore',
                            }}
                            on:change={e => (tutor.tutor.address_city = e.detail)} />
                    </div>
                    <div class="col-12 col-md-4 mt-2">
                        <TextInput
                            customClasses={'m-0 p-0'}
                            active={false}
                            editable={false}
                            props={{
                                label: 'CAP',
                                name: `tutor_${index}_address_cap`,
                                value: tutor.tutor.address_cap,
                                required: false,
                                placeholder: 'CAP tutore',
                                maxLength: 5,
                                type: 'number',
                            }}
                            on:change={e => (tutor.tutor.address_cap = e.detail)} />
                    </div>
                    <div class="col-12 col-md-6 mt-2">
                        <TextInput
                            customClasses={'m-0 p-0'}
                            active={false}
                            editable={false}
                            props={{
                                label: 'Nazionalità',
                                name: `tutor_${index}_nationality`,
                                value: tutor.tutor.nationality,
                                required: false,
                                placeholder: 'Nazionalità tutore',
                            }}
                            on:change={e => (tutor.tutor.nationality = e.detail)} />
                    </div>
                    <div class="col-12 col-md-6 mt-2">
                        <TextInput
                            customClasses={'m-0 p-0'}
                            active={false}
                            editable={false}
                            props={{
                                label: 'Paese di Residenza',
                                name: `tutor_${index}_nationality_residence`,
                                value: tutor.tutor.nationality_residence,
                                required: false,
                                placeholder: 'Paese di residenza tutore',
                            }}
                            on:change={e => (tutor.tutor.nationality_residence = e.detail)} />
                    </div>
                    <div class="col-12 col-md-6 mt-2">
                        <TextInput
                            customClasses={'m-0 p-0'}
                            active={false}
                            editable={false}
                            props={{
                                label: 'Email',
                                name: `tutor_${index}_email`,
                                value: tutor.tutor.email,
                                placeholder: 'Email tutore',
                            }}
                            on:change={e => (tutor.tutor.email = e.detail)} />
                    </div>
                    <div class="col-12 col-md-6 mt-2">
                        <div class="form-group">
                            <label class="font-weight-bolder mb-2">Telefono</label>
                            <div class="input-group input-group-lg input-group-solid">
                                <Phone size="16" weight="duotone" class="mx-4 text-dark-25" />
                                <input
                                    bind:value={tutor.tutor.phone}
                                    name={`tutor_${index}_phone`}
                                    type="text"
                                    class="form-control form-control-solid form-control-lg"
                                    placeholder="Telefono tutore" />
                                <User size="16" weight="duotone" class="mx-4 text-dark-25" />
                                <input
                                    bind:value={tutor.tutor.phone_label}
                                    name={`tutor_${index}_phone_label`}
                                    type="text"
                                    class="form-control form-control-solid form-control-lg"
                                    placeholder="Nome contatto" />
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-4 mt-2">
                        <div class="form-group">
                            <label class="font-weight-bolder mb-2">Telefono 2</label>
                            <div class="input-group input-group-lg input-group-solid">
                                <Phone size="16" weight="duotone" class="mx-4 text-dark-25" />
                                <input
                                    bind:value={tutor.tutor.phone_2}
                                    name={`tutor_${index}_phone_2`}
                                    type="text"
                                    class="form-control form-control-solid form-control-lg"
                                    placeholder="Telefono tutore" />
                                <User size="16" weight="duotone" class="mx-4 text-dark-25" />
                                <input
                                    bind:value={tutor.tutor.phone_2_label}
                                    name={`tutor_${index}_phone_2_label`}
                                    type="text"
                                    class="form-control form-control-solid form-control-lg"
                                    placeholder="Nome contatto" />
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-4 mt-2">
                        <div class="form-group">
                            <label class="font-weight-bolder mb-2">Telefono 3</label>
                            <div class="input-group input-group-lg input-group-solid">
                                <Phone size="16" weight="duotone" class="mx-4 text-dark-25" />
                                <input
                                    bind:value={tutor.tutor.phone_3}
                                    name={`tutor_${index}_phone_3`}
                                    type="text"
                                    class="form-control form-control-solid form-control-lg"
                                    placeholder="Telefono tutore" />
                                <User size="16" weight="duotone" class="mx-4 text-dark-25" />
                                <input
                                    bind:value={tutor.tutor.phone_3_label}
                                    name={`tutor_${index}_phone_3_label`}
                                    type="text"
                                    class="form-control form-control-solid form-control-lg"
                                    placeholder="Nome contatto" />
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-4 mt-2">
                        <div class="form-group">
                            <label class="font-weight-bolder mb-2">Telefono 4</label>
                            <div class="input-group input-group-lg input-group-solid">
                                <Phone size="16" weight="duotone" class="mx-4 text-dark-25" />
                                <input
                                    bind:value={tutor.tutor.phone_4}
                                    name={`tutor_${index}_phone_4`}
                                    type="text"
                                    class="form-control form-control-solid form-control-lg"
                                    placeholder="Telefono tutore" />
                                <User size="16" weight="duotone" class="mx-4 text-dark-25" />
                                <input
                                    bind:value={tutor.tutor.phone_4_label}
                                    name={`tutor_${index}_phone_4_label`}
                                    type="text"
                                    class="form-control form-control-solid form-control-lg"
                                    placeholder="Nome contatto" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        {/each}
    </div>

    <BottomBarFixedSave
        target="#portal-save-foreground"
        visible={true}
        customStyle={KTUtil.isMobileDevice() ? '' : `width: ${width};right: 0;left: auto;`}
        on:save={() => {
            // submit the form by Id
            document.getElementById('save_button').click();
        }}>
        <div slot="left" class="d-flex align-items-center w-100">
            <Warning weight={'duotone'} size={18} class="mr-2 text-warning" />
            <p class="font-weight-boldest mb-0 text-warning text-xs">
                Ricordati di salvare per applicare le modifiche.
            </p>

            <div class="ml-auto">
                <button
                    type="button"
                    class="btn btn-light-warning font-weight-boldest mb-0 mr-2"
                    on:click={() => {
                        handleIncomplete();
                    }}>
                    Salva con dati incompleti
                </button>
            </div>
        </div>
    </BottomBarFixedSave>
</form>
