<script>
    import DeleteButton from 'components/buttons/DeleteButton.svelte';
    import {clickOutside} from '../utils';
    import {createEventDispatcher} from 'svelte';
    import {FloppyDisk, Info} from 'phosphor-svelte';
    import {slide} from 'svelte/transition';

    const dispatch = createEventDispatcher();

    export let props;
    export let active = false;
    export let editable = true;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
    class="form-group p-4 m-4 rounded-lg"
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
        <input
            bind:value={props.value}
            id={props.id}
            name={props.name}
            type="email"
            class="form-control form-control-solid form-control-lg"
            placeholder={props.placeholder}
            required={props.required} />
    </div>
    {#if props.helperLabel}
        <div class="text-primary align-items-center d-flex font-weight-bold mt-1 font-size-sm">
            <Info size={14} weight={'duotone'} class="mr-1" />
            {props.helperLabel}
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
                <div class="form-group col-3 mb-4 d-none">
                    <div class="font-size-sm font-weight-bold mb-1">Id</div>
                    <div class="input-group">
                        <input class="form-control form-control-sm" bind:value={props.id} />
                    </div>
                </div>
                <div class="form-group col-3 mb-4 d-none">
                    <div class="font-size-sm font-weight-bold mb-1">Nome</div>
                    <div class="input-group">
                        <input class="form-control form-control-sm" bind:value={props.name} />
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>
