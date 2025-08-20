<script>
    import Account from './sections/Account.svelte';
    import Password from './sections/Password.svelte';
    import ProfileMenu from './ProfileMenu.svelte';
    import TwoFactor from './sections/TwoFactor.svelte';
    import Stripe from './sections/Stripe.svelte';
    import Settings from './sections/Settings.svelte';
    import {scale} from 'svelte/transition';
    import {subPage, role} from 'store/stores.js';
    import * as easing from 'svelte/easing';
    import Integrations from './sections/Integrations.svelte';

    role.useLocalStorage();

    let changes = false;
</script>

<!--begin::Entry-->
<div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}} class="d-flex flex-column-fluid">
    <!--begin::Container-->
    <div class="container">
        <!--begin::Profile Personal Information-->
        <div class="row">
            <div class="col-lg-3 p-0 pr-md-2">
                <ProfileMenu bind:changes />
            </div>
            <div id="content-profile-menu" class="col-lg-9 p-0 pb-24 pb-md-0 pl-md-2">
                {#if $subPage == 'info'}
                    <Account bind:changes />
                {/if}

                <!-- svelte-ignore missing-declaration -->
                {#if $role != 'athlete'}
                    {#if $subPage == 'stripe'}
                        <Stripe />
                    {/if}
                {/if}

                {#if $subPage == 'twofa'}
                    <TwoFactor bind:changes />
                {/if}

                {#if $subPage == 'password'}
                    <Password bind:changes />
                {/if}

                {#if $subPage == 'settings'}
                    <Settings bind:changes />
                {/if}

                {#if $subPage == 'integrations'}
                    <Integrations bind:changes />
                {/if}
            </div>

            <!--end::Content-->
        </div>
        <!--end::Profile Personal Information-->
    </div>
    <!--end::Container-->
</div>
<!--end::Entry-->

<svelte:head>
    <style>
        #content-profile-menu .card-header {
            /* position: fixed; */
            /* width: -webkit-fill-available; */
            z-index: 10;
            background: #fff;
            padding-top: 25px !important;
        }
        #content-profile-menu .card-body {
            /* padding-top: 120px !important; */
        }
        .content {
            padding: 0 !important;
        }
        @media (max-width: 991.98px) {
            #content-profile-menu .card-header {
                padding-top: 10px !important;
            }
            /* #content-profile-menu .card-body {
                padding-top: 180px !important;
            } */
        }
    </style>
</svelte:head>
