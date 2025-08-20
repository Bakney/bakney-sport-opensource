<script>
    import {onMount} from 'svelte';
    import {sessionToken, subPage, userData} from 'store/stores.js';
    import {apiFetch} from 'utils/ApiMiddleware';
    import {Circle} from 'svelte-loading-spinners';
    import {Check, CheckCircle, LockSimple, PlayCircle, XCircle} from 'phosphor-svelte';
    import {canPerformAction} from 'utils/Permissions';

    sessionToken.useLocalStorage();
    subPage.useLocalStorage();

    let formData = {
        email_smtp_host: '',
        email_smtp_port: '587',
        email_smtp_user: '',
        email_smtp_password: '',
        email_sender_name: '',
        email_encryption: 'TLS',
    };
    let payment_history = [];

    async function fetchData() {
        const res = await apiFetch(__bakney.env.API.COMMUNICATIONS.SETTINGS.SMTP.INFO);
        if (!res.error) {
            formData = res.response;
        }
        const res2 = await apiFetch(__bakney.env.API.COMMUNICATIONS.HISTORY.SMS);
        if (!res2.error) {
            payment_history = res2.response;
        }
    }

    async function buySMSCredit(amount) {
        apiFetch(__bakney.env.API.COMMUNICATIONS.BUY.SMS, {
            method: 'POST',
            body: JSON.stringify({
                amount: amount,
            }),
        }).then(res => {
            if (!res.error) {
                window.open(res.response.url, '_blank');
            }
        });
    }

    onMount(async () => {
        await fetchData();
        jQuery(document).ready(function () {
            handleForm();
        });
    });
</script>

