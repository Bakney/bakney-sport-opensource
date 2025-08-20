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
    import {push} from 'svelte-spa-router';
    import {DotsThreeCircleVertical, PlusCircle, Printer, TrashSimple} from 'phosphor-svelte';
    import ReplaceWithCarnet from '../components/modals/ReplaceWithCarnet.svelte';
    import AssignCarnet from '../components/modals/AssignCarnet.svelte';
    import AddEditCourseSubscriptionModal from '../modals/AddEditCourseSubscriptionModal.svelte';
    import PaymentModal from 'routes/association/Members/modals/PaymentModal.svelte';
    import ExpandPayments from 'components/buttons/ExpandPayments.svelte';
    import DetailDrawer from 'routes/association/Members/detail/DetailDrawer.svelte';
    import EditButton from 'components/buttons/EditButton.svelte';
    import CurrentViewPrintingModal from 'components/modals/CurrentViewPrintingModal.svelte';

    sessionToken.useLocalStorage();
    userData.useLocalStorage();

    export let info = {};

    let datatable;
    let visibleMultiaction = false;
    let selectedCounter;
    let selectedSubscriptions = [];

    const statusTextDictionary = {
        false: '<span class="label label-light-warning label-inline font-weight-bolder label-lg">In attesa</span>',
        true: '<span class="label label-light-success label-inline font-weight-bolder label-lg">Pagato</span>',
    };

    function changePaymentType(id, skipReload = false, skipToast = false, multi_payments = false, all = false) {
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Cambio pagamento in corso...',
        });
        const url = replaceUID(
            replaceUID(__bakney.env.API.COURSE.SUBSCRIPTION.UPDATE, info?.course_id),
            id,
            '<sub_uid>'
        );

        let data = {
            all: all,
        };

        if (multi_payments) {
            data.multi_payments = true;
        } else {
            data.one_fee_payment = true;
        }

        window
            .fetch(url, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + $sessionToken,
                },
                body: JSON.stringify(data),
            })
            .then(response => {
                response.json();
                // spinner stop
                KTApp.unblockPage();
                if (response.status == 200) {
                    if (!skipToast) toast.success('Cambiato il tipo pagamento.');
                    if (!skipReload) jQuery('#kt_datatable').KTDatatable('reload');
                } else {
                    let modalText =
                        response.status == 403
                            ? 'Operazione non permessa.'
                            : 'Scusa, ho individuato degli errori, riprova.';
                    toast.error(modalText ?? 'Errore nel cambio pagamento.');
                }

                Promise.resolve(response.status == 200);
            });
    }

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

    async function changeToInstallments(all = false) {
        swal.fire({
            text: `Vuoi rateizzare l'importo del corso di ${selectedCounter} iscrizioni? (verranno eliminati solo i pagamenti non ancora effettuati)`,
            icon: 'question',
            buttonsStyling: true,
            showCancelButton: true,
            cancelButtonText: 'Annulla',
            confirmButtonText: 'Procedi',
            reverseButtons: true,
        }).then(async function (result) {
            if (result.isConfirmed) {
                let records = jQuery('#course-subscriptions-list').KTDatatable('getSelectedRecords').dataSet;
                let checkedNodes = datatable?.getSelectedRecords();
                let count = checkedNodes.length;
                let PromiseArray = [];
                if (count > 0) {
                    for (let i = 0; i < count; i++) {
                        let id = checkedNodes[i].dataset.row;
                        PromiseArray.push(
                            changePaymentType(records[id].subscription.subscription_id, true, true, true, all)
                        );
                    }
                }
                await Promise.all(PromiseArray);
                visibleMultiaction = false;
                toast.success(`${selectedCounter} iscrizioni rateizzate.`);
                setTimeout(() => {
                    datatable?.reload();
                }, 1000);
            }
        });
    }

    function changeToOneFee() {
        swal.fire({
            text: `Vuoi cambiare il pagamento in un'unica soluzione per ${selectedCounter} iscrizioni? (verranno eliminati solo i pagamenti non ancora effettuati)`,
            icon: 'question',
            buttonsStyling: true,
            showCancelButton: true,
            cancelButtonText: 'Annulla',
            confirmButtonText: 'Applica',
            reverseButtons: true,
        }).then(function (result) {
            if (result.isConfirmed) {
                let records = jQuery('#course-subscriptions-list').KTDatatable('getSelectedRecords').dataSet;
                let checkedNodes = datatable?.getSelectedRecords();
                let count = checkedNodes.length;
                if (count > 0) {
                    for (let i = 0; i < count; i++) {
                        let id = checkedNodes[i].dataset.row;
                        changePaymentType(records[id].subscription.subscription_id, true, true, false);
                    }
                }
                visibleMultiaction = false;
                toast.success(`${selectedCounter} iscrizioni da saldare con pagamento in un'unica soluzione.`);
                datatable?.reload();
            }
        });
    }

    function replaceCarnet(carnet_id, subscription_id, course_subscription_id) {
        return apiFetch(
            replaceUID(replaceUID(__bakney.env.API.CARNET.REPLACE, carnet_id), subscription_id, '<sub_uid>'),
            {
                method: 'POST',
                body: JSON.stringify({
                    course_subscription_id: course_subscription_id,
                }),
            }
        );
    }

    function assignCarnet(carnet_id, subscription_id, course_subscription_id) {
        return apiFetch(
            replaceUID(replaceUID(__bakney.env.API.CARNET.ASSIGN, carnet_id), subscription_id, '<sub_uid>'),
            {
                method: 'POST',
                body: JSON.stringify({
                    course_subscription_id: course_subscription_id,
                }),
            }
        );
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
                Iscritti
                <span class="d-block text-muted pt-2 font-size-sm">Iscritti al corso.</span>
            </h3>
        </div>
        <div class="col-2 mt-2 d-flex justify-content-end align-items-center">
            {#if canPerformAction('association.courses.update')}
                <button
                    class="btn btn-sm btn-primary font-weight-bolder d-flex align-items-center"
                    on:click={() => {
                        let addModal = new AddEditCourseSubscriptionModal({
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
                    Tesserato
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
                    title: 'Atleta',
                    fireClick: true,
                    autoHide: false,
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
                    field: 'paid',
                    title: 'Pagamenti',
                    fireClick: false,
                    width: 250,
                    sortable: false,
                    template: function (row) {
                        let rowLabels =
                            row.installments?.length > 0 || info.multi_payments == true
                                ? ''
                                : statusTextDictionary[row.paid];
                        if (row.multi_payments == true && row.installments?.length > 0) {
                            // the label should be clickable and show a modal with the events list
                            let modalText = '';
                            row.installments?.forEach(installment => {
                                modalText += `<div class="d-flex justify-content-between p-2 px-3">
                                    <div>

                                <span class="font-weight-boldest">Rata del ${new Date(
                                    installment.payment_date
                                ).toLocaleDateString()}</span>
                                (<span class="font-weight-boldest text-primary">${installment.amount} €</span>)
                                </div>
                                <span class="font-weight-bolder ${installment.paid ? 'text-success' : 'text-danger'}">${
                                    installment.paid ? 'pagata' : 'da pagare'
                                }</span>
                            </div>`;
                            });

                            // return the html for the label and the html for the modal after it
                            // return the html for the label and the html for the modal after it
                            rowLabels += `
                                <span class="label label-outline-secondary label-outline label-inline font-weight-bolder cursor-pointer label-lg" data-toggle="modal" data-target="#kt_modal_${row.course_subscription_id}">${row.installments.length} rate</span>
                                <div class="modal fade p-2" id="kt_modal_${row.course_subscription_id}" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" role="document" style="z-index: 1042!important;position:relative;">
                                        <div class="modal-content">
                                            <div class="modal-header">
                                                <h5 class="modal-title font-weight-boldest" id="exampleModalLabel">Piano rate</h5>
                                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                </button>
                                            </div>
                                            <div class="modal-body py-2 px-4">
                                                ${modalText}
                                            </div>
                                            <div class="modal-footer p-2">
                                                <button type="button" class="btn btn-light-primary font-weight-bold" data-dismiss="modal">Chiudi</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>`;
                        } else if (info.multi_payments == true && row.installments?.length == 0) {
                            rowLabels += `<span class="label label-outline-secondary label-inline font-weight-bolder label-lg ml-2">Nessuna rata assegnata</span>`;
                        } else if (info.course_type == 2) {
                            rowLabels += `<span class="label label-outline-secondary label-inline font-weight-bolder label-lg ml-2">${
                                row.multiple_quote?.title || '-'
                            }</span>`;
                        } else {
                            rowLabels += `<span class="label label-outline-secondary label-inline font-weight-bolder label-lg ml-2">altro (rata unica o carnet)</span>`;
                        }

                        return rowLabels;
                    },
                },
                {
                    field: 'creation_date',
                    title: 'Data',
                    width: 100,
                    fireClick: true,
                    type: 'date',
                    responsive: {
                        visible: 'lg',
                        hidden: 'md',
                    },
                    sortCallback: function (data, sort, column) {
                        let dataArray = Object.values(data);
                        dataArray.sort(function (a, b) {
                            let timeA = new Date(a['creation_date']).getTime();
                            let timeB = new Date(b['creation_date']).getTime();
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
                        return new Date(row.creation_date).toLocaleDateString('it-IT');
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
                            if (row.type == 1 || row.type == 2) {
                                let editBtn = new EditButton({
                                    target: document.querySelector(`#action-col-${row.course_subscription_id}`),
                                    intro: true,
                                    props: {
                                        disabled: !canPerformAction('association.courses.update'),
                                        popover_text: 'Modifica',
                                    },
                                });

                                editBtn.$on('open', () => {
                                    let addModal = new AddEditCourseSubscriptionModal({
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
                            }

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
                    target: document.querySelector(`#portal-elements`),
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
                            <div class="dropdown ml-2">
                                <!-- svelte-ignore a11y-missing-attribute -->
                                <a
                                    type="button"
                                    class="btn btn-light-primary btn-sm dropdown-toggle font-weight-bolder"
                                    data-toggle="dropdown">
                                    <DotsThreeCircleVertical size={16} weight="duotone" class="mr-1" />
                                    <span class="d-none d-md-inline">Operazioni su selezionati</span>
                                </a>
                                <div class="dropdown-menu dropdown-menu">
                                    <ul class="navi navi-hover flex-column" style="cursor: pointer;">
                                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                                        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                                        {#if info?.multi_payments}
                                            <li class="navi-item" on:click={changeToInstallments}>
                                                <span class="navi-link">
                                                    <span class="nav-text font-weight-bolder"
                                                        >Assegna piano rate
                                                        <br />
                                                        <span
                                                            style="font-size:.85rem;"
                                                            class="nav-text font-weight-semibold text-dark-50"
                                                            >Sostituisce e assegna solo le nuove rate.</span>
                                                    </span>
                                                </span>
                                            </li>
                                            <li class="navi-item" on:click={() => changeToInstallments(true)}>
                                                <span class="navi-link">
                                                    <span class="nav-text font-weight-bolder"
                                                        >Assegna piano rate completo
                                                        <br />
                                                        <span
                                                            style="font-size:.85rem;"
                                                            class="nav-text font-weight-semibold text-dark-50"
                                                            >Sostituisce e assegna tutto il piano rate.</span>
                                                    </span>
                                                </span>
                                            </li>
                                        {/if}
                                        {#if info?.one_fee_payment && info?.multi_payments}
                                            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                                            <li class="navi-item" on:click={changeToOneFee}>
                                                <span class="navi-link">
                                                    <span class="nav-text font-weight-bolder"
                                                        >Cambia in unica soluzione
                                                        <br />
                                                        <span
                                                            style="font-size:.85rem;"
                                                            class="nav-text font-weight-semibold text-dark-50"
                                                            >Sostituisce il piano rate e assegna il pagamento in
                                                            un'unica soluzione.</span>
                                                    </span>
                                                </span>
                                            </li>
                                            <div class="dropdown-divider" />
                                        {/if}
                                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                                        <li class="navi-item" data-toggle="modal" data-target="#assign-carnet-modal">
                                            <span class="navi-link">
                                                <span class="nav-text font-weight-bolder">Assegna nuovo carnet</span>
                                            </span>
                                        </li>
                                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                                        <li
                                            class="navi-item"
                                            data-toggle="modal"
                                            data-target="#replace-with-carnet-modal">
                                            <span class="navi-link">
                                                <span class="nav-text font-weight-bolder"
                                                    >Sostituisci con carnet
                                                    <br />
                                                    <span
                                                        style="font-size:.85rem;"
                                                        class="nav-text font-weight-semibold text-dark-50"
                                                        >Sostituisce il piano rate e assegna un carnet.
                                                    </span>
                                                </span>
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                {/if}
            </div>
        </KtDatatable>
    </div>
</div>

<ReplaceWithCarnet
    bind:courseSubscriptions={selectedSubscriptions}
    on:update={e => {
        let records = jQuery('#course-subscriptions-list').KTDatatable('getSelectedRecords').dataSet;
        let checkedNodes = datatable?.getSelectedRecords();
        let count = checkedNodes.length;
        let PromiseArray = [];
        if (count > 0) {
            for (let i = 0; i < count; i++) {
                let idx = checkedNodes[i].dataset.row;
                PromiseArray.push(
                    replaceCarnet(
                        e.detail.carnet_id,
                        records[idx].subscription.subscription_id,
                        records[idx].course_subscription_id
                    )
                );
            }
        }
        visibleMultiaction = false;

        Promise.all(PromiseArray).then(() => {
            datatable?.reload();
            toast.success(`Pagamenti sostituiti con successo dal nuovo carnet.`);
        });
    }} />

<!-- svelte-ignore missing-declaration -->
<AssignCarnet
    bind:courseSubscriptions={selectedSubscriptions}
    on:update={e => {
        let records = jQuery('#course-subscriptions-list').KTDatatable('getSelectedRecords').dataSet;
        let checkedNodes = datatable?.getSelectedRecords();
        let count = checkedNodes.length;
        let PromiseArray = [];
        if (count > 0) {
            for (let i = 0; i < count; i++) {
                let idx = checkedNodes[i].dataset.row;
                PromiseArray.push(
                    assignCarnet(
                        e.detail.carnet_id,
                        records[idx].subscription.subscription_id,
                        records[idx].course_subscription_id
                    )
                );
            }
        }
        visibleMultiaction = false;

        Promise.all(PromiseArray).then(() => {
            datatable?.reload();
            toast.success(`Nuovo carnet assegnato.`);
        });
    }} />
