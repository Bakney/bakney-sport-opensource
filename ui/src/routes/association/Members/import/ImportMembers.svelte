<script>
    import {sessionToken} from 'store/stores.js';
    import Section1 from './sections/Section1.svelte';
    import Section2 from './sections/Section2.svelte';
    import {scale} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import {onMount} from 'svelte';
    import {apiFetch} from 'utils/ApiMiddleware.js';
    import Section3 from './sections/Section3.svelte';
    import {toast} from 'svelte-sonner';
    import BackButton from 'components/buttons/BackButton.svelte';

    sessionToken.useLocalStorage();

    export let inModal = false;
    export let opts;

    let currentWizardStep = inModal ? 1 : 0;
    let valid = false;
    let fileData;
    let ktDropzone;

    onMount(() => {
        KTWizard2.init();
    });

    function readFileAsync(file) {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();

            reader.onload = () => {
                resolve(reader.result);
            };

            reader.onerror = reject;

            reader.readAsArrayBuffer(file);
        });
    }

    async function importAssociates() {
        // KTApp.blockPage({
        //     overlayColor: '#000000',
        //     state: 'primary',
        //     message: 'Importazione dati avviata...',
        // });
        // const reader = new FileReader();
        // reader.readAsBinaryString(fileData.associates_file);
        // let contentFile = await readFileAsync(fileData.associates_file);

        let bodyRequest = {
            document_id: fileData.document_id || '',
            map: fileData.map || '',
            default: fileData.default || {},
        };

        // const res = await
        apiFetch(__bakney.env.API.SUBSCRIPTION.IMPORT.UPLOAD, {
            method: 'POST',
            body: JSON.stringify(bodyRequest),
        });
        // spinner stop
        // KTApp.unblockPage();

        // if (!res.error) {
        setTimeout(() => {
            location.href = '/#/members/list-draft';
        }, 1000);

        toast.success('Attendi qualche minuto fino a quando tutti i dati saranno importati.');
        document.dispatchEvent(new CustomEvent('onboarding-checklist-event', {detail: {key: 'create_membership'}}));
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
                startStep: inModal ? 2 : 1, // initial active step number
                clickableSteps: false, // allow step clicking
            });

            // Validation before going to next page
            _wizardObj.on('change', function (wizard) {
                currentWizardStep = wizard.getStep();
                if (wizard.getStep() > wizard.getNewStep()) {
                    return; // Skip if stepped back
                }

                // Validate form before change wizard step
                var validator = _validations[wizard.getStep() - 1]; // get validator for currnt step

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
                KTUtil.scrollTop();
            });

            // Submit event
            _wizardObj.on('submit', function (wizard) {
                Swal.fire({
                    text: "Sei sicuro di vole procedere con l'importazione degli atleti?",
                    icon: 'question',
                    showCancelButton: true,
                    buttonsStyling: false,
                    reverseButtons: true,
                    confirmButtonText: 'Continua',
                    cancelButtonText: 'Annulla',
                    customClass: {
                        confirmButton: 'btn font-weight-bold btn-primary',
                        cancelButton: 'btn font-weight-bold btn-default',
                    },
                }).then(function (result) {
                    if (result.value) {
                        importAssociates();
                    }
                });
            });
        };

        var _initValidation = function () {
            // Init form validation rules. For more info check the FormValidation plugin's official documentation:https://formvalidation.io/
            // Step 1
            _validations.push(
                FormValidation.formValidation(_formEl, {
                    plugins: {
                        trigger: new FormValidation.plugins.Trigger(),
                        bootstrap: new FormValidation.plugins.Bootstrap(),
                    },
                })
            );

            // Step 2
            _validations.push(
                FormValidation.formValidation(_formEl, {
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
                            },
                        },
                        taxCodeAssociateTutor: {
                            validators: {
                                notEmpty: {
                                    message: 'Il codice fiscale è obbligatorio.',
                                },
                            },
                        },
                        bornDateAssociateTutor: {
                            validators: {
                                notEmpty: {
                                    message: 'La data di nascita è obbligatoria.',
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
                            },
                        },
                    },
                    plugins: {
                        trigger: new FormValidation.plugins.Trigger(),
                        bootstrap: new FormValidation.plugins.Bootstrap(),
                    },
                })
            );

            _validations.push(
                FormValidation.formValidation(_formEl, {
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
                //if (document.activeElement.id != "") {
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
                //}
                break;
            default:
                return; // Quit when this doesn't handle the key event.
        }
    });
</script>

<!--begin::Container-->
<div
    in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}}
    class="container container-overlay"
    style={inModal ? 'padding:0;' : ''}>
    <div class="card card-custom">
        <div class="card-header py-3">
            <div class="card-toolbar">
                <BackButton />
            </div>
            <h3 class="card-title font-size-h2">Importazione soci e tesserati</h3>
            <div class="card-toolbar" />
        </div>
        <div class="card-body p-0">
            <!--begin: Wizard-->
            <div class="wizard wizard-2" id="kt_wizard" data-wizard-state="step-first" data-wizard-clickable="false">
                <!--begin: Wizard Nav-->
                <div class="wizard-nav flex-lg-shrink-0 w-lg-300px w-xl-375px border-right py-8 px-8 d-none d-md-block">
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
                                <h3 class="wizard-title">File con soci e/o tesserati</h3>
                                <div class="wizard-desc">Carica un file in formato .xls, .csv oppure .ods</div>
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
                                <h3 class="wizard-title">Collega le informazioni del tuo file</h3>
                                <div class="wizard-desc">Scegli quale colonna corrisponde al campo in anagrafica</div>
                            </div>
                        </div>
                        <!--end::Wizard Step 2 Nav-->
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
                                <h3 class="wizard-title">Colonne senza collegamento</h3>
                                <div class="wizard-desc">Aggiungi dei valodi di default</div>
                            </div>
                        </div>
                    </div>
                </div>
                <!--end: Wizard Nav-->
                <!--begin: Wizard Body-->
                <div class="wizard-body py-8 px-8">
                    <!--begin: Wizard Form-->
                    <div class="row">
                        <div class="offset-xxl-1 col-xxl-10">
                            <form class="form" id="kt_form">
                                <!--begin: Wizard Step 1-->
                                <Section1 bind:valid bind:fileData bind:ktDropzone />
                                <!--end: Wizard Step 1-->

                                <!--begin: Wizard Step 2-->
                                <Section2 bind:fileData />
                                <!--end: Wizard Step 2-->

                                <!--begin: Wizard Step 3-->
                                <Section3 bind:fileData />
                                <!--end: Wizard Step 3-->

                                <!--begin: Wizard Actions-->
                                <div class="d-flex justify-content-between border-top mt-5 pt-10">
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
                                    <div class="mb-12">
                                        <button
                                            id="subscription_submit"
                                            type="button"
                                            class="btn btn-primary font-weight-bolder px-10 py-3"
                                            data-wizard-type="action-submit">Importa Atleti</button>
                                        <button
                                            type="button"
                                            id="next-step"
                                            disabled={!valid}
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
                                            </span></button>
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
