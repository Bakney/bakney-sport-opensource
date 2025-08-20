<script>
    import {ArrowLeft, ArrowRight} from "phosphor-svelte";
    import * as easing from 'svelte/easing';
    import {scale} from 'svelte/transition';
    import {onMount} from 'svelte';

    export let props;

    let contentDiv;
    let leftButton;
    let rightButton;

    let canScrollLeft = false;
    let canScrollRight = false;

    function updateScrollButtons() {
        if (contentDiv) {
            canScrollLeft = contentDiv.scrollLeft > 0;
            canScrollRight = contentDiv.scrollLeft < contentDiv.scrollWidth - contentDiv.clientWidth;
        }
    }

    function scrollLeft() {
        if (contentDiv) {
            contentDiv.scrollBy({left: -300, behavior: 'smooth'});
        }
    }

    function scrollRight() {
        if (contentDiv) {
            contentDiv.scrollBy({left: 300, behavior: 'smooth'});
        }
    }

    onMount(() => {
        updateScrollButtons();
        if (contentDiv) {
            contentDiv.addEventListener('scroll', updateScrollButtons);
        }

        return () => {
            if (contentDiv) {
                contentDiv.removeEventListener('scroll', updateScrollButtons);
            }
        };
    });
</script>


<div class="d-flex justify-content-between align-items-center {props?.class || ''}">
    <div class="mr-4 min-w-40px d-flex justify-content-center">
        {#if canScrollLeft}
            <button
                    transition:scale|local={{duration: 300, start: 0.98, easing: easing.cubicInOut}}
                    class="btn btn-dark btn-sm p-2"
                    on:click={scrollLeft}
                    disabled={!canScrollLeft}
                    bind:this={leftButton}
            >
                <ArrowLeft size={16} weight="bold"/>
            </button>
        {/if}
    </div>
    <div id="simple-carousel-content" class="d-flex pb-4" bind:this={contentDiv}
         style="overflow-x: auto; overflow-y:hidden;">
        <slot>
            <!-- Default content -->
            Content
        </slot>
    </div>
    <div class="ml-4 min-w-40px d-flex justify-content-center">
        {#if canScrollRight}
            <button
                    transition:scale|local={{duration: 300, start: 0.98, easing: easing.cubicInOut}}
                    class="btn btn-dark btn-sm p-2"
                    on:click={scrollRight}
                    disabled={!canScrollRight}
                    bind:this={rightButton}
            >
                <ArrowRight size={16} weight="bold"/>
            </button>
        {/if}
    </div>
</div>


<style>
    ::-webkit-scrollbar {
        display: none;
        height: 0.5rem; /* height of horizontal scrollbar ← You're missing this */
        width: 1rem; /* width of vertical scrollbar */
    }
</style>