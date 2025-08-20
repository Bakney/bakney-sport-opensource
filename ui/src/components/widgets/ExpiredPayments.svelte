<script>
    import ApproveButton from 'components/buttons/ApproveButton.svelte';
    import PrintingModal from 'components/modals/PrintingModal.svelte';
    import {ArrowCircleRight, ArrowRight, Eye, Pencil, Printer, ThumbsUp, Ticket} from 'phosphor-svelte';
    import {permissions, sessionToken} from 'store/stores';
    import {onMount} from 'svelte';
    import {link, push} from 'svelte-spa-router';
    import {apiFetch} from 'utils/ApiMiddleware';
    import {canPerformAction} from 'utils/Permissions.js';

    sessionToken.useLocalStorage();
    permissions.useLocalStorage();

    let data = {
        expired_payments: [],
    };
    let loading = true;

    let markAsPaid = async (id, payment_date, expense = false) => {
        payment_date = payment_date
            ? moment(new Date(payment_date)).format('YYYY-MM-DD')
            : moment().format('YYYY-MM-DD');
        swal.fire({
            title: expense ? 'Segna come pagato?' : 'Incassare il pagamento?',
            icon: 'question',
            buttonsStyling: true,
            html: `
            <div class="form-group px-4">
                <label for="payment_date font-weight-boldest">Data incasso</label>
                <input type="date" value=${payment_date} class="form-control form-control-solid form-control-lg" id="payment_date_${id}" value name="payment_date" placeholder="Data Incasso" />
            </div>
            `,
            showCancelButton: true,
            cancelButtonText: 'Annulla',
            confirmButtonText: expense ? 'Segna come pagato' : 'Incassa',
            reverseButtons: true,
        }).then(function (result) {
            if (result.isConfirmed) {
                KTApp.blockPage({
                    overlayColor: '#000000',
                    state: 'primary',
                    message: 'Conferma in corso...',
                });

                const url = __bakney.env.HOST + '/payment/' + id + '/approve';

                let body = {
                    payment_date: document.getElementById(`payment_date_${id}`).value || null,
                };

                window
                    .fetch(url, {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            Authorization: 'Bearer ' + $sessionToken,
                        },
                        body: JSON.stringify(body),
                    })
                    .then(response => {
                        response.json();
                        // refresh detail view
                        if (response.status == 200) {
                            // spinner stop
                            KTApp.unblockPage();
                            fetchData();
                        } else {
                            let modalText =
                                response.status == 403
                                    ? 'Operazione non permessa.'
                                    : 'Scusa, ho individuato degli errori, riprova.';
                            swal.fire({
                                text: modalText,
                                icon: 'error',
                                buttonsStyling: false,
                                confirmButtonText: 'Ok!',
                                customClass: {
                                    confirmButton: 'btn font-weight-bold btn-light-primary',
                                },
                            }).then(function () {
                                KTUtil.scrollTop();
                            });
                            // spinner stop
                            KTApp.unblockPage();
                        }
                    });
            }
        });
    };

    function fetchData() {
        apiFetch(`${__bakney.env.HOST}/statistic/dashboard?widget=expiredPayments`, {
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
        <h3 class="card-title d-flex justify-content-start flex-column align-items-start mb-0 text-center">
            <span class="card-label font-weight-bolder font-size-h4">Pagamenti scaduti e in scadenza</span>
            <span class="font-size-xs text-dark-50">
                In scadenza nei prossimi 7 giorni e scaduti da meno di 30 giorni
            </span>
        </h3>
        <button
            class="btn btn-sm btn-primary font-weight-bolder py-2 px-3"
            on:click={() => {
                // implement the PrintingModal
                let printingModal = new PrintingModal({
                    target: document.querySelector(`#portal-elements`),
                    intro: true,
                    props: {
                        type: 'expired_payments',
                        title: `Stampa pagamenti scaduti o in scadenza oggi`,
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
        {#if Array.from(data.expired_payments).length === 0}
            <div class="d-flex flex-column align-items-center w-full h-full justify-content-center m-auto">
                <ThumbsUp size={60} class="my-4" weight="duotone" />
                <span class="font-size-lg font-weight-bolder text-muted">Nessun pagamento scaduto</span>
            </div>
        {:else}
            <div class="d-flex justify-content-start align-items-center flex-grow-1 pr-4">
                {#each data.expired_payments as item}
                    <div
                        class="font-weight-bolder border-right border-light"
                        style="width: 10.5rem;max-width:10.5rem;min-width:10.5rem;">
                        <div class="d-flex justify-content-center flex-column align-items-center">
                            {#if item?.subscription_id}
                                <a
                                    href="/members/list/detail/{item?.subscription_id}/payments"
                                    use:link
                                    class="link link-primary text-center font-weight-boldest">
                                    {item?.associate?.first_name?.toUpperCase() || ''}<br />
                                    {item?.associate?.last_name?.toUpperCase() || ''}
                                </a>
                            {:else}
                                <span
                                    class="font-weight-boldest font-size-sm text-dark text-center px-2 mb-1 d-flex justify-content-center align-items-center"
                                    style="max-width:10.5rem;max-height:6rem;height:3.8rem;"
                                    >{item?.associate?.first_name?.toUpperCase() || ''}<br />
                                    {item?.associate?.last_name?.toUpperCase() || ''}</span>
                            {/if}
                            <span
                                class="font-weight-bolder font-size-sm label label-light-{item?.expired_days > 0
                                    ? 'danger'
                                    : 'warning'} rounded px-2 text-center px-2 my-1 mb-2"
                                style="max-width:11rem;width:fit-content;">
                                {#if item?.expired_days == 0}
                                    scade oggi
                                {:else if item?.expired_days < 0}
                                    scade tra {Math.abs(item?.expired_days)} gg.
                                {:else}
                                    scaduto da {item?.expired_days} gg.
                                {/if}
                            </span>
                            <span
                                class="font-weight-bold font-size-xs text-center px-2 my-0 d-flex flex-column align-items-center mt-4"
                                style="max-width:10.5rem;height:3rem;max-height:3rem;">
                                {#if item?.creation_date}
                                    <span class="font-size-sm font-weight-bolder mb-1">Incasso previsto il</span>
                                    <span class="font-size-sm font-weight-boldest">
                                        {moment(new Date(item?.creation_date)).format('DD/MM/YYYY')}
                                    </span>
                                {:else}
                                    -
                                {/if}
                            </span>
                        </div>
                        <div class="d-flex justify-content-center mt-4 mb-4">
                            {#if canPerformAction('bookeeping.payments.update')}
                                <ApproveButton
                                    disabled={!canPerformAction('bookeeping.payments.update')}
                                    popover_text="Segna come pagato"
                                    on:open={data => {
                                        markAsPaid(item.payment_id, item.payment_date, item.expense);
                                    }} />
                            {:else}
                                Non hai i permessi.
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
