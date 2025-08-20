<script>
    import {crossfade, fade} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import Portal from 'svelte-portal';
    import {createEventDispatcher, onMount, onDestroy} from 'svelte';
    import {X} from 'phosphor-svelte';
    import {clickOutside} from 'components/formBuilder/utils';

    const dispatch = createEventDispatcher();

    export let id;
    export let show = false;
    export let title = 'Modal Title';
    export let showTitle = false;
    export let cancelButton = 'Chiudi';
    export let showCancelButton = true;
    export let showFooter = true;
    export let showActionButton = true;
    export let actionButton = 'Conferma';
    export let scrollable = false;
    export let dataHeight = 'auto';
    export let modalSize = 'lg';
    export let fullHeight = false;
    export let alignFooterCenter = true;
    export let bodyClass = 'py-2 px-2 px-md-8';
    export let hideOnClickOutside = true;
    export let target = null;
    export let contentOverflowVisible = false;

    // add event listener to close modal on escape key press
    const handleKeydown = e => {
        if (e.key === 'Escape') {
            show = false;
            dispatch('cancel');
            dispatch('close');
        }
    };

    $: {
        if (!show) {
            // unblock body scroll
            document.body.style.overflow = 'auto';
        }
    }

    // add the esc event listener
    onMount(() => {
        // block body scroll
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeydown);
        return () => {
            window.removeEventListener('keydown', handleKeydown);
        };
    });

    onDestroy(() => {
        // unblock body scroll
        document.body.style.overflow = 'auto';
    });

    // add event listener to close modal on click outside
    const handleClickOutside = e => {
        if (hideOnClickOutside && e.target.id !== id) {
            show = false;
            // just to be sure
            document.body.style.overflow = 'auto';
            dispatch('close');
        }
    };
</script>

<!-- svelte-ignore missing-declaration -->
{#if show}
    <Portal target={target ? document.getElementById(target.replace('#', '')) : document.body}>
        <!-- Modal-->
        <div
            in:fade={{duration: 500, easing: easing.cubicInOut}}
            out:fade={{duration: 50}}
            class="modal fade show"
            {id}
            tabindex="-1"
            role="dialog"
            aria-labelledby="staticBackdrop"
            aria-hidden={show ? 'false' : 'true'}
            style="display:block; backdrop-filter: blur(3px) brightness(0.5);-webkit-backdrop-filter: blur(3px) brightness(0.5);">
            <div
                use:clickOutside
                on:click_outside={handleClickOutside}
                class="modal-dialog modal-{modalSize} modal-dialog-centered {scrollable
                    ? 'modal-dialog-scrollable'
                    : ''}"
                role="document">
                <div
                    class="modal-content"
                    style=" {fullHeight ? 'min-height: 95svh' : ''} {contentOverflowVisible
                        ? 'overflow: visible'
                        : ''}">
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <div class="w-24 h-24" style="position:absolute;right:0;z-index:999999">
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <span
                            class="btn btn-sm btn-icon btn-ghost m-1"
                            on:click={() => {
                                show = false;
                                dispatch('cancel');
                                // unblock body scroll
                                document.body.style.overflow = 'auto';
                            }}>
                            <X weight="bold" size={20} class="m-2" />
                        </span>
                    </div>
                    {#if showTitle}
                        <div class="modal-header d-flex justify-content-left">
                            <h3>{title}</h3>
                        </div>
                    {/if}
                    <div
                        class="modal-body {bodyClass}"
                        data-scroll={scrollable}
                        data-height={dataHeight}
                        style=" {contentOverflowVisible ? 'overflow: visible' : ''}">
                        <slot />
                    </div>
                    {#if showFooter}
                        <div
                            class="modal-footer d-flex {alignFooterCenter
                                ? 'justify-content-center'
                                : 'justify-content-between'}">
                            <slot name="footer" />
                            {#if showCancelButton}
                                <button
                                    class="btn btn-secondary font-weight-boldest"
                                    on:click={() => {
                                        show = false;
                                        dispatch('cancel');
                                        // unblock body scroll
                                        document.body.style.overflow = 'auto';
                                    }}>
                                    {cancelButton}
                                </button>
                            {/if}
                            {#if showActionButton}
                                <button
                                    class="btn btn-primary font-weight-boldest font-weight-boldest"
                                    on:click={() => {
                                        show = false;
                                        dispatch('confirm');
                                        // unblock body scroll
                                        document.body.style.overflow = 'auto';
                                    }}>
                                    {actionButton}
                                </button>
                            {/if}
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </Portal>
{/if}
