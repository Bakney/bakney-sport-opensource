<script>
    import {scale} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import {canPerformAction} from 'utils/Permissions';
    import AssociateTable from './import/AssociateTable.svelte';
    import NavigationTab from './shared/NavigationTab.svelte';
</script>

<div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}} class="d-flex flex-column-fluid">
    {#if canPerformAction('association.members.create')}
        <div class="container">
            <div class="card card-custom gutter-b">
                <NavigationTab />
                <AssociateTable />
            </div>
        </div>
    {/if}
</div>
