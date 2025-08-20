<script>
    import QrCode from 'svelte-qrcode';
    import DeleteButton from 'components/buttons/DeleteButton.svelte';
    import EyeButton from 'components/buttons/EyeButton.svelte';
    import KtDatatable from 'components/tables/KTDatatable.svelte';
    import {onMount} from 'svelte';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import {waitForElementAndExecute} from 'utils/Functions';
    import ResponseModal from './modals/ResponseModal.svelte';
    import ApproveButton from 'components/buttons/ApproveButton.svelte';
    import {ArrowsClockwise, Clipboard, FileArrowDown, PencilSimple} from 'phosphor-svelte';
    import {canPerformAction} from 'utils/Permissions';
    import SimpleButton from 'components/buttons/simple-button.svelte';
    import {push} from 'svelte-spa-router';
    import {toast} from 'svelte-sonner';
    import BackButton from 'components/buttons/BackButton.svelte';

    export let params;

    let data = {};
    let datatable;

    async function fetchData() {
        let res = await apiFetch(replaceUID(__bakney.env.API.MODULES.OVERVIEW, params.module_id));

        if (res.status === 200) {
            data = res.response.data;
        } else {
            toast.error('Errore nel caricamento dei dati');
        }
    }

    async function exportResponses() {
        let res = await apiFetch(replaceUID(__bakney.env.API.MODULES.EXPORT, params.module_id), {
            method: 'GET',
        });

        if (res.status === 200) {
            window.downloadFile(
                res.response.data.filename,
                res.response.data.file,
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
        } else {
            toast.error("Errore nell'esportazione delle risposte");
        }
    }

    onMount(() => {
        fetchData();
    });
</script>

<div class="card mx-2 mx-md-4">
    <div class="mx-0 mx-md-2 d-flex justify-content-between align-items-center mb-4 mt-8 mt-md-0">
        <div>
            <BackButton />
        </div>
        <div>
            <h3 class="font-size-h4 font-size-h2-md font-weight-bold">{data.title}</h3>
        </div>
        <div>
            <SimpleButton
                on:click={() => {
                    push(`/members/modules/composer/${params.module_id}`);
                }}>
                <PencilSimple size={18} weight="bold" class="mr-2" />
                Modifica
            </SimpleButton>
        </div>
    </div>
    <div
        class="mx-0 mx-md-2 d-flex flex-column flex-md-row align-items-center justify-content-between px-3 py-3 border rounded-xl">
        <QrCode
            value="{__bakney.env.DOMAIN}/#/forms/{String(data.custom_link).toLowerCase()}"
            size={KTUtil.isMobileDevice() ? 120 : 80} />
        <div class="px-4 text-center text-md-left">
            <h3 class="py-4 py-md-0 font-size-h3 font-weight-bolder">
                Condividi il link per raccogliere risposte al modulo
            </h3>
            <a
                href="{__bakney.env.DOMAIN}/#/forms/{String(data.custom_link).toLowerCase()}"
                target="_blank"
                class="py-4 py-md-0 text-primary font-size-xl font-weight-bold">
                {__bakney.env.DOMAIN}/#/forms/{String(data.custom_link).toLowerCase()}
            </a>
        </div>
        <button
            class="btn btn-icon btn-sm btn-dark mr-0 mr-md-4 mb-0 mt-4 mt-md-0 font-weight-bolder font-size-lg"
            on:click={() => {
                navigator.clipboard.writeText(
                    `${__bakney.env.DOMAIN}/#/forms/${String(data.custom_link).toLowerCase()}`
                );
                toast.success('Link copiato nella clipboard');
            }}>
            <Clipboard size={18} weight="duotone" />
        </button>
    </div>

    <div class="mb-3 mt-8 mx-0 mx-md-2">
        {#if data.enabled || data.always_active}
            <span class="label font-weight-bold label-light-success label-inline label-lg my-1 mx-1"
                >Modulo visibile</span>
        {:else}
            <span class="label label-light-danger label-inline font-weight-bold label-lg my-1 mx-1"
                >Modulo nascosto</span>
        {/if}

        <!-- max_responses -->
        {#if data.max_responses}
            <span
                class="label label-light-{data.responses.length < data.max_responses
                    ? 'danger'
                    : 'success'} label-inline font-weight-bold label-lg my-1 mx-1"
                >risposte
                {data.max_responses} / {data.responses.length}</span>
        {:else}
            <span class="label label-light label-inline font-weight-bold label-lg my-1 mx-1">risposte illimitate</span>
        {/if}

        <!-- Widget queue mode -->
        {#if data.queue_mode}
            <span class="label label-light label-inline font-weight-bold label-lg my-1 mx-1"
                >coda di attesa attiva</span>
        {/if}

        <!-- Accept answer from -->
        {#if data.only_users}
            <span class="label label-light label-inline font-weight-bold label-lg my-1 mx-1"
                >risposte solo da utenti registrati</span>
        {:else}
            <span class="label label-light label-inline font-weight-bold label-lg my-1 mx-1">risposte da tutti</span>
        {/if}

        <!-- Require approval -->
        {#if data.require_approval}
            <span class="label label-light label-inline font-weight-bold label-lg my-1 mx-1"
                >approvazione richiesta</span>
        {:else}
            <span class="label label-light label-inline font-weight-bold label-lg my-1 mx-1"
                >approvazione non richiesta</span>
        {/if}
    </div>

    <div class="card-header flex-wrap border-0 py-0 px-3 d-flex justify-content-between">
        <div class="card-title">
            <h3 class="card-label font-size-h2">
                Risposte modulo
                <span class="d-block text-muted pt-2 font-size-sm"
                    >Visualizza, approva o elimina le risposte al modulo.</span>
            </h3>
        </div>
        <div class="card-toolbar">
            <button class="btn btn-light-primary font-weight-bolder mr-1 btn-sm" on:click={exportResponses}>
                <FileArrowDown size={16} class="mr-1" weight="bold" />
                <span class="font-weight-bolder"> Esporta </span>
            </button>
            <button class="btn btn-icon btn-primary font-weight-bolder btn-sm" on:click={() => location.reload()}>
                <ArrowsClockwise size={16} weight="bold" />
            </button>
        </div>
    </div>
    <div class="card-body py-0 px-3">
        <KtDatatable
            bind:datatable
            columns={[
                {
                    field: 'module_response_id',
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
                    field: 'progressive_response_number',
                    title: '#',
                    sortable: true,
                    autoHide: false,
                    width: 40,
                    textAlign: 'left',
                    template: row => {
                        return `
                        <span class="font-weight-boldest">
                            ${row.progressive_response_number + 1}
                        </span>
                        `;
                    },
                },
                {
                    field: 'queue_position',
                    title: 'Coda',
                    sortable: true,
                    autoHide: false,
                    width: 60,
                    textAlign: 'left',
                    template: row => {
                        return `
                        <span class="font-weight-boldest">
                            ${row.queue_position || '-'}
                        </span>
                        `;
                    },
                },
                {
                    field: 'approved',
                    title: 'Approvata',
                    sortable: true,
                    autoHide: false,
                    width: 100,
                    textAlign: 'left',
                    template: row => {
                        return `
                        <span class="font-weight-boldest">
                            ${row.approved ? 'Si' : 'No'}
                        </span>
                        `;
                    },
                },
                {
                    field: 'creation_date',
                    title: 'Creata il',
                    width: 120,
                    type: 'date',
                    responsive: {
                        visible: 'xl',
                        hidden: 'lg',
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
                        return moment(new Date(row.creation_date)).format('DD/MM/YYYY HH:MM');
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
                        waitForElementAndExecute(`#action-col-${row.module_response_id}`, () => {
                            if (document.querySelector(`#action-col-${row.module_response_id}`))
                                document.querySelector(`#action-col-${row.module_response_id}`).innerHTML = '';

                            if (!row.approved) {
                                let approveBtn = new ApproveButton({
                                    target: document.querySelector(`#action-col-${row.module_response_id}`),
                                    intro: true,
                                    props: {
                                        disabled: !canPerformAction('association.modules.update'),
                                        popover_text: 'Approva',
                                    },
                                });
                                approveBtn.$on('open', data => {
                                    // approveInvoice(row.module_response_id);
                                    swal.fire({
                                        title: 'Approvare la risposta?',
                                        text: 'Questa azione è irreversibile.',
                                        icon: 'warning',
                                        showCancelButton: true,
                                        buttonsStyling: true,
                                        reverseButtons: true,
                                        confirmButtonText: 'Approva',
                                        cancelButtonText: 'Annulla',
                                    }).then(async result => {
                                        if (result.isConfirmed) {
                                            let res = await apiFetch(
                                                replaceUID(
                                                    __bakney.env.API.MODULES.RESPONSE.APPROVE,
                                                    row.module_response_id
                                                ),
                                                {
                                                    method: 'POST',
                                                }
                                            );
                                            if (res.status === 200) {
                                                datatable.reload();
                                                toast.success('Risposta approvata con successo');
                                            } else {
                                                toast.error("Errore nell'approvazione della risposta");
                                            }
                                        }
                                    });
                                });
                            }

                            let visualizeBtn = new EyeButton({
                                target: document.querySelector(`#action-col-${row.module_response_id}`),
                                intro: true,
                                props: {
                                    disabled: !canPerformAction('association.modules.read'),
                                    popover_text: 'Visualizza',
                                },
                            });

                            visualizeBtn.$on('open', x => {
                                let modal = new ResponseModal({
                                    target: document.querySelector(`#action-col-${row.module_response_id}`),
                                    props: {
                                        id: row.module_response_id,
                                        show: true,
                                        data: row,
                                        elements: data?.elements || [],
                                    },
                                });
                            });

                            let deleteBtn = new DeleteButton({
                                target: document.querySelector(`#action-col-${row.module_response_id}`),
                                intro: true,
                                props: {
                                    disabled: !canPerformAction('association.modules.delete'),
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
                                                __bakney.env.API.MODULES.RESPONSE.DELETE,
                                                row.module_response_id
                                            ),
                                            {
                                                method: 'DELETE',
                                            }
                                        );
                                        if (res.status === 200) {
                                            datatable.reload();
                                            toast.success('Risposta eliminata con successo');
                                        } else {
                                            toast.error("Errore nell'eliminazione della risposta");
                                        }
                                    }
                                });
                            });
                        });
                        return `<div id="action-col-${row.module_response_id}" class="action-column pr-4"></div>`;
                    },
                },
            ]}
            url={replaceUID(__bakney.env.API.MODULES.OVERVIEW, params.module_id)}
            mapFunction={raw => {
                if (typeof raw.data?.responses !== 'undefined') {
                    return raw.data?.responses;
                }
            }}
            serverPaging={false}
            serverFiltering={false}
            serverSorting={false} />
    </div>
</div>

<!-- <pre class="mx-24 p-4 font-size-xs border rounded-xl bg-light text-dark">
{JSON.stringify(params)}

{JSON.stringify(data, null, 2)}
</pre> -->
