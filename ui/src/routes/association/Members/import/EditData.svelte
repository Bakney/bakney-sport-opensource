<script>
    import {onDestroy, onMount} from 'svelte';
    import {sessionToken} from 'store/stores.js';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import {getBornCity, getBornDate, getSex} from 'utils/TaxCode';
    import {Warning} from 'phosphor-svelte';
    import {toast} from 'svelte-sonner';
    import {createEventDispatcher} from 'svelte';

    const dispatch = createEventDispatcher();

    sessionToken.useLocalStorage();

    export let athlete = {};
    export let idx;
    export let certificate_expring_date = moment().format('DD/MM/YYYY');

    let submitButton;
    let dataForm;
    let validateTutorData = false;
    let checkingOn = true;
    let checkingOnTutor = true;
    let uploadedFile = false;
    let aiSuggestion = false;

    $: dataForm, (validateTutorData = isMinor(athlete?.associate?.born_date));

    $: {
        if (athlete?.associate?.tax_code) {
            checkTaxCode();
        }
        if (athlete?.associate_tutor?.tax_code) {
            checkTaxCodeTutor();
        }
    }

    function checkTaxCode() {
        if (!athlete.associate) return;
        if (
            String(athlete.associate.tax_code).length == 16 &&
            checkTaxCodeValidty(athlete.associate.tax_code) &&
            checkingOn == true
        ) {
            let extractedSex = String(getSex(athlete.associate.tax_code) || '').trim();
            let extractedBornCity = String(getBornCity(athlete.associate.tax_code) || '').trim();
            let extractedBornDate = String(getBornDate(athlete.associate.tax_code) || '').trim();
            if (extractedSex != '') {
                athlete.associate.sex = extractedSex;
                setTimeout(() => jQuery('#sex_' + idx).selectpicker('refresh'), 500);
            }
            if (extractedBornCity != '') {
                athlete.associate.born_city = extractedBornCity;
            }
            if (extractedBornDate != '') {
                athlete.associate.born_date = extractedBornDate;
                athlete.associate.is_minor = isMinor(athlete.associate.born_date);
            }
            checkingOn = false;
        } else if (String(athlete.tax_code).length < 16) {
            checkingOn = true;
        }
    }

    function checkTaxCodeTutor() {
        if (
            String(athlete.associate_tutor.tax_code).length == 16 &&
            checkTaxCodeValidty(athlete.associate_tutor.tax_code) &&
            checkingOnTutor == true
        ) {
            let extractedSex = String(getSex(athlete.associate_tutor.tax_code) || '').trim();
            let extractedBornCity = String(getBornCity(athlete.associate_tutor.tax_code) || '').trim();
            let extractedBornDate = String(getBornDate(athlete.associate_tutor.tax_code) || '').trim();
            if (extractedSex != '') {
                athlete.associate_tutor.sex = extractedSex;
                setTimeout(() => jQuery('#sexTutor_' + idx).selectpicker('refresh'), 500);
            }
            if (extractedBornCity != '') {
                athlete.associate_tutor.born_city = extractedBornCity;
            }
            if (extractedBornDate != '') {
                athlete.associate_tutor.born_date = extractedBornDate;
            }
            checkingOnTutor = false;
        } else if (String(athlete.associate_tutor.tax_code).length < 16) {
            checkingOnTutor = true;
        }
    }

    function checkTaxCodeValidty(taxCode) {
        return /^(?:[A-Z][AEIOU][AEIOUX]|[AEIOU]X{2}|[B-DF-HJ-NP-TV-Z]{2}[A-Z]){2}(?:[\dLMNP-V]{2}(?:[A-EHLMPR-T](?:[04LQ][1-9MNP-V]|[15MR][\dLMNP-V]|[26NS][0-8LMNP-U])|[DHPS][37PT][0L]|[ACELMRT][37PT][01LM]|[AC-EHLMPR-T][26NS][9V])|(?:[02468LNQSU][048LQU]|[13579MPRTV][26NS])B[26NS][9V])(?:[A-MZ][1-9MNP-V][\dLMNP-V]{2}|[A-M][0L](?:[1-9MNP-V][\dLMNP-V]|[0L][1-9MNP-V]))[A-Z]$/i.test(
            taxCode
        );
    }

    const saveTutorData = async function (e) {
        KTUtil.btnWait(submitButton, 'spinner spinner-right spinner-white pr-15', 'In attesa...');

        let payload = {
            edit_data: athlete,
        };

        if (!moment(certificate_expring_date, 'DD/MM/YYYY').isBefore(moment())) {
            payload.certificate_expiring_date = certificate_expring_date;
        }

        let res = await apiFetch(
            replaceUID(__bakney.env.API.SUBSCRIPTION.ASSOCIATES_DRAFT.EDIT, athlete.associate_import_draft_id),
            {
                method: 'POST',
                body: JSON.stringify(payload),
            }
        );

        KTUtil.btnRelease(submitButton);

        if (!res.error) {
            toast.success('Dati aggiornati con successo.');
            jQuery(`#edit-modal-${idx}`).modal('hide');

            setTimeout(async () => {
                let redirectToUpdateTutors = false;
                let resInco = await apiFetch(__bakney.env.API.CHECK_INCONSISTENCIES, {method: 'GET'});
                // if (!resInco.error && resInco.response.inconsistencies) {
                //     redirectToUpdateTutors = true;
                //     sessionStorage.setItem('inconsistencies', JSON.stringify(resInco.response.missing_tutors));
                // }

                if (redirectToUpdateTutors) {
                    location.href = '/#/update-tutors';
                } else {
                    sessionStorage.removeItem('inconsistencies');
                    // location.reload();
                }
            }, 1000);
        } else {
            toast.error('Qualcosa è andato storto. Ricontrolla i dati!');
        }
    };

    const initForm = function () {
        dataForm?.destroy();
        dataForm = FormValidation.formValidation(document.getElementById('dataForm'), {
            fields: {
                membership_number: {
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
                        date: {
                            format: 'DD/MM/YYYY',
                            message: 'La data di nascita non è valida.',
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
                    enabled: validateTutorData,
                    validators: {
                        notEmpty: {
                            message: 'Il nome è obbligatorio.',
                        },
                    },
                },
                lastNameAssociateTutor: {
                    enabled: validateTutorData,
                    validators: {
                        notEmpty: {
                            message: 'Il cognome è obbligatorio.',
                        },
                    },
                },
                // sexAssociateTutor: {
                //     enabled: validateTutorData,
                //     validators: {
                //         notEmpty: {
                //             message: 'Il sesso è obbligatorio.',
                //         },
                //     },
                // },
                taxCodeAssociateTutor: {
                    enabled: validateTutorData,
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
                    enabled: validateTutorData,
                    validators: {
                        // notEmpty: {
                        //     message: 'La data di nascita è obbligatoria.',
                        // },
                        date: {
                            format: 'DD/MM/YYYY',
                            message: 'La data di nascita non è valida.',
                        },
                        notMinor: {
                            message: 'Il tutore deve essere maggiorenne.',
                        },
                    },
                },
                // bornCityAssociateTutor: {
                //     enabled: validateTutorData,
                //     validators: {
                //         notEmpty: {
                //             message: 'La città di nascita è obbligatoria.',
                //         },
                //     },
                // },
                // addressAssociateTutor: {
                //     enabled: validateTutorData,
                //     validators: {
                //         notEmpty: {
                //             message: "L'indirizzo di Residenza è obbligatorio.",
                //         },
                //     },
                // },
                // addressCityAssociateTutor: {
                //     enabled: validateTutorData,
                //     validators: {
                //         notEmpty: {
                //             message: 'La città di Residenza è obbligatoria.',
                //         },
                //     },
                // },
                // capAssociateTutor: {
                //     enabled: validateTutorData,
                //     validators: {
                //         notEmpty: {
                //             message: 'Il cap della città di Residenza è obbligatorio.',
                //         },
                //     },
                // },
            },
            plugins: {
                trigger: new FormValidation.plugins.Trigger(),
                bootstrap: new FormValidation.plugins.Bootstrap(),
                excluded: new FormValidation.plugins.Excluded(),
            },
        }).registerValidator('notMinor', function () {
            return {
                validate: function (input) {
                    let date = moment(input.value, 'DD/MM/YYYY');
                    let now = moment();
                    let years = now.diff(date, 'years');
                    return {
                        valid: years >= 18,
                    };
                },
            };
        });
    };

    const isMinor = function (input) {
        let date = moment(input, 'DD/MM/YYYY');
        let now = moment();
        let years = now.diff(date, 'years');
        return years < 18;
    };

    const updateBornDateTutor = function (event) {
        if (event && event == 'focus') {
            athlete.associate_tutor.born_date = null;
        }
    };

    const updateBornDate = function (event) {
        if (event && event == 'focus') {
            athlete.associate.born_date = null;
        }
    };

    onMount(() => {
        // associate components
        jQuery('#kt_datetimepicker_bornDate_' + idx)?.datetimepicker({
            format: 'L',
            locale: 'it',
            useCurrent: false, // workaround the bug that maxDate overwrites defaultDate
            maxDate: moment(new Date(Date.now()), 'MM-DD-YYYY'),
            minDate: moment('01/01/1890', 'MM-DD-YYYY'),
            defaultDate: moment(athlete.associate?.born_date, 'DD/MM/YYYY'),
        });

        jQuery('#kt_datetimepicker_bornDate_' + idx).on('change.datetimepicker', function (e) {
            athlete.associate.born_date = document.getElementById('date_input_born_date_' + idx).value;
        });

        jQuery('#sex_' + idx).selectpicker();

        jQuery('#date_input_born_date_' + idx).inputmask({
            mask: '99/99/9999',
            placeholder: '', // remove underscores from the input mask
        });

        jQuery('#kt_inputmask_cap_' + idx).inputmask({
            mask: '99999',
            placeholder: '', // remove underscores from the input mask
        });

        jQuery('#kt_inputmask_cap_' + idx).change(function () {
            athlete.associate.address_cap = document.getElementById('kt_inputmask_cap_' + idx).value;
        });

        jQuery('#kt_inputmask_phone_' + idx).inputmask({
            mask: '[+]999999999999999',
            placeholder: '', // remove underscores from the input mask
        });

        jQuery('#kt_inputmask_phone_' + idx).change(function () {
            athlete.associate.phone = document.getElementById('kt_inputmask_phone_' + idx).value;
        });

        // tutor components
        jQuery('#kt_datetimepicker_bornDate_tutor_' + idx).datetimepicker({
            format: 'L',
            locale: 'it',
            useCurrent: false, // workaround the bug that maxDate overwrites defaultDate
            maxDate: moment(new Date(Date.now()), 'MM-DD-YYYY'),
            minDate: moment('01/01/1890', 'MM-DD-YYYY'),
            defaultDate: moment(athlete.associate_tutor?.born_date || '01/01/1990', 'DD/MM/YYYY'),
        });

        jQuery('#kt_datetimepicker_bornDate_tutor_' + idx).on('change.datetimepicker', function (e) {
            athlete.associate_tutor.born_date = document.getElementById('date_input_born_date_tutor_' + idx).value;
            if (!athlete.associate_tutor.born_date)
                athlete.associate_tutor.born_date = moment(new Date(Date.now()), 'MM-DD-YYYY').format('DD/MM/YYYY');
        });

        jQuery('#sexTutor_' + idx).selectpicker();

        jQuery('#date_input_born_date_tutor_' + idx).inputmask({
            mask: '99/99/9999',
            placeholder: '', // remove underscores from the input mask
        });

        jQuery('#kt_inputmask_cap_tutor_' + idx).inputmask({
            mask: '99999',
            placeholder: '', // remove underscores from the input mask
        });

        jQuery('#kt_inputmask_cap_tutor_' + idx).change(function () {
            athlete.associate_tutor.address_cap = document.getElementById('kt_inputmask_cap_tutor_' + idx).value;
        });

        jQuery('#kt_inputmask_phone_tutor_' + idx).inputmask({
            mask: '[+]999999999999999',
            placeholder: '', // remove underscores from the input mask
        });

        jQuery('#kt_inputmask_phone_tutor_' + idx).change(function () {
            athlete.associate_tutor.phone = document.getElementById('kt_inputmask_phone_tutor_' + idx).value;
        });

        let defaultDate = moment().format('MM/DD/YYYY');
        let minDate = moment().format('MM/DD/YYYY');

        // alert(defaultDate + ' ' + minDate);
        if (athlete?.medical_certificate?.certificate_expring_date) {
            defaultDate = moment(athlete.medical_certificate.certificate_expring_date, 'DD/MM/YYYY').format(
                'MM/DD/YYYY'
            );
            // if minDate is greater than defaultDate, set defaultDate to minDate
            // if (moment(minDate, 'MM/DD/YYYY').isAfter(moment(defaultDate, 'MM/DD/YYYY'))) {
            //     defaultDate = minDate;
            // }
        }
        // alert(defaultDate + ' ' + minDate);

        jQuery(`#expiring_certificate_${idx}`).datetimepicker({
            format: 'L',
            locale: 'it',
            useCurrent: false, // workaround the bug that maxDate overwrites defaultDate
            // minDate: minDate,
            defaultDate: defaultDate,
        });

        jQuery(`#expiring_certificate_${idx}`).on('change.datetimepicker', function (e) {
            certificate_expring_date = e.date.format('DD/MM/YYYY');
        });

        // jQuery(`#membership_start_date_${idx}`).datetimepicker({
        //     format: 'L',
        //     locale: 'it',
        //     useCurrent: false, // workaround the bug that maxDate overwrites defaultDate
        //     // minDate: minDate,
        //     defaultDate: defaultDate,
        // });

        // jQuery(`#membership_start_date_${idx}`).on('change.datetimepicker', function (e) {
        //     athlete.associate.membership_start_date = e.date.format('DD/MM/YYYY');
        // });

        // jQuery(`#membership_end_date_${idx}`).datetimepicker({
        //     format: 'L',
        //     locale: 'it',
        //     useCurrent: false, // workaround the bug that maxDate overwrites defaultDate
        //     // minDate: minDate,
        //     defaultDate: defaultDate,
        // });

        // jQuery(`#membership_end_date_${idx}`).on('change.datetimepicker', function (e) {
        //     athlete.associate.membership_end_date = e.date.format('DD/MM/YYYY');
        // });

        jQuery(document).ready(function () {
            let ktDropzone = new Dropzone(`#dropzone_draft_upload`, {
                url: __bakney.env.HOST + `/subscription/${idx}/medical-certificate/upload`, // Set the url for your upload script location
                headers: {
                    Accept: '*/*',
                    Authorization: 'Bearer ' + $sessionToken,
                    'Cache-Control': null,
                    'X-Requested-With': null,
                    Referer: null,
                },
                clickable: true,
                paramName: 'medical_certificate',
                uploadMultiple: false,
                enqueueForUpload: false,
                maxFiles: 1,
                addRemoveLinks: true,
                acceptedFiles: 'image/*,application/pdf',
                maxFilesize: 5, // Max filesize in MB
                dictFallbackMessage: 'Il browser non è supportato.',
                dictDefaultMessage: 'Trascina qui i files.',
                dictFileTooBig: 'Il file è troppo grande: {{filesize}} MB > {{maxFilesize}} MB!',
                dictResponseError: 'Il server ha risposto con ERRORE {{statusCode}}.',
                dictCancelUpload: 'Annulla.',
                dictRemoveFile: 'Rimuovi!',
                dictUploadCanceled: 'Caricamento annullato.',
                dictMaxFilesExceeded: 'È possibile caricare al massimo {{maxFiles}} file.',
                processing: function (file) {
                    KTApp.blockPage({
                        overlayColor: '#000000',
                        type: 'v2',
                        state: 'primary',
                        message: 'Caricamento in corso...',
                    });
                },
                accept: function (file, done) {
                    done();
                    uploadedFile = true;
                    athlete.medical_certificate.filename = file.name;
                },
                success: function (file, response) {
                    aiSuggestion = false;
                    // check if key expiring_date is present in response and not null
                    if (response.expiring_date) {
                        // set expiring date from format YYYY-MM-DD to DD/MM/YYYY
                        document.getElementById('expiring_certificate_' + idx).value = moment(
                            response.expiring_date,
                            'YYYY-MM-DD'
                        ).format('DD/MM/YYYY');
                        aiSuggestion = true;
                    }
                    KTApp.unblockPage();
                },
                removedfile: function (file) {
                    uploadedFile = false;
                    file.previewElement.remove();
                },
            });
        });
    });

    onDestroy(() => {
        dispatch('close');
    });

    async function handleValidation(e) {
        if (!dataForm) initForm();
        dataForm?.validate().then(function (status) {
            if (status === 'Valid') {
                // if (!moment(certificate_expring_date, 'DD/MM/YYYY').isBefore(moment())) setCertificateExpiration();
                Dropzone.forElement(`#dropzone_draft_upload`).removeAllFiles();
                saveTutorData(e);
                jQuery('#kt_datatable_imported').KTDatatable('reload');
            } else {
                swal.fire({
                    text: 'Per favore, inserisci tutti i dati e riprova.',
                    icon: 'error',
                    buttonsStyling: false,
                    confirmButtonText: 'Ok, capito!',
                    customClass: {
                        confirmButton: 'btn font-weight-bold btn-light-primary',
                    },
                });
                // .then(function () {
                //     KTUtil.scrollTop();
                // });
            }
        });
    }

    function setCertificateExpiration() {
        apiFetch(replaceUID(__bakney.env.API.SUBSCRIPTION.MEDICAL_CERTIFICATE.SET_CERTIFICATE_EXPIRATION, idx), {
            method: 'POST',
            body: JSON.stringify({
                subscription_id: idx,
                certificate_expiring_date: certificate_expring_date,
            }),
        });
    }
</script>

<div class="modal-content">
    <!-- <div class="modal-header">
        <h5 class="modal-title">Modifica i dati</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <i data-dismiss="modal" class="ki ki-close" />
        </button>
    </div> -->
    <form class="form" id="dataForm" on:submit|preventDefault={handleValidation}>
        <div class="modal-body px-sm-10 py-2">
            <h5 class="font-weight-bolder mb-6 mt-6 font-size-h3">Informazioni certificato medico</h5>
            <div class="row">
                <div class="col-xl-6">
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <div class="form-group" on:click={() => (aiSuggestion = false)}>
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label>Data di scadenza<b>*</b></label>
                        <div class="input-group input-group-solid date" data-target-input="nearest">
                            <input
                                id="expiring_certificate_{idx}"
                                name="expiring_certificate_{idx}"
                                type="text"
                                class="form-control form-control-solid form-control-lg datetimepicker-input"
                                placeholder="Seleziona Data"
                                data-target="#expiring_certificate_{idx}" />
                            <div
                                class="input-group-append"
                                data-target="#expiring_certificate_{idx}"
                                data-toggle="datetimepicker">
                                <span class="input-group-text">
                                    <i class="ki ki-calendar" />
                                </span>
                            </div>
                        </div>
                    </div>
                    {#if aiSuggestion}
                        <!-- alert -->
                        <div
                            class="d-flex align-items-center text-bold text-warning bg-light-warning p-4 mb-4"
                            style="border-radius: 0.35rem;">
                            <Warning size={18} weight="duotone" class="mr-2" />
                            La data di scadenza è stata suggerita automaticamente dal sistema.
                        </div>
                    {/if}

                    {#if athlete.medical_certificate && athlete.medical_certificate.filename}
                        <div
                            class="font-weight-bolder mb-6 mt-6 font-size-h4 m-auto text-center"
                            style="margin-bottom:1rem!important;">
                            File Caricato: <span class="text-primary">{athlete.medical_certificate.filename}</span>
                        </div>
                    {/if}
                </div>
                <div class="col-xl-6">
                    <div class="dropzone dropzone-default" id="dropzone_draft_upload">
                        <div class="dropzone-msg dz-message needsclick">
                            <h3 class="dropzone-msg-title">
                                {#if athlete.medical_certificate && athlete.medical_certificate.filename}
                                    Per sostituire il file già caricato premi o trascina il nuovo file.
                                {:else}
                                    Trascina o premi per caricare il Certificato Medico.
                                {/if}
                            </h3>
                            <span class="dropzone-msg-desc"
                                >Sono supportati file <b>pdf</b> e <b>immagini</b> di grandezza inferiore a
                                <b>5MB</b>.</span>
                        </div>
                    </div>
                </div>
            </div>
            <h5 class="font-weight-bolder mb-6 mt-6 font-size-h3">Dati dell'associato</h5>
            <div class="row">
                <div class="col-xl-6">
                    <div class="form-group">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label>Nome <b>*</b></label>
                        <input
                            bind:value={athlete.associate.first_name}
                            name="firstNameAssociate"
                            type="text"
                            class="form-control form-control-solid form-control-lg margin-tb-2"
                            placeholder="Nome"
                            style="text-transform:capitalize" />
                    </div>
                </div>
                <div class="col-xl-6">
                    <div class="form-group">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label>Cognome <b>*</b></label>
                        <input
                            bind:value={athlete.associate.last_name}
                            name="lastNameAssociate"
                            type="text"
                            class="form-control form-control-solid form-control-lg margin-tb-2"
                            placeholder="Cognome"
                            style="text-transform:capitalize" />
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-xl-6">
                    <div class="form-group">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label>Sesso <b>*</b></label>
                        <select
                            bind:value={athlete.associate.sex}
                            name="sexAssociate"
                            class="form-control selectpicker form-control-solid form-control-lg"
                            id="sex_{idx}">
                            <option value="F" data-icon="la la-venus font-size-lg bs-icon">Femmina</option>
                            <option value="M" data-icon="la la-mars font-size-lg bs-icon">Maschio</option>
                        </select>
                    </div>
                </div>

                <div class="col-xl-6">
                    <div class="form-group">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label>Codice Fiscale <b>*</b></label>
                        <input
                            bind:value={athlete.associate.tax_code}
                            name="taxCodeAssociate"
                            type="text"
                            class="form-control form-control-solid form-control-lg"
                            placeholder="Codice fiscale"
                            style="text-transform:uppercase" />
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-xl-6">
                    <div class="form-group">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label>Data di Nascita <b>*</b></label>
                        <div
                            class="input-group input-group-solid date"
                            id="kt_datetimepicker_bornDate_{idx}"
                            data-target-input="nearest">
                            <input
                                value={athlete.associate.born_date}
                                on:focus={() => updateBornDate('focus')}
                                id="date_input_born_date_{idx}"
                                name="bornDateAssociate"
                                type="text"
                                class="form-control form-control-solid form-control-lg datetimepicker-input"
                                placeholder="Seleziona Data"
                                data-target="#kt_datetimepicker_bornDate_{idx}" />
                            <div
                                class="input-group-append"
                                data-target="#kt_datetimepicker_bornDate_{idx}"
                                data-toggle="datetimepicker">
                                <span class="input-group-text">
                                    <i class="ki ki-calendar" />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-6">
                    <div class="form-group">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label>Luogo di Nascita <b>*</b></label>
                        <input
                            bind:value={athlete.associate.born_city}
                            name="bornCityAssociate"
                            type="text"
                            class="form-control form-control-solid form-control-lg"
                            placeholder="Luogo di Nascita"
                            style="text-transform:capitalize" />
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-xl-6">
                    <div class="form-group">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label>Indirizzo di Residenza, Numero <b>*</b></label>
                        <input
                            bind:value={athlete.associate.address}
                            id="address"
                            name="addressAssociate"
                            type="text"
                            class="form-control form-control-solid form-control-lg"
                            placeholder="Indirizzo di Residenza, numero"
                            style="text-transform:capitalize" />
                    </div>
                </div>
                <div class="col-xl-6">
                    <div class="form-group">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label>Città di Residenza <b>*</b></label>
                        <input
                            bind:value={athlete.associate.address_city}
                            name="addressCityAssociate"
                            type="text"
                            class="form-control form-control-solid form-control-lg"
                            placeholder="Città di Residenza"
                            style="text-transform:capitalize" />
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-xl-6">
                    <div class="form-group">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label>Cap <b>*</b></label>
                        <input
                            bind:value={athlete.associate.address_cap}
                            name="cap"
                            type="text"
                            class="form-control form-control-solid form-control-lg"
                            id="kt_inputmask_cap_{idx}"
                            placeholder="CAP di Residenza" />
                    </div>
                </div>
                <div class="col-xl-6">
                    <div class="form-group">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label>Cellulare (opzionale)</label>
                        <input
                            bind:value={athlete.associate.phone}
                            name="phone"
                            type="text"
                            class="form-control form-control-solid form-control-lg"
                            id="kt_inputmask_phone_{idx}"
                            placeholder="Numero italiano" />
                    </div>
                </div>
            </div>

            <div class="form-group">
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <label>Email (opzionale)</label>
                <input
                    bind:value={athlete.associate.email}
                    name="emailAssociate"
                    type="email"
                    class="form-control form-control-solid form-control-lg margin-tb-2"
                    placeholder="Inserisci un email..." />
            </div>
            <div style="display: {isMinor(athlete.associate.born_date) ? 'block' : 'none'}">
                <h5 class="font-weight-bolder mb-6 mt-12 font-size-h3">Dati del tutore</h5>

                <div class="row">
                    <div class="col-xl-6">
                        <div class="form-group">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label>Nome</label>
                            <input
                                bind:value={athlete.associate_tutor.first_name}
                                name="firstNameAssociateTutor"
                                type="text"
                                class="form-control form-control-solid form-control-lg margin-tb-2"
                                placeholder="Nome"
                                style="text-transform:capitalize" />
                        </div>
                    </div>
                    <div class="col-xl-6">
                        <div class="form-group">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label>Cognome</label>
                            <input
                                bind:value={athlete.associate_tutor.last_name}
                                name="lastNameAssociateTutor"
                                type="text"
                                class="form-control form-control-solid form-control-lg margin-tb-2"
                                placeholder="Cognome"
                                style="text-transform:capitalize" />
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-xl-6">
                        <div class="form-group">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label>Sesso</label>
                            <select
                                bind:value={athlete.associate_tutor.sex}
                                name="sexAssociateTutor"
                                class="form-control form-control-solid form-control-lg"
                                id="sexTutor_{idx}">
                                <option value="F" data-icon="la la-venus font-size-lg bs-icon">Femmina</option>
                                <option value="M" data-icon="la la-mars font-size-lg bs-icon">Maschio</option>
                            </select>
                        </div>
                    </div>

                    <div class="col-xl-6">
                        <div class="form-group">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label>Codice Fiscale</label>
                            <input
                                bind:value={athlete.associate_tutor.tax_code}
                                name="taxCodeAssociateTutor"
                                type="text"
                                class="form-control form-control-solid form-control-lg"
                                placeholder="Codice fiscale"
                                style="text-transform:uppercase" />
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-xl-6">
                        <div class="form-group">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label>Data di Nascita</label>
                            <div
                                class="input-group input-group-solid date"
                                id="kt_datetimepicker_bornDate_tutor_{idx}"
                                data-target-input="nearest">
                                <input
                                    value={athlete.associate_tutor.born_date}
                                    on:focus={() => updateBornDateTutor('focus')}
                                    id="date_input_born_date_tutor_{idx}"
                                    name="bornDateAssociateTutor"
                                    type="text"
                                    class="form-control form-control-solid form-control-lg datetimepicker-input"
                                    placeholder="Seleziona Data"
                                    data-target="#kt_datetimepicker_bornDate_tutor_{idx}" />
                                <div
                                    class="input-group-append"
                                    data-target="#kt_datetimepicker_bornDate_tutor_{idx}"
                                    data-toggle="datetimepicker">
                                    <span class="input-group-text">
                                        <i class="ki ki-calendar" />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-6">
                        <div class="form-group">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label>Luogo di Nascita</label>
                            <input
                                bind:value={athlete.associate_tutor.born_city}
                                name="bornCityAssociateTutor"
                                type="text"
                                class="form-control form-control-solid form-control-lg"
                                placeholder="Luogo di Nascita"
                                style="text-transform:capitalize" />
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-xl-6">
                        <div class="form-group">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label>Indirizzo di Residenza, Numero</label>
                            <input
                                bind:value={athlete.associate_tutor.address}
                                id="addressAssociateTutor"
                                name="addressAssociateTutor"
                                type="text"
                                class="form-control form-control-solid form-control-lg"
                                placeholder="Indirizzo di Residenza, numero"
                                style="text-transform:capitalize" />
                        </div>
                    </div>
                    <div class="col-xl-6">
                        <div class="form-group">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label>Città di Residenza</label>
                            <input
                                bind:value={athlete.associate_tutor.address_city}
                                name="addressCityAssociateTutor"
                                type="text"
                                class="form-control form-control-solid form-control-lg"
                                placeholder="Città di Residenza"
                                style="text-transform:capitalize" />
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-xl-6">
                        <div class="form-group">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label>Cap</label>
                            <input
                                bind:value={athlete.associate_tutor.address_cap}
                                name="capAssociateTutor"
                                type="text"
                                class="form-control form-control-solid form-control-lg"
                                id="kt_inputmask_cap_tutor_{idx}"
                                placeholder="CAP di Residenza" />
                        </div>
                    </div>
                    <div class="col-xl-6">
                        <div class="form-group">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label>Cellulare (opzionale)</label>
                            <input
                                bind:value={athlete.associate_tutor.phone}
                                name="phoneAssociateTutor"
                                type="text"
                                class="form-control form-control-solid form-control-lg"
                                id="kt_inputmask_phone_tutor_{idx}"
                                placeholder="Numero italiano" />
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <!-- svelte-ignore a11y-label-has-associated-control -->
                    <label>Email (opzionale)</label>
                    <input
                        bind:value={athlete.associate_tutor.email}
                        name="emailAssociateTutor"
                        type="email"
                        class="form-control form-control-solid form-control-lg margin-tb-2"
                        placeholder="Inserisci un email..." />
                </div>
            </div>
            <div class="col-12">
                <h1 class="text-dark font-weight-boldest mb-8">Tesseramento</h1>
                <div class="row">
                    <div class="form-group col-12 col-md-3">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label class="font-weight-bolder">Numero tessera</label>
                        <input
                            bind:value={athlete.associate.membership_number}
                            name="membership_number"
                            type="text"
                            class="form-control form-control-solid form-control-lg margin-tb-2"
                            placeholder="Numero tessera" />
                    </div>

                    <div class="form-group col-12 col-md-3">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label class="font-weight-bolder">Data tesseramento</label>
                        <input
                            bind:value={athlete.associate.membership_start_date}
                            name="membership_start_date"
                            type="date"
                            class="form-control form-control-solid form-control-lg margin-tb-2"
                            placeholder="Data della tessera" />
                    </div>

                    <div class="form-group col-12 col-md-3">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label class="font-weight-bolder">Data fine tesseramento</label>
                        <input
                            bind:value={athlete.associate.membership_end_date}
                            name="membership_end_date"
                            type="date"
                            class="form-control form-control-solid form-control-lg margin-tb-2"
                            placeholder="Data scadenza tessera" />
                    </div>

                    <div class="form-group col-12 col-md-3">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label class="font-weight-bolder">Tipo di tessera</label>
                        <input
                            bind:value={athlete.associate.membership_type}
                            name="membership_type"
                            type="text"
                            class="form-control form-control-solid form-control-lg margin-tb-2"
                            placeholder="Tipologia tesseramento" />
                    </div>
                </div>
            </div>
        </div>
        <div
            class="modal-footer bg-white p-0 pt-12 d-flex align-items-center justify-content-center shadow-lg"
            style="position:sticky;bottom:0;">
            <!-- <button type="button" class="btn btn-light-primary font-weight-bold" data-dismiss="modal">Chiudi</button> -->
            <button bind:this={submitButton} type="submit" class="btn btn-primary my-4 font-weight-boldest"
                >Salva Modifiche</button>
        </div>
    </form>
</div>
