<script>
    export let label = '';
    export let variant = ''; // 'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'
    export let size = 'lg'; // 'sm', 'md', 'lg'
</script>

<span class="label label-{variant} label-inline label-{size} font-weight-bolder">
    <slot>
        {label}
    </slot>
</span>
