<script>
    import Portal from 'svelte-portal';
    import {sessionToken, userData} from 'store/stores.js';
    import {scale, slide} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import {onMount, onDestroy} from 'svelte';
    import {replaceUID} from 'utils/ApiMiddleware.js';
    import {PlusCircle, TrashSimple} from 'phosphor-svelte';
    import {getDataFromForm, waitForElementAndExecute, debounce} from 'utils/Functions';
    import {apiFetch} from 'utils/ApiMiddleware';
    import {canPerformAction} from 'utils/Permissions';
    import EditButton from 'components/buttons/EditButton.svelte';
    import DeleteButton from 'components/buttons/DeleteButton.svelte';
    import KtDatatable from 'components/tables/KTDatatable.svelte';
    import {toast} from 'svelte-sonner';
    import EditModal from './modals/EditModal.svelte';
    import SupplierDrawer from './SupplierDrawer.svelte';
    import NotesButton from 'components/buttons/NotesButton.svelte';

    sessionToken.useLocalStorage();
    userData.useLocalStorage();

    let datatable;
    let accountForm;
    let visibleMultiaction = false;
    let selectedCounter = 0;
    let showDrawer = false;
    let selectedSupplierId = null;

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
            message: 'Creazione Anagrafica...',
        });

        const url = __bakney.env.API.SUPPLIER.ADD;

        const res = await apiFetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        // spinner stop
        KTApp.unblockPage();

        if (res.status == 200 || res.status == 201) {
            datatable?.reload();
            document.getElementById('account_form').reset();

            toast.success('Anagrafica creata con successo.');
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

    function deleteSelected() {
        swal.fire({
            title: `Vuoi eliminare ${selectedCounter} anagrafiche?`,
            text: 'Le anagrafiche eliminate non potranno essere recuperate.',
            icon: 'question',
            buttonsStyling: true,
            showCancelButton: true,
            cancelButtonText: 'Annulla',
            confirmButtonText: 'Elimina selezionati',
            reverseButtons: true,
        }).then(function (result) {
            if (result.isConfirmed) {
                let records = jQuery('#kt_datatable').KTDatatable('getSelectedRecords').dataSet;
                let checkedNodes = datatable?.getSelectedRecords();
                let count = checkedNodes.length;
                if (count > 0) {
                    let supplier_ids = [];
                    for (let i = 0; i < count; i++) {
                        let id = checkedNodes[i].dataset.row;
                        supplier_ids.push(records[id].supplier_id);
                    }

                    KTApp.blockPage({
                        overlayColor: '#000000',
                        state: 'primary',
                    });

                    apiFetch(__bakney.env.API.SUPPLIER.BULK_DELETE, {
                        method: 'DELETE',
                        body: JSON.stringify({
                            supplier_ids: supplier_ids,
                        }),
                    }).then(res => {
                        KTApp.unblockPage();
                        if (res.status === 200) {
                            datatable?.reload();
                            visibleMultiaction = false;
                            toast.success('Anagrafiche eliminate con successo!');
                        } else {
                            toast.error("Si è verificato un errore durante l'eliminazione delle anagrafiche.");
                        }
                    });
                }
            }
        });
    }

    function initForm() {
        accountForm?.destroy();
        accountForm = FormValidation.formValidation(document.getElementById('account_form'), {
            fields: {
                name: {
                    validators: {
                        notEmpty: {
                            message: 'Il nome è obbligatorio.',
                        },
                        stringLength: {
                            max: 255,
                            message: 'Il nome non può superare i 255 caratteri.',
                        },
                    },
                },
                address: {
                    validators: {
                        stringLength: {
                            max: 255,
                            message: "L'indirizzo non può superare i 255 caratteri.",
                        },
                    },
                },
                tax_code: {
                    validators: {
                        stringLength: {
                            max: 30,
                            message: 'Il codice fiscale non può superare i 30 caratteri.',
                        },
                    },
                },
                vat_number: {
                    validators: {
                        stringLength: {
                            max: 30,
                            message: 'La partita IVA non può superare i 30 caratteri.',
                        },
                    },
                },
                type: {
                    validators: {
                        notEmpty: {
                            message: 'Seleziona una tipologia di Anagrafica.',
                        },
                        stringLength: {
                            max: 30,
                            message: 'Il tipo non può superare i 30 caratteri.',
                        },
                    },
                },
                email: {
                    validators: {
                        emailAddress: {
                            message: 'Inserisci un indirizzo email valido.',
                        },
                    },
                },
                phone_number: {
                    validators: {
                        stringLength: {
                            max: 20,
                            message: 'Il numero di telefono non può superare i 20 caratteri.',
                        },
                    },
                },
                city: {
                    validators: {
                        stringLength: {
                            max: 100,
                            message: 'La città non può superare i 100 caratteri.',
                        },
                    },
                },
                cap: {
                    validators: {
                        stringLength: {
                            max: 10,
                            message: 'Il CAP non può superare i 10 caratteri.',
                        },
                    },
                },
                state: {
                    validators: {
                        stringLength: {
                            max: 50,
                            message: 'La provincia non può superare i 50 caratteri.',
                        },
                    },
                },
                country: {
                    validators: {
                        stringLength: {
                            max: 50,
                            message: 'Il paese non può superare i 50 caratteri.',
                        },
                    },
                },
                nationality: {
                    validators: {
                        stringLength: {
                            max: 100,
                            message: 'La nazionalità non può superare i 100 caratteri.',
                        },
                    },
                },
                note: {
                    validators: {
                        stringLength: {
                            max: 1000,
                            message: 'Le note non possono superare i 1000 caratteri.',
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

    onMount(() => {
        localStorage.removeItem('kt_datatable-1-meta');
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
                        Fornitori e Clienti
                        <span class="d-block text-muted pt-2 font-size-sm"
                            >Contiene la lista completa delle anagrafiche dei fornitori e clienti.</span>
                    </h3>
                </div>
                <div class="card-toolbar">
                    {#if canPerformAction('bookeeping.management.suppliers.create')}
                        <!--begin::Button-->
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <button
                            on:click={() => {
                                let drawer = new SupplierDrawer({
                                    target: document.querySelector(`#drawer-elements`),
                                    intro: true,
                                    props: {
                                        title: 'Nuova anagrafica',
                                    },
                                });
                                drawer.$on('close', () => {
                                    datatable?.reload();
                                    setTimeout(() => {
                                        drawer.$destroy();
                                    }, 100);
                                });
                            }}
                            class="btn btn-sm btn-primary font-weight-bolder m-2 d-flex align-items-center">
                            <PlusCircle size={18} weight="duotone" />
                            <span class="ml-md-1 ml-0"><span class="d-none d-md-inline-block">Anagrafica</span></span>
                        </button>
                        <!--end::Button-->
                    {/if}
                </div>
            </div>
            <div class="card-body p-0">
                <KtDatatable
                    bind:datatable
                    bind:selectedCounter
                    bind:visibleMultiaction
                    showDividerFilter={false}
                    serverPaging={true}
                    serverFiltering={true}
                    showSearch={false}
                    serverSorting={true}
                    id="kt_datatable"
                    url={__bakney.env.API.SUPPLIER.LIST}
                    clicked={(td, obj) => {
                        let drawer = new SupplierDrawer({
                            target: document.querySelector(`#drawer-elements`),
                            intro: true,
                            props: {
                                supplierId: obj.supplier_id,
                                title: obj.name,
                                edit: true,
                            },
                        });
                        drawer.$on('close', () => {
                            datatable?.reload();
                        });
                    }}
                    columns={[
                        {
                            field: 'supplier_id',
                            title: '#',
                            sortable: false,
                            autoHide: false,
                            width: 20,
                            minWidth: '100%',
                            selector: {
                                class: '',
                            },
                            textAlign: 'center',
                        },
                        {
                            field: 'name',
                            title: 'Nome',
                            fireClick: true,
                            sortable: true,
                            width: 135,
                            autoHide: false,
                            template: function (row) {
                                return (
                                    '<p class="text-dark-75 font-weight-boldest mb-0 font-size-sm">' +
                                    String(row.name).toUpperCase() +
                                    '</p>'
                                );
                            },
                        },
                        {
                            field: 'email',
                            title: 'Email',
                            sortable: true,
                            fireClick: true,
                            responsive: {visible: 'lg'},
                            width: 200,
                            template: function (row) {
                                return (
                                    '<p class="text-dark-75 font-weight-boldest font-size-sm mb-0">' +
                                    String(row.email || '-').toUpperCase() +
                                    '</p>'
                                );
                            },
                        },
                        {
                            field: 'address',
                            title: 'Indirizzo',
                            sortable: true,
                            fireClick: true,
                            responsive: {visible: 'lg'},
                            // width: 150,
                            template: function (row) {
                                return (
                                    '<p class="text-dark-75 font-weight-boldest mb-0 font-size-sm">' +
                                    String(row.address || '-').toUpperCase() +
                                    '</p>'
                                );
                            },
                        },
                        {
                            field: 'tax_code',
                            title: 'P.IVA / C.F.',
                            sortable: true,
                            fireClick: true,
                            responsive: {visible: 'lg'},
                            width: 150,
                            template: function (row) {
                                return (
                                    '<p class="text-dark-75 font-weight-boldest font-size-sm mb-0">' +
                                    String(row.tax_code || '-').toUpperCase() +
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
                            width: 80,
                            minWidth: '100%',
                            template: function (row) {
                                waitForElementAndExecute(`#action-col-${row.supplier_id}`, () => {
                                    if (document.querySelector(`#action-col-${row.supplier_id}`))
                                        document.querySelector(`#action-col-${row.supplier_id}`).innerHTML = '';
                                    if (row.note) {
                                        let notesButton = new NotesButton({
                                            target: document.querySelector(`#action-col-${row.supplier_id}`),
                                            intro: true,
                                            props: {
                                                notes: row.note,
                                            },
                                        });
                                    }
                                    let deleteBtn = new DeleteButton({
                                        target: document.querySelector(`#action-col-${row.supplier_id}`),
                                        intro: true,
                                        props: {
                                            disabled: !canPerformAction('bookeeping.management.suppliers.delete'),
                                            // hidden: !row.editable,
                                        },
                                    });

                                    deleteBtn.$on('open', data => {
                                        swal.fire({
                                            text: "Vuoi eliminare l'anagrafica?",
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
                                                    replaceUID(__bakney.env.API.SUPPLIER.DELETE, row.supplier_id),
                                                    {
                                                        method: 'DELETE',
                                                    }
                                                );

                                                KTApp.unblockPage();

                                                if (!response.error) {
                                                    datatable?.reload();
                                                    toast.success('Anagrafica eliminata!');
                                                } else {
                                                    toast.error('Qualcosa è andato storto.');
                                                }
                                            }
                                        });
                                    });
                                });
                                return `<div id="action-col-${row.supplier_id}" class="action-column pr-4"></div>`;
                            },
                        },
                    ]}>
                    <div slot="search">
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
                    <div slot="multiactions">
                        {#if visibleMultiaction}
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <!-- svelte-ignore a11y-no-static-element-interactions -->
                            <div
                                in:slide={{duration: 100}}
                                class="d-flex align-items-center mb-5 mx-2"
                                id="kt_datatable_multiactions">
                                <div class="d-flex align-items-center">
                                    <div class="font-weight-boldest mr-3 font-size-sm text-dark-65">
                                        {selectedCounter} selezionati
                                    </div>
                                </div>
                                <!-- svelte-ignore a11y-click-events-have-key-events -->
                                <span
                                    on:click={deleteSelected}
                                    class="btn btn-sm py-1 px-3 btn-light-danger font-weight-bolder ml-2"
                                    style="margin:0;"
                                    type="button">
                                    <TrashSimple size={16} weight="bold" class="mr-0 mr-md-1" />
                                    <span class="d-none d-md-inline font-weight-boldest">Elimina</span>
                                </span>
                            </div>
                        {/if}
                    </div>
                </KtDatatable>
            </div>
        </div>
        <!--end::Card-->
    </div>
    <!--end::Container-->
</div>
<!--end::Entry-->
