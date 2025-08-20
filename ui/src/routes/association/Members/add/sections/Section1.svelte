<script>
    import {SmartSelect} from 'components/formBuilder/preview-blocks';
    import {newUserAccount, userData} from 'store/stores.js';
    import {newAssociate} from 'store/stores';
    import {onMount} from 'svelte';
    import Select from 'svelte-select';
    import {AssociateRole, AssociateRoleOptions, MembersListType, MembersListTypeOptions} from 'utils/enumUtils';

    newUserAccount.useLocalStorage();
    newAssociate.useLocalStorage();
    userData.useLocalStorage();

    export let searchData = null;

    let availablePlans = [];
    let availableMembershipPlans = [];

    $: {
        if (!searchData) {
            availablePlans = $userData?.sport_association?.subscription_fee_plans?.map(x => {
                return {
                    value: x.id || '',
                    label: `${x.name} (€ ${parseFloat(x.subscription_fee).toLocaleString('it-IT', {
                        minimumFractionDigits: 2,
                    })})`,
                };
            });
            availableMembershipPlans =
                $userData?.sport_association?.membership_fee_plans?.map(x => {
                    return {
                        value: x.id || '',
                        label: `${x.name} (€ ${parseFloat(x.membership_fee).toLocaleString('it-IT', {
                            minimumFractionDigits: 2,
                        })})`,
                    };
                }) || [];
        } else {
            if (searchData?.sport_association?.multiple_subscription_fee)
                availablePlans = searchData?.sport_association?.subscription_fee_plans?.map(x => {
                    return {
                        value: x?.id || '',
                        label: `${x?.name} (€ ${parseFloat(x?.subscription_fee).toLocaleString('it-IT', {
                            minimumFractionDigits: 2,
                        })})`,
                    };
                });
        }
    }

    export function onChangeMemberAccount(event) {
        $newUserAccount.new_member = !$newUserAccount.new_member;
    }

    jQuery(document).ready(function () {
        //document.getElementsByClassName("form-group")[0].children[1].children[0].focus();

        jQuery('#kt_phone_mask').inputmask({
            mask: '[+]999999999999999',
            placeholder: '', // remove underscores from the input mask
        });

        jQuery('#kt_phone_mask').change(function () {
            $newUserAccount.new_member_info.phone = document.getElementById('kt_phone_mask').value;
            newUserAccount.set($newUserAccount);
        });
    });
    onMount(() => {
        setTimeout(() => {
            if ($userData.sport_association.multiple_subscription_fee) {
                $newUserAccount.plan_id = $userData.sport_association.subscription_fee_plans[0].id || '';
            }
        }, 400);
    });
</script>

