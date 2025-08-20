<script>
    import GenerateTaxCodeButton from 'components/buttons/GenerateTaxCodeButton.svelte';
    import {TextInput, SmartSelect, Datepicker} from 'components/formBuilder/preview-blocks/index.js';
    import AdditionalFields from '../partials/additional-fields.svelte';
    import SmoothSignature from 'components/signature/SmoothSignature.svelte';
    import {showSection} from 'utils/Functions';
    import {sessionToken} from 'store/stores.js';
    import {onMount} from 'svelte';
    import {CheckCircle, XCircle} from 'phosphor-svelte';
    import FederationSettings from '../partials/federation-settings.svelte';
    import FederationSocietyData from '../partials/federation-society-data.svelte';
    import Step1minor from '../Step1minor.svelte';
    import FederationAthleteData from '../partials/federation-athlete-data.svelte';

    export let athlete = {};
    export let wizardData = {};
    export let availablePlans = [];
    export let availableMembershipPlans = [];

    let allTypesOfRequests = [
        {
            value: 'affiliazione',
            label: 'Affiliazione',
        },
        {
            value: 'rinnovo',
            label: 'Rinnovo',
        },
    ];
    let availableTypesOfRequests = allTypesOfRequests;

    const uploadMedicalCertificateUrl = __bakney.env.HOST + '/document/medical/certificate/';
    let uploadingMedicalCertificate = false;

    onMount(() => {
        // Initialize dropzone for medical certificate
        initMedicalCertificateUpload();
    });

    function initMedicalCertificateUpload() {
        const dropzoneId = '#medical_certificate_dropzone';
        const previewNode = jQuery(dropzoneId + ' .dropzone-item');
        previewNode.id = '';
        const previewTemplate = document.querySelector('.dropzone-items').innerHTML;
        previewNode.remove();

        new Dropzone(dropzoneId, {
            url: uploadMedicalCertificateUrl,
            headers: {
                Authorization: $sessionToken ? 'Bearer ' + $sessionToken : '',
            },
            paramName: 'medical_certificate',
            maxFiles: 1,
            acceptedFiles: 'image/*,application/pdf',
            maxFilesize: 5,
            previewTemplate: previewTemplate,
            previewsContainer: dropzoneId + ' .dropzone-items',
            clickable: dropzoneId + ' .dropzone-select',
            sending: function (file, xhr, formData) {
                uploadingMedicalCertificate = true;
            },
            success: function (file, response) {
                athlete.medical_certificate = athlete.medical_certificate || {};
                athlete.medical_certificate.medical_id = response.uid;
                athlete.medical_certificate.filename = file.name;
                uploadingMedicalCertificate = false;
                if (response.expiring_date) {
                    athlete.medical_certificate.certificate_expring_date = moment(response.expiring_date).format(
                        'DD/MM/YYYY'
                    );
                }
            },

            removedfile: function (file) {
                athlete.medical_certificate = athlete.medical_certificate || {};
                athlete.medical_certificate.medical_id = null;
                athlete.medical_certificate.filename = '';
            },
        });
    }

    $: {
        availablePlans = wizardData?.sportAssociationData?.user?.sport_association?.subscription_fee_plans
            ?.map(x => {
                if (x.advanced_options && x.advanced_options == true) {
                    let from_day = parseInt(x.from_day);
                    let from_month = parseInt(x.from_month);
                    let to_day = parseInt(x.to_day);
                    let to_month = parseInt(x.to_month);
                    // check current date is between from_date and to_date
                    let current_date = new Date();
                    let current_day = current_date.getDate();
                    let current_month = current_date.getMonth() + 1;

                    if (
                        current_day >= from_day &&
                        current_month >= from_month &&
                        current_day <= to_day &&
                        current_month <= to_month
                    ) {
                        return {
                            value: x.id || '',
                            label: `${x.name} (€ ${parseFloat(x.subscription_fee).toLocaleString('it-IT', {
                                minimumFractionDigits: 2,
                            })})`,
                        };
                    }

                    return null;
                } else {
                    if (wizardData?.sportAssociationData?.isFederation) {
                        try {
                            if (
                                !Array.from(x?.type_of_associate || [])
                                    .map(t => t.value)
                                    .includes(athlete.custom_data.type_of_associate) ||
                                !Array.from(x?.type_of_request || [])
                                    .map(t => t.value)
                                    .includes(athlete.custom_data.type_of_request)
                            ) {
                                return null;
                            }
                        } catch (e) {
                            console.error(e);
                        }
                    }
                    return {
                        value: x.id || '',
                        label: `${x.name} (€ ${parseFloat(x.subscription_fee).toLocaleString('it-IT', {
                            minimumFractionDigits: 2,
                        })})`,
                    };
                }
            })
            .filter(x => x != null);

        availableMembershipPlans = wizardData?.sportAssociationData?.user?.sport_association?.membership_fee_plans
            ?.map(x => {
                if (x.advanced_options && x.advanced_options == true) {
                    let from_day = parseInt(x.from_day);
                    let from_month = parseInt(x.from_month);
                    let to_day = parseInt(x.to_day);
                    let to_month = parseInt(x.to_month);
                    // check current date is between from_date and to_date
                    let current_date = new Date();
                    let current_day = current_date.getDate();
                    let current_month = current_date.getMonth() + 1;

                    if (
                        current_day >= from_day &&
                        current_month >= from_month &&
                        current_day <= to_day &&
                        current_month <= to_month
                    ) {
                        return {
                            value: x.id || '',
                            label: `${x.name} (€ ${parseFloat(x.membership_fee).toLocaleString('it-IT', {
                                minimumFractionDigits: 2,
                            })})`,
                        };
                    }

                    return null;
                } else {
                    if (wizardData?.sportAssociationData?.isFederation) {
                        try {
                            if (
                                !Array.from(x?.type_of_associate || [])
                                    .map(t => t.value)
                                    .includes(athlete.custom_data.type_of_associate) ||
                                !Array.from(x?.type_of_request || [])
                                    .map(t => t.value)
                                    .includes(athlete.custom_data.type_of_request)
                            ) {
                                return null;
                            }
                        } catch (e) {
                            console.error(e);
                        }
                    }
                    return {
                        value: x.id || '',
                        label: `${x.name} (€ ${parseFloat(x.membership_fee).toLocaleString('it-IT', {
                            minimumFractionDigits: 2,
                        })})`,
                    };
                }
            })
            .filter(x => x != null);
    }

    $: hasCertificate = athlete?.medical_certificate?.medical_id != null;

    function handleTypeOfAssociateChange(event) {
        availableTypesOfRequests = [];
        let membershipFeePlans = wizardData.sportAssociationData.user.sport_association.membership_fee_plans;
        let subscriptionFeePlans = wizardData.sportAssociationData.user.sport_association.subscription_fee_plans;

        /**
         * Check if value in membershipFeePlan.type_of_associate array of {label, value} includes event.detail.type_of_associate
         * check also if value in subscriptionFeePlans.type_of_associate array of {label, value} includes event.detail.type_of_associate
         * moreover, for each membershipFeePlan and subscriptionFeePlan, check the available types of requests
         * if there is for one option also it should not be removed
         */
        let foundAffiliation = false;
        let foundRenewal = false;

        for (const membershipFeePlan of membershipFeePlans || []) {
            // stop if foundAffiliation or foundRenewal is true
            if (foundAffiliation && foundRenewal) {
                break;
            }
            // check if the type of associate is in the array
            const found =
                Array.isArray(membershipFeePlan?.type_of_associate) &&
                membershipFeePlan.type_of_associate.some(
                    typeOfAssociate => typeOfAssociate?.value === event?.detail?.type_of_associate
                );
            // console.debug('Type of associate found:', found);
            if (found) {
                // check if there is type_of_request.value == 'rinnovo' or 'affiliazione'
                const renewal =
                    Array.isArray(membershipFeePlan?.type_of_request) &&
                    membershipFeePlan.type_of_request.some(typeOfRequest => typeOfRequest?.value === 'rinnovo');
                const affiliation =
                    Array.isArray(membershipFeePlan?.type_of_request) &&
                    membershipFeePlan.type_of_request.some(typeOfRequest => typeOfRequest?.value === 'affiliazione');
                // console.debug('Renewal found:', renewal, 'Affiliation found:', affiliation);
                if (renewal) {
                    foundRenewal = true;
                }
                if (affiliation) {
                    foundAffiliation = true;
                }
            }
        }

        //console.debug('Checking subscriptionFeePlans');
        // do the same for subscriptionFeePlans
        for (const subscriptionFeePlan of subscriptionFeePlans || []) {
            // console.debug('Current subscriptionFeePlan:', subscriptionFeePlan);
            // stop if foundAffiliation or foundRenewal is true
            if (foundAffiliation && foundRenewal) {
                // console.debug('Found both affiliation and renewal, breaking loop');
                break;
            }
            // check if the type of associate is in the array
            const found =
                Array.isArray(subscriptionFeePlan?.type_of_associate) &&
                subscriptionFeePlan.type_of_associate.some(
                    typeOfAssociate => typeOfAssociate?.value === event?.detail?.type_of_associate
                );
            console.debug('Type of associate found:', found);
            if (found) {
                // check if there is type_of_request.value == 'rinnovo' or 'affiliazione'
                const renewal =
                    Array.isArray(subscriptionFeePlan?.type_of_request) &&
                    subscriptionFeePlan.type_of_request.some(typeOfRequest => typeOfRequest?.value === 'rinnovo');
                const affiliation =
                    Array.isArray(subscriptionFeePlan?.type_of_request) &&
                    subscriptionFeePlan.type_of_request.some(typeOfRequest => typeOfRequest?.value === 'affiliazione');
                console.debug('Renewal found:', renewal, 'Affiliation found:', affiliation);
                if (renewal) {
                    foundRenewal = true;
                }
                if (affiliation) {
                    foundAffiliation = true;
                }
            }
        }

        // console.debug('Updating availableTypesOfRequests', foundAffiliation, foundRenewal);
        // update availableTypesOfRequests
        if (foundAffiliation) availableTypesOfRequests.push({value: 'affiliazione', label: 'Affiliazione'});
        if (foundRenewal) availableTypesOfRequests.push({value: 'rinnovo', label: 'Rinnovo'});
        availableTypesOfRequests = [...new Set(availableTypesOfRequests)];
        // console.debug('Final availableTypesOfRequests:', availableTypesOfRequests);
    }

    const isMinor = function (input) {
        let date = moment(input, 'DD/MM/YYYY');
        let now = moment();
        let years = now.diff(date, 'years');
        return years < 18;
    };

    $: {
        if (athlete?.associate_data?.born_date) {
            athlete.associate_data.is_minor = isMinor(athlete.associate_data.born_date);
        }
    }

    $: {
        availablePlans = wizardData?.sportAssociationData?.user?.sport_association?.subscription_fee_plans
            ?.map(x => {
                if (x.advanced_options && x.advanced_options == true) {
                    let from_day = parseInt(x.from_day);
                    let from_month = parseInt(x.from_month);
                    let to_day = parseInt(x.to_day);
                    let to_month = parseInt(x.to_month);
                    // check current date is between from_date and to_date
                    let current_date = new Date();
                    let current_day = current_date.getDate();
                    let current_month = current_date.getMonth() + 1;

                    if (
                        current_day >= from_day &&
                        current_month >= from_month &&
                        current_day <= to_day &&
                        current_month <= to_month
                    ) {
                        return {
                            value: x.id || '',
                            label: `${x.name} (€ ${parseFloat(x.subscription_fee).toLocaleString('it-IT', {
                                minimumFractionDigits: 2,
                            })})`,
                        };
                    }

                    return null;
                } else {
                    if (wizardData?.sportAssociationData?.isFederation) {
                        try {
                            if (
                                !Array.from(x?.type_of_associate || [])
                                    .map(t => t.value)
                                    .includes(athlete?.custom_data.type_of_associate) ||
                                !Array.from(x?.type_of_request || [])
                                    .map(t => t.value)
                                    .includes(athlete?.custom_data.type_of_request)
                            ) {
                                return null;
                            }
                        } catch (e) {
                            console.error(e);
                        }
                    }
                    return {
                        value: x.id || '',
                        label: `${x.name} (€ ${parseFloat(x.subscription_fee).toLocaleString('it-IT', {
                            minimumFractionDigits: 2,
                        })})`,
                    };
                }
            })
            .filter(x => x != null);

        availableMembershipPlans = wizardData?.sportAssociationData?.user?.sport_association?.membership_fee_plans
            ?.map(x => {
                if (x.advanced_options && x.advanced_options == true) {
                    let from_day = parseInt(x.from_day);
                    let from_month = parseInt(x.from_month);
                    let to_day = parseInt(x.to_day);
                    let to_month = parseInt(x.to_month);
                    // check current date is between from_date and to_date
                    let current_date = new Date();
                    let current_day = current_date.getDate();
                    let current_month = current_date.getMonth() + 1;

                    if (
                        current_day >= from_day &&
                        current_month >= from_month &&
                        current_day <= to_day &&
                        current_month <= to_month
                    ) {
                        return {
                            value: x.id || '',
                            label: `${x.name} (€ ${parseFloat(x.membership_fee).toLocaleString('it-IT', {
                                minimumFractionDigits: 2,
                            })})`,
                        };
                    }

                    return null;
                } else {
                    if (wizardData?.sportAssociationData?.isFederation) {
                        try {
                            if (
                                !Array.from(x?.type_of_associate || [])
                                    .map(t => t.value)
                                    .includes(athlete?.custom_data?.type_of_associate) ||
                                !Array.from(x?.type_of_request || [])
                                    .map(t => t.value)
                                    .includes(athlete?.custom_data?.type_of_request)
                            ) {
                                return null;
                            }
                        } catch (e) {
                            console.error(e);
                        }
                    }
                    return {
                        value: x.id || '',
                        label: `${x.name} (€ ${parseFloat(x.membership_fee).toLocaleString('it-IT', {
                            minimumFractionDigits: 2,
                        })})`,
                    };
                }
            })
            .filter(x => x != null);
    }
