<script>
    import ModuleRender from 'components/formBuilder/module-render.svelte';
    export let formData;
</script>

{#if formData?.additional_fields}
    <ModuleRender bind:elements={formData.additional_fields} styled={false} sendButton={false} branded={false} />
{/if}

<svelte:head>
    <style>
        .form-element-preview .form-group {
            padding: 0px !important;
            margin: 18px 0px !important;
        }
    </style>
</svelte:head>
