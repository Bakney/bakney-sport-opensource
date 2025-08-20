<script>
    import {createEventDispatcher} from 'svelte';
    import {sessionToken} from 'store/stores.js';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware.js';
    import {ArrowSquareOut, FileArrowUp, PaperPlaneTilt, FileArrowDown, PlusCircle, Trash} from 'phosphor-svelte';
    import {canPerformAction} from 'utils/Permissions';
    import KtDatatable from 'components/tables/KTDatatable.svelte';
    import {waitForElementAndExecute} from 'utils/Functions';
    import DeleteButton from 'components/buttons/DeleteButton.svelte';
    import DocumentButton from 'components/buttons/DocumentButton.svelte';
    import DocumentPreviewModal from 'components/modals/DocumentPreviewModal.svelte';
    import AddMedicalAppointment from './modals/AddMedicalAppointment.svelte';
    import {toast} from 'svelte-sonner';
    import AddMedicalCertificate from './modals/AddMedicalCertificate.svelte';

    const dispatch = createEventDispatcher();

    export let info = {};
    let certificate_expring_date = moment().format('DD/MM/YYYY');
    let isValid = false;
    let certificateMode = 'all';
    let uploadedFile = false;
    let aiSuggestion = false;
    let datatable;
    let showAddMedicalAppointmentModal = false;

    $: {
        isValid = !moment(certificate_expring_date, 'DD/MM/YYYY').isBefore(moment());
    }

    async function sendEmailNotification() {
        swal.fire({
            target: '#portal-elements-foreground',
            text: 'Vuoi inviare un promemoria via email?',
            icon: 'question',
            buttonsStyling: true,
            showCancelButton: true,
            cancelButtonText: 'Annulla',
            confirmButtonText: 'Invia Email',
            reverseButtons: true,
        }).then(async function (result) {
            if (result.isConfirmed) {
                KTApp.blockPage({
                    overlayColor: '#000000',
                    state: 'primary',
                    message: 'Invio in corso...',
                });

                let res = await apiFetch(
                    replaceUID(
                        __bakney.env.API.SUBSCRIPTION.MEDICAL_CERTIFICATE.SEND_EMAIL_REMINDER,
                        info.subscription_id
                    ),
                    {
                        method: 'POST',
                    }
                );

                if (res.status === 200) {
                    toast.success('Email Inviata con Successo.');
                } else {
                    toast.error("Errore durante l'invio dell'email.");
                }

                KTApp.unblockPage();
            }
        });
    }

    function getRemainingDays(row) {
        const currentDate = new Date();
        const expirationDate = new Date(row.medical_expiration_date);

        return Math.max(Math.floor((expirationDate - currentDate) / (1000 * 60 * 60 * 24)), 0);
    }

    async function updateCertificateSettings(e) {
        if (!e) return toast.error("Errore durante l'aggiornamento del certificato, riprova.");
        let res = await apiFetch(
            replaceUID(__bakney.env.API.SUBSCRIPTION.MEDICAL_CERTIFICATE.EDIT, info.subscription_id),
            {
                method: 'POST',
                body: JSON.stringify({
                    subscription_id: info.subscription_id,
                    competitive_medical_certificate: e?.target?.checked,
                }),
            }
        );
        if (res.status === 200) {
            toast.success('Certificato Aggiornato con Successo.');
        } else {
            toast.error("Errore durante l'aggiornamento del certificato, riprova.");
        }
    }
</script>

