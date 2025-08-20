<script>
    import NavigationTab from './shared/NavigationTab.svelte';
    import {sessionToken, userData} from 'store/stores.js';
    import {scale} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import {onMount, onDestroy} from 'svelte';
    import {replaceUID} from 'utils/ApiMiddleware.js';
    import {Plus, PlusCircle} from 'phosphor-svelte';
    import {waitForElementAndExecute} from 'utils/Functions';
    import {apiFetch} from 'utils/ApiMiddleware';
    import {link} from 'svelte-spa-router';
    import {canPerformAction} from 'utils/Permissions';
    import DeleteButton from 'components/buttons/DeleteButton.svelte';
    import KtDatatable from 'components/tables/KTDatatable.svelte';
    import AddModal from './modals/AddModal.svelte';
    import {toast} from 'svelte-sonner';
    import EditButton from 'components/buttons/EditButton.svelte';

    sessionToken.useLocalStorage();
    userData.useLocalStorage();

    let datatable;

    onDestroy(() => {
        document.querySelectorAll('.popover').forEach(popover => popover.remove());
    });
</script>

<div
    in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}}
    class="d-flex flex-column-fluid font-weight-bold text-dark-50">
    <!--begin::Container-->
    <div class="container">
        <!--begin::Card-->
        <div class="card card-custom gutter-b">
            <div class="d-block d-md-flex justify-content-between">
                <NavigationTab />
            </div>
            <div class="card-header flex-wrap border-0 p-0">
                <div class="card-title">
                    <h3 class="card-label font-size-h2">
                        Strutture
                        <span class="d-block text-muted pt-2 font-size-sm">Strutture dei corsi.</span>
                    </h3>
                </div>
                <div class="card-toolbar">
                    {#if canPerformAction('association.courses.create')}
                        <!--begin::Button-->
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                        <button
                            on:click={() => {
                                let modal = new AddModal({
                                    target: document.body,
                                    props: {
                                        show: true,
                                        ktdatable: datatable,
                                    },
                                });
                            }}
                            class="btn btn-sm btn-primary font-weight-bolder m-2 d-flex align-items-center">
                            <PlusCircle size={18} weight="duotone" />
                            <span class="ml-0 ml-md-1"><span class="d-none d-md-inline-block">Struttura</span></span>
                        </button>
                        <!--end::Button-->
                    {/if}
                </div>
            </div>
            <div class="card-body p-0">
                <KtDatatable
                    bind:datatable
                    columns={[
                        {
                            field: 'title',
                            title: 'Titolo',
                            sortable: true,
                            autoHide: false,
                            fireClick: true,
                            width: 120,
                            minWidth: '100%',
                            textAlign: 'left',
                            template: row => {
                                return row.title || '-';
                            },
                        },
                        {
                            field: 'address',
                            title: 'Indirizzo',
                            sortable: true,
                            autoHide: false,
                            fireClick: true,
                            minWidth: '100%',
                            textAlign: 'left',
                            template: row => {
                                return row.address || '-';
                            },
                        },
                        {
                            field: 'description',
                            title: 'Descrizione',
                            sortable: true,
                            fireClick: true,
                            autoHide: false,
                            minWidth: '100%',
                            textAlign: 'left',
                            template: row => {
                                return row.description || '-';
                            },
                        },
                        {
                            field: 'documents',
                            title: 'Documenti',
                            sortable: true,
                            autoHide: false,
                            minWidth: '100%',
                            textAlign: 'left',
                            template: row => {
                                if (!row.documents || row.documents.length === 0) return '-';
                                return (
                                    "<div class='font-size-xs font-weight-boldest' style='line-height: 1.2;'>" +
                                    row.documents
                                        .map(
                                            doc =>
                                                `<a href="${__bakney.env.API.DOCUMENT.RETRIEVE}/${
                                                    doc.document_id
                                                }?token=${doc.token}" 
                                        target="_blank" class="font-size-xs">
                                        ${doc.filename.substring(0, 15)}${doc.filename.length > 15 ? '...' : ''}
                                    </a>`
                                        )
                                        .join(', ') +
                                    '</div>'
                                );
                            },
                        },
                        {
                            field: '',
                            title: '',
                            width: 140,
                            sortable: false,
                            overflow: 'visible',
                            textAlign: 'right',
                            autoHide: false,
                            minWidth: '100%',
                            template: function (row) {
                                waitForElementAndExecute(`#action-col-${row.course_location_id}`, () => {
                                    if (document.querySelector(`#action-col-${row.course_location_id}`))
                                        document.querySelector(`#action-col-${row.course_location_id}`).innerHTML = '';

                                    let editBtn = new EditButton({
                                        target: document.querySelector(`#action-col-${row.course_location_id}`),
                                        intro: true,
                                        props: {
                                            disabled: !canPerformAction('association.courses.update'),
                                            popover_text: 'Modifica',
                                        },
                                    });

                                    editBtn.$on('open', () => {
                                        let modal = new AddModal({
                                            target: document.body,
                                            props: {
                                                show: true,
                                                ktdatable: datatable,
                                                data: row,
                                                edit: true,
                                            },
                                        });
                                    });

                                    let deleteBtn = new DeleteButton({
                                        target: document.querySelector(`#action-col-${row.course_location_id}`),
                                        intro: true,
                                        props: {
                                            disabled: !canPerformAction('association.courses.delete'),
                                            popover_text: 'Elimina',
                                        },
                                    });

                                    deleteBtn.$on('open', data => {
                                        swal.fire({
                                            title: 'Eliminare la struttura?',
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
                                                        __bakney.env.API.COURSE.LOCATIONS.DELETE,
                                                        row.course_location_id
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
                                });
                                return `<div id="action-col-${row.course_location_id}" class="action-column pr-4"></div>`;
                            },
                        },
                    ]}
                    url={__bakney.env.API.COURSE.LOCATIONS.LIST}
                    mapFunction={raw => {
                        if (typeof raw.data !== 'undefined') {
                            return raw.data;
                        }
                        return [];
                    }}
                    clicked={(td, obj) => {
                        // edit modal
                        let modal = new AddModal({
                            target: document.body,
                            props: {
                                show: true,
                                ktdatable: datatable,
                                edit: true,
                                data: obj,
                            },
                        });
                    }}
                    showDividerFilter={false}
                    serverPaging={false}
                    serverFiltering={false}
                    serverSorting={false} />
            </div>
        </div>
        <!--end::Card-->
    </div>
    <!--end::Container-->
</div>
<!--end::Entry-->
