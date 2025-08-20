<script>
    import BuyEventFor from '../../modals/BuyEventFor.svelte';
    import {apiFetch} from 'utils/ApiMiddleware';
    import {Trophy} from 'phosphor-svelte';
    import {onMount} from 'svelte';
    import {scale} from 'svelte/transition';
    export let searchData;
    export let loadProfile;

    async function fetchData() {
        let res = await apiFetch(
            `${__bakney.env.API.EVENT.LIST}?sport_association_id=${searchData?.sport_association_id}`
        );
        if (!res.error) {
            searchData.events = res.response;
        }
    }

    onMount(async () => {
        await fetchData();
    });
</script>

<!-- <AvailableCourses bind:loadProfile bind:searchData /> -->
{#if searchData?.events?.length > 0}
    <div class="row">
        <div class="col d-flex align-items-center justify-content-center mb-5" style="margin: auto;">
            <Trophy size={34} weight="duotone" class="mr-2" />
            <!-- svelte-ignore a11y-missing-attribute -->
            <span class="font-size-h1 font-weight-bold">Eventi organizzati</span>
        </div>
    </div>
{/if}

<div class="row">
    {#each searchData?.events || [] as event, idx}
        <div class="col-12 col-lg-6" in:scale={{start: 0.9, duration: 80, delay: 40 * idx}}>
            <!--begin::Stats Widget 10-->
            <div class="card card-widget card-custom card-stretch gutter-b bg-white">
                <!--begin::Body-->
                <div class="card-body p-6 pb-0">
                    <div class="row">
                        <div class="col-3">
                            {#if event.locandina}
                                <img src={event.locandina} alt="locandina" width="100" />
                            {:else}
                                <div style="background: #eee;height: 150px;border-radius:.35rem;width:100px;">
                                    <div
                                        style="margin: auto; height: 100%; display: flex; justify-content: center; align-items: center;text-align: center;">
                                        nessuna locandina.
                                    </div>
                                </div>
                            {/if}
                        </div>
                        <div class="col-9">
                            <h2 class="col-8 p-0 font-size-h1 font-weight-bolder text-dark m-0">
                                {event.title.toUpperCase() || 'n.a.'}
                            </h2>
                            <p class="my-6 text-dark-75">
                                <span
                                    class="label label-lg font-weight-bold label-light-{event.open_to == 1
                                        ? 'info'
                                        : 'warning'} label-inline mr-2 my-2"
                                    >Aperto {event.open_to == 1 ? 'a tutti' : 'solo ad associati'}</span>
                                <span class="label label-lg font-weight-bold label-light-info label-inline mr-2"
                                    >dal <span class="font-weight-boldest mx-1"
                                        >{moment(event.start_date).format('DD/MM/YYYY')}</span>
                                    al
                                    <span class="font-weight-boldest mx-1"
                                        >{moment(event.end_date).format('DD/MM/YYYY')}</span
                                    ></span>
                            </p>
                        </div>
                        <div class="col-12 mt-4">
                            <span class="font-size-sm text-dark-50 font-weight-bolder">
                                {#if !event.openAll}
                                    {@html event.description
                                        .replace(/&lt;/g, '<')
                                        .replace(/&gt;/g, '>')
                                        .substring(0, 240)}{event.description.length > 240 ? '...' : ''}
                                {:else}
                                    {@html event.description.replace(/&lt;/g, '<').replace(/&gt;/g, '>')}
                                {/if}
                                {#if event.description.length > 240}
                                    <a
                                        on:click={() => (event.openAll = !event.openAll)}
                                        class="link link-sm btn-light-info mr-0 cursor-pointer ml-2"
                                        >{!event.openAll ? 'Leggi tutto' : 'Chiudi'}</a>
                                {/if}
                            </span>
                        </div>
                    </div>
                </div>
                <!--end::Body-->
                <!--begin::Footer-->
                <div class="card-footer border-0 d-flex align-items-center justify-content-end p-6 pt-0">
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-missing-attribute -->
                    <a
                        data-toggle="modal"
                        data-target="#subscription-event-{event.event_id}"
                        class="btn btn-sm btn-primary font-size-lg font-weight-bolder px-6"
                        class:disabled={event.loading || false}
                        on:click={event.modal.reset}>
                        {#if event.loading}
                            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                            carico...
                        {:else}
                            Partecipa
                        {/if}
                    </a>
                </div>
                <!--end::Footer-->
            </div>
            <!--end::Stats Widget 10-->
            <!-- <sup style="position:absolute;"><div class="coming-soon-badge">Funzionalità in Arrivo</div></sup> -->
        </div>
        <!-- ADD TO event MODAL -->
        <BuyEventFor
            bind:this={event.modal}
            bind:loading={event.loading}
            id={event.event_id}
            callback={loadProfile}
            sport_association_id={searchData.sport_association_id}
            {event} />
    {/each}
</div>
