<script>
    import {onDestroy, onMount} from 'svelte';
    import {scale} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware.js';
    import Info from './sections/Info.svelte';
    import Medical from './sections/Medical.svelte';
    import Courses from './sections/Courses.svelte';
    import Payments from './sections/Payments.svelte';
    import Carnet from './sections/Carnet.svelte';
    import Attendance from './sections/Attendance.svelte';
    import Transfer from './sections/Transfer.svelte';
    import Activity from './sections/Activity.svelte';
    import {
        User,
        FirstAidKit,
        Rows,
        Wallet,
        Ticket,
        ListChecks,
        Files,
        UserSwitch,
        Archive,
        ShieldWarning,
        IdentificationCard,
        ArrowLeft,
    } from 'phosphor-svelte';
    import Cloud from './sections/Cloud.svelte';
    import {MembersListType} from 'utils/enumUtils';
    import {toast} from 'svelte-sonner';
    import {canPerformAction} from 'utils/Permissions';
    import {userData} from 'store/stores';
    import Memberships from './sections/Memberships.svelte';
    import {createEventDispatcher} from 'svelte';
    import BackButton from 'components/buttons/BackButton.svelte';

    const dispatch = createEventDispatcher();

    export let params = {};
    export let inDrawer = false;
    export let subscriptionId;

    let data = {};
    let activeTab = 'info';
    let delta = JSON.parse(localStorage.getItem('member_detail_delta')) || 0;

    let searchKey = '';
    let changes = false;

    let isFederation =
        $userData?.preview_and_custom_features?.find(x => x.name === 'Iscrizioni per Enti e Federazioni') !== undefined;

    onMount(async () => {
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Caricamento',
        });
        if (delta) {
            delta -= 1;
        }
        // extract searchKey from query string if available else ''
        const hash = window.location.hash;
        const queryStart = hash.indexOf('?');
        if (queryStart !== -1) {
            const queryString = hash.substring(queryStart + 1);
            const q = new URLSearchParams(queryString);
            searchKey = q.get('searchKey') || '';
        }
        // console.warn('params', params);
        // // fetch data from server
        await fetchData();
        KTApp.unblockPage();
    });

    async function fetchData(page, reset = false) {
        let prevActiveTab = activeTab;
        switchTab('');
        // activeTab = '';
        const res = await apiFetch(
            replaceUID(__bakney.env.API.SUBSCRIPTION.INFO, inDrawer ? subscriptionId : params.subscriptionId),
            {
                method: 'GET',
            }
        );

        if (!res.error) {
            data = res.response.data;
        } else {
            toast.error('Qualcosa è andato storto.');
        }

        switchTab(prevActiveTab);

        if (page && !reset) {
            setTimeout(() => {
                switchTab(page);
            }, 600);
        } else if (reset) {
            setTimeout(() => {
                activeTab = page;
                switchTab(activeTab);
            }, 600);
        }
    }

    function switchTab(tab) {
        if (activeTab != tab) {
            // delta += 1;
            // localStorage.setItem('member_detail_delta', delta);
        }
        activeTab = '';
        switch (tab) {
            case 'info':
                activeTab = 'info';
                break;
            case 'memberships':
                activeTab = 'memberships';
                break;
            case 'medical':
                activeTab = 'medical';
                break;
            case 'courses':
                activeTab = 'courses';
                break;
            case 'payments':
                activeTab = 'payments';
                break;
            case 'activity':
                activeTab = 'activity';
                break;
            case 'carnet':
                activeTab = 'carnet';
                break;
            case 'attendance':
                activeTab = 'attendance';
                break;
            case 'transfer':
                activeTab = 'transfer';
                break;
            case 'cloud':
                activeTab = 'cloud';
                break;
            default:
                activeTab = '';
        }
    }

    onDestroy(() => {
        dispatch('close');
    });
</script>

