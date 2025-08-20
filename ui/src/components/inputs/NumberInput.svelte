<script>
    import {createEventDispatcher, onMount} from 'svelte';
    import {v4 as uuidv4} from 'uuid';

    const dipatch = new createEventDispatcher();

    export let id = undefined;
    export let name;
    export let random = uuidv4();
    export let value = 0;
    export let placeholder = '0,00';
    export let currency = '€';
    export let disabled = false;
    export let checkFloat = false;
    export let reactive = false;

    function initWidget() {
        if (checkFloat && value?.toString()?.includes('.')) {
            if (value?.toString()?.includes('.')) {
                value = value?.toString()?.replace('.', ',');
            }
        }
        jQuery(document).ready(function () {
            jQuery(`#${id}${random}`).inputmask('9{1,4},9{2}', {
                greedy: false,
                placeholder: '0',
                rightAlign: true,
            });
        });
    }

    function change(e) {
        if (reactive) {
            value = document.getElementById(`${id}${random}`).value;
        }
        dipatch('change', document.getElementById(`${id}${random}`).value);
    }

    onMount(() => {
        initWidget();
    });
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<div class="input-group input-group-solid">
    <div class="input-group-prepend">
        <span class="input-group-text fs-1-1">{currency}</span>
    </div>
    <input
        {disabled}
        on:change={change}
        on:keyup={change}
        {name}
        id="{id}{random}"
        {value}
        {placeholder}
        type="text"
        class="form-control fs-1-1" />
</div>
