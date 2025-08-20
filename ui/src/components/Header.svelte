<script>
    import UserPanel from './UserPanel.svelte';
    import {
        userData,
        sessionToken,
        notifications,
        unreadNotificationsCounter,
        role,
        sidebarCollapsed,
        isExpired,
    } from 'store/stores.js';
    import {push, replace} from 'svelte-spa-router';
    import {onMount} from 'svelte';
    import {apiFetch} from 'utils/ApiMiddleware';
    import {Bell, CaretDoubleLeft, CaretDoubleRight, Gift, HandHeart, Info, Money, Question} from 'phosphor-svelte';
    import SmartCommandModal from './modals/SmartCommandModal.svelte';
    import {toast} from 'svelte-sonner';
    import Portal from 'svelte-portal';
    import {canPerformAction} from 'utils/Permissions';
    // import { apiFetch } from '../utils/apiMiddleware.js';

    userData.useLocalStorage();
    sessionToken.useLocalStorage();
    role.useLocalStorage();
    isExpired.useLocalStorage();

    let showCommandModal = false;

    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        minute: 'numeric',
        hour: 'numeric',
    };

    onMount(() => {
        if (
            __bakney?.OEM_CONFIG?.displaySettings?.navbar?.showNotifications &&
            canPerformAction('other.notifications.read')
        ) {
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
        if (__bakney?.OEM_CONFIG?.displaySettings?.general?.searchBar) {
            // key binding
            document.onkeydown = function (e) {
                // ctrl + k
                if (e.ctrlKey && e.key === 'k') {
                    document.getElementById('bkn_search_input')?.focus();
                    return false;
                }
            };

            // add and override eventListener for ctrl + K or COMMAND + K
            document.addEventListener('keydown', function (e) {
                if ((e.ctrlKey && e.key === 'k') || (e.metaKey && e.key === 'k')) {
                    // document.getElementById('bkn_search_input')?.focus();
                    showCommandModal = true;
                    return false;
                }
            });
        }
        KTLayoutQuickUser.init('kt_quick_user');
    });

    const readNotification = function (notificationId) {
        let readNotificationUrl = __bakney.env.HOST + '/notifications/' + notificationId + '/read/';
        window
            .fetch(readNotificationUrl, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + $sessionToken,
                },
            })
            .then(async function (response) {
                let res = await response.json();
                // spinner stop
                KTApp.unblockPage();
                if (response.status == 200) {
                    location.reload();
                }
            });
    };

    const readAllNotifications = function () {
        let readNotificationUrl = __bakney.env.HOST + '/notifications/all/read/';
        window
            .fetch(readNotificationUrl, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + $sessionToken,
                },
            })
            .then(async function (response) {
                let res = await response.json();
                // spinner stop
                KTApp.unblockPage();
                if (response.status == 200) {
                    toast.success('Notifiche lette.');
                    // alert('all notifications readed.');
                    setTimeout(() => {
                        location.reload();
                    }, 1000);
                }
            });
    };

    let searchResult = {
        users_match: [],
        sport_associations_match: [],
    };

    let error = false;

    jQuery(document).ready(async function () {
        var KTLayoutSearchBakney = function () {
            // Private properties
            var _target;
            var _form;
            var _input;
            var _closeIcon;
            var _resultWrapper;
            var _resultDropdown;
            var _resultDropdownToggle;
            var _closeIconContainer;
            var _inputGroup;
            var _query = '';

            var _hasResult = false;
            var _timeout = false;
            var _isProcessing = false;
            var _requestTimeout = 500; // ajax request fire timeout in milliseconds
            var _spinnerClass = 'spinner spinner-sm spinner-primary';
            var _resultClass = 'quick-search-has-result';
            var _minLength = 3;

            // Private functions
            var _showProgress = function () {
                _isProcessing = true;
                KTUtil.addClass(_closeIconContainer, _spinnerClass);

                if (_closeIcon) {
                    KTUtil.hide(_closeIcon);
                }
            };

            var _hideProgress = function () {
                _isProcessing = false;
                KTUtil.removeClass(_closeIconContainer, _spinnerClass);

                if (_closeIcon) {
                    if (_input.value.length < _minLength) {
                        KTUtil.hide(_closeIcon);
                    } else {
                        KTUtil.show(_closeIcon, 'flex');
                    }
                }
            };

            var _showDropdown = function () {
                if (_resultDropdownToggle && !KTUtil.hasClass(_resultDropdown, 'show')) {
                    jQuery(_resultDropdownToggle).dropdown('toggle');
                    jQuery(_resultDropdownToggle).dropdown('update');
                }
            };

            var _hideDropdown = function () {
                if (_resultDropdownToggle && KTUtil.hasClass(_resultDropdown, 'show')) {
                    jQuery(_resultDropdownToggle).dropdown('toggle');
                }
            };

            var _processSearch = function () {
                if (_hasResult && _query === _input.value) {
                    _hideProgress();
                    KTUtil.addClass(_target, _resultClass);
                    _showDropdown();
                    KTUtil.scrollUpdate(_resultWrapper);

                    return;
                }

                _query = _input.value;

                KTUtil.removeClass(_target, _resultClass);
                _showProgress();
                _hideDropdown();

                setTimeout(() => {
                    apiFetch(`${__bakney.env.API.SEARCH.ALL}?q=${_query}`).then(res => {
                        if (res.error) {
                            _hasResult = false;
                            _hideProgress();
                            KTUtil.addClass(_target, _resultClass);
                            error = true;
                            searchResult = {
                                users_match: [],
                                sport_associations_match: [],
                            };

                            _showDropdown();
                            KTUtil.scrollUpdate(_resultWrapper);
                            return;
                        }

                        _hasResult = true;
                        _hideProgress();
                        KTUtil.addClass(_target, _resultClass);
                        searchResult = null;
                        searchResult = res.response.data;
                        error = false;
                        _showDropdown();
                    });
                }, 1000);
            };

            var _handleCancel = function (e) {
                _input.value = '';
                _query = '';
                _hasResult = false;
                KTUtil.hide(_closeIcon);
                KTUtil.removeClass(_target, _resultClass);
                _hideDropdown();
            };

            var _handleSearch = function () {
                if (_input.value.length == 0) {
                    _input.value = '';
                    _query = '';
                    _hasResult = false;
                    KTUtil.hide(_closeIcon);
                    KTUtil.removeClass(_target, _resultClass);
                    _hideDropdown();
                }
                if (_input.value.length < _minLength) {
                    _hideProgress();
                    _hideDropdown();

                    return;
                }

                if (_isProcessing == true) {
                    return;
                }

                if (_timeout) {
                    clearTimeout(_timeout);
                }

                _timeout = setTimeout(function () {
                    _processSearch();
                }, _requestTimeout);
            };

            // Public methods
            return {
                init: function (id) {
                    _target = KTUtil.getById(id);

                    if (!_target) {
                        return;
                    }

                    _form = KTUtil.find(_target, '.quick-search-form');
                    _input = KTUtil.find(_target, '.form-control');
                    _closeIcon = KTUtil.find(_target, '.quick-search-close');
                    _resultWrapper = KTUtil.find(_target, '.quick-search-wrapper');
                    _resultDropdown = KTUtil.find(_target, '.dropdown-menu');
                    _resultDropdownToggle = KTUtil.find(_target, '[data-toggle="dropdown"]');
                    _inputGroup = KTUtil.find(_target, '.input-group');
                    _closeIconContainer = KTUtil.find(_target, '.input-group .input-group-append');

                    // Attach input keyup handler
                    KTUtil.addEvent(_input, 'keyup', _handleSearch);
                    KTUtil.addEvent(_input, 'focus', _handleSearch);

                    // Prevent enter click
                    _form.onkeypress = function (e) {
                        var key = e.charCode || e.keyCode || 0;
                        if (key == 13) {
                            e.preventDefault();
                        }
                    };

                    KTUtil.addEvent(_closeIcon, 'click', _handleCancel);
                },
            };
        };

        KTLayoutSearchBakney().init('bkn_quick_search');
    });
