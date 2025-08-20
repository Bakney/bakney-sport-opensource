<script>
    export let label;
    export let name = 'switch';
    export let id;
    export let checked;
    export let helpText;
    export let required = false;
</script>

<div class="form-group">
    {#if label}
        <label for={name} class="font-weight-bolder mb-1">{label}</label>
    {/if}
    <div class="input-group">
        <span class="switch switch-icon switch-sm ml-0">
            <label>
                <input {id} type="checkbox" {name} bind:checked {required} />
                <span />
            </label>
        </span>
    </div>
    {#if helpText}
        <div class="text-muted font-size-sm mt-1">
            {helpText}
        </div>
    {/if}
</div>
