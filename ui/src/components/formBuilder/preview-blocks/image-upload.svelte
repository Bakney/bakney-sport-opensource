<script>
    import DeleteButton from 'components/buttons/DeleteButton.svelte';
    import {clickOutside} from '../utils';
    import {createEventDispatcher} from 'svelte';
    import {FloppyDisk, Info, X} from 'phosphor-svelte';
    import {slide} from 'svelte/transition';

    const dispatch = createEventDispatcher();

    export let props;
    export let active = false;
    export let editable = true;
    export let customClasses = 'p-4 m-4 ';
    export let value;

    let input;
    let image;
    let showImage = false;
    let required = props.required;

    $: showImage = !!props.value;
    $: required = showImage ? false : props.required;

    function onChange() {
        const file = input.files[0];

        if (file) {
            const reader = new FileReader();
            reader.addEventListener('load', function () {
                props.value = reader.result;
                value = reader.result;
            });
            reader.readAsDataURL(file);
        } else {
            props.value = null;
            value = null;
            props.required = true;
        }
    }
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
    {#if !props.showUploadBelow}
        <div class="input-group input-group-solid">
            <input
                bind:this={input}
                on:change={onChange}
                id={props.id}
                name={props.name}
                type="file"
                accept="image/*"
                class="form-control form-control-solid form-control-lg custom-file-input"
                {required} />
            <label
                class="custom-file-label"
                for={props.id}
                style="background: #f4f6f9 !important; color: #b2b9c3;overflow:hidden"
                >{props.placeholderUpload || 'Scegli logo con firma del presidente'}</label>
        </div>
    {/if}
    <div
        class="preview-container mt-{!props.showUploadBelow
            ? '8'
            : '2'} mb-3 border border-secondary shadow-xs rounded-lg"
        style={props.previewStyle || ''}
        on:click={() => {
            if (!showImage) {
                // fire the click event
                input.click();
            }
        }}>
        {#if showImage}
            <img src={props.value} alt="Preview" class="img-fluid" style={props.imgStyle || ''} />

            <div class="overlay" style="position:absolute;margin-top:7rem;">
                <span
                    class="btn btn-xs btn-icon btn-circle btn-dark font-weight-boldest shadow-sm border border-secondary"
                    on:click={() =>
                        setTimeout(() => {
                            props.value = null;
                            value = null;
                        }, 100)}
                    data-action="remove"
                    data-toggle="tooltip"
                    title="rimuovi immagine">
                    <X size={16} weight="bold" />
                </span>
            </div>
        {:else if props.placeholderImage}
            <img src={props.placeholderImage} alt="Preview" class="img-fluid opacity-75" />
        {:else}
            <span class="placeholder">{props.placeholder || 'Image Preview'}</span>
        {/if}
    </div>
    {#if props.showUploadBelow}
        <div class="input-group input-group-solid">
            <input
                bind:this={input}
                on:change={onChange}
                id={props.id}
                name={props.name}
                type="file"
                accept="image/*"
                class="form-control form-control-solid form-control-lg custom-file-input"
                {required} />
            <label
                class="custom-file-label"
                for={props.id}
                style="background: #f4f6f9 !important; color: #b2b9c3;overflow:hidden"
                >{props.placeholderUpload || 'Scegli logo con firma del presidente'}</label>
        </div>
    {/if}
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

<style>
    .preview-container {
        width: 100%;
        height: 10rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: #ccc;
        overflow: hidden;
    }
    .preview-container img {
        width: 100%;
        height: 10rem;
        object-fit: contain;
        object-position: left;
    }
</style>
