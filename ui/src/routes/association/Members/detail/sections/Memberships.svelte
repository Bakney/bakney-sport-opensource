<script>
    import {scale} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import {PlusCircle} from 'phosphor-svelte';
    import {createEventDispatcher} from 'svelte';
    import {canPerformAction} from 'utils/Permissions';
    import AddEditMembershipsModal from './modals/AddEditMembershipsModal.svelte';
    import KtDatatable from 'components/tables/KTDatatable.svelte';
    import {waitForElementAndExecute} from 'utils/Functions';
    import EditButton from 'components/buttons/EditButton.svelte';
    import DeleteButton from 'components/buttons/DeleteButton.svelte';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import {toast} from 'svelte-sonner';
    import TextButton from 'components/buttons/TextButton.svelte';
    import AddEditModal from 'routes/accounting/payment/modals/AddEditModal.svelte';

    const dispatch = createEventDispatcher();

    export let info = {};
    let datatable;
</script>

<div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}}>
    <div class="row">
        <div class="col-10 mt-2">
            <h3 class="card-label font-size-h2">
                Tesseramenti
                <span class="d-block text-muted pt-2 font-size-sm">Lista dei tesseramenti.</span>
            </h3>
        </div>
        <div class="col-2 mt-2 d-flex justify-content-end align-items-center">
            {#if !info.archived && canPerformAction('association.members.create')}
                <button
                    class="btn btn-sm btn-primary font-weight-bolder d-flex align-items-center"
                    on:click={() => {
                        let addModal = new AddEditMembershipsModal({
                            target: document.body,
                            props: {
                                show: true,
                                data: {
                                    associate_id: info.associate.associate_id,
                                },
                            },
                        });

                        addModal.$on('update', e => {
                            datatable.reload();
                        });
                    }}>
                    <PlusCircle size={16} class="mr-1" weight="bold" />
                    Tesseramento
                </button>
            {/if}
        </div>
    </div>
    <div class="row">
        <div class="col-12">
            <KtDatatable
                id="kt_datatable_memberships"
                searchId="kt_datatable_search_query_memberships"
                bind:datatable
                columns={[
                    {
                        field: 'membership_type',
                        title: 'Tesseramento',
                        sortable: true,
                        autoHide: false,
                        fireClick: true,
                        width: 180,
                        minWidth: '100%',
                        textAlign: 'left',
                        template: row => {
                            return row.membership_type || '-';
                        },
                    },
                    {
                        field: 'membership_number',
                        title: 'Numero',
                        sortable: true,
                        autoHide: false,
                        width: 100,
                        fireClick: true,
                        minWidth: '100%',
                        textAlign: 'left',
                        template: row => {
                            return row.membership_number || '-';
                        },
                    },
                    {
                        field: 'start_date',
                        title: 'Data Inizio',
                        sortable: true,
                        fireClick: true,
                        autoHide: false,
                        width: 80,
                        minWidth: '100%',
                        textAlign: 'left',
                        template: row => {
                            return row.start_date ? moment(row.start_date).format('DD/MM/YYYY') : '-';
                        },
                    },
                    {
                        field: 'end_date',
                        title: 'Data Fine',
                        sortable: true,
                        autoHide: false,
                        fireClick: true,
                        width: 80,
                        minWidth: '100%',
                        textAlign: 'left',
                        template: row => {
                            return row.end_date ? moment(row.end_date).format('DD/MM/YYYY') : '-';
                        },
                    },
                    {
                        field: 'price',
                        title: 'Prezzo',
                        sortable: true,
                        autoHide: false,
                        width: 80,
                        fireClick: true,
                        minWidth: '100%',
                        textAlign: 'left',
                        template: row => {
                            return row.price
                                ? `<span class="text-success font-weight-boldest">€ ${row.price}</span>`
                                : '-';
                        },
                    },
                    {
                        field: 'paid',
                        title: 'Stato',
                        sortable: true,
                        autoHide: false,
                        width: 65,
                        fireClick: true,
                        minWidth: '100%',
                        textAlign: 'left',
                        template: row => {
                            if (row.paid == null) return '-';
                            return `<div>
                                <span class="label ${
                                    row.paid ? 'label-light-success' : 'label-light-warning'
                                } label-inline font-weight-bolder label-lg">
                                    ${row.paid ? 'Pagato' : 'In attesa'}
                                </span>
                            </div>`;
                        },
                    },
                    {
                        field: 'attached_membership_documents',
                        title: 'Documenti',
                        sortable: true,
                        autoHide: false,
                        minWidth: '100%',
                        textAlign: 'left',
                        template: row => {
                            if (!row.attached_membership_documents || row.attached_membership_documents.length === 0)
                                return '-';
                            return (
                                "<div class='font-size-xs font-weight-boldest' style='line-height: 1.2;'>" +
                                row.attached_membership_documents
                                    .map(
                                        doc =>
                                            `<a href="${__bakney.env.API.DOCUMENT.RETRIEVE}/${doc.document_id}?token=${
                                                doc.token
                                            }"
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
                        width: 280,
                        sortable: false,
                        overflow: 'visible',
                        textAlign: 'right',
                        autoHide: false,
                        minWidth: '100%',
                        template: function (row) {
                            waitForElementAndExecute(`#action-col-${row.subscription_membership_id}`, () => {
                                if (document.querySelector(`#action-col-${row.subscription_membership_id}`))
                                    document.querySelector(`#action-col-${row.subscription_membership_id}`).innerHTML =
                                        '';

                                if (row.payment === null) {
                                    let createPayment = new TextButton({
                                        target: document.querySelector(`#action-col-${row.subscription_membership_id}`),
                                        intro: true,
                                        props: {
                                            disabled: !canPerformAction('association.members.update'),
                                            text: 'Registra',
                                            popover_text: 'Registra pagamento',
                                        },
                                    });

                                    createPayment.$on('open', () => {
                                        let addModal = new AddEditModal({
                                            target: document.body,
                                            props: {
                                                show: true,
                                                editableComplexItem: false,
                                                data: {
                                                    description: `Tesseramento ${row.membership_type} dal ${row.start_date} al ${row.end_date}`,
                                                    subject: 0,
                                                    type: 'cash',
                                                    expense: false,
                                                    amount: row.price,
                                                    subscription_id: info.associate.associate_id,
                                                    meta_payment_categories: [],
                                                },
                                            },
                                        });

                                        addModal.$on('update', async e => {
                                            let res = await apiFetch(
                                                replaceUID(
                                                    __bakney.env.API.SUBSCRIPTION.MEMBERSHIPS.UPDATE,
                                                    row.subscription_membership_id
                                                ),
                                                {
                                                    method: 'PATCH',
                                                    body: JSON.stringify({
                                                        payment: e.detail.payment_id,
                                                    }),
                                                }
                                            );
                                            setTimeout(() => {
                                                if (!res.error) {
                                                    toast.success('Pagamento registrato.');
                                                } else {
                                                    toast.error("C'è stato un errore nel registrare il pagamento.");
                                                }
                                            }, 1000);
                                            datatable.reload();
                                            dispatch('reset', {
                                                page: 'memberships',
                                            });
                                        });
                                    });
                                }

                                let editBtn = new EditButton({
                                    target: document.querySelector(`#action-col-${row.subscription_membership_id}`),
                                    intro: true,
                                    props: {
                                        disabled: !canPerformAction('association.members.update'),
                                        popover_text: 'Modifica',
                                    },
                                });

                                editBtn.$on('open', () => {
                                    let modal = new AddEditMembershipsModal({
                                        target: document.body,
                                        props: {
                                            show: true,
                                            data: row,
                                            edit: true,
                                        },
                                    });

                                    modal.$on('update', () => {
                                        datatable?.reload();
                                    });
                                });

                                let deleteBtn = new DeleteButton({
                                    target: document.querySelector(`#action-col-${row.subscription_membership_id}`),
                                    intro: true,
                                    props: {
                                        disabled: !canPerformAction('association.members.delete'),
                                        popover_text: 'Elimina',
                                    },
                                });

                                deleteBtn.$on('open', data => {
                                    swal.fire({
                                        title: 'Eliminare il tesseramento?',
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
                                                    __bakney.env.API.SUBSCRIPTION.MEMBERSHIPS.DELETE,
                                                    row.subscription_membership_id
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
                            return `<div id="action-col-${row.subscription_membership_id}" class="action-column pr-4"></div>`;
                        },
                    },
                ]}
                url={__bakney.env.API.SUBSCRIPTION.MEMBERSHIPS.LIST}
                mapFunction={raw => {
                    if (typeof raw.data !== 'undefined') {
                        return raw.data;
                    }
                    return [];
                }}
                clicked={(td, obj) => {
                    let modal = new AddEditMembershipsModal({
                        target: document.body,
                        props: {
                            show: true,
                            edit: true,
                            data: obj,
                        },
                    });
                    modal.$on('update', () => {
                        datatable?.reload();
                    });
                }}
                params={{
                    associate_id: info.associate.associate_id,
                }}
                showDividerFilter={false}
                serverPaging={false}
                serverFiltering={false}
                serverSorting={false} />
        </div>
    </div>
</div>
