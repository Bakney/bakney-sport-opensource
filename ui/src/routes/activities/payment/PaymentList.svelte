<script>
    import {onMount} from 'svelte';
    import {apiFetch} from 'utils/ApiMiddleware';
    import {scale} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import {CheckCircle, FileArrowDown, Hourglass, LockSimple, Smiley, Wallet, X, Calendar} from 'phosphor-svelte';
    import {push} from 'svelte-spa-router';
    import ContentLoader from 'svelte-content-loader';
    import {EURcurrency} from 'utils/Functions.js';

    let paymentsList = [];

    let statusMap = {
        false: 'in attesa',
        true: 'Pagato',
    };

    let statusColorMap = {
        false: 'light-warning',
        true: 'light-success',
    };

    let statusColorIcons = {
        false: 'warning',
        true: 'success',
    };

    let statusIconMap = {
        false: 'fas fa-clock',
        true: 'fas fa-check-circle',
    };

    let paymentGroups = {};
    let loading = true;
    let isMobile = false;

    export let params;

    async function fetchUpdate() {
        loading = true;
        let url = __bakney.env.API.PAYMENT.LIST;
        if (params?.id) url = __bakney.env.API.PAYMENT.LIST + '?course_subscription_id=' + params?.id;
        let res = await apiFetch(url);

        if (!res.error) {
            paymentsList = Object.values(res.response.data) || [];

            for (let i = 0; i < paymentsList.length; i++) {
                if (!paymentGroups[paymentsList[i].sport_association_denomination]) {
                    paymentGroups[paymentsList[i].sport_association_denomination] = [];
                }
                if (paymentsList[i].online_pay_available && !paymentsList[i].paid) {
                    paymentGroups[paymentsList[i].sport_association_denomination].push(paymentsList[i]);
                }
            }
        }
        loading = false;
    }

    onMount(async () => {
        isMobile = KTUtil.isMobileDevice();
        fetchUpdate();
    });
</script>

