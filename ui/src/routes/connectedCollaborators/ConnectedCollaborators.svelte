<script>
    import Portal from 'svelte-portal';
    import {sessionToken} from 'store/stores.js';
    import {scale} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import {onMount, onDestroy} from 'svelte';
    import {replaceUID} from 'utils/ApiMiddleware.js';
    import {Plus} from 'phosphor-svelte';
    import {getDataFromForm, waitForElementAndExecute} from 'utils/Functions';
    import {apiFetch} from 'utils/ApiMiddleware';
    import EditButton from 'components/buttons/EditButton.svelte';
    import DeleteButton from 'components/buttons/DeleteButton.svelte';
    import EditModal from './modals/EditModal.svelte';
    import PermissionsComponent from 'components/PermissionsComponent.svelte';
    import {canPerformAction} from 'utils/Permissions';
    import {toast} from 'svelte-sonner';

    sessionToken.useLocalStorage();

    let collaboratorForm;
    let collaboratorRole = 1;
    let collaboratorPermissions = [];

    async function create(data) {
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Invio invito...',
        });

        const url = __bakney.env.API.COLLABORATORS.ADD;

        // add collaboratorPermissions
        data.collaborator_permissions = collaboratorPermissions;

        const res = await apiFetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        // spinner stop
        KTApp.unblockPage();

        if (res.status == 200) {
            ktdatable.reload();
            document.getElementById('collaborator_form').reset();

            toast.success('Invito inviato con successo.');
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
                        url: __bakney.env.API.COLLABORATORS.LIST,
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
                    autoHide: false,
                    width: 150,
                    template: function (row) {
                        // check if is an invite
                        if (row.is_invite == 1) return '<p class="text-dark-75 font-weight-bolder mb-0">-</p>';
                        else
                            return (
                                '<p class="text-dark-75 font-weight-bolder mb-0">' +
                                String(row.first_name).toUpperCase() +
                                ' ' +
                                String(row.last_name).toUpperCase() +
                                '</p>'
                            );
                    },
                },
                {
                    field: 'email',
                    title: 'Email',
                    sortable: true,
                    width: 250,
                    template: function (row) {
                        return '<p class="text-dark-75 font-weight-bolder mb-0">' + row.email + '</p>';
                    },
                },
                {
                    field: 'accepted',
                    title: 'Invito',
                    sortable: true,
                    width: 100,
                    minWidth: '100%',
                    template: function (row) {
                        // if is an invite make unaccepted else accepted
                        if (row.is_invite) {
                            // if expiration date is passed make unaccepted, convert expiration_date with moment
                            if (moment(row.expiration_date).isBefore(moment())) {
                                return (
                                    '<p class="text-dark-75 font-weight-bolder mb-0">' +
                                    '<span class="label label-light-danger label-inline font-weight-bolder label-lg">Scaduto</span>' +
                                    '</p>'
                                );
                            } else {
                                return (
                                    '<p class="text-dark-75 font-weight-bolder mb-0">' +
                                    '<span class="label label-light-warning label-inline font-weight-bolder label-lg">In attesa</span>' +
                                    '</p>'
                                );
                            }
                        } else {
                            return (
                                '<p class="text-dark-75 font-weight-bolder mb-0">' +
                                '<span class="label label-light-success label-inline font-weight-bolder label-lg">Accettato</span>' +
                                '</p>'
                            );
                        }
                    },
                },
                {
                    field: 'role',
                    title: 'Ruolo',
                    sortable: true,
                    width: 120,
                    minWidth: '100%',
                    template: function (row) {
                        return (
                            '<p class="text-dark-75 font-weight-bolder mb-0">' +
                            (row.collaborator_role == 1 ? 'Accesso Completo' : 'Personalizzato') +
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
                    minWidth: '100%',
                    // minWidth: '100%',
                    template: function (row) {
                        waitForElementAndExecute(`#action-col-${row.collaboration_invite_id || row.user_id}`, () => {
                            if (document.querySelector(`#action-col-${row.collaboration_invite_id}`))
                                document.querySelector(`#action-col-${row.collaboration_invite_id}`).innerHTML = '';

                            if (row.user_id) {
                                let editBtn = new EditButton({
                                    target: document.querySelector(`#action-col-${row.user_id}`),
                                    intro: true,
                                    props: {
                                        disabled: !row.user_id || !canPerformAction('other.users.collaborators.update'),
                                        hidden: !row.user_id,
                                    },
                                });

                                let editModal = new EditModal({
                                    target: document.querySelector(`#action-col-${row.user_id}`),
                                    intro: true,
                                    props: {
                                        id: row.user_id,
                                        row: row,
                                        datatable: datatable,
                                    },
                                });

                                editBtn.$on('open', data => {
                                    jQuery(`#editModal-${row.user_id}`).modal('show');
                                });
                            }

                            let deleteBtn = new DeleteButton({
                                target: document.querySelector(
                                    `#action-col-${row.collaboration_invite_id || row.user_id}`
                                ),
                                intro: true,
                                props: {
                                    disabled: !canPerformAction('other.users.collaborators.delete'),
                                    // hidden: !row.editable,
                                },
                            });

                            deleteBtn.$on('open', data => {
                                swal.fire({
                                    text: 'Vuoi eliminare il collaboratore?',
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

                                        let id = row.collaboration_invite_id || row.user_id;

                                        const response = await apiFetch(
                                            replaceUID(__bakney.env.API.COLLABORATORS.DELETE, id),
                                            {
                                                method: 'DELETE',
                                            }
                                        );

                                        KTApp.unblockPage();

                                        if (!response.error) {
                                            toast.success('Collaboratore eliminato!');
                                            ktdatable.reload();
                                        } else {
                                            toast.error('Qualcosa è andato storto.');
                                        }
                                    }
                                });
                            });
                        });
                        return `<div id="action-col-${
                            row.collaboration_invite_id || row.user_id
                        }" class="action-column pr-4"></div>`;
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
        collaboratorForm?.destroy();
        collaboratorForm = FormValidation.formValidation(document.getElementById('collaborator_form'), {
            fields: {
                email: {
                    validators: {
                        notEmpty: {
                            message: 'Email obbligatoria',
                        },
                        emailAddress: {
                            message: 'Non è un indirizzo email valido',
                        },
                        stringLength: {
                            max: 255,
                            message: "L'email non può superare i 255 caratteri",
                        },
                        remote: {
                            message: "L'indirizzo email è già stato utilizzato per creare un utente.",
                            method: 'GET',
                            url: __bakney.env.HOST + '/oauth2/check/email',
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
        if (!collaboratorForm) initForm();
        collaboratorForm?.validate().then(function (status) {
            if (status === 'Valid') {
                create(getDataFromForm(e));
                jQuery('#addCollaboratorModal').modal('hide');
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
                        Collaboratori
                        <span class="d-block text-muted pt-2 font-size-sm"
                            >Contiene la lista completa dei collaboratori che hanno accesso all'associazione.</span>
                    </h3>
                </div>
                <div class="card-toolbar">
                    {#if canPerformAction('other.users.collaborators.create')}
                        <!--begin::Button-->
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                        <span
                            data-toggle="modal"
                            data-target="#addCollaboratorModal"
                            on:click={() => {
                                // dispatch onboarding-checklist-event
                                document.dispatchEvent(
                                    new CustomEvent('onboarding-checklist-event', {detail: {key: 'view_collaborators'}})
                                );
                            }}
                            class="btn btn-sm btn-primary font-weight-bolder m-2">
                            <Plus size={18} weight="duotone" />
                            <span class="ml-md-1 ml-0"
                                ><span class="d-none d-md-inline-block">Collaboratore</span></span>
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
    <form class="form" id="collaborator_form" on:submit|preventDefault={handleValidation}>
        <div
            class="modal fade"
            id="addCollaboratorModal"
            tabindex="-1"
            role="dialog"
            aria-labelledby="staticBackdrop"
            aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Creazione di un collaboratore</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <i aria-hidden="true" class="ki ki-close" />
                        </button>
                    </div>
                    <div class="modal-body">
                        <div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Email<b>*</b></label>
                                <input
                                    name="email"
                                    type="email"
                                    class="form-control form-control-solid form-control-lg margin-t-2"
                                    placeholder="Email" />
                                <!-- <span class="form-text text-muted">Per favore inserisci il nome.</span> -->
                            </div>
                        </div>
                        <div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Permessi<b>*</b></label>
                                <select
                                    name="collaborator_role"
                                    bind:value={collaboratorRole}
                                    class="form-control form-control-solid form-control-lg margin-t-2"
                                    placeholder="Ruolo">
                                    <option value={1} selected="selected">Accesso Completo</option>
                                    <!-- <option value={2}>Commercialista</option> -->
                                    <option value={3}>Personalizzato</option>
                                </select>
                            </div>
                        </div>

                        {#if collaboratorRole == 3}
                            <!--  checkbox with collaboration to mark as JSON -->
                            <div>
                                <div class="form-group">
                                    <!-- svelte-ignore a11y-label-has-associated-control -->
                                    <label>Permessi del collaboratore<b>*</b></label>
                                    <PermissionsComponent
                                        bind:currentCollaboratorPermissions={collaboratorPermissions} />
                                </div>
                            </div>
                        {/if}
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
</Portal>
