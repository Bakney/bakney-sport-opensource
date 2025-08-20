<script>
    import {ArrowCircleRight, ArrowRight, Eye, Pencil, PencilSimple, ThumbsUp, Ticket} from 'phosphor-svelte';
    import {permissions} from 'store/stores';
    import {onMount} from 'svelte';
    import {link, push} from 'svelte-spa-router';
    import {apiFetch} from 'utils/ApiMiddleware';
    import {isFreePlan} from 'utils/Permissions';

    permissions.useLocalStorage();

    let data = {
        expiring_carnets: [],
    };
    let loading = true;

    function fetchData() {
        apiFetch(`${__bakney.env.HOST}/statistic/dashboard?widget=expiringcarnets`, {
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
    <div class="border-0 pt-6 mb-0 px-8">
        <h3 class="card-title align-items-start flex-column mb-0 text-center">
            <span class="card-label font-weight-bolder font-size-h4">Carnet in esaurimento</span>
        </h3>
    </div>
    <!--end::Header-->
    <!--begin::Body-->
    <div class="card-body d-flex mx-0 mt-3 mb-0 pb-3 py-0 px-1 scroll scroll-pull" style="overflow-x:auto">
        {#if Array.from(data.expiring_carnets).length === 0}
            <div
                class="d-flex flex-column align-items-center w-full h-full justify-content-center m-auto"
                style="margin: auto !important;">
                <ThumbsUp size={60} class="my-4" weight="duotone" />
                <span class="font-size-lg font-weight-bolder text-muted">Nessun carnet in scadenza</span>
            </div>
        {:else}
            <div class="d-flex justify-content-start align-items-center flex-grow-1 pr-4">
                {#each data.expiring_carnets as carnet}
                    <div
                        class="font-weight-bolder border-right border-light"
                        style="width: 10.5rem;max-width:10.5rem;min-width:10.5rem;">
                        <div class="d-flex justify-content-center flex-column align-items-center">
                            <span
                                class="font-weight-boldest font-size-md text-primary text-center px-2"
                                style="max-width:10.5rem;">{carnet?.carnet?.title}</span>
                            <span
                                class="font-weight-bolder text-dark-75 font-size-xs text-center px-2 mt-2"
                                style="max-width:10.5rem;"
                                >{moment(new Date(carnet?.carnet?.creation_date)).format('DD/MM/YYYY')}</span>
                            <span
                                class="font-weight-boldest text-dark font-size-xs text-center px-2 mb-2 mt-1"
                                style="max-width:10.5rem;"
                                >{carnet?.subscription?.associate?.first_name?.toUpperCase() || ''}<br />
                                {carnet?.subscription?.associate?.last_name?.toUpperCase() || ''}</span>

                            <span
                                class="font-weight-boldest border font-size-sm text-center rounded-lg px-2 mb-2"
                                style="max-width:10.5rem;"
                                ><span class={carnet?.carnet?.meta?.lessons_left > 1 ? 'text-warning' : 'text-danger'}>
                                    {carnet?.carnet?.meta?.lessons_left}
                                </span>
                                <span class="text-primary">/ {carnet?.carnet?.meta?.lessons_counter}</span>
                            </span>
                        </div>
                        <div class="d-flex justify-content-center mt-1">
                            {#if isFreePlan()}
                                <a
                                    href="/subscription/upgrade"
                                    use:link
                                    class="d-flex align-items-center btn btn-outline-secondary btn-sm py-1 px-2 font-weight-boldest">
                                    Modifica
                                </a>
                            {:else}
                                <a
                                    href="/members/list/detail/{carnet?.subscription?.subscription_id}/carnet"
                                    use:link
                                    class="d-flex align-items-center btn btn-outline-secondary btn-sm py-1 px-2 font-weight-boldest">
                                    Modifica
                                </a>
                            {/if}
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
