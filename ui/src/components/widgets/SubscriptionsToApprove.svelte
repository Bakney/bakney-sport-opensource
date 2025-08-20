<script>
    import CurrentViewPrintingModal from 'components/modals/CurrentViewPrintingModal.svelte';
    import {
        ArrowCircleRight,
        ArrowRight,
        CheckCircle,
        Eye,
        Pencil,
        Printer,
        ThumbsUp,
        Ticket,
        XCircle,
    } from 'phosphor-svelte';
    import {onMount} from 'svelte';
    import {toast} from 'svelte-sonner';
    import {link, push} from 'svelte-spa-router';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';

    let data = {
        subscriptions_to_approve: [],
    };
    let loading = true;

    function approveSubscription(subscriptionId) {
        swal.fire({
            title: 'Sei sicuro?',
            text: "Vuoi accettare l'iscrizione?",
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Approva',
            cancelButtonText: 'Annulla',
            reverseButtons: true,
        }).then(result => {
            if (result.isConfirmed) {
                apiFetch(replaceUID(__bakney.env.API.SUBSCRIPTION.APPROVE, subscriptionId), {
                    method: 'POST',
                }).then(res => {
                    if (!res.error) {
                        fetchData();
                        toast.success('Socio approvato.');
                    } else {
                        toast.error('Si è verificato un errore.');
                    }
                });
            }
        });
    }

    function rejectSubscription(subscriptionId) {
        swal.fire({
            title: 'Sei sicuro?',
            text: "Vuoi rifiutare l'iscrizione?",
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Rifiuta',
            cancelButtonText: 'Annulla',
            reverseButtons: true,
        }).then(result => {
            if (result.isConfirmed) {
                apiFetch(replaceUID(__bakney.env.API.SUBSCRIPTION.REJECT, subscriptionId), {
                    method: 'POST',
                }).then(res => {
                    if (!res.error) {
                        fetchData();
                        toast.success('Socio rifiutato.');
                    } else {
                        toast.error('Si è verificato un errore.');
                    }
                });
            }
        });
    }

    function fetchData() {
        apiFetch(`${__bakney.env.HOST}/statistic/dashboard?widget=subscriptionstoapprove`, {
            method: 'GET',
        }).then(res => {
            loading = false;
            if (!res.error) {
                data = res.response.data;
            }
        });
    }

    onMount(async () => {
        fetchData();
    });
</script>

<div
    class="card card-widget card-custom rounded-xl overflow-hidden bg-white card-stretch dashboard-widget"
    style="max-height: fit-content;">
    <!--begin::Header-->
    <div class="border-0 pt-6 mb-0 px-8 d-flex justify-content-between">
        <h3 class="card-title align-items-start flex-column mb-0 text-center">
            <span class="card-label font-weight-bolder font-size-h4">Iscrizioni da approvare</span>
        </h3>
        <button
            class="btn btn-sm btn-primary font-weight-bolder py-2 px-3"
            on:click={() => {
                // implement the CurrentViewPrintingModal
                let endpointWithQueryString =
                    __bakney.env.API.SUBSCRIPTION.LIST + '?' + 'query[current_year]=1&query[status_flag]=1,2';
                let printingModal = new CurrentViewPrintingModal({
                    target: document.querySelector(`#portal-elements`),
                    intro: true,
                    props: {
                        title: `Stampa soci da approvare`,
                        endpointWithQueryString: endpointWithQueryString,
                    },
                });
            }}>
            <Printer size={14} class="mr-1" weight="duotone" />
            Stampa
        </button>
    </div>
    <!--end::Header-->
    <!--begin::Body-->
    <div class="card-body d-flex mx-0 mt-3 mb-0 pb-3 py-0 px-1 scroll scroll-pull" style="overflow-x:auto">
        {#if Array.from(data.subscriptions_to_approve).length === 0}
            <div class="d-flex flex-column align-items-center w-full h-full justify-content-center m-auto">
                <ThumbsUp size={60} class="my-4" weight="duotone" />
                <span class="font-size-lg font-weight-bolder text-muted">Nessun socio da approvare</span>
            </div>
        {:else}
            <div class="d-flex justify-content-start align-items-center flex-grow-1 pr-4">
                {#each data.subscriptions_to_approve as item}
                    <div
                        class="font-weight-bolder mt-2 border-right border-light"
                        style="width: 11rem;max-width:11rem;min-width:11rem;">
                        <div class="d-flex justify-content-center flex-column align-items-center">
                            <a
                                href="/members/list/detail/{item?.subscription_id}/info"
                                use:link
                                class="font-weight-boldest font-size-sm text-primary text-center px-2 mb-1 d-flex align-items-end justify-content-center"
                                style="max-width:11rem;max-height:6rem;height:3.8rem;"
                                >{item?.associate?.first_name?.toUpperCase() || ''}<br />
                                {item?.associate?.last_name?.toUpperCase() || ''}</a>
                            <span
                                class="font-weight-bold font-size-xs text-center px-2 mb-1 my-2"
                                style="max-width:11rem;">
                                {#if item?.creation_date}
                                    <span class="font-size-sm font-weight-boldest">
                                        {moment(new Date(item?.creation_date)).format('DD/MM/YYYY')}
                                    </span>
                                {:else}
                                    mancante
                                {/if}
                            </span>

                            <span class="font-weight-boldest text-center px-2 my-2" style="max-width:11rem;">
                                <span
                                    class="label label-light-{item?.status == 2
                                        ? 'warning'
                                        : 'danger'} label-inline font-weight-bolder label-xs">
                                    {item?.status == 2 ? 'in attesa' : 'non firmata'}
                                </span>
                            </span>
                        </div>
                        <div class="d-flex justify-content-center mt-2">
                            <button
                                on:click={() => approveSubscription(item?.subscription_id)}
                                class="d-flex align-items-center btn btn-ghost text-secondary btn-xs btn-icon font-weight-bolder mr-2">
                                <CheckCircle size={22} weight="duotone" />
                            </button>
                            <button
                                on:click={() => rejectSubscription(item?.subscription_id)}
                                class="d-flex align-items-center btn btn-ghost text-secondary btn-xs btn-icon font-weight-bolder">
                                <XCircle size={22} weight="duotone" />
                            </button>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
    <!--end::Body-->
</div>

<style>
    ::-webkit-scrollbar {
        height: 0.8rem; /* height of horizontal scrollbar ← You're missing this */
        width: 1rem; /* width of vertical scrollbar */
    }
</style>
