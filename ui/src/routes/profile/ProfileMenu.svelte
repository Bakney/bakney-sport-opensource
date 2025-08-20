<script>
    import {onMount} from 'svelte';
    import {querystring} from 'svelte-spa-router';
    import {refreshToken, sessionToken, expires, role, currentPage, userData, subPage} from 'store/stores.js';

    import {User, Sliders, FingerprintSimple, Password, StripeLogo, Money, Plugs} from 'phosphor-svelte';
    import {canPerformAction} from 'utils/Permissions';

    sessionToken.useLocalStorage();
    refreshToken.useLocalStorage();
    expires.useLocalStorage();
    role.useLocalStorage();
    currentPage.useLocalStorage();
    userData.useLocalStorage();
    subPage.useLocalStorage();

    let pages = ['info', 'twofa', 'stripe', 'password', 'settings', 'integrations'];
    export let changes = false;

    function checkParams() {
        let splittedQuery = $querystring.split('&');
        let queryKey = splittedQuery[0].split('=')[0];
        let page = splittedQuery[0].split('=')[1];

        if (pages.includes(page) && queryKey == 'page') subPage.set(page);
        else subPage.set('info');
    }

    onMount(async () => {
        checkParams();
    });

    const changeSubPage = function (page) {
        if ($subPage !== page) {
            if ($subPage === 'stripe' || $subPage === 'billing' || !changes) {
                subPage.set(page);
            } else {
                const confirmed = confirm(
                    'Sei sicuro di voler lasciare questa pagina? Eventuali modifiche non salvate andranno perse.'
                );
                if (confirmed) {
                    subPage.set(page);
                }
            }
        }
    };
</script>

