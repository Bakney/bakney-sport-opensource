<script>
    import AddEditModal from 'routes/accounting/payment/modals/AddEditModal.svelte';
    import SimpleButton from 'components/buttons/simple-button.svelte';
    import InvoicePreviewModal from 'components/modals/InvoicePreviewModal.svelte';
    import DetailDrawer from 'routes/association/Members/detail/DetailDrawer.svelte';
    import {push} from 'svelte-spa-router';
    import {createEventDispatcher, onDestroy, onMount} from 'svelte';
    import {
        CheckCircle,
        ClockClockwise,
        File,
        FileArrowDown,
        FileText,
        PencilSimple,
        Receipt,
        Share,
        ShareNetwork,
        Spinner,
        TrashSimple,
        XCircle,
    } from 'phosphor-svelte';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import DocumentPreviewModal from 'components/modals/DocumentPreviewModal.svelte';
    import {canPerformAction} from 'utils/Permissions';
    import {toast} from 'svelte-sonner';
    import ShareButton from 'components/buttons/ShareButton.svelte';
    import ShareModal from 'routes/accounting/receipts/modals/ShareModal.svelte';
    import EditModal from 'routes/accounting/receipts/modals/EditModal.svelte';
    import PersonaDrawer from 'routes/association/personas/detail/PersonaDrawer.svelte';

    const dispatch = createEventDispatcher();

    export let data;

    // Format currency amounts
    function formatCurrency(amount) {
        return parseFloat(amount).toLocaleString('it-IT', {
            style: 'currency',
            currency: 'EUR',
        });
    }

    // Format dates
    function formatDate(dateStr) {
        return new Date(dateStr).toLocaleDateString('it-IT');
    }

    function openPreview() {
        let pdfLink =
            __bakney.env.HOST +
            '/document/retrieve/' +
            data.invoice?.document_pdf +
            '?download=false&token=' +
            data.invoice?.document_token;

        new InvoicePreviewModal({
            target: document.getElementById('portal-elements-foreground'),
            props: {
                show: true,
                title: `Ricevuta n.${data.invoice.number}`,
                pdfLink: pdfLink,
                row: data.invoice,
                id: data.invoice.invoice_id,
                target: '#portal-elements-foreground',
            },
        });
    }

    async function checkInvoice(tries = 15) {
        if (tries <= 0) {
            data.invoice_generating = false;
            return;
        }
        let res = await apiFetch(`${__bakney.env.API.INVOICE.LIST}?query[invoice_id]=${data.invoice.invoice_id}`);
        if (res.response.data?.invoice?.document_pdf) {
            data.invoice = res.response.data.invoice;
            data.invoice_generating = false;
        } else {
            setTimeout(() => checkInvoice(tries - 1), 1200);
        }
    }

    let markAsPaid = async (id, payment_date, expense = false) => {
        payment_date = payment_date
            ? moment(new Date(payment_date)).format('YYYY-MM-DD')
            : moment().format('YYYY-MM-DD');
        swal.fire({
            target: document.getElementById('portal-elements-foreground'),
            title: expense ? 'Segna come pagato?' : 'Incassare il pagamento?',
            icon: 'question',
            buttonsStyling: true,
            html: `
            <div class="form-group px-4">
                <label for="payment_date font-weight-boldest">${!expense ? 'Data Incasso' : 'Data Pagamento'}</label>
                <input type="date" value=${payment_date} class="form-control form-control-solid form-control-lg" id="payment_date_${id}" value name="payment_date" placeholder="${
                !expense ? 'Data Incasso' : 'Data Pagamento'
            }" />
                <div id="receipt_email_container_${id}" style="display: ${expense ? 'none' : 'block'};">
                    <div class="form-group mt-6">
                        <div class="checkbox-inline font-weight-boldest font-size-sm">
                            <label class="checkbox">
                                <input type="checkbox" id="generate_invoice_${id}" checked>
                                <span></span>
                                Genera ricevuta
                            </label>
                        </div>
                        <div class="checkbox-inline font-weight-boldest font-size-sm">
                            <label class="checkbox">
                                <input type="checkbox" id="send_receipt_email_${id}">
                                <span></span>
                                Invia email
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            `,
            showCancelButton: true,
            cancelButtonText: 'Annulla',
            confirmButtonText: expense ? 'Segna come pagato' : 'Incassa',
            reverseButtons: true,
        }).then(async function (result) {
            if (result.isConfirmed) {
                KTApp.blockPage({
                    overlayColor: '#000000',
                    state: 'primary',
                    message: 'Conferma in corso...',
                });

                const url = __bakney.env.HOST + '/payment/' + id + '/approve';

                let body = {
                    payment_date: document.getElementById(`payment_date_${id}`).value || null,
                    send_receipt_email: document.getElementById(`send_receipt_email_${id}`).checked || false,
                    generate_invoice: document.getElementById(`generate_invoice_${id}`).checked || false,
                };

                let res = await apiFetch(url, {
                    method: 'POST',
                    body: JSON.stringify(body),
                });

                KTApp.unblockPage();
                if (res.status == 200 || res.status == 201) {
                    if (res.response.data.payment) {
                        data = res.response.data.payment;
                        if (data.invoice_generating && data.invoice.invoice_id) {
                            checkInvoice(15);
                        }
                    }
                    toast.success('Pagamento segnato come ' + (data.expense ? 'pagato' : 'incassato'));
                } else {
                    toast.error('Si è verificato un errore');
                }
            }
        });
    };

    let markAsUnpaid = async id => {
        swal.fire({
            target: document.getElementById('portal-elements-foreground'),
            title: 'Vuoi annullare il pagamento?',
            text: "Il pagamento verrà segnato come non pagato e sarà segnata come annullata l'eventuale ricevuta associata.",
            icon: 'warning',
            buttonsStyling: true,
            showCancelButton: true,
            cancelButtonText: 'Annulla',
            confirmButtonText: 'Conferma',
            reverseButtons: true,
            confirmButtonColor: '#d63030',
        }).then(async function (result) {
            if (result.isConfirmed) {
                KTApp.blockPage({
                    overlayColor: '#000000',
                    state: 'primary',
                    message: 'Annullamento in corso...',
                });

                const response = await apiFetch(replaceUID(__bakney.env.API.PAYMENT.CANCEL, id), {
                    method: 'POST',
                });

                KTApp.unblockPage();

                if (!response.error) {
                    if (response.response.data.payment) {
                        data = response.response.data.payment;
                    }
                    toast.success('Pagamento annullato!');
                } else {
                    toast.error('Qualcosa è andato storto.');
                }
            }
        });
    };

    let generateInvoice = function (id, subscription_id, onlyPrint = false) {
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Generazione ricevuta in corso...',
        });
        const url = replaceUID(__bakney.env.API.PAYMENT.GENERATE_INVOICE, id);
        apiFetch(url, {
            method: 'POST',
            body: JSON.stringify({
                subscription_id: subscription_id || null,
                only_print: onlyPrint || false,
            }),
        }).then(res => {
            KTApp.unblockPage();
            if (res.status == 200) {
                if (res.response.data.payment) {
                    data = res.response.data.payment;
                    if (data.invoice_generating && data.invoice.invoice_id) {
                        checkInvoice(15);
                    }
                }
                toast.success('Generazione stampa in corso...');
            } else {
                toast.error('Errore nella generazione della ricevuta.');
            }
        });
    };

    onMount(() => {
        if (data.invoice_generating && data.invoice.invoice_id) {
            checkInvoice(15);
        }
    });

    onDestroy(() => {
        dispatch('close');
    });
