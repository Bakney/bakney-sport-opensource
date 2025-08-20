<script>
    import {slide} from 'svelte/transition';
    import {sessionToken, userData} from 'store/stores.js';
    import {onDestroy} from 'svelte';
    import {replaceUID} from 'utils/ApiMiddleware.js';
    import {waitForElementAndExecute} from 'utils/Functions';
    import {apiFetch} from 'utils/ApiMiddleware';
    import {canPerformAction} from 'utils/Permissions';
    import DeleteButton from 'components/buttons/DeleteButton.svelte';
    import KtDatatable from 'components/tables/KTDatatable.svelte';
    import {toast} from 'svelte-sonner';
    import EditButton from 'components/buttons/EditButton.svelte';
    import {push} from 'svelte-spa-router';
    import {PlusCircle, TrashSimple, Printer} from 'phosphor-svelte';
    import AddEditMembershipModal from '../modals/AddEditMembershipModal.svelte';
    import PaymentModal from 'routes/association/Members/modals/PaymentModal.svelte';
    import ExpandPayments from 'components/buttons/ExpandPayments.svelte';
    import DetailDrawer from 'routes/association/Members/detail/DetailDrawer.svelte';
    import CurrentViewPrintingModal from 'components/modals/CurrentViewPrintingModal.svelte';

    sessionToken.useLocalStorage();
    userData.useLocalStorage();

    export let info = {};

    let datatable;
    let visibleMultiaction = false;
    let selectedCounter;

    const activeTextDictionary = {
        false: '<span class="label label-light-danger label-inline font-weight-bolder label-lg">Inattivo</span>',
        true: '<span class="label label-light-success label-inline font-weight-bolder label-lg">Attivo</span>',
    };

    const autoRenewalTextDictionary = {
        false: '<span class="label label-light-danger label-inline font-weight-bolder label-lg">Disabilitato</span>',
        true: '<span class="label label-light-success label-inline font-weight-bolder label-lg">Automatico</span>',
    };

    function deleteSelected() {
        swal.fire({
            title: `Vuoi eliminare ${selectedCounter} iscrizioni ai corsi?`,
            text: 'Saranno eliminate le rate non pagate se presenti.',
            icon: 'question',
            buttonsStyling: true,
            showCancelButton: true,
            cancelButtonText: 'Annulla',
            confirmButtonText: 'Elimina selezionate',
            reverseButtons: true,
        }).then(function (result) {
            if (result.isConfirmed) {
                let records = jQuery('#course-subscriptions-list').KTDatatable('getSelectedRecords').dataSet;
                let checkedNodes = datatable?.getSelectedRecords();
                let count = checkedNodes.length;
                if (count > 0) {
                    let course_subscription_ids = [];
                    for (let i = 0; i < count; i++) {
                        let id = checkedNodes[i].dataset.row;
                        course_subscription_ids.push(records[id].course_subscription_id);
                    }

                    KTApp.blockPage({
                        overlayColor: '#000000',
                        state: 'primary',
                    });

                    apiFetch(__bakney.env.API.COURSE_SUBSCRIPTIONS.BULK_DELETE, {
                        method: 'DELETE',
                        body: JSON.stringify({
                            course_subscription_ids: course_subscription_ids,
                        }),
                    }).then(res => {
                        KTApp.unblockPage();
                        if (res.status == 200 || res.status == 204) {
                            toast.success(`${selectedCounter} iscrizioni al corso eliminate.`);
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
    });
</script>

<div class="card card-custom gutter-b">
    <div class="d-block d-md-flex justify-content-between" />
    <div class="card-header flex-wrap border-0 p-0">
        <div class="card-title">
            <h3 class="card-label font-size-h2">
                Abbonamenti
                <span class="d-block text-muted pt-2 font-size-sm">Lista degli abbonamenti.</span>
            </h3>
        </div>
        <div class="col-2 mt-2 pr-0 d-flex justify-content-end align-items-center">
            {#if canPerformAction('association.courses.update')}
                <button
                    class="btn btn-sm btn-primary font-weight-bolder d-flex align-items-center"
                    on:click={() => {
                        let addModal = new AddEditMembershipModal({
                            target: document.querySelector('#portal-elements'),
                            props: {
                                show: true,
                                data: {},
                                info: {...info},
                            },
                        });

                        addModal.$on('update', () => {
                            datatable.reload();
                        });
                    }}>
                    <PlusCircle size={16} class="mr-1" weight="bold" />
                    Abbonamento
                </button>
            {/if}
        </div>
    </div>
    <div class="card-body p-0">
        <KtDatatable
            id="course-subscriptions-list"
            bind:datatable
            columns={[
                {
                    field: 'subscription_id',
                    title: '#',
                    sortable: false,
                    autoHide: false,
                    width: 20,
                    selector: {
                        class: '',
                    },
                    textAlign: 'center',
                },
                {
                    field: 'associate',
                    title: 'Tesserato',
                    fireClick: true,
                    autoHide: false,
                    minWidth: '100%',
                    width: 150,
                    sortable: false,
                    autoHide: false,
                    template: function (row) {
                        return (
                            `<div class="d-flex flex-column" style="line-height: 1.2;"><span class="text-primary font-weight-bolder">` +
                            row?.subscription?.associate?.first_name?.toUpperCase() +
                            ' ' +
                            row?.subscription?.associate?.last_name?.toUpperCase() +
                            `</span>` +
                            `<span class="font-size-xs font-weight-bold">anno ${row?.subscription?.current_year}</span></div>`
                        );
                    },
                },
                {
                    field: 'membership_fee',
                    title: 'Canone',
                    fireClick: true,
                    width: 80,
                    autoHide: true,
                    minWidth: '100%',
                    template: function (row) {
                        return `<span class="text-success font-weight-boldest">${String(
                            row?.membership_fee ?? 0
                        ).replace('.', ',')} €</span>`;
                    },
                },
                {
                    field: 'payments_info',
                    title: 'Pagamenti',
                    sortable: false,
                    checked: false,
                    width: 120,
                    fireClick: false,
                    responsive: {
                        visible: 'lg',
                        hidden: 'md',
                    },
                    template: function (row) {
                        waitForElementAndExecute(`#payments-col-${row.subscription?.subscription_id}`, () => {
                            if (document.querySelector(`#payments-col-${row.subscription?.subscription_id}`))
                                document.querySelector(`#payments-col-${row.subscription?.subscription_id}`).innerHTML =
                                    '';

                            const paymentsCol = document.querySelector(
                                `#payments-col-${row.subscription?.subscription_id}`
                            );
                            paymentsCol.innerHTML = ''; // Clear previous content

                            const paymentsBtn = new ExpandPayments({
                                target: paymentsCol,
                                intro: true,
                                props: {
                                    disabled: false,
                                    popover_text: 'Vedi pagamenti',
                                    color: 'primary',
                                    text: 'Pagamenti',
                                },
                            });

                            paymentsBtn.$on('open', data => {
                                let paymentModal = new PaymentModal({
                                    target: paymentsCol,
                                    props: {
                                        id: row.subscription?.subscription_id,
                                        generalSearch: info.title,
                                        associate_id: row.subscription?.associate?.associate_id,
                                        subscription_id: row.subscription?.subscription_id,
                                        show: true,
                                    },
                                });

                                // reload datatable on close
                                paymentModal.$on('close', data => {
                                    datatable.reload();
                                });
                            });
                        });
                        return `<div id="payments-col-${row.subscription?.subscription_id}" class="action-column pr-4 d-flex align-items-center"></div>`;
                    },
                },
                {
                    field: 'membership_active',
                    title: 'Stato',
                    width: 80,
                    autoHide: true,
                    minWidth: '100%',
                    fireClick: true,
                    template: function (row) {
                        return activeTextDictionary[row.membership_active];
                    },
                },
                {
                    field: 'auto_renewal',
                    title: 'Rinnovo',
                    width: 100,
                    autoHide: true,
                    minWidth: '100%',
                    fireClick: true,
                    template: function (row) {
                        return autoRenewalTextDictionary[row.auto_renewal];
                    },
                },
                {
                    field: 'billed_frequency',
                    title: 'Frequenza',
                    width: 100,
                    autoHide: true,
                    minWidth: '100%',
                    fireClick: true,
                    template: function (row) {
                        return row.billed_frequency + ' mes' + (row.billed_frequency > 1 ? 'i' : 'e');
                    },
                },
                {
                    field: 'billed_from',
                    title: 'Data inizio',
                    width: 100,
                    autoHide: true,
                    minWidth: '100%',
                    fireClick: true,
                    template: function (row) {
                        return new Date(row.billed_from).toLocaleDateString('it-IT');
                    },
                },
                {
                    field: 'billed_to',
                    title: 'Scade il',
                    width: 100,
                    autoHide: true,
                    minWidth: '100%',
                    fireClick: true,
                    template: function (row) {
                        return new Date(row.billed_until).toLocaleDateString('it-IT');
                    },
                },
                {
                    field: 'Azioni',
                    title: '',
                    sortable: false,
                    overflow: 'visible',
                    textAlign: 'right',
                    autoHide: false,
                    width: 98,
                    minWidth: '100%',
                    template: row => {
                        waitForElementAndExecute(`#action-col-${row.course_subscription_id}`, () => {
                            if (document.querySelector(`#action-col-${row.course_subscription_id}`))
                                document.querySelector(`#action-col-${row.course_subscription_id}`).innerHTML = '';

                            let editBtn = new EditButton({
                                target: document.querySelector(`#action-col-${row.course_subscription_id}`),
                                intro: true,
                                props: {
                                    disabled: !canPerformAction('association.courses.update'),
                                    popover_text: 'Modifica',
                                },
                            });

                            editBtn.$on('open', () => {
                                let addModal = new AddEditMembershipModal({
                                    target: document.querySelector('#portal-elements'),
                                    props: {
                                        show: true,
                                        data: row,
                                        edit: true,
                                        info: {...info},
                                    },
                                });
                                addModal.$on('update', () => {
                                    datatable.reload();
                                });
                            });

                            let deleteBtn = new DeleteButton({
                                target: document.querySelector(`#action-col-${row.course_subscription_id}`),
                                intro: true,
                                props: {
                                    disabled: !canPerformAction('association.courses.update'),
                                    popover_text: 'Elimina',
                                },
                            });

                            deleteBtn.$on('open', () => {
                                swal.fire({
                                    title: "Eliminare l'iscrizione?",
                                    text: 'Saranno eliminate le eventuali rate non pagate. Questa azione è irreversibile.',
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
                                                __bakney.env.API.COURSE_SUBSCRIPTIONS.DELETE,
                                                row.course_subscription_id
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
                        return `<div id="action-col-${row.course_subscription_id}" class="action-column pr-4"></div>`;
                    },
                },
            ]}
            url={__bakney.env.API.COURSE_SUBSCRIPTIONS.LIST}
            params={{
                course_id: info.course_id,
            }}
            clicked={(td, obj) => {
                let basicDrawer = new DetailDrawer({
                    target: document.querySelector(`#drawer-elements`),
                    intro: true, // This enables the mount animation
                    props: {
                        subscriptionId: obj.subscription.subscription_id,
                        title: `${obj.subscription.associate?.first_name || ''} ${
                            obj.subscription.associate?.last_name || ''
                        }`,
                    },
                });
                basicDrawer.$on('close', () => {
                    // reload datatable
                    datatable.reload();
                });
            }}
            bind:visibleMultiaction
            bind:selectedCounter
            serverPaging={false}
            serverFiltering={false}
            serverSorting={false}>
            <div slot="search-header" style="width: -webkit-fill-available;">
                <div class="d-flex justify-content-end">
                    <button
                        class="btn btn-sm btn-light-primary font-weight-bolder m-0 d-flex align-items-center justify-content-end"
                        data-toggle="tooltip"
                        data-placement="bottom"
                        title="Esporta ricerca corrente in Excel o PDF"
                        on:click={() => {
                            let query = {};
                            // Add course_id param
                            query.course_id = info.course_id;

                            // transform query to be a string like ?query[key]=value&...
                            let queryString = Object.keys(query)
                                .map(key => {
                                    return `${key}` + '=' + query[key];
                                })
                                .join('&');

                            // sort options
                            let sort = datatable.getDataSourceParam('sort');
                            if (sort) {
                                queryString += '&sort[field]=' + sort.field + '&sort[sort]=' + sort.sort;
                            }

                            // add type=athletes
                            queryString += '&type=athletes';

                            let endpointWithQueryString =
                                __bakney.env.API.COURSE_SUBSCRIPTIONS.LIST + '?' + queryString;
                            let printingModal = new CurrentViewPrintingModal({
                                target: document.querySelector(`#portal-elements`),
                                intro: true,
                                props: {
                                    title: `Stampa vista corrente`,
                                    endpointWithQueryString: endpointWithQueryString,
                                },
                            });
                        }}>
                        <Printer size={14} weight="duotone" class="mr-1" />
                        Vista corrente
                    </button>
                </div>
            </div>
            <div slot="multiactions">
                {#if visibleMultiaction}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <div in:slide={{duration: 100}} class="mt-10 mb-5" id="kt_datatable_group_action_form_imported">
                        <div class="d-flex align-items-center">
                            <div class="font-weight-bold mr-3" style="font-size:1.1rem;">
                                {selectedCounter} selezionati
                            </div>
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <span
                                on:click={deleteSelected}
                                class="btn btn-sm btn-light-danger font-weight-bolder ml-2"
                                style="margin:0;"
                                type="button">
                                <TrashSimple size={16} weight="duotone" class="mr-1" />
                                <span class="d-none d-md-inline">Elimina</span>
                            </span>
                        </div>
                    </div>
                {/if}
            </div>
        </KtDatatable>
    </div>
</div>
