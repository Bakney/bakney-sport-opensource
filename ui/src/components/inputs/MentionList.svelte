<script>
    export let items = [];
    export let command;

    let selectedIndex = 0;
    let selectedGroup = '';

    function selectItem(group, index) {
        const item = items.filter(item => item.group === group)[index];
        if (item) {
            command({id: item});
        }
    }

    function upHandler() {
        const groupItems = items.filter(item => item.group === selectedGroup);
        selectedIndex = (selectedIndex + groupItems.length - 1) % groupItems.length;
    }

    function downHandler() {
        const groupItems = items.filter(item => item.group === selectedGroup);
        selectedIndex = (selectedIndex + 1) % groupItems.length;
    }

    function enterHandler() {
        selectItem(selectedGroup, selectedIndex);
    }

    $: {
        // Reset selected index when items change
        selectedIndex = 0;
        if (items.length > 0) {
            selectedGroup = items[0].group;
        }
    }

    export function onKeyDown({event}) {
        if (event.key === 'ArrowUp') {
            upHandler();
            return true;
        }

        if (event.key === 'ArrowDown') {
            downHandler();
            return true;
        }

        if (event.key === 'Enter') {
            enterHandler();
            return true;
        }

        return false;
    }
</script>

<div class="dropdown-menu-mention">
    {#if items.length}
        {#each [...new Set(items.map(item => item.group))] as group}
            <details class="group">
                <summary class="group-header">
                    {group}
                </summary>
                <div class="group-items">
                    {#each items.filter(item => item.group === group) as item, index}
                        <button
                            class:is-selected={selectedGroup === group && selectedIndex === index}
                            on:click={() => selectItem(group, index)}>
                            {item.label}
                        </button>
                    {/each}
                </div>
            </details>
        {/each}
    {:else}
        <div class="item">No result</div>
    {/if}
</div>

<svelte:head>
    <style>
        .dropdown-menu-mention .group-header {
            font-weight: 700;
            padding: 0.5rem 0.7rem;
            color: var(--primary);
        }
        .dropdown-menu-mention .group-items {
            padding-left: 1.5rem;
        }

        .dropdown-menu-mention {
            background: #ffffff;
            border-radius: 1rem;
            box-shadow: 0 0 2rem 0rem #0000002e;
            display: flex;
            flex-direction: column;
            gap: 0.1rem;
            overflow: auto;
            padding: 0.4rem;
            position: relative;
            max-height: 20rem;
            overflow-y: auto;
        }

        .dropdown-menu-mention button {
            align-items: center;
            background-color: transparent;
            display: flex;
            gap: 0.25rem;
            text-align: left;
            width: 100%;
            border: 0;
            margin: 0;
            padding: 0.5rem 0.7rem;
            font-weight: 600;
        }

        .dropdown-menu-mention button:hover,
        .dropdown-menu-mention button.is-selected:hover {
            background-color: #efefef;
        }

        .dropdown-menu-mention button.is-selected {
            background-color: #efefef;
        }
    </style>
</svelte:head>
