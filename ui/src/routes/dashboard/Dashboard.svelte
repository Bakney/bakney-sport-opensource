<script>
    import ExpiredPayments from 'components/widgets/ExpiredPayments.svelte';
    import {sessionToken} from 'store/stores.js';
    import {scale} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import {FloppyDisk, Pencil, PlusCircle, Rectangle, Repeat, TrashSimple, Warning} from 'phosphor-svelte';
    import {apiFetch} from 'utils/ApiMiddleware';
    import {dndzone} from 'svelte-dnd-action';
    import Associates from 'components/widgets/Associates.svelte';
    import Payments from 'components/widgets/Payments.svelte';
    import BestCourses from 'components/widgets/BestCourses.svelte';
    import Subscriptions from 'components/widgets/Subscriptions.svelte';
    import TodayLessons from 'components/widgets/TodayLessons.svelte';
    import ExpiringCarnets from 'components/widgets/ExpiringCarnets.svelte';
    import SubscriptionsToApprove from 'components/widgets/SubscriptionsToApprove.svelte';
    import ExpiringMedicalCertificates from 'components/widgets/ExpiringMedicalCertificates.svelte';
    import WidgetModal from 'components/modals/WidgetModal.svelte';
    import {userData} from 'store/stores';
    import IncomeAndExpenses from 'components/widgets/IncomeAndExpenses.svelte';
    import ExpiredMedicalCertificates from 'components/widgets/ExpiredMedicalCertificates.svelte';
    import {toast} from 'svelte-sonner';

    sessionToken.useLocalStorage();

    let componentsMap = {
        associates: {
            component: Associates,
            title: 'Soci',
            description: "Scopri quanti soci si sono iscritti nell'ultimo mese.",
            defaultSize: 6,
            supportedSizes: [4, 6, 8, 12],
        },
        payments: {
            component: Payments,
            title: 'Pagamenti incassati',
            description: "Scopri quanto hai incassato nell'ultimo mese.",
            defaultSize: 6,
            supportedSizes: [4, 6, 8, 12],
        },
        bestcourses: {
            component: BestCourses,
            title: 'I 3 corsi con più iscritti',
            description: 'Scopri quali sono i 3 corsi con più iscritti.',
            defaultSize: 6,
            supportedSizes: [4, 6, 8, 12],
        },
        subscriptions: {
            component: Subscriptions,
            title: 'Tesserati e Soci anno corrente',
            description: "Scopri lo stato delle iscrizioni di soci e tesserati per l'anno corrente.",
            defaultSize: 4,
            supportedSizes: [4, 6, 8],
        },
        todaylessons: {
            component: TodayLessons,
            title: 'Registro presenze lezioni',
            description: 'Scopri quali lezioni sono in programma oggi e segna la presenza degli iscritti.',
            defaultSize: 4,
            supportedSizes: [4, 6, 8, 12],
        },
        expiringcarnets: {
            component: ExpiringCarnets,
            title: 'Carnet in esaurimento',
            description: 'Scopri quali carnet stanno per esaurirsi',
            defaultSize: 4,
            supportedSizes: [4, 6, 8, 12],
        },
        subscriptionstoapprove: {
            component: SubscriptionsToApprove,
            title: 'Iscrizioni da approvare',
            description: 'Scopri quanti soci devi ancora approvare.',
            defaultSize: 4,
            supportedSizes: [4, 6, 8, 12],
        },
        expiringmedicalcertificates: {
            component: ExpiringMedicalCertificates,
            title: 'Certificati medici in scadenza',
            description: 'Scopri quali certificati medici stanno per scadere e sono scaduti.',
            defaultSize: 4,
            supportedSizes: [4, 6, 8, 12],
        },
        incomeAndExpenses: {
            component: IncomeAndExpenses,
            title: 'Entrate e spese',
            description: "Scopri quanto hai incassato e speso oggi, nell'ultimo mese e da inizio anno.",
            defaultSize: 4,
            supportedSizes: [4, 6, 8, 12],
        },
        expiredPayments: {
            component: ExpiredPayments,
            title: 'Pagamenti scaduti o in scadenza oggi',
            description: 'Scopri quali pagamenti sono scaduti o scadono oggi.',
            defaultSize: 4,
            supportedSizes: [4, 6, 8, 12],
        },
        expiredmedicalcertificates: {
            component: ExpiredMedicalCertificates,
            title: 'Certificati medici scaduti',
            description: 'Scopri quali certificati medici sono scaduti.',
            defaultSize: 4,
            supportedSizes: [4, 6, 8, 12],
        },
    };

    let dragDisabled = true;
    let showAddWidget = false;
    let defaultLayout = {
        rows: [
            [
                {
                    id: 'associates',
                    size: 6,
                },
                {
                    id: 'payments',
                    size: 6,
                },
                {
                    id: 'subscriptions',
                    size: 4,
                },
                {
                    id: 'subscriptionstoapprove',
                    size: 8,
                },
                {
                    id: 'bestcourses',
                    size: 4,
                },
                {
                    id: 'expiringmedicalcertificates',
                    size: 4,
                },
                {
                    id: 'todaylessons',
                    size: 4,
                },
            ],
        ],
    };
    let dashboardLayout = JSON.parse(JSON.stringify($userData?.dashboard_layout || defaultLayout));

    const flipDurationMs = 120;

    function handleSort(row, e) {
        dashboardLayout.rows[row] = e.detail.items;
    }
</script>

