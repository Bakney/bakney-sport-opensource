<script>
    import QueryFilterTag from './QueryFilterTag.svelte';
    import {createEventDispatcher} from 'svelte';

    const dispatch = createEventDispatcher();

    export let filters = [];
    export let showMore = true;

    function handleFilterApplied(event) {
        dispatch('filter-applied', event.detail);
    }
</script>

<div class="d-flex flex-column justify-content-center w-100" style="gap: 1rem;">
    <div class="d-flex flex-wrap" style="gap: .5rem;">
        {#each filters as filter}
            <QueryFilterTag bind:props={filter} on:filter-applied={handleFilterApplied} />
        {/each}
    </div>
    {#if showMore}
        <div class="d-flex justify-content-center mt-4 w-100">
            <!-- svelte-ignore a11y-missing-attribute -->
            Hai bisogno di altri filtri?
            <a
                class="link font-weight-boldest mx-2"
                data-toggle="modal"
                data-target="#newTicketModal"
                style="cursor:pointer;">Apri un ticket</a> e saremo lieti di implementarli.
        </div>
    {/if}
</div>
