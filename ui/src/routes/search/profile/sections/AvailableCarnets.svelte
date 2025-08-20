<script>
    import {Ticket} from 'phosphor-svelte';
    import {scale} from 'svelte/transition';
    import BuyCarnetFor from '../../modals/BuyCarnetFor.svelte';
    import {onMount} from 'svelte';
    import {apiFetch} from 'utils/ApiMiddleware';

    export let searchData;
    export let loadProfile;
    let associates;

    onMount(async () => {
        fetchData();
    });

    async function fetchData() {
        let res = await apiFetch(__bakney.env.API.SUBSCRIPTION.LIST, {method: 'GET'});
        if (!res.error) {
            associates = (Object.values(res.response.data) || [])
                .filter(x => x.sport_association.sport_association_id == searchData.sport_association_id)
                .map(x => {
                    return {
                        subscription_id: x.subscription_id,
                        full_name: x.associate.first_name + ' ' + x.associate.last_name,
                        selected: false,
                        courses: [...x.courses],
                    };
                });
        }
    }
</script>

<!-- <AvailableCourses bind:loadProfile bind:searchData /> -->
{#if searchData?.carnets?.length > 0}
    <div class="row">
        <div class="col d-flex align-items-center justify-content-center mb-5" style="margin: auto;">
            <Ticket size={34} weight="duotone" class="mr-2" />
            <!-- svelte-ignore a11y-missing-attribute -->
            <span class="font-size-h1 font-weight-bold">Carnet Acquistabili</span>
        </div>
    </div>
{/if}

<div class="row">
    {#each searchData?.carnets || [] as carnet, idx}
        {#if carnet.public}
            <div class="col-xl-4" in:scale={{start: 0.9, duration: 80, delay: 40 * idx}}>
                <!--begin::Stats Widget 10-->
                <div class="card card-widget card-custom card-stretch gutter-b bg-white" style="height: 16rem;">
                    <!--begin::Body-->
                    <div class="card-body p-6 pb-0">
                        <div id="stats-widget-slider-1">
                            <div class="d-flex flex-column justify-content-between h-100">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <!--begin::Title-->
                                    <h2 class="col-8 p-0 font-size-h6 font-weight-bolder text-dark m-0">
                                        {carnet.title.toUpperCase() || 'n.a.'}
                                    </h2>
                                    <!--end::Title-->
                                    <span
                                        class="label label-lg label-light-primary label-inline font-size-sm font-weight-bolder py-5">
                                        {carnet.fee} €
                                    </span>
                                </div>
                                <!--begin::Text-->
                                <span
                                    class="font-size-sm text-dark-75"
                                    style="padding: 1rem; background: #eaf1f770; border-radius: 0.55rem;">
                                    {@html carnet.description
                                        .replace(/&lt;/g, '<')
                                        .replace(/&gt;/g, '>')
                                        .substring(0, 120)}{carnet.description.length > 120 ? '...' : ''}
                                </span>
                                <!-- <p class="text-dark-75 font-size-md font-weight-normal pt-2 mb-0">
                     </p> -->
                                <!--end::Text-->
                            </div>
                        </div>
                    </div>
                    <!--end::Body-->
                    <!--begin::Footer-->
                    <div class="card-footer border-0 d-flex align-items-center justify-content-between p-6 pt-0">
                        <!--begin::Label-->
                        <!-- <span class="label label-lg label-light-primary label-inline font-size-sm font-weight-bolder py-5"> -->

                        <span class="label label-lg label-pill label-inline font-weight-boldest mr-2">
                            {carnet.lessons_number} lezioni
                        </span>
                        <!-- </span> -->
                        <!--end::Label-->
                        <!-- svelte-ignore a11y-invalid-attribute -->
                        <!-- svelte-ignore a11y-missing-attribute -->
                        <!-- svelte-ignore a11y-click-events-have-key-events -->

                        <a
                            data-toggle="modal"
                            data-target="#subscription-carnet-{carnet.carnet_id}"
                            class="btn btn-sm btn-danger font-size-lg font-weight-bolder px-6"
                            class:disabled={carnet.loading || false}
                            on:click={carnet.modal.reset}>
                            {#if carnet.loading}
                                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                carico...
                            {:else}
                                Acquista ora
                            {/if}
                        </a>
                    </div>
                    <!-- <div class="px-8 pt-2 pb-4 d-flex justify-content-center align-items-center">
                 <small class="pr-4">
                     <LockSimple class="mr-1" />
                     transazione sicura
                 </small>
             </div> -->
                    <!--end::Footer-->
                </div>
                <!--end::Stats Widget 10-->
                <!-- <sup style="position:absolute;"><div class="coming-soon-badge">Funzionalità in Arrivo</div></sup> -->
            </div>
            <!-- ADD TO carnet MODAL -->
            <BuyCarnetFor
                bind:this={carnet.modal}
                bind:loading={carnet.loading}
                bind:associates
                id={carnet.carnet_id}
                callback={loadProfile}
                sport_association_id={searchData.sport_association_id}
                carnet={carnet.title} />
        {/if}
    {/each}
</div>
