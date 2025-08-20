<script>
    export let props;
</script>


<div class="border rounded-lg d-flex flex-column {props?.class || ''} min-w-200px mr-2">
    <div class="font-weight-boldest font-size-h4 pt-4 px-4 pb-2 text-center">
        <slot name="header">
            Header
        </slot>
    </div>
    <div class="font-size-lg px-4 py-2 text-center">
        <slot name="content">
            Content
        </slot>
    </div>
    <div class="font-size-lg px-4 py-2 text-center">
        <slot name="footer">
            Footer
        </slot>
    </div>
</div>