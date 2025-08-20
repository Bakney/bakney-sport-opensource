<script>
    import {X, XCircle} from 'phosphor-svelte';
    import {onMount, onDestroy, createEventDispatcher} from 'svelte';
    import {fly} from 'svelte/transition';

    export let isOpen = false;
    export let position = 'right';
    export let width = '85vw';
    export let closeOnClickOutside = true;
    export let closeOnEsc = true;
    export let title = '';

    let drawer;
    let backdrop;
    let touchOverflow = true;
    const dispatch = createEventDispatcher();

    function handleKeydown(event) {
        if (closeOnEsc && event.key === 'Escape' && isOpen) {
            close();
        }
    }

    function handleBackdropClick(event) {
        if (closeOnClickOutside && event.target === backdrop) {
            close();
        }
    }

    function close() {
        if (touchOverflow) document.body.style.overflow = 'auto';
        isOpen = false;
        dispatch('close');
    }

    onMount(() => {
        document.addEventListener('keydown', handleKeydown);
        if (touchOverflow && isOpen) {
            document.body.style.overflow = 'hidden';
        }
    });

    onDestroy(() => {
        document.removeEventListener('keydown', handleKeydown);
        if (touchOverflow) document.body.style.overflow = 'auto';
    });

    function getTransitionParams() {
        const duration = 300;
        switch (position) {
            case 'left':
                return {x: -width, duration};
            case 'right':
                return {x: width, duration};
            case 'top':
                return {y: '-100%', duration};
            case 'bottom':
                return {y: '100%', duration};
        }
    }

    $: drawerStyles = `
      width: ${width && window.innerWidth < 920 ? '100vw' : width};
      min-width: ${width && window.innerWidth < 920 ? '100vw' : width};
      max-width: ${width && window.innerWidth < 920 ? '100vw' : width};
      ${position}: 0;
    `;
</script>

{#if isOpen}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
        class="drawer-backdrop"
        on:click={handleBackdropClick}
        bind:this={backdrop}
        transition:fly={{duration: 200, opacity: 0}}>
        <div
            class="drawer drawer-{position} shadow-lg"
            style={drawerStyles}
            bind:this={drawer}
            on:click={e => {
                if (e.target === drawer) {
                    e.stopPropagation();
                }
            }}
            transition:fly={getTransitionParams()}>
            <div class="drawer-header">
                <slot name="header">
                    <h1 class="mb-0 font-weight-boldest">{title}</h1>
                    <button
                        class="btn btn-icon btn-xs rounded-circle close btn-secondary mb-0 font-weight-boldest p-0"
                        type="button"
                        on:click={close}>
                        <X size="14" weight="bold" />
                    </button>
                </slot>
            </div>
            <slot name="content" />
        </div>
    </div>
{/if}

<svelte:head>
    <style>
        /* Slide from right */
        .drawer-right {
            right: -100%;
            transition: right 1s ease-in-out;
        }
        .drawer-right.show {
            right: 0;
        }

        /* Slide from left */
        .drawer-left {
            left: -100%;
            transition: left 1s ease-in-out;
        }
        .drawer-left.show {
            left: 0;
        }

        /* Slide from top */
        .drawer-top {
            top: -100%;
            transition: top 1s ease-in-out;
        }
        .drawer-top.show {
            top: 0;
        }

        /* Slide from bottom */
        .drawer-bottom {
            bottom: -100%;
            transition: bottom 1s ease-in-out;
        }
        .drawer-bottom.show {
            bottom: 0;
        }
    </style>
</svelte:head>

<style>
    .drawer-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.3);
        z-index: 1040;
        backdrop-filter: blur(2px);
        -webkit-backdrop-filter: blur(2px);
    }

    .drawer {
        position: fixed;
        height: 100%;
        background-color: #fff;
        border-radius: 1.5rem 0 0 0rem;
        z-index: 1050;
        overflow-y: auto;
        will-change: transform;
        scroll-behavior: smooth;
        -webkit-scroll-behavior: smooth;
        animation: smoothScroll var(--scroll-duration) cubic-bezier(0.45, 0.05, 0.55, 0.95);
    }

    .drawer-header {
        min-height: 5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 2rem;
    }
</style>
