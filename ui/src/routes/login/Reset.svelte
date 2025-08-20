<script>
    import {onMount} from 'svelte';
    import {replace, querystring} from 'svelte-spa-router';

    let token = $querystring.split('=')[1];
    let password = '';
    let passwordVisible = false;
    let confirmPassword = '';
    let confirmPasswordVisible = false;
    let validation;

    async function reset() {
        validation?.destroy();

        validation = FormValidation.formValidation(KTUtil.getById('bkn_reset_password_form'), {
            fields: {
                password: {
                    validators: {
                        notEmpty: {
                            message: 'Password obbligatoria',
                        },
                        regexp: {
                            regexp: /^(?=.*[A-Z])(?=.*[!@#$&\.\-\_*])(?=.*[0-9]).{10,}$/m,
                            message:
                                'La password deve contenere almeno:<br>- 1 lettera maiuscola<br>- 1 carattere speciale !@#$&-_*.<br>- 1 numero<br>- avere più di 10 caratteri',
                        },
                    },
                },
                cpassword: {
                    validators: {
                        notEmpty: {
                            message: 'Password di conferma obbligatoria',
                        },
                        identical: {
                            compare: function () {
                                return password;
                            },
                            message: 'Le password non corrispondono',
                        },
                    },
                },
            },
            plugins: {
                trigger: new FormValidation.plugins.Trigger(),
                bootstrap: new FormValidation.plugins.Bootstrap(),
            },
        });

        validation.validate().then(async function (status) {
            if (status == 'Valid') {
                const url = __bakney.env.HOST + '/oauth2/reset';

                const res = await window.fetch(url, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        token: token,
                        password: password,
                    }),
                });

                await res.json();

                if (res.status == 200) {
                    swal.fire({
                        text: 'Password cambiata con successo! Accedi subito con le nuove credenziali.',
                        icon: 'success',
                        buttonsStyling: false,
                        confirmButtonText: 'Ok, capito!',
                        customClass: {
                            confirmButton: 'btn font-weight-bold btn-light-primary',
                        },
                    }).then(function () {
                        replace('/login');
                    });
                } else {
                    swal.fire({
                        text: 'Scusa, ho individuato degli errori, non è possibile resettare la password, riesegui la procedura.',
                        icon: 'error',
                        buttonsStyling: false,
                        confirmButtonText: 'Ok, capito!',
                        customClass: {
                            confirmButton: 'btn font-weight-bold btn-light-primary',
                        },
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
                });
            }
        });
    }

    onMount(() => {
        localStorage.clear();
    });
</script>

<div class="d-flex flex-column flex-root">
    <!--begin::Login-->
    <div class="login login-1 login-signin-on d-flex flex-column flex-lg-row flex-column-fluid bg-white" id="kt_login">
        <!--begin::Content-->
        <div
            class="login-content flex-row-fluid d-flex flex-column justify-content-center position-relative overflow-hidden p-7 mx-auto"
            style="width: 100%;max-width: 100%; ">
            <!--begin::Content body-->
            <div class="row">
                <div class="col-12">
                    <div class="d-flex flex-column-fluid flex-center h-100">
                        <!--begin::Forgot-->
                        <div class="login-form login-forgot form-40">
                            <!--begin::Form-->
                            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                            <form
                                class="form"
                                novalidate="novalidate"
                                id="bkn_reset_password_form"
                                on:keyup={e => e.key === 'Enter' && reset()}>
                                <div class="pb-13 pt-lg-0 pt-1">
                                    <img id="logo" class="h-40px" src="{__bakney.OEM_CONFIG?.logo}" alt="logo" />
                                </div>

                                <!--begin::Title-->
                                <div class="pb-13 pt-lg-0 pt-5">
                                    <h3 class="font-weight-bolder text-dark font-size-h4 font-size-h1-lg">
                                        Reset della Password
                                    </h3>
                                    <p class="text-muted font-weight-bold font-size-h4">
                                        Inserisci la nuova password...
                                    </p>
                                </div>
                                <!--end::Title-->
                                <!--begin::Form group-->
                                <div class="form-group">
                                    <div class="d-flex justify-content-between mt-n5">
                                        <!-- svelte-ignore a11y-label-has-associated-control -->
                                        <label class="font-size-h6 font-weight-bolder text-dark pt-5"
                                            >Nuova Password</label>
                                    </div>
                                    <div class="input-group input-group-solid">
                                        <input
                                            name="password"
                                            tabindex="0"
                                            id="reset-password"
                                            placeholder="Inserisci password..."
                                            autocomplete="off"
                                            class="form-control form-control-solid h-auto p-6 rounded-lg"
                                            type="password"
                                            bind:value={password} />
                                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                                        <div
                                            class="input-group-append"
                                            style="cursor:pointer"
                                            on:click={() => {
                                                passwordVisible = !passwordVisible;
                                                document.getElementById('reset-password').type = passwordVisible
                                                    ? 'text'
                                                    : 'password';
                                            }}>
                                            <span class="input-group-text">
                                                <i class={!passwordVisible ? 'far fa-eye' : 'far fa-eye-slash'} />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <!--end::Form group-->
                                <!--begin::Form group-->
                                <div class="form-group">
                                    <div class="d-flex justify-content-between mt-n5">
                                        <!-- svelte-ignore a11y-label-has-associated-control -->
                                        <label class="font-size-h6 font-weight-bolder text-dark pt-5"
                                            >Conferma Password</label>
                                    </div>
                                    <div class="input-group input-group-solid">
                                        <input
                                            name="cpassword"
                                            tabindex="0"
                                            id="confirm-reset-password"
                                            placeholder="Conferma password..."
                                            autocomplete="off"
                                            class="form-control form-control-solid h-auto p-6 rounded-lg"
                                            type="password"
                                            bind:value={confirmPassword} />
                                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                                        <div
                                            class="input-group-append"
                                            style="cursor:pointer"
                                            on:click={() => {
                                                confirmPasswordVisible = !confirmPasswordVisible;
                                                document.getElementById('confirm-reset-password').type =
                                                    confirmPasswordVisible ? 'text' : 'password';
                                            }}>
                                            <span class="input-group-text">
                                                <i
                                                    class={!confirmPasswordVisible
                                                        ? 'far fa-eye'
                                                        : 'far fa-eye-slash'} />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <!--end::Form group-->
                                <!--begin::Form group-->
                                <div class="form-group d-flex flex-wrap pb-lg-0">
                                    <button
                                        type="button"
                                        class="btn btn-primary font-weight-bolder font-size-h6 px-8 py-4 my-3 mr-4"
                                        on:click|preventDefault={() => reset()}>
                                        Cambia Password
                                    </button>
                                </div>
                                <!--end::Form group-->
                            </form>
                            <!--end::Form-->
                        </div>
                        <!--end::Forgot-->
                    </div>
                </div>
            </div>
            <!--end::Content body-->
        </div>
        <!--end::Content-->
    </div>
    <!--end::Login-->
</div>

<style>
    .form-40 {
        max-width: 40rem;
        width: 100%;
    }
</style>
