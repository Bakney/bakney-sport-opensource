<script>
    import {sessionToken} from 'store/stores.js';
    import {scale} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import {onMount, onDestroy} from 'svelte';
    import {Plus} from 'phosphor-svelte';
    import DeleteButton from 'components/buttons/DeleteButton.svelte';
    import EditButton from 'components/buttons/EditButton.svelte';
    import {toBase64, waitForElementAndExecute} from 'utils/Functions.js';
    import NumberInput from 'components/inputs/NumberInput.svelte';
    import Datepicker from 'components/inputs/Datepicker.svelte';
    import {getDataFromForm} from 'utils/Functions';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import EditModal from './modals/EditModal.svelte';
    import {canPerformAction} from 'utils/Permissions.js';
    import {toast} from 'svelte-sonner';

    sessionToken.useLocalStorage();

    let eventForm;
    let title;
    let description;
    let event_subscriptions_types = [
        {
            id: 0,
            amount: '10,00',
            medical_certificate_required: false,
            default: true,
        },
    ];
    let subscription_type = 1;
    let locandina;

    function deleteEventSubscriptionType(id) {
        event_subscriptions_types = [
            ...event_subscriptions_types.filter(function (obj) {
                return obj.id !== id;
            }),
        ];
        // reassing id
        for (let i = 0; i < event_subscriptions_types.length; i++) {
            event_subscriptions_types[i].id = i;
        }
    }

    function addEventSubscriptionType() {
        event_subscriptions_types = [
            ...event_subscriptions_types,
            {
                id: event_subscriptions_types.length,
                amount: 0.0,
                medical_certificate_required: false,
                default: false,
            },
        ];
    }

    function initForm() {
        eventForm?.destroy();
        eventForm = FormValidation.formValidation(document.getElementById('event_form'), {
            fields: {
                start_date: {
                    validators: {
                        notEmpty: {
                            message: 'La data non può essere vuota.',
                        },
                        // date validation
                        regexp: {
                            regexp: '^[0-9]{4}-[0-9]{2}-[0-9]{2}$',
                            flags: 'ig',
                            message: 'La data non è valida',
                        },
                        date: {
                            format: 'YYYY-MM-DD',
                            message: 'La data deve essere nel formato YYYY-MM-DD',
                        },
                    },
                },
                end_date: {
                    validators: {
                        notEmpty: {
                            message: 'La data non può essere vuota.',
                        },
                        // date validation
                        regexp: {
                            regexp: '^[0-9]{4}-[0-9]{2}-[0-9]{2}$',
                            flags: 'ig',
                            message: 'La data non è valida',
                        },
                        date: {
                            format: 'YYYY-MM-DD',
                            message: 'La data deve essere nel formato YYYY-MM-DD',
                        },
                        callback: {
                            message: 'Deve essere successiva o uguale alla data di inizio.',
                            callback: function (input) {
                                return moment(input.value).isSameOrAfter(
                                    moment(eventForm.elements.start_date[0].value),
                                    'day'
                                );
                            },
                        },
                    },
                },
                title: {
                    validators: {
                        notEmpty: {
                            message: 'Il titolo non può essere vuoto.',
                        },
                    },
                },
                description: {
                    validators: {
                        notEmpty: {
                            message: 'La descrizione non può essere vuota.',
                        },
                    },
                },
                open_to: {
                    validators: {
                        notEmpty: {
                            message: 'Seleziona chi può iscriversi.',
                        },
                    },
                },
                subscription_type: {
                    validators: {
                        notEmpty: {
                            message: "Seleziona una modalità d'iscrizione.",
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

    async function create(data) {
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Creazione...',
        });

        for (let i = 0; i < event_subscriptions_types.length; i++) console.error(event_subscriptions_types[i]);
        // event_subscriptions_types[i] = String(event_subscriptions_types[i]).amount.replace(',', '.');

        const url = __bakney.env.API.EVENT.ADD;
        // parse event_subscriptions_types.amount to float
        for (let i = 0; i < event_subscriptions_types.length; i++)
            event_subscriptions_types[i].amount = parseFloat(event_subscriptions_types[i].amount);
        data.subscription_types = [...event_subscriptions_types];
        data.locandina = locandina;

        const res = await apiFetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        // spinner stop
        KTApp.unblockPage();

        if (res.status == 200) {
            // ktdatable.reload();
            document.getElementById('event_form').reset();
            event_subscriptions_types = [
                {
                    id: 0,
                    amount: '10,00',
                    medical_certificate_required: false,
                    default: true,
                },
            ];
            locandina = null;
            ktdatable.reload();

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

    function handleValidation(e) {
        if (!eventForm) initForm();
        eventForm?.validate().then(function (status) {
            if (status === 'Valid') {
                jQuery('#addEventModal').modal('hide');
                create(getDataFromForm(e));
            } else {
                swal.fire({
                    text: 'Per favore, inserisci tutti i dati e riprova.',
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
                        url: __bakney.env.API.EVENT.LIST,
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
                    field: 'title',
                    title: 'Titolo',
                    sortable: true,
                    width: 135,
                    autoHide: false,
                    template: function (row) {
                        return (
                            `<a href="/#/events/overview/${row.event_id}" class="text-primary font-weight-bolder mb-0">` +
                            row.title +
                            '</a>'
                        );
                    },
                },
                {
                    field: 'start_date',
                    title: 'Date evento',
                    width: 180,
                    responsive: {
                        visible: 'lg',
                        hidden: 'md',
                    },
                    sortable: true,
                    template: function (row) {
                        return (
                            (row.start_date ? moment(new Date(row.start_date)).format('DD/MM/YYYY') : '/') +
                            ' - ' +
                            (row.end_date ? moment(new Date(row.end_date)).format('DD/MM/YYYY') : '/')
                        );
                    },
                },
                {
                    field: 'open_to',
                    title: 'Iscrizioni',
                    width: 100,
                    responsive: {
                        visible: 'lg',
                        hidden: 'md',
                    },
                    sortable: true,
                    template: function (row) {
                        return row.open_to == 1
                            ? '<span class="label label-light-success label-inline font-weight-bolder label-lg">Chiunque</span>'
                            : '<span class="label label-light-info label-inline font-weight-bolder label-lg">Solo tesserati</span>';
                    },
                },
                {
                    field: 'description',
                    title: 'Descrizione',
                    sortable: true,
                    responsive: {visible: 'lg'},
                    // width: 150,
                    template: function (row) {
                        return (
                            '<p class="text-dark-75 font-weight-bolder mb-0">' +
                            row.description.slice(0, 50) +
                            (row.description.length > 50 ? '...' : '') +
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
                    width: 100,
                    minWidth: '100%',
                    template: function (row) {
                        waitForElementAndExecute(`#action-col-${row.event_id}`, () => {
                            if (document.querySelector(`#action-col-${row.event_id}`))
                                document.querySelector(`#action-col-${row.event_id}`).innerHTML = '';
                            let editBtn = new EditButton({
                                target: document.querySelector(`#action-col-${row.event_id}`),
                                intro: true,
                                props: {
                                    disabled: !canPerformAction('association.events.update'),
                                    // hidden: !row.editable,
                                },
                            });

                            let editModal = new EditModal({
                                target: document.querySelector(`#action-col-${row.event_id}`),
                                intro: true,
                                props: {
                                    id: row.event_id,
                                    row: row,
                                    ktdatable: ktdatable,
                                },
                            });

                            editBtn.$on('open', data => {
                                jQuery(`#editModal-${row.event_id}`).modal('show');
                            });

                            let deleteBtn = new DeleteButton({
                                target: document.querySelector(`#action-col-${row.event_id}`),
                                intro: true,
                                props: {
                                    disabled: !row.can_delete || !canPerformAction('association.events.delete'),
                                },
                            });

                            deleteBtn.$on('open', data => {
                                swal.fire({
                                    text: "Vuoi eliminare l'evento?",
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
                                            replaceUID(__bakney.env.API.EVENT.DELETE, row.event_id),
                                            {
                                                method: 'DELETE',
                                            }
                                        );

                                        KTApp.unblockPage();

                                        if (!response.error) {
                                            ktdatable.reload();
                                            toast.success('Evento eliminato!');
                                        } else {
                                            toast.error('Qualcosa è andato storto.');
                                        }
                                    }
                                });
                            });
                        });
                        return `<div id="action-col-${row.event_id}" class="action-column pr-4"></div>`;
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
    });

    onDestroy(() => {
        document.querySelectorAll('.popover').forEach(popover => popover.remove());
    });
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
                        Eventi sportivi
                        <span class="d-block text-muted pt-2 font-size-sm">Lista degli eventi organizzati.</span>
                    </h3>
                </div>
                <div class="card-toolbar">
                    {#if canPerformAction('association.events.create')}
                        <!--begin::Button-->
                        <span
                            data-toggle="modal"
                            data-target="#addEventModal"
                            class="btn btn-sm btn-primary font-weight-bolder m-2">
                            <Plus size={18} weight="duotone" />
                            <span class="ml-0 ml-md-1"><span class="d-none d-md-inline-block">Evento</span></span>
                        </span>
                        <!--end::Button-->
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

<form class="form" id="event_form" on:submit|preventDefault={handleValidation}>
    <div
        class="modal fade"
        id="addEventModal"
        tabindex="-1"
        role="dialog"
        aria-labelledby="staticBackdrop"
        aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Nuovo evento</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <i aria-hidden="true" class="ki ki-close" />
                    </button>
                </div>
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div class="modal-body" style="overflow-y: visible;">
                    <div class="d-flex p-4 align-items-center justify-content-between row">
                        <div class="event-card event-card-active text-center col-12 col-md-4">
                            <h4 class="font-weight-boldest text-size-lg">Evento sportivo</h4>
                            <h6 class="font-weight-bold text-size-lg">
                                Organizza un evento sportivo di base, senza gestione delle classifiche
                            </h6>
                        </div>
                        <div class="m-auto">
                            <div class="soon-available">presto disponibile</div>
                            <div class="event-card text-center col-12 col-md-4">
                                <h4 class="font-weight-boldest text-size-lg">Torneo</h4>
                                <h6 class="font-weight-bold text-size-lg">
                                    Organizza un torneo tra più squadre e/o associazioni
                                </h6>
                            </div>
                        </div>
                        <div class="m-auto">
                            <div class="soon-available">presto disponibile</div>
                            <div class="event-card text-center col-12 col-md-4">
                                <h4 class="font-weight-boldest text-size-lg">Gara</h4>
                                <h6 class="font-weight-bold text-size-lg">
                                    Organizza una gara sportiva tra più associazioni e/o atleti
                                </h6>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div class="form-group">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label>Titolo<b>*</b></label>
                            <input
                                name="title"
                                bind:value={title}
                                type="text"
                                class="form-control form-control-solid form-control-lg margin-t-2"
                                placeholder="Titolo dell'evento che stai per organizzare" />
                            <!-- <span class="form-text text-muted">Per favore inserisci il nome.</span> -->
                        </div>
                        <div class="form-group">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label>Descrizione<b>*</b></label>
                            <textarea
                                name="description"
                                style="resize: none;"
                                bind:value={description}
                                rows="4"
                                class="form-control form-control-solid form-control-lg margin-t-2"
                                placeholder="Descrivi l'evento che stai per organizzare" />
                            <!-- <span class="form-text text-muted">Per favore inserisci il nome.</span> -->
                        </div>
                        <div class="row p-0">
                            <div class="form-group col-12 col-md-4 px-0 px-md-4">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Data inizio evento<b>*</b></label>
                                <Datepicker id="start_date" random="" name="start_date" />
                            </div>
                            <div class="form-group col-12 col-md-4 px-0 px-md-4">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Data fine evento<b>*</b></label>
                                <Datepicker id="end_date" random="" name="end_date" />
                            </div>
                            <div class="form-group col-12 col-md-4 px-0 px-md-4">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Chi si può iscrivere?<b>*</b></label>
                                <div>
                                    <select
                                        name="open_to"
                                        class="form-control selectpicker form-control-solid form-control-lg"
                                        id="open_to">
                                        <option value={1}>Tutti</option>
                                        <option value={2}>Solo tesserati</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label>Modalità d'iscrizione all'evento<b>*</b></label>
                            <div>
                                <select
                                    bind:value={subscription_type}
                                    name="subscription_type"
                                    class="form-control selectpicker form-control-solid form-control-lg"
                                    id="subscription_type">
                                    <option value={1}>Unica</option>
                                    <option value={2}>Multipla</option>
                                </select>
                            </div>
                            <div class="py-2 px-2">
                                {#if subscription_type == 1}
                                    Con la modalità <b>Unica</b> tutti pagheranno la stessa quota d'iscrizione.
                                {:else}
                                    Con la modalità <b>Multipla</b> puoi specificare diverse quote d'iscrizione.
                                {/if}
                                Puoi inoltre spuntare se l'iscrizione richiede di caricare un certificato medico.
                            </div>
                        </div>

                        {#each event_subscriptions_types as event_type}
                            <div
                                style="padding: 1rem 0rem !important; border: 2px dashed #e4e6ef; border-radius: 1rem; margin: 1rem 0.3rem; background: #fff;"
                                class="row p-0 d-flex align-items-center">
                                <div class="col-12 col-md-6">
                                    <NumberInput
                                        on:change={e => {
                                            event_type.amount = e.detail;
                                        }}
                                        name="amount-{event_type.id}"
                                        id="amount-{event_type.id}" />
                                </div>
                                <div class="col-12 col-md-5">
                                    <label class="checkbox">
                                        <input
                                            type="checkbox"
                                            name="medical_certificate_required-{event_type.id}"
                                            bind:checked={event_type.medical_certificate_required} />
                                        <span class="mr-2" />
                                        Certificato medico richiesto
                                    </label>
                                </div>
                                <div class="col-12 col-md-1">
                                    <!-- svelte-ignore a11y-label-has-associated-control -->
                                    <div
                                        style="height: 100%; display: flex; align-items: center; justify-content: end;">
                                        <DeleteButton
                                            color="danger"
                                            on:open={() => deleteEventSubscriptionType(event_type.id)}
                                            disabled={event_type.default} />
                                    </div>
                                </div>
                            </div>
                        {/each}
                        {#if subscription_type == 2}
                            <div class="form-group text-right">
                                <button
                                    class="btn btn-primary font-weight-bold"
                                    on:click|preventDefault={() => addEventSubscriptionType()}>Aggiungi</button>
                            </div>
                        {/if}

                        <div class="form-group">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label>Locandina</label>

                            <div class="custom-file">
                                <input
                                    type="file"
                                    id="locandina"
                                    name="locandina"
                                    accept="image/png, image/jpeg"
                                    on:change={async () => {
                                        const file = document.querySelector('#locandina').files[0];
                                        let base64 = await toBase64(file);
                                        locandina = base64;
                                        document.querySelector('#locandina-preview').src = base64;
                                        document.querySelector('#locandina-preview-container').style.display = 'block';
                                        document.querySelector('#locandina-preview').alt = file.name;
                                    }} />
                                <label class="custom-file-label" for="locandina">Scegli il file della locandina</label>
                            </div>
                        </div>
                        <div
                            class="form-group"
                            id="locandina-preview-container"
                            style="display: none;padding: 1rem 2rem; border-radius: 2rem; background: #f4f6f9;">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <div class="d-flex">
                                <img class="mr-8" height="200" id="locandina-preview" src="" alt="" />
                                <div>
                                    <h1 class="text-size-xl text-primary font-weight-boldest">
                                        {title || "Titolo dell'evento"}
                                    </h1>
                                    <p class="text-muted font-size-lg">
                                        {description || "Descrizione dell'evento"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-light-primary font-weight-bold" data-dismiss="modal"
                        >Chiudi</button>
                    <button type="submit" class="btn btn-primary font-weight-bold">Salva</button>
                </div>
            </div>
        </div>
    </div>
</form>

<svelte:head>
    <style>
        @media (max-width: 991.98px) {
            .event-card {
                margin: auto;
                margin-bottom: 1rem;
            }
        }

        .custom-file-label::after {
            content: 'Scegli file';
        }

        .event-card {
            background: #f3f6f9;
            border-radius: 0.55rem;
            padding: 2rem;
            min-height: 12rem;
            border: 0.2rem solid #e6edf5;
            max-width: 19rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            opacity: 0.35;
        }

        .event-card-active {
            opacity: 1;
        }
        .soon-available {
            text-align: center;
            background: red;
            color: #fff;
            position: absolute;
            opacity: 1;
            padding: 0.25rem 0.5rem;
            border-radius: 2rem;
            z-index: 9999;
            margin-top: 4.5rem;
            margin-left: 4.5rem;
        }
    </style>
</svelte:head>
