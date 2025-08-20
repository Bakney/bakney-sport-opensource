<script>
    import DeleteButton from 'components/buttons/DeleteButton.svelte';
    import {clickOutside} from '../utils';
    import {createEventDispatcher, onMount} from 'svelte';
    import {FloppyDisk, Info} from 'phosphor-svelte';
    import {slide} from 'svelte/transition';
    import {v4 as uuidv4} from 'uuid';

    const dispatch = createEventDispatcher();

    export let props;
    export let active = false;
    export let editable = true;
    export let customClasses = 'p-4 m-4 ';

    let random = uuidv4();

    function initWidget() {
        jQuery(document).ready(function () {
            jQuery(`#${props.id}${random}`).inputmask('9{1,6},9{2}', {
                greedy: false,
                placeholder: '0',
                rightAlign: true,
            });
        });
    }

    function change(e) {
        if (e.key === ',' || e.key === '.') return;
        dispatch('change', document.getElementById(`${props.id}${random}`).value);
    }

    onMount(() => {
        initWidget();
    });
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
    <label class="font-weight-bolder" for={props.id}>{props.label}<b>{props.required ? '*' : ''}</b></label>
    <div class="input-group input-group-solid">
        <div class="input-group-prepend">
            <span class="input-group-text fs-1-1">{props.currency || '€'}</span>
        </div>
        <input
            on:click={e => {
                e.target.select();
            }}
            on:change={change}
            on:keyup={change}
            bind:value={props.value}
            id="{props.id}{random}"
            name={props.name}
            disabled={props.disabled || false}
            placeholder={props.placeholder}
            type="text"
            class="form-control fs-1-1 form-control-solid form-control-lg pr-4 text-right"
            required={props.required} />
    </div>
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
                <div class="form-group col-3 mb-4">
                    <div class="font-size-sm font-weight-bold mb-1">Valuta</div>
                    <div class="input-group">
                        <input class="form-control form-control-sm" bind:value={props.currency} />
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>
