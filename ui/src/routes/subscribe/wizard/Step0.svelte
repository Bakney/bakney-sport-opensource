<script>
    import {SmartSelect} from 'components/formBuilder/preview-blocks';
    import {onMount} from 'svelte';
    import {sessionToken, userData} from 'store/stores';
    import {ArrowRight, ArrowDown} from 'phosphor-svelte';
    import Select from 'svelte-select/Select.svelte';
    import FederationSettings from './partials/federation-settings.svelte';
    import {apiFetch} from 'utils/ApiMiddleware';

    sessionToken.useLocalStorage();
    userData.useLocalStorage();

    export let wizardData;

    let availablePlans = [];
    let availableMembershipPlans = [];
    let validData = false;
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

    let enabledForMap = {
        associate: 1,
        'associate-membership': 2,
        membership: 3,
    };

    let subscriptions = [];

    $: {
        validData = canContinue();
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
                                    .includes(wizardData.formData.custom_data.type_of_associate) ||
                                !Array.from(x?.type_of_request || [])
                                    .map(t => t.value)
                                    .includes(wizardData.formData.custom_data.type_of_request)
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
                                    .includes(wizardData.formData.custom_data.type_of_associate) ||
                                !Array.from(x?.type_of_request || [])
                                    .map(t => t.value)
                                    .includes(wizardData.formData.custom_data.type_of_request)
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

    function checkLogin() {
        // check that user is logged in by checking local storage for:
        // - sessionToken
        // - isExpired
        // - userData
        // - refreshToken
        // - expires

        if (localStorage.getItem('sessionToken') && localStorage.getItem('isExpired') === 'false') {
            wizardData.toStep(1);
        } else {
            // if not logged in, open window to login page and wait until the session token is set
            // then close the window and continue
            const loginWindow = window.open(
                `${window.location.origin}/#/login?redirect=${window.location.pathname}`,
                'Login',
                'width=600,height=600'
            );

            const interval = setInterval(() => {
                if (localStorage.getItem('sessionToken') && localStorage.getItem('isExpired') === 'false') {
                    clearInterval(interval);
                    loginWindow.close();
                    wizardData.toStep(1);
                }
            }, 1000);
        }
    }

    function canContinue() {
        let validFees = false;

        // check enable_quotes_management, if disabled, validFees is true
        if (!wizardData?.sportAssociationData?.user?.sport_association?.enable_quotes_management) {
            validFees = true;
        } else {
            if (wizardData?.formData?.associate_data?.type === 1) {
                // valid only if selected the subscription fee
                validFees = !(
                    wizardData?.sportAssociationData?.user?.sport_association?.multiple_subscription_fee &&
                    !wizardData.formData.plan_id
                );
            } else if (wizardData?.formData?.associate_data?.type === 3) {
                // valid only if selected the membership fee
                validFees = !(
                    wizardData?.sportAssociationData?.user?.sport_association?.multiple_membership_fee &&
                    !wizardData.formData.membership_plan_id
                );
            } else {
                validFees = !(
                    (wizardData?.sportAssociationData?.user?.sport_association?.multiple_subscription_fee &&
                        !wizardData.formData.plan_id) ||
                    (wizardData?.sportAssociationData?.user?.sport_association?.multiple_membership_fee &&
                        !wizardData.formData.membership_plan_id)
                );
            }
        }

        let validAssociate = true;
        let validFederation = true;
        let validRole = true;
        let validDisciplines = true;

        if (wizardData.sportAssociationData?.isFederation) {
            validAssociate =
                wizardData.formData.custom_data.type_of_associate !== null &&
                wizardData.formData.custom_data.type_of_associate !== undefined &&
                wizardData.formData.custom_data.type_of_associate !== '';

            if (
                wizardData.formData.custom_data.type_of_request === 'rinnovo' &&
                !['scuola-asc', 'asd-o-ssd', 'societa'].includes(wizardData.formData.custom_data.type_of_associate)
            ) {
                validFederation =
                    wizardData.formData.custom_data.membership_number !== '' &&
                    wizardData.formData.custom_data.membership_number !== null &&
                    wizardData.formData.custom_data.membership_number !== undefined;
            }

            if (
                !['scuola-asc', 'asd-o-ssd', 'societa'].includes(wizardData?.formData?.custom_data?.type_of_associate)
            ) {
                validDisciplines = wizardData?.formData?.custom_data?.disciplines?.length > 2;
            }
        } else {
            // check enabled_for, if just one option is enabled, validAssociate is true and set type to the only enabled option
            if (wizardData?.sportAssociationData?.user?.sport_association?.enabled_for?.length === 1) {
                // set type to the only enabled option
                wizardData.formData.associate_data.type =
                    enabledForMap[wizardData?.sportAssociationData?.user?.sport_association?.enabled_for[0]];
            }
            validAssociate =
                wizardData.formData.associate_data.type !== null &&
                wizardData.formData.associate_data.type !== undefined &&
                wizardData.formData.associate_data.type !== '';
        }

        return validFees && validAssociate && validFederation && validRole && validDisciplines;
    }

    async function fetchSubscriptions() {
        let res = await apiFetch(
            `${__bakney.env.API.SUBSCRIPTION.LIST_ALL}?preregistration=1&sport_association=${wizardData.sportAssociationData?.sport_association_id}`,
            {
                skipForbidden: true,
            }
        );

        if (!res.error) {
            subscriptions = [];
            Object.keys(res.response.data).forEach(key => {
                subscriptions.push({
                    value: res.response.data[key].subscription_id,
                    label:
                        res.response.data[key].associate.first_name + ' ' + res.response.data[key].associate.last_name,
                });
            });
        }
    }

    onMount(async () => {
        if (wizardData?.formData?.preregistration) {
            await fetchSubscriptions();
        }
    });

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
        //console.debug('Starting handleTypeOfAssociateChange function');
        let foundAffiliation = false;
        let foundRenewal = false;

        // console.debug('Checking membershipFeePlans');
        for (const membershipFeePlan of membershipFeePlans || []) {
            // console.debug('Current membershipFeePlan:', membershipFeePlan);
            // stop if foundAffiliation or foundRenewal is true
            if (foundAffiliation && foundRenewal) {
                // console.debug('Found both affiliation and renewal, breaking loop');
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
</script>

{#if wizardData?.formData?.preregistration && subscriptions.length > 0}
    <div class="form-group">
        <SmartSelect
            customClasses={'min-w-100'}
            editable={false}
            active={false}
            on:change={e => {
                wizardData.formData.subscription_id = e.detail.value;
            }}
            on:clear={() => {
                wizardData.formData.subscription_id = null;
            }}
            props={{
                id: 'subscription_id',
                name: 'subscription_id',
                label: 'Seleziona atleta da rinnovare',
                placeholder: "Seleziona l'atleta da rinnovare",
                required: false,
                clearable: true,
                searchable: true,
                showChevron: true,
                multiple: false,
                options: subscriptions,
                value: wizardData?.formData?.subscription_id || null,
            }} />
    </div>
{/if}

{#if wizardData?.formData?.preregistration && subscriptions.length > 0}
    <div
        class="d-flex align-items-center justify-content-center flex-column mt-4 text-dark font-size-h6 font-weight-bolder mb-12 mt-6">
        <div class="mb-2 text-center" style="font-style: italic;">
            oppure lascia il campo vuoto per <br />
            <b class="text-primary font-weight-boldest">iscrivere un nuovo atleta</b>
        </div>
        <ArrowDown size={18} weight="bold" class="mx-4 text-secondary" />
    </div>
{/if}

{#if wizardData?.sportAssociationData?.isFederation}
    <FederationSettings
        bind:formData={wizardData.formData}
        on:type_of_associate_changed={handleTypeOfAssociateChange}
        bind:availableTypesOfRequests />
{:else if wizardData?.sportAssociationData?.user?.sport_association?.enabled_for?.length == 1}
    {#if wizardData?.sportAssociationData?.user?.sport_association?.enabled_for.includes('associate')}
        Stai compilando l'iscrizione come <b>Socio</b>.
    {:else if wizardData?.sportAssociationData?.user?.sport_association?.enabled_for.includes('associate-membership')}
        Stai compilando l'iscrizione come <b>Socio e Tesserato</b>.
    {:else if wizardData?.sportAssociationData?.user?.sport_association?.enabled_for.includes('membership')}
        Stai compilando l'iscrizione come <b>Tesserato</b>.
    {/if}
{:else}
    <SmartSelect
        customClasses={'min-w-100'}
        editable={false}
        active={false}
        bind:value={wizardData.formData.associate_data.type}
        props={{
            id: 'associate_data.type',
            name: 'associate_data.type',
            label: 'Chiedo di iscrivermi come',
            placeholder: "Seleziona un'opzione",
            required: true,
            clearable: false,
            searchable: false,
            showChevron: true,
            multiple: false,
            options: [
                ...(wizardData?.sportAssociationData?.user?.sport_association?.enabled_for.includes('associate')
                    ? [{value: 1, label: 'Socio'}]
                    : []),
                ...(wizardData?.sportAssociationData?.user?.sport_association?.enabled_for.includes(
                    'associate-membership'
                )
                    ? [{value: 2, label: 'Socio e Tesserato'}]
                    : []),
                ...(wizardData?.sportAssociationData?.user?.sport_association?.enabled_for.includes('membership')
                    ? [{value: 3, label: 'Tesserato'}]
                    : []),
            ],
            value: wizardData?.formData?.associate_data?.type || null,
        }} />
{/if}

{#if wizardData?.sportAssociationData?.user?.sport_association?.enable_quotes_management}
    {#if wizardData?.formData?.associate_data?.type === 1 || wizardData?.formData?.associate_data?.type === 2}
        <h3 class="font-weight-bolder font-size-h2 mt-8 mb-2">Quota Associativa</h3>
        {#if wizardData?.sportAssociationData?.user?.sport_association?.multiple_subscription_fee}
            <div class="form-group">
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <div class="radio-inline margin-tb-2">
                    <SmartSelect
                        customClasses={'min-w-100'}
                        editable={false}
                        active={false}
                        bind:value={wizardData.formData.plan_id}
                        on:change={() => {
                            wizardData.formData.plan_label = availablePlans.find(
                                x => x.value === wizardData.formData.plan_id
                            ).label;
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
                            value: wizardData.formData.plan_id,
                        }} />
                    <!--  <select
                    class="form-control"
                    name="plan_id"
                    bind:value={wizardData.formData.plan_id}
                    on:change={() => {
                        wizardData.formData.plan_label = availablePlans.find(
                            x => x.value === wizardData.formData.plan_id
                        ).label;
                    }}>
                    <option value={null} disabled>Seleziona una quota associativa</option>
                    {#each availablePlans as plan}
                        <option value={plan.value}>{plan.label}</option>
                    {/each}
                </select> -->
                </div>
                <!-- {:else} -->
                <!-- <span class="form-text text-muted">
                    {#if searchData}
                        Seleziona la quota associativa che vuoi assegnare al socio che stai per creare.
                    {:else}
                        Hai attivato la possibilità di scegliere tra più quote associative. Seleziona quella adatta al socio
                        che stai per creare.
                    {/if}
                </span> -->
                <!-- {/if} -->
            </div>
            <!-- {:else if searchData}
            <span class="form-text text-muted">
                La quota associativa che andrai a pagare sarà di <b
                    >{parseFloat(searchData?.sport_association?.subscription_fee).toLocaleString('it-IT', {
                        style: 'currency',
                        currency: 'EUR',
                        minimumFractionDigits: 2,
                    })}</b> come da statuto.
            </span> -->
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

    {#if wizardData?.formData?.associate_data?.type === 2 || wizardData?.formData?.associate_data?.type === 3}
        <h3 class="font-weight-bolder font-size-h2 mt-8 mb-2">Quota Tesseramento</h3>
        {#if wizardData?.sportAssociationData?.user?.sport_association?.multiple_membership_fee}
            <div class="form-group">
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <div class="radio-inline margin-tb-2">
                    <SmartSelect
                        customClasses={'min-w-100'}
                        editable={false}
                        active={false}
                        bind:value={wizardData.formData.membership_plan_id}
                        on:change={() => {
                            wizardData.formData.membership_plan_label = availableMembershipPlans.find(
                                x => x.value === wizardData.formData.membership_plan_id
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
                            value: wizardData.formData.membership_plan_id,
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
{/if}

{#if !wizardData.sportAssociationData.user.disable_account_creation}
    <h3 class="font-weight-bolder font-size-h1 mb-4 mt-12">Account associato</h3>
    <p>
        Premi su <b>CREA o ACCEDI con l'account</b> per accedere ad un account esistente oppure per crearne uno nuovo.
        <br />
        Puoi anche premere su <b>Continua senza account</b> per continuare senza creare un account.
    </p>
{:else if !wizardData.sportAssociationData.user.force_account_creation}
    <h3 class="font-weight-bolder font-size-h1 mb-4 mt-12">Account associato</h3>
    <p>
        Premi su <b>CREA o ACCEDI con l'account</b> per accedere ad un account esistente oppure per crearne uno nuovo.
        <br />
    </p>
{/if}
<div class="d-flex justify-content-end align-items-center">
    {#if $sessionToken && $sessionToken != '' && $userData && $userData != '' && $userData.user_id != ''}
        <button
            type="button"
            disabled={!validData}
            class="btn btn-sm btn-light-primary font-weight-bolder font-size-h6 px-6 py-4 my-3 mx-auto"
            on:click|once={() => {
                if (wizardData?.formData?.subscription_id) {
                    wizardData.createSubscription();
                } else {
                    wizardData.nextStep();
                }
            }}>
            {#if $userData.avatar_image}
                <div class="btn btn-icon shadow-lg h-30px w-30px p-0 profile-container mr-4">
                    <img
                        src={$userData.avatar_image}
                        class="h-30px align-self-end profile-fill"
                        alt=""
                        style="width: 100% !important; height: 100% !important;" />
                </div>
            {/if}
            {#if wizardData?.formData?.subscription_id}
                <span class="mr-1 font-weight-normal">Rinnova e associa all'account </span>
            {:else}
                <span class="mr-1 font-weight-normal">Continua come</span>
            {/if}
            {$userData.first_name}
            {$userData.last_name}
            <ArrowRight class="ml-1" size={18} weight="bold" />
        </button>
    {:else}
        {#if !wizardData.sportAssociationData.user.force_account_creation}
            <button
                disabled={!validData}
                type="button"
                class="btn btn-sm btn-{!wizardData.sportAssociationData.user.disable_account_creation
                    ? 'ghost text-dark-75'
                    : 'primary'} font-weight-bolder font-size-h6 px-8 py-4 my-3 mr-3"
                on:click={wizardData.nextStep}>
                Continua senza account
            </button>
        {/if}
        {#if !wizardData.sportAssociationData.user.disable_account_creation}
            <button
                disabled={!validData}
                type="button"
                class="btn btn-sm btn-primary font-weight-bolder font-size-h6 px-8 py-4 my-3 mr-4"
                on:click={checkLogin}>
                CREA o ACCEDI con l'account
            </button>
        {/if}
    {/if}
</div>

<hr class="mt-10" />
<div>
    <p class="text-center font-size-xs">
        Continuando senza un account l'iscrizione sarà gestita dall'associazione e non potrai scaricare le ricevute e
        pagare online.
    </p>
</div>
