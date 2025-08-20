<script>
    import {userData} from 'store/stores.js';
    import {List} from 'phosphor-svelte';
    import {onMount} from 'svelte';
    userData.useLocalStorage();

    onMount(() => {
        KTLayoutQuickUser.init('kt_quick_user');
    });
</script>

<!--begin::Header Mobile-->
<div
    id="kt_header_mobile"
    class="header-mobile align-items-center header-mobile-fixed mx-8 rounded-xl shadow-sm"
    style="border: 0px solid #f3f3f3;padding-top: env(safe-area-inset-top)">
    <!--begin::Aside Mobile Toggle-->
    <!-- <button class="btn p-0 burger-icon-left" id="kt_aside_mobile_toggle"> -->
    <!-- <span /> -->
    <!-- <MagnifyingGlass size="24" weight="duotone" />
    </button> -->

    <span class="menu-icon" id="kt_aside_mobile_toggle">
        <List size="24" weight="duotone" />
    </span>
    <!--end::Aside Mobile Toggle-->
    <!--begin::Logo-->
    <a href="/" style="position:relative; top:.1rem;left:.6rem;">
        <!-- svelte-ignore a11y-missing-attribute -->
        <img id="logo" class="h-30px" src={__bakney.OEM_CONFIG?.logo} />
    </a>

    <!--end::Logo-->

    <!--begin::Toolbar-->
    <div class="d-flex align-items-center">
        <!--begin::User-->
        <div class="dropdown ml-4">
            <!--begin::Toggle-->
            <div id="kt_quick_user_toggle_mobile" class="topbar-item" data-toggle="dropdown" data-offset="0px,0px">
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

            <!--end::Toggle-->

            <!--begin::Dropdown-->
            <div
                class="dropdown-menu p-0 m-0 dropdown-menu-right dropdown-menu-anim-up
          dropdown-menu-lg p-0" />

            <!--end::Dropdown-->
        </div>

        <!--end::User-->
    </div>

    <!--end::Toolbar-->
</div>

<!--end::Header Mobile-->
