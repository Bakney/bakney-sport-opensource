<script>
    import {onMount} from 'svelte';
    import {sessionToken, subPage, userData} from 'store/stores.js';
    import {toast} from 'svelte-sonner';
    import {Warning} from 'phosphor-svelte';
    import BottomBarFixedSave from 'components/inputs/BottomBarFixedSave.svelte';

    sessionToken.useLocalStorage();
    subPage.useLocalStorage();

    export let changes = false;
    let validationPassword;
    let formPassword;

    let passwordData = {
        currentPassword: {
            value: null,
            visibility: false,
        },
        newPassword: {
            value: null,
            visibility: false,
        },
        confirmPassword: {
            value: null,
            visibility: false,
        },
    };

    $: passwordData,
        (changes =
            passwordData.newPassword.value != null ||
            passwordData.confirmPassword.value != null ||
            passwordData.currentPassword.value != null);

    const togglePasswordInput = (id, type) => {
        passwordData[type].visibility = !passwordData[type].visibility;
        document.getElementById(id).type = passwordData[type].visibility ? 'text' : 'password';
    };

    const _handleUpdateAccountPassword = function (e) {
        formPassword = KTUtil.getById('kt_form_password_update');

        validationPassword = FormValidation.formValidation(formPassword, {
            fields: {
                currentPassword: {
                    validators: {
                        notEmpty: {
                            message: 'Inserisci la password corrente',
                        },
                    },
                },
                newPassword: {
                    validators: {
                        regexp: {
                            regexp: /^(?=.*[A-Z])(?=.*[!@#$&\.\-\_*])(?=.*[0-9]).{10,}$/m,
                            message:
                                'La password deve contenere almeno:<br>- 1 lettera maiuscola<br>- 1 carattere speciale !@#$&-_*.<br>- 1 numero<br>- avere più di 10 caratteri',
                        },
                        notEmpty: {
                            message: 'Inserisci la nuova password',
                        },
                    },
                },
                confirmPassword: {
                    validators: {
                        notEmpty: {
                            message: 'Conferma la nuova password',
                        },
                        identical: {
                            compare: function () {
                                return formPassword.querySelector('[name="newPassword"]').value;
                            },
                            message: 'Le password non corrispondono',
                        },
                    },
                },
            },
            plugins: {
                trigger: new FormValidation.plugins.Trigger(),
                submitButton: new FormValidation.plugins.SubmitButton(),
                bootstrap: new FormValidation.plugins.Bootstrap(),
                // passwordStrength: new FormValidation.plugins.PasswordStrength({
                //     field: 'newPassword',
                //     message: 'The password is weak',
                //     minimalScore: 3
                // }),
            },
        });
    };

    let updateAccountPassword = function () {
        validationPassword.validate().then(async function (status) {
            if (status == 'Valid') {
                KTApp.blockPage({
                    overlayColor: '#000000',
                    state: 'primary',
                    message: 'Salvataggio in corso...',
                });
                const url = __bakney.env.HOST + '/profile/update/password';
                const res = await window.fetch(url, {
                    method: 'PATCH',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + $sessionToken,
                    },
                    body: JSON.stringify({
                        password_data: {
                            current_password: passwordData.currentPassword.value,
                            new_password: passwordData.newPassword.value,
                        },
                    }),
                });

                const response = await res.json();

                // spinner stop
                KTApp.unblockPage();

                if (res.status == 200) {
                    if (response.code && response.code == 'EC000') {
                        swal.fire({
                            text: 'La password corrente inserita non è corretta, riprova.',
                            icon: 'error',
                            buttonsStyling: false,
                            confirmButtonText: 'Ok, capito!',
                            customClass: {
                                confirmButton: 'btn font-weight-bold btn-light-primary',
                            },
                        }).then(function () {
                            KTUtil.scrollTop();
                        });
                    } else {
                        userData.set(response.user_data);
                        toast.success('Informazioni Salvate con Successo.');

                        passwordData = {
                            currentPassword: {
                                value: null,
                                visibility: false,
                            },
                            newPassword: {
                                value: null,
                                visibility: false,
                            },
                            confirmPassword: {
                                value: null,
                                visibility: false,
                            },
                        };
                    }
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

    $: if ($subPage == 'password') {
        jQuery(document).ready(function () {
            _handleUpdateAccountPassword();
        });
    }

    onMount(() => {
        jQuery(document).ready(function () {
            _handleUpdateAccountPassword();
        });
    });
</script>

{#if $subPage == 'password'}
    <!-- $subPage == 'password' -->
    <!--begin::Content-->
    <div class="flex-row-fluid">
        <!--begin::Card-->
        <div class="card card-custom card-stretch">
            <!--begin::Header-->
            <div class="card-header py-3">
                <div class="card-title align-items-start flex-column">
                    <h3 class="card-label font-weight-bolder text-dark font-size-h1">Cambio Password</h3>
                    <span class="text-muted font-weight-bold font-size-sm mt-1"
                        >Aggiorna la password relativa al tuo account</span>
                </div>
                <div class="card-toolbar">
                    <button
                        id="kt_form_password_update_submit"
                        class="btn btn-primary font-weight-bolder"
                        disabled={!changes}
                        on:click={() => {
                            updateAccountPassword();
                        }}>Salva</button>
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
                            In questa sezione puoi cambiare la tua password. Inserisci la tua password attuale e poi
                            quella nuova, cliccando su "Salva" per aggiornarla.
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
                        <label class="col-xl-3 col-lg-3 col-form-label text-left">Password Corrente</label>
                        <div class="col-lg-9 col-xl-6">
                            <div class="input-group input-group-solid">
                                <input
                                    name="currentPassword"
                                    id="current-password"
                                    placeholder="Inserisci la password corrente..."
                                    class="form-control form-control-lg form-control-solid"
                                    type="password"
                                    bind:value={passwordData.currentPassword.value} />
                                <div
                                    class="input-group-append"
                                    style="cursor:pointer"
                                    on:click={() => togglePasswordInput('current-password', 'currentPassword')}>
                                    <span class="input-group-text">
                                        <i
                                            class={!passwordData.currentPassword.visibility
                                                ? 'far fa-eye'
                                                : 'far fa-eye-slash'} /></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="form-group row">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label class="col-xl-3 col-lg-3 col-form-label text-left">Nuova Password</label>
                        <div class="col-lg-9 col-xl-6">
                            <div class="input-group input-group-solid">
                                <input
                                    name="newPassword"
                                    id="new-password"
                                    placeholder="Inserisci una nuova password..."
                                    autocomplete="off"
                                    class="form-control form-control-lg form-control-solid"
                                    type="password"
                                    bind:value={passwordData.newPassword.value} />
                                <div
                                    class="input-group-append"
                                    style="cursor:pointer"
                                    on:click={() => togglePasswordInput('new-password', 'newPassword')}>
                                    <span class="input-group-text">
                                        <i
                                            class={!passwordData.newPassword.visibility
                                                ? 'far fa-eye'
                                                : 'far fa-eye-slash'} /></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form-group row">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label class="col-xl-3 col-lg-3 col-form-label text-left">Conferma Password</label>
                        <div class="col-lg-9 col-xl-6">
                            <div class="input-group input-group-solid">
                                <input
                                    name="confirmPassword"
                                    id="confirm-password"
                                    placeholder="Conferma la nuova password..."
                                    autocomplete="off"
                                    class="form-control form-control-lg form-control-solid"
                                    type="password"
                                    bind:value={passwordData.confirmPassword.value} />
                                <div
                                    class="input-group-append"
                                    style="cursor:pointer"
                                    on:click={() => togglePasswordInput('confirm-password', 'confirmPassword')}>
                                    <span class="input-group-text">
                                        <i
                                            class={!passwordData.confirmPassword.visibility
                                                ? 'far fa-eye'
                                                : 'far fa-eye-slash'} /></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!--end::Body-->
            </div>
            <!--end::Form-->
        </div>
    </div>
    <BottomBarFixedSave on:save={updateAccountPassword} autoShow={true}>
        <div slot="left" class="d-flex align-items-center">
            <Warning weight={'duotone'} size={18} class="mr-2 text-warning" />
            <p class="font-weight-boldest mb-0 text-warning text-xs">
                Ricordati di salvare per applicare le modifiche.
            </p>
        </div>
    </BottomBarFixedSave>
{/if}
