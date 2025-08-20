<script>
    import {onMount} from 'svelte';
    import {sessionToken, subPage, userData} from 'store/stores.js';
    import {apiFetch} from 'utils/ApiMiddleware';
    import {Circle} from 'svelte-loading-spinners';
    import {CheckCircle, PlayCircle, XCircle} from 'phosphor-svelte';
    import {writable} from 'svelte/store';
    import {canPerformAction} from 'utils/Permissions';
    import {toast} from 'svelte-sonner';

    sessionToken.useLocalStorage();
    subPage.useLocalStorage();

    let validation;
    let form;
    let formData = {
        email_smtp_host: '',
        email_smtp_port: '587',
        email_smtp_user: '',
        email_smtp_password: '',
        email_sender_name: '',
        email_encryption: 'TLS',
    };
    let hashedData = '';

    let verified = null;
    let verifying = false;
    let edited;

    const handleForm = function (e) {
        form = KTUtil.getById('form_update');

        validation = FormValidation.formValidation(form, {
            fields: {
                email_smtp_host: {
                    validators: {
                        notEmpty: {
                            message: "L'host SMTP è obbligatorio",
                        },
                    },
                },
                email_smtp_port: {
                    validators: {
                        notEmpty: {
                            message: 'La porta SMTP è obbligatoria',
                        },
                    },
                },
                email_smtp_user: {
                    validators: {
                        notEmpty: {
                            message: "L'utenza SMTP è obbligatoria",
                        },
                    },
                },
                email_smtp_password: {
                    validators: {
                        notEmpty: {
                            message: 'La password SMTP è obbligatoria',
                        },
                    },
                },
                email_sender_name: {
                    validators: {
                        notEmpty: {
                            message: 'Il nome del mittente è obbligatorio',
                        },
                    },
                },
                email_encryption: {
                    validators: {
                        notEmpty: {
                            message: 'La cifratura email è obbligatoria',
                        },
                    },
                },
            },
            plugins: {
                trigger: new FormValidation.plugins.Trigger(),
                submitButton: new FormValidation.plugins.SubmitButton(),
                bootstrap: new FormValidation.plugins.Bootstrap(),
            },
        });
    };

    let update = function () {
        validation.validate().then(async function (status) {
            if (status == 'Valid') {
                KTApp.blockPage({
                    overlayColor: '#000000',
                    state: 'primary',
                    message: 'Salvataggio in corso...',
                });
                const url = __bakney.env.API.COMMUNICATIONS.SETTINGS.SMTP.UPDATE;
                const res = await apiFetch(url, {
                    method: 'PATCH',
                    body: JSON.stringify(formData),
                });

                // spinner stop
                KTApp.unblockPage();

                if (res.status == 200) {
                    toast.success('Informazioni Salvate con Successo.');
                    await fetchData();
                    edited = false;
                } else {
                    swal.fire({
                        text: 'Scusa, ho individuato degli errori, riprova.',
                        icon: 'error',
                        buttonsStyling: false,
                        confirmButtonText: 'Ok, capito!',
                        customClass: {
                            confirmButton: 'btn font-weight-bold btn-light-primary',
                        },
                    }).then(function () {
                        KTUtil.scrollTop();
                    });
                }
            } else {
                swal.fire({
                    text: 'Scusa, ho individuato degli errori, per favore riprova.',
                    icon: 'error',
                    buttonsStyling: false,
                    confirmButtonText: 'Ok, capito!',
                    customClass: {
                        confirmButton: 'btn font-weight-bold btn-light-primary',
                    },
                }).then(function () {
                    KTUtil.scrollTop();
                });
            }
        });
    };

    async function fetchData() {
        const res = await apiFetch(__bakney.env.API.COMMUNICATIONS.SETTINGS.SMTP.INFO);
        if (!res.error) {
            // replace all null values with empty string
            Object.keys(res.response).forEach(key => {
                if (res.response[key] == null) {
                    res.response[key] = '';
                }
            });
            formData = res.response;
            hashedData = hashData(formData);
        }
    }

    async function verifySMTP() {
        verifying = true;
        const res = await apiFetch(__bakney.env.API.COMMUNICATIONS.SETTINGS.SMTP.VERIFY);
        if (!res.error) {
            verified = res.response.verified;
            if (!verified) {
                toast.error('Configurazione SMTP non valida.');
            } else {
                toast.success(
                    "Configurazione Verificata con Successo. Controlla la posta elettronica per l'email di conferma"
                );
            }
        }
        verifying = false;
    }

    function hashData(data) {
        // data is an object, we order the keys and we stringify the object to get a unique hash
        return JSON.stringify(
            Object.keys(data)
                .sort()
                .reduce((result, key) => {
                    result[key] = data[key];
                    return result;
                }, {})
        );
    }

    onMount(async () => {
        await fetchData();
        jQuery(document).ready(function () {
            handleForm();
        });
    });
