<script>
    import {createEventDispatcher} from 'svelte';

    export let label = 'Dropdown';
    export let variant = 'primary'; // 'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'
    export let size = 'md'; // 'sm', 'md', 'lg'
    export let items = [];
    export let dropdownClass = '';
    export let buttonClass = '';
    export let itemClass = '';

    const dispatch = createEventDispatcher();

    function handleItemClick(item) {
        dispatch('itemClick', item);
    }

    function handleButtonClick() {
        dispatch('buttonClick');
    }
</script>

<div class="dropdown {dropdownClass}">
    <button
        on:click={handleButtonClick}
        class="btn btn-{variant} btn-{size} dropdown-toggle {buttonClass} d-flex align-items-center font-weight-boldest"
        type="button"
        id="dropdownMenuButton"
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false">
        <slot name="button-content">
            {label}
        </slot>
    </button>
    <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
        {#each items as item (item.id)}
            <button class="dropdown-item {itemClass}" on:click={() => handleItemClick(item)}>
                <slot name="item-content" {item}>
                    {#if item.icon}
                        <svelte:component this={item.icon} size={18} class="mr-2" />
                    {/if}
                    <span>{item.label}</span>
                </slot>
            </button>
        {/each}
    </div>
</div>
