<script>
    import {
        sessionToken,
        notifications,
        refreshToken,
        expires,
        billingData,
        role,
        userData as userDataStore,
        unreadNotificationsCounter,
    } from 'store/stores.js';
    import DashboardLayout from './layouts/DashboardLayout.svelte';
    import {slide} from 'svelte/transition';
    import {setPermissions} from 'utils/Permissions';
    import {onMount, afterUpdate, beforeUpdate} from 'svelte';
    import Router, {pop} from 'svelte-spa-router';
    import {push} from 'svelte-spa-router';
    import routes from './routes';
    import {apiFetch} from 'utils/ApiMiddleware.js';
    import {location} from 'svelte-spa-router';
    import UpdatesToast from 'components/notify/UpdatesToast.svelte';
    import {Toaster} from 'svelte-sonner';
    import OnboardingChecklist from 'components/onboarding/onboarding-checklist.svelte';

    sessionToken.useLocalStorage();
    refreshToken.useLocalStorage();
    expires.useLocalStorage();
    userDataStore.useLocalStorage();

    let isLoaded = false;
    let offline = false;
    let refreshingToken = false;

    $: {
        if ($userDataStore.dark_mode) {
            document.querySelector('html').setAttribute('data-theme', 'dark');
        } else {
            document.querySelector('html').removeAttribute('data-theme');
        }
    }

    window.goBack = function (delta) {
        [...Array(delta)].map(async x => {
            console.info('going back', delta);
            setTimeout(() => {
                console.info('popping');
                pop();
            }, 30);
        });
    };

    onMount(async () => {
        if ($sessionToken && $userDataStore?.requires_welcome && $role != 'athlete' && $location != '/welcome') {
            push('/welcome');
        }
        // set the title
        document.title = __bakney.OEM_CONFIG?.meta?.title || 'Open Source';
        // set description
        document.description = __bakney.OEM_CONFIG?.meta?.description || 'Open Source';
        // manifest
        document
            .querySelector('link[rel="manifest"]')
            .setAttribute('href', __bakney.OEM_CONFIG?.meta?.manifest || '/manifest.json');

        if (localStorage.getItem('sessionToken') == 'null' || localStorage.getItem('sessionToken') == null) {
            localStorage.clear();
            if (
                !$location.includes('/stripe/payment/done') &&
                !$location.includes('/stripe/pay/') &&
                !$location.includes('/subscribe/') &&
                !$location.includes('/subscribe-multiple/') &&
                !$location.includes('/forms/') &&
                !$location.includes('/invite') &&
                !$location.includes('/reset') &&
                !$location.includes('shared-calendar') &&
                !$location.includes('/card')
            )
                push('/login');
        }

        // repeated every 30 seconds
        setInterval(() => {
            if ($sessionToken && !$location.includes('/stripe/payment/done') && !$location.includes('/stripe/pay')) {
                // checkExpired();
                getNotifications();
            }

            // getting health status
            apiFetch(__bakney.env.API.HEALTH).then(res => {
                if (!res.error) offline = false;
                else offline = true;
            });
        }, 60000);

        document.addEventListener('click', () => {
            document.querySelectorAll('.popover').forEach(popover => popover.remove());
            document.querySelectorAll('.tooltip').forEach(popover => popover.remove());
        });
        await checkPermissions();
        setInterval(checkPermissions, 5000);

        if (
            sessionStorage.getItem('redirectAfterLogin') == 1 &&
            $role == 'athlete' &&
            $sessionToken != null &&
            $sessionToken != 'undefined' &&
            $sessionToken != 'null' &&
            $sessionToken != '' &&
            $sessionToken != '""'
        ) {
            let username = sessionStorage.getItem('sportAssociationUsername');
            push(`/search/profile/${username}/open`);
        }
    });

    beforeUpdate(() => {
        if ($sessionToken && $userDataStore?.requires_welcome && $role != 'athlete' && $location != '/welcome') {
            // $userDataStore.requires_welcome = false;
            push('/welcome');
        }
    });

    afterUpdate(() => {
        if ($location != '/error') {
            checkUserData();
        }
    });

    function checkUserData() {
        let userData = localStorage.getItem('userData');
        if ($sessionToken) {
            // if userData is null or undefined or {}
            if (userData == '{}' || userData == null || userData == undefined) {
                // guard to avoid reloading info each time
                apiFetch(__bakney.env.API.PROFILE.INFO).then(res => {
                    if (!res.error) {
                        userDataStore.set(res.response.user_data);
                    }
                });
            }
            return;
        }
        if ($location == '/reset') return;
        if (
            $location == '/login' ||
            userData == 'null' ||
            userData == 'undefined' ||
            userData == null ||
            userData == undefined
        ) {
            localStorage.clear();
            if (
                !$location.includes('/stripe/payment/done') &&
                !$location.includes('/stripe/pay/') &&
                !$location.includes('/subscribe/') &&
                !$location.includes('/subscribe-multiple/') &&
                !$location.includes('/forms/') &&
                !$location.includes('/invite') &&
                !$location.includes('shared-calendar') &&
                !$location.includes('/card')
            )
                push('/login');
        }
    }

    async function checkPermissions() {
        let currentPage = localStorage.getItem('currentPage');
        if (
            currentPage &&
            !window.location.href.includes('/stripe') &&
            currentPage != 'login' &&
            $role != 'association' &&
            $role != 'athlete' &&
            $sessionToken != null
        ) {
            await apiFetch(__bakney.env.API.BILLING.ACTIVE_PLAN).then(async res => {
                if (!res.error) {
                    billingData.set(res.response.data);
                    await apiFetch(__bakney.env.API.PROFILE.INFO).then(res => {
                        if (!res.error) {
                            role.set(res.response.info.role);
                            setPermissions($billingData?.active_plan?.billing_type, $role);
                        }
                    });
                } else {
                    apiFetch(__bakney.env.API.PROFILE.INFO).then(res => {
                        if (!res.error && res.response.info.role != $role) {
                            role.set(res.response.info.role);
                        }
                    });
                }
            });
        }
    }

    export async function checkExpired() {
        // guard to avoid check when refreshing token
        if (refreshingToken) return;
        if ($sessionToken == null) return;
        if ($location == '/login') return;

        refreshingToken = true;
        let dateTime = new Date();
        let expiringTime = localStorage.getItem('expires') || Date.now() - 100;
        if ($sessionToken && expiringTime && dateTime.getTime() > expiringTime) {
            let res = await apiFetch(__bakney.env.API.OAUTH2.REFRESH_TOKEN, {
                method: 'POST',
                body: JSON.stringify({refresh_token: $refreshToken}),
            });
            let response = res.response;
            if (!res.error) {
                localStorage.setItem('sessionToken', `"${response?.access_token}"`);
                localStorage.setItem('refreshToken', `"${response?.refresh_token}"`);
                localStorage.setItem('expires', Date.now() + parseInt(response.expires_in) * 1000);
            } else {
                localStorage.clear();
                if (
                    !$location.includes('/stripe/payment/done') &&
                    !$location.includes('/stripe/pay') &&
                    !$location.includes('/subscribe/') &&
                    !$location.includes('/subscribe-multiple/') &&
                    !$location.includes('/forms/') &&
                    !$location.includes('/invite') &&
                    !$location.includes('/shared-calendar')
                )
                    push('/login');
            }
            refreshingToken = false;
        } else {
            refreshingToken = false;
        }
    }

    function getNotifications() {
        if (!$sessionToken) return;
        // getting new notifications
        apiFetch(__bakney.env.API.NOTIFICATION.ALL).then(res => {
            // spinner stop
            KTApp.unblockPage();
            $notifications = res.response.data;

            $unreadNotificationsCounter = 0;
            $notifications?.forEach(notification => {
                if (!notification.read) {
                    $unreadNotificationsCounter++;
                }
            });
        });
    }
