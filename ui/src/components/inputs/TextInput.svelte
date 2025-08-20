<script>
    export let value;
    export let label;
    export let id;
    export let name;
    export let placeholder;
    export let required = true;
    export let helperLabel;
</script>

<div class="form-group">
    <label for={id}>{label}<b>{required ? '*' : ''}</b></label>
    <div class="input-group input-group-solid">
        <input
            bind:value
            {id}
            {name}
            type="text"
            class="form-control form-control-solid form-control-lg"
            {placeholder}
            {required} />
    </div>
    {#if helperLabel}
        <span class="form-text text-muted">{helperLabel}</span>
    {/if}
</div>