<!--begin::Entry-->
<div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}} class="d-flex flex-column-fluid">
    <!--begin::Container-->
    <div class="container" style="max-width: 70rem !important;">
        {#if !loading}
            <div class="row mx-0 mb-4 px-0">
                <div class="col-12 col-md-10 m-0 p-0">
                    {#each Object.keys(paymentGroups) as group, id}
                        <!-- svelte-ignore a11y-missing-attribute -->
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <a
                            class="btn btn-primary font-weight-bolder m-2 m-md-0 mr-md-2"
                            class:d-none={paymentGroups[group].length == 0}
                            on:click={() => {
                                sessionStorage.setItem('cartPayments', JSON.stringify(paymentGroups[group]));
                                push('/stripe/cart-pay');
                            }}><LockSimple size={16} color="#fff" weight="duotone" /> Paga tutto a {group}</a>
                    {/each}
                </div>
                <div class="col-12 col-md-2 text-right p-0">
                    {#if params?.id}
                        <a
                            class="btn btn-success font-weight-bolder m-2 m-md-0"
                            on:click={() => {
                                // window.location = '/#/payment/list';
                                // window.location.reload();
                                push('/payment/list');
                                params = {};
                                fetchUpdate();
                            }}>
                            <X size={16} color="#fff" weight="bold" /> Annulla filtro
                        </a>
                    {/if}
                </div>
            </div>

            <div class="row">
                {#each paymentsList as payment, id}
                    <!-- {#if isMobile} -->
                    <div
                        in:scale|local={{delay: 20 * id, duration: 50, start: 0.98, easing: easing.cubicInOut}}
                        class="w-100 border rounded-lg mb-12 overflow-hidden mx-4">
                        <div class="card card-custom">
                            <div class="card-body p-6">
                                <div class="row">
                                    <div class="col-12">
                                        <div class="col-12 p-0 d-flex justify-content-between mb-1 mt-2">
                                            <div class="d-flex justify-content-start text-left align-items-center ml-1">
                                                <h3
                                                    class="mb-1 font-weight-boldest d-flex flex-column flex-md-row align-items-start align-items-md-center">
                                                    <span class="mr-2 font-weight-boldest rounded-lg border py-1 px-4">
                                                        {moment(payment.creation_date).format('DD/MM/YYYY')}
                                                    </span>
                                                    <span class="d-flex mt-4 mt-md-0">
                                                        {payment.associate.first_name}
                                                        {payment.associate.last_name}
                                                    </span>
                                                </h3>
                                            </div>

                                            <div class="col-2 d-flex justify-content-end align-items-start">
                                                <h1 style="font-weight:800;">
                                                    {EURcurrency.format(payment.amount)}
                                                </h1>
                                            </div>
                                        </div>
                                        <div class="col-12 p-0 d-flex justify-content-between flex-column my-2">
                                            <div
                                                class="d-flex flex-wrap justify-content-center text-right align-items-center ml-1 font-weight-boldest p-4 my-2 border rounded-lg text-center">
                                                {#if payment?.meta?.is_installment}
                                                    {payment?.meta?.installment?.id + 1}°
                                                {/if}
                                                {payment.meta?.type || ''}
                                                {payment.meta?.conjunction || ''}
                                                {payment.meta?.name ||
                                                    payment.meta?.description ||
                                                    payment.meta?.notes ||
                                                    'nessun dettaglio disponibile.'}

                                                {#if payment?.meta?.subscription?.start_date && payment?.meta?.subscription?.end_date}
                                                    <div
                                                        class="d-flex w-auto justify-content-start border py-1 bg-light px-2 rounded-lg align-items-center text-sm ml-4 font-weight-bolder text-dark my-2 my-md-0"
                                                        style="font-size:0.9rem;width: fit-content !important">
                                                        <Calendar size={16} weight="bold" class="mr-2" />
                                                        <span>
                                                            {#if moment(payment.meta.subscription.start_date).format('YYYY') == moment(payment.meta.subscription.end_date).format('YYYY')}
                                                                Stagione {moment(
                                                                    payment.meta.subscription.start_date
                                                                ).format('YYYY')}
                                                            {:else}
                                                                Stagione {moment(
                                                                    payment.meta.subscription.start_date
                                                                ).format('YYYY')} / {moment(
                                                                    payment.meta.subscription.end_date
                                                                ).format('YYYY')}
                                                            {/if}
                                                        </span>
                                                    </div>
                                                {/if}
                                                <!-- {payment.meta?.type} di
                                            <span class="ml-1 text-primary font-weight-bold">{payment.meta?.name}</span> -->
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12 py-2 px-0">
                                    {#if payment.paid}
                                        <div
                                            class="d-flex align-items-center justify-content-between"
                                            style="min-width: 10rem;">
                                            <div class="d-flex" style="gap:.5rem;">
                                                <div class="mb-2 mb-md-0">
                                                    <div
                                                        style="padding: .4rem .5rem"
                                                        class="btn btn-sm btn-hover-{statusColorMap[
                                                            payment.paid
                                                        ]} btn-{statusColorMap[
                                                            payment.paid
                                                        ]} font-weight-boldest align-items-top m-auto">
                                                        {#if payment.paid}
                                                            <CheckCircle
                                                                size={16}
                                                                class="text-{statusColorIcons[payment.paid]}"
                                                                weight="duotone" />
                                                        {:else}
                                                            <Hourglass
                                                                size={16}
                                                                class="text-{statusColorIcons[payment.paid]}"
                                                                weight="duotone" />
                                                        {/if}
                                                        <span>{statusMap[payment.paid]}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <a
                                                href="javascript:downloadPdf('{`${__bakney.env.API.DOCUMENT.RETRIEVE}/${payment.document_pdf}`}');"
                                                data-container="body"
                                                data-toggle="tooltip"
                                                data-placement="bottom"
                                                title="Scarica Ricevuta di Pagamento"
                                                class="btn btn-dark btn-sm font-weight-boldest align-items-center d-flex">
                                                <FileArrowDown size={16} class="mr-2" weight="duotone" />
                                                <span class="d-block">Ricevuta</span>
                                            </a>
                                        </div>
                                    {:else if !payment.paid}
                                        <div
                                            class="col-12 p-0 d-flex align-items-center justify-content-between mt-2"
                                            style="min-width: 25rem;">
                                            <div class="d-flex" style="gap:.5rem;">
                                                <div class="mb-2 mb-md-0">
                                                    <div
                                                        style="padding: .4rem .5rem"
                                                        class="btn btn-sm btn-hover-{statusColorMap[
                                                            payment.paid
                                                        ]} btn-{statusColorMap[
                                                            payment.paid
                                                        ]} font-weight-boldest align-items-top m-auto">
                                                        {#if payment.paid}
                                                            <CheckCircle
                                                                size={16}
                                                                class="text-{statusColorIcons[payment.paid]}"
                                                                weight="duotone" />
                                                        {:else}
                                                            <Hourglass
                                                                size={16}
                                                                class="text-{statusColorIcons[payment.paid]}"
                                                                weight="duotone" />
                                                        {/if}
                                                        <span>{statusMap[payment.paid]}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {#if !payment.online_pay_available}
                                                L'associazione ti fornirà i dettagli per il pagamento.
                                            {:else}
                                                <a
                                                    class="btn btn-sm btn-primary font-weight-boldest d-flex align-items-top"
                                                    href="/#/stripe/pay/{payment.payment_id}"
                                                    style="display: flex !important; justify-content: center; align-items: center;">
                                                    <Wallet weight="duotone" class="mr-2" size={16} />
                                                    <span class="">Paga Ora</span>
                                                </a>
                                            {/if}
                                        </div>
                                    {/if}
                                </div>
                            </div>
                        </div>
                    </div>
                {/each}

                {#if paymentsList?.length == 0}
                    <div class="col-12">
                        <div class="d-flex flex-column justify-content-center align-items-center m-12">
                            <Smiley size={64} color="#000" weight="duotone" />
                            <h4 class="text-dark font-weight-boldest mt-4">Nessun pagamento</h4>
                            <p class="text-dark-75 font-weight-bold">Troverai qui i pagamenti e le ricevute.</p>
                        </div>
                    </div>
                {/if}
            </div>
        {:else}
            <ContentLoader width="100%" primaryColor="#6b6b6b1f" secondaryColor="#eaf1f7" />
        {/if}
    </div>
</div>
