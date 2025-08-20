<script>
    import {sessionToken, userData} from 'store/stores.js';
    import {scale, slide} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import {onDestroy} from 'svelte';
    import {replaceUID} from 'utils/ApiMiddleware.js';
    import {TrashSimple, Copy, PenNib, PlusCircle} from 'phosphor-svelte';
    import {apiFetch} from 'utils/ApiMiddleware';
    import {canPerformAction} from 'utils/Permissions';
    import DeleteButton from 'components/buttons/DeleteButton.svelte';
    import KtDatatable from 'components/tables/KTDatatable.svelte';
    import {toast} from 'svelte-sonner';
    import {waitForElementAndExecute} from 'utils/Functions';
    import ApproveButton from 'components/buttons/ApproveButton.svelte';
    import XCircle from 'components/buttons/XCircle.svelte';
    import MoreActionsButton from 'components/buttons/MoreActionsButton.svelte';
    import SignatureModal from 'routes/association/Members/modals/SignatureModal.svelte';
    import RepeatButton from 'components/buttons/RepeatButton.svelte';
    import RenewalModal from 'routes/association/Members/modals/RenewalModal.svelte';
    import MoveToArchiveButton from 'components/buttons/MoveToArchiveButton.svelte';
    import ArchiveButton from 'components/buttons/ArchiveButton.svelte';
    import AddSubscriptionModal from 'routes/association/Members/modals/AddSubscriptionModal.svelte';

    export let associateId;
    let datatable;

    const statusTextDictionary = {
        1: '<span class="label label-light-info label-inline font-weight-bolder label-lg">non firmata</span>',
        2: '<span class="label label-light-warning label-inline font-weight-bolder label-lg">in attesa</span>',
        3: '<span class="label label-light-danger label-inline font-weight-bolder label-lg">rifiutata</span>',
        4: '<span class="label label-light-success label-inline font-weight-bolder label-lg">accettata</span>',
        5: '<span class="label label-light-dark label-inline font-weight-bolder label-lg">archiviata</span>',
    };

    const statusCurrentYearDictionary = {
        0: '<span><span class="label label-warning label-dot mr-2"></span><span class="font-weight-bold text-warning">precedente</span></span>',
        1: '<span><span class="label label-success label-dot mr-2"></span><span class="font-weight-bold text-success">corrente</span></span>',
        3: '<span><span class="label label-info label-dot mr-2"></span><span class="font-weight-bold text-info">Preiscritto</span></span>',
    };

    const statusMedicalCertificateDictionary = {
        valid: '<span class="font-weight-bolder"><span class="label label-success label-dot mr-2"></span>[DAYS] giorni</span>',
        expiring:
            '<span class="font-weight-bolder"><span class="label label-warning label-dot mr-2"></span>[DAYS] giorni</span>',
        expired:
            '<span class="font-weight-bolder text-danger"><span class="label label-danger label-dot mr-2"></span>scaduto</span>',
        not_present:
            '<span class="font-weight-bolder text-danger"><span class="label label-danger label-dot mr-2"></span>scadenza mancante</span>',
    };

    let rejectSubscription = async (id, skipReload = false, skipToast = false) => {
        swal.fire({
            target: document.querySelector(`#portal-elements-foreground`),
            text: "Vuoi rifiutare l'iscrizione?",
            icon: 'question',
            buttonsStyling: true,
            showCancelButton: true,
            cancelButtonText: 'Annulla',
            confirmButtonText: 'Rifiuta',
            reverseButtons: true,
        }).then(function (result) {
            if (result.isConfirmed) {
                KTApp.blockPage({
                    overlayColor: '#000000',
                    state: 'primary',
                    message: 'Azione in corso...',
                });

                const url = __bakney.env.HOST + '/subscription/' + id + '/reject';

                window
                    .fetch(url, {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            Authorization: 'Bearer ' + $sessionToken,
                        },
                    })
                    .then(response => {
                        response.json();
                        // spinner stop
                        KTApp.unblockPage();
                        if (response.status == 200) {
                            toast.success('Iscrizione Rifiutata.');
                            datatable?.reload();
                        } else {
                            let modalText =
                                response.status == 403
                                    ? 'Operazione non permessa.'
                                    : 'Scusa, ho individuato degli errori, riprova.';
                            toast.error(modalText);
                        }
                    });
            }
        });
    };

    let archiveSubscription = async (id, skipReload = false, skipToast = false, action = 'archive') => {
        let result = {isConfirmed: false};
        if (!skipToast)
            result = await swal.fire({
                target: document.querySelector(`#portal-elements-foreground`),
                text:
                    action === 'archive'
                        ? "Vuoi archiviare l'atleta selezionato?"
                        : "Vuoi rimuovere l'atleta dall'archivio?",
                icon: 'question',
                buttonsStyling: true,
                showCancelButton: true,
                cancelButtonText: 'Annulla',
                confirmButtonText: action === 'archive' ? 'Archivia' : 'Rimuovi',
                reverseButtons: true,
            });
        else result = {isConfirmed: true};
        if (result.isConfirmed) {
            if (!skipToast)
                KTApp.blockPage({
                    overlayColor: '#000000',
                    state: 'primary',
                    message: 'Archiviazione in corso...',
                });

            const url = replaceUID(__bakney.env.API.SUBSCRIPTION.ARCHIVE, id);

            let response = await window.fetch(url, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + $sessionToken,
                },
            });
            response.json();
            // spinner stop
            if (!skipToast) KTApp.unblockPage();
            if (response.status === 200) {
                if (!skipToast) toast.success('Iscrizione archiviata.');
                if (!skipReload) {
                    datatable?.reload();
                }
            } else {
                let modalText =
                    response.status === 403
                        ? 'Operazione non permessa.'
                        : 'Scusa, ho individuato degli errori, riprova.';
                toast.error(modalText);
            }
            return response;
        }
    };

    let deleteSubscription = id => {
        swal.fire({
            target: document.querySelector(`#portal-elements-foreground`),
            text: "Vuoi eliminare l'iscrizione?",
            icon: 'question',
            buttonsStyling: true,
            showCancelButton: true,
            cancelButtonText: 'Annulla',
            confirmButtonText: 'Elimina',
            reverseButtons: true,
        }).then(function (result) {
            if (result.isConfirmed) {
                KTApp.blockPage({
                    overlayColor: '#000000',
                    state: 'primary',
                    message: 'Eliminazione in corso...',
                });

                const url = replaceUID(__bakney.env.API.SUBSCRIPTION.DELETE, id);

                window
                    .fetch(url, {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            Authorization: 'Bearer ' + $sessionToken,
                        },
                    })
                    .then(response => {
                        response.json();
                        // spinner stop
                        KTApp.unblockPage();
                        if (response.status == 200) {
                            toast.success('Iscrizione Eliminata.');
                            datatable?.reload();
                        } else {
                            let modalText =
                                response.status == 403
                                    ? 'Operazione non permessa.'
                                    : 'Scusa, ho individuato degli errori, riprova.';
                            toast.error(modalText);
                        }
                    });
            }
        });
    };

    let acceptSubscription = async (id, skipReload = false, skipToast = false) => {
        let result = {isConfirmed: false};
        if (!skipToast)
            result = await swal.fire({
                target: document.querySelector(`#portal-elements-foreground`),
                text: "Vuoi accettare l'iscrizione?",
                icon: 'question',
                buttonsStyling: true,
                showCancelButton: true,
                cancelButtonText: 'Annulla',
                confirmButtonText: 'Approva',
                reverseButtons: true,
            });
        else result = {isConfirmed: true};
        if (result.isConfirmed) {
            if (!skipToast)
                KTApp.blockPage({
                    overlayColor: '#000000',
                    state: 'primary',
                    message: 'Approvazione in corso...',
                });

            const url = __bakney.env.HOST + '/subscription/' + id + '/approve';

            let response = await window.fetch(url, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + $sessionToken,
                },
            });
            response.json();
            // spinner stop
            if (!skipToast) KTApp.unblockPage();
            if (response.status == 200) {
                if (!skipToast) toast.success('Iscrizione Approvata con Successo.');
                if (!skipReload) {
                    datatable?.reload();
                }
            } else {
                let modalText =
                    response.status == 403
                        ? 'Operazione non permessa.'
                        : 'Scusa, ho individuato degli errori, riprova.';
                if (!skipToast) toast.error(modalText);
            }
            return response;
        }
    };

    async function fetchData() {
        let res = await apiFetch(replaceUID(__bakney.env.API.PERSONAS.INFO, associateId));
        if (res.status === 200) {
            return res.response;
        } else {
            toast.error('Errore nel caricamento dei dati');
            return null;
        }
    }

    onDestroy(() => {
        document.querySelectorAll('.popover').forEach(popover => popover.remove());
        document.querySelectorAll('.tooltip').forEach(popover => popover.remove());
    });