</script>

<div class="card card-custom gutter-b">
    <div class="card-body">
        {#if data}
            <div class="row mb-4 px-4">
                {#if !data.paid && canPerformAction('bookeeping.payments.update')}
                    <button
                        class="btn btn-primary d-flex align-items-center justify-content-center font-weight-boldest"
                        on:click={() => markAsPaid(data.payment_id, data.payment_date, data.expense)}>
                        <CheckCircle size={18} weight="bold" class="mr-1" />
                        {data.expense ? 'Segna Pagato' : 'Incassa'}
                    </button>
                {/if}
                {#if data.paid && canPerformAction('bookeeping.payments.update')}
                    <button
                        class="btn btn-light-danger d-flex align-items-center justify-content-center font-weight-boldest ml-2"
                        on:click={() => markAsUnpaid(data.payment_id)}>
                        <XCircle size={18} weight="bold" class="mr-1" />
                        Annulla {data.expense ? 'Pagamento' : 'Incasso'}
                    </button>
                {/if}
                {#if canPerformAction('bookeeping.payments.update')}
                    <button
                        class="btn btn-light-primary d-flex align-items-center justify-content-center font-weight-boldest ml-2"
                        on:click={() => {
                            let editModal = new AddEditModal({
                                target: document.getElementById(`portal-elements-foreground`),
                                props: {
                                    target: `#portal-elements-foreground`,
                                    show: true,
                                    data: {...data},
                                    edit: true,
                                },
                            });

                            editModal.$on('update', e => {
                                if (e.detail?.payment) {
                                    data = e.detail.payment;
                                }

                                editModal.$destroy();
                            });
                        }}>
                        <PencilSimple size={18} weight="bold" class="mr-1" />
                        Modifica
                    </button>
                {/if}

                {#if !data.expense && data.paid && !data.invoice && !data.invoice_generating}
                    <button
                        disabled={!data.subscription_id}
                        type="button"
                        class="btn btn-success font-weight-boldest d-flex align-items-center justify-content-center ml-2"
                        on:click={() => generateInvoice(data.payment_id, data.subscription_id)}
                        ><FileText size="18" weight="bold" class="mr-1" />Genera Ricevuta</button>
                {/if}
            </div>
            <div class="row">
                <div class="col-12">
                    <div class="d-flex flex-column">
                        <h3 class="font-weight-bolder mb-2 font-size-h3 mb-3">Dettagli Pagamento</h3>
                        <div class="text-dark-75">
                            <ul class="list-unstyled">
                                <li class="mb-2 border-bottom border-light pb-2">
                                    <div class="d-flex justify-content-between">
                                        <span class="font-weight-boldest font-size-lg">Importo</span>
                                        <span
                                            class="font-weight-boldest font-size-lg {data.expense
                                                ? 'text-danger'
                                                : 'text-success'}">
                                            {formatCurrency(data.amount)}
                                        </span>
                                    </div>
                                </li>
                                <li class="mb-2 border-bottom border-light pb-2">
                                    <div class="d-flex justify-content-between">
                                        <span class="font-weight-boldest font-size-lg">Data Creazione</span>
                                        <span class="font-weight-bolder">{formatDate(data.creation_date)}</span>
                                    </div>
                                </li>
                                <li class="mb-2 border-bottom border-light pb-2">
                                    <div class="d-flex justify-content-between">
                                        <span class="font-weight-boldest font-size-lg">Data Pagamento</span>
                                        <span class="font-weight-bolder"
                                            >{data.payment_date ? formatDate(data.payment_date) : '-'}</span>
                                    </div>
                                </li>
                                <li class="mb-2 border-bottom border-light pb-2">
                                    <div class="d-flex justify-content-between">
                                        <span class="font-weight-boldest font-size-lg">Stato</span>
                                        <span class="d-inline-block">
                                            <span
                                                class="label label-light-{data.paid
                                                    ? 'success'
                                                    : 'warning'} label-inline font-weight-bolder">
                                                {data.paid ? 'Pagato' : 'In attesa'}
                                            </span>
                                        </span>
                                    </div>
                                </li>
                                <li class="mb-2 border-bottom border-light pb-2">
                                    <div class="d-flex justify-content-between">
                                        <span class="font-weight-boldest font-size-lg">Tipo</span>
                                        <span class="d-inline-block">
                                            <span
                                                class="label label-light-{data.expense
                                                    ? 'danger'
                                                    : 'info'} label-inline font-weight-bolder">
                                                {data.expense ? 'Spesa' : 'Entrata'}
                                            </span>
                                        </span>
                                    </div>
                                </li>
                                <li class="mb-2 border-bottom border-light pb-2">
                                    <div class="d-flex justify-content-between">
                                        <span class="font-weight-boldest font-size-lg">Causale</span>
                                        <span class="font-weight-bolder">{data.payment_category_name || '-'}</span>
                                    </div>
                                </li>
                                {#if data.course?.label}
                                    <li class="mb-2 border-bottom border-light pb-2">
                                        <div class="d-flex justify-content-between">
                                            <span class="font-weight-boldest font-size-lg">Corso</span>
                                            <span class="font-weight-bolder">{data.course.label || '-'}</span>
                                        </div>
                                    </li>
                                {/if}
                                <li class="mb-2 border-bottom border-light pb-2">
                                    <div class="d-flex justify-content-between">
                                        <span class="font-weight-boldest font-size-lg">Descrizione</span>
                                        <span class="font-weight-bolder text-right">{data.description || '-'}</span>
                                    </div>
                                </li>
                                <li class="mb-2 border-bottom border-light pb-2">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <span class="font-weight-boldest font-size-lg">Associato a</span>
                                        <span class="font-weight-bolder">
                                            {#if data.associate && data.subscription_id}
                                                <SimpleButton
                                                    size="sm"
                                                    variant={'primary'}
                                                    classList="py-1 px-2 mb-0"
                                                    on:click={() => {
                                                        let detailDrawer = new DetailDrawer({
                                                            target: document.getElementById('portal-elements'),
                                                            props: {
                                                                isOpen: true,
                                                                subscriptionId: data.subscription_id,
                                                                title:
                                                                    data.associate.first_name +
                                                                    ' ' +
                                                                    data.associate.last_name,
                                                            },
                                                        });
                                                    }}
                                                    text="Dettagli Associato">
                                                    {data.associate?.first_name || ''}
                                                    {data.associate?.last_name || ''}
                                                </SimpleButton>
                                            {:else if data.associate && !data.subscription_id}
                                                <SimpleButton
                                                    size="sm"
                                                    variant={'primary'}
                                                    classList="py-1 px-2 mb-0"
                                                    on:click={() => {
                                                        let detailDrawer = new PersonaDrawer({
                                                            target: document.getElementById('portal-elements'),
                                                            props: {
                                                                isOpen: true,
                                                                associateId: data.associate.associate_id,
                                                                title:
                                                                    data.associate.first_name +
                                                                    ' ' +
                                                                    data.associate.last_name,
                                                            },
                                                        });
                                                    }}
                                                    text="Dettagli Associato">
                                                    {data.associate?.first_name || ''}
                                                    {data.associate?.last_name || ''}
                                                </SimpleButton>
                                            {:else if data.supplier}
                                                <SimpleButton
                                                    size="sm"
                                                    variant={'primary'}
                                                    classList="py-1 px-2 mb-0"
                                                    on:click={() => {
                                                        dispatch('close');
                                                        push('/suppliers-and-customers/list');
                                                    }}
                                                    text="Dettagli Fornitore/Cliente">
                                                    {data.supplier.name}
                                                </SimpleButton>
                                            {:else if data.instructor}
                                                <SimpleButton
                                                    size="sm"
                                                    variant={'primary'}
                                                    classList="py-1 px-2 mb-0"
                                                    on:click={() => {
                                                        dispatch('close');
                                                        push(
                                                            `/course/instructor/info/${data.instructor.instructor_id}`
                                                        );
                                                    }}
                                                    text="Dettagli Insegnante">
                                                    {data.instructor?.first_name || ''}
                                                    {data.instructor?.last_name || ''}
                                                </SimpleButton>
                                            {/if}
                                        </span>
                                    </div>
                                </li>
                                <li class="mb-2 border-bottom border-light pb-2">
                                    <div class="d-flex flex-column justify-content-between">
                                        <span class="font-weight-boldest font-size-lg">Note</span>
                                        <span
                                            style="white-space: pre-wrap;max-height: 200px;overflow-y: auto;"
                                            class=" text-justify">
                                            {data.notes || '-'}</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {#if data.instructor_document && data.instructor_document_token}
                <div class="row mt-4">
                    <div class="col-12">
                        <div class="text-right">
                            <SimpleButton
                                variant="dark"
                                on:click={() => {
                                    let pdfLink =
                                        __bakney.env.HOST +
                                        '/document/retrieve/' +
                                        data.instructor_document +
                                        '?download=false&token=' +
                                        data.instructor_document_token;

                                    new DocumentPreviewModal({
                                        target: document.getElementById('portal-elements-foreground'),
                                        props: {
                                            show: true,
                                            title: `Documento`,
                                            pdfLink: pdfLink,
                                            id: data.payment_id,
                                            target: '#portal-elements-foreground',
                                        },
                                    });
                                }}>
                                <File size={18} weight="bold" class="mr-1" />
                                Compenso
                            </SimpleButton>
                        </div>
                    </div>
                </div>
            {/if}

            {#if data.invoice}
                <div class="row mt-4">
                    <div class="col-12">
                        <div class="d-flex flex-column">
                            <h3 class="font-weight-bolder mb-2 font-size-h3 mb-3">Dettagli Ricevuta</h3>
                            <div class="text-dark-75">
                                <ul class="list-unstyled">
                                    <li class="mb-2 border-bottom border-light pb-2">
                                        <div class="d-flex justify-content-between">
                                            <span class="font-weight-boldest font-size-lg">Numero</span>
                                            <span class="font-weight-bolder">{data.invoice.number}</span>
                                        </div>
                                    </li>
                                    {#if data.invoice.cancelled}
                                        <li class="mb-2 border-bottom border-light pb-2">
                                            <div class="d-flex justify-content-between">
                                                <span class="font-weight-boldest font-size-lg">Stato</span>
                                                <span class="font-weight-bolder text-danger">ANNULLATA</span>
                                            </div>
                                        </li>
                                    {/if}
                                    <li class="mb-2 border-bottom border-light pb-2">
                                        <div class="d-flex justify-content-between">
                                            <span class="font-weight-boldest font-size-lg">Totale</span>
                                            <span class="font-weight-bolder"
                                                >{formatCurrency(
                                                    parseFloat(data.invoice.membership_fee) +
                                                        parseFloat(data.invoice.activity_fee)
                                                )}</span>
                                        </div>
                                    </li>
                                    <li class="mb-2 border-bottom border-light pb-2">
                                        <div class="d-flex flex-column justify-content-between">
                                            <span class="font-weight-boldest font-size-lg">Descrizione</span>
                                            <span style="white-space: pre-wrap;max-height: 200px;overflow-y: auto;"
                                                >{@html data.invoice.description}</span>
                                        </div>
                                    </li>
                                </ul>
                                {#if data.invoice.document_pdf}
                                    <div class="d-flex align-items-center mt-4" style="gap: 0.5rem;">
                                        <div class="text-right">
                                            <SimpleButton variant="dark" on:click={() => openPreview()}>
                                                <Receipt size={18} weight="bold" class="mr-1" />
                                                Ricevuta
                                            </SimpleButton>
                                        </div>
                                        <div class="text-right">
                                            <SimpleButton
                                                variant="light-primary"
                                                on:click={() => {
                                                    let editModal = new EditModal({
                                                        target: document.getElementById('portal-elements-foreground'),
                                                        intro: true,
                                                        props: {
                                                            id: data.invoice.invoice_id,
                                                            row: {
                                                                payment: {...data},
                                                                ...data.invoice,
                                                            },
                                                        },
                                                    });
                                                    jQuery(`#editModal-${data.invoice.invoice_id}`).modal('show');

                                                    editModal.$on('update', e => {
                                                        if (e.detail?.invoice) {
                                                            data.invoice = {...e.detail.invoice};
                                                            data.invoice_generating = true;
                                                            checkInvoice(15);
                                                        }

                                                        editModal.$destroy();
                                                    });
                                                }}>
                                                <PencilSimple size={18} weight="bold" />
                                            </SimpleButton>
                                        </div>
                                        {#if data.invoice.document_token}
                                            <div class="text-right">
                                                <SimpleButton
                                                    variant="light-success"
                                                    on:click={() => {
                                                        let pdfLink =
                                                            __bakney.env.HOST +
                                                            '/document/retrieve/' +
                                                            data.invoice.document_pdf;
                                                        let shareModal = new ShareModal({
                                                            target: document.getElementById(
                                                                'portal-elements-foreground'
                                                            ),
                                                            intro: true,
                                                            props: {
                                                                id: data.invoice.invoice_id,
                                                                row: data.invoice,
                                                                pdfLink:
                                                                    pdfLink +
                                                                        '?download=true&token=' +
                                                                        data.invoice.document_token || '',
                                                            },
                                                        });
                                                        jQuery(`#shareModal-${data.invoice.invoice_id}`).modal('show');
                                                    }}>
                                                    <ShareNetwork size={18} weight="bold" />
                                                </SimpleButton>
                                            </div>
                                        {/if}
                                        {#if canPerformAction('bookeeping.documents.invoices.delete')}
                                            <div class="text-right">
                                                <SimpleButton
                                                    variant="light-danger"
                                                    on:click={() => {
                                                        swal.fire({
                                                            target: '#portal-elements-foreground',
                                                            title: 'Sei sicuro?',
                                                            text: 'Questa azione non può essere annullata e lo stato del pagamento sarà modificato in "In attesa".',
                                                            icon: 'warning',
                                                            showCancelButton: true,
                                                            confirmButtonText: 'Sì, elimina',
                                                            cancelButtonText: 'Annulla',
                                                            customClass: {
                                                                confirmButton: 'btn btn-danger font-weight-boldest',
                                                                cancelButton: 'btn btn-secondary font-weight-boldest',
                                                            },
                                                            buttonsStyling: false,
                                                            reverseButtons: true,
                                                            confirmButtonColor: '#d63030',
                                                        }).then(async result => {
                                                            if (result.isConfirmed) {
                                                                KTApp.blockPage({
                                                                    overlayColor: '#000000',
                                                                    state: 'primary',
                                                                    message: 'Eliminazione in corso...',
                                                                });

                                                                const response = await apiFetch(
                                                                    replaceUID(
                                                                        __bakney.env.API.INVOICE.DELETE,
                                                                        data.invoice.invoice_id
                                                                    ),
                                                                    {
                                                                        method: 'POST',
                                                                    }
                                                                );

                                                                KTApp.unblockPage();

                                                                if (!response.error) {
                                                                    data.invoice = null;
                                                                    toast.success('Ricevuta eliminata con successo');
                                                                } else {
                                                                    toast.error(
                                                                        "Errore durante l'eliminazione della ricevuta"
                                                                    );
                                                                }
                                                                dispatch('close');
                                                            }
                                                        });
                                                    }}>
                                                    <TrashSimple size={18} weight="bold" />
                                                </SimpleButton>
                                            </div>
                                        {/if}
                                    </div>
                                {:else if data.invoice && !data.invoice.document_pdf && !data.invoice_generating}
                                    <button
                                        disabled={!data.subscription_id}
                                        type="button"
                                        class="btn btn-light-success font-weight-boldest d-flex align-items-center justify-content-center m-0"
                                        on:click={() => generateInvoice(data.payment_id, data.subscription_id, true)}
                                        ><ClockClockwise size="18" weight="bold" class="mr-1" />
                                        Rigenera Stampa
                                    </button>
                                {:else if data.invoice && data.invoice_generating}
                                    <div class="text-right mt-4">
                                        <SimpleButton variant="light-warning" disabled>
                                            <Spinner size={18} weight="bold" class="mr-1 animate-spin" />
                                            Ricevuta in generazione
                                        </SimpleButton>
                                    </div>
                                {/if}
                            </div>
                        </div>
                    </div>
                </div>
            {/if}

            {#if data.attachments?.length > 0}
                <div class="mb-4 mt-4">
                    <h3 class="mb-4 font-weight-bolder">Allegati</h3>
                    <ul class="list-unstyled">
                        {#each data.attachments as attachment}
                            <li class="mb-2 border-bottom border-light pb-2">
                                <div class="d-flex align-items-center">
                                    <a
                                        href={`/api/documents/${attachment.document_id}?token=${attachment.token}`}
                                        target="_blank"
                                        class="text-primary font-weight-bolder d-flex align-items-center">
                                        <File size={18} weight="bold" class="mr-2" />
                                        <span class="font-weight-bolder font-size-lg">{attachment.filename}</span>
                                    </a>
                                </div>
                            </li>
                        {/each}
                    </ul>
                </div>
            {/if}
        {/if}
    </div>
</div>

<svelte:head>
    <style>
        .animate-spin {
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
        }
    </style>
</svelte:head>
