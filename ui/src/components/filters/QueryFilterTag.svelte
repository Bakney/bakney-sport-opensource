<script>
    import {Datepicker} from 'components/formBuilder/preview-blocks';
    import * as easing from 'svelte/easing';
    import {XCircle, PlusCircle} from 'phosphor-svelte';
    import {scale} from 'svelte/transition';
    import {clickOutside} from 'components/formBuilder/utils';
    import {createEventDispatcher} from 'svelte';

    const dispatch = createEventDispatcher();

    export let props = {
        name: '',
        value: '',
        active: false,
        type: '',
        items: [],
        data: {},
    };

    let showDropdown = false;

    function toggle() {
        props.active = !props.active;
        // if tags, clear all tags
        if (props.type === 'tags') {
            props.data.options.forEach(option => {
                option.checked = false;
            });
            // trigger reactivity
            props.data.options = [...props.data.options];
        }
        dispatch('filter-applied', props);
    }

    function close() {
        showDropdown = false;
    }

    function apply() {
        // toggle
        showDropdown = false;
        props.active = true;
        dispatch('filter-applied', props);
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="dropdown dropdown-inline {showDropdown ? 'show' : ''}">
    <button
        class="dropdown-toggle overflow-hidden d-flex align-items-center border rounded-lg px-2 cursor-pointer {props?.active
            ? 'border-secondary border-2 bg-light'
            : 'border-secondary border-dashed bg-white'}"
        id="dropdown-{props?.name}"
        on:click={e => {
            showDropdown = !showDropdown;
        }}
        style="padding-top: 0.075rem; padding-bottom: 0.075rem;"
        aria-haspopup="true"
        aria-expanded={showDropdown}>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        {#if props?.active}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <span
                id="close-{props?.name}"
                class="mr-0 btn-icon btn-ghost text-hover-danger btn btn-sm"
                on:click|preventDefault={toggle}>
                <XCircle size={20} weight="duotone" class="m-0" />
            </span>
        {:else}
            <span class="mr-0 btn-icon btn-ghost text-hover-primary btn btn-sm">
                <PlusCircle size={18} weight="duotone" class="m-0" />
            </span>
        {/if}
        <span class="font-weight-bold font-size-lg">
            {#if props?.active}
                <span class="text-dark font-weight-boldest border-right border-light-dark py-3 pr-3 mr-2">
                    {props?.name}
                </span>
                {#if props?.type === 'date-range'}
                    Dal <span class="font-weight-boldest text-dark">{props?.data?.from_date}</span> al
                    <span class="font-weight-boldest text-dark">{props?.data?.to_date}</span>
                {:else if props?.type === 'checkbox'}
                    {props?.data?.options
                        .filter(option => option.checked)
                        .map(option => option.label)
                        .join(', ')}
                {:else if props?.type === 'tags' && props?.data?.options.length > 0 && props?.data?.options.filter(option => option.checked).length > 0}
                    {props?.data?.options.filter(option => option.checked).length} tag
                {:else if props?.type === 'age'}
                    <span class="font-weight-boldest text-dark">
                        {#if props?.data?.from_age && props?.data?.to_age}
                            {props?.data?.from_age || 0}-{props?.data?.to_age || 120}
                        {:else if props?.data?.from_age}
                            {props?.data?.from_age || 0}+
                        {:else if props?.data?.to_age}
                            &lt; {props?.data?.to_age || 120}
                        {/if}
                    </span>
                {:else}
                    {props?.value}
                {/if}
            {:else}
                {props?.name}
            {/if}
        </span>
    </button>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
        on:click_outside={close}
        use:clickOutside
        class="dropdown-menu m-0 dropdown-menu-lg dropdown-menu-right font-weight-bold rounded-xl shadow-lg {showDropdown
            ? 'show'
            : ''}"
        style="display: {showDropdown ? 'block' : 'none'};padding: 1rem !important;"
        in:scale={{duration: 150, start: 0.9, easing: easing.backOut}}>
        <h6 class="font-weight-boldest mb-4">
            {props?.name}
        </h6>
        <ul class="navi navi-hover">
            {#if props?.type === 'operation-list'}
                {#each Array.from(props?.items || []) as item (item.id)}
                    <button class="dropdown-item" on:click={item.onClick}>
                        <slot name="item-content" {item}>
                            {#if item?.icon}
                                <svelte:component this={item.icon} size={18} class="mr-2" />
                            {/if}
                            <span>{item?.label}</span>
                        </slot>
                    </button>
                {/each}
            {:else if props?.type === 'date-range'}
                <div class="d-flex" style="gap: 1rem;">
                    <Datepicker
                        customClasses={'p-0 mb-2'}
                        editable={false}
                        active={false}
                        on:change={e => {
                            props.data.from_date = e.detail;
                        }}
                        props={{
                            id: 'from_date',
                            name: 'from_date',
                            label: 'Dal',
                            required: true,
                            format: 'DD/MM/YYYY',
                            value: props?.data?.from_date || null,
                        }} />
                    <Datepicker
                        customClasses={'p-0 mb-2'}
                        editable={false}
                        active={false}
                        on:change={e => {
                            props.data.to_date = e.detail;
                        }}
                        props={{
                            id: 'to_date',
                            name: 'to_date',
                            label: 'Al',
                            required: true,
                            format: 'DD/MM/YYYY',
                            value: props?.data?.to_date || null,
                        }} />
                </div>
            {:else if props?.type === 'checkbox'}
                {#each props?.data?.options as option}
                    <div class="checkbox-list">
                        <label class="checkbox mb-4">
                            <input type="checkbox" name="checkbox-{option.value}" bind:checked={option.checked} />
                            <span />
                            {option.label}
                        </label>
                    </div>
                {/each}
            {:else if props?.type === 'tags'}
                {#each props?.data?.options as option}
                    <div class="checkbox-list">
                        <label class="checkbox mb-4">
                            <input type="checkbox" name="checkbox-{option.tag_id}" bind:checked={option.checked} />
                            <span />
                            {option.tag_name}
                        </label>
                    </div>
                {/each}
                <hr class="border-light" />
                <h6 class="font-weight-boldest mb-4">Modalità di filtro</h6>
                <div class="checkbox-list mt-2">
                    <label class="checkbox mb-4">
                        <input type="checkbox" bind:checked={props.data.and} />
                        <span />
                        Contiene i tag selezionati
                    </label>
                    <div class="text-muted small">
                        {props.data.and
                            ? 'Mostra solo gli elementi che contengono tutti i tag selezionati'
                            : 'Mostra gli elementi che contengono almeno uno dei tag selezionati'}
                    </div>
                </div>
            {:else if props?.type === 'radio'}
                {#each props?.data?.options as option}
                    <div class="checkbox-list">
                        <label class="checkbox mb-4">
                            <input type="radio" name="radio" value={option.value} bind:group={props.value} />
                            <span />
                            {option.label}
                        </label>
                    </div>
                {/each}
            {:else if props?.type === 'age'}
                <div class="d-flex" style="gap: 1rem;">
                    <div class="form-group mb-0">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label for="from_age" class="font-weight-bolder">Da anni</label>
                        <input
                            id="from_age"
                            type="number"
                            class="form-control form-control-sm min-w-5"
                            min="0"
                            max="120"
                            bind:value={props.data.from_age}
                            placeholder="Età minima" />
                    </div>
                    <div class="form-group mb-0">
                        <label for="to_age" class="font-weight-bolder">A anni</label>
                        <input
                            id="to_age"
                            type="number"
                            class="form-control form-control-sm min-w-5"
                            min="0"
                            max="120"
                            bind:value={props.data.to_age}
                            placeholder="Età massima" />
                    </div>
                </div>
            {/if}

            <div class="dropdown-divider border-light" />
            <div class="text-right pt-2">
                <button class="btn btn-sm btn-secondary mb-0 font-weight-boldest" on:click={close}> Chiudi </button>
                <button class="btn btn-sm btn-primary mb-0 font-weight-boldest" on:click={apply}> Applica </button>
            </div>
        </ul>
    </div>
</div>
