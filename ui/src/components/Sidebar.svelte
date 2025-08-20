<script>
    import {slide} from 'svelte/transition';
    import {push, replace} from 'svelte-spa-router';
    import {
        currentPage,
        subPage,
        role,
        isExpired,
        billingData,
        permissions,
        userData,
        sidebarCollapsed,
        selectedGroup,
    } from 'store/stores.js';
    import {collapseSidebar} from 'utils/Functions.js';
    import {onMount} from 'svelte';
    import {apiFetch} from 'utils/ApiMiddleware.js';
    import {setPermissions, canPerformAction, isFreePlan} from 'utils/Permissions.js';
    import {
        Stack,
        Users,
        Book,
        Scan,
        Rows,
        Calendar,
        Volleyball,
        Ticket,
        ChartPieSlice,
        Wallet,
        Files,
        FileText,
        Percent,
        ChartBar,
        UserList,
        Gear,
        ChatsTeardrop,
        Info,
        MagnifyingGlass,
        UserFocus,
        Bank,
        File,
        Coins,
        Trophy,
        Confetti,
        TreeStructure,
        GearSix,
        PaperPlaneTilt,
        NotePencil,
        Browsers,
        Tent,
        Folders,
        CreditCard,
        IdentificationCard,
        AddressBook,
    } from 'phosphor-svelte';
    import Portal from 'svelte-portal';
    import {toast} from 'svelte-sonner';
    import {SmartSelect} from 'components/formBuilder/preview-blocks';

    role.useLocalStorage();
    isExpired.useLocalStorage();
    billingData.useLocalStorage();
    permissions.useLocalStorage();
    userData.useLocalStorage();
    selectedGroup.useLocalStorage();

    export let newUsers = 0;
    export let newInvoices = 0;
    let visibleLogo = true;
    const IS_BETA = __bakney.IS_BETA || false;

    let planType = '🚀 Piano di Valutazione';
    let showPlan = false;
    let daysLeft = -1;
    let brandLogo;
    let prevPermissions = [];
    let show = true;

    onMount(async () => {
        KTLayoutAsideMenu.init('kt_aside_menu'); // force the menu init
        if (new Date().getMonth() >= 10) {
            brandLogo = __bakney.OEM_CONFIG?.xmasLogo;
        } else {
            brandLogo = __bakney.OEM_CONFIG?.logo;
        }
        if ($role != 'athlete')
            await apiFetch(__bakney.env.API.BILLING.ACTIVE_PLAN).then(res => {
                if (!res.error) {
                    showPlan = true;
                    const currentDate = new Date();
                    const planDate = new Date(res?.response?.data?.ends_on);
                    planType = '🚀 ' + (res?.response?.data?.active_plan?.name || 'Piano di Valutazione');
                    $isExpired = currentDate > planDate; //&& res.response.data.active_plan.billing_type != 1;
                    daysLeft = Math.max(Math.floor((planDate - currentDate) / (1000 * 60 * 60 * 24)), -1);
                    billingData.set(res?.response?.data);
                    setPermissions($billingData?.active_plan?.billing_type, $role);

                    if ($isExpired) {
                        window.location.href = '/#/subscription/upgrade';
                        $sidebarCollapsed = true;
                        toast.error('Abbonamento scaduto. Rinnovalo per continuare.');
                    }
                }
            });
        show = true;
    });

    // afterUpdate(() => {
    //     if (JSON.stringify(prevPermissions) !== JSON.stringify($permissions)) {
    //         prevPermissions = [...$permissions];
    //         show = false;
    //         setTimeout(() => {
    //             show = true;
    //         }, 300);
    //     }
    // });
</script>

