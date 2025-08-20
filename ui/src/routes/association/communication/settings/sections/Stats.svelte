<script>
    import {onMount, onDestroy} from 'svelte';
    import {sessionToken, subPage} from 'store/stores.js';
    import {apiFetch} from 'utils/ApiMiddleware';
    import {Check, CheckCircle, LockSimple, PlayCircle, XCircle} from 'phosphor-svelte';

    sessionToken.useLocalStorage();
    subPage.useLocalStorage();

    let email_logs = [];
    let today_count = 0;
    let total_count = 0;

    async function fetchData() {
        const res = await apiFetch(__bakney.env.API.COMMUNICATIONS.EMAIL_LOGS.LIST);
        if (!res.error) {
            email_logs = res.response.results;
            today_count = res.response.today_count;
            total_count = res.response.total_count;
        }
    }

    onMount(async () => {
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Caricamento...',
        });
        await fetchData();
        KTApp.unblockPage();
        jQuery('body').tooltip({selector: '[data-toggle=tooltip]', trigger: 'hover'});
        jQuery('body').popover({selector: '[data-toggle=popover]', trigger: 'hover'});
    });

    onDestroy(() => {
        document.querySelectorAll('.popover').forEach(popover => popover.remove());
    });
</script>

{#if $subPage == 'stats'}
    <!--begin::Content-->
    <div class="flex-row-fluid">
        <!--begin::Card-->
        <div class="card card-custom card-stretch">
            <!--begin::Header-->
            <div class="card-header py-3 px-4 border-0">
                <div class="card-title align-items-start flex-column">
                    <h3 class="card-label font-weight-bolder text-dark font-size-h1">Statistiche Email</h3>
                    <span class="text-muted font-weight-bold font-size-sm mt-1"
                        >Controlla che le email inviate siano andate a buon fine.</span>
                </div>
                <div class="card-toolbar" />
            </div>
            <!--end::Header-->
            <!--begin::Form-->

            <!--begin::Body-->
            <div class="card-body p-4">
                <div class="form-group row px-2">
                    <div class="col-6 col-md-6 p-2 pr-md-4" style="">
                        <div class="card-widget card p-0 m-0">
                            <div class="card-body p-4">
                                <div class="mb-0">
                                    <h6 class="font-weight-boldest text-center mb-0" style="font-size: 1rem;">
                                        EMAIL GIORNALIERE INVIATE
                                    </h6>
                                </div>
                                <div class="text-center font-weight-bolder text-primary" style="font-size: 1.75rem;">
                                    <span>{today_count} email</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-6 col-md-6 p-2 pr-md-4" style="">
                        <div class="card-widget card p-0 m-0">
                            <div class="card-body p-4">
                                <div class="mb-0">
                                    <h6 class="font-weight-boldest text-center mb-0" style="font-size: 1rem;">
                                        EMAIL TOTALI INVIATE (ultimi 90 giorni)
                                    </h6>
                                </div>
                                <div class="text-center font-weight-bolder text-primary" style="font-size: 1.75rem;">
                                    <span>{total_count} email</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="form-group row px-2 mb-12">
                    <div class="col-12 col-md-12 p-2 pr-md-4 text-center mb-4">
                        <h6 class="font-weight-bolder text-dark font-size-h4">Storico ultimi 90 giorni</h6>
                    </div>
                    <div class="d-flex" style="flex-direction: column;width:100%;">
                        {#each email_logs as log}
                            <div
                                class="my-1 py-2 px-3 d-flex align-items-center justify-content-between"
                                style="background: #ebedf380;border-radius:.35rem;">
                                <!--   -->
                                <!-- {JSON.stringify(payment)} -->
                                <span class="cursor-pointer" data-toggle="tooltip" title={log.result}>
                                    {#if log.result == 'Sent'}
                                        <CheckCircle size={22} color="#1BC5BD" weight="duotone" />
                                    {:else if log.result.includes('Failed')}
                                        <XCircle size={22} color="#F64E60" weight="duotone" />
                                    {/if}
                                </span>
                                <div class="w-100 mx-4">
                                    <div class="text-left font-weight-bold">
                                        {log.recipient}
                                    </div>
                                    <div class="text-left font-weight text-dark-50 font-size-sm">
                                        {log.subject}
                                    </div>
                                </div>
                                <div class="font-weight-bold font-size-sm" style="min-width: 8.5rem;">
                                    {new Date(log.sent_at).toLocaleString('it-IT', {
                                        day: 'numeric',
                                        month: 'numeric',
                                        year: 'numeric',
                                        hour: 'numeric',
                                        minute: 'numeric',
                                    })}
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
            <!--end::Body-->
            <!--end::Form-->
        </div>
    </div>
{/if}
