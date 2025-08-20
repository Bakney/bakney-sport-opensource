<script>
    import {slide} from 'svelte/transition';
    import Portal from 'svelte-portal';
    import {createEventDispatcher, onDestroy, onMount} from 'svelte';

    const dispatch = createEventDispatcher();

    export let autoShow = false;
    export let visible = true;
    export let customStyle = '';
    export let target = '#portal-elements';
    let saving = false;
    let visibleListener;

    onMount(() => {
        if (autoShow) {
            visible = false;
            visibleListener = window.addEventListener('scroll', function () {
                if (window.scrollY > 200) {
                    visible = true;
                } else {
                    visible = false;
                }
            });
        }
    });

    onDestroy(() => {
        if (visibleListener) {
            window.removeEventListener('scroll', visibleListener);
        }
    });
</script>

{#if visible}
    <Portal target={document.querySelector(target)}>
        <div in:slide={{duration: 250, delay: 0}} class="fixed-bottom-bar-actions border" style={customStyle}>
            <div class="w-100">
                <slot name="left" />
            </div>
            <button
                type="button"
                disabled={saving}
                class="btn btn-primary font-weight-boldest m-0 btn-always-text-visible"
                on:click={async () => {
                    try {
                        saving = true;
                        dispatch('save');
                        // promise async
                        await new Promise(resolve => setTimeout(resolve, 500));

                        saving = false;
                    } catch (error) {
                        console.error(error);
                    }
                }}>
                {#if saving}
                    <!-- spinner -->
                    <span class="spinner spinner-right spinner-white pr-15" />
                {:else}
                    Salva
                {/if}
            </button>
        </div>
    </Portal>
{/if}

<svelte:head>
    <style>
        .fixed-bottom-bar-actions {
            width: 100%;
            position: fixed;
            bottom: 0;
            background: #ffffff87;
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
            padding: 0.5rem;
            /* box-shadow: 0 -1rem 1rem #0000001f; */
            display: flex;
            justify-content: space-between;
            align-items: center;
            left: 0;
            border-radius: 0.55rem 0.55rem 0 0;
        }
    </style>
</svelte:head>
