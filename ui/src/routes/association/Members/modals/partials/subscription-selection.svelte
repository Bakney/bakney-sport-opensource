<script>
    import {SmartSelect} from 'components/formBuilder/preview-blocks';
    import {AssociateRoleOptions} from 'utils/enumUtils';
    import {toast} from 'svelte-sonner';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import {writable} from 'svelte/store';
    import {onMount} from 'svelte';

    export let formData;

    let userData = writable({});

    let availablePlans = [];
    let availableMembershipPlans = [];
    let loading = false;

    $: {
        availablePlans = $userData?.sport_association?.subscription_fee_plans
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
                    return {
                        value: x.id || '',
                        label: `${x.name} (€ ${parseFloat(x.subscription_fee).toLocaleString('it-IT', {
                            minimumFractionDigits: 2,
                        })})`,
                    };
                }
            })
            .filter(x => x != null);

        availableMembershipPlans = $userData?.sport_association?.membership_fee_plans
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
                    return {
                        value: x.id || '',
                        label: `${x.name} (€ ${parseFloat(x.membership_fee).toLocaleString('it-IT', {
                            minimumFractionDigits: 2,
                        })})`,
                    };
                }
            })
            .filter(x => x != null);

        if (availablePlans?.length > 0 && !formData.plan_id) {
            formData.plan_id = availablePlans[0].value;
        }
        if (availableMembershipPlans?.length > 0 && !formData.membership_plan_id) {
            formData.membership_plan_id = availableMembershipPlans[0].value;
        }
    }

    async function fetchData() {
        loading = true;
        let res = await apiFetch(__bakney.env.API.PROFILE.INFO);
        if (!res.error) {
            $userData = res.response.user_data;
        } else {
            // fire toast error
            toast.error('Errore nel caricamento dei dati');
        }
        loading = false;
    }

    onMount(async () => {
        await fetchData();
    });
</script>

{#if !loading}
    <div class="py-3">
        <SmartSelect
            customClasses={'min-w-100 mb-0'}
            editable={false}
            active={false}
            bind:value={formData.type}
            props={{
                id: 'formData.type',
                name: 'formData.type',
                label: 'Iscrivi come',
                placeholder: "Seleziona un'opzione",
                required: true,
                clearable: false,
                searchable: false,
                showChevron: true,
                multiple: false,
                options: [
                    {value: 1, label: 'Socio'},
                    {value: 2, label: 'Socio e Tesserato'},
                    {value: 3, label: 'Tesserato'},
                ],
                value: formData.type || null,
            }} />
    </div>
    {#if formData.type === 1 || formData.type === 2}
        <div class="mt-2 w-100">
            <SmartSelect
                customClasses={'min-w-100'}
                editable={false}
                active={false}
                bind:value={formData.role}
                props={{
                    id: 'role',
                    name: 'role',
                    label: 'Ruolo socio',
                    placeholder: 'Seleziona il ruolo del socio',
                    required: true,
                    options: AssociateRoleOptions,
                    value: formData?.role,
                }} />
        </div>
    {/if}
    <div class="mb-8">
        {#if $userData?.sport_association?.enable_quotes_management}
            {#if formData.type === 1 || formData.type === 2}
                <div class="border rounded-lg py-3 px-4 mt-4">
                    <h3 class="font-weight-bolder font-size-h6 mb-2">Quota Associativa</h3>
                    {#if $userData?.sport_association?.multiple_subscription_fee}
                        <div class="form-group mb-0">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <div class="radio-inline mt-2">
                                <SmartSelect
                                    customClasses={'min-w-100 mb-0 mt-1'}
                                    editable={false}
                                    active={false}
                                    on:change={e => {
                                        if (e.detail) {
                                            formData.plan_label = e.detail?.label;
                                            formData.plan_id = e.detail?.value;
                                        }
                                    }}
                                    props={{
                                        id: 'plan_id',
                                        name: 'plan_id',
                                        label: null,
                                        placeholder: 'Seleziona una quota associativa',
                                        helperLabel: 'Verrà creato un pagamento con questo importo',
                                        required: true,
                                        clearable: false,
                                        searchable: false,
                                        showChevron: true,
                                        options: [...availablePlans, {value: '-', label: 'Nessuna quota associativa'}],
                                        value: formData.plan_id,
                                    }} />
                            </div>
                        </div>
                    {:else}
                        <span class="form-text text-muted">
                            Verrà creato un pagamento di <b
                                >{parseFloat($userData?.sport_association?.subscription_fee || 0).toLocaleString(
                                    'it-IT',
                                    {
                                        style: 'currency',
                                        currency: 'EUR',
                                        minimumFractionDigits: 2,
                                    }
                                )}</b
                            >.
                        </span>
                    {/if}
                </div>
            {/if}

            {#if formData.type === 2 || formData.type === 3}
                <div class="border rounded-lg py-3 px-4 mt-4">
                    <h3 class="font-weight-bolder font-size-h6 mb-2">Quota Tesseramento</h3>
                    {#if $userData?.sport_association?.multiple_membership_fee}
                        <div class="form-group mb-0">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <div class="radio-inline mt-2">
                                <SmartSelect
                                    customClasses={'min-w-100 mb-0 mt-1'}
                                    editable={false}
                                    active={false}
                                    on:change={e => {
                                        if (e.detail) {
                                            formData.membership_plan_label = e.detail?.label;
                                            formData.membership_plan_id = e.detail?.value;
                                        }
                                    }}
                                    props={{
                                        id: 'membership_plan_id',
                                        name: 'membership_plan_id',
                                        label: null,
                                        placeholder: 'Seleziona una quota di tsssssesseramento',
                                        required: true,
                                        clearable: false,
                                        searchable: false,
                                        showChevron: true,
                                        helperLabel: 'Verrà creato un pagamento con questo importo',
                                        options: [
                                            ...availableMembershipPlans,
                                            {value: '-', label: 'Nessuna quota tesseramento'},
                                        ],
                                        value: formData.membership_plan_id,
                                    }} />
                            </div>
                        </div>
                    {:else}
                        <span class="form-text text-muted">
                            Verrà creato un pagamento di <b
                                >{parseFloat($userData?.sport_association?.membership_fee || 0).toLocaleString(
                                    'it-IT',
                                    {
                                        style: 'currency',
                                        currency: 'EUR',
                                        minimumFractionDigits: 2,
                                    }
                                )}</b
                            >.
                        </span>
                    {/if}
                </div>
            {/if}
        {/if}
    </div>
{:else}
    <div class="text-center py-20 d-flex justify-content-center">
        <div class="spinner spinner-primary spinner-lg" />
    </div>
{/if}
