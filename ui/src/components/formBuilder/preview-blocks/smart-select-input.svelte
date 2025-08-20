<script>
    import DeleteButton from 'components/buttons/DeleteButton.svelte';
    import {clickOutside} from '../utils';
    import {createEventDispatcher} from 'svelte';
    import {FloppyDisk, Info} from 'phosphor-svelte';
    import {slide} from 'svelte/transition';
    import Select from 'svelte-select';
    import VirtualList from 'svelte-tiny-virtual-list';
    import {tick} from 'svelte';

    const dispatch = createEventDispatcher();

    export let props;
    export let active = false;
    export let editable = true;
    export let value = '';
    export let customClasses = 'p-4 m-4 ';
    export let selectClasses = '';
    export let virtualListMode = false;

    let filterText = '';

    // Virtual List options
    let activeIndex = null;
    let hoverItemIndex = 0;
    let listOpen = false;
    function handleClick(i, item) {
        filterText = '';
        activeIndex = i;
        value = item;
        listOpen = false;
        dispatch('change', item);
    }

    function handleHover(e) {
        hoverItemIndex = e;
    }

    async function handleListOpen() {
        if (!value) return;
        await tick();
        hoverItemIndex = activeIndex;
    }

    $: handleListOpen(listOpen);
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
    class="form-group {customClasses} rounded-lg"
    style="cursor:pointer;transition:all 0.05s;"
    use:clickOutside
    on:click_outside={() => {
        if (editable) active = false;
    }}
    on:click={() => {
        if (!active && editable) active = true;
    }}>
    {#if props.label}
        <label class="font-weight-bolder" for={props.id}>{props.label}<b>{props.required ? '*' : ''}</b></label>
    {/if}
    {#if virtualListMode}
        <div />
        <Select
            class={selectClasses}
            hideEmptyState={true}
            on:change={e => {
                if (props?.multiple) value = e.detail;
                else value = e.detail.value;
                dispatch('change', e.detail);
            }}
            on:clear={() => {
                value = null;
                dispatch('clear');
            }}
            itemFilter={(label, filterText, option) => {
                if (!filterText) return true;
                
                // Split the filter text into words
                const searchWords = filterText.toLowerCase().split(/\s+/).filter(word => word.length > 0);
                
                if (searchWords.length === 0) return true;
                
                const labelLower = label.toLowerCase();
                
                // Check if all search words are found in the label
                return searchWords.every(word => {
                    // Allow for fuzzy matching by checking if the word or parts of it exist in the label
                    return labelLower.includes(word);
                });
            }}
            justValue={props.value}
            value={props?.options?.find(option => option.value === props.value)}
            name={props.name}
            items={props.options}
            groupBy={props.groupBy || null}
            placeholder={props.placeholder}
            disabled={props.disabled ? props.disabled : false}
            clearable={props?.clearable !== undefined ? props?.clearable : true}
            searchable={props?.searchable !== undefined ? props?.searchable : true}
            showChevron={props?.showChevron !== undefined ? props?.showChevron : false}
            multiple={props?.multiple !== undefined ? props?.multiple : false}
            bind:filterText
            bind:hoverItemIndex
            bind:listOpen
            on:hoverItem={e => handleHover(e.detail)}>
            <!-- <slot name="list-append" slot="list-append" /> -->
            <svelte:fragment slot="list" let:filteredItems>
                {#if filteredItems.length > 0}
                    <VirtualList
                        width="100%"
                        height={250}
                        itemSize={35}
                        stickyIndices={filteredItems
                            .map((item, index) => (item.groupHeader ? index : null))
                            .filter(index => index !== null)}
                        itemCount={filteredItems?.length}
                        scrollToIndex={hoverItemIndex}>
                        <div
                            slot="item"
                            let:index
                            let:style
                            {style}
                            on:click={() => {
                                if (!filteredItems[index].groupHeader) {
                                    handleClick(index, filteredItems[index]);
                                }
                            }}>
                            {#if filteredItems[index].groupHeader}
                                <div class="d-flex justify-content-between align-items-center list-group-title item">
                                    <span class="text-primary font-size-h6 font-weight-boldest px-4">
                                        {@html filteredItems[index].label}
                                    </span>
                                </div>
                            {:else}
                                <div
                                    class="d-flex justify-content-between align-items-center group-item item"
                                    style={filteredItems[index].description ? 'min-height: 10rem;' : ''}>
                                    <span class="px-8">
                                        {@html filteredItems[index].label}
                                    </span>
                                    {#if filteredItems[index].description}
                                        <span class="text-dark-50 font-size-xs font-weight-bold">
                                            {@html filteredItems[index].description
                                                ?.replace(/&lt;/g, '<')
                                                .replace(/&gt;/g, '>')
                                                .replace(/<p>/g, '<div>')
                                                .replace(/<\/p>/g, '</div>')
                                                ?.substring(0, 100)}
                                        </span>
                                    {/if}
                                </div>
                            {/if}
                        </div>
                        <!-- <div
                            class="d-flex justify-content-between"
                            class:active={activeIndex === index}
                            class:hover={hoverItemIndex === index}
                            slot="item"
                            let:index
                            let:style
                            style={`${style} ${filteredItems[index].description ? 'min-height: 10rem;' : ''}`}
                            on:click={() => handleClick(index)}
                            on:focus={() => handleHover(index)}
                            on:mouseover={() => handleHover(index)}>
                            <div class="d-flex justify-content-between w-fill">
                                {#if filteredItems[index].groupHeader}
                                    <span class="text-dark-65 font-size-lg font-weight-boldest">
                                        {@html filteredItems[index].label}
                                    </span>
                                {:else}
                                    <div class="d-flex justify-content-between item" style={filteredItems[index].description ? 'min-height: 10rem;' : ''}>
                                        {@html filteredItems[index].label}
                                        <br>
                                        <p>
                                            {JSON.stringify(filteredItems[index])}
                                        </p>
                                        {#if filteredItems[index].description}
                                            <span class="text-dark-50 font-size-xs font-weight-bold">
                                                {@html filteredItems[index].description
                                                    ?.replace(/&lt;/g, '<')
                                                    .replace(/&gt;/g, '>')
                                                    .replace(/<p>/g, '<div>')
                                                    .replace(/<\/p>/g, '</div>')
                                                    ?.substring(0, 100)}
                                            </span>
                                        {/if}
                                    </div>
                                {/if}
                            </div>
                        </div> -->
                    </VirtualList>
                {/if}
            </svelte:fragment>
        </Select>
    {:else}
        <Select
            class={selectClasses}
            hideEmptyState={true}
            on:change={e => {
                if (props?.multiple) value = e.detail;
                else value = e.detail.value;
                dispatch('change', e.detail);
            }}
            on:clear={() => {
                value = null;
                dispatch('clear');
            }}
            justValue={props.value}
            value={props?.options?.find(option => option.value === props.value)}
            name={props.name}
            items={props.options}
            groupBy={props.groupBy || null}
            placeholder={props.placeholder}
            disabled={props.disabled ? props.disabled : false}
            clearable={props?.clearable !== undefined ? props?.clearable : true}
            searchable={props?.searchable !== undefined ? props?.searchable : true}
            showChevron={props?.showChevron !== undefined ? props?.showChevron : false}
            multiple={props?.multiple !== undefined ? props?.multiple : false}>
            <slot name="list-append" slot="list-append" />
            <slot name="item" slot="item" let:item>
                <div class="d-flex justify-content-between" style={item.description ? 'min-height: 10rem;' : ''}>
                    {@html item.label}
                    {#if item.description}
                        <span class="text-dark-50 font-size-xs font-weight-bold">
                            {@html item.description
                                ?.replace(/&lt;/g, '<')
                                .replace(/&gt;/g, '>')
                                .replace(/<p>/g, '<div>')
                                .replace(/<\/p>/g, '</div>')
                                ?.substring(0, 100)}
                        </span>
                    {/if}
                </div>
            </slot>
        </Select>
    {/if}
    {#if props.helperLabel}
        <div class="text-primary align-items-center d-flex font-weight-bold mt-1 font-size-sm">
            <Info size={14} weight={'duotone'} class="mr-1" />
            {@html props.helperLabel}
        </div>
    {/if}

    {#if active}
        <div class="d-flex justify-content-end mt-4" style="position:relative;">
            <button
                class="btn btn-xs btn-clean btn-icon text-primary m-0 mr-2"
                on:click={e => {
                    e.stopPropagation();
                    active = false;
                }}>
                <FloppyDisk size="24" weight="duotone" />
            </button>

            <DeleteButton
                on:open={() => {
                    dispatch('delete');
                }} />
        </div>
        <div in:slide class="mb-0 mt-4 border rounded-lg p-6">
            <div class="row">
                <div class="form-group col-5 mb-4">
                    <div class="font-size-sm font-weight-bold mb-1">Etichetta</div>
                    <div class="input-group">
                        <input class="form-control form-control-sm" bind:value={props.label} />
                    </div>
                </div>
                <div class="form-group col-5 mb-4">
                    <div class="font-size-sm font-weight-bold mb-1">Placeholder</div>
                    <div class="input-group">
                        <input class="form-control form-control-sm" bind:value={props.placeholder} />
                    </div>
                </div>
                <div class="form-group col-2 mb-4">
                    <div class="font-size-sm font-weight-bold mb-1">Obbligatorio</div>
                    <div class="input-group">
                        <span class="switch switch-icon switch-sm ml-0">
                            <label>
                                <input type="checkbox" name="" bind:checked={props.required} />
                                <span />
                            </label>
                        </span>
                    </div>
                </div>
            </div>
            <h6 class="mt-2">Proprietà avanzate</h6>
            <div class="row">
                <div class="form-group col-6 mb-4">
                    <div class="font-size-sm font-weight-bold mb-1">Etichetta aiuto</div>
                    <div class="input-group">
                        <input class="form-control form-control-sm" bind:value={props.helperLabel} />
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>

<svelte:head>
    <style>
        .auto-height {
            height: fit-content !important;
        }
    </style>
</svelte:head>
