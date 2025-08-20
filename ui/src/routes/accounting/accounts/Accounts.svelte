<script>
    import Portal from 'svelte-portal';
    import {sessionToken} from 'store/stores.js';
    import {scale} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import {onMount, onDestroy} from 'svelte';
    import {replaceUID} from 'utils/ApiMiddleware.js';
    import {PlusCircle} from 'phosphor-svelte';
    import {getDataFromForm, waitForElementAndExecute} from 'utils/Functions';
    import {apiFetch} from 'utils/ApiMiddleware';
    import EditButton from 'components/buttons/EditButton.svelte';
    import DeleteButton from 'components/buttons/DeleteButton.svelte';
    import EditModal from './modals/EditModal.svelte';
    import {canPerformAction} from 'utils/Permissions';
    import {toast} from 'svelte-sonner';

    sessionToken.useLocalStorage();

    let accountForm;
    let accountTypeMap = {
        1: {
            icon: 'font-weight-bolder text-dark-75 mr-2',
            text: 'Cassa',
        },
        2: {
            icon: 'font-weight-bolder text-dark-75 mr-2',
            text: 'Banca',
        },
        3: {
            icon: 'font-weight-bolder text-dark-75 mr-2',
            text: 'Altro',
        },
    };
    const enabledDictionary = {
        0: '<span class="label label-light-danger label-inline font-weight-bolder label-lg">Disabilitato</span>',
        1: '<span class="label label-light-success label-inline font-weight-bolder label-lg">Attivo</span>',
    };

    async function create(data) {
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Creazione conto...',
        });

        data.initial_balance = parseFloat(data.initial_balance.replace(',', '.'));

        const url = __bakney.env.API.BALANCE_SHEET_ACCOUNTS.ADD;

        const res = await apiFetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        // spinner stop
        KTApp.unblockPage();

        if (res.status == 200) {
            ktdatable.reload();
            document.getElementById('account_form').reset();

            toast.success('Conto creato con successo.');
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
                        url: __bakney.env.API.BALANCE_SHEET_ACCOUNTS.LIST,
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
                    width: 150,
                    autoHide: false,
                    template: function (row) {
                        return (
                            '<p class="text-dark-75 font-weight-bolder mb-0">' + String(row.name).toUpperCase() + '</p>'
                        );
                    },
                },
                {
                    field: 'account_type',
                    title: 'Tipo',
                    sortable: true,
                    responsive: {visible: 'xl'},
                    width: 100,
                    template: function (row) {
                        return (
                            `<p class="text-dark-75 font-weight-bolder mb-0"><i class="${
                                accountTypeMap[row.account_type].icon
                            }"></i>` +
                            String(accountTypeMap[row.account_type].text).toUpperCase() +
                            '</p>'
                        );
                    },
                },
                {
                    field: 'current_balance',
                    title: 'Saldo attuale',
                    sortable: true,
                    width: 120,
                    responsive: {visible: 'lg'},
                    template: function (row) {
                        return (
                            '<p class="font-weight-bolder mb-0 ' +
                            (parseFloat(row.current_balance) < 0 ? ' text-danger' : 'text-success') +
                            '">' +
                            parseFloat(row.current_balance).toLocaleString('it-IT', {
                                style: 'currency',
                                currency: 'EUR',
                                minimumFractionDigits: 2,
                            }) +
                            '</p>'
                        );
                    },
                },
                {
                    field: 'initial_balance',
                    title: 'Saldo iniziale',
                    sortable: true,
                    width: 120,
                    responsive: {visible: 'lg'},
                    template: function (row) {
                        return (
                            '<p class="text-dark-75 font-weight-bolder mb-0">' +
                            parseFloat(row.initial_balance).toLocaleString('it-IT', {
                                style: 'currency',
                                currency: 'EUR',
                                minimumFractionDigits: 2,
                            }) +
                            '</p>'
                        );
                    },
                },
                {
                    field: 'enabled',
                    title: 'Stato',
                    sortable: true,
                    responsive: {visible: 'lg'},
                    width: 90,
                    template: function (row) {
                        return enabledDictionary[row.enabled ? 1 : 0];
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
                        waitForElementAndExecute(`#action-col-${row.custom_account_id}`, () => {
                            if (document.querySelector(`#action-col-${row.custom_account_id}`))
                                document.querySelector(`#action-col-${row.custom_account_id}`).innerHTML = '';
                            let editBtn = new EditButton({
                                target: document.querySelector(`#action-col-${row.custom_account_id}`),
                                intro: true,
                                props: {
                                    disabled: !canPerformAction('bookeeping.management.accounts.update'),
                                    // hidden: !row.editable,
                                },
                            });

                            document.querySelector(`#editAccountModal-${row.custom_account_id}`)?.remove();

                            let editModal = new EditModal({
                                target: document.querySelector(`#action-col-${row.custom_account_id}`),
                                intro: true,
                                props: {
                                    id: row.custom_account_id,
                                    row: row,
                                    ktdatable: ktdatable,
                                },
                            });

                            editBtn.$on('open', data => {
                                jQuery(`#editAccountModal-${row.custom_account_id}`).modal('show');
                            });
                            let deleteBtn = new DeleteButton({
                                target: document.querySelector(`#action-col-${row.custom_account_id}`),
                                intro: true,
                                props: {
                                    disabled:
                                        !row.deletable || !canPerformAction('bookeeping.management.accounts.delete'),
                                    // hidden: !row.editable,
                                },
                            });

                            deleteBtn.$on('open', data => {
                                swal.fire({
                                    text: 'Vuoi eliminare il conto?',
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
                                                __bakney.env.API.BALANCE_SHEET_ACCOUNTS.DELETE,
                                                row.custom_account_id
                                            ),
                                            {
                                                method: 'DELETE',
                                            }
                                        );

                                        KTApp.unblockPage();

                                        if (!response.error) {
                                            ktdatable.reload();
                                            toast.success('Conto eliminato!');
                                        } else {
                                            toast.error('Qualcosa è andato storto.');
                                        }
                                    }
                                });
                            });
                        });
                        return `<div id="action-col-${row.custom_account_id}" class="action-column pr-4"></div>`;
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
        jQuery('#initial_balance').inputmask('[-]9{1,9},9{2}', {
            greedy: false,
            placeholder: '0',
            rightAlign: true,
            inputMode: 'decimal',
            definitions: {
                '-': {
                    validator: '[+-]',
                },
            },
        });
    });

    onDestroy(() => {
        document.querySelectorAll('.popover').forEach(popover => popover.remove());
    });

    function initForm() {
        accountForm?.destroy();
        accountForm = FormValidation.formValidation(document.getElementById('account_form'), {
            fields: {
                name: {
                    validators: {
                        notEmpty: {
                            message: 'Il nome è obbligatorio.',
                        },
                    },
                },
                account_type: {
                    validators: {
                        notEmpty: {
                            message: 'Seleziona una tipologia di conto.',
                        },
                    },
                },
                initial_balance: {
                    validators: {
                        notEmpty: {
                            message: 'Seleziona un bilancio iniziale valido.',
                        },
                    },
                },
                account_code: {
                    validators: {
                        notEmpty: {
                            message: 'Seleziona un bilancio iniziale valido.',
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
        if (!accountForm) initForm();
        accountForm?.validate().then(function (status) {
            if (status === 'Valid') {
                create(getDataFromForm(e));
                jQuery('#addAccountModal').modal('hide');
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
                        Conti finanziari
                        <span class="d-block text-muted pt-2 font-size-sm">Contiene la lista completa dei conti.</span>
                    </h3>
                </div>
                <div class="card-toolbar">
                    {#if canPerformAction('bookeeping.management.accounts.create')}
                        <!--begin::Button-->
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <span
                            data-toggle="modal"
                            data-target="#addAccountModal"
                            class="btn btn-sm btn-primary font-weight-bolder m-2 d-flex align-items-center">
                            <PlusCircle size={18} weight="duotone" />
                            <span class="ml-md-1 ml-0"><span class="d-none d-md-inline-block">Conto</span></span>
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
    <form class="form" id="account_form" on:submit|preventDefault={handleValidation}>
        <div
            class="modal fade"
            id="addAccountModal"
            tabindex="-1"
            role="dialog"
            aria-labelledby="staticBackdrop"
            aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Creazione di un conto economico</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <i aria-hidden="true" class="ki ki-close" />
                        </button>
                    </div>
                    <div class="modal-body">
                        <div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Nome<b>*</b></label>
                                <input
                                    name="name"
                                    type="text"
                                    class="form-control form-control-solid form-control-lg margin-t-2"
                                    placeholder="Nome"
                                    style="text-transform:capitalize" />
                                <!-- <span class="form-text text-muted">Per favore inserisci il nome.</span> -->
                            </div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Tipologia<b>*</b></label>
                                <select
                                    name="account_type"
                                    class="form-control selectpicker form-control-solid form-control-lg"
                                    id="account_type">
                                    <option value={1} data-icon="la la-wallet font-size-lg bs-icon">Cassa</option>
                                    <option value={2} data-icon="la la-bank font-size-lg bs-icon">Banca</option>
                                    <option value={3} data-icon="la la-money-bill font-size-lg bs-icon">Altro</option>
                                </select>
                                <!-- <span class="form-text text-muted">Per favore inserisci il sesso.</span> -->
                            </div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Saldo Iniziale<b>*</b></label>
                                <div class="input-group input-group-solid">
                                    <div class="input-group-prepend">
                                        <span class="input-group-text fs-1-1">€</span>
                                    </div>
                                    <input
                                        name="initial_balance"
                                        type="text"
                                        class="form-control fs-1-1"
                                        id="initial_balance"
                                        placeholder="0,00" />
                                </div>
                            </div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Codice<b>*</b></label>
                                <input
                                    name="account_code"
                                    type="text"
                                    class="form-control form-control-solid form-control-lg margin-t-2"
                                    placeholder="Codice"
                                    style="text-transform:uppercase" />
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
</Portal>
