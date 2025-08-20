<script>
    import {canPerformAction} from 'utils/Permissions';
    import {scale} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import {
        Book,
        DotsThree,
        Files,
        FirstAidKit,
        IdentificationCard,
        ListChecks,
        Rows,
        Ticket,
        User,
        Wallet,
    } from 'phosphor-svelte';
    import Info from './sections/Info.svelte';
    import Subscriptions from './sections/Subscriptions.svelte';
    import Memberships from './sections/Memberships.svelte';
    import Payments from './sections/Payments.svelte';

    export let associateId;
    export let width = '85vw';

    let activeTab = 'info';

    function switchTab(tab) {
        activeTab = '';
        switch (tab) {
            case 'info':
                activeTab = 'info';
                break;
            case 'subscriptions':
                activeTab = 'subscriptions';
                break;
            case 'memberships':
                activeTab = 'memberships';
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
            case 'cloud':
                activeTab = 'cloud';
                break;
            default:
                activeTab = '';
        }
    }
</script>

<div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}} class="d-flex flex-column-fluid">
    {#if canPerformAction('association.personas.read')}
        <!--begin::Container-->
        <div class="container">
            <div class="card card-custom gutter-b">
                <div class="card-header p-0 header-mobile-btn-back border-0" style="padding-bottom: 0 !important;">
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
                                        <span class="nav-text font-weight-bolder">Dati anagrafici</span>
                                    </a>
                                </li>
                                <!-- svelte-ignore a11y-click-events-have-key-events -->
                                <li class="nav-item" on:click={() => switchTab('subscriptions')}>
                                    <!-- svelte-ignore a11y-missing-attribute -->
                                    <a class="nav-link" class:active={activeTab === 'subscriptions'}>
                                        <span class="nav-icon mr-1">
                                            <Book
                                                size="19"
                                                color={activeTab == 'subscriptions' ? '#351DC2' : '#777'}
                                                weight="bold" />
                                        </span>
                                        <span class="nav-text font-weight-bolder">Iscrizioni</span>
                                    </a>
                                </li>
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
                                <!-- svelte-ignore a11y-click-events-have-key-events -->
                                <!-- svelte-ignore a11y-missing-attribute -->
                                <!-- <li class="nav-item" on:click={() => switchTab('courses')}>
                                    <a class="nav-link" class:active={activeTab === 'courses'}>
                                        <span class="nav-icon mr-1">
                                            <Rows
                                                size="19"
                                                color={activeTab == 'courses' ? '#351DC2' : '#777'}
                                                weight="bold" />
                                        </span>
                                        <span class="nav-text font-weight-bolder">Corsi e Abbonamenti</span>
                                    </a>
                                </li> -->
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
                                <!-- svelte-ignore a11y-click-events-have-key-events -->
                                <!-- svelte-ignore a11y-missing-attribute -->
                                <!-- <li class="nav-item" on:click={() => switchTab('carnet')}>
                                    <a class="nav-link" class:active={activeTab === 'carnet'}>
                                        <span class="nav-icon mr-1">
                                            <Ticket
                                                size="19"
                                                color={activeTab == 'carnet' ? '#351DC2' : '#777'}
                                                weight="bold" />
                                        </span>
                                        <span class="nav-text font-weight-bolder">Carnet</span>
                                    </a>
                                </li> -->
                                <!-- svelte-ignore a11y-click-events-have-key-events -->
                                <!-- svelte-ignore a11y-missing-attribute -->
                                <!-- <li class="nav-item" on:click={() => switchTab('attendance')}>
                                    <a class="nav-link" class:active={activeTab === 'attendance'}>
                                        <span class="nav-icon mr-1">
                                            <ListChecks
                                                size="19"
                                                color={activeTab == 'attendance' ? '#351DC2' : '#777'}
                                                weight="bold" />
                                        </span>
                                        <span class="nav-text font-weight-bolder">Registro Presenze</span>
                                    </a>
                                </li> -->
                                <!-- svelte-ignore a11y-click-events-have-key-events -->
                                <!-- svelte-ignore a11y-missing-attribute -->
                                <!-- <li class="nav-item" on:click={() => switchTab('cloud')}>
                                    <a class="nav-link" class:active={activeTab === 'cloud'}>
                                        <span class="nav-icon mr-1">
                                            <Files
                                                size="19"
                                                color={activeTab == 'cloud' ? '#351DC2' : '#777'}
                                                weight="bold" />
                                        </span>
                                        <span class="nav-text font-weight-bolder">Documenti</span>
                                    </a>
                                </li> -->
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
                </div>

                <div class="card-body px-0 pt-4">
                    {#if activeTab === 'info'}
                        <Info bind:associateId {width} />
                    {:else if activeTab === 'subscriptions'}
                        <Subscriptions bind:associateId {width} />
                    {:else if activeTab === 'memberships'}
                        <Memberships bind:associateId {width} />
                    {:else if activeTab === 'payments'}
                        <Payments bind:associateId {width} />
                    {/if}
                </div>
            </div>
        </div>
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
