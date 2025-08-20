<script>
    import {createEventDispatcher} from 'svelte';
    import {fly} from 'svelte/transition';

    const dispatch = createEventDispatcher();

    export let navigationPages = []; // dict of {url: 'url', title: 'title', icon: IconComponent}
    export let paddingClass = 'px-6 py-4';
    export let showHR = true;
    export let activeTab = '';
    export let disabled = false;

    function dispatchTabChange() {
        dispatch('tabChange', {tabName: activeTab});
    }
</script>

<div
    in:fly={{delay: 0, duration: 200}}
    class="d-flex jusitify-content-between bg-white rounded {paddingClass}"
    style={disabled ? 'pointer-events:none;opacity:0.5' : ''}>
    <div class="btn-group btn-group-toggle">
        {#each navigationPages as page}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-missing-attribute -->
            <a
                style="width: fit-content !important;"
                class="btn {page.tabName == activeTab
                    ? 'btn-primary'
                    : 'btn-light'} font-weight-boldest font-size-xl mb-0 mx-auto w-100 text-center"
                on:click={() => {
                    activeTab = page.tabName;
                    dispatchTabChange();
                }}>
                {page.title}
            </a>
        {/each}
    </div>
</div>
{#if showHR}
    <hr class="m-0 p-0" style="opacity:55%;" />
{/if}
