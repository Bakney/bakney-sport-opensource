<script>
    import {scale} from 'svelte/transition';
    import {role, subPage} from 'store/stores.js';
    import * as easing from 'svelte/easing';
    import BalanceSheetEditor from './BalanceSheetEditor.svelte';

    role.useLocalStorage();
</script>

<!--begin::Entry-->
<div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}} class="d-flex flex-column-fluid">
    <!--begin::Container-->
    <div class="container">
        <!--begin::Profile Personal Information-->
        <div class="row">
            <div class="col-lg-12">
                {#if $subPage == 'balance-sheet-manage'}
                    <BalanceSheetEditor />
                {/if}
            </div>
            <!--end::Content-->
        </div>
        <!--end::Profile Personal Information-->
    </div>
    <!--end::Container-->
</div>
<!--end::Entry-->
