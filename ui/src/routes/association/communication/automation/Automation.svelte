<script>
    import EditButton from 'components/buttons/EditButton.svelte';
    import Portal from 'svelte-portal';
    import {sessionToken, userData} from 'store/stores.js';
    import {scale} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import {onMount, onDestroy} from 'svelte';
    import {replaceUID} from 'utils/ApiMiddleware.js';
    import {PlusCircle, Warning} from 'phosphor-svelte';
    import {getDataFromForm, waitForElementAndExecute} from 'utils/Functions';
    import {apiFetch} from 'utils/ApiMiddleware';
    import DeleteButton from 'components/buttons/DeleteButton.svelte';
    import PauseButton from 'components/buttons/PauseButton.svelte';
    import PlayButton from 'components/buttons/PlayButton.svelte';
    import {getAthletesEmails, getAthletesPhones} from 'utils/Functions';
    import {push} from 'svelte-spa-router';
    import {canPerformAction} from 'utils/Permissions';
    import {toast} from 'svelte-sonner';

    sessionToken.useLocalStorage();

    let messageForm;
    let postForm;
    let type = 'EMAIL';
    let sendNow = false;

    const typeDictionary = {
        EMAIL: '<span class="label label-light-primary label-inline font-weight-bolder label-lg">Email</span>',
        SMS: '<span class="label label-light-warning label-inline font-weight-bolder label-lg">SMS</span>',
        INSIDE_APP: '<span class="label label-light-success label-inline font-weight-bolder label-lg">Post</span>',
    };

    function resetForm() {
        type = 'EMAIL';
        sendNow = false;
        // reset the form values
        document.getElementById('communications_form').reset();
        document.getElementById('post_form').reset();
        // reset the form validation
        messageForm = null;
        postForm = null;
    }

    async function create(data) {
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Creazione...',
        });

        let url = null;

        if (data.type == 'SMS' && sendNow) {
            url = __bakney.env.API.COMMUNICATIONS.SEND.SMS;
        } else if (data.type == 'SMS' && !sendNow) {
            url = __bakney.env.API.COMMUNICATIONS.MESSAGES.ADD;
        } else if (data.type == 'EMAIL' && sendNow) {
            url = __bakney.env.API.COMMUNICATIONS.SEND.EMAIL;
        } else if (data.type == 'EMAIL' && !sendNow) {
            url = __bakney.env.API.COMMUNICATIONS.MESSAGES.ADD;
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
            ktdatable.reload();
            resetForm();

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

    async function createPost(data) {
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Creazione...',
        });

        const url = __bakney.env.API.COMMUNICATIONS.SEND.POST;

        const res = await apiFetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        // spinner stop
        KTApp.unblockPage();

        if (res.status == 200) {
            ktdatable.reload();
            resetForm();

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
    }

    let ktdatable = (function () {
        // Private functions
        var datatable;

        var options = {
            // datasource definition
            data: {
                responsive: true,
                type: 'remote',
                source: {
                    read: {
                        url: __bakney.env.API.COMMUNICATIONS.WORKFLOWS.LIST,
                        method: 'GET',
                        params: {
                            // API params
                        },
                        headers: {
                            Authorization: 'Bearer ' + $sessionToken,
                        },
                        map: function (raw) {
                            var dataSet = raw;
                            if (typeof raw.data !== 'undefined') {
                                dataSet = raw.data;
                            }
                            return dataSet;
                        },
                    },
                },
                pageSize: 10,
                serverPaging: false,
                serverFiltering: false,
                serverSorting: false,
                autoColumns: false, // autocols
            },

            // layout definition
            layout: {
                scroll: true, // enable/disable datatable scroll both horizontal and
                footer: false, // display/hide footer
            },

            toolbar: {
                items: {
                    pagination: {
                        pageSizeSelect: [10, 20, 30, 50],
                    },
                },
            },

            // column sorting
            sortable: true,

            pagination: true,

            search: {
                input: jQuery('#kt_datatable_search_query'),
                //onEnter: true,
                key: 'generalSearch',
            },

            // columns definition

            columns: [
                {
                    field: 'name',
                    title: 'Nome',
                    sortable: true,
                    width: 200,
                    autoHide: false,
                    template: function (row) {
                        return '<p class="text-dark-75 font-weight-bolder mb-0">' + row.name + '</p>';
                    },
                },
                {
                    field: 'enabled',
                    title: 'Stato',
                    sortable: true,
                    width: 150,
                    template: function (row) {
                        // if row.enabled set label-success else label-primary
                        return (
                            '<span class="label label-inline font-weight-bolder label-lg label-light-' +
                            (row.enabled ? 'success' : 'info') +
                            '">' +
                            (row.enabled ? 'Attiva' : 'Spenta') +
                            '</span>'
                        );
                    },
                },
                {
                    field: 'created_at',
                    title: 'Data',
                    sortable: true,
                    width: 150,
                    template: function (row) {
                        return (
                            '<p class="text-dark-75 font-weight-bolder mb-0">' +
                            new Date(row.created_at).toLocaleString() +
                            '</p>'
                        );
                    },
                },
                {
                    field: '',
                    title: '',
                    sortable: false,
                    textAlign: 'right',
                    autoHide: false,
                    width: 110,
                    minWidth: '100%',
                    template: function (row) {
                        waitForElementAndExecute(`#action-col-${row.automation_workflow_id}`, () => {
                            if (document.querySelector(`#action-col-${row.automation_workflow_id}`))
                                document.querySelector(`#action-col-${row.automation_workflow_id}`).innerHTML = '';

                            // play or pause button, if enabled show pause button else show play button

                            if (row.enabled) {
                                let pauseBtn = new PauseButton({
                                    target: document.querySelector(`#action-col-${row.automation_workflow_id}`),
                                    intro: true,
                                    props: {
                                        disabled: !canPerformAction('association.communication.workflows.update'),
                                        // hidden: !row.editable,
                                    },
                                });

                                pauseBtn.$on('open', data => {
                                    swal.fire({
                                        text: "Vuoi disattivare l'automazione?",
                                        icon: 'warning',
                                        buttonsStyling: true,
                                        showCancelButton: true,
                                        cancelButtonText: 'Annulla',
                                        confirmButtonText: 'Disattiva',
                                        reverseButtons: true,
                                        confirmButtonColor: '#d63030',
                                    }).then(async function (result) {
                                        if (result.isConfirmed) {
                                            KTApp.blockPage({
                                                overlayColor: '#000000',
                                                state: 'primary',
                                                message: 'Disattivazione in corso...',
                                            });

                                            const response = await apiFetch(
                                                replaceUID(
                                                    __bakney.env.API.COMMUNICATIONS.WORKFLOWS.UPDATE,
                                                    row.automation_workflow_id
                                                ),
                                                {
                                                    method: 'PATCH',
                                                    body: JSON.stringify({
                                                        enabled: false,
                                                    }),
                                                }
                                            );

                                            KTApp.unblockPage();

                                            if (!response.error) {
                                                toast.success('Disattivata!');
                                                ktdatable.reload();
                                            } else {
                                                toast.error('Qualcosa è andato storto.');
                                            }
                                        }
                                    });
                                });
                            } else {
                                let playBtn = new PlayButton({
                                    target: document.querySelector(`#action-col-${row.automation_workflow_id}`),
                                    intro: true,
                                    props: {
                                        disabled: !canPerformAction('association.communication.workflows.update'),
                                        // hidden: !row.editable,
                                    },
                                });

                                playBtn.$on('open', data => {
                                    swal.fire({
                                        text: "Vuoi attivare l'automazione?",
                                        icon: 'warning',
                                        buttonsStyling: true,
                                        showCancelButton: true,
                                        cancelButtonText: 'Annulla',
                                        confirmButtonText: 'Attiva',
                                        reverseButtons: true,
                                        confirmButtonColor: '#d63030',
                                    }).then(async function (result) {
                                        if (result.isConfirmed) {
                                            KTApp.blockPage({
                                                overlayColor: '#000000',
                                                state: 'primary',
                                                message: 'Attivazione in corso...',
                                            });

                                            const response = await apiFetch(
                                                replaceUID(
                                                    __bakney.env.API.COMMUNICATIONS.WORKFLOWS.UPDATE,
                                                    row.automation_workflow_id
                                                ),
                                                {
                                                    method: 'PATCH',
                                                    body: JSON.stringify({
                                                        enabled: true,
                                                    }),
                                                }
                                            );

                                            KTApp.unblockPage();

                                            if (!response.error) {
                                                toast.success('Attivata!');
                                                ktdatable.reload();
                                            } else {
                                                toast.error('Qualcosa è andato storto.');
                                            }
                                        }
                                    });
                                });
                            }

                            let editBtn = new EditButton({
                                target: document.querySelector(`#action-col-${row.automation_workflow_id}`),
                                intro: true,
                                props: {
                                    disabled: !canPerformAction('association.communication.workflows.update'),
                                    // hidden: !row.editable,
                                },
                            });

                            editBtn.$on('open', data => {
                                // go to edit page
                                push(`/communication/automation/editor/${row.automation_workflow_id}`);
                            });

                            let deleteBtn = new DeleteButton({
                                target: document.querySelector(`#action-col-${row.automation_workflow_id}`),
                                intro: true,
                                props: {
                                    disabled: !canPerformAction('association.communication.workflows.delete'),
                                    // hidden: !row.editable,
                                },
                            });

                            deleteBtn.$on('open', data => {
                                swal.fire({
                                    text: "Vuoi eliminare l'automazione?",
                                    icon: 'warning',
                                    buttonsStyling: true,
                                    showCancelButton: true,
                                    cancelButtonText: 'Annulla',
                                    confirmButtonText: 'Elimina',
                                    reverseButtons: true,
                                    confirmButtonColor: '#d63030',
                                }).then(async function (result) {
                                    if (result.isConfirmed) {
                                        KTApp.blockPage({
                                            overlayColor: '#000000',
                                            state: 'primary',
                                            message: 'Eliminazione in corso...',
                                        });

                                        const response = await apiFetch(
                                            replaceUID(
                                                __bakney.env.API.COMMUNICATIONS.WORKFLOWS.DELETE,
                                                row.automation_workflow_id
                                            ),
                                            {
                                                method: 'DELETE',
                                            }
                                        );

                                        KTApp.unblockPage();

                                        if (!response.error) {
                                            toast.success('Eliminato!');
                                            ktdatable.reload();
                                        } else {
                                            toast.error('Qualcosa è andato storto.');
                                        }
                                    }
                                });
                            });
                        });
                        return `<div id="action-col-${row.automation_workflow_id}" class="action-column pr-4"></div>`;
                    },
                },
            ],
        };

        // basic demo
        var localSelectorDemo = function () {
            // enable extension
            options.extensions = {
                // boolean or object (extension options)
                checkbox: true,
            };

            options.search = {
                input: jQuery('#kt_datatable_search_query'),
                //onEnter: true,
                key: 'generalSearch',
            };

            datatable = jQuery('#kt_datatable').KTDatatable(options);

            jQuery('#kt_datatable_search_status').on('change', function () {
                datatable.search(jQuery(this).val().toLowerCase(), 'status_flag');
            });

            jQuery('#kt_datatable_search_status').selectpicker();

            datatable.on('datatable-on-check datatable-on-uncheck', function (e) {
                var checkedNodes = datatable.rows('.datatable-row-active').nodes();
                var count = checkedNodes.length;
                jQuery('#kt_datatable_selected_records').html(count);
                if (count > 0) {
                    jQuery('#kt_datatable_group_action_form').collapse('show');
                } else {
                    jQuery('#kt_datatable_group_action_form').collapse('hide');
                }
            });

            jQuery('#kt_datatable_fetch_modal')
                .on('show.bs.modal', function (e) {
                    var ids = datatable
                        .rows('.datatable-row-active')
                        .nodes()
                        .find('.checkbox > [type="checkbox"]')
                        .map(function (i, chk) {
                            return jQuery(chk).val();
                        });
                    var c = document.createDocumentFragment();
                    for (var i = 0; i < ids.length; i++) {
                        var li = document.createElement('li');
                        li.setAttribute('data-id', ids[i]);
                        li.innerHTML = 'Selected record ID: ' + ids[i];
                        c.appendChild(li);
                    }
                    jQuery('#kt_datatable_fetch_display').append(c);
                })
                .on('hide.bs.modal', function (e) {
                    jQuery('#kt_datatable_fetch_display').empty();
                });
        };

        return {
            // public functions
            init: function () {
                localSelectorDemo();
                //serverSelectorDemo();
            },
            reload: function () {
                datatable.reload();
            },
        };
    })();

    onMount(() => {
        localStorage.removeItem('kt_datatable-1-meta');
        ktdatable.init();
        jQuery('body').tooltip({selector: '[data-toggle=tooltip]', trigger: 'hover'});
        jQuery('body').popover({selector: '[data-toggle=popover]', trigger: 'hover'});
        jQuery('#account_type').selectpicker();
        jQuery('#initial_balance').inputmask('9{1,9},9{2}', {
            greedy: false,
            placeholder: '0',
            rightAlign: true,
        });
    });

    onDestroy(() => {
        document.querySelectorAll('.popover').forEach(popover => popover.remove());
    });

    function initForm() {
        // check type of message
        let validationFields = {};

        if (type == 'SMS') {
            // type can only be SMS or EMAIL
            validationFields = {
                type: {
                    validators: {
                        notEmpty: {
                            message: 'Tipo obbligatorio',
                        },
                        callback: {
                            message: 'Tipo non valido',
                            callback: function (input) {
                                return input.value == 'SMS' || input.value == 'EMAIL';
                            },
                        },
                    },
                },
                message: {
                    validators: {
                        notEmpty: {
                            message: 'Contenuto obbligatorio',
                        },
                        stringLength: {
                            min: 20,
                            max: 160,
                            message: 'Il messaggio deve essere almeno di 20 caratteri e non può superare i 160',
                        },
                    },
                },
            };
            if (sendNow) {
                validationFields['phone_number'] = {
                    validators: {
                        notEmpty: {
                            message: 'Lista numeri obbligatoria',
                        },
                        regexp: {
                            regexp: /^[0-9,+\s]*$/,
                            message: 'Inserisci una lista di numeri valida',
                        },
                    },
                };
            }
        } else {
            validationFields = {
                type: {
                    validators: {
                        notEmpty: {
                            message: 'Tipo obbligatorio',
                        },
                        callback: {
                            message: 'Tipo non valido',
                            callback: function (input) {
                                return input.value == 'SMS' || input.value == 'EMAIL';
                            },
                        },
                    },
                },
                subject: {
                    validators: {
                        notEmpty: {
                            message: 'Oggetto obbligatorio',
                        },
                        stringLength: {
                            min: 5,
                            max: 100,
                            message: "L'oggetto deve essere almeno di 5 caratteri e non può superare i 100",
                        },
                    },
                },
                message: {
                    validators: {
                        notEmpty: {
                            message: 'Contenuto obbligatorio',
                        },
                        stringLength: {
                            min: 20,
                            max: 1000,
                            message: 'Il messaggio deve essere almeno di 20 caratteri e non può superare i 1000',
                        },
                    },
                },
            };

            if (sendNow) {
                validationFields['email'] = {
                    validators: {
                        notEmpty: {
                            message: 'Lista email obbligatoria',
                        },
                        regexp: {
                            regexp: /^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(,([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}))*$/,
                            message: 'Inserisci una lista di email valida',
                        },
                    },
                };
            }
        }

        messageForm?.destroy();
        messageForm = FormValidation.formValidation(document.getElementById('communications_form'), {
            fields: validationFields,
            plugins: {
                trigger: new FormValidation.plugins.Trigger(),
                bootstrap: new FormValidation.plugins.Bootstrap(),
            },
        });
    }

    function initPostForm() {
        postForm?.destroy();
        postForm = FormValidation.formValidation(document.getElementById('post_form'), {
            fields: {
                message: {
                    validators: {
                        notEmpty: {
                            message: 'Contenuto obbligatorio',
                        },
                        stringLength: {
                            min: 20,
                            max: 1000,
                            message:
                                'Il messaggio non può superare i 1000 caratteri e deve essere almeno di 20 caratteri',
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

    function handleValidation(e) {
        if (!messageForm) initForm();
        messageForm?.validate().then(function (status) {
            if (status === 'Valid') {
                create(getDataFromForm(e));
                jQuery('#addModal').modal('hide');
            }
        });
    }

    function handlePostValidation(e) {
        if (!postForm) initPostForm();
        postForm?.validate().then(function (status) {
            if (status === 'Valid') {
                createPost(getDataFromForm(e));
                jQuery('#addModalPost').modal('hide');
            }
        });
    }
</script>

<!--begin::Entry-->
<div
    in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}}
    class="d-flex flex-column-fluid font-weight-bold text-dark-50">
    <!--begin::Container-->
    <div class="container">
        <!--begin::Card-->
        <div class="card card-custom gutter-b">
            <div class="card-header flex-wrap border-0 p-0">
                <div class="card-title">
                    <h3 class="card-label font-size-h2">
                        Automazioni
                        <span class="d-block text-muted pt-2 font-size-sm"
                            >In questa sezione sono presenti le automazioni che permettono di semplificare le
                            comunicazioni con i soci.</span>
                    </h3>
                </div>
                <div class="card-toolbar">
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    {#if canPerformAction('association.communication.workflows.create')}
                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                        <span
                            class="btn btn-sm btn-primary font-weight-bolder m-2 d-flex align-items-center"
                            on:click={() => {
                                push('/communication/automation/editor');
                            }}>
                            <PlusCircle size={18} weight="duotone" />
                            <span class="ml-md-1 ml-0"><span class="d-none d-md-inline-block">Automazione</span></span>
                        </span>
                    {/if}
                </div>
            </div>
            <div class="card-body p-0">
                <!--begin: Search Form-->
                <!--begin::Search Form-->
                <div class="mb-2">
                    <div class="row align-items-center">
                        <div class="col-lg-9 col-xl-8">
                            <div class="row align-items-center">
                                <div class="col-md-4 my-2 my-md-0">
                                    <div class="input-icon">
                                        <input
                                            type="text"
                                            class="form-control form-control-solid mb-0"
                                            placeholder="Cerca..."
                                            id="kt_datatable_search_query" />
                                        <span>
                                            <i class="flaticon2-search-1 text-muted" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!--end::Search Form-->
                <!--begin: Datatable-->
                <div class="datatable datatable-bordered datatable-head-custom" id="kt_datatable" />
                <!--end: Datatable-->
            </div>
        </div>
        <!--end::Card-->
    </div>
    <!--end::Container-->
</div>
<!--end::Entry-->

<!-- svelte-ignore missing-declaration -->
<Portal target="#portal-elements">
    <!-- Modal-->
    <form class="form" id="communications_form" on:submit|preventDefault={handleValidation}>
        <div
            class="modal fade"
            id="addModal"
            tabindex="-1"
            role="dialog"
            aria-labelledby="staticBackdrop"
            aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Creazione di un messaggio</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <i aria-hidden="true" class="ki ki-close" />
                        </button>
                    </div>
                    <div class="modal-body pb-0">
                        <!-- select box Tipo messaggi -->
                        <div class="form-group mb-3">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="font-size-h6 font-weight-bolder text-dark">Tipo messaggio</label>
                            <select
                                class="form-control form-control-solid form-control-lg mr-2"
                                name="type"
                                id="type"
                                bind:value={type}
                                required>
                                <option value="EMAIL">Email</option>
                                <option value="SMS">SMS</option>
                            </select>
                        </div>
                        {#if type == 'SMS'}
                            <div class="form-group mb-0">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Contenuto (max 160 caratteri)<b>*</b></label>
                                <textarea
                                    name="message"
                                    style="resize: none;"
                                    rows="4"
                                    class="form-control form-control-solid form-control-lg margin-t-2"
                                    placeholder="Scrivi cosa devi comunicare ai tuoi atleti..." />
                            </div>
                            <div class="msg-container">
                                <!-- add input to ask if sending message right away, if selected show another text area which will be a list of phone numbers -->
                                <div class="form-group d-flex align-items-center justify-content-between mb-2">
                                    <!-- svelte-ignore a11y-label-has-associated-control -->
                                    <label class="col-form-label font-weight-bold"
                                        >Inviare subito ad una lista numeri?</label>
                                    <div>
                                        <span class="switch switch-sm switch-icon">
                                            <label>
                                                <input type="checkbox" name="select" bind:checked={sendNow} />
                                                <span />
                                            </label>
                                        </span>
                                    </div>
                                </div>
                                {#if sendNow}
                                    <!-- list of phone numbers with validation on change, pattern should be +39NUMBER,+39NUMBER -->
                                    <div class="form-group">
                                        <!-- svelte-ignore a11y-label-has-associated-control -->
                                        <div class="d-flex justify-content-between">
                                            <label>Lista numeri<b>*</b></label>
                                            <button
                                                on:click|preventDefault={getAthletesPhones}
                                                class="btn btn-sm btn-light-primary font-weight-bold"
                                                >importa atleti</button>
                                        </div>
                                        <textarea
                                            id="phone-textarea"
                                            name="phone_number"
                                            style="resize: y;"
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
                                {/if}
                            </div>
                        {:else}
                            <!-- Subject -->
                            <div class="form-group mb-0">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Oggetto<b>*</b></label>
                                <input
                                    type="text"
                                    name="subject"
                                    class="form-control form-control-solid form-control-lg margin-t-2"
                                    placeholder="Scrivi l'oggetto dell'email..." />
                            </div>
                            <!-- Content -->
                            <div class="form-group mb-0">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Contenuto<b>*</b></label>
                                <textarea
                                    name="message"
                                    style="resize: none;"
                                    rows="4"
                                    class="form-control form-control-solid form-control-lg margin-t-2"
                                    placeholder="Scrivi cosa devi comunicare ai tuoi atleti..." />
                            </div>
                            <div class="msg-container">
                                <!-- add input to ask if sending message right away, if selected show another text area which will be a list of phone numbers -->
                                <div class="form-group d-flex align-items-center justify-content-between mb-2">
                                    <!-- svelte-ignore a11y-label-has-associated-control -->
                                    <label class="col-form-label font-weight-bold"
                                        >Inviare subito ad una lista email?</label>
                                    <div>
                                        <span class="switch switch-sm switch-icon">
                                            <label>
                                                <input type="checkbox" name="select" bind:checked={sendNow} />
                                                <span />
                                            </label>
                                        </span>
                                    </div>
                                </div>
                                {#if sendNow}
                                    <!-- list of phone numbers with validation on change, pattern should be +39NUMBER,+39NUMBER -->
                                    <div class="form-group">
                                        <!-- svelte-ignore a11y-label-has-associated-control -->
                                        <div class="d-flex justify-content-between">
                                            <label>Lista email<b>*</b></label>
                                            <button
                                                on:click|preventDefault={getAthletesEmails}
                                                class="btn btn-sm btn-light-primary font-weight-bold"
                                                >importa atleti</button>
                                        </div>
                                        <textarea
                                            id="email-textarea"
                                            name="email"
                                            style="resize: y;"
                                            rows="4"
                                            class="form-control form-control-solid form-control-lg margin-t-2"
                                            placeholder="Inserisci le email separate da una virgola...(ad esempio: asd@asd.com,xyz@xyz" />
                                        <!-- svelte-ignore a11y-label-has-associated-control -->
                                        <label style="font-size: 1rem;" class="text-muted text-center"
                                            >Scrivi una lista di email separate da virgola, ad esempio:
                                            asd@asd.com,xyz@xyz</label>
                                    </div>
                                {/if}
                            </div>
                        {/if}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-light-primary font-weight-bold" data-dismiss="modal"
                            >Chiudi</button>
                        <button type="submit" class="btn btn-primary font-weight-bold"
                            >{sendNow ? 'Invia' : 'Salva'}</button>
                    </div>
                </div>
            </div>
        </div>
    </form>
</Portal>

<!-- svelte-ignore missing-declaration -->
<Portal target="#portal-elements">
    <!-- Modal-->
    <form class="form" id="post_form" on:submit|preventDefault={handlePostValidation}>
        <div
            class="modal fade"
            id="addModalPost"
            tabindex="-1"
            role="dialog"
            aria-labelledby="staticBackdrop"
            aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Crea un post</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <i aria-hidden="true" class="ki ki-close" />
                        </button>
                    </div>
                    <div class="modal-body pb-0">
                        <!-- hidden input type INSIDE_APP -->
                        <input type="hidden" name="type" value="INSIDE_APP" />
                        <div
                            class="d-flex align-items-center text-bold text-warning bg-light-warning p-4 mb-4"
                            style="border-radius: .35rem;">
                            <Warning size={18} weight="duotone" class="mr-2" />
                            Il post sarà visibile a tutti gli atleti iscritti alla tua associazione sportiva.
                        </div>
                        <div class="form-group">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label>Contenuto<b>*</b></label>
                            <textarea
                                name="message"
                                style="resize: none;"
                                rows="4"
                                class="form-control form-control-solid form-control-lg margin-t-2"
                                placeholder="Scrivi cosa devi comunicare ai tuoi atleti..." />
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-light-primary font-weight-bold" data-dismiss="modal"
                            >Chiudi</button>
                        <button type="submit" class="btn btn-primary font-weight-bold">Pubblica</button>
                    </div>
                </div>
            </div>
        </div>
    </form>
</Portal>
