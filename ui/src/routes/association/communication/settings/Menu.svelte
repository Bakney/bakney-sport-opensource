<script>
    import {onMount} from 'svelte';
    import {querystring} from 'svelte-spa-router';
    import {refreshToken, sessionToken, expires, role, currentPage, userData, subPage} from 'store/stores.js';
    import {Envelope, ChatCenteredText, ChartBarHorizontal, Checks} from 'phosphor-svelte';

    sessionToken.useLocalStorage();
    refreshToken.useLocalStorage();
    expires.useLocalStorage();
    role.useLocalStorage();
    currentPage.useLocalStorage();
    userData.useLocalStorage();
    subPage.useLocalStorage();

    let pages = ['email', 'sms', 'stats'];

    function checkParams() {
        let splittedQuery = $querystring.split('&');
        let queryKey = splittedQuery[0].split('=')[0];
        let page = splittedQuery[0].split('=')[1];

        if (pages.includes(page) && queryKey == 'page') subPage.set(page);
        else subPage.set('email');
    }

    onMount(async () => {
        checkParams();
    });

    const changeSubPage = function (page) {
        subPage.set(page);
    };
</script>

<!--begin::Aside-->
<div class="flex-row-auto" id="kt_profile_aside">
    <!--begin::Nav Panels Wizard 2-->
    <div class="card card-custom gutter-b card-settings">
        <!--begin::Body-->
        <div class="card-body navi-body-settings p-0">
            <div class="text-center my-4 mb-7 nav-settings">
                <h3 class="font-weight-bolder text-dark font-size-h2 mb-5">Configurazione</h3>
            </div>
            <!--begin::Nav-->
            <div class="navi navi-bold navi-hover navi-active navi-link-rounded navi-settings">
                <div class="navi-item mb-2">
                    <a
                        href="/#/communication/configuration"
                        on:click={() => changeSubPage('email')}
                        class="navi-link py-4 {$subPage == 'email' ? 'active' : ''}">
                        <span class="menu-icon m-0 mr-md-3">
                            <Envelope size="24" weight="duotone" />
                        </span>
                        <span class="navi-text font-size-lg">Email SMTP</span>
                    </a>
                </div>
                <div class="navi-item mb-2">
                    <a
                        href="/#/communication/configuration"
                        on:click={() => changeSubPage('sms')}
                        class="navi-link py-4 {$subPage == 'sms' ? 'active' : ''}">
                        <span class="menu-icon m-0 mr-md-3">
                            <ChatCenteredText size="24" weight="duotone" />
                        </span>
                        <span class="navi-text font-size-lg">SMS e utlizzo</span>
                    </a>
                </div>
                <div class="navi-item mb-2">
                    <a
                        href="/#/communication/configuration"
                        on:click={() => changeSubPage('stats')}
                        class="navi-link py-4 {$subPage == 'stats' ? 'active' : ''}">
                        <span class="menu-icon m-0 mr-md-3">
                            <Checks size="24" weight="duotone" />
                        </span>
                        <span class="navi-text font-size-lg">Statische Email</span>
                    </a>
                </div>
            </div>
            <!--end::Nav-->
        </div>
        <!--end::Body-->
    </div>
    <!--end::Nav Panels Wizard 2-->
</div>
<!--end::Aside-->
