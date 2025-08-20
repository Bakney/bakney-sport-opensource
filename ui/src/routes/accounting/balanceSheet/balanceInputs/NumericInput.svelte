<script>
    import {onDestroy, onMount, createEventDispatcher} from 'svelte';
    import {slide} from 'svelte/transition';

    const dispatch = createEventDispatcher();

    export let value;
    export let id;
    export let editable;

    let inputValue;

    $: editable, mountInputMask();

    $: {
        if (value == null || value == 'NaN' || isNaN(value)) {
            value = '0.00';
            updateInputValue();
        }
    }

    onMount(() => {
        updateInputValue();
        mountInputMask();
    });

    onDestroy(() => {
        editable = false;
    });

    function updateInputValue() {
        inputValue = String(value).replace('.', ',');
    }

    function updateValue() {
        value = parseFloat(String(inputValue).replace(',', '.'));
    }

    function mountInputMask() {
        if (!editable) return;

        // // check if the input value has a dot or a comma
        // if (value && value?.includes('.')) value = value.replace('.', ',');

        jQuery(`#numeric_input_${id}`).inputmask('9{1,9},9{2}', {
            greedy: true,
            placeholder: '0',
            rightAlign: true,
        });

        jQuery(`#numeric_input_${id}`).change(function () {
            value = document.getElementById(`numeric_input_${id}`).value.replace(',', '.');
            dispatch('update', value);
        });
    }
</script>

<div transition:slide={{duration: 200}} class="input-group input-group-solid input-group-sm">
    <div class="input-group-prepend">
        <span class="input-group-text fs-1-1">€</span>
    </div>
    <input
        onClick="this.select();"
        disabled={!editable}
        type="text"
        bind:value={inputValue}
        class="form-control"
        placeholder="0,00"
        id="numeric_input_{id}"
        style="text-align: right;" />
</div>
