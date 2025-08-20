<script>
    import {onMount, afterUpdate} from 'svelte';
    import {writable} from 'svelte/store';
    import {fade} from 'svelte/transition';

    import {apiFetch} from 'utils/ApiMiddleware.js';
    import {sessionToken, subPage} from 'store/stores.js';
    import {toast} from 'svelte-sonner';
    import BottomBarFixedSave from 'components/inputs/BottomBarFixedSave.svelte';
    import {Warning} from 'phosphor-svelte';

    sessionToken.useLocalStorage();
    subPage.useLocalStorage();

    export let changes = false;

    export let validButton = false;
    let twoFaData = {
        enable: false,
        otp: null,
    };
    let fetchedData = {};
    let setupData = writable({
        qrcode_uri: null,
        otp_secret: null,
    });

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

    afterUpdate(() => {
        if (JSON.stringify(twoFaData) != fetchedData) {
            changes = true;
        } else {
            changes = false;
        }
    });

    function fetchInfo() {
        apiFetch(__bakney.env.API.TWO_FACTORS.INFO).then(res => {
            if (!res.error) {
                twoFaData.enable = res.response.data.enabled;
                twoFaData.otp = null;
                fetchedData = JSON.stringify(twoFaData);
            } else {
                let modalText = '';
                // only 429 is returned manually aside from 200
                switch (res.status) {
                    case 429:
                        modalText = 'Troppe richieste, riprova più tardi.';
                        break;
                    default:
                        modalText = 'Scusa, ho individuato degli errori, riprova.';
                        break;
                }
                toast.error(modalText, 'Si sono verificati degli errori:');
            }
        });
    }

    async function updateTwoFactors() {
        let res = await apiFetch(__bakney.env.API.TWO_FACTORS.UPDATE, {
            method: 'POST',
            body: JSON.stringify({
                enable: twoFaData.enable,
                otp: twoFaData.otp,
                secret: $setupData.otp_secret,
            }),
        });

        if (!res.error) {
            toast.success('Autenticazione a due fattori aggiornata.');
            $setupData.qrcode_uri = null;
            $setupData.otp_secret = null;
            fetchInfo();
        } else {
            let modalText = '';
            switch (res.status) {
                case 400:
                    modalText = 'Codice OTP errato, riprova.';
                    break;
                case 403:
                    modalText = 'Operazione non permessa.';
                    break;
                default:
                    modalText = 'Scusa, ho individuato degli errori, riprova.';
                    break;
            }
            toast.error(modalText, 'Si sono verificati degli errori:');
        }
    }

    async function generateQrCode() {
        if (twoFaData.enable) {
            let res = await apiFetch(__bakney.env.API.TWO_FACTORS.SETUP);

            if (!res.error) {
                $setupData.qrcode_uri = res.response.data.qrcode_uri;
                $setupData.otp_secret = res.response.data.otp_secret;
            } else {
                let modalText = '';
                // only 429 is returned manually aside from 200
                switch (res.status) {
                    case 429:
                        modalText = 'Troppe richieste, riprova più tardi.';
                        break;
                    default:
                        modalText = 'Scusa, ho individuato degli errori, riprova.';
                        break;
                }
                toast.error(modalText, 'Si sono verificati degli errori:');
            }
        } else {
            $setupData.qrcode_uri = null;
            $setupData.otp_secret = null;
        }
    }
</script>

{#if $subPage == 'twofa'}
    <!-- $subPage == 'password' -->
    <!--begin::Content-->
    <div class="flex-row-fluid">
        <!--begin::Card-->
        <div class="card card-custom card-stretch">
            <!--begin::Header-->
            <div class="card-header py-3">
                <div class="card-title align-items-start flex-column">
                    <h3 class="card-label font-weight-bolder text-dark font-size-h1">Autenticazione a due fattori</h3>
                    <span class="text-muted font-weight-bold font-size-sm mt-1"
                        >Aggiorna e/o attiva l'autenticazione a due fattori</span>
                </div>
                <div class="card-toolbar">
                    <button
                        disabled={!validButton}
                        id="kt_form_password_update_submit"
                        class="btn btn-primary font-weight-bolder"
                        on:click={updateTwoFactors}>Salva</button>
                </div>
            </div>
            <!--end::Header-->
            <!--begin::Form-->
            <div id="kt_form_password_update">
                <!--begin::Body-->
                <div class="card-body">
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
                            In questa sezione puoi attivare l'autenticazione a due fattori per proteggere meglio il tuo
                            account. Scannerizza il codice QR con un'applicazione come <b>Miscrosoft Authenticator</b> o
                            <b>Google Authenticator</b> e inserisci il codice OTP per confermare.
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
                        <label class="col-xl-5 col-lg-5 col-form-label text-left">Abilita Doppio Fattore</label>
                        <div class="col-lg-3 col-xl-3" style="display: flex; align-items: center;">
                            <!-- <label class="col-3 col-form-label">With Icon</label> -->
                            <div class="col-3">
                                <span class="switch switch-icon">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name=""
                                            bind:checked={twoFaData.enable}
                                            on:change={generateQrCode} />
                                        <span />
                                    </label>
                                </span>
                            </div>
                        </div>
                    </div>

                    {#if $setupData.qrcode_uri != null && $setupData.otp_secret != null}
                        <div class="form-group row" in:fade={{duration: 150}}>
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="col-xl-5 col-lg-5 col-form-label text-left">Codice OTP</label>
                            <div class="col-lg-5 col-xl-5" style="display: flex; align-items: center;">
                                <!-- <label class="col-3 col-form-label">With Icon</label> -->
                                <div class="col-12">
                                    <input
                                        name="otp-code"
                                        class="form-control form-control-lg form-control-solid"
                                        type="text"
                                        bind:value={twoFaData.otp} />
                                </div>
                            </div>
                        </div>

                        <div class="form-group row" in:fade={{delay: 250, duration: 150}}>
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="col-12 col-form-label text-left">Istruzioni di Configurazione</label>
                            <p class="col-12 col-form-label text-left">
                                Scannerizza con un'app come <b>Microsoft Authenticator</b> o <b>Google Authenticator</b>
                                il codice QR sottostante o inserisci la Chiave Segreta manualmente. Infine, compila il campo
                                <b>Codice OTP</b>
                                qui sopra con il valore generato dall'applicazione e premi <b>Salva</b>.
                            </p>
                            <div
                                class="col-12"
                                style="display: flex;justify-content:center; align-items: center; flex-direction:column">
                                <img
                                    src={$setupData.qrcode_uri}
                                    alt={$setupData.qrcode_uri}
                                    style="width: 100%;max-width: 15rem;" />
                            </div>
                            <div
                                class="col-12"
                                style="display: flex;justify-content:center; align-items: center; flex-direction:column">
                                <h5>Chiave Segreta:</h5>
                                <br />
                                <div style="padding: 0.5rem;border-radius: 0.35rem;background: #e1f0ff;">
                                    <b>{$setupData.otp_secret}</b>
                                </div>
                            </div>
                        </div>
                    {/if}
                </div>
                <!--end::Body-->
            </div>
            <!--end::Form-->
        </div>
    </div>

    <BottomBarFixedSave on:save={updateTwoFactors} autoShow={true}>
        <div slot="left" class="d-flex align-items-center">
            <Warning weight={'duotone'} size={18} class="mr-2 text-warning" />
            <p class="font-weight-boldest mb-0 text-warning text-xs">
                Ricordati di salvare per applicare le modifiche.
            </p>
        </div>
    </BottomBarFixedSave>
{/if}
