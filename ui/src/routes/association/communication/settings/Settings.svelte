<script>
    import Menu from './Menu.svelte';
    import {scale} from 'svelte/transition';
    import {subPage, role} from 'store/stores.js';
    import * as easing from 'svelte/easing';
    import EmailSmtp from './sections/EmailSMTP.svelte';
    import Sms from './sections/Sms.svelte';
    import Stats from './sections/Stats.svelte';

    role.useLocalStorage();
</script>

<!--begin::Entry-->
<div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}} class="d-flex flex-column-fluid">
    <!--begin::Container-->
    <div class="container">
        <!--begin::Profile Personal Information-->
        <div class="row">
            <div class="col-lg-3 p-0 pr-md-2">
                <Menu />
            </div>
            <div class="col-lg-9 p-0 pb-24 pb-md-0 pl-md-2">
                {#if $subPage == 'email'}
                    <EmailSmtp />
                {:else if $subPage == 'sms'}
                    <Sms />
                {:else if $subPage == 'stats'}
                    <Stats />
                {/if}
            </div>

            <!--end::Content-->
        </div>
        <!--end::Profile Personal Information-->
    </div>
    <!--end::Container-->
</div>
<!--end::Entry-->
