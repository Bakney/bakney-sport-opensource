<script>
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import {onMount, createEventDispatcher, onDestroy, afterUpdate} from 'svelte';
    import {
        ArrowRight,
        Envelope,
        Eye,
        FileArrowDown,
        IdentificationCard,
        Phone,
        Plus,
        User,
        Warning,
        X,
    } from 'phosphor-svelte';
    import {canPerformAction} from 'utils/Permissions';
    import BasicTag from 'components/tags/basic-tag.svelte';
    import {
        AssociateRole,
        AssociateRoleOptions,
        MembersListType,
        MembersListTypeLabel,
        MembersListTypeOptions,
    } from 'utils/enumUtils';
    import {SmartSelect} from 'components/formBuilder/preview-blocks';
    import {userData} from 'store/stores';
    import FederationSocietyData from 'routes/subscribe/wizard/partials/federation-society-data.svelte';
    import FederationAthleteData from 'routes/subscribe/wizard/partials/federation-athlete-data.svelte';
    import FederationSettings from 'routes/subscribe/wizard/partials/federation-settings.svelte';
    import {toast} from 'svelte-sonner';
    import Tessera from './subcomponents/Tessera.svelte';
    import AdditionalFields from 'routes/subscribe/wizard/partials/additional-fields.svelte';
    import BottomBarFixedSave from 'components/inputs/BottomBarFixedSave.svelte';
    import {getObjectHash} from 'utils/Functions';
    import PersonaDrawer from 'routes/association/personas/detail/PersonaDrawer.svelte';
    import TipTapEditor from 'components/inputs/TipTapEditor.svelte';

    const dispatch = createEventDispatcher();

    export let info;
    export let changes = false;

    let subscriptionForm;
    let pdfCheckInterval;
    let loadedObjectHash = null;
    let showTessera = false;

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
        // blocking UI while waiting for response
        KTApp.blockPage({
            overlayColor: '#000000',
            type: 'v2',
            state: 'primary',
            message: 'Salvataggio in corso...',
        });
        apiFetch(replaceUID(__bakney.env.API.SUBSCRIPTION.UPDATE, info.subscription_id), {
            method: 'PATCH',
            body: JSON.stringify({
                custom_data: info.custom_data,
                additional_fields: info.additional_fields,
                type: info.type || MembersListType.ASSOCIATE_AND_MEMBER,
                role: info.role || AssociateRole.SOCIO_ORDINARIO,
                status_flag: info.status_flag ?? 1,
                notes: info.notes && info.notes != '' && info.notes != '<p></p>' ? info.notes : null,
                // subscription
                start_date: info.start_date || null,
                end_date: info.end_date || null,
                acceptance_date: info.acceptance_date || null,
                resignation_date: info.resignation_date || null,
                // membership
                subscription_number: info.subscription_number || null,
                subscription_type: info.subscription_type || null,
                membership_start_date: info.membership_start_date || null,
                membership_end_date: info.membership_end_date || null,
                membership_type: info.membership_type || null,
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
                phone_label: info.associate.phone_label || null,
                phone_2_label: info.associate.phone_2_label || null,
                phone_3_label: info.associate.phone_3_label || null,
                phone_4_label: info.associate.phone_4_label || null,
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
                tutor_phone_label: info.associate.tutor?.phone_label || null,
                tutor_phone_2_label: info.associate.tutor?.phone_2_label || null,
                tutor_phone_3_label: info.associate.tutor?.phone_3_label || null,
                tutor_phone_4_label: info.associate.tutor?.phone_4_label || null,
                // optional tutors
                optional_tutors: info.associate.optional_tutors || [],
            }),
        })
            .then(res => {
                if (!res.error) {
                    toast.success('Informazioni aggiornate con successo.');
                    // Update the info object with the response data
                    info = null;
                    info = {...res.data};
                } else {
                    toast.error('Qualcosa è andato storto.');
                }
                dispatch('reset', 'info');
                setTimeout(() => {
                    info.associate.is_minor = isMinor(info?.associate?.born_date);
                }, 250);
            })
            .finally(() => {
                KTApp.unblockPage();
            });
    }

    function initForm() {
        subscriptionForm?.destroy();
        subscriptionForm = FormValidation.formValidation(document.getElementById('subscription_form'), {
            fields: {
                type: {
                    validators: {
                        notEmpty: {
                            message: 'Il tipo iscrizione è obbligatorio.',
                        },
                    },
                },
                subscription_number: {
                    validators: {
                        regexp: {
                            regexp: /^\d+$/,
                            message: 'Il numero non è valido.',
                        },
                    },
                },
                membership_start_date: {
                    validators: {
                        regexp: {
                            regexp: '^[0-9]{4}-[0-9]{2}-[0-9]{2}$',
                            flags: 'ig',
                            message: 'La data non è in un formato valido',
                        },
                        date: {
                            format: 'YYYY-MM-DD',
                            message: 'La data non è in un formato valido',
                        },
                    },
                },
                membership_end_date: {
                    validators: {
                        regexp: {
                            regexp: '^[0-9]{4}-[0-9]{2}-[0-9]{2}$',
                            flags: 'ig',
                            message: 'La data non è in un formato valido',
                        },
                        date: {
                            format: 'YYYY-MM-DD',
                            message: 'La data non è in un formato valido',
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
                        // notEmpty: {
                        //     message: 'Il sesso è obbligatorio.',
                        // },
                        regexp: {
                            regexp: '^[MFA]$', // M or F
                            flags: 'ig',
                            message: 'Il sesso non è in un formato valido (M o F)',
                        },
                    },
                },
                taxCodeAssociateTutor: {
                    validators: {
                        // notEmpty: {
                        //     message: 'Il codice fiscale è obbligatorio.',
                        // },
                        regexp: {
                            regexp: '^[a-zA-Z]{6}[0-9]{2}[abcdehlmprstABCDEHLMPRST]{1}[0-9]{2}([a-zA-Z]{1}[0-9]{3})[a-zA-Z]{1}$',
                            flags: 'ig',
                            message: 'Il codice fiscale non è in un formato valido',
                        },
                    },
                },
                bornDateAssociateTutor: {
                    validators: {
                        // notEmpty: {
                        //     message: 'La data di nascita è obbligatoria.',
                        // },
                        date: {
                            format: 'YYYY-MM-DD',
                            message: 'La data di nascita non è in un formato valido',
                        },
                    },
                },
                // bornCityAssociateTutor: {
                //     validators: {
                //         notEmpty: {
                //             message: 'La città di nascita è obbligatoria.',
                //         },
                //     },
                // },
                // addressAssociateTutor: {
                //     validators: {
                //         notEmpty: {
                //             message: "L'indirizzo di Residenza è obbligatorio.",
                //         },
                //     },
                // },
                // addressCityAssociateTutor: {
                //     validators: {
                //         notEmpty: {
                //             message: 'La città di Residenza è obbligatoria.',
                //         },
                //     },
                // },
                capAssociateTutor: {
                    validators: {
                        // notEmpty: {
                        //     message: 'Il cap della città di Residenza è obbligatorio.',
                        // },
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

    async function recoverAssociate(associateId) {
        const res = await apiFetch(replaceUID(__bakney.env.API.PERSONAS.RECOVER, associateId), {
            method: 'POST',
        });
        if (!res.error) {
            toast.success('Anagrafica ripristinata con successo.');
        } else {
            toast.error('Si è verificato un errore.');
        }
    }

    onMount(() => {
        loadedObjectHash = getObjectHash(info);
        changes = loadedObjectHash !== getObjectHash(info);
        // listener to visibleSaveBottom

        pdfCheckInterval = setInterval(() => {
            if (!info?.document_pdf) {
                dispatch('pdfcheck');
            }
        }, 1000);

        // dispatch onboarding-checklist-event with key 'view_membership'
        document.dispatchEvent(new CustomEvent('onboarding-checklist-event', {detail: {key: 'view_membership'}})); // if scrolling vertically for more than 200px, show bottom bar
    });

    afterUpdate(() => {
        changes = loadedObjectHash !== getObjectHash(info);
    });

    onDestroy(() => {
        clearInterval(pdfCheckInterval);
    });
</script>

<form id="subscription_form" on:submit|preventDefault={handleValidation}>
    {#if info?.associate}
        <div class="row pt-0 pb-4 mb-24">
            <div class="col-12 mb-4">
                <div class="row">
                    <div class="col-12 col-md-6 my-auto py-4 py-md-0">
                        <span class="font-weight-bolder my-auto">
                            Collegata all'utente
                            <a href="/#/search/profile/{info.user.username}" class="font-weight-bolder my-auto">
                                @{info.user.username} ({info.user.first_name}
                                {info.user.last_name})
                            </a>
                        </span>
                        <span class="ml-2">
                            <BasicTag label={MembersListTypeLabel[info?.type]} variant="light-success" />
                        </span>
                    </div>
                    <div class="col-12 col-md-6 my-auto text-md-right py-4 py-md-0">
                        <button
                            type="button"
                            disabled={!info.document_pdf}
                            onClick="javascript:downloadPdf('{__bakney.env.HOST +
                                '/document/retrieve/' +
                                info.document_pdf}')"
                            class="btn btn-xs btn-dark font-weight-bolder m-0 align-items-center py-2 px-4">
                            {#if info.document_pdf}
                                <FileArrowDown size={18} weight="duotone" class="mr-0 mr-md-1" />
                                Modulo
                            {:else}
                                <!-- loading spinner -->
                                <span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true" /> stampa
                                in corso...
                            {/if}
                        </button>
                        {#if !info.archived && canPerformAction('association.members.update')}
                            <button
                                disabled={!changes}
                                type="submit"
                                class="btn btn-xs btn-primary font-weight-bolder m-0 ml-2 py-2 px-4">Salva</button>
                        {/if}
                    </div>
                </div>
            </div>
            <div class="col-12 mb-8 justify-content-start">
                <button
                    type="button"
                    class="btn btn-xs btn-primary font-weight-boldest m-0 py-2 px-4 mr-2"
                    on:click={() => (showTessera = !showTessera)}>
                    <IdentificationCard size={18} weight="bold" class="mr-1" />
                    {#if showTessera}
                        Nascondi Tessera
                    {:else}
                        Mostra Tessera
                    {/if}
                </button>
                <div class="{showTessera ? 'd-flex' : 'd-none'} bg-white pt-4 justify-content-start">
                    <Tessera member={info} />
                </div>
            </div>
            <div class="col-12">
                <h3 class="text-dark font-weight-boldest mb-4">
                    Informazioni Iscrizione
                    <!-- <small style="font-size:1rem;">In federazione o interno all'associazione.</small> -->
                </h3>
                <div class="row">
                    <div class="col-12 col-lg">
                        <div class="form-group m-0">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="font-weight-bolder">Numero tessera</label>
                            <input
                                bind:value={info.subscription_number}
                                name="subscription_number"
                                type="text"
                                class="form-control form-control-solid form-control-lg"
                                placeholder="Numero tessera" />
                        </div>
                    </div>
                    <div class="col-12 col-lg">
                        <div class="form-group m-0">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="font-weight-bolder">Tipologia tessera</label>
                            <input
                                bind:value={info.subscription_type}
                                name="subscription_type"
                                type="text"
                                class="form-control form-control-solid form-control-lg"
                                placeholder="Tipologia tessera" />
                        </div>
                    </div>
                    <div class="col-12 col-lg">
                        <div class="form-group m-0">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="font-weight-bolder">Iscritto dal</label>
                            <input
                                bind:value={info.start_date}
                                name="start_date"
                                type="date"
                                class="form-control form-control-solid form-control-lg"
                                placeholder="Data della tessera" />
                        </div>
                    </div>
                    <div class="col-12 col-lg">
                        <div class="form-group m-0">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="font-weight-bolder">Scade il</label>
                            <input
                                bind:value={info.end_date}
                                name="end_date"
                                type="date"
                                class="form-control form-control-solid form-control-lg"
                                placeholder="Data scadenza tessera" />
                        </div>
                    </div>
                    <div class="col-12 col-lg">
                        <SmartSelect
                            customClasses={'min-w-100'}
                            editable={false}
                            active={false}
                            bind:value={info.type}
                            props={{
                                id: 'type',
                                name: 'type',
                                label: 'Tipo iscrizione',
                                placeholder: "Seleziona un tipo di iscrizione per l'atleta",
                                required: true,
                                options: MembersListTypeOptions,
                                value: info?.type,
                            }} />
                    </div>
                    {#if info.type === MembersListType.ASSOCIATE_ONLY || info.type === MembersListType.ASSOCIATE_AND_MEMBER}
                        <div class="col-12 col-lg">
                            <SmartSelect
                                customClasses={'min-w-100'}
                                editable={false}
                                active={false}
                                bind:value={info.role}
                                props={{
                                    id: 'role',
                                    name: 'role',
                                    label: 'Ruolo socio',
                                    placeholder: 'Seleziona il ruolo del socio',
                                    required: true,
                                    options: AssociateRoleOptions,
                                    value: info?.role,
                                }} />
                        </div>
                    {/if}
                </div>
            </div>

            {#if info?.additional_fields?.length > 0}
                <div class="col-12 col-md-4">
                    <h3 class="text-dark font-weight-boldest my-4">Campi aggiuntivi</h3>
                    <AdditionalFields bind:formData={info} />
                </div>
            {/if}

            {#if $userData.preview_and_custom_features?.find(x => x.name === 'Iscrizioni per Enti e Federazioni') !== undefined && info.custom_data != null}
                <div class="mt-12 d-flex w-100">
                    <div class="col-12 col-md-6">
                        <FederationSettings bind:formData={info} isInEdit={true} />
                    </div>
                    <div class="col-12 col-md-6">
                        {#if info.custom_data != null && ['scuola-asc', 'asd-o-ssd', 'societa'].includes(info?.custom_data?.type_of_associate || '')}
                            <FederationSocietyData bind:formData={info} />
                        {:else}
                            <FederationAthleteData bind:formData={info} />
                        {/if}
                    </div>
                </div>
            {/if}

            <div class="col-12 mt-8">
                <h3 class="text-dark font-weight-boldest mb-4">Altre informazioni</h3>
                <div class="row">
                    <div class="col-12 col-md-4 col-lg-2">
                        <SmartSelect
                            customClasses={'m-0 p-0'}
                            editable={false}
                            active={false}
                            bind:value={info.status_flag}
                            props={{
                                id: 'status_flag',
                                name: 'status_flag',
                                label: 'Stato',
                                placeholder: 'Stato iscrizione',
                                required: true,
                                options: [
                                    {label: 'Non firmata', value: 1},
                                    {label: 'In attesa', value: 2},
                                    {label: 'Rifiutata', value: 3},
                                    {label: 'Accettata', value: 4},
                                    {label: 'Ritirata', value: 5},
                                ],
                                value: info?.status_flag,
                            }} />
                    </div>
                    <div class="col-12 col-md-4 col-lg-2">
                        <div class="form-group m-0">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="font-weight-bolder">Accettata/o il</label>
                            <input
                                bind:value={info.acceptance_date}
                                name="acceptance_date"
                                type="date"
                                class="form-control form-control-solid form-control-lg"
                                placeholder="Data accettazione" />
                        </div>
                    </div>
                    <div class="col-12 col-md-4 col-lg-2">
                        <div class="form-group m-0">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="font-weight-bolder">Ritirata/o il</label>
                            <input
                                bind:value={info.resignation_date}
                                name="resignation_date"
                                type="date"
                                class="form-control form-control-solid form-control-lg"
                                placeholder="Data ritiro" />
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-12 mt-8">
                <h3 class="text-dark font-weight-boldest mb-4">Note</h3>
                <TipTapEditor mentions={false} bind:value={info.notes} placeholder="Inserisci delle note..." />
            </div>
            <div class="col-12 mt-8">
                {#if info?.associate?.associate_id}
                    <div class="p-4 border-light rounded-xl border">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h3 class="text-dark font-weight-boldest mb-0">
                                {#if $userData.preview_and_custom_features?.find(x => x.name === 'Iscrizioni per Enti e Federazioni') !== undefined && info.custom_data != null && ['scuola-asc', 'asd-o-ssd', 'societa'].includes(info?.custom_data?.type_of_associate || '')}
                                    Presidente associazione
                                {:else}
                                    Anagrafica
                                {/if}
                            </h3>
                            {#if info.associate?.deleted}
                                <div class="d-flex align-items-center" style="gap: 1rem;">
                                    <span class="font-weight-boldest text-danger"> Anagrafica eliminata </span>
                                    <button
                                        type="button"
                                        class="btn btn-sm btn-light-dark font-weight-boldest d-flex align-items-center py-1 px-2 mb-0"
                                        on:click={() => {
                                            recoverAssociate(info.associate?.associate_id);
                                            dispatch('reset', 'info');
                                        }}>
                                        Ripristina
                                    </button>
                                </div>
                            {:else}
                                <button
                                    type="button"
                                    class="btn btn-sm btn-primary font-weight-boldest d-flex align-items-center"
                                    on:click={() => {
                                        let personaDrawer = new PersonaDrawer({
                                            target: document.querySelector('#portal-elements'),
                                            intro: true,
                                            props: {
                                                associateId: info.associate?.associate_id,
                                                title: 'Anagrafica',
                                                width: '75vw',
                                            },
                                        });

                                        personaDrawer.$on('close', () => {
                                            dispatch('reset', 'info');
                                            personaDrawer.$destroy();
                                        });
                                    }}>
                                    Anagrafica <ArrowRight size={16} weight="bold" class="ml-1" />
                                </button>
                            {/if}
                        </div>
                        <div class="row">
                            <div class="col-12 px-0">
                                <!-- Personal Information -->
                                <div class="mb-4 pb-2 px-4 border-bottom border-light">
                                    <div class="d-flex align-items-center mb-3">
                                        <IdentificationCard size={24} weight="bold" class="mr-2" />
                                        <h4 class="font-weight-boldest mb-0">Informazioni Personali</h4>
                                    </div>
                                    <div class="d-flex flex-wrap">
                                        <div class="info-card mr-6 mb-2">
                                            <span class="d-block text-muted text-sm">Nome</span>
                                            <span class="font-weight-bold">{info?.associate?.first_name || '-'}</span>
                                        </div>
                                        <div class="info-card mr-6 mb-2">
                                            <span class="d-block text-muted text-sm">Cognome</span>
                                            <span class="font-weight-bold">{info?.associate?.last_name || '-'}</span>
                                        </div>
                                        <div class="info-card mr-6 mb-2">
                                            <span class="d-block text-muted text-sm">Codice Fiscale</span>
                                            <span class="font-weight-bold">{info?.associate?.tax_code || '-'}</span>
                                        </div>
                                        <div class="info-card mr-6 mb-2">
                                            <span class="d-block text-muted text-sm">Data di Nascita</span>
                                            <span class="font-weight-bold"
                                                >{info?.associate?.born_date
                                                    ? moment(info.associate.born_date).format('DD/MM/YYYY')
                                                    : '-'}</span>
                                        </div>
                                        <div class="info-card mr-6 mb-2">
                                            <span class="d-block text-muted text-sm">Città di Nascita</span>
                                            <span class="font-weight-bold">{info?.associate?.born_city || '-'}</span>
                                        </div>
                                        <div class="info-card mr-6 mb-2">
                                            <span class="d-block text-muted text-sm">Sesso</span>
                                            <span class="font-weight-bold"
                                                >{info?.associate?.sex === 'M'
                                                    ? 'Maschio'
                                                    : info?.associate?.sex === 'F'
                                                    ? 'Femmina'
                                                    : '-'}</span>
                                        </div>
                                        <div class="info-card mr-6 mb-2">
                                            <span class="d-block text-muted text-sm">Nazionalità</span>
                                            <span class="font-weight-bold">{info?.associate?.nationality || '-'}</span>
                                        </div>
                                        <div class="info-card mr-6 mb-2">
                                            <span class="d-block text-muted text-sm">Paese di Residenza</span>
                                            <span class="font-weight-bold"
                                                >{info?.associate?.nationality_residence || '-'}</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Address Information -->
                                <div class="mb-4 pb-2 px-4 border-bottom border-light">
                                    <div class="d-flex align-items-center mb-3">
                                        <User size={24} weight="bold" class="mr-2" />
                                        <h4 class="font-weight-boldest mb-0">Indirizzo</h4>
                                    </div>
                                    <div class="d-flex flex-wrap">
                                        <div class="info-card mr-6 mb-2">
                                            <span class="d-block text-muted text-sm">Indirizzo</span>
                                            <span class="font-weight-bold">{info?.associate?.address || '-'}</span>
                                        </div>
                                        <div class="info-card mr-6 mb-2">
                                            <span class="d-block text-muted text-sm">Città</span>
                                            <span class="font-weight-bold">{info?.associate?.address_city || '-'}</span>
                                        </div>
                                        <div class="info-card mr-6 mb-2">
                                            <span class="d-block text-muted text-sm">CAP</span>
                                            <span class="font-weight-bold">{info?.associate?.address_cap || '-'}</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Contact Information -->
                                <div class="mb-4 pb-2 px-4 border-bottom border-light">
                                    <div class="d-flex align-items-center mb-3">
                                        <Phone size={24} weight="bold" class="mr-2" />
                                        <h4 class="font-weight-boldest mb-0">Contatti</h4>
                                    </div>
                                    <div class="d-flex flex-wrap">
                                        <div class="info-card mr-6 mb-2">
                                            <span class="d-block text-muted text-sm">Email</span>
                                            <span class="font-weight-bold">{info?.associate?.email || '-'}</span>
                                        </div>
                                        {#each [{phone: info?.associate?.phone, label: info?.associate?.phone_label}, {phone: info?.associate?.phone_2, label: info?.associate?.phone_2_label}, {phone: info?.associate?.phone_3, label: info?.associate?.phone_3_label}, {phone: info?.associate?.phone_4, label: info?.associate?.phone_4_label}] as phoneInfo, i}
                                            {#if phoneInfo.phone}
                                                <div class="info-card mr-6 mb-2">
                                                    <span class="d-block text-muted text-sm"
                                                        >Telefono {i > 0 ? i + 1 : ''}</span>
                                                    <span class="font-weight-bold">
                                                        {phoneInfo.phone}
                                                        {#if phoneInfo.label}
                                                            <span class="text-muted text-sm ml-1"
                                                                >({phoneInfo.label})</span>
                                                        {/if}
                                                    </span>
                                                </div>
                                            {/if}
                                        {/each}
                                    </div>
                                </div>

                                <!-- Tutors Information -->
                                {#if info?.associate?.tutors?.length > 0}
                                    <div class="pb-2 px-4">
                                        <div class="d-flex align-items-center mb-3">
                                            <User size={24} weight="bold" class="mr-2" />
                                            <h4 class="font-weight-boldest mb-0">Tutori</h4>
                                        </div>
                                        {#each info.associate.tutors as tutor, index}
                                            <div>
                                                <h5 class="font-weight-boldest mb-2">
                                                    Tutore {index + 1}
                                                    {#if tutor?.tutor?.first_name || tutor?.tutor?.last_name}
                                                        (
                                                        {#if tutor?.tutor?.first_name}
                                                            {tutor?.tutor?.first_name} {tutor?.tutor?.last_name}
                                                        {:else}
                                                            {tutor?.tutor?.name} {tutor?.tutor?.surname}
                                                        {/if})
                                                    {/if}
                                                </h5>
                                                <div class="p-0">
                                                    <div class="d-flex flex-wrap">
                                                        <div class="info-card mr-6 mb-2">
                                                            <span class="d-block text-muted text-sm">Nome</span>
                                                            <span class="font-weight-bold"
                                                                >{tutor?.tutor?.first_name || '-'}</span>
                                                        </div>
                                                        <div class="info-card mr-6 mb-2">
                                                            <span class="d-block text-muted text-sm">Cognome</span>
                                                            <span class="font-weight-bold"
                                                                >{tutor?.tutor?.last_name || '-'}</span>
                                                        </div>
                                                        <div class="info-card mr-6 mb-2">
                                                            <span class="d-block text-muted text-sm"
                                                                >Codice Fiscale</span>
                                                            <span class="font-weight-bold"
                                                                >{tutor?.tutor?.tax_code || '-'}</span>
                                                        </div>
                                                        <div class="info-card mr-6 mb-2">
                                                            <span class="d-block text-muted text-sm"
                                                                >Data di Nascita</span>
                                                            <span class="font-weight-bold"
                                                                >{tutor?.tutor?.born_date
                                                                    ? moment(tutor?.tutor?.born_date).format(
                                                                          'DD/MM/YYYY'
                                                                      )
                                                                    : '-'}</span>
                                                        </div>
                                                        <div class="info-card mr-6 mb-2">
                                                            <span class="d-block text-muted text-sm"
                                                                >Città di Nascita</span>
                                                            <span class="font-weight-bold"
                                                                >{tutor?.tutor?.born_city || '-'}</span>
                                                        </div>
                                                        <div class="info-card mr-6 mb-2">
                                                            <span class="d-block text-muted text-sm">Email</span>
                                                            <span class="font-weight-bold"
                                                                >{tutor?.tutor?.email || '-'}</span>
                                                        </div>
                                                        <div class="info-card mr-6 mb-2">
                                                            <span class="d-block text-muted text-sm">Telefono</span>
                                                            <span class="font-weight-bold">
                                                                {tutor?.tutor?.phone
                                                                    ? `${tutor?.tutor?.phone} ${
                                                                          tutor?.tutor?.phone_label
                                                                              ? `(${tutor?.tutor?.phone_label})`
                                                                              : ''
                                                                      }`
                                                                    : '-'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        {/each}
                                    </div>
                                {:else}
                                    <div class="px-4 font-size-xs text-dark-50 text-center font-weight-bold">
                                        Nessun tutore collegato.
                                    </div>
                                {/if}
                            </div>
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    {/if}
</form>

<!-- <GoBackListener bind:changes /> -->

<BottomBarFixedSave
    target="#portal-save-foreground"
    visible={true}
    customStyle={KTUtil.isMobileDevice() ? '' : `width: 85vw;right: 0;left: auto;`}
    on:save={updateInfo}>
    <div slot="left" class="d-flex align-items-center">
        <Warning weight={'duotone'} size={18} class="mr-2 text-warning" />
        <p class="font-weight-boldest mb-0 text-warning text-xs">Ricordati di salvare per applicare le modifiche.</p>
    </div>
</BottomBarFixedSave>

<svelte:head>
    <style>
        .input-group.input-group-solid .input-group-prepend ~ .form-control {
            padding-left: 1rem !important;
        }
        .info-card {
            min-width: 100px;
        }
    </style>
</svelte:head>
