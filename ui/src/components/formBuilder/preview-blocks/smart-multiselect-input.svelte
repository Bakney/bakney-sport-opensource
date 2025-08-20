<script>
    import DeleteButton from 'components/buttons/DeleteButton.svelte';
    import {clickOutside} from '../utils';
    import {createEventDispatcher} from 'svelte';
    import {FloppyDisk, Info} from 'phosphor-svelte';
    import {slide} from 'svelte/transition';
    import Select from 'svelte-select';
    import {toast} from 'svelte-sonner';

    const dispatch = createEventDispatcher();

    export let props;
    export let active = false;
    export let editable = true;
    export let value = '';
    export let customClasses = 'p-4 m-4 ';
    export let minNumberOfSelectedItems = null;
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
    <Select
        hideEmptyState={true}
        on:change={e => {
            value = e.detail;
            dispatch('change', e.detail);
        }}
        itemFilter={(label, filterText, option) => {
            if (!filterText) return true;

            // Split the filter text into words
            const searchWords = filterText
                .toLowerCase()
                .split(/\s+/)
                .filter(word => word.length > 0);

            if (searchWords.length === 0) return true;

            const labelLower = label.toLowerCase();

            // Check if all search words are found in the label
            return searchWords.every(word => {
                // Allow for fuzzy matching by checking if the word or parts of it exist in the label
                return labelLower.includes(word);
            });
        }}
        on:clear={e => {
            if (minNumberOfSelectedItems && value.length < minNumberOfSelectedItems + 1) {
                toast.error('Devi selezionare almeno ' + minNumberOfSelectedItems + ' elementi.');
                return;
            }
            // remove e.detail items from value
            // check if e.detail is an array
            if (Array.isArray(e.detail)) {
                // pop e.detail items from value
                e.detail.forEach(item => {
                    value = value.filter(valueItem => valueItem.value !== item.value);
                });
            } else if (value) {
                // remove e.detail from value
                value = value?.filter(valueItem => valueItem.value !== e.detail.value);
            }
            dispatch('change', e.detail);
        }}
        value={props.value}
        name={props.name}
        items={props.options}
        disabled={props.disabled || false}
        placeholder={props.placeholder}
        clearable={props?.clearable !== undefined ? props?.clearable : true}
        searchable={props?.searchable !== undefined ? props?.searchable : true}
        showChevron={props?.showChevron !== undefined ? props?.showChevron : false}
        multiple={true}
        class="form-control selectpicker form-control-solid form-control-lg h-auto">
        <slot name="list-append" slot="list-append" />
    </Select>
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
