<script>
    import {createEventDispatcher, onMount} from 'svelte';
    import {v4 as uuidv4} from 'uuid';

    const dipatch = new createEventDispatcher();

    export let id = undefined;
    export let name;
    export let random = uuidv4();
    export let value;
    export let placeholder = 'Seleziona data';
    export let format = 'YYYY-MM-DD';
    export let required = false;

    function initWidget() {
        jQuery(`#${id}${random}`).datetimepicker({
            format: 'L',
            locale: 'it',
            format: format,
            useCurrent: true, // workaround the bug that maxDate overwrites defaultDate
            defaultDate: moment(),
        });
    }

    onMount(() => {
        initWidget();
    });
</script>

<div class="input-group input-group-solid date" id="{id}{random}" data-target-input="nearest">
    <input
        {required}
        bind:value
        {name}
        type="text"
        class="form-control form-control-solid form-control-lg datetimepicker-input"
        {placeholder}
        data-target="#{id}{random}" />
    <div class="input-group-append" data-target="#{id}{random}" data-toggle="datetimepicker">
        <span class="input-group-text">
            <i class="ki ki-calendar" />
        </span>
    </div>
</div>