</script>

<div class="row m-0 px-4">
    <div class="col-12 mb-0 mx-0">
        {#if wizardData?.sportAssociationData?.isFederation}
            <FederationSettings
                bind:formData={athlete}
                on:type_of_associate_changed={handleTypeOfAssociateChange}
                bind:availableTypesOfRequests />
        {/if}
    </div>
    <div class="col-12 mb-4 mx-0">
        {#if athlete?.associate_data?.type === 1 || athlete?.associate_data?.type === 2}
            <h3 class="font-weight-bolder font-size-h2 mt-0 mb-2">Quota Associativa</h3>
            {#if wizardData?.sportAssociationData?.user?.sport_association?.multiple_subscription_fee}
                <div class="form-group">
                    <!-- svelte-ignore a11y-label-has-associated-control -->
                    <div class="radio-inline margin-tb-2">
                        <SmartSelect
                            customClasses={'min-w-100'}
                            editable={false}
                            active={false}
                            bind:value={athlete.plan_id}
                            on:change={() => {
                                athlete.plan_label = availablePlans.find(x => x.value === athlete?.plan_id).label;
                            }}
                            props={{
                                id: 'plan_id',
                                name: 'plan_id',
                                label: null,
                                placeholder: 'Seleziona una quota associativa',
                                required: true,
                                clearable: false,
                                searchable: false,
                                showChevron: true,
                                options: availablePlans,
                                value: athlete?.plan_id,
                            }} />
                    </div>
                </div>
            {:else}
                <span class="form-text text-muted">
                    La quota associativa che andrai a pagare sarà di <b
                        >{parseFloat(
                            wizardData?.sportAssociationData?.user?.sport_association?.subscription_fee || 0
                        ).toLocaleString('it-IT', {
                            style: 'currency',
                            currency: 'EUR',
                            minimumFractionDigits: 2,
                        })}</b
                    >.
                </span>
            {/if}
        {/if}

        {#if athlete?.associate_data?.type === 2 || athlete?.associate_data?.type === 3}
            <h3 class="font-weight-bolder font-size-h2 mt-0 mb-2">Quota Tesseramento</h3>
            {#if wizardData?.sportAssociationData?.user?.sport_association?.multiple_membership_fee}
                <div class="form-group">
                    <!-- svelte-ignore a11y-label-has-associated-control -->
                    <div class="radio-inline margin-tb-2">
                        <SmartSelect
                            customClasses={'min-w-100'}
                            editable={false}
                            active={false}
                            bind:value={athlete.membership_plan_id}
                            on:change={() => {
                                athlete.membership_plan_label = availableMembershipPlans.find(
                                    x => x.value === athlete?.membership_plan_id
                                ).label;
                            }}
                            props={{
                                id: 'membership_plan_id',
                                name: 'membership_plan_id',
                                label: null,
                                placeholder: 'Seleziona una quota di tesseramento',
                                required: true,
                                clearable: false,
                                searchable: false,
                                showChevron: true,
                                options: availableMembershipPlans,
                                value: athlete?.membership_plan_id,
                            }} />
                    </div>
                </div>
            {:else}
                <span class="form-text text-muted">
                    La quota di tesseramento che andrai a pagare sarà di <b
                        >{parseFloat(
                            wizardData?.sportAssociationData?.user?.sport_association?.membership_fee || 0
                        ).toLocaleString('it-IT', {
                            style: 'currency',
                            currency: 'EUR',
                            minimumFractionDigits: 2,
                        })}</b
                    >.
                </span>
            {/if}
        {/if}
    </div>

    <div class="col-12 col-xl-6 mb-4 px-0">
        <TextInput
            customClasses={'col-12 mb-0'}
            editable={false}
            active={false}
            on:change={e => {
                athlete.associate_data.first_name = e.detail;
            }}
            props={{
                id: 'first_name',
                name: 'first_name',
                label: 'Nome',
                placeholder: 'Inserisci il nome',
                required: true,
                value: athlete?.associate_data?.first_name,
                style: 'text-transform:capitalize',
            }} />
    </div>

    <div class="col-12 col-xl-6 mb-0 px-0">
        <TextInput
            customClasses={'col-12 mb-0'}
            editable={false}
            active={false}
            on:change={e => {
                athlete.associate_data.last_name = e.detail;
            }}
            props={{
                id: 'last_name',
                name: 'last_name',
                label: 'Cognome',
                placeholder: 'Inserisci il cognome',
                required: true,
                value: athlete?.associate_data?.last_name,
                style: 'text-transform:capitalize',
            }} />
    </div>

    <div class="col-12 col-xl-6 mb-0">
        <SmartSelect
            customClasses={'w-100 mb-4'}
            editable={false}
            active={false}
            on:change={e => {
                athlete.associate_data.sex = e.detail.value;
            }}
            props={{
                id: 'sex',
                name: 'sex',
                label: 'Sesso',
                placeholder: 'Seleziona il sesso',
                required: true,
                options: [
                    {value: 'F', label: 'Femmina'},
                    {value: 'M', label: 'Maschio'},
                ],
                value: athlete?.associate_data?.sex,
            }} />
    </div>

    <div class="col-12 col-xl-6 mb-0">
        <Datepicker
            customClasses={'w-100 mb-4'}
            editable={false}
            active={false}
            on:change={e => {
                athlete.associate_data.born_date = e.detail;
            }}
            props={{
                id: 'born_date',
                name: 'born_date',
                label: 'Data di Nascita',
                placeholder: 'Seleziona la data di nascita',
                required: true,
                format: 'DD/MM/YYYY',
                value: athlete?.associate_data?.born_date,
            }} />
    </div>

    <TextInput
        customClasses={'col-12 col-xl-6 mb-0'}
        editable={false}
        active={false}
        on:change={e => {
            athlete.associate_data.born_city = e.detail;
        }}
        props={{
            id: 'born_city',
            name: 'born_city',
            label: 'Luogo di Nascita',
            placeholder: 'Inserisci il luogo di nascita',
            required: true,
            value: athlete?.associate_data?.born_city,
            style: 'text-transform:capitalize',
        }} />

    <div class="col-12 col-xl-6 mb-0">
        <div class="d-flex align-items-center">
            <TextInput
                customClasses={'flex-grow-1 mr-2 mb-4'}
                editable={false}
                active={false}
                on:change={e => {
                    athlete.associate_data.tax_code = e.detail;
                }}
                props={{
                    id: 'tax_code',
                    name: 'tax_code',
                    label: 'Codice Fiscale',
                    placeholder: 'Inserisci il codice fiscale',
                    required: true,
                    maxlength: 16,
                    value: athlete?.associate_data?.tax_code,
                    style: 'text-transform:uppercase',
                }} />
            <div class="mt-5">
                <GenerateTaxCodeButton
                    bind:data={athlete.associate_data}
                    on:codice={e => (athlete.associate_data.tax_code = e.detail)} />
            </div>
        </div>
    </div>

    <TextInput
        customClasses={'col-12 mb-4'}
        editable={false}
        active={false}
        on:change={e => {
            athlete.associate_data.address = e.detail;
        }}
        props={{
            id: 'address',
            name: 'address',
            label: 'Indirizzo di Residenza, Numero',
            placeholder: 'Inserisci indirizzo e numero',
            required: true,
            value: athlete?.associate_data?.address,
            style: 'text-transform:capitalize',
        }} />

    <TextInput
        customClasses={'col-12 mb-4'}
        editable={false}
        active={false}
        on:change={e => {
            athlete.associate_data.address_city = e.detail;
        }}
        props={{
            id: 'address_city',
            name: 'address_city',
            label: 'Città di Residenza',
            placeholder: 'Inserisci la città',
            required: true,
            value: athlete?.associate_data?.address_city,
            style: 'text-transform:capitalize',
        }} />

    <TextInput
        customClasses={'col-12 col-xl-6 mb-4'}
        editable={false}
        active={false}
        on:change={e => {
            athlete.associate_data.address_cap = e.detail;
        }}
        props={{
            id: 'address_cap',
            name: 'address_cap',
            label: 'CAP',
            placeholder: 'Inserisci il CAP',
            required: true,
            value: athlete?.associate_data?.address_cap,
        }} />

    <TextInput
        customClasses={'col-12 col-xl-6 mb-4'}
        editable={false}
        active={false}
        on:change={e => {
            athlete.associate_data.phone = e.detail;
        }}
        props={{
            id: 'phone',
            name: 'phone',
            label: `Cellulare`,
            placeholder: 'Inserisci il numero di telefono',
            required: false,
            value: athlete?.associate_data?.phone,
        }} />

    <TextInput
        customClasses={'col-12 mb-4'}
        editable={false}
        active={false}
        on:change={e => {
            athlete.associate_data.email = e.detail;
        }}
        props={{
            id: 'email',
            name: 'email',
            label: `Email`,
            placeholder: 'Inserisci un indirizzo email',
            type: 'email',
            required: false,
            value: athlete?.associate_data?.email,
        }} />
    {#if athlete?.additional_fields && athlete?.additional_fields.length > 0}
        <div class="col-12 mt-4 mb-0">
            <h4>Campi aggiuntivi</h4>
        </div>
        <div class="col-12 mt-0">
            <AdditionalFields bind:formData={athlete} />
        </div>
    {/if}

    {#if wizardData?.sportAssociationData?.isFederation}
        {#if ['scuola-asc', 'asd-o-ssd', 'societa'].includes(athlete.custom_data.type_of_associate)}
            <FederationSocietyData bind:formData={athlete} />
        {:else}
            <Step1minor bind:formData={athlete} sportAssociationData={wizardData.sportAssociationData} />
            <FederationAthleteData bind:formData={athlete} />
        {/if}
    {:else}
        <Step1minor bind:formData={athlete} sportAssociationData={wizardData.sportAssociationData} />
    {/if}

    <div class="col-12 mt-4">
        <hr />
        <h4 class="font-weight-bolder">Certificato Medico</h4>

        <span class="form-text text-muted mb-4">
            Puoi caricare il tuo certificato medico e impostare la data di scadenza.
        </span>

        <div class="dropzone dropzone-multi" id="medical_certificate_dropzone">
            <div class="dropzone-panel mb-4">
                {#if hasCertificate}
                    <button
                        class="btn btn-sm btn-danger font-weight-boldest d-flex align-items-center mb-0"
                        on:click={() => {
                            athlete.medical_certificate = {
                                medical_id: null,
                                filename: null,
                                certificate_expring_date: null,
                            };
                            // Reset dropzone if it exists
                            const dropzone = Dropzone.forElement('#medical_certificate_dropzone');
                            if (dropzone) {
                                dropzone.removeAllFiles(true);
                            }
                        }}>
                        <XCircle size={16} weight="duotone" class="mr-2" />
                        Rimuovi certificato
                    </button>
                {:else}
                    <a class="dropzone-select btn btn-primary font-weight-bold"> Carica Certificato </a>
                {/if}
            </div>

            <div class="dropzone-items">
                <div class="dropzone-item" style="display:none">
                    <div class="dropzone-file">
                        <div class="dropzone-filename" title="file caricato!">
                            <span data-dz-name />
                            <strong>(<span data-dz-size />)</strong>
                        </div>
                        <div class="dropzone-error" data-dz-errormessage />
                    </div>
                    <div class="dropzone-progress">
                        <div class="progress">
                            <div
                                class="progress-bar bg-primary"
                                role="progressbar"
                                aria-valuemin="0"
                                aria-valuemax="100"
                                aria-valuenow="0"
                                data-dz-uploadprogress />
                        </div>
                    </div>
                    <div class="dropzone-toolbar">
                        <span class="dropzone-delete" data-dz-remove>
                            <i class="flaticon2-cross" />
                        </span>
                    </div>
                </div>
            </div>
            <span class="form-text text-muted">Dimensione massima: 5MB. Formati supportati: immagini e PDF.</span>
        </div>

        {#if hasCertificate}
            <div
                style="width:fit-content;"
                class="label-light-success bg-light-success mt-4 py-1 w-fit px-4 text-success font-size-sm font-weight-boldest rounded-xl"
                role="alert">
                <CheckCircle size={20} weight="duotone" class="mr-2" />
                Certificato medico caricato con successo
            </div>
        {:else if uploadingMedicalCertificate}
            <div
                style="width:fit-content;"
                class="label-light-warning bg-light-warning mt-4 py-1 w-fit px-4 text-warning font-size-sm font-weight-boldest rounded-xl"
                role="alert">
                <CheckCircle size={20} weight="duotone" class="mr-2" />
                Caricamento in corso...
            </div>
        {/if}

        <div class="mt-4">
            <Datepicker
                customClasses={'w-100'}
                editable={false}
                active={false}
                on:change={e => {
                    athlete.medical_certificate = athlete.medical_certificate || {};
                    athlete.medical_certificate.certificate_expring_date = e.detail;
                }}
                props={{
                    id: 'certificate_expring_date',
                    name: 'certificate_expring_date',
                    label: 'Data di Scadenza',
                    placeholder: 'Seleziona la data di scadenza',
                    required: true,
                    format: 'DD/MM/YYYY',
                    value: athlete?.medical_certificate?.certificate_expring_date,
                    minDate: moment().format('YYYY-MM-DD'),
                }} />
        </div>
    </div>

    <div class="col-12 mt-4">
        <hr />
        <h4 class="font-weight-bolder">Accetto le seguenti clausole</h4>
        <div class="accordion accordion-light accordion-toggle-arrow" id="modulo-accordion">
            {#each wizardData?.sportAssociationData?.user?.sport_association?.additional_sections as section, idx}
                {#if showSection(athlete?.associate_data?.type, section, 'additional_sections')}
                    <div class="card" style="border-bottom: 1px solid #e0e0e0;">
                        <div class="card-header">
                            <div
                                class="card-title collapsed font-weight-boldest text-primary"
                                data-toggle="collapse"
                                data-target="#section-{idx}">
                                {section.name}
                            </div>
                        </div>
                        <div id="section-{idx}" class="collapse" data-parent="#modulo-accordion">
                            <div class="card-body">
                                {@html section.text}
                            </div>
                        </div>
                    </div>
                {/if}
            {/each}
            {#if showSection(athlete?.associate_data?.type, wizardData?.sportAssociationData?.user?.sport_association, 'regulation')}
                <div class="card" style="border-bottom: 1px solid #e0e0e0;">
                    <div class="card-header">
                        <div
                            class="card-title collapsed font-weight-boldest text-primary"
                            data-toggle="collapse"
                            data-target="#regulation">
                            REGOLAMENTO
                        </div>
                    </div>
                    <div id="regulation" class="collapse" data-parent="#modulo-accordion">
                        <div class="card-body">
                            {@html wizardData?.sportAssociationData?.user?.sport_association?.regulation}
                        </div>
                    </div>
                </div>
            {/if}
            {#if showSection(athlete?.associate_data?.type, wizardData?.sportAssociationData?.user?.sport_association, 'demand')}
                <div class="card" style="border-bottom: 1px solid #e0e0e0;">
                    <div class="card-header">
                        <div
                            class="card-title font-weight-boldest text-primary"
                            data-toggle="collapse"
                            data-target="#demand">
                            RICHIESTA
                        </div>
                    </div>
                    <div id="demand" class="collapse show" data-parent="#modulo-accordion">
                        <div class="card-body">
                            {@html wizardData?.sportAssociationData?.user?.sport_association?.demand}
                        </div>
                    </div>
                </div>
            {/if}
        </div>
        <h4 class="py-4 font-weight-bolder">Firma Modulo d'Iscrizione</h4>
        <SmoothSignature
            signature={athlete.signature}
            on:update={e => {
                athlete.signature = e.detail;
            }} />
    </div>
</div>
