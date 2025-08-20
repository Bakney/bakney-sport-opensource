<script>
    import Sidebar from '../components/Sidebar.svelte';
    import HeaderMobile from '../components/HeaderMobile.svelte';
    import Header from '../components/Header.svelte';
    import {sidebarCollapsed} from 'store/stores.js';
    import {replace} from 'svelte-spa-router';

    export let routerComponent;
    export let routes;
</script>

<HeaderMobile />

<div class="d-flex flex-column flex-root">
    <div class="d-flex flex-row flex-column-fluid page">
        <Sidebar />
        <div class="d-flex flex-column flex-row-fluid wrapper" collapsed={$sidebarCollapsed} id="kt_wrapper">
            <Header />
            <div class="content d-flex flex-column flex-column-fluid" id="kt_content">
                <!-- CONTENT -->
                <svelte:component
                    this={routerComponent}
                    {routes}
                    on:conditionsFailed={() => {
                        // go to /404
                        replace('/404');
                    }} />
            </div>
        </div>
    </div>
</div>
