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
    import DeleteButton from 'components/buttons/DeleteButton.svelte';
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
            icon: 'la la-bank font-weight-bolder text-dark-75 mr-2',
            text: 'Banca',
        },
        3: {
            icon: 'la la-money-bill font-weight-bolder text-dark-75 mr-2',
            text: 'Altro',
        },
    };
    const enabledDictionary = {
        0: '<span class="label label-light-danger label-inline font-weight-bolder label-lg">Disabilitato</span>',
        1: '<span class="label label-light-success label-inline font-weight-bolder label-lg">Attivo</span>',
    };

    let accounts = null;
    let customAccountFrom = '';
    let customAccountTo = '';

    async function create(data) {
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Creazione conto...',
        });

        data.amount = parseFloat(data.amount.replace(',', '.'));

        const url = __bakney.env.API.BALANCE_SHEET_ACCOUNTS_TRANSFER.ADD;

        const res = await apiFetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        // spinner stop
        KTApp.unblockPage();

        if (res.status == 200) {
            ktdatable.reload();
            resetForm();

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
                        url: __bakney.env.API.BALANCE_SHEET_ACCOUNTS_TRANSFER.LIST,
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
                    field: 'amount',
                    title: 'Importo',
                    sortable: true,
                    width: 120,
                    autoHide: false,
                    template: function (row) {
                        return (
                            '<p class="text-dark-75 font-weight-bolder mb-0">' +
                            parseFloat(row.amount).toLocaleString('it-IT', {
                                style: 'currency',
                                currency: 'EUR',
                                minimumFractionDigits: 2,
                            }) +
                            '</p>'
                        );
                    },
                },
                {
                    field: 'date',
                    title: 'Data',
                    width: 90,
                    type: 'date',
                    responsive: {
                        visible: 'lg',
                        hidden: 'md',
                    },
                    sortCallback: function (data, sort, column) {
                        let dataArray = Object.values(data);
                        dataArray.sort(function (a, b) {
                            let timeA = new Date(a['date']).getTime();
                            let timeB = new Date(b['date']).getTime();
                            if (sort === 'asc') {
                                return parseFloat(timeA) > parseFloat(timeB)
                                    ? 1
                                    : parseFloat(timeA) < parseFloat(timeB)
                                    ? -1
                                    : 0;
                            } else {
                                return parseFloat(timeA) < parseFloat(timeB)
                                    ? 1
                                    : parseFloat(timeA) > parseFloat(timeB)
                                    ? -1
                                    : 0;
                            }
                        });
                        let newData = {};
                        for (let i = 0; i < dataArray.length; i++) {
                            newData[i] = dataArray[i];
                        }

                        return newData;
                    },
                    template: function (row) {
                        return moment(new Date(row.date)).format('DD/MM/YYYY');
                    },
                },
                {
                    field: 'custom_account_from.name',
                    title: 'Dal conto',
                    sortable: true,
                    width: 150,
                    template: function (row) {
                        return (
                            '<p class="text-dark-50 font-weight-bolder mb-0">' +
                            String(row.custom_account_from.name).toUpperCase() +
                            '</p>'
                        );
                    },
                },
                {
                    field: 'custom_account_to.name',
                    title: 'Al conto',
                    sortable: true,
                    width: 150,
                    template: function (row) {
                        return (
                            '<p class="text-dark-50 font-weight-bolder mb-0">' +
                            String(row.custom_account_to.name).toUpperCase() +
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
                        waitForElementAndExecute(`#action-col-${row.custom_account_transfer_id}`, () => {
                            if (document.querySelector(`#action-col-${row.custom_account_transfer_id}`))
                                document.querySelector(`#action-col-${row.custom_account_transfer_id}`).innerHTML = '';
                            let deleteBtn = new DeleteButton({
                                target: document.querySelector(`#action-col-${row.custom_account_transfer_id}`),
                                intro: true,
                                props: {
                                    disabled: !canPerformAction('bookeeping.management.accountstransfers.delete'),
                                },
                            });

                            deleteBtn.$on('open', data => {
                                swal.fire({
                                    text: 'Vuoi eliminare il giroconto?',
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
                                                __bakney.env.API.BALANCE_SHEET_ACCOUNTS_TRANSFER.DELETE,
                                                row.custom_account_transfer_id
                                            ),
                                            {
                                                method: 'DELETE',
                                            }
                                        );

                                        KTApp.unblockPage();

                                        if (!response.error) {
                                            ktdatable.reload();
                                            toast.success('Giroconto eliminato!');
                                        } else {
                                            toast.error('Qualcosa è andato storto.');
                                        }
                                    }
                                });
                            });
                        });
                        return `<div id="action-col-${row.custom_account_transfer_id}" class="action-column pr-4"></div>`;
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

    async function fetchCustomAccounts() {
        const res = await apiFetch(__bakney.env.API.BALANCE_SHEET_ACCOUNTS.LIST, {
            method: 'GET',
        });
        if (!res.error) {
            accounts = res?.response?.data || [];
        } else {
            toast.error('Qualcosa è andato storto.');
        }
        return;
    }

    onMount(() => {
        jQuery(document).ready(() => {
            localStorage.removeItem('kt_datatable-1-meta');
            ktdatable.init();
            fetchCustomAccounts();
            jQuery('body').tooltip({selector: '[data-toggle=tooltip]', trigger: 'hover'});
            jQuery('body').popover({selector: '[data-toggle=popover]', trigger: 'hover'});
            setTimeout(() => {
                jQuery('#custom_account_to').selectpicker();
                jQuery('#custom_account_from').selectpicker();
            }, 200);
            jQuery('#amount').inputmask('9{1,9},9{2}', {
                greedy: false,
                placeholder: '0',
                rightAlign: true,
            });
            jQuery('#banktransfer_date').datetimepicker({
                format: 'L',
                locale: 'it',
                format: 'YYYY-MM-DD',
                useCurrent: true, // workaround the bug that maxDate overwrites defaultDate
                defaultDate: moment(),
            });
        });
    });

    onDestroy(() => {
        document.querySelectorAll('.popover').forEach(popover => popover.remove());
    });

    function resetForm() {
        document.getElementById('account_form').elements['amount'].value = '';
        document.getElementById('account_form').elements['date'].value = moment().format('YYYY-MM-DD');
        document.getElementById('account_form').elements['custom_account_from'].value = '';
        document.getElementById('account_form').elements['custom_account_to'].value = '';

        jQuery('#custom_account_to').selectpicker('refresh');
        jQuery('#custom_account_from').selectpicker('refresh');
    }

    function initForm() {
        accountForm?.destroy();
        accountForm = FormValidation.formValidation(document.getElementById('account_form'), {
            fields: {
                date: {
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
                custom_account_from: {
                    validators: {
                        notEmpty: {
                            message: 'Seleziona un conto.',
                        },
                        callback: {
                            message: 'Deve essere un conto presente nella sezione conti.',
                            callback: function (input) {
                                return accounts.some(account => account.custom_account_id === input.value);
                            },
                        },
                    },
                },
                custom_account_to: {
                    validators: {
                        notEmpty: {
                            message: 'Seleziona un conto.',
                        },
                        callback: {
                            message: 'Deve essere un conto presente nella sezione conti.',
                            callback: function (input) {
                                return accounts.some(account => account.custom_account_id === input.value);
                            },
                        },
                    },
                },
                amount: {
                    validators: {
                        notEmpty: {
                            message: 'Seleziona un importo valido.',
                        },
                        regexp: {
                            regexp: '^[0-9]{1,9},[0-9]{2}$',
                            flags: 'ig',
                            message: "L'importo deve essere > 0.",
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
                jQuery('#addAccountModal').modal('hide');
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
                        Giroconti
                        <span class="d-block text-muted pt-2 font-size-sm"
                            >Contiene una lista di transanzioni tra un conto ed un altro.</span>
                    </h3>
                </div>
                <div class="card-toolbar">
                    <!--begin::Button-->
                    {#if canPerformAction('bookeeping.management.accountstransfers.create')}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                        <span
                            data-toggle="modal"
                            data-target="#addAccountModal"
                            on:click={() => {
                                resetForm();
                            }}
                            class="btn btn-sm btn-primary font-weight-bolder m-2">
                            <Plus size={18} weight="duotone" />
                            <span class="ml-0 ml-md-1"><span class="d-none d-md-inline-block">Giroconto</span></span>
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
<Portal>
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
                        <h5 class="modal-title" id="exampleModalLabel">Nuovo giroconto</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <i aria-hidden="true" class="ki ki-close" />
                        </button>
                    </div>
                    <div class="modal-body" style="overflow: visible;">
                        <div>
                            <div class="form-group" style="position:relative;z-index:10000">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Data giroconto<b>*</b></label>
                                <div
                                    class="input-group input-group-solid date"
                                    id="banktransfer_date"
                                    data-target-input="nearest">
                                    <input
                                        id="date_banktransfer"
                                        name="date"
                                        type="text"
                                        class="form-control form-control-solid form-control-lg datetimepicker-input"
                                        placeholder="Seleziona Data"
                                        data-target="#banktransfer_date" />
                                    <div
                                        class="input-group-append"
                                        data-target="#banktransfer_date"
                                        data-toggle="datetimepicker">
                                        <span class="input-group-text">
                                            <i class="ki ki-calendar" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Dal conto<b>*</b></label>
                                {#if accounts}
                                    <select
                                        bind:value={customAccountFrom}
                                        on:change={() => {
                                            setTimeout(() => jQuery('#custom_account_to').selectpicker('refresh'), 500);
                                        }}
                                        name="custom_account_from"
                                        class="form-control selectpicker form-control-solid form-control-lg"
                                        id="custom_account_from">
                                        <option value=""> Seleziona un conto </option>
                                        {#each Array.from(accounts || [])?.filter(x => x.custom_account_id != customAccountTo) as account}
                                            <option value={account.custom_account_id}>
                                                {account.name}
                                            </option>
                                        {/each}
                                    </select>
                                {/if}
                            </div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Al conto<b>*</b></label>
                                {#if accounts}
                                    <select
                                        bind:value={customAccountTo}
                                        on:change={() => {
                                            setTimeout(
                                                () => jQuery('#custom_account_from').selectpicker('refresh'),
                                                500
                                            );
                                        }}
                                        name="custom_account_to"
                                        class="form-control selectpicker form-control-solid form-control-lg"
                                        id="custom_account_to">
                                        <option value=""> Seleziona un conto </option>
                                        {#each Array.from(accounts || [])?.filter(x => x.custom_account_id != customAccountFrom) as account}
                                            <option value={account.custom_account_id}>
                                                {account.name}
                                            </option>
                                        {/each}
                                    </select>
                                {/if}
                            </div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Importo<b>*</b></label>
                                <div class="input-group input-group-solid">
                                    <div class="input-group-prepend">
                                        <span class="input-group-text fs-1-1">€</span>
                                    </div>
                                    <input
                                        name="amount"
                                        type="text"
                                        class="form-control fs-1-1"
                                        id="amount"
                                        placeholder="0,00" />
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
</Portal>
