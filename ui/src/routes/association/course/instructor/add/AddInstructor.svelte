<script>
    import {push} from 'svelte-spa-router';
    import {sessionToken} from 'store/stores.js';
    import Section1 from './sections/Section1.svelte';
    import {scale} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import {onMount} from 'svelte';
    import {getDataFromForm} from 'utils/Functions';
    import {apiFetch} from 'utils/ApiMiddleware';
    import {toast} from 'svelte-sonner';
    import BackButton from 'components/buttons/BackButton.svelte';

    sessionToken.useLocalStorage();

    let instructorForm;

    async function createInstructor(data) {
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Creazione istruttore...',
        });

        const url = __bakney.env.API.INSTRUCTOR.ADD;
        if (data.born_date) data.born_date = moment(data.born_date).format('DD/MM/YYYY');
        else data.born_date = null;
        data.stipulated_contract_in = moment(data.stipulated_contract_in).format('DD/MM/YYYY');

        const res = await apiFetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        // spinner stop
        KTApp.unblockPage();

        if (res.status == 200) {
            push('/course/instructor/list');

            toast.success('Istruttore creato con successo.');
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
    }

    onMount(() => {
        initForm();
    });

    function initForm() {
        instructorForm?.destroy();
        instructorForm = FormValidation.formValidation(document.getElementById('instructor_form'), {
            fields: {
                first_name: {
                    validators: {
                        notEmpty: {
                            message: 'Il nome è obbligatorio.',
                        },
                    },
                },
                last_name: {
                    validators: {
                        notEmpty: {
                            message: 'Il cognome è obbligatorio.',
                        },
                    },
                },
                email: {
                    validators: {
                        notEmpty: {
                            message: "L'email è obbligatoria.",
                        },
                        emailAddress: {
                            message: "L'email non è in formato valido.",
                        },
                    },
                },
                phone: {
                    validators: {
                        regexp: {
                            regexp: /^\+?\d{7,15}$/,
                            message: 'Il numero di telefono non è valido.',
                        },
                    },
                },
                phone_2: {
                    validators: {
                        regexp: {
                            regexp: /^\+?\d{7,15}$/,
                            message: 'Il numero di telefono non è valido.',
                        },
                    },
                },
            },
            plugins: {
                trigger: new FormValidation.plugins.Trigger(),
                bootstrap: new FormValidation.plugins.Bootstrap(),
                // submitButton: new FormValidation.plugins.SubmitButton(),
            },
        });
    }

    // define the form submission function
    function handleValidation(e) {
        if (!instructorForm) initForm();
        instructorForm?.validate().then(function (status) {
            if (status === 'Valid') {
                createInstructor(getDataFromForm(e));
            } else {
                swal.fire({
                    text: 'Per favore, inserisci tutti i dati e riprova.',
                    icon: 'error',
                    buttonsStyling: false,
                    confirmButtonText: 'Ok',
                    customClass: {
                        confirmButton: 'btn font-weight-bold btn-light-primary',
                    },
                }).then(function () {
                    KTUtil.scrollTop();
                });
            }
        });
        // send the form data to your Django backend
    }

    // function handleSaveDraft() {
    //     // get the form data
    //     const form = document.getElementById('instructor_form');
    //     const formData = new FormData(form);
    //     // get data in JSON format
    //     const data = Object.fromEntries(formData.entries());
    //     data.draft = true;
    //     createInstructor(data);
    // }
</script>

<!--begin::Container-->
<div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}} class="container container-overlay">
    <div class="card card-custom">
        <div class="card-header py-3 header-mobile-btn-back">
            <div class="card-toolbar">
                <BackButton />
            </div>
            <h3 class="card-title font-size-h2">Nuovo Istruttore</h3>
            <div class="card-toolbar" />
        </div>
        <div class="card-body p-0">
            <!--begin: Wizard-->
            <div class="wizard wizard-2" id="kt_wizard" data-wizard-state="step-first" data-wizard-clickable="false">
                <!--begin: Wizard Body-->
                <div class="wizard-body py-8 d-flex justify-content-center">
                    <!--begin: Wizard Form-->
                    <div class="row" style="max-width: 70rem;">
                        <div class="">
                            <form class="form" id="instructor_form" on:submit|preventDefault={handleValidation}>
                                <!--begin: Wizard Step 1-->
                                <Section1 />
                                <!--end: Wizard Step 1-->

                                <!--begin: Wizard Actions-->
                                <div class="d-flex justify-content-end border-top mt-5 pt-10">
                                    <div>
                                        <!-- <button
                                            id="subscription_save_draft"
                                            type="button"
                                            on:click={handleSaveDraft}
                                            name="draft"
                                            value="true"
                                            class="btn btn-light-warning font-weight-bolder px-10 py-3 mr-2"
                                            >Salva Bozza
                                        </button> -->
                                        <button
                                            id="subscription_submit"
                                            type="submit"
                                            name="draft"
                                            value="false"
                                            class="btn btn-primary font-weight-bolder px-10 py-3"
                                            >Crea Istruttore
                                        </button>
                                    </div>
                                </div>
                                <!--end: Wizard Actions-->
                            </form>
                        </div>
                        <!--end: Wizard-->
                    </div>
                    <!--end: Wizard Form-->
                </div>
                <!--end: Wizard Body-->
            </div>
            <!--end: Wizard-->
        </div>
    </div>
</div>
<!--end::Container-->
