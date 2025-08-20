<script>
    import {replace} from 'svelte-spa-router';
    import {userData, sessionToken} from 'store/stores.js';
    import {scale} from 'svelte/transition';
    import * as easing from 'svelte/easing';

    userData.useLocalStorage();
    sessionToken.useLocalStorage();
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
            var _requestTimeout = 200; // ajax request fire timeout in milliseconds
            var _spinnerClass = 'spinner spinner-sm spinner-primary';
            var _resultClass = 'quick-search-has-result';
            var _minLength = 2;

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

                setTimeout(function () {
                    jQuery.ajax({
                        url: `${__bakney.env.API.SEARCH.ALL}?q=${_query}`,
                        data: {
                            query: _query,
                        },
                        headers: {
                            Authorization: 'Bearer ' + $sessionToken,
                        },
                        dataType: 'html',
                        success: function (res) {
                            _hasResult = true;
                            _hideProgress();
                            KTUtil.addClass(_target, _resultClass);
                            searchResult = null;
                            searchResult = JSON.parse(res).data;
                            error = false;
                            _showDropdown();
                        },
                        error: function (res) {
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
                        },
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
        KTLayoutSearchBakney().init('kt_quick_search_dropdown_bakney_mobile');
    });
</script>

<div
    in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}}
    class="quick-search quick-search-dropdown"
    id="kt_quick_search_dropdown_bakney_mobile">
    <div class="search-background" style="height: fit-content !important;">
        <div
            class="quick-search-form mb-0"
            style="height: 3.1rem !important;width:150%;padding-left: 0.65rem;padding-right: 0.75rem; border: 1px solid #e4e6efa1 !important;display: block; width: 100%; font-size: 1rem; font-weight: 400; line-height: 1.5; color: #3F4254; background-clip: padding-box; border-radius: 0.42rem; -webkit-box-shadow: none; box-shadow: none; -webkit-transition: border-color 0.15s ease-in-out, -webkit-box-shadow 0.15s ease-in-out; transition: border-color 0.15s ease-in-out, -webkit-box-shadow 0.15s ease-in-out; transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out; transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out, -webkit-box-shadow 0.15s ease-in-out;">
            <div class="input-group">
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
                <input
                    class="form-control"
                    type="text"
                    autocomplete="off"
                    onfocus="jQuery(this).removeAttr('readonly');"
                    placeholder="Cerca un Utente o una Associazione..." />
                <div class="input-group-append">
                    <span class="input-group-text">
                        <i class="quick-search-close ki ki-close icon-sm text-muted" />
                    </span>
                </div>
            </div>
        </div>
        <div
            class="quick-search-wrapper scroll"
            data-scroll="true"
            max-data-height="325"
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
                                            replace('/search/profile/' + user.username).then(() => location.reload());
                                        }}
                                        class="text-dark text-hover-primary mb-0 font-weight-bolder font-size-lg"
                                        >{user.first_name} {user.last_name}</a>
                                    <span class="text-muted" style="max-width: 100%;word-break: break-all;"
                                        >{user.username}</span>
                                </div>
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
                                        >{sport_association.denomination.substring(0, 2).toUpperCase()}</span>
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
                                            replace('/search/profile/' + sport_association.user.username).then(() =>
                                                location.reload()
                                            );
                                        }}
                                        class="text-dark text-hover-primary mb-0 font-weight-bolder font-size-lg"
                                        >{sport_association.denomination}</a>
                                    <span class="text-muted mt-0" style="max-width: 100%;word-break: break-all;">
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
                        >{searchResult.sport_associations_match.length + searchResult.users_match.length}
                        {searchResult.sport_associations_match.length + searchResult.users_match.length > 1
                            ? ' risultati trovati'
                            : ' risultato trovato'}.</span>
                </div>
                <!--end::Body-->
            {:else if error}
                <span class="font-weight-bold text-muted">Errore di connessione. Riprova più tardi!</span>
            {:else}
                <span class="font-weight-bold text-muted">Nessun risultato trovato.</span>
            {/if}
        </div>
    </div>
</div>
