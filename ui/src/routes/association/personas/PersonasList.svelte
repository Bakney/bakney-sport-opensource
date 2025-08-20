<script>
    import {sessionToken, userData} from 'store/stores.js';
    import {scale, slide} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import {onDestroy} from 'svelte';
    import {replaceUID} from 'utils/ApiMiddleware.js';
    import {PlusCircle, TrashSimple, XCircle as XCircleIcon} from 'phosphor-svelte';
    import {debounce, waitForElementAndExecute} from 'utils/Functions';
    import {apiFetch} from 'utils/ApiMiddleware';
    import {canPerformAction} from 'utils/Permissions';
    import DeleteButton from 'components/buttons/DeleteButton.svelte';
    import KtDatatable from 'components/tables/KTDatatable.svelte';
    import {toast} from 'svelte-sonner';
    import PersonaDrawer from './detail/PersonaDrawer.svelte';
    import {SmartSelect} from 'components/formBuilder/preview-blocks';
    import {personasListFilter, personasListFilterDatatable} from 'store/stores.js';
    import AddPersonaDrawer from './detail/AddPersonaDrawer.svelte';
    import NotesButton from 'components/buttons/NotesButton.svelte';
    sessionToken.useLocalStorage();
    userData.useLocalStorage();

    let datatable;
    let visibleMultiaction = false;
    let selectedCounter = 0;

    function deleteSelected() {
        swal.fire({
            title: `Vuoi eliminare ${selectedCounter} anagrafiche?`,
            text: 'Le anagrafiche eliminate non potranno essere recuperate.',
            icon: 'question',
            buttonsStyling: true,
            showCancelButton: true,
            cancelButtonText: 'Annulla',
            confirmButtonText: 'Elimina selezionate',
            reverseButtons: true,
        }).then(function (result) {
            if (result.isConfirmed) {
                let records = jQuery('#kt_datatable_personas').KTDatatable('getSelectedRecords').dataSet;
                let checkedNodes = datatable?.getSelectedRecords();
                let count = checkedNodes.length;
                if (count > 0) {
                    let associate_ids = [];
                    for (let i = 0; i < count; i++) {
                        let id = checkedNodes[i].dataset.row;
                        associate_ids.push(records[id].associate_id);
                    }

                    KTApp.blockPage({
                        overlayColor: '#000000',
                        state: 'primary',
                    });

                    apiFetch(__bakney.env.API.PERSONAS.BULK_DELETE, {
                        method: 'DELETE',
                        body: JSON.stringify({
                            associate_ids: associate_ids,
                        }),
                    }).then(res => {
                        KTApp.unblockPage();
                        if (res.status == 200 || res.status == 204) {
                            toast.success(`${selectedCounter} anagrafiche eliminate.`);
                            datatable?.reload();
                        }
                        visibleMultiaction = false;
                        datatable?.reload();
                    });
                }
            }
        });
    }

    onDestroy(() => {
        document.querySelectorAll('.popover').forEach(popover => popover.remove());
        // reset filter
        $personasListFilter.is_tutor = '';
        $personasListFilter.generalSearch = '';
    });