<!--begin::Entry-->
<div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}} class="d-flex flex-column-fluid">
    {#if canPerformAction('association.members.read')}
        <!--begin::Container-->
        <div class="container">
            {#if data?.info && data?.info?.associate}
                {#if data?.info?.archived}
                    <div class="px-0">
                        <div class="bg-light-danger py-3 px-6 rounded-lg d-flex align-items-center">
                            <Archive size={22} class="text-danger mr-2" weight="bold" />
                            <span class="text-danger font-weight-boldest text-size-xl mb-0">
                                L'iscrizione per questo {data.info?.type !== MembersListType.MEMBER_ONLY
                                    ? 'socio'
                                    : 'tesserato'} è stata archiviata. Non è possibile effettuare modifiche.
                            </span>
                        </div>
                    </div>
                {:else if !data?.info?.is_current && !data?.info?.is_next_year}
                    <div class="px-0">
                        <div class="bg-light-warning py-3 px-6 rounded-lg d-flex align-items-center">
                            <ShieldWarning size={22} class="text-warning mr-2" weight="bold" />
                            <span class="text-warning font-weight-boldest text-size-xl mb-0">
                                L'iscrizione per questo {data.info?.type !== MembersListType.MEMBER_ONLY
                                    ? 'socio'
                                    : 'tesserato'} è scaduta.
                            </span>
                        </div>
                    </div>
                {:else if !data?.info?.is_current && data?.info?.is_next_year}
                    <div class="px-0">
                        <div class="bg-light-info py-3 px-6 rounded-lg d-flex align-items-center">
                            <ShieldWarning size={22} class="text-info mr-2" weight="bold" />
                            <span class="text-info font-weight-boldest text-size-xl mb-0">
                                L'iscrizione per questo {data.info?.type !== MembersListType.MEMBER_ONLY
                                    ? 'socio'
                                    : 'tesserato'} è una pre-iscrizione.
                            </span>
                        </div>
                    </div>
                {/if}
            {/if}

            <!--begin::Card-->
            <div class="card card-custom gutter-b">
                <div class="card-header p-0 header-mobile-btn-back border-0" style="padding-bottom: 0 !important;">
                    {#if !inDrawer}
                        <div class="card-toolbar d-flex gap-4" style="gap: .5rem;">
                            <BackButton />
                        </div>

                        <div class="card-toolbar">
                            <h3 class="card-title font-size-h2">
                                {data.info?.associate?.first_name || ''}
                                {data.info?.associate?.last_name || ''}
                            </h3>
                        </div>
                        <div class="card-toolbar" />
                    {/if}

                    {#if data.info?.type !== undefined && data.info?.type !== null}
                        <div
                            class="m-0 pt-4 d-flex justify-content-between align-items-center flex-row"
                            style="width: 100%; overflow-x: auto;">
                            <button
                                class="btn btn-icon btn-sm mr-2 scroll-left"
                                on:click={() => {
                                    const navScrollContainer = document.getElementById('nav-scroll-container');
                                    if (navScrollContainer) {
                                        navScrollContainer.scrollTo({
                                            left: navScrollContainer.scrollLeft - 150,
                                            behavior: 'smooth',
                                        });
                                    }
                                }}>
                                <i class="ki ki-bold-arrow-back icon-sm" />
                            </button>
                            <div
                                id="nav-scroll-container"
                                class="nav-scroll-container"
                                style="overflow-x: auto; flex-grow: 1;">
                                <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                                <ul
                                    class="nav nav-tabs nav-bold nav-tabs-line border-0"
                                    style="min-width: max-content; border-bottom: 1px solid #cccccc4a !important;">
                                    <!-- Tab items remain the same -->
                                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                                    <li class="nav-item" on:click={() => switchTab('info')}>
                                        <!-- svelte-ignore a11y-missing-attribute -->
                                        <a class="nav-link" class:active={activeTab === 'info'}>
                                            <span class="nav-icon mr-1">
                                                <User
                                                    size="19"
                                                    color={activeTab == 'info' ? '#351DC2' : '#777'}
                                                    weight="bold" />
                                            </span>
                                            <span class="nav-text font-weight-bolder">Iscrizione</span>
                                        </a>
                                    </li>
                                    {#if data.info?.type !== MembersListType.ASSOCIATE_ONLY || isFederation}
                                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                                        <li class="nav-item" on:click={() => switchTab('memberships')}>
                                            <!-- svelte-ignore a11y-missing-attribute -->
                                            <a class="nav-link" class:active={activeTab === 'memberships'}>
                                                <span class="nav-icon mr-1">
                                                    <IdentificationCard
                                                        size="19"
                                                        color={activeTab == 'memberships' ? '#351DC2' : '#777'}
                                                        weight="bold" />
                                                </span>
                                                <span class="nav-text font-weight-bolder">Tesseramenti</span>
                                            </a>
                                        </li>
                                    {/if}
                                    {#if data.info?.type !== MembersListType.ASSOCIATE_ONLY || isFederation}
                                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                                        <li class="nav-item" on:click={() => switchTab('medical')}>
                                            <!-- svelte-ignore a11y-missing-attribute -->
                                            <a class="nav-link" class:active={activeTab === 'medical'}>
                                                <span class="nav-icon mr-1">
                                                    <FirstAidKit
                                                        size="19"
                                                        color={activeTab == 'medical' ? '#351DC2' : '#777'}
                                                        weight="bold" />
                                                </span>
                                                <span class="nav-text font-weight-bolder">Certificato medico</span>
                                            </a>
                                        </li>
                                    {/if}
                                    {#if data.info?.type !== MembersListType.ASSOCIATE_ONLY || isFederation}
                                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                                        <li class="nav-item" on:click={() => switchTab('courses')}>
                                            <!-- svelte-ignore a11y-missing-attribute -->
                                            <a class="nav-link" class:active={activeTab === 'courses'}>
                                                <span class="nav-icon mr-1">
                                                    <Rows
                                                        size="19"
                                                        color={activeTab == 'courses' ? '#351DC2' : '#777'}
                                                        weight="bold" />
                                                </span>
                                                <span class="nav-text font-weight-bolder">Corsi e Abbonamenti</span>
                                            </a>
                                        </li>
                                    {/if}
                                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                                    <li class="nav-item" on:click={() => switchTab('payments')}>
                                        <!-- svelte-ignore a11y-missing-attribute -->
                                        <a class="nav-link" class:active={activeTab === 'payments'}>
                                            <span class="nav-icon mr-1">
                                                <Wallet
                                                    size="19"
                                                    color={activeTab == 'payments' ? '#351DC2' : '#777'}
                                                    weight="bold" />
                                            </span>
                                            <span class="nav-text font-weight-bolder">Pagamenti</span>
                                        </a>
                                    </li>
                                    {#if data.info?.type !== MembersListType.ASSOCIATE_ONLY || isFederation}
                                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                                        <li class="nav-item" on:click={() => switchTab('carnet')}>
                                            <!-- svelte-ignore a11y-missing-attribute -->
                                            <a class="nav-link" class:active={activeTab === 'carnet'}>
                                                <span class="nav-icon mr-1">
                                                    <Ticket
                                                        size="19"
                                                        color={activeTab == 'carnet' ? '#351DC2' : '#777'}
                                                        weight="bold" />
                                                </span>
                                                <span class="nav-text font-weight-bolder">Carnet</span>
                                            </a>
                                        </li>
                                    {/if}
                                    {#if data.info?.type !== MembersListType.ASSOCIATE_ONLY || isFederation}
                                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                                        <li class="nav-item" on:click={() => switchTab('attendance')}>
                                            <!-- svelte-ignore a11y-missing-attribute -->
                                            <a class="nav-link" class:active={activeTab === 'attendance'}>
                                                <span class="nav-icon mr-1">
                                                    <ListChecks
                                                        size="19"
                                                        color={activeTab == 'attendance' ? '#351DC2' : '#777'}
                                                        weight="bold" />
                                                </span>
                                                <span class="nav-text font-weight-bolder">Registro Presenze</span>
                                            </a>
                                        </li>
                                    {/if}
                                    <li class="nav-item" on:click={() => switchTab('transfer')}>
                                        <!-- svelte-ignore a11y-missing-attribute -->
                                        <a class="nav-link" class:active={activeTab === 'transfer'}>
                                            <span class="nav-icon mr-1">
                                                <UserSwitch
                                                    size="19"
                                                    color={activeTab == 'transfer' ? '#351DC2' : '#777'}
                                                    weight="bold" />
                                            </span>
                                            <span class="nav-text font-weight-bolder"
                                                >Accessi da {__bakney.OEM_CONFIG?.name}</span>
                                        </a>
                                    </li>

                                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                                    <li class="nav-item" on:click={() => switchTab('cloud')}>
                                        <!-- svelte-ignore a11y-missing-attribute -->
                                        <a class="nav-link" class:active={activeTab === 'cloud'}>
                                            <span class="nav-icon mr-1">
                                                <Files
                                                    size="19"
                                                    color={activeTab == 'cloud' ? '#351DC2' : '#777'}
                                                    weight="bold" />
                                            </span>
                                            <span class="nav-text font-weight-bolder">Documenti</span>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <button
                                class="btn btn-icon btn-sm ml-2 scroll-right"
                                on:click={() => {
                                    const navScrollContainer = document.getElementById('nav-scroll-container');
                                    if (navScrollContainer) {
                                        navScrollContainer.scrollTo({
                                            left: navScrollContainer.scrollLeft + 150,
                                            behavior: 'smooth',
                                        });
                                    }
                                }}>
                                <i class="ki ki-bold-arrow-next icon-sm" />
                            </button>
                        </div>
                    {/if}
                </div>
                <div class="card-body px-0 pt-4">
                    {#if JSON.stringify(data) !== '{}'}
                        {#if activeTab === 'info'}
                            <div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}}>
                                <Info
                                    bind:changes
                                    bind:info={data.info}
                                    on:reset={async e => await fetchData(e.detail)}
                                    on:pdfcheck={async () => {
                                        const res = await apiFetch(
                                            replaceUID(
                                                __bakney.env.API.SUBSCRIPTION.INFO,
                                                inDrawer ? subscriptionId : params.subscriptionId
                                            ),
                                            {
                                                method: 'GET',
                                            }
                                        );

                                        if (!res.error && res?.response?.data?.info?.document_pdf)
                                            data.info.document_pdf = res?.response?.data?.info?.document_pdf;
                                    }} />
                            </div>
                        {:else if activeTab === 'memberships' && data.info?.type !== MembersListType.ASSOCIATE_ONLY}
                            <div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}}>
                                <Memberships bind:info={data.info} on:reset={e => fetchData(e.detail.page, true)} />
                            </div>
                        {:else if activeTab === 'medical' && data.info?.type !== MembersListType.ASSOCIATE_ONLY}
                            <div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}}>
                                <Medical bind:info={data.info} on:reset={e => fetchData(e.detail, true)} />
                            </div>
                        {:else if activeTab === 'courses' && data.info?.type !== MembersListType.ASSOCIATE_ONLY}
                            <div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}}>
                                <Courses
                                    bind:info={data.info}
                                    bind:courses={data.courses}
                                    on:reset={e => fetchData(e.detail, true)} />
                            </div>
                        {:else if activeTab === 'payments'}
                            <div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}}>
                                <Payments
                                    bind:searchKey
                                    bind:info={data.info}
                                    bind:uuid={data.info.subscription_id}
                                    on:reset={async e => {
                                        // set the value of the page by the event detail
                                        let p = e.detail.page;
                                        await fetchData(p, true);
                                        searchKey = e.detail.searchKey;
                                    }} />
                            </div>
                        {:else if activeTab === 'carnet' && data.info?.type !== MembersListType.ASSOCIATE_ONLY}
                            <div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}}>
                                <Carnet
                                    bind:info={data.info}
                                    bind:carnet={data.carnet}
                                    bind:courses={data.courses}
                                    on:reset={e => fetchData(e.detail, true)} />
                            </div>
                        {:else if activeTab === 'attendance' && data.info?.type !== MembersListType.ASSOCIATE_ONLY}
                            <div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}}>
                                <Attendance
                                    bind:carnet={data.carnet}
                                    on:reset={e => fetchData(e.detail)}
                                    bind:info={data.info} />
                            </div>
                        {:else if activeTab === 'transfer'}
                            <div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}}>
                                <Transfer bind:info={data.info} on:reset={e => fetchData(e.detail)} />
                            </div>
                        {:else if activeTab === 'cloud'}
                            <div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}}>
                                <Cloud bind:info={data.info} on:reset={e => fetchData(e.detail)} />
                            </div>
                        {:else if activeTab === 'activity'}
                            <div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}}>
                                <Activity />
                            </div>
                        {/if}
                    {/if}
                </div>
            </div>
        </div>
        <!--end::Container-->
    {:else}
        <div class="container">
            <div class="row">
                <div class="col-12">
                    <div class="label label-light-danger w-100 font-weight-bolder font-size-h4 py-8 px-16">
                        Non hai i permessi per visualizzare questa pagina.
                    </div>
                </div>
            </div>
        </div>
    {/if}
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