{#if info?.medical}
    <div class="row pt-2 pb-4">
        <div class="col-12 mb-4">
            <div class="row">
                <div class="col-12 col-md-5 my-auto py-4 py-md-0">
                    <div class="font-weight-bolder my-auto">
                        <div class="font-size-h2 font-weight-bolder pb-2">Informazioni certificato medico</div>
                        {#if info.medical_expiration_date}
                            <span class="font-size-md font-weight-bold">
                                Certificato medico <b>{info?.competitive_medical_certificate ? 'AGONISTICO' : ''}</b>
                                valido fino al
                                <span class="text-dark font-weight-boldest"
                                    >{new Date(info.medical_expiration_date).toLocaleDateString('it-IT')}</span>
                                ({getRemainingDays(info)} giorni rimanenti).
                            </span>
                        {:else}
                            <span class="text-dark-75">scadenza non presente, </span>
                            <!-- svelte-ignore a11y-missing-attribute -->
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <!-- svelte-ignore a11y-no-static-element-interactions -->
                            <a
                                on:click={() => {
                                    let medicalCertificateModal = new AddMedicalCertificate({
                                        target: document.querySelector('#portal-elements'),
                                        props: {
                                            show: true,
                                            id: info.subscription_id,
                                            mode: 'only-date',
                                        },
                                    });

                                    medicalCertificateModal.$on('update', () => {
                                        // destroy the modal
                                        medicalCertificateModal.$destroy();
                                        setTimeout(() => {
                                            dispatch('reset', 'medical');
                                        }, 1000);
                                    });
                                }}
                                class="text-primary"
                                style="cursor: pointer">impostala ora!</a>
                        {/if}
                        <div class="input-group px-0 mt-1">
                            <span class="switch switch-sm switch-icon m-auto px-0" style="margin-left: 0px !important;"
                                ><label
                                    ><input
                                        disabled={!canPerformAction('association.members.update')}
                                        on:change={updateCertificateSettings}
                                        bind:checked={info.competitive_medical_certificate}
                                        type="checkbox" />
                                    <span /></label
                                ><span class="font-weight-bold font-size-md ml-2">Certificato medico agonistico</span
                                ></span>
                        </div>
                    </div>
                </div>
                <div class="col-12 col-md-7 my-auto text-md-right py-4 py-md-0">
                    <!-- svelte-ignore a11y-missing-attribute -->
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    {#if !info.archived}
                        <a
                            on:click={sendEmailNotification}
                            class="btn btn-xs btn-light-primary font-weight-bolder my-auto my-2 m-1">
                            <PaperPlaneTilt size={18} weight="duotone" class="mr-0 mr-md-1" />
                            Notifica via email
                        </a>
                        {#if canPerformAction('association.members.update')}
                            <!-- svelte-ignore a11y-missing-attribute -->
                            <button
                                on:click={() => {
                                    let medicalCertificateModal = new AddMedicalCertificate({
                                        target: document.querySelector('#portal-elements'),
                                        props: {
                                            show: true,
                                            id: info.subscription_id,
                                            mode: 'all',
                                        },
                                    });

                                    medicalCertificateModal.$on('update', () => {
                                        // destroy the modal
                                        medicalCertificateModal.$destroy();
                                        setTimeout(() => {
                                            dispatch('reset', 'medical');
                                        }, 1000);
                                    });
                                }}
                                class="btn btn-xs btn-light-primary font-weight-bolder my-auto my-2 m-1">
                                <FileArrowUp size={18} weight="duotone" class="mr-0 mr-md-1" />
                                Sostituisci certificato
                            </button>
                            <button
                                on:click={async () => {
                                    // swal to confirm
                                    let result = await swal.fire({
                                        title: 'Sei sicuro di voler rimuovere il certificato?',
                                        text: 'Questa azione è irreversibile.',
                                        icon: 'warning',
                                        showCancelButton: true,
                                        reverseButtons: true,
                                        confirmButtonText: 'Rimuovi',
                                        cancelButtonText: 'Annulla',
                                    });
                                    if (result.isConfirmed) {
                                        KTApp.blockPage({
                                            overlayColor: '#000000',
                                            state: 'primary',
                                            message: 'Salvataggio...',
                                        });

                                        const res = await apiFetch(
                                            replaceUID(
                                                __bakney.env.API.SUBSCRIPTION.MEDICAL_CERTIFICATE
                                                    .SET_CERTIFICATE_EXPIRATION,
                                                info.subscription_id
                                            ),
                                            {
                                                method: 'POST',
                                                body: JSON.stringify({
                                                    subscription_id: info.subscription_id,
                                                    certificate_expiring_date: null,
                                                }),
                                            }
                                        );

                                        KTApp.unblockPage();

                                        if (res.status === 200) {
                                            toast.success('Certificato medico rimosso con successo');
                                            setTimeout(() => {
                                                dispatch('reset', 'medical');
                                            }, 1000);
                                        } else {
                                            toast.error('Errore durante la rimozione del certificato medico');
                                        }
                                    }
                                }}
                                class="btn btn-xs btn-light-danger font-weight-bolder my-auto my-2 m-1">
                                <Trash size={18} weight="duotone" class="mr-0 mr-md-1" />
                                Rimuovi
                            </button>
                        {/if}
                    {/if}
                    {#if info.medical_token}
                        <a
                            href="javascript:downloadPdf('{__bakney.env.HOST +
                                '/document/retrieve/' +
                                info.medical_document}')"
                            class="btn btn-xs btn-light-primary font-weight-bolder my-2 m-1">
                            <FileArrowDown size={18} weight="duotone" class="mr-0 mr-md-1" />
                            Scarica
                        </a>
                        <a
                            href={__bakney.env.HOST +
                                '/document/retrieve/' +
                                info.medical_document +
                                '?token=' +
                                $sessionToken}
                            target="_blank"
                            data-toggle="tooltip"
                            title="Anteprima certificato medico"
                            class="btn btn-primary btn-sm font-weight-bolder my-2 m-1">
                            <ArrowSquareOut size={18} weight="duotone" /> Apri
                        </a>
                    {/if}
                </div>
            </div>
            <div class="row mt-4 d-none">
                <div class="col-12">
                    <div class="font-weight-bolder my-auto">
                        <div class="font-size-h4 font-weight-bolder pb-2">Note</div>
                        <div>
                            <textarea
                                class="form-control form-control-solid form-control-lg"
                                rows="10"
                                placeholder="Inserisci qui le tue note"
                                style="resize: none;">{info.notes || ''}</textarea>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
{:else}
    <div class="row pt-4 pb-4">
        <div class="col-12 d-flex">
            <img
                src="static/empty_state.png"
                class="w-50 m-auto"
                alt="no medical certificate"
                style="filter:hue-rotate(251deg);max-width: 15rem;" />
        </div>
        <div class="col-12 d-flex">
            <span class="font-weight-bolder text-black m-auto"> nessun certificato medico presente </span>
        </div>

        <div class="col-12 d-flex mt-4">
            {#if !info.archived}
                <!-- svelte-ignore a11y-missing-attribute -->
                <button
                    disabled={!canPerformAction('association.members.update')}
                    data-toggle="modal"
                    data-target="#uploadMedicalCertificateModalDetails"
                    on:click={() => {
                        let medicalCertificateModal = new AddMedicalCertificate({
                            target: document.querySelector('#portal-elements'),
                            props: {
                                show: true,
                                id: info.subscription_id,
                                mode: 'all',
                            },
                        });

                        medicalCertificateModal.$on('update', () => {
                            // destroy the modal
                            medicalCertificateModal.$destroy();
                            setTimeout(() => {
                                dispatch('reset', 'medical');
                            }, 1000);
                        });
                    }}
                    class="btn btn-xs btn-primary font-weight-bolder m-auto d-flex align-items-center">
                    <PlusCircle size={18} weight="duotone" class="mr-1" />
                    Nuovo Certificato
                </button>
            {/if}
        </div>
    </div>
{/if}

<hr />

<div class="font-size-h2 font-weight-bolder pb-10 pt-8 d-flex justify-content-between">
    <div>Visite mediche</div>
    {#if canPerformAction('association.members.update')}
        <button
            class="btn btn-sm btn-primary font-weight-bolder align-items-center"
            on:click={() => {
                showAddMedicalAppointmentModal = true;
            }}>
            <PlusCircle weight="duotone" size={18} class="mr-1" />
            Visita medica
        </button>
    {/if}
</div>

<KtDatatable
    id="kt_datatable_medical"
    searchId="kt_datatable_search_query_medical"
    bind:KTDatatable={datatable}
    showDividerFilter={false}
    columns={[
        {
            field: 'appointment_region',
            title: 'Tipo visita',
            sortable: false,
            autoHide: false,
            width: 200,
            textAlign: 'left',
            template: row => {
                return `
                        <span class="font-weight-boldest">
                            ${row.appointment_region}
                        </span>
                        `;
            },
        },
        {
            field: 'date',
            title: 'Creata il',
            width: 120,
            type: 'date',
            responsive: {
                visible: 'lg',
                hidden: 'md',
            },
            sortCallback: function (data, sort, column) {
                let dataArray = Object.values(data);
                dataArray.sort(function (a, b) {
                    let timeA = new Date(a['date']).getTime();
                    let timeB = new Date(b['date']).getTime();
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
                return row.date ? moment(new Date(row.date)).format('DD/MM/YYYY') : '-';
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
                let pdfLink =
                    __bakney.env.HOST +
                    '/document/retrieve/' +
                    row.document +
                    '?download=false&token=' +
                    row.document_token;
                waitForElementAndExecute(`#action-col-${row.medical_appointments_id}`, () => {
                    if (document.querySelector(`#action-col-${row.medical_appointments_id}`))
                        document.querySelector(`#action-col-${row.medical_appointments_id}`).innerHTML = '';

                    let documentButton = new DocumentButton({
                        target: document.querySelector(`#action-col-${row.medical_appointments_id}`),
                        intro: true,
                        props: {
                            disabled: false,
                            popover_text: `Visita medica ${
                                row.date ? moment(new Date(row.date)).format('DD/MM/YYYY') : '-'
                            }`,
                        },
                    });

                    documentButton.$on('open', data => {
                        let filePreview = new DocumentPreviewModal({
                            target: document.querySelector(`#action-col-${row.medical_appointments_id}`),
                            intro: true,
                            props: {
                                pdfLink: pdfLink,
                                row: row,
                                id: row.medical_appointments_id,
                                title: `Visita medica ${
                                    row.date ? moment(new Date(row.date)).format('DD/MM/YYYY') : '-'
                                }`,
                            },
                        });
                    });

                    let deleteBtn = new DeleteButton({
                        target: document.querySelector(`#action-col-${row.medical_appointments_id}`),
                        intro: true,
                        props: {
                            disabled: !canPerformAction('association.members.update'),
                            popover_text: 'Elimina',
                        },
                    });

                    deleteBtn.$on('open', data => {
                        swal.fire({
                            title: 'Eliminare la risposta?',
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
                                        replaceUID(
                                            __bakney.env.API.SUBSCRIPTION.MEDICAL_APPOINTMENTS.DELETE,
                                            info.subscription_id
                                        ),
                                        row.medical_appointments_id,
                                        '<med_app_uid>'
                                    ),
                                    {
                                        method: 'DELETE',
                                    }
                                );
                                if (res.status === 200) {
                                    datatable.reload();
                                    toast.success('Eliminata con successo');
                                } else {
                                    toast.error("Errore nell'eliminazione");
                                }
                            }
                        });
                    });
                });
                return `<div id="action-col-${row.medical_appointments_id}" class="action-column pr-4"></div>`;
            },
        },
    ]}
    url={replaceUID(__bakney.env.API.SUBSCRIPTION.MEDICAL_APPOINTMENTS.LIST, info.subscription_id)}
    mapFunction={raw => {
        if (typeof raw.data !== 'undefined') {
            return raw.data;
        }
    }}
    serverPaging={false}
    serverFiltering={false}
    serverSorting={false} />

<AddMedicalAppointment bind:show={showAddMedicalAppointmentModal} {datatable} bind:id={info.subscription_id} />
