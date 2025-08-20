<script>
    import {Question} from 'phosphor-svelte';
    import VideoPlayer from './modals/video-player.svelte';

    export let label = 'Tutorial';
    export let video;
    export let classStyle = 'ml-4';

    function handleClick() {
        let videoPlayerInstance = new VideoPlayer({
            target: document.body,
            props: {
                show: true,
                video: video,
            },
        });

        videoPlayerInstance.$on('close', () => {
            // destroy the instance
            videoPlayerInstance.$destroy();
        });
    }
</script>

{#if window.innerWidth > 920 && __bakney.OEM_CONFIG?.showTutorial}
    <button
        style="border-top: 1px solid #ffffff94;outline: 1px solid #fdecca !important;"
        class="py-1 px-3 shadow-xs help-button btn btn-light-warning rounded-xl btn-sm font-weight-boldest d-flex align-items-center justify-content-between {classStyle}"
        on:click={handleClick}>
        <Question size={18} weight="bold" class="mr-2" />
        {label}
    </button>
{/if}

<svelte:head>
    <style>
        /* on hover and on focus apply #ccc color */
        .help-button:hover,
        .help-button:focus {
            background-color: #fdecca !important;
            color: #bd6e00 !important;
        }
    </style>
</svelte:head>