</script>

{#if JSON.parse(localStorage.getItem('sessionToken')) !== null && !$location.includes('/card') && !$location.includes('/welcome') && !$location.includes('/forms/') && !$location.includes('/email-builder') && !$location.includes('/subscribe/') && !$location.includes('/subscribe-multiple/') && !$location.includes('/invite') && !$location.includes('/reset') && !$location.includes('/shared-calendar') && $location != '/error' && $location != '/login' && localStorage.getItem('sessionToken') != null && localStorage.getItem('currentPage') != 'login' && sessionStorage.getItem('inconsistencies') == null}
    <DashboardLayout routerComponent={Router} {routes} />
    {#if $userDataStore?.onboarding && !($userDataStore?.onboarding?.create_membership && $userDataStore?.onboarding?.view_membership && $userDataStore?.onboarding?.approve_payment && $userDataStore?.onboarding?.download_invoice && $userDataStore?.onboarding?.view_collaborators && $userDataStore?.onboarding?.view_settings)}
        <OnboardingChecklist />
    {/if}
{:else}
    <Router
        {routes}
        on:routeLoading={() => (isLoaded = false)}
        on:routeLoaded={() => (isLoaded = true)}
        on:conditionsFailed={() => {
            push('/404');
        }} />
{/if}

{#if offline}
    <div transition:slide={{duration: 350, y: 5}} class="connection-status">Connessione persa, sei offline...</div>
{/if}

<UpdatesToast />

<Toaster
    position="bottom-center"
    expand={false}
    richColors={true}
    offset="20px"
    toastOptions={{
        class: 'shadow-none border-2 rounded-lg mb-0',
        duration: 3000,
    }} />

<svelte:head>
    <!-- Using the variable dynamically in the href attribute -->
    <link rel="apple-touch-icon" href={__bakney.OEM_CONFIG?.meta?.appleTouchIcon} />
</svelte:head>

<style>
    .connection-status {
        position: fixed;
        z-index: 3331017;
        width: 100vw;
        height: 1rem;
        align-items: center;
        display: flex;
        justify-content: center;
        background: #f3293c;
        font-weight: bold;
        padding: 0.5rem;
        color: #fff;
        top: 0;
        font-size: 0.8rem;
        pointer-events: none;
    }

    :global([data-sonner-toaster][data-theme='light']) {
        /* Normal toast */
        --normal-bg: var(--white);
        --normal-border: var(--gray);
        --normal-text: var(--dark);

        /* Success toast */
        --success-bg: color-mix(in srgb, var(--success) 15%, var(--white)) !important;
        --success-border: color-mix(in srgb, var(--success) 23%, var(--white)) !important;
        --success-text: color-mix(in srgb, var(--success) 95%, var(--dark)) !important;

        /* Info toast */
        --info-bg: color-mix(in srgb, var(--info) 10%, var(--white));
        --info-border: var(--info);
        --info-text: color-mix(in srgb, var(--info) 80%, var(--dark));

        /* Warning toast */
        --warning-bg: color-mix(in srgb, var(--warning) 10%, var(--white));
        --warning-border: var(--warning);
        --warning-text: color-mix(in srgb, var(--warning) 80%, var(--dark));

        /* Error toast */
        --error-bg: color-mix(in srgb, var(--danger) 10%, var(--white));
        --error-border: var(--danger);
        --error-text: color-mix(in srgb, var(--danger) 80%, var(--dark));
    }
</style>