{#if daysLeft && daysLeft > 0 && parseInt(daysLeft) < 4}
    <Portal target="body">
        <div
            transition:slide={{duration: 350, y: 5}}
            class="plan-status text-white"
            style="backdrop-filter: blur(5px);background: #e33041db !important;-webkit-backdrop-filter: blur(5px);">
            Piano in scadenza tra {daysLeft}
            {daysLeft == 1 ? 'giorno' : 'giorni'}
            <a href="/#/subscription" class="mx-1 text-danger bg-light-danger px-2 py-0 rounded my-4 ml-2">
                RINNOVA ORA
            </a>
        </div>
    </Portal>
{:else if parseInt(daysLeft) === 0}
    <Portal target="body">
        <div
            transition:slide={{duration: 350, y: 5}}
            class="plan-status text-white"
            style="backdrop-filter: blur(5px);background: #e0000082 !important;-webkit-backdrop-filter: blur(5px);">
            Piano scaduto
            <a href="/#/subscription" class="mx-1 text-white bg-dark px-2 py-0 rounded my-4"> RINNOVALO ORA </a>
        </div>
    </Portal>
{/if}

<!--begin::Aside-->
<div
    class="aside aside-left aside-fixed d-flex flex-column flex-row-auto"
    collapsed={$sidebarCollapsed}
    id="kt_aside"
    style={window.innerWidth < 768 ? 'overflow: scroll;' : ''}>
    <!--begin::Brand #351DC2-->
    <div class="brand flex-column-auto" id="kt_brand">
        <!--begin::Logo-->
        <a href="/" class="brand-logo mt-4 mx-auto">
            <!-- svelte-ignore a11y-missing-attribute -->
            <img id="logo" class="h-30px" style={visibleLogo ? '' : 'display:none;'} src={brandLogo} />
            <!-- svelte-ignore missing-declaration -->
            {#if IS_BETA}
                <div class="beta-banner">beta</div>
            {/if}
        </a>

        <!--end::Logo-->
    </div>

    <!--end::Brand-->
    {#if show}
        <!--begin::Aside Menu-->
        <div class="aside-menu-wrapper flex-column-fluid" id="kt_aside_menu_wrapper">
            <!--begin::Menu Container-->
            <div
                id="kt_aside_menu"
                class="aside-menu mt-4 mt-md-0 mb-4 scroll ps ps--active-y"
                data-menu-vertical="1"
                data-menu-scroll="1"
                data-menu-dropdown-timeout="500"
                style="display: flex; flex-direction: column; justify-content: space-between; height: 100% !important;">
                <!--begin::Menu Nav-->
                <ul class="menu-nav">
                    {#if __bakney?.OEM_CONFIG?.displaySettings?.general?.searchBar}
                        <li
                            class="d-lg-none {$currentPage == 'search' ? 'menu-item menu-item-active' : 'menu-item'}"
                            aria-haspopup="true">
                            <a href="/#/search" class="menu-link" on:click={collapseSidebar}>
                                <span class="menu-icon">
                                    <MagnifyingGlass size={24} weight="duotone" />
                                </span>
                                <span class="menu-text">Ricerca</span>
                            </a>
                        </li>
                    {/if}

                    {#if canPerformAction('association.dashboard.read') || $role == 'athlete'}
                        <li
                            class={$currentPage == 'dashboard' ? 'menu-item menu-item-active' : 'menu-item'}
                            aria-haspopup="true">
                            <a href="/#/" class="menu-link" on:click={collapseSidebar}>
                                <span class="menu-icon">
                                    <Stack size={24} weight="duotone" />
                                </span>
                                <span class="menu-text">Bacheca</span>
                            </a>
                        </li>
                    {/if}

                    {#if $role != 'athlete'}
                        {#if canPerformAction('association.calendar.read')}
                            <li
                                class={$currentPage == 'calendar' ? 'menu-item menu-item-active' : 'menu-item'}
                                aria-haspopup="true">
                                <a href="/#/calendar" class="menu-link" on:click={collapseSidebar}>
                                    <span class="menu-icon">
                                        <Calendar size={24} weight="duotone" />
                                    </span>
                                    <span class="menu-text">Calendario</span>
                                </a>
                            </li>
                        {/if}
                    {/if}

                    {#if $role != 'athlete'}
                        <li class="menu-section">
                            <h4 class="menu-text">GESTIONE</h4>
                            <i class="menu-icon ki ki-bold-more-hor icon-md" />
                        </li>
                        {#if canPerformAction('association.members.read') || canPerformAction('association.members.archive.read')}
                            <li
                                class={$currentPage == 'members'
                                    ? 'menu-item menu-item-active menu-item-open'
                                    : 'menu-item menu-item-submenu'}
                                aria-haspopup="true"
                                data-menu-toggle="hover">
                                <!-- svelte-ignore a11y-invalid-attribute -->
                                <span class="menu-link menu-toggle">
                                    <span class="menu-icon">
                                        <Users size={24} weight="duotone" />
                                    </span>
                                    <span class="menu-text">Organizzazione</span>
                                    <i class="menu-arrow" />
                                </span>
                                <div class="menu-submenu">
                                    <i class="menu-arrow" />
                                    <ul class="menu-subnav">
                                        {#if canPerformAction('association.personas.read')}
                                            <li
                                                class="menu-item menu-item-submenu {$subPage == 'personas-list'
                                                    ? 'menu-item-active'
                                                    : ''}"
                                                aria-haspopup="true"
                                                data-menu-toggle="hover">
                                                <a href="/#/personas/list" class="menu-link" on:click={collapseSidebar}>
                                                    <span class="menu-icon">
                                                        <IdentificationCard size={24} weight="duotone" />
                                                    </span>
                                                    <span class="menu-text">Anagrafiche</span>
                                                    <!-- <span
                                                        class="badge badge-danger font-weight-boldest font-size-xs px-3 py-2"
                                                        style="border-radius: 1rem;">Novità</span> -->
                                                </a>
                                            </li>
                                        {/if}
                                        {#if canPerformAction('association.members.read')}
                                            <li
                                                class="menu-item menu-item-submenu {$subPage == 'members-list'
                                                    ? 'menu-item-active'
                                                    : ''}"
                                                aria-haspopup="true"
                                                data-menu-toggle="hover">
                                                <a href="/#/members/list" class="menu-link" on:click={collapseSidebar}>
                                                    <span class="menu-icon">
                                                        <Book size={24} weight="duotone" />
                                                    </span>
                                                    <span class="menu-text">Iscrizioni</span>
                                                    {#if newUsers > 0}
                                                        <span class="menu-label">
                                                            <span class="label label-primary label-rounded"
                                                                >{newUsers}</span>
                                                        </span>
                                                    {/if}
                                                </a>
                                            </li>
                                            <li
                                                class="menu-item menu-item-submenu {$subPage == 'members-template'
                                                    ? 'menu-item-active'
                                                    : ''}"
                                                aria-haspopup="true"
                                                data-menu-toggle="hover">
                                                <!-- class="menu-link coming-soon-item" -->
                                                <a
                                                    href={isFreePlan()
                                                        ? '/#/subscription/upgrade'
                                                        : '/#/members/subscription/template'}
                                                    class="menu-link"
                                                    on:click={collapseSidebar}>
                                                    <span class="menu-icon">
                                                        <NotePencil size={24} weight="duotone" />
                                                    </span>
                                                    <span class="menu-text"
                                                        >Modulo Iscrizioni
                                                        <!-- <sup><div class="coming-soon-badge">In Arrivo</div></sup> -->
                                                    </span>
                                                </a>
                                            </li>
                                        {/if}
                                        {#if canPerformAction('association.modules.read')}
                                            <!-- svelte-ignore a11y-role-supports-aria-props -->
                                            <li
                                                class="menu-item menu-item-submenu {$subPage == 'modules'
                                                    ? 'menu-item-active'
                                                    : ''}"
                                                aria-haspopup="true"
                                                data-menu-toggle="hover">
                                                <!-- class="menu-link coming-soon-item" -->
                                                <a
                                                    href={isFreePlan()
                                                        ? '/#/subscription/upgrade'
                                                        : '/#/members/modules'}
                                                    class="menu-link"
                                                    on:click={collapseSidebar}>
                                                    <span class="menu-icon">
                                                        <Browsers size={24} weight="duotone" />
                                                    </span>
                                                    <span class="menu-text"
                                                        >Moduli Web
                                                        <!-- <sup><div class="coming-soon-badge">In Arrivo</div></sup> -->
                                                    </span>
                                                </a>
                                            </li>
                                        {/if}
                                        <!-- {/if} -->
                                    </ul>
                                </div>
                            </li>
                        {/if}
                        {#if canPerformAction('association.courses.read') || canPerformAction('association.carnet.read') || canPerformAction('association.instructor.read')}
                            <li
                                class={$currentPage == 'course'
                                    ? 'menu-item menu-item-active menu-item-open'
                                    : 'menu-item menu-item-submenu'}
                                aria-haspopup="true"
                                data-menu-toggle="hover">
                                <!-- svelte-ignore a11y-invalid-attribute -->
                                <span class="menu-link menu-toggle">
                                    <span class="menu-icon">
                                        <Rows size={24} weight="duotone" />
                                    </span>
                                    <span class="menu-text">Attività</span>
                                    <i class="menu-arrow" />
                                </span>
                                <div class="menu-submenu">
                                    <i class="menu-arrow" />
                                    <ul class="menu-subnav">
                                        {#if canPerformAction('association.courses.read')}
                                            <li
                                                class="menu-item menu-item-submenu {$subPage == 'course-list'
                                                    ? 'menu-item-active'
                                                    : ''}"
                                                aria-haspopup="true"
                                                data-menu-toggle="hover">
                                                <a href="/#/course/list" class="menu-link" on:click={collapseSidebar}>
                                                    <span class="menu-icon">
                                                        <Volleyball size={24} weight="duotone" />
                                                    </span>
                                                    <span class="menu-text">Corsi e Abbonamenti</span>
                                                </a>
                                            </li>
                                        {/if}
                                        {#if canPerformAction('association.campsandretreats.read')}
                                            <li
                                                class="menu-item menu-item-submenu {$subPage ==
                                                'camps-and-retreats-list'
                                                    ? 'menu-item-active'
                                                    : ''}"
                                                aria-haspopup="true"
                                                data-menu-toggle="hover">
                                                <a
                                                    href="/#/course/camps-and-retreats/list"
                                                    class="menu-link"
                                                    on:click={collapseSidebar}>
                                                    <span class="menu-icon">
                                                        <Tent size={24} weight="duotone" />
                                                    </span>
                                                    <span class="menu-text">Camp e Ritiri</span>
                                                </a>
                                            </li>
                                        {/if}

                                        {#if canPerformAction('association.events.read')}
                                            <li
                                                class="menu-item menu-item-submenu {$subPage == 'events'
                                                    ? 'menu-item-active'
                                                    : ''}"
                                                aria-haspopup="true"
                                                data-menu-toggle="hover">
                                                <!-- class="menu-link coming-soon-item" -->
                                                <a
                                                    href={isFreePlan() ? '/#/subscription/upgrade' : '/#/events'}
                                                    class="menu-link"
                                                    on:click={collapseSidebar}>
                                                    <span class="menu-icon">
                                                        <Trophy size={24} weight="duotone" />
                                                    </span>
                                                    <span class="menu-text"
                                                        >Eventi e Tornei
                                                        <!-- <sup><div class="coming-soon-badge">In Arrivo</div></sup> -->
                                                    </span>
                                                </a>
                                            </li>
                                        {/if}

                                        {#if canPerformAction('association.carnet.read')}
                                            <li
                                                class="menu-item menu-item-submenu {$subPage == 'carnet-list'
                                                    ? 'menu-item-active'
                                                    : ''}"
                                                aria-haspopup="true"
                                                data-menu-toggle="hover">
                                                <!-- class="menu-link coming-soon-item" -->
                                                <a
                                                    href={isFreePlan()
                                                        ? '/#/subscription/upgrade'
                                                        : '/#/course/carnet/list/'}
                                                    class="menu-link"
                                                    on:click={collapseSidebar}>
                                                    <span class="menu-icon">
                                                        <Ticket size={24} weight="duotone" />
                                                    </span>
                                                    <span class="menu-text"
                                                        >Carnet
                                                        <!-- <sup><div class="coming-soon-badge">In Arrivo</div></sup> -->
                                                    </span>
                                                </a>
                                            </li>
                                        {/if}

                                        {#if canPerformAction('association.instructor.read')}
                                            <li
                                                class="menu-item menu-item-submenu {$subPage == 'instructor-list'
                                                    ? 'menu-item-active'
                                                    : ''}"
                                                aria-haspopup="true"
                                                data-menu-toggle="hover">
                                                <!-- class="menu-link coming-soon-item" -->
                                                <a
                                                    href={isFreePlan()
                                                        ? '/#/subscription/upgrade'
                                                        : '/#/course/instructor/list/'}
                                                    class="menu-link"
                                                    on:click={collapseSidebar}>
                                                    <span class="menu-icon">
                                                        <UserFocus size={24} weight="duotone" />
                                                    </span>
                                                    <span class="menu-text"
                                                        >Istruttori
                                                        <!-- <sup><div class="coming-soon-badge">In Arrivo</div></sup> -->
                                                    </span>
                                                </a>
                                            </li>
                                        {/if}
                                    </ul>
                                </div>
                            </li>
                        {/if}
                        {#if canPerformAction('association.communication.messages.read') || canPerformAction('association.communication.workflows.read') || canPerformAction('association.communication.settings.read')}
                            <li
                                class={$currentPage == 'communication'
                                    ? 'menu-item menu-item-active menu-item-open'
                                    : 'menu-item menu-item-submenu'}
                                aria-haspopup="true"
                                data-menu-toggle="hover">
                                <!-- svelte-ignore a11y-invalid-attribute -->
                                <span class="menu-link menu-toggle">
                                    <span class="menu-icon">
                                        <Confetti size={24} weight="duotone" />
                                    </span>
                                    <span class="menu-text">Comunicazioni</span>
                                    <i class="menu-arrow" />
                                </span>
                                <div class="menu-submenu">
                                    <i class="menu-arrow" />

                                    <ul class="menu-subnav">
                                        {#if canPerformAction('association.communication.messages.read')}
                                            <li
                                                class="menu-item menu-item-submenu {$subPage == 'messages-list'
                                                    ? 'menu-item-active'
                                                    : ''}"
                                                aria-haspopup="true"
                                                data-menu-toggle="hover">
                                                <!-- class="menu-link coming-soon-item" -->
                                                <a
                                                    href={isFreePlan()
                                                        ? '/#/subscription/upgrade'
                                                        : '/#/communication/messages'}
                                                    class="menu-link"
                                                    on:click={collapseSidebar}>
                                                    <span class="menu-icon">
                                                        <PaperPlaneTilt size={24} weight="duotone" />
                                                    </span>
                                                    <span class="menu-text"
                                                        >Messaggi
                                                        <!-- <sup><div class="coming-soon-badge">In Arrivo</div></sup> -->
                                                    </span>
                                                </a>
                                            </li>
                                        {/if}
                                        {#if canPerformAction('association.communication.workflows.read')}
                                            <li
                                                class="menu-item menu-item-submenu {$subPage == 'message-automation'
                                                    ? 'menu-item-active'
                                                    : ''}"
                                                aria-haspopup="true"
                                                data-menu-toggle="hover">
                                                <a
                                                    href={isFreePlan()
                                                        ? '/#/subscription/upgrade'
                                                        : '/#/communication/automation'}
                                                    class="menu-link"
                                                    on:click={collapseSidebar}>
                                                    <span class="menu-icon">
                                                        <TreeStructure size={24} weight="duotone" />
                                                    </span>
                                                    <span class="menu-text">Automazioni</span>
                                                </a>
                                            </li>
                                        {/if}
                                        {#if canPerformAction('association.communication.settings.read')}
                                            <li
                                                class="menu-item menu-item-submenu {$subPage == 'email' ||
                                                $subPage == 'sms' ||
                                                $subPage == 'stats'
                                                    ? 'menu-item-active'
                                                    : ''}"
                                                aria-haspopup="true"
                                                data-menu-toggle="hover">
                                                <!-- class="menu-link coming-soon-item" -->
                                                <a
                                                    href={isFreePlan()
                                                        ? '/#/subscription/upgrade'
                                                        : '/#/communication/configuration'}
                                                    class="menu-link"
                                                    on:click={collapseSidebar}>
                                                    <span class="menu-icon">
                                                        <GearSix size={24} weight="duotone" />
                                                    </span>
                                                    <span class="menu-text"
                                                        >Configurazioni
                                                        <!-- <sup><div class="coming-soon-badge">In Arrivo</div></sup> -->
                                                    </span>
                                                </a>
                                            </li>
                                        {/if}
                                    </ul>
                                </div>
                            </li>
                        {/if}

                        {#if canPerformAction('association.archive.read')}
                            <li
                                class={$currentPage == 'archive'
                                    ? 'menu-item menu-item-active'
                                    : 'menu-item menu-item-submenu'}
                                aria-haspopup="true"
                                data-menu-toggle="hover">
                                <a href={'/#/archive'} class="menu-link" on:click={collapseSidebar}>
                                    <span class="menu-icon">
                                        <Folders size={24} weight="duotone" />
                                    </span>
                                    <span class="menu-text">Archivio</span>
                                </a>
                            </li>
                        {/if}

                        {#if canPerformAction('association.report.read')}
                            <li
                                class={$currentPage == 'report'
                                    ? 'menu-item menu-item-active'
                                    : 'menu-item menu-item-submenu'}
                                aria-haspopup="true"
                                data-menu-toggle="hover">
                                <a
                                    href={isFreePlan() ? '/#/subscription/upgrade' : '/#/report'}
                                    class="menu-link"
                                    on:click={collapseSidebar}>
                                    <span class="menu-icon">
                                        <ChartPieSlice size={24} weight="duotone" />
                                    </span>
                                    <span class="menu-text">Report</span>
                                </a>
                            </li>
                        {/if}
                        <li class="menu-section">
                            <h4 class="menu-text">Contabilità</h4>
                            <i class="menu-icon ki ki-bold-more-hor icon-md" />
                        </li>
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        {#if canPerformAction('bookeeping.payments.read')}
                            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                            <li
                                class={$currentPage == 'payment'
                                    ? 'menu-item menu-item-active'
                                    : 'menu-item menu-item-submenu'}
                                on:click={() => push('/payment/list')}
                                aria-haspopup="true"
                                data-menu-toggle="hover">
                                <a href="/#/payment/list" class="menu-link menu-toggle" on:click={collapseSidebar}>
                                    <span class="menu-icon">
                                        <Wallet size={24} weight="duotone" />
                                    </span>
                                    <span class="menu-text">Pagamenti</span>
                                </a>
                            </li>
                        {/if}

                        {#if canPerformAction('bookeeping.documents.invoices.read')}
                            <li
                                class={$currentPage == 'invoice'
                                    ? 'menu-item menu-item-active menu-item-open'
                                    : 'menu-item menu-item-submenu'}
                                data-menu-toggle="hover">
                                <span class="menu-link menu-toggle">
                                    <span class="menu-icon">
                                        <Files size={24} weight="duotone" />
                                    </span>
                                    <span class="menu-text">Documenti fiscali</span>
                                    <i class="menu-arrow" />
                                </span>
                                <div class="menu-submenu">
                                    <i class="menu-arrow" />
                                    <ul class="menu-subnav">
                                        {#if canPerformAction('bookeeping.documents.invoices.read')}
                                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                                            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                                            <!-- svelte-ignore a11y-role-supports-aria-props -->
                                            <li
                                                class="menu-item menu-item-submenu {$subPage == 'invoice-list'
                                                    ? 'menu-item-active'
                                                    : ''}"
                                                on:click={() => replace('/invoice/list')}
                                                aria-haspopup="true"
                                                data-menu-toggle="hover">
                                                <!-- svelte-ignore a11y-missing-attribute -->
                                                <!-- svelte-ignore a11y-no-static-element-interactions -->
                                                <a class="menu-link" on:click={collapseSidebar}>
                                                    <span class="menu-icon">
                                                        <FileText size={24} weight="duotone" />
                                                    </span>
                                                    <span class="menu-text">Ricevute</span>
                                                    {#if newInvoices > 0}
                                                        <span class="menu-label">
                                                            <span class="label label-primary label-rounded"
                                                                >{newInvoices}</span>
                                                        </span>
                                                    {/if}
                                                </a>
                                            </li>
                                        {/if}
                                        {#if canPerformAction('bookeeping.documents.clientinvoices.read')}
                                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                                            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                                            <!-- svelte-ignore a11y-role-supports-aria-props -->
                                            <li
                                                on:click={() => {
                                                    isFreePlan()
                                                        ? (location.href = '/#/subscription/upgrade')
                                                        : (location.href = '/#/customers-invoice/list');
                                                }}
                                                class="menu-item menu-item-submenu {$subPage == 'customers-invoice-list'
                                                    ? 'menu-item-active'
                                                    : ''}"
                                                aria-haspopup="true"
                                                data-menu-toggle="hover">
                                                <!-- svelte-ignore a11y-missing-attribute -->
                                                <!-- svelte-ignore a11y-no-static-element-interactions -->
                                                <a class="menu-link" on:click={collapseSidebar}>
                                                    <span class="menu-icon">
                                                        <File size={24} weight="duotone" />
                                                    </span>
                                                    <span class="menu-text">Fatture Attive</span>
                                                </a>
                                            </li>
                                        {/if}

                                        {#if canPerformAction('bookeeping.documents.supplierinvoices.read')}
                                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                                            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                                            <!-- svelte-ignore a11y-role-supports-aria-props -->
                                            <li
                                                on:click={() => {
                                                    isFreePlan()
                                                        ? (location.href = '/#/subscription/upgrade')
                                                        : (location.href = '/#/suppliers-invoice/list');
                                                }}
                                                class="menu-item menu-item-submenu {$subPage == 'suppliers-invoice-list'
                                                    ? 'menu-item-active'
                                                    : ''}"
                                                aria-haspopup="true"
                                                data-menu-toggle="hover">
                                                <!-- svelte-ignore a11y-missing-attribute -->
                                                <!-- svelte-ignore a11y-no-static-element-interactions -->
                                                <a class="menu-link" on:click={collapseSidebar}>
                                                    <span class="menu-icon">
                                                        <File size={24} weight="duotone" />
                                                    </span>
                                                    <span class="menu-text">Fatture Passive</span>
                                                </a>
                                            </li>
                                        {/if}
                                    </ul>
                                </div>
                            </li>
                        {/if}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        {#if canPerformAction('bookeeping.management.balancesheet.read') || canPerformAction('bookeeping.management.suppliers.read') || canPerformAction('bookeeping.management.accounts.read') || canPerformAction('bookeeping.management.accountstransfer.read')}
                            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                            <li
                                on:click={() => {
                                    if (isFreePlan()) location.href = '/#/subscription/upgrade';
                                }}
                                class={$currentPage == 'balance-sheet'
                                    ? 'menu-item menu-item-active menu-item-open'
                                    : 'menu-item menu-item-submenu'}
                                aria-haspopup="true"
                                data-menu-toggle="hover">
                                <span class="menu-link menu-toggle">
                                    <span class="menu-icon">
                                        <Percent size={24} weight="duotone" />
                                    </span>
                                    <span class="menu-text">Gestione</span>
                                    <i class="menu-arrow" />
                                </span>
                                <div class="menu-submenu">
                                    <i class="menu-arrow" />
                                    <ul class="menu-subnav">
                                        <li class="menu-item menu-item-parent" aria-haspopup="true">
                                            <span class="menu-link">
                                                <span class="menu-text">Gestione</span>
                                            </span>
                                        </li>
                                        {#if canPerformAction('bookeeping.management.suppliers.read')}
                                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                                            <!-- svelte-ignore a11y-role-supports-aria-props -->
                                            <li
                                                class="menu-item menu-item-submenu {$subPage == 'suppliers-list'
                                                    ? 'menu-item-active'
                                                    : ''}"
                                                on:click={() => replace('/suppliers-and-customers/list')}
                                                aria-haspopup="true"
                                                data-menu-toggle="hover">
                                                <!-- svelte-ignore a11y-missing-attribute -->
                                                <!-- svelte-ignore a11y-no-static-element-interactions -->
                                                <a class="menu-link" on:click={collapseSidebar}>
                                                    <span class="menu-icon">
                                                        <AddressBook size={24} weight="duotone" />
                                                    </span>
                                                    <span class="menu-text">Fornitori e Clienti</span>
                                                </a>
                                            </li>
                                        {/if}
                                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                                        {#if canPerformAction('bookeeping.management.accounts.read')}
                                            <!-- svelte-ignore a11y-role-supports-aria-props -->
                                            <li
                                                class="menu-item menu-item-submenu {$subPage == 'accounting-list'
                                                    ? 'menu-item-active'
                                                    : ''}"
                                                on:click={() => replace('/accounting/list')}
                                                aria-haspopup="true"
                                                data-menu-toggle="hover">
                                                <!-- svelte-ignore a11y-missing-attribute -->
                                                <!-- svelte-ignore a11y-no-static-element-interactions -->
                                                <a class="menu-link" on:click={collapseSidebar}>
                                                    <span class="menu-icon">
                                                        <Bank size={24} weight="duotone" />
                                                    </span>
                                                    <span class="menu-text">Conti Finanziari</span>
                                                </a>
                                            </li>
                                        {/if}
                                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                                        {#if canPerformAction('bookeeping.management.accountstransfers.read')}
                                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                                            <!-- svelte-ignore a11y-role-supports-aria-props -->
                                            <li
                                                class="menu-item menu-item-submenu {$subPage ==
                                                'accounting-transfer-list'
                                                    ? 'menu-item-active'
                                                    : ''}"
                                                on:click={() => replace('/accounting-transfer/list')}
                                                aria-haspopup="true"
                                                data-menu-toggle="hover">
                                                <!-- svelte-ignore a11y-missing-attribute -->
                                                <!-- svelte-ignore a11y-no-static-element-interactions -->
                                                <a class="menu-link" on:click={collapseSidebar}>
                                                    <span class="menu-icon">
                                                        <Coins size={24} weight="duotone" />
                                                    </span>
                                                    <span class="menu-text">Giroconti</span>
                                                </a>
                                            </li>
                                        {/if}
                                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                                        <!-- <li
                                        class="menu-item menu-item-submenu {$subPage == 'accounting-transactions-list'
                                            ? 'menu-item-active'
                                            : ''}"
                                        on:click={() => replace('/balance-sheet/list')}
                                        aria-haspopup="true"
                                        data-menu-toggle="hover">
                                        <a class="menu-link" on:click={collapseSidebar}>
                                            <span class="menu-icon">
                                                <TrendUp size={24} weight="duotone" />
                                            </span>
                                            <span class="menu-text">Entrate e Uscite</span>
                                        </a>
                                    </li> -->
                                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                                        {#if canPerformAction('bookeeping.management.balancesheet.read')}
                                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                                            <!-- svelte-ignore a11y-role-supports-aria-props -->
                                            <li
                                                class="menu-item menu-item-submenu {$subPage == 'balance-sheet-manage'
                                                    ? 'menu-item-active'
                                                    : ''}"
                                                on:click={() => replace('/balance-sheet/list')}
                                                aria-haspopup="true"
                                                data-menu-toggle="hover">
                                                <!-- svelte-ignore a11y-missing-attribute -->
                                                <a class="menu-link" on:click={collapseSidebar}>
                                                    <span class="menu-icon">
                                                        <ChartBar size={24} weight="duotone" />
                                                    </span>
                                                    <span class="menu-text">Bilancio</span>
                                                </a>
                                            </li>
                                        {/if}
                                    </ul>
                                </div>
                            </li>
                        {/if}
                    {:else}
                        <li class="menu-section">
                            <h4 class="menu-text">Attività</h4>
                            <i class="menu-icon ki ki-bold-more-hor icon-md" />
                        </li>
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <li
                            class={$currentPage == 'subscription'
                                ? 'menu-item menu-item-active'
                                : 'menu-item menu-item-submenu'}
                            on:click={() => push('/subscription/list')}
                            aria-haspopup="true"
                            data-menu-toggle="hover">
                            <a href="/#/subscription/list" class="menu-link menu-toggle" on:click={collapseSidebar}>
                                <span class="menu-icon">
                                    <Users size={24} weight="duotone" />
                                </span>
                                <span class="menu-text">Iscrizioni</span>
                            </a>
                        </li>
                        <li
                            class={$currentPage == 'carnet'
                                ? 'menu-item menu-item-active'
                                : 'menu-item menu-item-submenu'}
                            on:click={() => push('/carnet/list')}
                            aria-haspopup="true"
                            data-menu-toggle="hover">
                            <a href="/#/carnet/list" class="menu-link menu-toggle" on:click={collapseSidebar}>
                                <span class="menu-icon">
                                    <Ticket size={24} weight="duotone" />
                                </span>
                                <span class="menu-text">Carnet</span>
                            </a>
                        </li>
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <li
                            class={$currentPage == 'payment'
                                ? 'menu-item menu-item-active'
                                : 'menu-item menu-item-submenu'}
                            on:click={() => push('/payment/list')}
                            aria-haspopup="true"
                            data-menu-toggle="hover">
                            <a href="/#/payment/list" class="menu-link menu-toggle" on:click={collapseSidebar}>
                                <span class="menu-icon">
                                    <Wallet size={24} weight="duotone" />
                                </span>
                                <span class="menu-text">Pagamenti</span>
                            </a>
                        </li>
                    {/if}

                    <li class="menu-section">
                        <h4 class="menu-text">Altro</h4>
                        <i class="menu-icon ki ki-bold-more-hor icon-md" />
                    </li>
                    {#if canPerformAction('other.users.collaborators.read') || canPerformAction('other.users.connectedathletes.read')}
                        {#if $role != 'athlete' && canPerformAction('other.users.collaborators.read')}
                            <li
                                class={$subPage == 'connected-collaborators'
                                    ? 'menu-item menu-item-active'
                                    : 'menu-item'}
                                aria-haspopup="true"
                                data-menu-toggle="hover">
                                <a href="/#/connected-collaborators" class="menu-link" on:click={collapseSidebar}>
                                    <span class="menu-icon">
                                        <UserList size={24} weight="duotone" />
                                    </span>
                                    <span class="menu-text">Collaboratori</span>
                                </a>
                            </li>
                        {/if}

                        <li
                            class={$currentPage == 'users'
                                ? 'menu-item menu-item-active menu-item-open d-none'
                                : 'menu-item menu-item-submenu d-none'}
                            aria-haspopup="true"
                            data-menu-toggle="hover">
                            <span class="menu-link menu-toggle">
                                <span class="menu-icon">
                                    <UserList size={24} weight="duotone" />
                                </span>
                                <span class="menu-text">Utenti</span>
                                <i class="menu-arrow" />
                            </span>
                            <div class="menu-submenu d-none">
                                <i class="menu-arrow" />
                                <ul class="menu-subnav">
                                    <!-- {#if $role != 'athlete' && canPerformAction('other.users.collaborators.read')}
                                        <li
                                            class={$subPage == 'connected-collaborators'
                                                ? 'menu-item menu-item-active'
                                                : 'menu-item'}
                                            aria-haspopup="true"
                                            data-menu-toggle="hover">
                                            <a
                                                href="/#/connected-collaborators"
                                                class="menu-link"
                                                on:click={collapseSidebar}>
                                                <span class="menu-icon">
                                                    <UsersFour size={24} weight="duotone" />
                                                </span>
                                                <span class="menu-text">Collaboratori</span>
                                            </a>
                                        </li>
                                    {/if} -->

                                    <!-- {#if canPerformAction('other.users.connectedathletes.read')}
                                        <li
                                            class={$subPage == 'connected-athletes'
                                                ? 'menu-item menu-item-active'
                                                : 'menu-item'}
                                            aria-haspopup="true"
                                            data-menu-toggle="hover">
                                            <a
                                                href="/#/connected-athletes"
                                                class="menu-link"
                                                on:click={collapseSidebar}>
                                                <span class="menu-icon">
                                                    <UserList size={24} weight="duotone" />
                                                </span>
                                                <span class="menu-text">Persone collegate</span>
                                            </a>
                                        </li>
                                    {/if} -->
                                </ul>
                            </div>
                        </li>
                    {/if}
                    <li
                        class={$currentPage == 'profile' ? 'menu-item menu-item-active' : 'menu-item'}
                        aria-haspopup="true"
                        data-menu-toggle="hover">
                        <a href="/#/profile" class="menu-link" on:click={collapseSidebar}>
                            <span class="menu-icon">
                                <Gear size={24} weight="duotone" />
                            </span>
                            <span class="menu-text">
                                {$role !== 'athlete' ? 'Impostazioni' : 'Profilo'}
                            </span>
                        </a>
                    </li>
                </ul>
                <!--end::Menu Nav-->
                <div
                    class="version border border-2 position-sticky mx-auto"
                    style="width: 200px; background: #e6edf300;color: #000; border-radius: 1rem; margin-bottom:0; padding: .3rem; max-width: -webkit-fill-available; backdrop-filter: blur(4px) brightness(0.95) saturate(0);-webkit-backdrop-filter: blur(4px) brightness(0.95) saturate(0);">
                    <!-- svelte-ignore missing-declaration -->
                    <span
                        ><b>{__bakney.build.VERSION}</b> · {__bakney?.OEM_CONFIG?.abbreviation} © {new Date().getFullYear()}
                        <br />
                    </span>
                </div>
            </div>
            <!--end::Menu Container-->
        </div>
    {/if}

    <!--end::Aside Menu-->
</div>

<!--end::Aside-->

<style>
    .plan-bold {
        font-weight: bolder;
    }
    .current-plan {
        margin: auto;
        margin-bottom: 0.5rem;
        font-size: 0.85rem;
        width: fit-content;
        padding: 0.5rem 1rem;
        font-weight: normal;
        color: #555b60;
        border: 0.125rem solid #e8eff5;
        background-color: #e6edf3;
        border-radius: 0.5rem;
        cursor: pointer;
    }
    .version {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
        text-align: center;
        /* position: absolute; */
        bottom: 0;
        padding: 0.5rem;
        width: 100%;
        font-size: 0.75rem;
        color: #868686;
    }

    .plan-status {
        position: fixed;
        z-index: 3331017;
        width: 100vw;
        height: 2rem;
        align-items: center;
        display: flex;
        justify-content: center;
        font-weight: bold;
        padding: 1.3rem;
        bottom: 0;
        font-size: 1rem;
    }

    .beta-banner {
        position: absolute;
        top: 3.8rem;
        font-size: 0.7rem;
        font-weight: 500;
        padding: 0.2rem 0.8rem;
        border-radius: 0.7rem;
        height: fit-content;
        display: flex;
        text-align: center;
        justify-content: center;
        align-content: center;
        left: 1.2rem;
    }
</style>
