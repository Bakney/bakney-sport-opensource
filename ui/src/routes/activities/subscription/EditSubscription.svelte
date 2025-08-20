<script>
    import {onMount} from 'svelte';
    import {scale} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware.js';
    import Info from './sections/Info.svelte';
    import {toast} from 'svelte-sonner';
    import {ArrowLeft} from 'phosphor-svelte';
    import BackButton from 'components/buttons/BackButton.svelte';

    export let params = {};

    let data = {};

    onMount(async () => {
        // console.warn('params', params);
        // // fetch data from server
        await fetchData();
        if (params.page) switchTab(params.page);
    });

    async function fetchData(page) {
        const res = await apiFetch(replaceUID(__bakney.env.API.SUBSCRIPTION.INFO, params.subscriptionId), {
            method: 'GET',
        });

        if (!res.error) {
            data = res.response.data;
        } else {
            toast.error('Qualcosa è andato storto.');
        }

        if (page) {
            switchTab(page);
        }
    }
</script>

<!--begin::Entry-->
<div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}} class="d-flex flex-column-fluid">
    <!--begin::Container-->
    <div class="container container-overlay">
        <!--begin::Card-->
        <div class="card card-custom gutter-b">
            <div class="card-header border-0 pt-4 pb-0 header-mobile-btn-back" style="padding-bottom: 0 !important;">
                <div class="card-toolbar d-flex gap-4" style="gap: .5rem;">
                    <BackButton />
                </div>
                <div class="card-toolbar">
                    <h3 class="card-title font-size-h2">
                        {data.info?.associate?.first_name}
                        {data.info?.associate?.last_name}
                    </h3>
                </div>
                <div class="card-toolbar" />
            </div>
            <div class="card-body pt-4">
                <div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}}>
                    <Info bind:info={data.info} on:reset={e => fetchData(e.detail)} />
                </div>
            </div>
        </div>
    </div>
    <!--end::Container-->
</div>
<!--end::Entry-->

<svelte:head>
    <style>
        .nav-link {
            cursor: pointer;
        }
        .nav-link.active {
            border-bottom: 4px solid #351dc2 !important;
        }
        .nav-link:hover {
            border-bottom: 4px solid #351dc2 !important;
        }
        .card-toolbar::-webkit-scrollbar {
            display: none;
        }
    </style>
</svelte:head>
