<script>
    import {fly} from 'svelte/transition';
    import {Info, Warning} from 'phosphor-svelte';

    export let icon;
    export let title;
    export let message;
    export let titleColor = 'dark-75';
    export let textColor = 'dark-50';
</script>

<!--begin::Notice-->
<div in:fly={{delay: 0, duration: 300, y: -20}} class="card card-custom gutter-b help-engage">
    <div class="card-body d-flex align-items-center py-5 py-lg-10">
        <!--begin::Icon-->
        <div class="d-flex flex-center position-relative ml-5 mr-15 ml-lg-9">
            <slot name="icon">
                {#if icon == 'danger'}
                    <Warning size={42} weight="duotone" class="text-{titleColor}" />
                {:else}
                    <Info size={42} weight="duotone" class="text-{titleColor}" />
                {/if}
            </slot>
        </div>
        <!--end::Icon-->
        <!--begin::Description-->
        <div class="m-0 text-{textColor} font-weight-bold font-size-lg">
            {#if title}
                <h3 class="pb-1 text-{titleColor} font-weight-bolder font-size-h3">{@html title}</h3>
            {/if}
            {@html message}
        </div>
        <!--end::Description-->
    </div>
</div>
<!--end::Notice-->