</script>

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
                        Anagrafiche
                        <span class="d-block text-muted pt-2 font-size-sm"
                            >Lista di tutte le anagrafiche di atleti e tutori/genitori.</span>
                    </h3>
                </div>
                <div class="card-toolbar">
                    {#if canPerformAction('association.personas.create')}
                        <button
                            on:click={() => {
                                let addPersonaDrawer = new AddPersonaDrawer({
                                    target: document.querySelector(`#drawer-elements`),
                                    intro: true,
                                    props: {
                                        title: 'Aggiungi Anagrafica',
                                    },
                                });

                                addPersonaDrawer.$on('close', () => {
                                    addPersonaDrawer.$destroy();
                                    datatable?.reload();
                                });
                            }}
                            class="btn btn-sm btn-primary font-weight-bolder m-2 d-flex align-items-center">
                            <PlusCircle size={18} weight="duotone" />
                            <span class="ml-0 ml-md-1"><span class="d-none d-md-inline-block">Anagrafica</span></span>
                        </button>
                    {/if}
                </div>
            </div>
            <div class="card-body p-0">
                <KtDatatable
                    id="kt_datatable_personas"
                    bind:visibleMultiaction
                    bind:selectedCounter
                    bind:datatable
                    columns={[
                        {
                            field: 'associate_id',
                            title: '#',
                            sortable: false,
                            autoHide: false,
                            width: KTUtil.isMobileDevice() ? 15 : 5,
                            minWidth: '100%',
                            selector: {
                                class: '',
                            },
                            textAlign: 'center',
                        },
                        {
                            field: 'picture_path',
                            title: '',
                            sortable: false,
                            autoHide: false,
                            fireClick: true,
                            width: KTUtil.isMobileDevice() ? 28 : 8,
                            textAlign: 'left',
                            minWidth: '100%',
                            template: row => {
                                if (!row.picture_path) {
                                    return '<div class="symbol symbol-30 symbol-light"><span class="symbol-label font-size-h5 rounded-circle"><i class="fa fa-user fa-bold text-light-dark"></i></span></div>';
                                }
                                return `<div class="d-flex justify-content-start"><div class="symbol symbol-30 rounded-circle overflow-hidden border border-secondary shadow-xs"><img src="${row.picture_path}" style="object-fit: cover !important;" alt=""/></div></div>`;
                            },
                        },
                        {
                            field: 'last_name',
                            title: 'Nome e Cognome',
                            sortable: true,
                            autoHide: false,
                            fireClick: true,
                            width: 200,
                            minWidth: '100%',
                            textAlign: 'left',
                            template: row => {
                                return (
                                    '<div style="line-height: 1.1">' +
                                    `<span class="navi-text font-weight-bolder text-primary font-size-md">` +
                                    capitalizeWords(row.last_name) +
                                    ' ' +
                                    capitalizeWords(row.first_name) +
                                    '</span>' +
                                    '<br><span class="font-size-xs text-dark-65">' +
                                    (row.is_tutor ? 'Atleta e/o Tutore' : 'Atleta') +
                                    '</span></div>'
                                );
                            },
                        },
                        {
                            field: 'tutors',
                            title: 'Tutori',
                            sortable: true,
                            autoHide: false,
                            fireClick: true,
                            autoHide: false,
                            responsive: {
                                visible: 'lg',
                                hidden: 'md',
                            },
                            minWidth: '100%',
                            template: function (row) {
                                if (!row.tutors || row.tutors.length === 0)
                                    return '<span class="label label-light label-inline font-weight-bolder label-lg">nessun tutore</span>';
                                return (
                                    '<div class="d-flex align-items-center mb-2 font-size-sm" style="line-height: 1.1; gap: 0.3rem;">' +
                                    row.tutors
                                        .map(t => {
                                            return `<span class="label label-light-primary label-inline font-weight-bolder label-lg">${
                                                t?.tutor?.first_name || '-'
                                            } ${t?.tutor?.last_name || '-'}</span>`;
                                        })
                                        .join(' ') +
                                    '</div>'
                                );
                            },
                        },
                        {
                            field: 'age',
                            title: 'Età',
                            sortable: true,
                            autoHide: false,
                            textAlign: 'right',
                            fireClick: true,
                            minWidth: '100%',
                            autoHide: false,
                            responsive: {
                                visible: 'md',
                                hidden: 'sm',
                            },
                            width: 25,
                            template: function (row) {
                                if (!row.born_date) return '-';
                                return `<div style="line-height: 1.1">
                                    <span class="font-weight-boldest">${row.age} anni</span>
                                    <br>
                                    <span class="font-weight-bolder text-dark-65 font-size-xs">${moment(
                                        row.born_date
                                    ).format('DD/MM/YYYY')}</span>
                                </div>`;
                            },
                        },
                        {
                            field: '',
                            title: '',
                            width: KTUtil.isMobileDevice() ? 80 : 30,
                            sortable: false,
                            overflow: 'visible',
                            textAlign: 'right',
                            autoHide: false,
                            minWidth: '100%',
                            template: function (row) {
                                waitForElementAndExecute(`#action-col-${row.associate_id}`, () => {
                                    if (document.querySelector(`#action-col-${row.associate_id}`))
                                        document.querySelector(`#action-col-${row.associate_id}`).innerHTML = '';

                                    if (row.notes) {
                                        let notesButton = new NotesButton({
                                            target: document.querySelector(`#action-col-${row.associate_id}`),
                                            intro: true,
                                            props: {
                                                notes: row.notes,
                                            },
                                        });
                                    }

                                    let deleteBtn = new DeleteButton({
                                        target: document.querySelector(`#action-col-${row.associate_id}`),
                                        intro: true,
                                        props: {
                                            disabled: !canPerformAction('association.personas.delete'),
                                            popover_text: 'Elimina',
                                        },
                                    });

                                    deleteBtn.$on('open', data => {
                                        swal.fire({
                                            title: "Eliminare l'anagrafica?",
                                            text: 'Questa azione è irreversibile. Non saranno eliminate le iscrizioni, pagamenti e altri dati associati.',
                                            icon: 'warning',
                                            showCancelButton: true,
                                            reverseButtons: true,
                                            confirmButtonColor: '#d63030',
                                            confirmButtonText: 'Elimina',
                                            cancelButtonText: 'Annulla',
                                        }).then(async result => {
                                            if (result.isConfirmed) {
                                                let res = await apiFetch(
                                                    replaceUID(__bakney.env.API.PERSONAS.DELETE, row.associate_id),
                                                    {
                                                        method: 'DELETE',
                                                    }
                                                );
                                                if (res.status === 200 || res.status === 204) {
                                                    datatable?.reload();
                                                    toast.success('Eliminato con successo');
                                                } else {
                                                    toast.error("Errore nell'eliminazione");
                                                }
                                            }
                                        });
                                    });
                                });
                                return `<div id="action-col-${row.associate_id}" class="action-column pr-4"></div>`;
                            },
                        },
                    ]}
                    url={__bakney.env.API.PERSONAS.LIST}
                    mapFunction={raw => {
                        if (typeof raw.data !== 'undefined') {
                            return raw.data;
                        }
                        return [];
                    }}
                    clicked={(td, obj) => {
                        let drawer = new PersonaDrawer({
                            target: document.querySelector(`#drawer-elements`),
                            intro: true, // This enables the mount animation
                            props: {
                                associateId: obj.associate_id,
                                title: `${obj?.first_name || ''} ${obj?.last_name || ''}`,
                            },
                        });
                        drawer.$on('close', () => {
                            // reload datatable
                            datatable.reload();
                        });
                    }}
                    showDividerFilter={false}
                    serverPaging={true}
                    serverFiltering={true}
                    showSearch={false}
                    serverSorting={true}>
                    <div slot="search-header">
                        <div
                            class="col-12 col-md-auto p-0 m-0 d-flex flex-column flex-md-row align-items-center justify-content-start">
                            <div class="col-md-8 col-12 my-2 my-md-0 p-0 px-md-2">
                                <div class="input-icon d-flex">
                                    <input
                                        type="text"
                                        bind:value={$personasListFilter.generalSearch}
                                        on:keyup={debounce(() => {
                                            datatable?.setDataSourceParams($personasListFilterDatatable);
                                        }, 300)}
                                        class="form-control form-control-solid mb-0 {$personasListFilter.generalSearch !=
                                        ''
                                            ? 'border border-secondary border-2 bg-light'
                                            : 'border border-secondary border-dashed bg-white'}"
                                        placeholder="Cerca..."
                                        id="kt_datatable_search_query" />
                                    <span>
                                        <i class="flaticon2-search-1 text-muted" />
                                    </span>

                                    <button
                                        style="position: absolute;right:0;"
                                        class="btn btn-icon btn-ghost mb-0"
                                        class:d-none={$personasListFilter.generalSearch == ''}
                                        on:click={() => {
                                            $personasListFilter.generalSearch = '';
                                            datatable?.setDataSourceParams($personasListFilterDatatable);
                                        }}>
                                        <XCircleIcon size={19} weight="duotone" />
                                    </button>
                                </div>
                            </div>
                            <SmartSelect
                                customClasses={'m-0 p-0 filter-select min-w-7'}
                                selectClasses={$personasListFilter.is_tutor != ''
                                    ? 'query-filter-select border border-secondary border-2 bg-light'
                                    : 'query-filter-select border border-secondary border-dashed bg-white'}
                                editable={false}
                                active={false}
                                on:change={() => {
                                    datatable?.setDataSourceParams($personasListFilterDatatable);
                                }}
                                bind:value={$personasListFilter.is_tutor}
                                props={{
                                    id: 'is_tutor',
                                    name: 'is_tutor',
                                    label: null,
                                    placeholder: 'Filtra stato',
                                    required: true,
                                    clearable: false,
                                    showChevron: true,
                                    options: [
                                        {label: 'Filtra tipologia', value: ''},
                                        {label: 'Tutori', value: 1},
                                        {label: 'Atleti', value: 0},
                                    ],
                                    value: $personasListFilter.is_tutor,
                                }} />
                        </div>
                    </div>
                    <div slot="multiactions">
                        {#if visibleMultiaction}
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <!-- svelte-ignore a11y-no-static-element-interactions -->
                            <div
                                in:slide={{duration: 100}}
                                class="d-flex align-items-center mb-5 mx-2"
                                id="kt_datatable_personas_multiactions">
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
                                    <TrashSimple size={16} weight="bold" class="mr-1" />
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
