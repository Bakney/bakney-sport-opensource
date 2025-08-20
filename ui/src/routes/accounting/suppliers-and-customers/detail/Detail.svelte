<script>
    import {canPerformAction} from 'utils/Permissions';
    import {scale} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import Info from './sections/Info.svelte';
    import {createEventDispatcher} from 'svelte';

    const dispatch = createEventDispatcher();

    export let supplierId;
    export let edit = false;
</script>

<div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}} class="d-flex flex-column-fluid">
    {#if canPerformAction('bookeeping.management.suppliers.read')}
        <!--begin::Container-->
        <div class="container">
            <div class="card card-custom gutter-b">
                <div class="card-body px-0 pt-4">
                    <Info
                        bind:supplierId
                        on:close={() => {
                            dispatch('close');
                        }}
                        {edit} />
                </div>
            </div>
        </div>
    {:else}
        <div class="container">
            <div class="row">
                <div class="col-12">
                    <div class="label label-light-danger w-100 font-weight-bolder font-size-h4 py-8 px-16">
                        Non hai i permessi per visualizzare questa pagina.
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>

<svelte:head>
    <style>
        .nav-link {
            cursor: pointer;
        }
        .nav-link.active {
            border-bottom: 4px solid #351dc2 !important;
        }
        .nav-link:hover {
            border-bottom: 4px solid #351dc2 !important;
        }
        .card-toolbar::-webkit-scrollbar {
            display: none;
        }
    </style>
</svelte:head>
