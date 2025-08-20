<script>
    import {scale} from 'svelte/transition';
    import {DotsThreeCircleVertical} from 'phosphor-svelte';
    import {createEventDispatcher} from 'svelte';
    import * as easing from 'svelte/easing';

    const dispatch = createEventDispatcher();

    export let disabled = false;
    export let hidden = false;
    export let actions = [];
    export let id;
    export let color = 'primary';

    function open(event) {
        // event.preventDefault();
        // alert('open');
        dispatch('open');
        // if on mobile, trigger the dropdown
        if (window.innerWidth < 768) {
            document.querySelector(`#dropdown-${id}`).click();
        }
    }
</script>

<div class="dropdown dropdown-inline">
    <!-- svelte-ignore a11y-invalid-attribute -->
    <button
        {disabled}
        in:scale={{duration: 150, start: 0.9, easing: easing.backOut}}
        id={`dropdown-${id}`}
        class="btn btn-xs btn-clean btn-icon text-{color} m-0 mr-2 {hidden ? 'd-none' : ''}"
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
        on:touchstart={open}
        on:click={open}>
        <DotsThreeCircleVertical size="24" weight="duotone" />
    </button>
    <div
        in:scale={{duration: 150, start: 0.9, easing: easing.backOut}}
        class="dropdown-menu p-0 m-0 dropdown-menu-xs dropdown-menu-right font-weight-bold rounded-xl">
        <ul class="navi navi-hover">
            {#each actions as action}
                <li class="navi-item p-2 p-md-0 m-1" style="cursor:pointer;">
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-missing-attribute -->
                    <a
                        class="navi-link rounded-lg text-{action.color ? action.color : 'dark'}"
                        on:click={action.action}
                        data-toggle={action.dataToggle}
                        data-target={action.dataTarget}>
                        <svelte:component this={action.icon} size="22" weight="duotone" class="mr-3" />
                        {action.label}</a>
                </li>
            {/each}
        </ul>
    </div>
</div>