{#if $subPage == 'sms'}
    <!--begin::Content-->
    <div class="flex-row-fluid">
        <!--begin::Card-->
        <div class="card card-custom card-stretch">
            <!--begin::Header-->
            <div class="card-header py-3 px-4 border-0">
                <div class="card-title align-items-start flex-column">
                    <h3 class="card-label font-weight-bolder text-dark font-size-h1">SMS e utilizzo</h3>
                    <span class="text-muted font-weight-bold font-size-sm mt-1"
                        >Acquista crediti SMS e comunica in modo efficace con i tuoi atleti</span>
                </div>
                <div class="card-toolbar" />
            </div>
            <!--end::Header-->
            <!--begin::Form-->

            <!--begin::Body-->
            <div class="card-body p-4">
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
                    <div class="alert-text font-weight-bolder">
                        Per poter inviare SMS è necessario acquistare dei crediti. Puoi farlo direttamente da qui.
                    </div>
                    <div class="alert-close">
                        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">
                                <i class="ki ki-close" />
                            </span>
                        </button>
                    </div>
                </div>

                <div class="form-group row px-2 mb-12">
                    <div class="col-6 col-md-6 p-2 pr-md-4" style="">
                        <div class="card-widget card p-0 m-0">
                            <div class="card-body p-4">
                                <div class="mb-0">
                                    <h6 class="font-weight-boldest text-center mb-0" style="font-size: 1rem;">
                                        CREDITI SMS
                                    </h6>
                                </div>
                                <div
                                    class:text-success={formData.sms_balance > 0}
                                    class:text-danger={formData.sms_balance <= 0}
                                    class="text-center font-weight-bolder"
                                    style="font-size: 1.75rem;">
                                    <span>{formData.sms_balance} sms</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-6 col-md-6 p-2 pr-md-4" style="">
                        <div class="card-widget card p-0 m-0">
                            <div class="card-body p-4">
                                <div class="mb-0">
                                    <h6 class="font-weight-boldest text-center mb-0" style="font-size: 1rem;">
                                        EMAIL GIORNALIERE RIMANENTI
                                    </h6>
                                </div>
                                <div
                                    class:text-success={formData.daily_email_limit - formData.daily_email_balance > 0}
                                    class:text-danger={formData.daily_email_limit - formData.daily_email_balance <= 0}
                                    class="text-center font-weight-bolder"
                                    style="font-size: 1.75rem;">
                                    <span>{formData.daily_email_limit - formData.daily_email_balance} email</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- a grid of predefined packages 50, 100, 200 500 SMS, 0,1€ each -->
                <div class="form-group row px-2 mb-12">
                    <div class="col-12 col-md-12 p-2 pr-md-4 text-center mb-6">
                        <h3 class="font-weight-bolder text-dark font-size-h1">Acquista crediti SMS</h3>
                    </div>
                    <div class="col-12 col-md-4 p-2 pr-md-4" style="">
                        <div class="card-widget card p-0 m-0">
                            <div class="card-body p-8" style="padding-bottom: 1rem !important;">
                                <div class="d-flex align-items-center justify-content-between">
                                    <div class="mb-0">
                                        <h2 class="font-weight-boldest text-center mb-0">100 SMS</h2>
                                    </div>
                                    <div class="mb-0">
                                        <h2 class="font-weight-boldest text-center mb-0 text-primary">12,99€</h2>
                                    </div>
                                </div>

                                <span class="text-center font-weight-bolder text-dark ml-2" style="font-size: 1rem;">
                                    (~0,13€/sms)
                                </span>
                                <div class="text-center font-weight-bolder mt-8 mb-2" style="font-size: 1.75rem;">
                                    <button
                                        on:click={() => {
                                            buySMSCredit(100);
                                        }}
                                        disabled={!canPerformAction('association.communication.settings.update')}
                                        type="button"
                                        class="btn btn-primary font-weight-bold mb-0"
                                        style="font-size: 1.2rem;">
                                        <LockSimple size={20} color="#fff" weight="duotone" class="mr-1" />
                                        Acquista ora
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-4 p-2 pr-md-4" style="">
                        <div class="card-widget card p-0 m-0">
                            <div class="card-body p-8" style="padding-bottom: 1rem !important;">
                                <div class="d-flex align-items-center justify-content-between">
                                    <div class="mb-0">
                                        <h2 class="font-weight-boldest text-center mb-0">200 SMS</h2>
                                        <span
                                            class="text-center font-weight-bolder text-dark ml-2"
                                            style="font-size: 1rem;">
                                            (~0,12€/sms)
                                        </span>
                                    </div>
                                    <div
                                        class="mb-0 text-right d-flex"
                                        style="flex-direction: column;align-items: flex-end;">
                                        <h2 class="font-weight-boldest text-center mb-0 text-primary">23,99€</h2>
                                        <h6
                                            class="font-weight-bold text-danger text-center mb-0"
                                            style="font-size: .9rem">
                                            <LockSimple size={20} color="#fff" weight="duotone" class="mr-1" />
                                            Risparmi 1,98€
                                        </h6>
                                    </div>
                                </div>

                                <div class="text-center font-weight-bolder mt-8 mb-2" style="font-size: 1.75rem;">
                                    <button
                                        on:click={() => {
                                            buySMSCredit(200);
                                        }}
                                        disabled={!canPerformAction('association.communication.settings.update')}
                                        type="button"
                                        class="btn btn-primary font-weight-bold mb-0"
                                        style="font-size: 1.2rem;">
                                        <LockSimple size={20} color="#fff" weight="duotone" class="mr-1" />
                                        Acquista ora
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-4 p-2 pr-md-4" style="">
                        <div class="card-widget card p-0 m-0">
                            <div class="card-body p-8" style="padding-bottom: 1rem !important;">
                                <div class="d-flex align-items-start justify-content-between">
                                    <div class="mb-0">
                                        <h2 class="font-weight-boldest text-center mb-0">300 SMS</h2>
                                        <span
                                            class="text-center font-weight-bolder text-dark ml-2"
                                            style="font-size: 1rem;">
                                            (~0,10€/sms)
                                        </span>
                                    </div>
                                    <div
                                        class="mb-0 text-right d-flex"
                                        style="flex-direction: column;align-items: flex-end;">
                                        <h2 class="font-weight-boldest text-center mb-0 text-primary">29,99€</h2>
                                        <h6
                                            class="font-weight-bold text-danger text-center mb-0"
                                            style="font-size: .9rem">
                                            Risparmi 9,98€
                                        </h6>
                                    </div>
                                </div>

                                <div class="text-center font-weight-bolder mt-8 mb-2" style="font-size: 1.75rem;">
                                    <button
                                        on:click={() => {
                                            buySMSCredit(300);
                                        }}
                                        disabled={!canPerformAction('association.communication.settings.update')}
                                        type="button"
                                        class="btn btn-primary font-weight-bold mb-0"
                                        style="font-size: 1.2rem;">
                                        <LockSimple size={20} color="#fff" weight="duotone" class="mr-1" />
                                        Acquista ora
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="form-group row px-2 mb-12">
                    <div class="col-12 col-md-12 p-2 pr-md-4 text-center mb-6">
                        <h3 class="font-weight-bolder text-dark font-size-h1">Storico Acquisti</h3>
                    </div>
                    <div class="d-flex" style="flex-direction: column;width:100%;">
                        {#each payment_history as payment}
                            <div
                                class="my-2 py-3 px-8 d-flex text-center align-items-center justify-content-between mx-auto"
                                style="background: #ebedf380;border-radius:.35rem;max-width:45rem !important;">
                                <!--   -->
                                <!-- {JSON.stringify(payment)} -->
                                <div class="d-flex align-items-center">
                                    <CheckCircle size={34} color="#1BC5BD" weight="duotone" />
                                    <span class="font-weight-boldest ml-2 mb-0"
                                        ><h6 class="mb-0">
                                            crediti acquistati il {new Date(payment.payment_date).toLocaleDateString()}
                                        </h6></span>
                                </div>
                                <h2 class="font-weight-boldest ml-0 ml-md-12">
                                    {payment.amount} SMS
                                </h2>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
            <!--end::Body-->
            <!--end::Form-->
        </div>
    </div>
{/if}
