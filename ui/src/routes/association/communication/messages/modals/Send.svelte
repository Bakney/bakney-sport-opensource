<script>
    import Portal from 'svelte-portal';
    import {getDataFromForm} from 'utils/Functions';
    import {apiFetch} from 'utils/ApiMiddleware';
    import {getAthletesEmails, getAthletesPhones} from 'utils/Functions';
    import {toast} from 'svelte-sonner';

    let sendForm;

    export let type = 'EMAIL';
    export let id;

    function resetForm() {
        // reset the form values
        document.getElementById('send_form_' + id).reset();
        // reset the form validation
        sendForm = null;
    }

    async function create(data) {
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Invio...',
        });

        let url = null;

        if (type == 'SMS') {
            url = __bakney.env.API.COMMUNICATIONS.SEND.SMS;
        } else {
            url = __bakney.env.API.COMMUNICATIONS.SEND.EMAIL;
        }

        if (!url) {
            KTApp.unblockPage();
            return swal
                .fire({
                    text: 'Scusa, ho individuato degli errori, riprova.',
                    icon: 'error',
                    buttonsStyling: false,
                    confirmButtonText: 'Ok, capito!',
                    customClass: {
                        confirmButton: 'btn font-weight-bold btn-light-primary',
                    },
                })
                .then(function () {
                    KTUtil.scrollTop();
                });
        }

        const res = await apiFetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        // spinner stop
        KTApp.unblockPage();

        if (res.status == 200) {
            toast.success('Creato con successo.');
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

        resetForm();
    }

    function initForm() {
        // check type of message
        let validationFields = {};

        if (type == 'SMS') {
            // type can only be SMS or EMAIL
            validationFields = {
                phone_number: {
                    validators: {
                        notEmpty: {
                            message: 'Lista numeri obbligatoria',
                        },
                        regexp: {
                            regexp: /^[0-9,+\s]*$/,
                            message: 'Inserisci una lista di numeri valida',
                        },
                    },
                },
            };
        } else {
            validationFields = {
                email: {
                    validators: {
                        notEmpty: {
                            message: 'Lista email obbligatoria',
                        },
                        regexp: {
                            regexp: /^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(,([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}))*$/,
                            message: 'Inserisci una lista di email valida',
                        },
                    },
                },
            };
        }

        sendForm?.destroy();
        sendForm = FormValidation.formValidation(document.getElementById('send_form_' + id), {
            fields: validationFields,
            plugins: {
                trigger: new FormValidation.plugins.Trigger(),
                bootstrap: new FormValidation.plugins.Bootstrap(),
            },
        });
    }

    function handleValidation(e) {
        if (!sendForm) initForm();
        sendForm?.validate().then(function (status) {
            if (status === 'Valid') {
                create(getDataFromForm(e));
                jQuery('#sendModal' + id).modal('hide');
            }
        });
    }
</script>

<Portal target="#portal-elements">
    <!-- Modal-->
    <form class="form" id="send_form_{id}" on:submit|preventDefault={handleValidation}>
        <div
            class="modal fade"
            id="sendModal{id}"
            tabindex="-1"
            role="dialog"
            aria-labelledby="staticBackdrop"
            aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Invio di un messaggio</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <i aria-hidden="true" class="ki ki-close" />
                        </button>
                    </div>
                    <div class="modal-body pb-0">
                        <!-- hidden id input -->
                        <input type="hidden" name="message_id" value={id} />
                        <!-- hidden type input -->
                        <input type="hidden" name="type" value={type} />
                        {#if type == 'SMS'}
                            <!-- list of phone numbers with validation on change, pattern should be +39NUMBER,+39NUMBER -->
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <div class="d-flex justify-content-between">
                                    <label>Lista numeri<b>*</b></label>
                                    <button
                                        on:click|preventDefault={getAthletesPhones}
                                        class="btn btn-sm btn-light-primary font-weight-bold">importa atleti</button>
                                </div>
                                <textarea
                                    id="phone-textarea"
                                    name="phone_number"
                                    style="resize: none;"
                                    on:keypress={e => {
                                        if (e.key == 'Enter') e.preventDefault();
                                        // check pattern is valid, only numbers and commas and + are allowed
                                        if (!/^[0-9,+\s]*$/.test(e.target.value)) e.target.value = '';
                                        // check is valid +39NUMBER,+39NUMBER,...etc pattern
                                    }}
                                    on:change={e => {
                                        // check pattern is valid, only numbers and commas and + are allowed
                                        if (!/^[0-9,+\s]*$/.test(e.target.value)) e.target.value = '';
                                        // check if there is a comma at the end of the string
                                        if (e.target.value.slice(-1) == ',')
                                            e.target.value = e.target.value.slice(0, -1);
                                    }}
                                    rows="4"
                                    class="form-control form-control-solid form-control-lg margin-t-2"
                                    placeholder="Inserisci i numeri di telefono separati da una virgola...(ad esempio: +393406601516,+390000000000" />
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label style="font-size: 1rem;" class="text-muted text-center"
                                    >Scrivi una lista di numeri col +39 separati da virgola, ad esempio:
                                    +393406601516,+390000000000</label>
                            </div>
                        {:else}
                            <!-- list of phone numbers with validation on change, pattern should be +39NUMBER,+39NUMBER -->
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <div class="d-flex justify-content-between">
                                    <label>Lista email<b>*</b></label>
                                    <button
                                        on:click|preventDefault={getAthletesEmails}
                                        class="btn btn-sm btn-light-primary font-weight-bold">importa atleti</button>
                                </div>
                                <textarea
                                    id="email-textarea"
                                    name="email"
                                    style="resize: none;"
                                    rows="4"
                                    class="form-control form-control-solid form-control-lg margin-t-2"
                                    placeholder="Inserisci le email separate da una virgola...(ad esempio: asd@asd.com,xyz@xyz" />
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label style="font-size: 1rem;" class="text-muted text-center"
                                    >Scrivi una lista di email separate da virgola, ad esempio: asd@asd.com,xyz@xyz</label>
                            </div>
                        {/if}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-light-primary font-weight-bold" data-dismiss="modal"
                            >Chiudi</button>
                        <button type="submit" class="btn btn-primary font-weight-bold">Invia</button>
                    </div>
                </div>
            </div>
        </div>
    </form>
</Portal>