<div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}} class="d-flex flex-column-fluid">
    <div class="container">
        <h1 class="font-size-h2 font-weight-boldest text-dark px-4 px-md-0">Bacheca</h1>
        {#if dashboardLayout}
            {#each Array.from(dashboardLayout.rows) as row, rIdx}
                <div class="row statistics gutter-b mt-1">
                    <section
                        class="min-w-100 d-flex flex-wrap align-items-center"
                        style="min-height: 200px;"
                        use:dndzone={{
                            items: row,
                            flipDurationMs,
                            dragDisabled,
                            dropTargetStyle: {
                                border: '2px dashed #0000001a',
                                borderRadius: '0.5rem',
                            },
                        }}
                        on:consider={e => {
                            handleSort(rIdx, e);
                            dashboardLayout.blockRow = rIdx;
                        }}
                        on:finalize={e => {
                            handleSort(rIdx, e);
                            dashboardLayout.blockRow = null;
                        }}>
                        {#each Object.values(row) as col, index (col.id)}
                            <div class="col-12 col-md-{col.size} rounded-lg mt-4 px-0 px-md-2">
                                {#if componentsMap[col.id]}
                                    {#if !dragDisabled}
                                        <div
                                            transition:scale={{
                                                duration: 100,
                                                delay: 0,
                                                start: 0.95,
                                                easing: easing.cubicInOut,
                                            }}
                                            style="z-index: 1000; position: absolute !important; right: 0px; margin: 0 2rem; top: -1.5rem !important;"
                                            class="bg-white position-relative d-flex justify-content-end p-2 rounded-lg shadow-lg">
                                            <div class="btn-group mr-3" role="group" aria-label="Component size">
                                                {#each componentsMap[col.id].supportedSizes as size}
                                                    <button
                                                        style="min-width: 2rem;"
                                                        class="d-flex align-items-center justify-content-center font-weight-boldest btn btn-sm btn-{col.size ==
                                                        size
                                                            ? 'primary'
                                                            : 'light-primary'} p-0 mb-0"
                                                        on:click={() => {
                                                            dashboardLayout.rows[rIdx] = dashboardLayout.rows[rIdx].map(
                                                                item =>
                                                                    item.id === col.id
                                                                        ? {
                                                                              ...item,
                                                                              size,
                                                                          }
                                                                        : item
                                                            );
                                                        }}>
                                                        <Rectangle size={2 + size} weight="fill" />
                                                    </button>
                                                {/each}
                                            </div>
                                            <button
                                                style="min-width: 2rem;"
                                                class="btn btn-sm btn-light-danger font-weight-bolder p-1 mb-0"
                                                on:click={() => {
                                                    dashboardLayout.rows[rIdx] =
                                                        dashboardLayout.rows[rIdx].filter(item => item.id !== col.id) ||
                                                        [];
                                                }}>
                                                <TrashSimple weight="fill" size={16} />
                                            </button>
                                        </div>
                                    {/if}
                                    <svelte:component this={componentsMap[col.id]?.component} />
                                {:else}
                                    <div
                                        style="min-height: 200px!important;margin: auto!important"
                                        class="d-flex align-items-center justify-content-center flex-column text-warning font-weight-boldest border rounded-lg d-flex min-h-100 align-items-center justify-content-center">
                                        <Warning weight="duotone" size={25} />
                                        Widget non trovato
                                    </div>
                                {/if}
                            </div>
                        {/each}
                    </section>
                </div>
            {/each}
        {/if}

        <!--end::Row-->
        <div
            class="d-none d-md-flex justify-content-center p-0 pb-2"
            style="position: fixed; bottom: 0; right:1rem;z-index:1000">
            {#if !dragDisabled}
                <button
                    in:scale={{duration: 120, delay: 20, start: 0.9, easing: easing.cubicInOut}}
                    class="btn btn-sm btn-dark font-weight-boldest align-items-center justify-content-center mr-3"
                    on:click={() => (showAddWidget = true)}>
                    <PlusCircle weight="duotone" size={18} /> Aggiungi widget
                </button>
                <!-- reset -->
                <button
                    in:scale={{duration: 120, delay: 0, start: 0.9, easing: easing.cubicInOut}}
                    class="btn btn-sm btn-danger font-weight-boldest align-items-center justify-content-center mr-3"
                    on:click={() => {
                        dashboardLayout = null;
                        setTimeout(() => {
                            dashboardLayout = JSON.parse(JSON.stringify(defaultLayout));
                        }, 300);
                        // remove focus from button
                        document.activeElement.blur();
                    }}>
                    <Repeat weight="duotone" class="mr-1" size={18} /> Ripristina default
                </button>
            {/if}
            <button
                class="btn btn-sm btn-{dragDisabled
                    ? 'dark'
                    : 'primary'} font-weight-boldest align-items-center justify-content-center"
                on:click={async () => {
                    dragDisabled = !dragDisabled;
                    // remove focus from button
                    document.activeElement.blur();
                    if (!dragDisabled) return;
                    let res = await apiFetch(__bakney.env.API.STATISTIC.DASHBOARD_LAYOUT, {
                        method: 'POST',
                        body: JSON.stringify({
                            dashboard_layout: dashboardLayout,
                        }),
                    });

                    if (!res.error) {
                        toast.success('Layout salvato con successo');
                        $userData.dashboard_layout = JSON.parse(JSON.stringify(dashboardLayout));
                    } else {
                        toast.error('Si è verificato un errore.');
                    }
                }}>
                {#if dragDisabled}
                    <Pencil weight="duotone" size="18" /> Modifica
                {:else}
                    <FloppyDisk weight="duotone" size="18" /> Salva
                {/if}
            </button>
        </div>
    </div>
</div>

{#if showAddWidget}
    <WidgetModal bind:show={showAddWidget} bind:componentsMap bind:dashboardLayout id="addWidget" />
{/if}
