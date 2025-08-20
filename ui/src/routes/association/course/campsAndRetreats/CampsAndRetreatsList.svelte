<script>
    import {sessionToken, userData} from 'store/stores.js';
    import {scale} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import {onDestroy} from 'svelte';
    import {replaceUID} from 'utils/ApiMiddleware.js';
    import {PlusCircle} from 'phosphor-svelte';
    import {waitForElementAndExecute} from 'utils/Functions';
    import {apiFetch} from 'utils/ApiMiddleware';
    import {canPerformAction} from 'utils/Permissions';
    import DeleteButton from 'components/buttons/DeleteButton.svelte';
    import KtDatatable from 'components/tables/KTDatatable.svelte';
    import AddModal from './modals/AddModal.svelte';
    import {toast} from 'svelte-sonner';

    sessionToken.useLocalStorage();
    userData.useLocalStorage();

    export let params;

    let datatable;

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
                        Camp e Ritiri
                        <span class="d-block text-muted pt-2 font-size-sm"
                            >Clicca sul nome di un modulo per gestire le risposte.</span>
                    </h3>
                </div>
                <div class="card-toolbar">
                    {#if canPerformAction('association.campsandretreats.create')}
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
                            <span class="ml-0 ml-md-1"
                                ><span class="d-none d-md-inline-block">Camp e Ritiri</span></span>
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
                            width: 120,
                            minWidth: '100%',
                            textAlign: 'left',
                            template: row => {
                                return `
                                    <a href="/#/course/camps-and-retreats/overview/${
                                        row.camps_and_retreats_id
                                    }" class="font-weight-boldest">
                                        ${row.title || '-'}
                                    </a>
                                    `;
                            },
                        },
                        {
                            field: 'description',
                            title: 'Descrizione',
                            sortable: true,
                            autoHide: false,
                            minWidth: '100%',
                            textAlign: 'left',
                            template: row => {
                                return row.description || '-';
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
                                waitForElementAndExecute(`#action-col-${row.camps_and_retreats_id}`, () => {
                                    if (document.querySelector(`#action-col-${row.camps_and_retreats_id}`))
                                        document.querySelector(`#action-col-${row.camps_and_retreats_id}`).innerHTML =
                                            '';

                                    let deleteBtn = new DeleteButton({
                                        target: document.querySelector(`#action-col-${row.camps_and_retreats_id}`),
                                        intro: true,
                                        props: {
                                            disabled: !canPerformAction('association.campsandretreats.delete'),
                                            popover_text: 'Elimina',
                                        },
                                    });

                                    deleteBtn.$on('open', data => {
                                        swal.fire({
                                            title: 'Eliminare il camp?',
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
                                                        __bakney.env.API.CAMPS_AND_RETREATS.DELETE,
                                                        row.camps_and_retreats_id
                                                    ),
                                                    {
                                                        method: 'DELETE',
                                                    }
                                                );
                                                if (res.status === 200) {
                                                    datatable.reload();
                                                    toast.success('Eliminato con successo');
                                                } else {
                                                    toast.error("Errore nell'eliminazione");
                                                }
                                            }
                                        });
                                    });
                                });
                                return `<div id="action-col-${row.camps_and_retreats_id}" class="action-column pr-4"></div>`;
                            },
                        },
                    ]}
                    url={__bakney.env.API.CAMPS_AND_RETREATS.LIST}
                    mapFunction={raw => {
                        if (typeof raw.data !== 'undefined') {
                            return raw.data;
                        }
                        return [];
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