<!--begin::Aside-->
<div class="flex-row-auto" id="kt_profile_aside">
    <!--begin::Nav Panels Wizard 2-->
    <div class="card card-custom gutter-b card-settings">
        <!--begin::Body-->
        <div class="card-body {KTUtil.isMobileDevice() ? '' : 'position-fixed'} navi-body-settings p-0 px-md-8 py-md-4">
            <!--begin::User-->
            <div class="d-flex align-items-center mt-4 nav-settings">
                <div class="symbol symbol-60 symbol-xxl-90 mr-5 align-self-start align-self-xxl-center">
                    {#if $userData?.avatar_image != null}
                        <div
                            class="symbol-label"
                            style="background-image:url('{$userData?.avatar_image != null
                                ? $userData?.avatar_image
                                : ''}')" />
                    {:else}
                        <div class="symbol symbol-35 symbol-light-info flex-shrink-0 mr-3">
                            <span class="symbol-label font-weight-bolder font-size-h1"
                                >{$userData?.first_name.charAt(0).toUpperCase()}{$userData?.last_name
                                    .charAt(0)
                                    .toUpperCase()}</span>
                        </div>
                    {/if}
                    <!-- <div class="symbol-label" style="background-image:url('{$userData.avatar_image != null ? $userData.avatar_image : ""}')"></div> -->
                    <!-- <i class="symbol-badge bg-success"></i> -->
                </div>
                <div>
                    <a href="#" class="font-weight-bolder font-size-h5 text-dark-75 text-hover-primary"
                        >{$userData.first_name} {$userData.last_name}</a>
                </div>
            </div>
            <!--end::User-->
            <!--begin::Contacts-->
            <div class="py-8 nav-settings">
                <div class="navi mt-5">
                    <span class="navi-link p-0 pb-2">
                        <span class="navi-icon mr-1">
                            <span class="svg-icon svg-icon-lg svg-icon-primary">
                                <!--begin::Svg Icon | path:assets/media/svg/icons/Communication/Mail-notification.svg-->
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    xmlns:xlink="http://www.w3.org/1999/xlink"
                                    width="24px"
                                    height="24px"
                                    viewBox="0 0 24 24"
                                    version="1.1">
                                    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                        <rect x="0" y="0" width="24" height="24" />
                                        <path
                                            d="M11.575,21.2 C6.175,21.2 2.85,17.4 2.85,12.575 C2.85,6.875 7.375,3.05 12.525,3.05 C17.45,3.05 21.125,6.075 21.125,10.85 C21.125,15.2 18.825,16.925 16.525,16.925 C15.4,16.925 14.475,16.4 14.075,15.65 C13.3,16.4 12.125,16.875 11,16.875 C8.25,16.875 6.85,14.925 6.85,12.575 C6.85,9.55 9.05,7.1 12.275,7.1 C13.2,7.1 13.95,7.35 14.525,7.775 L14.625,7.35 L17,7.35 L15.825,12.85 C15.6,13.95 15.85,14.825 16.925,14.825 C18.25,14.825 19.025,13.725 19.025,10.8 C19.025,6.9 15.95,5.075 12.5,5.075 C8.625,5.075 5.05,7.75 5.05,12.575 C5.05,16.525 7.575,19.1 11.575,19.1 C13.075,19.1 14.625,18.775 15.975,18.075 L16.8,20.1 C15.25,20.8 13.2,21.2 11.575,21.2 Z M11.4,14.525 C12.05,14.525 12.7,14.35 13.225,13.825 L14.025,10.125 C13.575,9.65 12.925,9.425 12.3,9.425 C10.65,9.425 9.45,10.7 9.45,12.375 C9.45,13.675 10.075,14.525 11.4,14.525 Z"
                                            fill="#000000" />
                                    </g>
                                </svg>
                                <!--end::Svg Icon-->
                            </span>
                        </span>
                        <span class="navi-text text-muted font-weight-bolder" style="text-wrap: break-word;"
                            >{$userData.username}</span>
                    </span>
                </div>
                <div class="navi mt-1">
                    <span class="navi-link p-0 pb-2">
                        <span class="navi-icon mr-1">
                            <span class="svg-icon svg-icon-lg svg-icon-primary">
                                <!--begin::Svg Icon | path:assets/media/svg/icons/Communication/Mail-notification.svg-->
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    xmlns:xlink="http://www.w3.org/1999/xlink"
                                    width="24px"
                                    height="24px"
                                    viewBox="0 0 24 24"
                                    version="1.1">
                                    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                        <rect x="0" y="0" width="24" height="24" />
                                        <path
                                            d="M4,9.67471899 L10.880262,13.6470401 C10.9543486,13.689814 11.0320333,13.7207107 11.1111111,13.740321 L11.1111111,21.4444444 L4.49070127,17.526473 C4.18655139,17.3464765 4,17.0193034 4,16.6658832 L4,9.67471899 Z M20,9.56911707 L20,16.6658832 C20,17.0193034 19.8134486,17.3464765 19.5092987,17.526473 L12.8888889,21.4444444 L12.8888889,13.6728275 C12.9050191,13.6647696 12.9210067,13.6561758 12.9368301,13.6470401 L20,9.56911707 Z"
                                            fill="#000000" />
                                        <path
                                            d="M4.21611835,7.74669402 C4.30015839,7.64056877 4.40623188,7.55087574 4.5299008,7.48500698 L11.5299008,3.75665466 C11.8237589,3.60013944 12.1762411,3.60013944 12.4700992,3.75665466 L19.4700992,7.48500698 C19.5654307,7.53578262 19.6503066,7.60071528 19.7226939,7.67641889 L12.0479413,12.1074394 C11.9974761,12.1365754 11.9509488,12.1699127 11.9085461,12.2067543 C11.8661433,12.1699127 11.819616,12.1365754 11.7691509,12.1074394 L4.21611835,7.74669402 Z"
                                            fill="#000000"
                                            opacity="0.3" />
                                    </g>
                                </svg>
                                <!--end::Svg Icon-->
                            </span>
                        </span>
                        <span class="navi-text text-muted font-weight-bolder" style="text-wrap: break-word;"
                            >{$role == 'association' ? 'Associazione Sportiva' : 'Atleta'}</span>
                    </span>
                </div>
                <div class="navi mt-1">
                    <a href="mailto:{$userData.email}" class="navi-item">
                        <span class="navi-link p-0 pb-2">
                            <span class="navi-icon mr-1">
                                <span class="svg-icon svg-icon-lg svg-icon-primary">
                                    <!--begin::Svg Icon | path:assets/media/svg/icons/Communication/Mail-notification.svg-->
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        xmlns:xlink="http://www.w3.org/1999/xlink"
                                        width="24px"
                                        height="24px"
                                        viewBox="0 0 24 24"
                                        version="1.1">
                                        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                            <rect x="0" y="0" width="24" height="24" />
                                            <path
                                                d="M21,12.0829584 C20.6747915,12.0283988 20.3407122,12 20,12 C16.6862915,12 14,14.6862915 14,18 C14,18.3407122 14.0283988,18.6747915 14.0829584,19 L5,19 C3.8954305,19 3,18.1045695 3,17 L3,8 C3,6.8954305 3.8954305,6 5,6 L19,6 C20.1045695,6 21,6.8954305 21,8 L21,12.0829584 Z M18.1444251,7.83964668 L12,11.1481833 L5.85557487,7.83964668 C5.4908718,7.6432681 5.03602525,7.77972206 4.83964668,8.14442513 C4.6432681,8.5091282 4.77972206,8.96397475 5.14442513,9.16035332 L11.6444251,12.6603533 C11.8664074,12.7798822 12.1335926,12.7798822 12.3555749,12.6603533 L18.8555749,9.16035332 C19.2202779,8.96397475 19.3567319,8.5091282 19.1603533,8.14442513 C18.9639747,7.77972206 18.5091282,7.6432681 18.1444251,7.83964668 Z"
                                                fill="#000000" />
                                            <circle fill="#000000" opacity="0.3" cx="19.5" cy="17.5" r="2.5" />
                                        </g>
                                    </svg>
                                    <!--end::Svg Icon-->
                                </span>
                            </span>
                            <span
                                class="navi-text text-muted font-weight-bolder text-hover-primary"
                                style="text-wrap: break-word;">{$userData.email}</span>
                        </span>
                    </a>
                </div>
            </div>
            <!--end::Contacts-->
            <!--begin::Nav-->
            <div class="navi navi-bold navi-hover navi-active navi-link-rounded navi-settings">
                <div class="navi-item mb-2">
                    <a
                        href="/#/profile"
                        on:click={() => changeSubPage('info')}
                        class="navi-link py-4 {$subPage == 'info' ? 'active' : ''}">
                        <span class="menu-icon m-0 mr-md-3">
                            <User size="24" weight="duotone" />
                        </span>
                        <span class="navi-text font-size-lg">Informazioni Account</span>
                    </a>
                </div>
                <div class="navi-item mb-2">
                    <a
                        href="/#/profile"
                        on:click={() => changeSubPage('twofa')}
                        class="navi-link py-4 {$subPage == 'twofa' ? 'active' : ''}">
                        <span class="menu-icon m-0 mr-md-3">
                            <FingerprintSimple size="24" weight="duotone" />
                        </span>
                        <span class="navi-text font-size-lg">Autenticazione 2 fattori</span>
                    </a>
                </div>
                <!-- svelte-ignore missing-declaration -->
                {#if $role != 'athlete' && canPerformAction('other.settings.read')}
                    <div class="navi-item mb-2">
                        <a
                            href="/#/profile"
                            on:click={() => changeSubPage('stripe')}
                            class="navi-link py-4 {$subPage == 'stripe' ? 'active' : ''}">
                            <span class="menu-icon m-0 mr-md-3">
                                <StripeLogo size="24" weight="duotone" />
                            </span>
                            <span class="navi-text font-size-lg">Pagamenti Stripe</span>
                        </a>
                    </div>
                {/if}
                <!-- These 2 sections need to be visible -->
                <div class="navi-item mb-2">
                    <a
                        href="/#/profile"
                        on:click={() => changeSubPage('password')}
                        class="navi-link py-4 {$subPage == 'password' ? 'active' : ''}">
                        <span class="menu-icon m-0 mr-md-3">
                            <Password size="24" weight="duotone" />
                        </span>
                        <span class="navi-text font-size-lg">Cambio Password</span>
                    </a>
                </div>
                {#if $role != 'athlete' && canPerformAction('other.settings.read')}
                    <div class="navi-item mb-2">
                        <a
                            href="/#/profile"
                            on:click={() => changeSubPage('settings')}
                            class="navi-link py-4 {$subPage == 'settings' ? 'active' : ''}">
                            <span class="menu-icon m-0 mr-md-3">
                                <Sliders size="24" weight="duotone" />
                            </span>
                            <span class="navi-text font-size-lg">Generali</span>
                        </a>
                    </div>
                    <div class="navi-item mb-2">
                        <a
                            href="/#/profile"
                            on:click={() => changeSubPage('integrations')}
                            class="navi-link py-4 {$subPage == 'integrations' ? 'active' : ''}">
                            <span class="menu-icon m-0 mr-md-3">
                                <Plugs size="24" weight="duotone" />
                            </span>
                            <span class="navi-text font-size-lg">Integrazioni</span>
                        </a>
                    </div>
                {/if}
            </div>
            <!--end::Nav-->
        </div>
        <!--end::Body-->
    </div>
    <!--end::Nav Panels Wizard 2-->
</div>
<!--end::Aside-->
