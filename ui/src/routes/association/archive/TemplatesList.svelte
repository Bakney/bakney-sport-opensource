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
    import TemplatesDrawer from './detail/TemplatesDrawer.svelte';
    import {SmartSelect} from 'components/formBuilder/preview-blocks';
    import {templatesListFilter, templatesListFilterDatatable} from 'store/stores.js';
    import AddTemplatesDrawer from './detail/AddTemplatesDrawer.svelte';
    import NavigationTab from './shared/NavigationTab.svelte';
    sessionToken.useLocalStorage();
    userData.useLocalStorage();

    let datatable;
    let visibleMultiaction = false;
    let selectedCounter = 0;

    function deleteSelected() {
        swal.fire({
            title: `Vuoi eliminare ${selectedCounter} modelli?`,
            text: 'I modelli eliminati non potranno essere recuperati.',
            icon: 'question',
            buttonsStyling: true,
            showCancelButton: true,
            cancelButtonText: 'Annulla',
            confirmButtonText: 'Elimina selezionati',
            reverseButtons: true,
        }).then(function (result) {
            if (result.isConfirmed) {
                let records = jQuery('#kt_datatable_templates').KTDatatable('getSelectedRecords').dataSet;
                let checkedNodes = datatable?.getSelectedRecords();
                let count = checkedNodes.length;
                if (count > 0) {
                    let sport_association_module_templates_ids = [];
                    for (let i = 0; i < count; i++) {
                        let id = checkedNodes[i].dataset.row;
                        sport_association_module_templates_ids.push(records[id].sport_association_module_templates_id);
                    }

                    KTApp.blockPage({
                        overlayColor: '#000000',
                        state: 'primary',
                    });

                    apiFetch(__bakney.env.API.TEMPLATES.BULK_DELETE, {
                        method: 'DELETE',
                        body: JSON.stringify({
                            sport_association_module_templates_ids: sport_association_module_templates_ids,
                        }),
                    }).then(res => {
                        KTApp.unblockPage();
                        if (res.status == 200 || res.status == 204) {
                            toast.success(`${selectedCounter} modelli eliminati.`);
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
        $templatesListFilter.is_tutor = '';
        $templatesListFilter.generalSearch = '';
    });
</script>

<div
    in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}}
    class="d-flex flex-column-fluid font-weight-bold text-dark-50">
    <!--begin::Container-->
    <div class="container">
        <NavigationTab />
        <!--begin::Card-->
        <div class="card card-custom gutter-b">
            <div class="card-header flex-wrap border-0 p-0">
                <div class="card-title">
                    <h3 class="card-label font-size-h2">
                        Modulistica
                        <span class="d-block text-muted pt-2 font-size-sm"
                            >Gestisci i modelli dei documenti da generare.</span>
                    </h3>
                </div>
                <div class="card-toolbar">
                    {#if canPerformAction('association.templates.create')}
                        <button
                            on:click={() => {
                                let addTemplatesDrawer = new AddTemplatesDrawer({
                                    target: document.querySelector(`#drawer-elements`),
                                    intro: true,
                                    props: {
                                        title: 'Aggiungi Modello',
                                    },
                                });

                                addTemplatesDrawer.$on('close', () => {
                                    addTemplatesDrawer.$destroy();
                                    datatable?.reload();
                                });
                            }}
                            class="btn btn-sm btn-primary font-weight-bolder m-2 d-flex align-items-center">
                            <PlusCircle size={18} weight="duotone" />
                            <span class="ml-0 ml-md-1"><span class="d-none d-md-inline-block">Modello</span></span>
                        </button>
                    {/if}
                </div>
            </div>
            <div class="card-body p-0">
                <KtDatatable
                    id="kt_datatable_templates"
                    bind:visibleMultiaction
                    bind:selectedCounter
                    bind:datatable
                    columns={[
                        {
                            field: 'sport_association_module_templates_id',
                            title: '#',
                            sortable: false,
                            autoHide: false,
                            width: 10,
                            selector: {
                                class: '',
                            },
                            textAlign: 'center',
                        },
                        {
                            field: 'name',
                            title: 'Nome Modello',
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
                                    capitalizeWords(row.name) +
                                    '</span>' +
                                    '<br><span class="font-size-xs text-dark-65">' +
                                    '</span></div>'
                                );
                            },
                        },
                        {
                            field: 'footer_header',
                            title: 'Informazioni',
                            sortable: true,
                            autoHide: false,
                            width: 150,
                            fireClick: true,
                            minWidth: '100%',
                            textAlign: 'left',
                            template: row => {
                                return `<div class="d-flex flex-row flex-wrap">
                                    ${
                                        row.header
                                            ? `<span class="label label-lg label-light-info label-inline font-weight-bold mr-2">
                                        Intestazione
                                    </span>`
                                            : ''
                                    }
                                    ${
                                        row.footer
                                            ? `<span class="label label-lg label-light-info label-inline font-weight-bold">
                                        Piè di pagina
                                    </span>`
                                            : ''
                                    }
                                </div>`;
                            },
                        },
                        {
                            field: '',
                            title: '',
                            width: 25,
                            sortable: false,
                            overflow: 'visible',
                            textAlign: 'right',
                            autoHide: false,
                            minWidth: '100%',
                            template: function (row) {
                                waitForElementAndExecute(
                                    `#action-col-${row.sport_association_module_templates_id}`,
                                    () => {
                                        if (
                                            document.querySelector(
                                                `#action-col-${row.sport_association_module_templates_id}`
                                            )
                                        )
                                            document.querySelector(
                                                `#action-col-${row.sport_association_module_templates_id}`
                                            ).innerHTML = '';

                                        let deleteBtn = new DeleteButton({
                                            target: document.querySelector(
                                                `#action-col-${row.sport_association_module_templates_id}`
                                            ),
                                            intro: true,
                                            props: {
                                                disabled: !canPerformAction('association.templates.delete'),
                                                popover_text: 'Elimina',
                                            },
                                        });

                                        deleteBtn.$on('open', data => {
                                            swal.fire({
                                                title: 'Eliminare il modello?',
                                                text: 'Questa azione è irreversibile.',
                                                icon: 'warning',
                                                showCancelButton: true,
                                                reverseButtons: true,
                                                confirmButtonColor: '#d63030',
                                                confirmButtonText: 'Elimina',
                                                cancelButtonText: 'Annulla',
                                            }).then(async result => {
                                                if (result.isConfirmed) {
                                                    let res = await apiFetch(
                                                        replaceUID(
                                                            __bakney.env.API.TEMPLATES.DELETE,
                                                            row.sport_association_module_templates_id
                                                        ),
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
                                    }
                                );
                                return `<div id="action-col-${row.sport_association_module_templates_id}" class="action-column pr-4"></div>`;
                            },
                        },
                    ]}
                    url={__bakney.env.API.TEMPLATES.LIST}
                    clicked={(td, obj) => {
                        let drawer = new TemplatesDrawer({
                            target: document.querySelector(`#drawer-elements`),
                            intro: true, // This enables the mount animation
                            props: {
                                templateId: obj.sport_association_module_templates_id,
                                title: `${obj?.name || ''}`,
                                data: obj,
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
                            <div class="col-12 my-2 my-md-0 p-0 min-w-10">
                                <div class="input-icon d-flex">
                                    <input
                                        type="text"
                                        bind:value={$templatesListFilter.generalSearch}
                                        on:keyup={debounce(() => {
                                            datatable?.setDataSourceParams($templatesListFilterDatatable);
                                        }, 300)}
                                        class="form-control form-control-solid mb-0 {$templatesListFilter.generalSearch !=
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
                                        class:d-none={$templatesListFilter.generalSearch == ''}
                                        on:click={() => {
                                            $templatesListFilter.generalSearch = '';
                                            datatable?.setDataSourceParams($templatesListFilterDatatable);
                                        }}>
                                        <XCircleIcon size={19} weight="duotone" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div slot="multiactions">
                        {#if visibleMultiaction}
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <!-- svelte-ignore a11y-no-static-element-interactions -->
                            <div
                                in:slide={{duration: 100}}
                                class="d-flex align-items-center mb-5 mx-2"
                                id="kt_datatable_templates_multiactions">
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
