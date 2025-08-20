<script>
    import {createEventDispatcher} from 'svelte';
    import {push} from 'svelte-spa-router';
    import {fly} from 'svelte/transition';

    const dispatch = createEventDispatcher();

    export let url;
    export let currentPage = null;
    export let type = null;

    let navigationPages = [
        {
            title: type === 3 ? 'Abbonamenti' : 'Iscritti al corso',
            url: `/course/overview/${url}`,
        },
        {
            title: 'Calendario',
            url: `/course/overview/${url}/calendar`,
        },
        {
            title: 'Presenze',
            url: `/course/overview/${url}/attendance`,
        },
    ];
</script>

<div in:fly={{delay: 0, duration: 200}} class="d-flex justify-content-between bg-white rounded px-0 pb-4 pt-0">
    <div class="btn-group btn-group-toggle mx-auto mx-md-0 mt-8 mt-md-0" data-toggle="buttons">
        {#each navigationPages as page}
            <button
                style="width: fit-content !important;"
                class="btn {page.url == `/course/overview/${url}${currentPage ? `/${currentPage}` : ''}`
                    ? 'btn-primary'
                    : 'btn-light'} font-weight-boldest font-size-xl mb-0 mx-auto w-100 text-center"
                on:click={() => {
                    push(page.url);
                    dispatch('change', page.url);
                }}>
                {page.title}
            </button>
        {/each}
    </div>
</div>
