<script>
    import QrCode from 'svelte-qrcode';
    import * as easing from 'svelte/easing';
    import {scale} from 'svelte/transition';
    import {onMount} from 'svelte';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware.js';
    import {ArrowClockwise, ArrowLeft, ArrowRight, Clipboard, PlusCircle} from 'phosphor-svelte';
    import SimpleCarousel from 'components/lists/SimpleCarousel.svelte';
    import SimpleCard from 'components/cards/simple-card.svelte';
    import AddModal from './modals/AddModal.svelte';
    import {EURcurrency, waitForElementAndExecute} from 'utils/Functions.js';
    import LongTextPopover from 'components/popovers/LongTextPopover.svelte';
    import DeleteButton from 'components/buttons/DeleteButton.svelte';
    import {canPerformAction} from 'utils/Permissions.js';
    import KtDatatable from 'components/tables/KTDatatable.svelte';
    import AddSubscriptionModal from './modals/AddSubscriptionModal.svelte';
    import EditButton from 'components/buttons/EditButton.svelte';
    import EditSubscriptionModal from './modals/EditSubscriptionModal.svelte';
    import {toast} from 'svelte-sonner';
    import BackButton from 'components/buttons/BackButton.svelte';

    export let params;

    let data;
    let datatable;

    async function fetchData() {
        let res = await apiFetch(replaceUID(__bakney.env.API.CAMPS_AND_RETREATS.INFO, params.id), {
            method: 'GET',
        });

        if (res.status === 200) {
            data = res.response.data;
        } else {
            toast.error('Errore nel recupero dei dati.');
        }
    }

    onMount(async () => {
        await fetchData();
    });
</script>

