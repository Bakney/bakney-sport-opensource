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
    import {canPerformAction} from 'utils/Permissions';
    import {toast} from 'svelte-sonner';
    import {SmartSelect} from 'components/formBuilder/preview-blocks';
    import {categoryTypes, deductionTypes, vatTypes} from './catgoryUtils';
    import BackButton from 'components/buttons/BackButton.svelte';

    sessionToken.useLocalStorage();

    let categoryForm;
    const enabledDictionary = {
        0: '',
        1: '<span class="label label-light label-inline font-weight-bolder label-lg">detraibile</span>',
    };

    const categoryDictionary = {
        0: '<span class="label label-light-success label-inline font-weight-bolder label-lg">entrata</span>',
        1: '<span class="label label-light-danger label-inline font-weight-bolder label-lg">uscita</span>',
    };

    let expense = false;

    async function create(data) {
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Creazione causale pagamento...',
        });

        data.tax_deductible = data.tax_deductible === 'on' ? true : false;

        data.vat_management = {
            vat: JSON.parse(data['vat_management.vat']).value,
            deduction: JSON.parse(data['vat_management.deduction']).value,
        };
        // remove unused fields
        delete data['vat_management.vat'];
        delete data['vat_management.deduction'];
        // update type
        data.type = JSON.parse(data['type']).value;

        const url = __bakney.env.API.PAYMENT.CATEGORY.ADD;

        const res = await apiFetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        // spinner stop
        KTApp.unblockPage();

        if (res.status == 200) {
            ktdatable.reload();
            document.getElementById('payment_form').reset();

            toast.success('Causale pagamento creata con successo.');
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
                        url: __bakney.env.API.PAYMENT.CATEGORY.LIST,
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
                    width: 220,
                    minWidth: '100%',
                    template: function (row) {
                        return (
                            '<p class="text-dark-75 font-weight-bolder mb-0">' + String(row.name).toUpperCase() + '</p>'
                        );
                    },
                },
                {
                    field: 'expense',
                    title: 'Movimento',
                    sortable: true,
                    width: 90,
                    minWidth: '100%',
                    template: function (row) {
                        return categoryDictionary[row.expense ? 1 : 0];
                    },
                },
                {
                    field: 'tax_deductible',
                    title: 'Informazioni fiscali',
                    sortable: true,
                    minWidth: '100%',
                    template: function (row) {
                        return (
                            '<div class="d-flex" style="gap: .5rem;">' +
                            `<span class="label label-light-${
                                row.type === 1 ? 'success' : 'warning'
                            } label-inline font-weight-bolder label-lg">${
                                categoryTypes.find(type => type.value === row.type)?.label
                            }</span>` +
                            enabledDictionary[row.tax_deductible ? 1 : 0] +
                            (row.vat_management
                                ? `<span class="label label-light label-inline font-weight-bolder label-lg">${
                                      vatTypes.find(vatType => vatType.value === row.vat_management?.vat)?.label
                                  }</span>` +
                                  `<span class="label label-light label-inline font-weight-bolder label-lg">tipo detrazione: ${
                                      deductionTypes.find(type => type.value === row.vat_management?.deduction)?.label
                                  }</span>`
                                : '') +
                            '</div>'
                        );
                    },
                },
                {
                    field: '',
                    title: '',
                    sortable: false,
                    textAlign: 'right',
                    autoHide: false,
                    width: 80,
                    minWidth: '100%',
                    template: function (row) {
                        waitForElementAndExecute(`#action-col-${row.payment_category_id}`, () => {
                            if (document.querySelector(`#action-col-${row.payment_category_id}`))
                                document.querySelector(`#action-col-${row.payment_category_id}`).innerHTML = '';

                            if (row.deleted) {
                                // add 'eliminata' text with class 'text-danger'
                                document.querySelector(`#action-col-${row.payment_category_id}`).innerHTML =
                                    '<span class="text-danger">Eliminata</span>';
                            } else {
                                let editBtn = new EditButton({
                                    target: document.querySelector(`#action-col-${row.payment_category_id}`),
                                    intro: true,
                                    props: {
                                        disabled:
                                            !row.sport_association || !canPerformAction('bookeeping.payments.update'),
                                        hidden: !row.sport_association,
                                    },
                                });

                                let editModal = new EditModal({
                                    target: document.querySelector(`#action-col-${row.payment_category_id}`),
                                    intro: true,
                                    props: {
                                        id: row.payment_category_id,
                                        row: row,
                                        ktdatable: ktdatable,
                                    },
                                });

                                editBtn.$on('open', data => {
                                    jQuery(`#editAccountModal-${row.payment_category_id}`).modal('show');
                                });
                                let deleteBtn = new DeleteButton({
                                    target: document.querySelector(`#action-col-${row.payment_category_id}`),
                                    intro: true,
                                    props: {
                                        disabled:
                                            !row.sport_association || !canPerformAction('bookeeping.payments.delete'),
                                        hidden: !row.sport_association,
                                    },
                                });

                                deleteBtn.$on('open', data => {
                                    swal.fire({
                                        text: 'Vuoi eliminare la causale di pagamento?',
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
                                                    __bakney.env.API.PAYMENT.CATEGORY.DELETE,
                                                    row.payment_category_id
                                                ),
                                                {
                                                    method: 'DELETE',
                                                }
                                            );

                                            KTApp.unblockPage();

                                            if (!response.error) {
                                                ktdatable.reload();
                                                toast.success('Causale eliminata!');
                                            } else {
                                                toast.error('Qualcosa è andato storto.');
                                            }
                                        }
                                    });
                                });
                            }
                        });
                        return `<div id="action-col-${row.payment_category_id}" class="action-column pr-4">sfds</div>`;
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
        jQuery('#expense').selectpicker();
    });

    onDestroy(() => {
        document.querySelectorAll('.popover').forEach(popover => popover.remove());
    });

    function initForm() {
        categoryForm?.destroy();
        categoryForm = FormValidation.formValidation(document.getElementById('payment_form'), {
            fields: {
                name: {
                    validators: {
                        notEmpty: {
                            message: 'Il nome è obbligatorio.',
                        },
                    },
                },
                expense: {
                    validators: {
                        notEmpty: {
                            message: 'Seleziona una tipologia.',
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
        if (!categoryForm) initForm();
        categoryForm?.validate().then(function (status) {
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
    <div class="container container-overlay">
        <!--begin::Notice-->

        <!--begin::Card-->
        <div class="card card-custom gutter-b">
            <div class="card-header flex-wrap border-0 p-0">
                <div class="card-toolbar d-flex gap-4" style="gap: .5rem;">
                    <BackButton />
                </div>
                <div class="card-title">
                    <h3 class="card-label font-size-h2">
                        Causali dei pagamenti
                        <!-- <span class="d-block text-muted pt-2 font-size-sm">
                            In questa sezione sono presenti le causali dei pagamenti.
                        </span> -->
                    </h3>
                </div>
                <div class="card-toolbar">
                    {#if canPerformAction('bookeeping.payments.create')}
                        <!--begin::Button-->
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <span
                            data-toggle="modal"
                            data-target="#addAccountModal"
                            class="btn btn-sm btn-primary font-weight-bolder m-2">
                            <Plus size={18} weight="duotone" /> <span class="ml-1">Crea causale</span>
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
    <form class="form" id="payment_form" on:submit|preventDefault={handleValidation}>
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
                        <h5 class="modal-title" id="exampleModalLabel">Crea una causale</h5>
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
                                    placeholder="Nome" />
                                <!-- <span class="form-text text-muted">Per favore inserisci il nome.</span> -->
                            </div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Movimento<b>*</b></label>
                                <select
                                    bind:value={expense}
                                    name="expense"
                                    class="form-control selectpicker form-control-solid form-control-lg"
                                    id="expense">
                                    <option value={false} data-icon="la la-arrow-up font-size-lg bs-icon"
                                        >Entrata</option>
                                    <option value={true} data-icon="la la-arrow-down font-size-lg bs-icon"
                                        >Uscita</option>
                                </select>
                                <!-- <span class="form-text text-muted">Per favore inserisci il sesso.</span> -->
                            </div>
                            <div class="form-group {expense ? 'd-none' : ''}">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Detraibile fiscalmente<b>*</b></label>
                                <span class="switch switch-sm switch-icon">
                                    <label>
                                        <input name="tax_deductible" type="checkbox" />
                                        <span />
                                    </label>
                                </span>
                                <div class="d-flex justify-content-start align-items-center mt-2">
                                    <small class="text-muted font-size-sm lh-xs">
                                        Tutti i pagamenti con questa causale saranno segnati come detraibili. L'atleta
                                        potrà produrre un documento fiscale per la dichiarazione del 730.
                                    </small>
                                </div>
                            </div>
                            <div class="form-group">
                                <SmartSelect
                                    customClasses={'p-0'}
                                    editable={false}
                                    active={false}
                                    props={{
                                        id: 'type',
                                        name: 'type',
                                        label: 'Tipologia',
                                        placeholder: 'Seleziona tipologia',
                                        required: true,
                                        options: categoryTypes,
                                        value: 1,
                                    }} />
                            </div>
                            <hr />
                            <div class="row px-4 mb-4">
                                <h4 class="text-center font-weight-boldest font-size-h4">Gestione IVA</h4>
                            </div>
                            <div class="form-group d-flex" style="gap: 1rem;">
                                <SmartSelect
                                    customClasses={'w-100'}
                                    editable={false}
                                    active={false}
                                    props={{
                                        id: 'vat_management.vat',
                                        name: 'vat_management.vat',
                                        label: 'Tipo IVA',
                                        placeholder: 'Seleziona tipo IVA',
                                        required: true,
                                        options: vatTypes,
                                        value: 1,
                                    }} />
                                <SmartSelect
                                    customClasses={'w-100'}
                                    editable={false}
                                    active={false}
                                    props={{
                                        id: 'vat_management.deduction',
                                        name: 'vat_management.deduction',
                                        label: 'Tipo detrazione',
                                        placeholder: 'Seleziona tipo detrazione',
                                        required: true,
                                        options: deductionTypes,
                                        value: 0,
                                    }} />
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