</script>

<div class="card card-custom gutter-b">
    <div class="card-body p-0 border-0">
        <div class="row">
            <div class="col-10 mt-2">
                <h3 class="card-label font-size-h2">
                    Iscrizioni
                    <span class="d-block text-muted pt-2 font-size-sm">Lista delle iscrizioni.</span>
                </h3>
            </div>
            <div class="col-2 mt-2 d-flex justify-content-end align-items-center">
                {#if canPerformAction('association.members.create')}
                    <button
                        class="btn btn-sm btn-primary font-weight-bolder d-flex align-items-center"
                        on:click={async () => {
                            let associate = await fetchData();
                            if (associate) {
                                // add subscription
                                let addModal = new AddSubscriptionModal({
                                    target: document.querySelector('#portal-elements-foreground'),
                                    props: {
                                        show: true,
                                        formData: {
                                            plan_id: '-',
                                            membership_plan_id: '-',
                                            associate: {...associate},
                                            type: 1,
                                            role: 1,
                                        },
                                    },
                                });

                                addModal.$on('confirm', e => {
                                    datatable.reload();
                                });
                            }
                        }}>
                        <PlusCircle size={16} class="mr-1" weight="bold" />
                        Iscrizione
                    </button>
                {/if}
            </div>
        </div>
        <KtDatatable
            bind:datatable
            showDividerFilter={false}
            url={replaceUID(__bakney.env.API.PERSONAS_SUBSCRIPTIONS.LIST, associateId)}
            columns={[
                {
                    field: 'is_current',
                    title: 'Anno',
                    checked: true,
                    sortable: false,
                    width: 100,
                    fireClick: true,
                    responsive: {
                        visible: 'xxl',
                        hidden: 'xl',
                    },
                    template: function (row) {
                        let key = row?.is_current && !row?.is_next_year ? 1 : 0;
                        if (row?.is_next_year) key = 3;
                        return statusCurrentYearDictionary[key];
                    },
                },
                {
                    field: 'medical',
                    title: 'Certificato',
                    checked: true,
                    sortable: false,
                    width: 150,
                    fireClick: true,
                    template: function (row) {
                        const currentDate = new Date();
                        const expirationDate = new Date(row.medical_expiration_date);
                        let daysLeft = Math.max(Math.floor((expirationDate - currentDate) / (1000 * 60 * 60 * 24)), 0);

                        if (row.age < 6 && __bakney.OEM_CONFIG?.showMinorExemption) {
                            return '<span class="font-weight-bolder"><span class="label label-secondary label-dot mr-2"></span>esente</span>';
                        }

                        let medicalCertificateKey = 'not_present';

                        if (row.medical != null) {
                            if (daysLeft <= 0) {
                                medicalCertificateKey = 'expired';
                            } else if (daysLeft <= 30) {
                                medicalCertificateKey = 'expiring';
                            } else {
                                medicalCertificateKey = 'valid';
                            }
                        }
                        return statusMedicalCertificateDictionary[medicalCertificateKey].replace('[DAYS]', daysLeft);
                    },
                },
                {
                    field: 'start_date',
                    title: 'Data Inizio',
                    sortable: true,
                    template: row => {
                        return `<div>${moment(row.start_date).format('DD/MM/YYYY')}</div>`;
                    },
                },
                {
                    field: 'end_date',
                    title: 'Data Fine',
                    sortable: true,
                    template: row => {
                        return `<div>${moment(row.end_date).format('DD/MM/YYYY')}</div>`;
                    },
                },
                {
                    field: 'created_at',
                    title: 'Creata il',
                    sortable: true,
                    template: row => {
                        return `<div>${moment(row.created_at).format('DD/MM/YYYY')}</div>`;
                    },
                },
                {
                    field: 'status',
                    title: 'Stato',
                    sortable: true,
                    template: row => {
                        return statusTextDictionary[row.status_flag];
                    },
                },
                {
                    field: 'actions',
                    title: '',
                    sortable: false,
                    width: 120,
                    textAlign: 'right',
                    minWidth: '100%',
                    overflow: 'visible',
                    autoHide: false,
                    template: function (row) {
                        waitForElementAndExecute(`#personas-subscriptions-action-col-${row.subscription_id}`, () => {
                            if (document.querySelector(`#personas-subscriptions-action-col-${row.subscription_id}`))
                                document.querySelector(
                                    `#personas-subscriptions-action-col-${row.subscription_id}`
                                ).innerHTML = '';

                            let disableApproval = row.status_flag && row.status_flag == 4;
                            let disableReject = row.status_flag && row.status_flag == 3;

                            if (row?.is_current && !row?.is_next_year) {
                                let approveBtn = new ApproveButton({
                                    target: document.querySelector(
                                        `#personas-subscriptions-action-col-${row.subscription_id}`
                                    ),
                                    intro: true,
                                    props: {
                                        disabled: disableApproval || !canPerformAction('association.members.update'),
                                        hidden: false,
                                        popover_text: 'Approva Iscrizione',
                                    },
                                });
                                approveBtn.$on('open', data => {
                                    acceptSubscription(row.subscription_id);
                                });
                                let rejectBtn = new XCircle({
                                    target: document.querySelector(
                                        `#personas-subscriptions-action-col-${row.subscription_id}`
                                    ),
                                    intro: true,
                                    props: {
                                        disabled: disableReject || !canPerformAction('association.members.update'),
                                        hidden: false,
                                        popover_text: 'Rifiuta Iscrizione',
                                    },
                                });
                                rejectBtn.$on('open', data => {
                                    rejectSubscription(row.subscription_id);
                                });
                            } else if (!row?.is_current && !row?.is_next_year) {
                                let renewBtn = new RepeatButton({
                                    target: document.querySelector(
                                        `#personas-subscriptions-action-col-${row.subscription_id}`
                                    ),
                                    intro: true,
                                    props: {
                                        disabled: !row.renewal_available,
                                        hidden: false,
                                        popover_text: !row.renewal_available
                                            ? 'Iscrizione già rinnovata'
                                            : 'Rinnova Iscrizione',
                                    },
                                });
                                renewBtn.$on('open', data => {
                                    let renewalModal = new RenewalModal({
                                        target: document.querySelector(
                                            `#personas-subscriptions-action-col-${row.subscription_id}`
                                        ),
                                        props: {
                                            id: row.subscription_id,
                                            show: true,
                                            formData: row,
                                        },
                                    });

                                    // listen for confirm event
                                    renewalModal.$on('confirm', data => {
                                        // reload datatable
                                        datatable?.reload();
                                        // delete renewal modal
                                        renewalModal.$destroy();
                                    });
                                });

                                if (row.archived) {
                                    let unarchiveBtn = new ArchiveButton({
                                        target: document.querySelector(
                                            `#personas-subscriptions-action-col-${row.subscription_id}`
                                        ),
                                        intro: true,
                                        props: {
                                            disabled: !canPerformAction('association.members.update'),
                                            hidden: false,
                                            popover_text: "Rimuovi dall'archivio",
                                        },
                                    });
                                    unarchiveBtn.$on('open', data => {
                                        archiveSubscription(row.subscription_id, false, false, 'unarchive');
                                    });
                                } else {
                                    let archiveBtn = new MoveToArchiveButton({
                                        target: document.querySelector(
                                            `#personas-subscriptions-action-col-${row.subscription_id}`
                                        ),
                                        intro: true,
                                        props: {
                                            disabled: !canPerformAction('association.members.update'),
                                            hidden: false,
                                            popover_text: 'Archivia Iscrizione',
                                        },
                                    });
                                    archiveBtn.$on('open', data => {
                                        archiveSubscription(row.subscription_id, false, false, 'archive');
                                    });
                                }
                            }
                            let deleteBtn = new DeleteButton({
                                target: document.querySelector(
                                    `#personas-subscriptions-action-col-${row.subscription_id}`
                                ),
                                intro: true,
                                props: {
                                    disabled: false,
                                },
                            });

                            deleteBtn.$on('open', data => {
                                deleteSubscription(row.subscription_id);
                            });
                        });
                        return `<div id="personas-subscriptions-action-col-${row.subscription_id}" class="action-column pr-4"></div>`;
                    },
                },
            ]}
            mapFunction={raw => {
                if (typeof raw.data !== 'undefined') {
                    return raw.data;
                }
                return [];
            }}
            serverPaging={true}
            serverFiltering={true}
            serverSorting={true} />
    </div>
</div>
