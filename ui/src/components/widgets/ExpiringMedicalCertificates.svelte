<script>
    import PrintingModal from 'components/modals/PrintingModal.svelte';
    import {ArrowCircleRight, ArrowRight, Eye, Pencil, Printer, ThumbsUp, Ticket} from 'phosphor-svelte';
    import {permissions} from 'store/stores';
    import {onMount} from 'svelte';
    import {link, push} from 'svelte-spa-router';
    import {apiFetch} from 'utils/ApiMiddleware';

    permissions.useLocalStorage();

    let data = {
        expiring_medical_certificates: [],
    };
    let loading = true;

    function fetchData() {
        apiFetch(`${__bakney.env.HOST}/statistic/dashboard?widget=expiringmedicalcertificates`, {
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
            <span class="card-label font-weight-bolder font-size-h4">Certificati medici in scadenza</span>
        </h3>
        <button
            class="btn btn-sm btn-primary font-weight-bolder py-2 px-3"
            on:click={() => {
                // implement the PrintingModal
                let printingModal = new PrintingModal({
                    target: document.querySelector(`#portal-elements`),
                    intro: true,
                    props: {
                        type: 'expiring_medical_certificates',
                        title: `Stampa certificati in scadenza`,
                        currentStatus: 'choosing',
                    },
                });
            }}>
            <Printer size={14} class="mr-1" weight="duotone" />
            Stampa
        </button>
    </div>
    <!--end::Header-->
    <!--begin::Body-->
    <div class="card-body d-flex mx-0 mt-3 mb-0 pb-3 py-0 px-0 scroll scroll-pull" style="overflow-x:auto">
        {#if Array.from(data.expiring_medical_certificates).length === 0}
            <div class="d-flex flex-column align-items-center w-full h-full justify-content-center m-auto">
                <ThumbsUp size={60} class="my-4" weight="duotone" />
                <span class="font-size-lg font-weight-bolder text-muted">Nessun certificato medico in scadenza</span>
            </div>
        {:else}
            <div class="d-flex justify-content-start align-items-center flex-grow-1 pr-4">
                {#each data.expiring_medical_certificates as item}
                    <div
                        class="font-weight-bolder border-right border-light"
                        style="width: 10.5rem;max-width:10.5rem;min-width:10.5rem;">
                        <div class="d-flex justify-content-center flex-column align-items-center">
                            <span
                                class="font-weight-boldest font-size-sm text-primary text-center px-2 mb-1 d-flex justify-content-center align-items-center"
                                style="max-width:10.5rem;max-height:6rem;height:3.8rem;"
                                >{item?.associate?.first_name?.toUpperCase() || ''}<br />
                                {item?.associate?.last_name?.toUpperCase() || ''}</span>

                            <span
                                class="font-weight-bolder font-size-sm label label-light-{item?.days_left > 0
                                    ? 'warning'
                                    : 'danger'} rounded px-2 text-center px-2 my-1 mb-2"
                                style="max-width:11rem; width:fit-content;">
                                {#if item?.days_left > 0}
                                    {item?.days_left} gg. rimasti
                                {:else}
                                    scaduto
                                {/if}
                            </span>
                            <span
                                class="font-weight-bold font-size-xs text-center px-2 my-0 d-flex align-items-center"
                                style="max-width:10.5rem;height:3rem;max-height:3rem;">
                                {#if item?.medical?.expiration_date}
                                    <span class="font-size-sm font-weight-boldest">
                                        {moment(new Date(item?.medical?.expiration_date)).format('DD/MM/YYYY')}
                                    </span>
                                {:else}
                                    certificato medico<br />mancante
                                {/if}
                            </span>
                        </div>
                        <div class="d-flex justify-content-center mt-1">
                            <a
                                href="/members/list/detail/{item?.subscription_id}/medical"
                                use:link
                                class="d-flex align-items-center btn btn-outline-secondary btn-sm py-1 px-2 font-weight-boldest">
                                Modifica
                            </a>
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