<div class="card mx-2 mx-md-4" in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}}>
    <div class="mx-0 mx-md-3 mt-4 mt-md-0 d-flex justify-content-between align-items-center mb-4">
        <div>
            <BackButton />
        </div>
        <div>
            <h3 class="font-size-h4 font-size-h2-md font-weight-bold text-dark">{data?.title}</h3>
        </div>
    </div>

    <div
        class="mx-0 mx-md-3 d-flex flex-column flex-md-row align-items-center justify-content-between px-3 py-3 border rounded-xl">
        <QrCode
            value="{__bakney.env.DOMAIN}/#/camps-and-retreats/forms/{String(data?.camps_and_retreats_id).toLowerCase()}"
            size={KTUtil.isMobileDevice() ? 120 : 80} />
        <div class="px-4 text-center text-md-left">
            <h3 class="py-4 py-md-0 font-size-h3 font-weight-bolder">
                Condividi il link per raccogliere le iscrizioni al Camp/Ritiro
            </h3>
            <a
                href="{__bakney.env.DOMAIN}/#/camps-and-retreats/forms/{String(
                    data?.camps_and_retreats_id
                ).toLowerCase()}"
                target="_blank"
                class="py-4 py-md-0 text-primary font-size-xl font-weight-bold">
                {__bakney.env.DOMAIN}/#/camps-and-retreats/forms/{String(data?.camps_and_retreats_id).toLowerCase()}
            </a>
        </div>
        <button
            class="btn btn-icon btn-sm btn-dark mr-0 mr-md-4 mb-0 mt-4 mt-md-0 font-weight-bolder font-size-lg"
            onclick="navigator.clipboard.writeText('{__bakney.env.DOMAIN}/#/camps-and-retreats/forms/{String(
                data?.camps_and_retreats_id
            ).toLowerCase()}');toast.success('Link copiato nella clipboard')">
            <Clipboard size={18} weight="duotone" />
        </button>
    </div>
    <h2 class="mx-0 mx-md-3 my-8 font-weight-bolder text-center">Settimane o periodi</h2>

    <div class="mx-0 mx-md-3">
        <SimpleCarousel>
            {#each Array.from(data?.periods || []) as period}
                <SimpleCard>
                    <div slot="header">
                        {period?.title}
                        <div class="font-size-sm font-weight-bold">
                            {period?.start_date} - {period?.end_date}
                        </div>
                    </div>
                    <div slot="content">
                        <span class="text-primary border rounded-lg py-1 px-2 bg-light font-weight-boldest">
                            {EURcurrency.format(parseFloat(String(period.fee).replace(',', '.') || 0))}
                        </span>
                        <div class="mt-4 h-60px">
                            <LongTextPopover text={period?.description || 'Nessuna descrizione'} title="Descrizione" />
                        </div>
                    </div>
                    <div slot="footer">
                        <a
                            href="/#/course/camps-and-retreats/overview/{params.id}/detail/{period.camps_and_retreats_period_id}"
                            class="btn btn-primary btn-sm flex align-items-center mb-2 font-weight-bolder">
                            Dettagli
                            <ArrowRight weight="bold" class="ml-1" />
                        </a>
                    </div>
                </SimpleCard>
            {/each}
            {#if canPerformAction('association.campsandretreats.create')}
                <div class="d-flex align-items-center justify-content-center border rounded-lg py-24 px-12">
                    <button
                        on:click={() => {
                            let modal = new AddModal({
                                target: document.body,
                                props: {
                                    show: true,
                                    id: data?.camps_and_retreats_id,
                                },
                            });

                            modal.$on('close', () => {
                                modal.$destroy();
                            });

                            modal.$on('update', e => {
                                fetchData();
                            });
                        }}
                        class="btn btn-primary btn-sm mb-0 mx-8 w-auto d-flex align-items-center font-weight-bolder">
                        <PlusCircle size={18} weight="duotone" class="mr-1" />
                        Periodo
                    </button>
                </div>
            {/if}
        </SimpleCarousel>
    </div>

    <div class="mx-0 mx-md-3">
        <div class="d-flex justify-content-between align-items-center mx-0 mt-8">
            <h2 class="font-weight-bolder text-center">Iscritti</h2>
            {#if canPerformAction('association.campsandretreats.create')}
                <button
                    class="btn btn-sm btn-primary font-weight-bolder d-flex align-items-center"
                    on:click={() => {
                        let modal = new AddSubscriptionModal({
                            target: document.body,
                            props: {
                                show: true,
                                id: data?.camps_and_retreats_id,
                                data: data,
                            },
                        });

                        modal.$on('close', () => {
                            modal.$destroy();
                        });

                        modal.$on('update', e => {
                            fetchData();
                            datatable?.reload();
                        });
                    }}>
                    <PlusCircle size={18} weight="duotone" class="mr-1" />
                    Atleta
                </button>
            {/if}
        </div>

        <KtDatatable
            bind:datatable
            columns={[
                {
                    field: 'subscription',
                    title: 'Atleta',
                    sortable: true,
                    autoHide: false,
                    width: 120,
                    minWidth: '100%',
                    textAlign: 'left',
                    template: row => {
                        return `
                                    <a href="/#/members/list/detail/${
                                        row.subscription.subscription_id
                                    }/info" class="font-weight-boldest">
                                        ${row.subscription.associate.first_name || '-'}
                                        ${row.subscription.associate.last_name || ''}
                                    </a>
                                    `;
                    },
                },
                {
                    field: 'periods',
                    title: 'Iscritto ai seguenti periodi',
                    sortable: true,
                    autoHide: false,
                    minWidth: '100%',
                    textAlign: 'left',
                    template: row => {
                        return `
                                    <div class="d-flex flex-wrap gap-2">
                                        ${row.periods.map(
                                            period =>
                                                `<span class="label label-inline label-outline-secondary mb-1 mt-0 ml-1 mr-0">${period.camps_and_retreats_period.title}</span>`
                                        )}
                                    </div>
                                    `;
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
                        waitForElementAndExecute(`#action-col-${row.camps_and_retreats_subscription_id}`, () => {
                            if (document.querySelector(`#action-col-${row.camps_and_retreats_subscription_id}`))
                                document.querySelector(
                                    `#action-col-${row.camps_and_retreats_subscription_id}`
                                ).innerHTML = '';

                            let editBtn = new EditButton({
                                target: document.querySelector(`#action-col-${row.camps_and_retreats_subscription_id}`),
                                intro: true,
                                props: {
                                    // disabled: !canPerformAction('association.modules.edit'),
                                    popover_text: 'Modifica',
                                },
                            });

                            editBtn.$on('open', () => {
                                let modal = new EditSubscriptionModal({
                                    target: document.body,
                                    props: {
                                        show: true,
                                        id: row.camps_and_retreats_subscription_id,
                                        data: {
                                            ...data,
                                            row: row,
                                        },
                                        datatable: datatable,
                                    },
                                });

                                modal.$on('close', () => {
                                    modal.$destroy();
                                });

                                modal.$on('update', e => {
                                    fetchData();
                                    datatable?.reload();
                                });
                            });

                            let deleteBtn = new DeleteButton({
                                target: document.querySelector(`#action-col-${row.camps_and_retreats_subscription_id}`),
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
                                                __bakney.env.API.CAMPS_AND_RETREATS.SUBSCRIPTIONS.DELETE,
                                                row.camps_and_retreats_subscription_id
                                            ),
                                            {
                                                method: 'DELETE',
                                            }
                                        );
                                        if (res.status === 200) {
                                            toast.success('Eliminato con successo');
                                        } else {
                                            toast.error("Errore nell'eliminazione");
                                        }
                                    }
                                    datatable.reload();
                                });
                            });
                        });
                        return `<div id="action-col-${row.camps_and_retreats_subscription_id}" class="action-column pr-4"></div>`;
                    },
                },
            ]}
            url={replaceUID(__bakney.env.API.CAMPS_AND_RETREATS.SUBSCRIPTIONS.LIST, params.id)}
            mapFunction={raw => {
                if (typeof raw.data !== 'undefined') {
                    return raw.data;
                }
                return [];
            }}
            showDividerFilter={false}
            serverPaging={false}
            serverFiltering={false}
            serverSorting={false}>
            <div class="d-flex align-items-center justify-content-end" slot="search-header">
                <button
                    class="btn btn-light btn-sm font-weight-bolder mb-0"
                    on:click={() => {
                        datatable.reload();
                    }}>
                    <ArrowClockwise size={16} weight="bold" />
                </button>
            </div>
        </KtDatatable>
    </div>
</div>

<!--<pre class="w-100 p-8 mt-24">-->
<!--    {JSON.stringify(data, null, 2)}-->
<!--</pre>-->