</script>

{#if $subPage == 'email'}
    <!--begin::Content-->
    <div class="flex-row-fluid">
        <!--begin::Card-->
        <div class="card card-custom card-stretch">
            <!--begin::Header-->
            <div class="card-header py-3 px-4 border-0">
                <div class="card-title align-items-start flex-column">
                    <h3 class="card-label font-weight-bolder text-dark font-size-h1">Email SMTP</h3>
                    <span class="text-muted font-weight-bold font-size-sm mt-1"
                        >Invia le email direttamente dalla tua email</span>
                </div>
                <div class="card-toolbar">
                    <button
                        type="button"
                        disabled={edited || !canPerformAction('association.communication.settings.update')}
                        class:btn-success={verified}
                        class:btn-light-warning={verified == null}
                        class:btn-danger={!verified && verified != null && !verifying}
                        class="btn btn-sm font-weight-bolder m-0 mr-4 d-flex align-items-center"
                        on:click={() => {
                            verifySMTP();
                        }}>
                        {#if verified && !verifying}
                            <CheckCircle size={20} color={'#fff'} weight="duotone" class="pr-2" />
                            Tutto OK
                        {:else if !verified && verified != null && !verifying}
                            <XCircle size={20} color={'#fff'} weight="duotone" class="pr-2" />
                            Errore di configurazione
                        {:else if verifying}
                            <Circle size="16" color="#FFFFFF" unit="px" duration="1s" />
                            <span class="pl-2 py-1">Verifica in corso...</span>
                        {:else if !verified}
                            <PlayCircle size={20} weight="duotone" class="pr-2 text-warning" />Verifica SMTP
                        {/if}</button>
                    <button
                        class="btn btn-primary font-weight-bolder m-0"
                        disabled={!canPerformAction('association.communication.settings.update')}
                        on:click={() => {
                            update();
                        }}>Salva</button>
                </div>
            </div>
            <!--end::Header-->
            <!--begin::Form-->
            <div
                id="form_update"
                on:change={() => {
                    edited = hashedData != hashData(formData);
                }}
                on:keypress={() => {
                    edited = hashedData != hashData(formData);
                }}>
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
                        <div class="alert-text font-weight-bold">
                            Configurando correttamente questa sezione, potrai inviare le email direttamente dalla tua
                            email. Potrai trovare le informazioni necessarie dalla tua casella di posta elettronica.
                        </div>
                        <div class="alert-close">
                            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">
                                    <i class="ki ki-close" />
                                </span>
                            </button>
                        </div>
                    </div>

                    <div class="form-group row mb-2 font-weight-bold ml-0">
                        Ecco dove trovare le informazioni necessarie per i principali provider di posta elettronica:
                    </div>
                    <div class="form-group row font-weight-boldest ml-0">
                        <ul class="list-inline">
                            <li class="list-inline-item">
                                <a
                                    href="https://support.google.com/mail/answer/7126229?hl=it"
                                    target="_blank"
                                    rel="noreferrer">Gmail</a>
                            </li>
                            <li class="list-inline-item">
                                <a
                                    href="https://support.microsoft.com/it-it/office/impostazioni-pop-imap-e-smtp-per-outlook-com-d088b986-291d-42b8-9564-9c414e2aa040"
                                    target="_blank"
                                    rel="noreferrer">Outlook</a>
                            </li>
                            <li class="list-inline-item">
                                <a
                                    href="https://aiuto.libero.it/articolo/mail/parametri-di-configurazione-per-il-client-di-posta/"
                                    target="_blank"
                                    rel="noreferrer">Libero</a>
                            </li>
                            <li class="list-inline-item">
                                <a
                                    href="https://aiuto.virgilio.it/articolo/mail/parametri-di-configurazione-per-il-client-di-posta/"
                                    target="_blank"
                                    rel="noreferrer">Virgilio</a>
                            </li>
                            <li class="list-inline-item">
                                <a
                                    href="https://assistenza.tiscali.it/servizi/guida/parametri-mail/"
                                    target="_blank"
                                    rel="noreferrer">Tiscali</a>
                            </li>
                        </ul>
                    </div>

                    <div class="form-group row">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label class="col-xl-3 col-lg-3 col-form-label text-left font-weight-bold">SMTP Host</label>
                        <div class="col-lg-9 col-xl-6">
                            <div class="input-group input-group-solid">
                                <input
                                    disabled={!canPerformAction('association.communication.settings.update')}
                                    name="email_smtp_host"
                                    placeholder="Inserisci l'host SMTP..."
                                    autocomplete="off"
                                    class="form-control form-control-lg form-control-solid"
                                    type="text"
                                    bind:value={formData.email_smtp_host} />
                            </div>
                        </div>
                    </div>

                    <!-- email_smtp_port -->
                    <div class="form-group row">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label class="col-xl-3 col-lg-3 col-form-label text-left text-sm font-weight-bold"
                            >SMTP Port</label>
                        <div class="col-lg-9 col-xl-6">
                            <div class="input-group input-group-solid">
                                <input
                                    disabled={!canPerformAction('association.communication.settings.update')}
                                    name="email_smtp_port"
                                    placeholder="Inserisci la porta SMTP..."
                                    autocomplete="off"
                                    class="form-control form-control-lg form-control-solid"
                                    type="text"
                                    bind:value={formData.email_smtp_port} />
                            </div>
                        </div>
                    </div>

                    <!-- email_smtp_user -->
                    <div class="form-group row">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label class="col-xl-3 col-lg-3 col-form-label text-left text-sm font-weight-bold"
                            >Email SMTP</label>
                        <div class="col-lg-9 col-xl-6">
                            <div class="input-group input-group-solid">
                                <input
                                    disabled={!canPerformAction('association.communication.settings.update')}
                                    name="email_smtp_user"
                                    placeholder="Inserisci l'utenza SMTP... (es. tennis.tav.asd@gmail.com)"
                                    autocomplete="off"
                                    class="form-control form-control-lg form-control-solid"
                                    type="text"
                                    bind:value={formData.email_smtp_user} />
                            </div>
                        </div>
                    </div>
                    <!-- email_smtp_password -->
                    <div class="form-group row">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label class="col-xl-3 col-lg-3 col-form-label text-left text-sm font-weight-bold"
                            >Password SMTP</label>
                        <div class="col-lg-9 col-xl-6">
                            <div class="input-group input-group-solid">
                                <input
                                    disabled={!canPerformAction('association.communication.settings.update')}
                                    name="email_smtp_password"
                                    placeholder="Inserisci la password SMTP..."
                                    autocomplete="off"
                                    class="form-control form-control-lg form-control-solid"
                                    type="password"
                                    bind:value={formData.email_smtp_password} />
                            </div>
                        </div>
                        <!-- add a caption -->
                        <div class="col-lg-9 col-xl-6 mt-2">
                            <span
                                class="form-text text-muted font-weight-bold {formData.email_smtp_host.includes('gmail')
                                    ? 'd-flex'
                                    : 'd-none'}"
                                style="font-size: 1rem;"
                                >Con <b class="font-weight-boldest mx-1">gmail</b> devi creare una nuova password da
                                <a
                                    class="ml-1"
                                    href="https://myaccount.google.com/apppasswords"
                                    target="_blank"
                                    rel="noreferrer">qui</a
                                >.</span>
                        </div>
                    </div>
                    <!-- email_sender_name -->
                    <div class="form-group row">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label class="col-xl-3 col-lg-3 col-form-label text-left text-sm font-weight-bold"
                            >Nome Mittente</label>
                        <div class="col-lg-9 col-xl-6">
                            <div class="input-group input-group-solid">
                                <input
                                    disabled={!canPerformAction('association.communication.settings.update')}
                                    name="email_sender_name"
                                    placeholder="Inserisci il nome del mittente... (es. Tennis Tavolo ASD)"
                                    autocomplete="off"
                                    class="form-control form-control-lg form-control-solid"
                                    type="text"
                                    bind:value={formData.email_sender_name} />
                            </div>
                        </div>
                    </div>
                    <!-- email_encryption, select options are SSL, TLS, NONE -->
                    <div class="form-group row">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label class="col-xl-3 col-lg-3 col-form-label text-left text-sm font-weight-bold"
                            >Cifratura Email</label>
                        <div class="col-lg-9 col-xl-6">
                            <div class="input-group input-group-solid">
                                <select
                                    disabled={!canPerformAction('association.communication.settings.update')}
                                    name="email_encryption"
                                    class="form-control form-control-lg form-control-solid mr-4"
                                    bind:value={formData.email_encryption}>
                                    <option value="SSL">SSL</option>
                                    <option value="TLS">TLS</option>
                                    <option value="NONE">NONE</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <!--end::Body-->
            </div>
            <!--end::Form-->
        </div>
    </div>
{/if}