<div class="pb-5" data-wizard-type="step-content" data-wizard-state="current">
    <h4 class="mb-10 font-weight-bold text-dark wizard-title-info">Informazioni del Profilo</h4>
    {#if !searchData}
        <div class="alert alert-custom alert-light-info fade show mb-5" role="alert">
            <div class="alert-icon"><i class="flaticon-info" /></div>
            <div class="alert-text">
                Il nostro legale di fiducia ti consiglia di convocare il <b>consiglio direttivo</b> per deliberare che verranno
                raccolte anche online le iscrizioni.
            </div>
            <div class="alert-close">
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">
                        <i class="ki ki-close" />
                    </span>
                </button>
            </div>
        </div>
        <div class="form-group">
            <SmartSelect
                customClasses={'min-w-100'}
                editable={false}
                active={false}
                bind:value={$newAssociate.associate_data.type}
                props={{
                    id: 'type',
                    name: 'type',
                    label: 'Tipo iscrizione',
                    placeholder: 'Seleziona uno stato atleta',
                    required: true,
                    clearable: false,
                    searchable: false,
                    showChevron: true,
                    options: MembersListTypeOptions,
                    value: $newAssociate.associate_data.type || MembersListType.ASSOCIATE_AND_MEMBER,
                }} />
        </div>
        {#if $newAssociate.associate_data.type === MembersListType.ASSOCIATE_AND_MEMBER || $newAssociate.associate_data.type === MembersListType.ASSOCIATE_ONLY}
            <div class="form-group">
                <SmartSelect
                    customClasses={'min-w-100'}
                    editable={false}
                    active={false}
                    bind:value={$newAssociate.associate_data.role}
                    props={{
                        id: 'role',
                        name: 'role',
                        label: 'Tipo socio',
                        placeholder: 'Seleziona un tipo socio',
                        required: true,
                        clearable: false,
                        searchable: false,
                        showChevron: true,
                        options: AssociateRoleOptions,
                        value: $newAssociate.associate_data.role || AssociateRole.SOCIO_ORDINARIO,
                    }} />
            </div>
        {/if}

        {#if $newAssociate.associate_data.type === MembersListType.ASSOCIATE_AND_MEMBER || $newAssociate.associate_data.type === MembersListType.ASSOCIATE_ONLY}
            <h5 class="mt-5 font-weight-bolder text-dark">Quota associativa</h5>
            {#if $userData?.sport_association?.multiple_subscription_fee}
                <div class="form-group">
                    <!-- svelte-ignore a11y-label-has-associated-control -->
                    <div class="radio-inline margin-tb-2">
                        <Select
                            hideEmptyState={true}
                            items={availablePlans || []}
                            placeholder="Seleziona una quota associativa"
                            clearable={false}
                            searchable={true}
                            showChevron={true}
                            bind:value={$newUserAccount.plan_id}
                            name="plan_id" />
                    </div>
                    <!-- {:else} -->
                    <span class="form-text text-muted">
                        Seleziona la quota associativa che vuoi assegnare al socio che stai per creare.
                    </span>
                    <!-- {/if} -->
                </div>
            {:else}
                <span class="form-text text-lg font-weight-bold mb-4">
                    Verrà creato un pagamento per la <b>quota associativa</b> di
                    <b class="text-primary font-weight-boldest"
                        >{parseFloat($userData?.sport_association?.subscription_fee).toLocaleString('it-IT', {
                            style: 'currency',
                            currency: 'EUR',
                            minimumFractionDigits: 2,
                        })}</b>
                </span>
            {/if}
        {/if}
        {#if $newAssociate.associate_data.type === MembersListType.MEMBER_ONLY || $newAssociate.associate_data.type === MembersListType.ASSOCIATE_AND_MEMBER}
            <h5 class="mt-5 font-weight-bolder text-dark">Quota tesseramento</h5>
            {#if $userData?.sport_association?.multiple_membership_fee}
                <div class="form-group">
                    <!-- svelte-ignore a11y-label-has-associated-control -->
                    <div class="radio-inline margin-tb-2">
                        <Select
                            hideEmptyState={true}
                            items={availableMembershipPlans || []}
                            placeholder="Seleziona una quota di tesseramento"
                            clearable={false}
                            searchable={true}
                            showChevron={true}
                            bind:value={$newUserAccount.membership_plan_id}
                            name="membership_plan_id" />
                    </div>
                    <!-- {:else} -->
                    <span class="form-text text-muted">
                        Seleziona la quota di tesseramento che vuoi assegnare all'atleta che stai per creare.
                    </span>
                    <!-- {/if} -->
                </div>
            {:else}
                <span class="form-text text-lg font-weight-bold mb-4">
                    Verrà creato un pagamento per la <b>quota di tesseramento</b> di
                    <b class="text-primary font-weight-boldest"
                        >{parseFloat($userData?.sport_association?.membership_fee || 0).toLocaleString('it-IT', {
                            style: 'currency',
                            currency: 'EUR',
                            minimumFractionDigits: 2,
                        })}</b>
                </span>
            {/if}
        {/if}
        <hr class="mt-8" />
        <div class="mt-8 p-0">
            <h5 class="font-weight-bolder mb-4">Riepilogo pagamento</h5>

            {#if $newAssociate.associate_data.type === MembersListType.ASSOCIATE_ONLY || $newAssociate.associate_data.type === MembersListType.ASSOCIATE_AND_MEMBER}
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span>Quota associativa</span>
                    <span class="font-weight-bold">
                        {#if $userData?.sport_association?.multiple_subscription_fee}
                            {#if $newUserAccount.plan_id}
                                {parseFloat(
                                    $userData?.sport_association?.subscription_fee_plans?.find(
                                        plan => plan.id === $newUserAccount.plan_id?.value
                                    )?.subscription_fee || 0
                                ).toLocaleString('it-IT', {
                                    style: 'currency',
                                    currency: 'EUR',
                                    minimumFractionDigits: 2,
                                })}
                            {:else}
                                Non selezionata
                            {/if}
                        {:else}
                            {parseFloat($userData?.sport_association?.subscription_fee || 0).toLocaleString('it-IT', {
                                style: 'currency',
                                currency: 'EUR',
                                minimumFractionDigits: 2,
                            })}
                        {/if}
                    </span>
                </div>
            {/if}

            {#if $newAssociate.associate_data.type === MembersListType.MEMBER_ONLY || $newAssociate.associate_data.type === MembersListType.ASSOCIATE_AND_MEMBER}
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span>Quota tesseramento</span>
                    <span class="font-weight-bold">
                        {#if $userData?.sport_association?.multiple_membership_fee}
                            {#if $newUserAccount.membership_plan_id}
                                {parseFloat(
                                    $userData?.sport_association?.membership_fee_plans?.find(
                                        plan => plan.id === $newUserAccount.membership_plan_id?.value
                                    )?.membership_fee || 0
                                ).toLocaleString('it-IT', {
                                    style: 'currency',
                                    currency: 'EUR',
                                    minimumFractionDigits: 2,
                                })}
                            {:else}
                                Non selezionata
                            {/if}
                        {:else}
                            {parseFloat($userData?.sport_association?.membership_fee || 0).toLocaleString('it-IT', {
                                style: 'currency',
                                currency: 'EUR',
                                minimumFractionDigits: 2,
                            })}
                        {/if}
                    </span>
                </div>
            {/if}

            <div class="d-flex justify-content-between align-items-center font-weight-bolder mt-4 font-size-h2">
                <span>Totale</span>
                <span class="font-weight-boldest">
                    {(
                        ($newAssociate.associate_data.type === MembersListType.ASSOCIATE_ONLY ||
                        $newAssociate.associate_data.type === MembersListType.ASSOCIATE_AND_MEMBER
                            ? $userData?.sport_association?.multiple_subscription_fee
                                ? parseFloat(
                                      $userData?.sport_association?.subscription_fee_plans?.find(
                                          plan => plan.id === $newUserAccount.plan_id?.value
                                      )?.subscription_fee || 0
                                  )
                                : parseFloat($userData?.sport_association?.subscription_fee || 0)
                            : 0) +
                        ($newAssociate.associate_data.type === MembersListType.MEMBER_ONLY ||
                        $newAssociate.associate_data.type === MembersListType.ASSOCIATE_AND_MEMBER
                            ? $userData?.sport_association?.multiple_membership_fee
                                ? parseFloat(
                                      $userData?.sport_association?.membership_fee_plans?.find(
                                          plan => plan.id === $newUserAccount.membership_plan_id?.value
                                      )?.membership_fee || 0
                                  )
                                : parseFloat($userData?.sport_association?.membership_fee || 0)
                            : 0)
                    ).toLocaleString('it-IT', {
                        style: 'currency',
                        currency: 'EUR',
                        minimumFractionDigits: 2,
                    })}
                </span>
            </div>
        </div>
        <hr class="mt-8" />
        <div class="form-group mt-4">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label>Crea nuovo account per il socio / tesserato?</label>
            <div class="radio-inline margin-tb-2">
                <label class="radio radio-lg">
                    <input
                        type="radio"
                        on:change={onChangeMemberAccount}
                        checked={$newUserAccount.new_member == true}
                        name="new_account_radio"
                        value="true" />
                    <span />Sì</label>
                <label class="radio radio-lg">
                    <input
                        type="radio"
                        on:change={onChangeMemberAccount}
                        checked={$newUserAccount.new_member == false}
                        name="new_account_radio"
                        value="false" />
                    <span />No</label>
            </div>
            <!-- {#if new_member} -->
            <span class="form-text text-muted" style="display:{$newUserAccount.new_member ? 'block' : 'none'}"
                >Il nuovo associato riceverà un'email di configurazione valida 14 giorni. Il socio potrà poi accedere su
                {__bakney.OEM_CONFIG?.name} in autonomia.
            </span>
            <!-- {:else} -->
            <span class="form-text text-muted" style="display:{!$newUserAccount.new_member ? 'block' : 'none'}"
                >Selezionando questa opzione il socio che andrai ad aggiungere sarà <b>collegato al tuo account</b> e
                quindi dichiari di poter utilizzare quei <b>dati personali</b>. Se non sei sicuro, scegli l'opzione
                <b>"Sì"</b>
                e crea un
                <b>account</b> utilizzabile dal socio.
            </span>
            <!-- {/if} -->
        </div>
        <!-- {#if new_member} -->
        <div style="display:{$newUserAccount.new_member ? 'block' : 'none'}">
            <!--begin::Input-->
            <div class="form-group">
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <label>Nome <b>*</b></label>
                <input
                    bind:value={$newUserAccount.new_member_info.first_name}
                    type="text"
                    class="form-control form-control-solid form-control-lg margin-tb-2"
                    name="fname"
                    placeholder="Nome"
                    style="text-transform:capitalize" />
                <!-- <span class="form-text text-muted">Per favore inserisci il nome.</span> -->
            </div>
            <!--end::Input-->
            <!--begin::Input-->
            <div class="form-group">
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <label>Cognome <b>*</b></label>
                <input
                    bind:value={$newUserAccount.new_member_info.last_name}
                    type="text"
                    class="form-control form-control-solid form-control-lg margin-tb-2"
                    name="lname"
                    placeholder="Cognome"
                    style="text-transform:capitalize" />
                <!-- <span class="form-text text-muted">Per favore inserisci il cognome.</span> -->
            </div>
            <!--end::Input-->
            <div class="row">
                <div class="col-xl-6">
                    <!--begin::Input-->
                    <div class="form-group">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label>Numero di Telefono</label>
                        <input
                            bind:value={$newUserAccount.new_member_info.phone}
                            type="tel"
                            id="kt_phone_mask"
                            class="form-control form-control-solid form-control-lg margin-tb-2"
                            name="phone"
                            placeholder="+39 0001234567" />
                        <!-- <span class="form-text text-muted">Per favore inserisci un numero di telefono.</span> -->
                    </div>
                    <!--end::Input-->
                </div>
                <div class="col-xl-6">
                    <!--begin::Input-->
                    <div class="form-group">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label>Email <b>*</b></label>
                        <input
                            bind:value={$newUserAccount.new_member_info.email}
                            type="email"
                            class="form-control form-control-solid form-control-lg margin-tb-2"
                            name="email"
                            placeholder="Inserisci un'email..." />
                        <!-- <span class="form-text text-muted">Per favore inserisci un indirizzo email.</span> -->
                    </div>
                    <!--end::Input-->
                </div>
            </div>
        </div>
        <!-- {/if} -->
    {/if}
</div>

<svelte:head>
    <style>
        .svelte-select {
            font-size: 13px !important;
            padding-left: 1rem !important;
            border: 0 !important;
            background: #f4f6f9 !important;
            font-size: 13px !important;
            color: #000 !important;
        }
        .svelte-select input:focus {
            border: 0 !important;
            outline: 0 !important;
        }
        .svelte-select input {
            font-size: 13px !important;
            color: #000 !important;
        }
        .svelte-select .selected-item {
            font-size: 13px !important;
        }
    </style>
</svelte:head>
