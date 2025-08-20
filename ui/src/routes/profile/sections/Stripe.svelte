<script>
    import {onMount} from 'svelte';
    import {push} from 'svelte-spa-router';
    import {writable} from 'svelte/store';
    import {apiFetch} from 'utils/ApiMiddleware.js';
    import {sessionToken, subPage, userData} from 'store/stores.js';
    import {canPerformAction} from 'utils/Permissions.js';
    import {toast} from 'svelte-sonner';
    import {SmartMultiSelect} from 'components/formBuilder/preview-blocks/index.js';

    sessionToken.useLocalStorage();
    subPage.useLocalStorage();
    userData.useLocalStorage();

    let validButton = false;
    let twoFaData = {
        enable: false,
        otp: null,
    };
    let fetchedData = {};
    let stripEnabled = false;
    let initialData =
        $userData?.sport_association?.stripe_available_methods?.map(x => {
            if (x == 'card') {
                return {label: 'Carte', value: 'card'};
            } else if (x == 'sepa_debit') {
                return {label: 'Addebito Sepa', value: 'sepa_debit'};
            }
        }) || [];

    $: {
        if (twoFaData?.enable == true && twoFaData.otp && String(twoFaData.otp).length == 6) {
            validButton = true;
        } else if (twoFaData?.enable == false && twoFaData.otp == null && JSON.stringify(twoFaData) != fetchedData) {
            validButton = true;
        } else {
            validButton = false;
        }
    }

    onMount(() => {
        fetchInfo();
    });

    function fetchInfo() {
        apiFetch(__bakney.env.API.STRIPE.INFO).then(res => {
            if (!res.error) {
                if (res.response.data.stripe_on_boarding_completed) {
                    stripEnabled = true;
                } else {
                    stripEnabled = false;
                }
            }
        });
    }

    function setupStripe() {
        push('/stripe/onboarding');
    }

    async function updateStripeUserData() {
        let res = await apiFetch(__bakney.env.HOST + '/profile/update', {
            method: 'PATCH',
            body: JSON.stringify({
                user_data: {
                    first_name: $userData.first_name,
                    last_name: $userData.last_name,
                    username: $userData.username,
                    email: $userData.email,
                    avatar_image: $userData.avatar_image,
                    sport_association: $userData.sport_association,
                },
            }),
        });

        if (!res.error) {
            toast.success('Impostazioni stripe aggiornate.');
            fetchInfo();
        } else {
            let modalText =
                response.status == 403 ? 'Operazione non permessa.' : 'Scusa, ho individuato degli errori, riprova.';
            toast.error(modalText);
        }
    }
</script>

{#if $subPage == 'stripe'}
    <!-- $subPage == 'password' -->
    <!--begin::Content-->
    <div class="flex-row-fluid">
        <!--begin::Card-->
        <div class="card card-custom card-stretch">
            <!--begin::Header-->
            <div class="card-header py-3">
                <div class="card-title align-items-start flex-column">
                    <h3 class="card-label font-weight-bolder text-dark font-size-h1">Impostazioni Pagamenti Stripe</h3>
                    <span class="text-muted font-weight-bold font-size-sm mt-1"
                        >Attiva e configura Stripe per ricevere i pagamenti online.</span>
                </div>
            </div>
            <!--end::Header-->
            <!--begin::Form-->
            <div id="kt_form_password_update">
                <!--begin::Body-->
                <div class="card-body">
                    {#if !stripEnabled}
                        <div class="alert alert-custom alert-light-info fade show mb-10" role="alert">
                            <div class="alert-icon">
                                <span class="svg-icon svg-icon-3x svg-icon-info">
                                    <!--begin::Svg Icon | path:/keen/theme/demo1/dist/assets/media/svg/icons/Code/Info-circle.svg-->
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        xmlns:xlink="http://www.w3.org/1999/xlink"
                                        width="24px"
                                        height="24px"
                                        viewBox="0 0 24 24"
                                        version="1.1">
                                        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                            <rect x="0" y="0" width="24" height="24" />
                                            <circle fill="#000000" opacity="0.3" cx="12" cy="12" r="10" />
                                            <rect fill="#000000" x="11" y="10" width="2" height="7" rx="1" />
                                            <rect fill="#000000" x="11" y="7" width="2" height="2" rx="1" />
                                        </g>
                                    </svg>
                                    <!--end::Svg Icon-->
                                </span>
                            </div>
                            <div class="alert-text font-weight-bold">
                                In questa sezione puoi attivare e configurare Stripe per ricevere i pagamenti online.
                            </div>
                            <div class="alert-close">
                                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                    <span aria-hidden="true">
                                        <i class="ki ki-close" />
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div class="form-group row">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <div class="col-lg-12 col-xl-12" style="display: flex; align-items: center;">
                                <!-- <label class="col-3 col-form-label">With Icon</label> -->
                                <div class="col-12">
                                    <button
                                        disabled={!canPerformAction('other.settings.update')}
                                        class="btn btn-primary font-weight-bolder"
                                        on:click={setupStripe}>Configura Stripe</button>
                                </div>
                            </div>
                        </div>
                    {:else}
                        <div class="form-group row">
                            <div class="col-12">
                                <span
                                    class="label label-light-success label-inline font-weight-bolder label-lg"
                                    style="display: flex; padding: 2rem; font-size: 1.3rem;">
                                    <li class="fas fa-check-circle mr-2" />
                                    Account Stripe Connesso
                                </span>
                            </div>
                        </div>
                        <div class="form-group row">
                            <div class="col-12">
                                <!-- svelte-ignore missing-declaration -->
                                <span class="text-dark-75 font-size-lg">
                                    Accedi al portale Stripe <a
                                        class="font-weight-bolder"
                                        href={__bakney.STRIPE_CLIENT_PORTAL}>premendo qui</a
                                    >.
                                </span>
                            </div>
                        </div>

                        <div class="form-group row">
                            <div class="col-12">
                                <SmartMultiSelect
                                    customClasses={'min-w-100'}
                                    editable={false}
                                    active={false}
                                    minNumberOfSelectedItems={1}
                                    on:change={e => {
                                        $userData.sport_association.stripe_available_methods = [
                                            ...initialData?.map(item => {
                                                return item.value;
                                            }),
                                        ];
                                        updateStripeUserData();
                                    }}
                                    bind:value={initialData}
                                    props={{
                                        id: `stripe_available_methods`,
                                        name: `stripe_available_methods`,
                                        label: 'Accetta pagamenti con',
                                        placeholder: 'Seleziona quali modalità di pagamento vuoi offrire',
                                        required: true,
                                        clearable: false,
                                        searchable: true,
                                        showChevron: true,
                                        options: [
                                            {label: 'Carte', value: 'card'},
                                            {label: 'Addebito Sepa', value: 'sepa_debit'},
                                        ],
                                        value:
                                            $userData?.sport_association?.stripe_available_methods?.map(x => {
                                                if (x == 'card') {
                                                    return {label: 'Carte', value: 'card'};
                                                } else if (x == 'sepa_debit') {
                                                    return {label: 'Addebito Sepa', value: 'sepa_debit'};
                                                }
                                            }) || [],
                                    }} />
                            </div>
                        </div>
                    {/if}
                </div>
                <!--end::Body-->
            </div>
            <!--end::Form-->
        </div>
    </div>
{/if}