</script>

<!--begin::Header-->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
    id="kt_header"
    class="header header-fixed"
    collapsed={$sidebarCollapsed}
    style="padding-top: env(safe-area-inset-top);">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- svelte-ignore a11y-missing-attribute -->
    <a
        class="btn btn-white btn-sm btn-icon font-weight-boldest border text-dark-25 text-hover-dark d-none d-md-flex"
        style="margin: auto; left: -15px !important; display: flex; position: relative;"
        on:click={() => {
            // apply to .aside the collapsed="true" or collapsed="false" attribute
            $sidebarCollapsed = !$sidebarCollapsed;
        }}>
        {#if $sidebarCollapsed}
            <CaretDoubleRight size={18} weight="bold" />
        {:else}
            <CaretDoubleLeft size={18} weight="bold" />
        {/if}
    </a>
    <SmartCommandModal bind:show={showCommandModal} />
    <!--begin::Container-->
    <div class="container-fluid d-flex align-items-stretch justify-content-between">
        <!--begin::Header Menu Wrapper-->
        <div
            class="header-menu-wrapper header-menu-wrapper-left d-none d-lg-block"
            id="kt_header_menu_wrapper"
            style=" width: 200%; margin: auto;">
            {#if __bakney?.OEM_CONFIG?.displaySettings?.general?.searchBar}
                <div class="quick-search quick-search-dropdown" id="bkn_quick_search">
                    <div class="search-background m-auto" style="max-width: 30rem;">
                        <div
                            class="quick-search-form mb-0"
                            style="height: 3.1rem !important;width:150%;padding-left: 0.65rem;padding-right: 0.75rem; border: 1px solid #e4e6efa1 !important;display: block; width: 100%; font-size: 1rem; font-weight: 400; line-height: 1.5; color: #3F4254; background: #fff !important; background-clip: padding-box; border-radius: 0.42rem; -webkit-box-shadow: none; box-shadow: none; -webkit-transition: border-color 0.15s ease-in-out, -webkit-box-shadow 0.15s ease-in-out; transition: border-color 0.15s ease-in-out, -webkit-box-shadow 0.15s ease-in-out; transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out; transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out, -webkit-box-shadow 0.15s ease-in-out;">
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <div
                                class="input-group d-flex align-items-center"
                                on:click={() => {
                                    if (!$isExpired) showCommandModal = true;
                                    else toast.error('Il tuo abbonamento è scaduto!');
                                }}>
                                <div class="input-group-prepend">
                                    <span class="input-group-text">
                                        <span class="svg-icon svg-icon-lg">
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
                                                        d="M14.2928932,16.7071068 C13.9023689,16.3165825 13.9023689,15.6834175 14.2928932,15.2928932 C14.6834175,14.9023689 15.3165825,14.9023689 15.7071068,15.2928932 L19.7071068,19.2928932 C20.0976311,19.6834175 20.0976311,20.3165825 19.7071068,20.7071068 C19.3165825,21.0976311 18.6834175,21.0976311 18.2928932,20.7071068 L14.2928932,16.7071068 Z"
                                                        fill="#000000"
                                                        fill-rule="nonzero"
                                                        opacity="0.3" />
                                                    <path
                                                        d="M11,16 C13.7614237,16 16,13.7614237 16,11 C16,8.23857625 13.7614237,6 11,6 C8.23857625,6 6,8.23857625 6,11 C6,13.7614237 8.23857625,16 11,16 Z M11,18 C7.13400675,18 4,14.8659932 4,11 C4,7.13400675 7.13400675,4 11,4 C14.8659932,4 18,7.13400675 18,11 C18,14.8659932 14.8659932,18 11,18 Z"
                                                        fill="#000000"
                                                        fill-rule="nonzero" />
                                                </g>
                                            </svg>
                                        </span>
                                    </span>
                                </div>
                                <span
                                    id="bkn_search_input"
                                    class="form-control d-flex align-items-center text-dark-50 font-weight-bold"
                                    type="text"
                                    autocomplete="off"
                                    style="cursor: pointer;overflow: hidden;"
                                    readonly
                                    onfocus="jQuery(this).removeAttr('readonly');"
                                    placeholder="Cerca utenti...">
                                    Cerca utenti...
                                </span>
                                <div class="input-group-append">
                                    <span class="input-group-text">
                                        <i class="quick-search-close ki ki-close icon-sm text-muted" />
                                    </span>
                                    <kbd
                                        style="background: #f5f5f5; border: 1px solid #d8dfe596; box-shadow: none; color: #000000b8 !important; font-weight: 600; cursor: pointer;"
                                        >CTRL+K</kbd>
                                </div>
                            </div>
                        </div>
                        <div
                            class="quick-search-wrapper scroll"
                            data-scroll="true"
                            max-data-height="325"
                            data-mobile-height="200"
                            style="box-shadow: rgb(54 55 70 / 15%) 0px 10px 20px 0px;margin:0px;padding: 1.5rem;width:100%">
                            <!-- {JSON.stringify(searchResult)} -->
                            {#if searchResult.users_match.length > 0 || searchResult.sport_associations_match.length > 0}
                                <!--begin::Body-->
                                <div class="card-body p-0 pr-4">
                                    {#each searchResult.users_match as user}
                                        <!--begin::Item-->
                                        <div
                                            class="d-flex align-items-center mb-6"
                                            style="cursor: pointer;"
                                            on:click|preventDefault={() => replace('/search/profile/' + user.username)}>
                                            <!--begin::Symbol-->
                                            {#if user.avatar_image != null}
                                                <div class="symbol symbol-35 flex-shrink-0 mr-3">
                                                    <img alt={user.username} src={user.avatar_image} />
                                                </div>
                                            {:else}
                                                <div class="symbol symbol-35 symbol-light-info flex-shrink-0 mr-3">
                                                    <span class="symbol-label font-weight-bolder font-size-lg"
                                                        >{user.first_name.charAt(0).toUpperCase()}{user.last_name
                                                            .charAt(0)
                                                            .toUpperCase()}</span>
                                                </div>
                                            {/if}

                                            <!--end::Symbol-->
                                            <!--begin::Content-->
                                            <div class="d-flex align-items-center flex-wrap flex-row-fluid pl-2">
                                                <!--begin::Text-->
                                                <div class="d-flex flex-column pr-5 flex-grow-1">
                                                    <!-- svelte-ignore a11y-missing-attribute -->
                                                    <a
                                                        on:click|preventDefault={() => {
                                                            replace('/search/profile/' + user.username).then(() => {
                                                                // alert('ok');
                                                                location.reload();
                                                            });
                                                        }}
                                                        class="text-dark text-hover-primary mb-0 font-weight-bolder font-size-lg"
                                                        >{user.first_name} {user.last_name}</a>
                                                    <span
                                                        class="text-muted"
                                                        style="max-width: 100%;word-break: break-all;"
                                                        >{user.username}</span>
                                                </div>

                                                <!--begin::Label-->
                                                <!-- <span class="text-dark-50 font-weight-bold font-size-lg py-2">Utente</span> -->
                                                <!--end::Label-->
                                            </div>
                                            <!--end::Content-->
                                        </div>
                                        <!--end::Item-->
                                    {/each}

                                    {#each searchResult.sport_associations_match as sport_association}
                                        <!--begin::Item-->
                                        <div
                                            class="d-flex align-items-center mb-6"
                                            style="cursor: pointer;"
                                            on:click|preventDefault={() =>
                                                replace('/search/profile/' + sport_association.user.username)}>
                                            <!--begin::Symbol-->
                                            {#if sport_association.user.avatar_image != null}
                                                <div class="symbol symbol-35 flex-shrink-0 mr-3">
                                                    <img
                                                        alt={sport_association.user.username}
                                                        src={sport_association.user.avatar_image} />
                                                </div>
                                            {:else}
                                                <div class="symbol symbol-35 symbol-warning-info flex-shrink-0 mr-3">
                                                    <span class="symbol-label font-weight-bolder font-size-lg"
                                                        >{sport_association.denomination
                                                            .substring(0, 2)
                                                            .toUpperCase()}</span>
                                                </div>
                                            {/if}

                                            <!--end::Symbol-->
                                            <!--begin::Content-->
                                            <div class="d-flex align-items-center flex-wrap flex-row-fluid pl-2">
                                                <!--begin::Text-->
                                                <div class="d-flex flex-column pr-5 flex-grow-1">
                                                    <!-- svelte-ignore a11y-invalid-attribute -->
                                                    <a
                                                        href=""
                                                        on:click|preventDefault={() => {
                                                            replace(
                                                                '/search/profile/' + sport_association.user.username
                                                            ).then(() => location.reload());
                                                        }}
                                                        class="text-dark text-hover-primary mb-0 font-weight-bolder font-size-lg"
                                                        >{sport_association.denomination}</a>
                                                    <span
                                                        class="text-muted mt-0"
                                                        style="max-width: 100%;word-break: break-all;">
                                                        Associazione Sportiva {sport_association.address_city
                                                            ? `a ${sport_association.address_city}`
                                                            : ''}
                                                    </span>
                                                </div>

                                                <!--begin::Label-->
                                                <!-- <span class="text-dark-50 font-weight-bold font-size-lg py-2">Utente</span> -->
                                                <!--end::Label-->
                                            </div>
                                            <!--end::Content-->
                                        </div>
                                        <!--end::Item-->
                                    {/each}

                                    <span class="font-weight-bold text-muted"
                                        >{searchResult.sport_associations_match.length +
                                            searchResult.users_match.length}
                                        {searchResult.sport_associations_match.length +
                                            searchResult.users_match.length >
                                        1
                                            ? ' risultati trovati'
                                            : ' risultato trovato'}.</span>
                                </div>
                                <!--end::Body-->
                            {:else if error}
                                <span class="font-weight-bold text-muted"
                                    >Errore di connessione. Riprova più tardi!</span>
                            {:else}
                                <span class="font-weight-bold text-muted">Nessun risultato trovato.</span>
                            {/if}
                        </div>
                    </div>
                </div>
            {/if}
        </div>
        <!--end::Header Menu Wrapper-->

        <!--begin::Topbar-->
        <div class="topbar">
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            {#if __bakney?.OEM_CONFIG?.displaySettings?.navbar?.showNotifications && canPerformAction('other.notifications.read')}
                <!--begin::Notifications-->
                <div class="dropdown mr-1" style="z-index:99999;">
                    <!--begin::Toggle-->
                    <div class="topbar-item" data-toggle="dropdown" data-offset="10px,0px">
                        <div class="btn btn-icon btn-clean btn-dropdown btn-lg pulse pulse-primary">
                            <span class="svg-icon svg-icon-xl svg-icon-primary">
                                <!--begin::Svg Icon | path:assets/media/svg/icons/Code/Compiling.svg-->
                                <span class="menu-icon">
                                    <Bell
                                        size="24"
                                        class={$unreadNotificationsCounter > 0 ? 'text-dark' : ''}
                                        weight="duotone" />
                                </span>

                                <!--end::Svg Icon-->
                                {#if $unreadNotificationsCounter > 0}
                                    <sup
                                        ><div class="badge-notification" style="position:relative">
                                            {$unreadNotificationsCounter}
                                        </div></sup>
                                {/if}
                            </span>
                            {#if $unreadNotificationsCounter > 0}
                                <span class="pulse-ring" />
                            {/if}
                        </div>
                    </div>

                    <!--end::Toggle-->

                    <!--begin::Dropdown-->
                    <div
                        class="dropdown-menu p-0 m-0 dropdown-menu-right dropdown-menu-anim-up dropdown-menu-lg"
                        style="position:relative;z-index:99999;border-radius: 1.2rem;overflow: hidden;">
                        <!--begin::Header-->
                        <div class="card-header border-0 p-5">
                            <div>
                                <span class="font-weight-bolder font-size-h2 text-dark-75">Notifiche</span>
                            </div>
                        </div>
                        <!--end::Header-->
                        <!--begin::Body-->
                        <div
                            class="card-body p-0 pt-0 pb-0"
                            style="max-height: 30rem; overflow-y: scroll;"
                            data-scroll="true"
                            max-data-height="400px">
                            {#if $notifications.length > 0}
                                {#each $notifications as notification}
                                    <!--begin::Item-->
                                    <!-- {notification.read ? 'opacity: 0.65' : '' } -->
                                    <div
                                        class="m-3 bg-gray-100 d-flex align-items-center p-5 rounded notification"
                                        style={notification.read ? '' : 'background: #0c316d12 !important;'}
                                        on:click|preventDefault={() => {
                                            readNotification(notification.id);
                                            switch (notification.type) {
                                                case 'payment':
                                                    push('/payment/list');
                                                    break;
                                                case 'subscription':
                                                    if ($role === 'association') push('/members/list');
                                                    else push('/subscription/list');
                                                    break;
                                                default:
                                                    console.warn(
                                                        `[notification] type '${notification.type}' not found`
                                                    );
                                            }
                                        }}>
                                        <!--begin::Icon-->
                                        <div class="d-flex flex-center position-relative ml-4 mr-6 ml-lg-6 mr-lg-10">

                                            <span
                                                class="svg-icon svg-icon-4x svg-icon-primary position-absolute opacity-10">
                                                <!--begin::Svg Icon | path:assets/media/svg/icons/Layout/Layout-polygon.svg-->
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="40px"
                                                    height="40px"
                                                    viewBox="0 0 70 70"
                                                    fill="none">
                                                    <g stroke="none" stroke-width="1" fill-rule="evenodd">
                                                        <path
                                                            d="M28 4.04145C32.3316 1.54059 37.6684 1.54059 42 4.04145L58.3109 13.4585C62.6425 15.9594 65.3109 20.5812 65.3109 25.5829V44.4171C65.3109 49.4188 62.6425 54.0406 58.3109 56.5415L42 65.9585C37.6684 68.4594 32.3316 68.4594 28 65.9585L11.6891 56.5415C7.3575 54.0406 4.68911 49.4188 4.68911 44.4171V25.5829C4.68911 20.5812 7.3575 15.9594 11.6891 13.4585L28 4.04145Z"
                                                            fill="#000000" />
                                                    </g>
                                                </svg>
                                                <!--end::Svg Icon-->
                                            </span>

                                            <span class="svg-icon svg-icon-lg svg-icon-primary position-absolute">
                                                {#if notification.type == 'payment'}
                                                    <Money size={24} weight="duotone" class="text-primary" />
                                                {:else}
                                                    <Info size={24} weight="duotone" class="text-primary" />
                                                {/if}
                                            </span>
                                        </div>
                                        <!--end::Icon-->
                                        <!--begin::Description-->
                                        <div class="ml-1">
                                            <!-- <h3 class="text-dark-75 font-weight-bolder font-size-lg">Important Notice</h3> -->
                                            <p class="m-0 text-dark-50 font-weight-bold" style="font-size: 0.8rem;">
                                                {new Date(notification.date).toLocaleString('it-IT', options)}
                                            </p>
                                            <p
                                                class="m-0 {notification.read
                                                    ? 'text-dark-50'
                                                    : 'text-dark-75'}  font-weight-bold">
                                                {notification.msg}
                                            </p>
                                        </div>
                                        {#if !notification.read}
                                            <div class="ml-1">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="20px"
                                                    height="20px"
                                                    viewBox="0 0 20 20"
                                                    fill="none">
                                                    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                                        <circle fill="#351DC2" cx="10" cy="10" r="6" />
                                                    </g>
                                                </svg>
                                            </div>
                                        {/if}
                                        <!--end::Description-->
                                    </div>
                                    <!--end::Item-->
                                {/each}
                            {:else}
                                <div class="p-5 pb-8">
                                    <span class="font-size-h6 text-weight-bolder"
                                        >Nessuna notifica recente da mostrare.</span>
                                </div>
                            {/if}
                        </div>
                        <!--end::Body-->

                        {#if $notifications.length > 0}
                            <div class="card-footer p-4" style="border: 0px !important;">
                                <div style="text-align: center;">
                                    <!-- svelte-ignore a11y-missing-attribute -->
                                    <a
                                        class="btn btn-sm btn-primary font-weight-bold {$unreadNotificationsCounter == 0
                                            ? 'disabled-read-all'
                                            : ''}"
                                        on:click|preventDefault={() => readAllNotifications()}>
                                        <i class="la la-check" />Segna tutte come già lette</a>
                                </div>
                            </div>
                        {/if}
                    </div>

                    <!--end::Dropdown-->
                </div>
                <!--end::Notifications-->
            {/if}

            <!--begin::User-->
            <div class="dropdown ml-4">
                <!--begin::Toggle-->
                <div id="kt_quick_user_toggle" class="topbar-item" data-toggle="dropdown" data-offset="0px,0px">
                    <div class="btn btn-icon btn-light-primary h-40px w-40px p-0 profile-container">

                        {#if $userData?.avatar_image != null}
                            <img
                                style="width: 100% !important;height: 100% !important;"
                                src={$userData?.avatar_image}
                                class="h-30px align-self-end profile-fill"
                                alt="" />
                        {:else if $userData?.first_name && $userData?.last_name}
                            <span class="symbol-label font-weight-bolder" style="font-size: 1.2rem !important;">
                                {$userData?.first_name?.charAt(0)?.toUpperCase()}{$userData?.last_name
                                    .charAt(0)
                                    .toUpperCase()}
                            </span>
                        {/if}
                    </div>
                </div>
            </div>

            <!--end::User-->
        </div>

        <!--end::Topbar-->
    </div>

    <!--end::Container-->
</div>

<!--end::Header-->

<UserPanel />

<style>
    .quick-search-form:hover,
    .quick-search-form:focus-within {
        outline: 0.1rem solid #e4e6efa1;
    }
</style>
