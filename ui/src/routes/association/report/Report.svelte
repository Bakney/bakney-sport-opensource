<script>
    import {scale} from 'svelte/transition';
    import {role, currentPage} from 'store/stores.js';
    import * as easing from 'svelte/easing';
    import ReportCharts from './ReportCharts.svelte';

    role.useLocalStorage();
</script>

<!--begin::Entry-->
<div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}} class="d-flex flex-column-fluid">
    <!--begin::Container-->
    <div class="container">
        <!--begin::Profile Personal Information-->
        <div class="row">
            <div class="col-lg-12">
                {#if $currentPage == 'report'}
                    <ReportCharts />
                {/if}
            </div>
            <!--end::Content-->
        </div>
        <!--end::Profile Personal Information-->
    </div>
    <!--end::Container-->
</div>
<!--end::Entry-->
