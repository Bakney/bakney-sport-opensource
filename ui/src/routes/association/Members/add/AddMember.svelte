<script>
    import {push, replace} from 'svelte-spa-router';
    import {
        newUserAccount,
        newAssociate,
        signature,
        medicalCertificate,
        paymentMethod,
        sessionToken,
        userData,
    } from 'store/stores.js';
    import Section1 from './sections/Section1.svelte';
    import Section2 from './sections/Section2.svelte';
    import Section3 from './sections/Section3.svelte';
    import Section4 from './sections/Section4.svelte';
    // import Section5 from './sections/Section5.svelte';
    import Section6 from './sections/Section6.svelte';
    import {scale} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import {apiFetch} from 'utils/ApiMiddleware.js';
    import {createEventDispatcher, onMount} from 'svelte';
    import {AssociateRole, MembersListType} from 'utils/enumUtils';
    import {toast} from 'svelte-sonner';
    import BackButton from 'components/buttons/BackButton.svelte';

    const dipatch = createEventDispatcher();

    newUserAccount.useLocalStorage();
    newAssociate.useLocalStorage();
    signature.useLocalStorage();
    // paymentMethod.useLocalStorage();
    sessionToken.useLocalStorage();
    medicalCertificate.useLocalStorage();

    export let inModal = false;
    export let opts;
    export let configuration;

    let currentWizardStep = 0;
    let saveDraftButton;

    newUserAccount.set({
        new_member: false,
        new_member_info: {
            first_name: '',
            last_name: '',
            phone: '',
            email: '',
        },
    });
    newAssociate.set({
        associate_data: {
            type: MembersListType.ASSOCIATE_AND_MEMBER,
            role: AssociateRole.SOCIO_ORDINARIO,
            is_minor: false,
            first_name: '',
            last_name: '',
            sex: 'F',
            tax_code: '',
            born_date: '01/01/2000',
            born_city: '',
            address: '',
            address_city: '',
            address_cap: '',
            phone: '',
            email: '',
        },
        associate_tutor_data: {
            first_name: '',
            last_name: '',
            sex: 'F',
            tax_code: '',
            born_date: '01/01/1990',
            born_city: '',
            address: '',
            address_city: '',
            address_cap: '',
            phone: '',
            email: '',
        },
    });
    medicalCertificate.set({
        medical_id: null,
        filename: '',
    });
    signature.set({
        there_is_signature: false,
        data: '',
    });
    // paymentMethod.set({
    // 	type: "cash"
    // });

    // $: showWizardDraftButton = !isModal;

    async function createSubscription() {
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Inserimento in corso...',
        });

        const url = __bakney.env.HOST + '/subscription/add';

        // reformat certificate_expring_date
        $medicalCertificate.certificate_expring_date = moment(
            $medicalCertificate.certificate_expring_date,
            'DD/MM/YYYY'
        ).format('YYYY-MM-DD');

        let bodyRequest = {
            new_user_account: $newUserAccount,
            associate_data: $newAssociate.associate_data,
            associate_tutor_data: $newAssociate.associate_data.is_minor ? $newAssociate.associate_tutor_data : null,
            medical_certificate: $medicalCertificate,
            signature: $signature,
            // "payment": $paymentMethod,
        };
        if ($newUserAccount.plan_id) bodyRequest.plan_id = $newUserAccount.plan_id.value;
        if ($newUserAccount.membership_plan_id)
            bodyRequest.membership_plan_id = $newUserAccount.membership_plan_id.value;

        if (inModal) {
            bodyRequest.sport_association = opts?.username;
        }

        if (bodyRequest?.associate_tutor_data?.address_cap == '') {
            bodyRequest.associate_tutor_data.address_cap = null;
        }

        const res = await window.fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + $sessionToken,
            },
            body: JSON.stringify(bodyRequest),
        });

        const response = await res.json();
        // spinner stop
        KTApp.unblockPage();

        let result = JSON.stringify(response);
        if (res.status == 200) {
            if (!inModal) replace('/members/list');
            else jQuery('#subscriptionModal').modal('hide');
            toast.success('Nuova iscrizione creata con successo.');
            dipatch('subscriptionCreated');
            // dispatch onboarding-checklist-event
            document.dispatchEvent(new CustomEvent('onboarding-checklist-event', {detail: {key: 'create_membership'}}));
        } else if (res.status == 400 || response.code == 409) {
            swal.fire({
                text: response.msg || 'Alcuni dati inseriti non sono validi, ricontrollali.',
                icon: 'warning',
                buttonsStyling: false,
                confirmButtonText: 'Ok!',
                customClass: {
                    confirmButton: 'btn font-weight-bold btn-light-primary',
                },
            }).then(function () {
                KTUtil.scrollTop();
            });
        } else {
            let modalText = 'Scusa, ho individuato degli errori, riprova.';
            if (res.status == 409) {
                modalText = 'Questa iscrizione è già presente.';
            }
            swal.fire({
                text: modalText,
                icon: 'error',
                buttonsStyling: false,
                confirmButtonText: 'Ok!',
                customClass: {
                    confirmButton: 'btn font-weight-bold btn-light-primary',
                },
            }).then(function () {
                KTUtil.scrollTop();
            });
        }
    }

    var KTWizard2 = (function () {
        // Base elements
        var _wizardEl;
        var _formEl;
        var _wizardObj;
        var _validations = [];

        // Private functions
        var _initWizard = function () {
            // Initialize form wizard
            _wizardObj = new KTWizard(_wizardEl, {
                startStep: 1, // initial active step number
                clickableSteps: false, // allow step clicking
            });

            // Validation before going to next page
            _wizardObj.on('change', function (wizard) {
                currentWizardStep = wizard.getStep();
                if (wizard.getStep() > wizard.getNewStep()) {
                    return; // Skip if stepped back
                }

                // Validate form before change wizard step
                var validator = _validations[wizard.getStep() - 1]; // get validator for current step

                if (validator) {
                    validator.validate().then(function (status) {
                        // if it is valid or if I don't decide to create a new user
                        if (status == 'Valid') {
                            wizard.goTo(wizard.getNewStep());

                            KTUtil.scrollTop();
                        } else {
                            Swal.fire({
                                text: 'Ops, sembra ci siano degli errori, riprova per favore.',
                                icon: 'error',
                                buttonsStyling: false,
                                confirmButtonText: 'Ok, capito!',
                                customClass: {
                                    confirmButton: 'btn font-weight-bold btn-light',
                                },
                            }).then(function () {
                                KTUtil.scrollTop();
                            });
                        }
                    });
                }

                return false; // Do not change wizard step, further action will be handled by he validator
            });

            // Change event
            _wizardObj.on('changed', function (wizard) {
                currentWizardStep = wizard.getStep();
                KTUtil.scrollTop();
            });

            // Submit event
            _wizardObj.on('submit', function (wizard) {
                Swal.fire({
                    text: 'Hai inserito i dati corretti? Controlla prima di continuare.',
                    icon: 'question',
                    showCancelButton: true,
                    buttonsStyling: false,
                    confirmButtonText: 'Continua',
                    cancelButtonText: 'Ricontrolla',
                    reverseButtons: true,
                    customClass: {
                        confirmButton: 'btn font-weight-bold btn-primary',
                        cancelButton: 'btn font-weight-bold btn-default',
                    },
                }).then(function (result) {
                    if (result.value) {
                        createSubscription();
                    }
                });
            });
        };

        var _initValidation = function () {
            // console.info(configuration);
            // mandatory fields based on configuration
            let configurationMandatoryEmail = configuration?.mandatory_email
                ? {
                      notEmpty: {message: "L'indirizzo email è obbligatorio."},
                      emailAddress: {message: 'Non è un indirizzo email valido.'},
                  }
                : {};
            let configurationMandatoryPhone = configuration?.mandatory_phone
                ? {
                      notEmpty: {message: 'Il numero di telefono è obbligatorio.'},
                      phone: {country: 'IT', message: 'Non è un numero di telefono valido.'},
                  }
                : {};

            let configurationMandatoryTutorEmail = configuration?.mandatory_tutor_email
                ? {
                      notEmpty: {message: "L'indirizzo email è obbligatorio."},
                      emailAddress: {message: 'Non è un indirizzo email valido.'},
                  }
                : {};
            let configurationMandatoryTutorPhone = configuration?.mandatory_tutor_phone
                ? {
                      notEmpty: {message: 'Il numero di telefono è obbligatorio.'},
                      phone: {country: 'IT', message: 'Non è un numero di telefono valido.'},
                  }
                : {};

            // Init form validation rules. For more info check the FormValidation plugin's official documentation:https://formvalidation.io/
            // Step 1
            _validations.push(
                FormValidation.formValidation(_formEl, {
                    fields: {
                        fname: {
                            validators: {
                                notEmpty: {
                                    message: 'Il nome è obbligatorio.',
                                },
                            },
                        },
                        lname: {
                            validators: {
                                notEmpty: {
                                    message: 'Il cognome è obbligatorio.',
                                },
                            },
                        },
                        email: {
                            validators: {
                                notEmpty: {
                                    message: "L'indirizzo email è obbligatorio.",
                                },
                                emailAddress: {
                                    message: 'Non è un indirizzo email valido.',
                                },
                                remote: {
                                    message: "L'indirizzo email è già stato utilizzato per creare un utente.",
                                    method: 'GET',
                                    url: __bakney.env.HOST + '/oauth2/check/email',
                                },
                            },
                        },
                        // plan_id: {
                        //     validators: {
                        //         notEmpty: {
                        //             message: 'Il piano è obbligatorio.',
                        //         },
                        //     },
                        // },
                    },
                    plugins: {
                        excluded: new FormValidation.plugins.Excluded({
                            excluded: function () {
                                return !$newUserAccount.new_member;
                            },
                        }),
                        trigger: new FormValidation.plugins.Trigger(),
                        bootstrap: new FormValidation.plugins.Bootstrap(),
                    },
                })
            );

            // Step 2
            _validations.push(
                FormValidation.formValidation(_formEl, {
                    fields: {
                        type: {
                            validators: {
                                notEmpty: {
                                    message: 'Il tipo iscrizione è obbligatorio.',
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
                            },
                        },
                        // firstNameAssociateTutor: {
                        //     validators: {
                        //         notEmpty: {
                        //             message: 'Il nome è obbligatorio.',
                        //         },
                        //     },
                        // },
                        // lastNameAssociateTutor: {
                        //     validators: {
                        //         notEmpty: {
                        //             message: 'Il cognome è obbligatorio.',
                        //         },
                        //     },
                        // },
                        // sexAssociateTutor: {
                        //     validators: {
                        //         notEmpty: {
                        //             message: 'Il sesso è obbligatorio.',
                        //         },
                        //     },
                        // },
                        // taxCodeAssociateTutor: {
                        //     validators: {
                        //         notEmpty: {
                        //             message: 'Il codice fiscale è obbligatorio.',
                        //         },
                        //     },
                        // },
                        // bornDateAssociateTutor: {
                        //     validators: {
                        //         notEmpty: {
                        //             message: 'La data di nascita è obbligatoria.',
                        //         },
                        //     },
                        // },
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
                        // capAssociateTutor: {
                        //     validators: {
                        //         notEmpty: {
                        //             message: 'Il cap della città di Residenza è obbligatorio.',
                        //         },
                        //     },
                        // },
                        phoneAssociate: {
                            validators: configurationMandatoryPhone,
                        },
                        emailAssociate: {
                            validators: configurationMandatoryEmail,
                        },
                        phoneAssociateTutor: {
                            validators: configurationMandatoryTutorPhone,
                        },
                        emailTAssociateTutor: {
                            validators: configurationMandatoryTutorEmail,
                        },
                    },
                    plugins: {
                        excluded: new FormValidation.plugins.Excluded({
                            excluded: function (field, ele, eles) {
                                if (!$newAssociate.associate_data.is_minor && String(field).includes('Tutor')) {
                                    let emailAssociate = configuration?.mandatory_email
                                        ? $newAssociate.associate_data.email !== ''
                                        : true;
                                    let phoneAssociate = configuration?.mandatory_phone
                                        ? $newAssociate.associate_data.phone !== ''
                                        : true;
                                    // tutor
                                    let emailAssociateTutor = configuration?.mandatory_tutor_email
                                        ? $newAssociate.associate_data.email !== ''
                                        : true;
                                    let phoneAssociateTutor = configuration?.mandatory_tutor_phone
                                        ? $newAssociate.associate_data.phone !== ''
                                        : true;
                                    return (
                                        emailAssociate && phoneAssociate && emailAssociateTutor && phoneAssociateTutor
                                    );
                                }
                                return false;
                            },
                        }),
                        trigger: new FormValidation.plugins.Trigger(),
                        bootstrap: new FormValidation.plugins.Bootstrap(),
                    },
                })
            );

            // Step 3
            _validations.push(
                FormValidation.formValidation(_formEl, {
                    fields: {},
                    plugins: {
                        trigger: new FormValidation.plugins.Trigger(),
                        bootstrap: new FormValidation.plugins.Bootstrap(),
                    },
                })
            );

            // Step 4
            _validations.push(
                FormValidation.formValidation(_formEl, {
                    fields: {},
                    plugins: {
                        trigger: new FormValidation.plugins.Trigger(),
                        bootstrap: new FormValidation.plugins.Bootstrap(),
                    },
                })
            );

            // Step 5
            _validations.push(
                FormValidation.formValidation(_formEl, {
                    fields: {},
                    plugins: {
                        trigger: new FormValidation.plugins.Trigger(),
                        bootstrap: new FormValidation.plugins.Bootstrap(),
                        excluded: new FormValidation.plugins.Excluded({excluded: false}),
                    },
                })
            );

            // Step 6
            _validations.push(
                FormValidation.formValidation(_formEl, {
                    fields: {},
                    plugins: {
                        trigger: new FormValidation.plugins.Trigger(),
                        bootstrap: new FormValidation.plugins.Bootstrap(),
                    },
                })
            );
        };

        return {
            // public functions
            init: function () {
                _wizardEl = KTUtil.getById('kt_wizard');
                _formEl = KTUtil.getById('kt_form');

                _initWizard();
                _initValidation();
            },
        };
    })();

    // Execute a function when the user releases a key on the keyboard
    window.addEventListener('keyup', function (event) {
        if (event.defaultPrevented) {
            return; // Do nothing if the event was already processed
        }

        switch (event.key) {
            case 'Enter':
                let confirm = document.getElementsByClassName('swal2-confirm');
                if (confirm.length > 0) {
                    confirm[0].click();
                    break;
                }
                let nextStep = document.getElementById('next-step');
                if (nextStep !== null) {
                    nextStep.click();
                    break;
                }
                break;
            default:
                return; // Quit when this doesn't handle the key event.
        }
    });

    async function saveDraft() {
        KTUtil.btnWait(saveDraftButton, 'spinner spinner-right spinner-white pr-15', 'In attesa...');

        let res = await apiFetch(__bakney.env.API.SUBSCRIPTION.ASSOCIATES_DRAFT.ADD, {
            method: 'POST',
            body: JSON.stringify({
                new_user_account: $newUserAccount || null,
                associate_data: $newAssociate.associate_data || null,
                associate_tutor_data: $newAssociate.associate_tutor_data || null,
                signature: $signature || null,
                medical_certificate: $medicalCertificate || null,
            }),
        });

        KTUtil.btnRelease(saveDraftButton);

        if (!res.error) {
            toast.success('Bozza salvata con successo.');

            push('/members/list');
        } else {
            toast.error('Qualcosa è andato storto.');
        }
    }

    onMount(() => {
        jQuery(document).ready(function () {
            KTWizard2.init();
        });
    });
</script>

<!--begin::Container-->
<div
    in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}}
    class="container container-overlay"
    style={inModal ? 'padding:0;' : ''}>
    <div class="card card-custom">
        <div class="card-header py-3 header-mobile-btn-back">
            <div class="card-toolbar">
                {#if !inModal}
                    <BackButton />
                {:else}
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <i aria-hidden="true" class="ki ki-close" />
                    </button>
                {/if}
            </div>
            <h3 class="card-title font-size-h2">
                {!inModal ? 'Nuovo Socio o Tesserato' : 'Modulo di Richiesta Iscrizione'}
            </h3>
            <div class="card-toolbar" />
        </div>
        <div class="card-body p-0">
            <!--begin: Wizard-->
            <div class="wizard wizard-2" id="kt_wizard" data-wizard-state="step-first" data-wizard-clickable="false">
                <!--begin: Wizard Nav-->
                <div class="wizard-nav flex-lg-shrink-0 w-lg-300px w-xl-375px border-right py-8 px-8 py-lg-20 px-lg-10">
                    <!--begin::Wizard Step 1 Nav-->
                    <div class="wizard-steps">
                        <div class="wizard-step" data-wizard-type="step" data-wizard-state="current">
                            <div class="wizard-icon">
                                <span class="wizard-number">1</span>
                                <span class="wizard-check">
                                    <span class="svg-icon svg-icon-2x">
                                        <!--begin::Svg Icon | path:assets/media/svg/icons/Navigation/Check.svg-->
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            xmlns:xlink="http://www.w3.org/1999/xlink"
                                            width="24px"
                                            height="24px"
                                            viewBox="0 0 24 24"
                                            version="1.1">
                                            <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                                <polygon points="0 0 24 0 24 24 0 24" />
                                                <path
                                                    d="M6.26193932,17.6476484 C5.90425297,18.0684559 5.27315905,18.1196257 4.85235158,17.7619393 C4.43154411,17.404253 4.38037434,16.773159 4.73806068,16.3523516 L13.2380607,6.35235158 C13.6013618,5.92493855 14.2451015,5.87991302 14.6643638,6.25259068 L19.1643638,10.2525907 C19.5771466,10.6195087 19.6143273,11.2515811 19.2474093,11.6643638 C18.8804913,12.0771466 18.2484189,12.1143273 17.8356362,11.7474093 L14.0997854,8.42665306 L6.26193932,17.6476484 Z"
                                                    fill="#000000"
                                                    fill-rule="nonzero"
                                                    transform="translate(11.999995, 12.000002) rotate(-180.000000) translate(-11.999995, -12.000002)" />
                                            </g>
                                        </svg>
                                        <!--end::Svg Icon-->
                                    </span>
                                </span>
                            </div>
                            <div class="wizard-label">
                                {#if inModal}
                                    <h3 class="wizard-title">Account del Socio</h3>
                                    <div class="wizard-desc">
                                        Il socio sarà collegato all'account
                                        <b>{$userData.first_name} {$userData.last_name}</b>
                                    </div>
                                {:else}
                                    <h3 class="wizard-title">Account Socio / Tesserato</h3>
                                    <div class="wizard-desc">Inserisci i dettagli per l'account e le quote</div>
                                {/if}
                            </div>
                        </div>
                        <!--end::Wizard Step 1 Nav-->
                        <!--begin::Wizard Step 2 Nav-->
                        <div class="wizard-step" data-wizard-type="step">
                            <div class="wizard-icon">
                                <span class="wizard-number">2</span>
                                <span class="wizard-check">
                                    <span class="svg-icon svg-icon-2x">
                                        <!--begin::Svg Icon | path:assets/media/svg/icons/Navigation/Check.svg-->
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            xmlns:xlink="http://www.w3.org/1999/xlink"
                                            width="24px"
                                            height="24px"
                                            viewBox="0 0 24 24"
                                            version="1.1">
                                            <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                                <polygon points="0 0 24 0 24 24 0 24" />
                                                <path
                                                    d="M6.26193932,17.6476484 C5.90425297,18.0684559 5.27315905,18.1196257 4.85235158,17.7619393 C4.43154411,17.404253 4.38037434,16.773159 4.73806068,16.3523516 L13.2380607,6.35235158 C13.6013618,5.92493855 14.2451015,5.87991302 14.6643638,6.25259068 L19.1643638,10.2525907 C19.5771466,10.6195087 19.6143273,11.2515811 19.2474093,11.6643638 C18.8804913,12.0771466 18.2484189,12.1143273 17.8356362,11.7474093 L14.0997854,8.42665306 L6.26193932,17.6476484 Z"
                                                    fill="#000000"
                                                    fill-rule="nonzero"
                                                    transform="translate(11.999995, 12.000002) rotate(-180.000000) translate(-11.999995, -12.000002)" />
                                            </g>
                                        </svg>
                                        <!--end::Svg Icon-->
                                    </span>
                                </span>
                            </div>
                            <div class="wizard-label">
                                <h3 class="wizard-title">Dati anagrafici</h3>
                                <div class="wizard-desc">Compila i dati anagrafici</div>
                            </div>
                        </div>
                        <!--end::Wizard Step 2 Nav-->
                        <!--begin::Wizard Step 3 Nav-->
                        <div class="wizard-step" data-wizard-type="step">
                            <div class="wizard-icon">
                                <span class="wizard-number">3</span>
                                <span class="wizard-check">
                                    <span class="svg-icon svg-icon-2x">
                                        <!--begin::Svg Icon | path:assets/media/svg/icons/Navigation/Check.svg-->
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            xmlns:xlink="http://www.w3.org/1999/xlink"
                                            width="24px"
                                            height="24px"
                                            viewBox="0 0 24 24"
                                            version="1.1">
                                            <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                                <polygon points="0 0 24 0 24 24 0 24" />
                                                <path
                                                    d="M6.26193932,17.6476484 C5.90425297,18.0684559 5.27315905,18.1196257 4.85235158,17.7619393 C4.43154411,17.404253 4.38037434,16.773159 4.73806068,16.3523516 L13.2380607,6.35235158 C13.6013618,5.92493855 14.2451015,5.87991302 14.6643638,6.25259068 L19.1643638,10.2525907 C19.5771466,10.6195087 19.6143273,11.2515811 19.2474093,11.6643638 C18.8804913,12.0771466 18.2484189,12.1143273 17.8356362,11.7474093 L14.0997854,8.42665306 L6.26193932,17.6476484 Z"
                                                    fill="#000000"
                                                    fill-rule="nonzero"
                                                    transform="translate(11.999995, 12.000002) rotate(-180.000000) translate(-11.999995, -12.000002)" />
                                            </g>
                                        </svg>
                                        <!--end::Svg Icon-->
                                    </span>
                                </span>
                            </div>
                            <div class="wizard-label">
                                <h3 class="wizard-title">Firma del documento</h3>
                                <div class="wizard-desc">Firma direttamente ora il documento.</div>
                            </div>
                        </div>
                        <!--end::Wizard Step 3 Nav-->
                        <!--begin::Wizard Step 4 Nav-->
                        <div class="wizard-step" data-wizard-type="step">
                            <div class="wizard-icon">
                                <span class="wizard-number">4</span>
                                <span class="wizard-check">
                                    <span class="svg-icon svg-icon-2x">
                                        <!--begin::Svg Icon | path:assets/media/svg/icons/Navigation/Check.svg-->
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            xmlns:xlink="http://www.w3.org/1999/xlink"
                                            width="24px"
                                            height="24px"
                                            viewBox="0 0 24 24"
                                            version="1.1">
                                            <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                                <polygon points="0 0 24 0 24 24 0 24" />
                                                <path
                                                    d="M6.26193932,17.6476484 C5.90425297,18.0684559 5.27315905,18.1196257 4.85235158,17.7619393 C4.43154411,17.404253 4.38037434,16.773159 4.73806068,16.3523516 L13.2380607,6.35235158 C13.6013618,5.92493855 14.2451015,5.87991302 14.6643638,6.25259068 L19.1643638,10.2525907 C19.5771466,10.6195087 19.6143273,11.2515811 19.2474093,11.6643638 C18.8804913,12.0771466 18.2484189,12.1143273 17.8356362,11.7474093 L14.0997854,8.42665306 L6.26193932,17.6476484 Z"
                                                    fill="#000000"
                                                    fill-rule="nonzero"
                                                    transform="translate(11.999995, 12.000002) rotate(-180.000000) translate(-11.999995, -12.000002)" />
                                            </g>
                                        </svg>
                                        <!--end::Svg Icon-->
                                    </span>
                                </span>
                            </div>
                            <div class="wizard-label">
                                <h3 class="wizard-title">Certificato Medico</h3>
                                <div class="wizard-desc">Carica il certificato medico per i tesserati.</div>
                            </div>
                        </div>
                        <!--end::Wizard Step 4 Nav-->
                        <!--begin::Wizard Step 5 Nav-->
                        <!-- <div class="wizard-step" data-wizard-type="step">
                            <div class="wizard-icon">
                                <span class="wizard-number">5</span>
                                <span class="wizard-check">
                                    <span class="svg-icon svg-icon-2x"> -->
                        <!--begin::Svg Icon | path:assets/media/svg/icons/Navigation/Check.svg-->
                        <!-- <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24px" height="24px" viewBox="0 0 24 24" version="1.1">
                                            <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                                <polygon points="0 0 24 0 24 24 0 24" />
                                                <path d="M6.26193932,17.6476484 C5.90425297,18.0684559 5.27315905,18.1196257 4.85235158,17.7619393 C4.43154411,17.404253 4.38037434,16.773159 4.73806068,16.3523516 L13.2380607,6.35235158 C13.6013618,5.92493855 14.2451015,5.87991302 14.6643638,6.25259068 L19.1643638,10.2525907 C19.5771466,10.6195087 19.6143273,11.2515811 19.2474093,11.6643638 C18.8804913,12.0771466 18.2484189,12.1143273 17.8356362,11.7474093 L14.0997854,8.42665306 L6.26193932,17.6476484 Z" fill="#000000" fill-rule="nonzero" transform="translate(11.999995, 12.000002) rotate(-180.000000) translate(-11.999995, -12.000002)" />
                                            </g>
                                        </svg> -->
                        <!--end::Svg Icon-->
                        <!-- </span>
                                </span>
                            </div>
                            <div class="wizard-label">
                                <h3 class="wizard-title">Tipo di Pagamento</h3>
                                <div class="wizard-desc">Seleziona il tipo di pagamento</div>
                            </div>
                        </div> -->
                        <!--end::Wizard Step 5 Nav-->
                        <!--begin::Wizard Step 6 Nav-->
                        <div class="wizard-step" data-wizard-type="step">
                            <div class="wizard-icon">
                                <!-- Change to 6 if payment option active again -->
                                <span class="wizard-number">5</span>
                                <span class="wizard-check">
                                    <span class="svg-icon svg-icon-2x">
                                        <!--begin::Svg Icon | path:assets/media/svg/icons/Navigation/Check.svg-->
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            xmlns:xlink="http://www.w3.org/1999/xlink"
                                            width="24px"
                                            height="24px"
                                            viewBox="0 0 24 24"
                                            version="1.1">
                                            <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                                <polygon points="0 0 24 0 24 24 0 24" />
                                                <path
                                                    d="M6.26193932,17.6476484 C5.90425297,18.0684559 5.27315905,18.1196257 4.85235158,17.7619393 C4.43154411,17.404253 4.38037434,16.773159 4.73806068,16.3523516 L13.2380607,6.35235158 C13.6013618,5.92493855 14.2451015,5.87991302 14.6643638,6.25259068 L19.1643638,10.2525907 C19.5771466,10.6195087 19.6143273,11.2515811 19.2474093,11.6643638 C18.8804913,12.0771466 18.2484189,12.1143273 17.8356362,11.7474093 L14.0997854,8.42665306 L6.26193932,17.6476484 Z"
                                                    fill="#000000"
                                                    fill-rule="nonzero"
                                                    transform="translate(11.999995, 12.000002) rotate(-180.000000) translate(-11.999995, -12.000002)" />
                                            </g>
                                        </svg>
                                        <!--end::Svg Icon-->
                                    </span>
                                </span>
                            </div>
                            <div class="wizard-label">
                                <h3 class="wizard-title">Conferma</h3>
                                <div class="wizard-desc">Controlla le informazioni.</div>
                            </div>
                        </div>
                        <!--end::Wizard Step 6 Nav-->
                    </div>
                </div>
                <!--end: Wizard Nav-->
                <!--begin: Wizard Body-->
                <div class="wizard-body py-8 px-8 py-lg-20 px-lg-10">
                    <!--begin: Wizard Form-->
                    <div class="row">
                        <div class="offset-xxl-1 col-xxl-10">
                            <form class="form" id="kt_form">
                                <!--begin: Wizard Step 1-->
                                {#if opts?.searchData}
                                    <Section1 searchData={opts?.searchData?.user} />
                                {:else}
                                    <Section1 />
                                {/if}
                                <!--end: Wizard Step 1-->

                                <!--begin: Wizard Step 2-->
                                <Section2 bind:configuration />
                                <!--end: Wizard Step 2-->

                                <!--begin: Wizard Step 3-->

                                <Section3 bind:configuration bind:currentWizardStep />

                                <!--end: Wizard Step 3-->
                                <!--begin: Wizard Step 4-->
                                <Section4 />
                                <!--end: Wizard Step 4-->
                                <!--begin: Wizard Step 5-->
                                <!-- THIS IS THE PAYMENT SECTION -->
                                <!-- <Section5 /> -->
                                <!--end: Wizard Step 5-->
                                <!--begin: Wizard Step 6-->
                                <Section6 {inModal} />
                                <!--end: Wizard Step 6-->
                                <!--begin: Wizard Actions-->
                                <div class="d-flex justify-content-between border-top mt-0 mt-md-5 pt-5 pt-md-10">
                                    <!-- {#if !inModal || currentWizardStep > 2} -->
                                    <div
                                        class="mr-2"
                                        style="{!inModal || currentWizardStep > 1 ? '' : 'visibility:hidden'};">
                                        <button
                                            type="button"
                                            id="prev-step"
                                            class="btn btn-light-primary font-weight-bolder px-10 py-3"
                                            data-wizard-type="action-prev">
                                            <span class="svg-icon svg-icon-md mr-3">
                                                <!--begin::Svg Icon | path:assets/media/svg/icons/Navigation/Arrow-left.svg-->
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    xmlns:xlink="http://www.w3.org/1999/xlink"
                                                    width="24px"
                                                    height="24px"
                                                    viewBox="0 0 24 24"
                                                    version="1.1">
                                                    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                                        <polygon points="0 0 24 0 24 24 0 24" />
                                                        <rect
                                                            fill="#000000"
                                                            opacity="0.3"
                                                            transform="translate(12.000000, 12.000000) scale(-1, 1) rotate(-90.000000) translate(-12.000000, -12.000000)"
                                                            x="11"
                                                            y="5"
                                                            width="2"
                                                            height="14"
                                                            rx="1" />
                                                        <path
                                                            d="M3.7071045,15.7071045 C3.3165802,16.0976288 2.68341522,16.0976288 2.29289093,15.7071045 C1.90236664,15.3165802 1.90236664,14.6834152 2.29289093,14.2928909 L8.29289093,8.29289093 C8.67146987,7.914312 9.28105631,7.90106637 9.67572234,8.26284357 L15.6757223,13.7628436 C16.0828413,14.136036 16.1103443,14.7686034 15.7371519,15.1757223 C15.3639594,15.5828413 14.7313921,15.6103443 14.3242731,15.2371519 L9.03007346,10.3841355 L3.7071045,15.7071045 Z"
                                                            fill="#000000"
                                                            fill-rule="nonzero"
                                                            transform="translate(9.000001, 11.999997) scale(-1, -1) rotate(90.000000) translate(-9.000001, -11.999997)" />
                                                    </g>
                                                </svg>
                                                <!--end::Svg Icon-->
                                            </span>Indietro</button>
                                    </div>
                                    <!-- {/if} -->
                                    <div>
                                        {#if !inModal && currentWizardStep > 1}
                                            <button
                                                bind:this={saveDraftButton}
                                                on:click={saveDraft}
                                                type="button"
                                                id="next-step"
                                                class="btn btn-light-warning font-weight-bolder px-10 py-3 mr-2"
                                                >Salva bozza
                                            </button>
                                        {/if}
                                        <button
                                            id="subscription_submit"
                                            type="button"
                                            class="btn btn-primary font-weight-bolder px-10 py-3"
                                            data-wizard-type="action-submit"
                                            >Salva
                                            <span class="svg-icon svg-icon-md ml-3">
                                                <!--begin::Svg Icon | path:assets/media/svg/icons/Navigation/Check.svg-->
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    xmlns:xlink="http://www.w3.org/1999/xlink"
                                                    width="24px"
                                                    height="24px"
                                                    viewBox="0 0 24 24"
                                                    version="1.1">
                                                    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                                        <polygon points="0 0 24 0 24 24 0 24" />
                                                        <path
                                                            d="M6.26193932,17.6476484 C5.90425297,18.0684559 5.27315905,18.1196257 4.85235158,17.7619393 C4.43154411,17.404253 4.38037434,16.773159 4.73806068,16.3523516 L13.2380607,6.35235158 C13.6013618,5.92493855 14.2451015,5.87991302 14.6643638,6.25259068 L19.1643638,10.2525907 C19.5771466,10.6195087 19.6143273,11.2515811 19.2474093,11.6643638 C18.8804913,12.0771466 18.2484189,12.1143273 17.8356362,11.7474093 L14.0997854,8.42665306 L6.26193932,17.6476484 Z"
                                                            fill="#000000"
                                                            fill-rule="nonzero"
                                                            transform="translate(11.999995, 12.000002) rotate(-180.000000) translate(-11.999995, -12.000002)" />
                                                    </g>
                                                </svg>
                                                <!--end::Svg Icon-->
                                            </span>
                                        </button>
                                        <button
                                            type="button"
                                            id="next-step"
                                            class="btn btn-primary font-weight-bolder px-10 py-3"
                                            data-wizard-type="action-next"
                                            >Continua
                                            <span class="svg-icon svg-icon-md ml-3">
                                                <!--begin::Svg Icon | path:assets/media/svg/icons/Navigation/Arrow-right.svg-->
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    xmlns:xlink="http://www.w3.org/1999/xlink"
                                                    width="24px"
                                                    height="24px"
                                                    viewBox="0 0 24 24"
                                                    version="1.1">
                                                    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                                        <polygon points="0 0 24 0 24 24 0 24" />
                                                        <rect
                                                            fill="#000000"
                                                            opacity="0.3"
                                                            transform="translate(12.000000, 12.000000) rotate(-90.000000) translate(-12.000000, -12.000000)"
                                                            x="11"
                                                            y="5"
                                                            width="2"
                                                            height="14"
                                                            rx="1" />
                                                        <path
                                                            d="M9.70710318,15.7071045 C9.31657888,16.0976288 8.68341391,16.0976288 8.29288961,15.7071045 C7.90236532,15.3165802 7.90236532,14.6834152 8.29288961,14.2928909 L14.2928896,8.29289093 C14.6714686,7.914312 15.281055,7.90106637 15.675721,8.26284357 L21.675721,13.7628436 C22.08284,14.136036 22.1103429,14.7686034 21.7371505,15.1757223 C21.3639581,15.5828413 20.7313908,15.6103443 20.3242718,15.2371519 L15.0300721,10.3841355 L9.70710318,15.7071045 Z"
                                                            fill="#000000"
                                                            fill-rule="nonzero"
                                                            transform="translate(14.999999, 11.999997) scale(1, -1) rotate(90.000000) translate(-14.999999, -11.999997)" />
                                                    </g>
                                                </svg>
                                                <!--end::Svg Icon-->
                                            </span>
                                        </button>
                                    </div>
                                </div>
                                <!--end: Wizard Actions-->
                            </form>
                        </div>
                        <!--end: Wizard-->
                    </div>
                    <!--end: Wizard Form-->
                </div>
                <!--end: Wizard Body-->
            </div>
            <!--end: Wizard-->
        </div>
    </div>
</div>

<!--end::Container-->
<style>
</style>
