<script>
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import {createEventDispatcher} from 'svelte';
    import {toast} from 'svelte-sonner';

    const dispatch = createEventDispatcher();

    export let info;

    let subscriptionForm;

    $: {
        if (info?.associate && !info?.associate?.tutor) {
            info.associate.tutor = {
                first_name: null,
                last_name: null,
                tax_code: null,
                born_date: null,
                born_city: null,
                address: null,
                address_cap: null,
                address_city: null,
                email: null,
                phone: null,
                phone_2: null,
                phone_3: null,
                phone_4: null,
            };
        }
        if (info?.associate) info.associate.is_minor = isMinor(info.associate.born_date);
    }

    function isMinor(input) {
        if (!input) return false;
        let date = moment(input, 'YYYY-MM-DD');
        let now = moment();
        let years = now.diff(date, 'years');
        return years < 18;
    }

    function updateInfo() {
        // block UI while processing
        KTApp.blockPage({
            overlayColor: '#000000',
            type: 'v2',
            state: 'primary',
            message: 'Salvataggio in corso...',
        });
        apiFetch(replaceUID(__bakney.env.API.SUBSCRIPTION.UPDATE, info.subscription_id), {
            method: 'PATCH',
            body: JSON.stringify({
                // associate
                first_name: info.associate.first_name || null,
                last_name: info.associate.last_name || null,
                tax_code: info.associate.tax_code || null,
                sex: info.associate.sex || 'F',
                born_date: info.associate.born_date || null,
                born_city: info.associate.born_city || null,
                address: info.associate.address || null,
                address_cap: info.associate.address_cap || null,
                address_city: info.associate.address_city || null,
                email: info.associate.email || null,
                phone: info.associate.phone || null,
                phone_2: info.associate.phone_2 || null,
                phone_3: info.associate.phone_3 || null,
                phone_4: info.associate.phone_4 || null,
                is_minor: info.associate.is_minor || false,
                // tutor
                tutor_first_name: info.associate.tutor?.first_name || null,
                tutor_last_name: info.associate.tutor?.last_name || null,
                tutor_tax_code: info.associate.tutor?.tax_code || null,
                tutor_sex: info.associate.tutor?.sex || 'F',
                tutor_born_date: info.associate.tutor?.born_date || null,
                tutor_born_city: info.associate.tutor?.born_city || null,
                tutor_address: info.associate.tutor?.address || null,
                tutor_address_cap: info.associate.tutor?.address_cap || null,
                tutor_address_city: info.associate.tutor?.address_city || null,
                tutor_email: info.associate.tutor?.email || null,
                tutor_phone: info.associate.tutor?.phone || null,
                tutor_phone_2: info.associate.tutor?.phone_2 || null,
                tutor_phone_3: info.associate.tutor?.phone_3 || null,
                tutor_phone_4: info.associate.tutor?.phone_4 || null,
            }),
        })
            .then(res => {
                if (!res.error) {
                    toast.success('Informazioni aggiornate con successo.');
                } else {
                    toast.error('Qualcosa è andato storto.');
                }
                dispatch('reset', 'info');
                info.associate.is_minor = isMinor(info.associate.born_date);
            })
            .finally(() => {
                KTApp.unblockPage();
            });
    }

    function initForm() {
        subscriptionForm?.destroy();
        subscriptionForm = FormValidation.formValidation(document.getElementById('subscription_form'), {
            fields: {
                firstNameAssociate: {
                    validators: {
                        notEmpty: {
                            message: 'Il nome è obbligatorio.',
                        },
                    },
                },
                lastNameAssociate: {
                    validators: {
                        notEmpty: {
                            message: 'Il cognome è obbligatorio.',
                        },
                    },
                },
                email: {
                    validators: {
                        notEmpty: {
                            message: "L'email è obbligatoria.",
                        },
                        emailAddress: {
                            message: "L'email non è in formato valido.",
                        },
                    },
                },

                firstNameAssociate: {
                    validators: {
                        notEmpty: {
                            message: 'Il nome è obbligatorio.',
                        },
                    },
                },
                lastNameAssociate: {
                    validators: {
                        notEmpty: {
                            message: 'Il cognome è obbligatorio.',
                        },
                    },
                },
                sexAssociate: {
                    validators: {
                        notEmpty: {
                            message: 'Il sesso è obbligatorio.',
                        },
                        regexp: {
                            regexp: '^[MF]$', // M or F
                            flags: 'ig',
                            message: 'Il sesso non è in un formato valido (M o F)',
                        },
                    },
                },
                taxCodeAssociate: {
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
                bornDateAssociate: {
                    validators: {
                        notEmpty: {
                            message: 'La data di nascita è obbligatoria.',
                        },
                        regexp: {
                            regexp: '^[0-9]{4}-[0-9]{2}-[0-9]{2}$',
                            flags: 'ig',
                            message: 'La data di nascita non è in un formato valido',
                        },
                        date: {
                            format: 'YYYY-MM-DD',
                            message: 'La data di nascita non è in un formato valido',
                        },
                    },
                },
                bornCityAssociate: {
                    validators: {
                        notEmpty: {
                            message: 'La città di nascita è obbligatoria.',
                        },
                    },
                },
                addressAssociate: {
                    validators: {
                        notEmpty: {
                            message: "L'indirizzo di Residenza è obbligatorio.",
                        },
                    },
                },
                addressCityAssociate: {
                    validators: {
                        notEmpty: {
                            message: 'La città di Residenza è obbligatoria.',
                        },
                    },
                },
                capAssociate: {
                    validators: {
                        notEmpty: {
                            message: 'Il cap della città di Residenza è obbligatorio.',
                        },
                        regex: {
                            regexp: '^[0-9]{5}$',
                            message: 'Il cap della città di Residenza non è in un formato valido',
                        },
                    },
                },
                phoneAssociate: {
                    validators: {
                        regexp: {
                            regexp: /^\+?\d{7,15}$/,
                            message: 'Il numero di telefono non è valido.',
                        },
                    },
                },
                phone2Associate: {
                    validators: {
                        regexp: {
                            regexp: /^\+?\d{7,15}$/,
                            message: 'Il numero di telefono non è valido.',
                        },
                    },
                },
                phone3Associate: {
                    validators: {
                        regexp: {
                            regexp: /^\+?\d{7,15}$/,
                            message: 'Il numero di telefono non è valido.',
                        },
                    },
                },
                phone4Associate: {
                    validators: {
                        regexp: {
                            regexp: /^\+?\d{7,15}$/,
                            message: 'Il numero di telefono non è valido.',
                        },
                    },
                },
                firstNameAssociateTutor: {
                    validators: {
                        notEmpty: {
                            message: 'Il nome è obbligatorio.',
                        },
                    },
                },
                lastNameAssociateTutor: {
                    validators: {
                        notEmpty: {
                            message: 'Il cognome è obbligatorio.',
                        },
                    },
                },
                sexAssociateTutor: {
                    validators: {
                        notEmpty: {
                            message: 'Il sesso è obbligatorio.',
                        },
                        regexp: {
                            regexp: '^[MF]$', // M or F
                            flags: 'ig',
                            message: 'Il sesso non è in un formato valido (M o F)',
                        },
                    },
                },
                taxCodeAssociateTutor: {
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
                bornDateAssociateTutor: {
                    validators: {
                        notEmpty: {
                            message: 'La data di nascita è obbligatoria.',
                        },
                        date: {
                            format: 'YYYY-MM-DD',
                            message: 'La data di nascita non è in un formato valido',
                        },
                    },
                },
                bornCityAssociateTutor: {
                    validators: {
                        notEmpty: {
                            message: 'La città di nascita è obbligatoria.',
                        },
                    },
                },
                addressAssociateTutor: {
                    validators: {
                        notEmpty: {
                            message: "L'indirizzo di Residenza è obbligatorio.",
                        },
                    },
                },
                addressCityAssociateTutor: {
                    validators: {
                        notEmpty: {
                            message: 'La città di Residenza è obbligatoria.',
                        },
                    },
                },
                capAssociateTutor: {
                    validators: {
                        notEmpty: {
                            message: 'Il cap della città di Residenza è obbligatorio.',
                        },
                        regex: {
                            regexp: '^[0-9]{5}$',
                            message: 'Il cap della città di Residenza non è in un formato valido',
                        },
                    },
                },
                phoneAssociateTutor: {
                    validators: {
                        regexp: {
                            regexp: /^\+?\d{7,15}$/,
                            message: 'Il numero di telefono non è valido.',
                        },
                    },
                },
                phone2AssociateTutor: {
                    validators: {
                        regexp: {
                            regexp: /^\+?\d{7,15}$/,
                            message: 'Il numero di telefono non è valido.',
                        },
                    },
                },
                phone3AssociateTutor: {
                    validators: {
                        regexp: {
                            regexp: /^\+?\d{7,15}$/,
                            message: 'Il numero di telefono non è valido.',
                        },
                    },
                },
                phone4AssociateTutor: {
                    validators: {
                        regexp: {
                            regexp: /^\+?\d{7,15}$/,
                            message: 'Il numero di telefono non è valido.',
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

    // define the form submission function
    function handleValidation(e) {
        initForm();
        subscriptionForm?.validate().then(function (status) {
            if (status === 'Valid') {
                updateInfo();
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
        // send the form data to your Django backend
    }
</script>

<form id="subscription_form" on:submit|preventDefault={handleValidation}>
    {#if info?.associate}
        <div class="row pt-0 pb-4">
            <div class="col-12 mb-4">
                <div class="row">
                    <div class="col-12 my-auto text-md-right py-4 py-md-0">
                        <a
                            href="javascript:downloadPdf('{__bakney.env.HOST +
                                '/document/retrieve/' +
                                info.document_pdf}')"
                            class="btn btn-xs btn-dark font-weight-bolder m-0">
                            Modulo d'Iscrizione
                        </a>
                    </div>
                </div>
            </div>
            <div class="col-12">
                <h2 class="pb-4">Atleta</h2>

                <div class="row">
                    <div class="col-12 col-md-3">
                        <div class="form-group">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="font-weight-bolder">Nome</label>
                            <input
                                disabled
                                bind:value={info.associate.first_name}
                                name="firstNameAssociate"
                                type="text"
                                class="form-control form-control-solid form-control-lg margin-tb-2"
                                placeholder="Nome"
                                style="text-transform:capitalize" />
                        </div>
                    </div>
                    <div class="col-12 col-md-3">
                        <div class="form-group">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="font-weight-bolder">Cognome</label>
                            <input
                                disabled
                                bind:value={info.associate.last_name}
                                name="lastNameAssociate"
                                type="text"
                                class="form-control form-control-solid form-control-lg margin-tb-2"
                                placeholder="Cognome"
                                style="text-transform:capitalize" />
                        </div>
                    </div>
                    <div class="col-12 col-md-3">
                        <div class="form-group">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="font-weight-bolder">Codice fiscale</label>
                            <input
                                disabled
                                bind:value={info.associate.tax_code}
                                name="taxCodeAssociate"
                                type="text"
                                class="form-control form-control-solid form-control-lg margin-tb-2"
                                placeholder="Codice fiscale"
                                style="text-transform:uppercase" />
                        </div>
                    </div>
                    <div class="col-12 col-md-3">
                        <div class="form-group">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="font-weight-bolder">Data di nascita</label>
                            <input
                                disabled
                                bind:value={info.associate.born_date}
                                on:keyup={() => (info.associate.is_minor = isMinor(info?.associate?.born_date))}
                                name="bornDateAssociate"
                                type="text"
                                class="form-control form-control-solid form-control-lg margin-tb-2"
                                placeholder="Data di nascita"
                                style="text-transform:capitalize" />
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-12 col-md-3">
                        <div class="form-group">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="font-weight-bolder">Città di nascita</label>
                            <input
                                disabled
                                bind:value={info.associate.born_city}
                                name="bornCityAssociate"
                                type="text"
                                class="form-control form-control-solid form-control-lg margin-tb-2"
                                placeholder="Città di nascita"
                                style="text-transform:capitalize" />
                        </div>
                    </div>
                    <div class="col-12 col-md-3">
                        <div class="form-group">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="font-weight-bolder">Sesso</label>
                            <input
                                disabled
                                bind:value={info.associate.sex}
                                name="sexAssociate"
                                type="text"
                                class="form-control form-control-solid form-control-lg margin-tb-2"
                                placeholder="Sesso"
                                style="text-transform:uppercase" />
                        </div>
                    </div>
                    <div class="col-12 col-md-3">
                        <div class="form-group">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="font-weight-bolder">Indirizzo di residenza</label>
                            <input
                                disabled
                                bind:value={info.associate.address}
                                name="addressAssociate"
                                type="text"
                                class="form-control form-control-solid form-control-lg margin-tb-2"
                                placeholder="Indirizzo di residenza"
                                style="text-transform:capitalize" />
                        </div>
                    </div>
                    <div class="col-12 col-md-3">
                        <div class="form-group">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="font-weight-bolder">CAP</label>
                            <input
                                disabled
                                bind:value={info.associate.address_cap}
                                name="capAssociate"
                                type="text"
                                class="form-control form-control-solid form-control-lg margin-tb-2"
                                placeholder="CAP"
                                style="text-transform:capitalize" />
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-12 col-md-3">
                        <div class="form-group">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="font-weight-bolder">Città di Residenza</label>
                            <input
                                disabled
                                bind:value={info.associate.address_city}
                                name="addressCityAssociate"
                                type="text"
                                class="form-control form-control-solid form-control-lg margin-tb-2"
                                placeholder="Città di residenza"
                                style="text-transform:capitalize" />
                        </div>
                    </div>
                    <div class="col-12 col-md-3">
                        <div class="form-group">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="font-weight-bolder mb-4">Email</label>
                            <div class="input-group input-group-lg input-group-solid">
                                <div class="input-group-prepend">
                                    <span class="input-group-text"><i class="la la-envelope" /></span>
                                </div>
                                <input
                                    disabled
                                    bind:value={info.associate.email}
                                    name="emailAssociate"
                                    type="text"
                                    class="form-control form-control-solid form-control-lg"
                                    placeholder="Nessuna mail" />
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-3">
                        <div class="form-group">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="font-weight-bolder mb-4">Telefono</label>
                            <div class="input-group input-group-lg input-group-solid">
                                <div class="input-group-prepend">
                                    <span class="input-group-text"><i class="la la-phone" /></span>
                                </div>
                                <input
                                    disabled
                                    bind:value={info.associate.phone}
                                    name="phoneAssociate"
                                    type="text"
                                    class="form-control form-control-solid form-control-lg"
                                    placeholder="Nessun telefono" />
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-3">
                        <div class="form-group">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="font-weight-bolder mb-4">Telefono 2</label>
                            <div class="input-group input-group-lg input-group-solid">
                                <div class="input-group-prepend">
                                    <span class="input-group-text"><i class="la la-phone" /></span>
                                </div>
                                <input
                                    disabled
                                    bind:value={info.associate.phone_2}
                                    name="phone2Associate"
                                    type="text"
                                    class="form-control form-control-solid form-control-lg"
                                    placeholder="Nessun telefono" />
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-12 col-md-3">
                        <div class="form-group">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="font-weight-bolder mb-4">Telefono 3</label>
                            <div class="input-group input-group-lg input-group-solid">
                                <div class="input-group-prepend">
                                    <span class="input-group-text"><i class="la la-phone" /></span>
                                </div>
                                <input
                                    disabled
                                    bind:value={info.associate.phone_3}
                                    name="phone3Associate"
                                    type="text"
                                    class="form-control form-control-solid form-control-lg"
                                    placeholder="Nessun telefono" />
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-3">
                        <div class="form-group">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="font-weight-bolder mb-4">Telefono 4</label>
                            <div class="input-group input-group-lg input-group-solid">
                                <div class="input-group-prepend">
                                    <span class="input-group-text"><i class="la la-phone" /></span>
                                </div>
                                <input
                                    disabled
                                    bind:value={info.associate.phone_4}
                                    name="phone4Associate"
                                    type="text"
                                    class="form-control form-control-solid form-control-lg"
                                    placeholder="Nessun telefono" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    {/if}
</form>

<svelte:head>
    <style>
        .input-group.input-group-solid .input-group-prepend ~ .form-control {
            padding-left: 1rem !important;
        }
    </style>
</svelte:head>
