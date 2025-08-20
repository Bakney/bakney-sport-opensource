<script>
    import BasicModal from 'components/modals/BasicModal.svelte';
    import {ArrowSquareOut, VideoCameraSlash} from 'phosphor-svelte';

    export let video;
    export let doclink = 'https://manuale.bakney.com';
    export let show = true;
</script>

<BasicModal
    title="Video tutorial"
    showTitle={true}
    showFooter={true}
    showCancelButton={false}
    showActionButton={false}
    modalSize={'xl'}
    bind:show>
    <div
        class="d-flex m-4 justify-content-center align-items-center flex-column border rounded-xl overflow-hidden shadow-lg bg-light mb-4"
        style="min-height: 350px;">
        {#if video}
            <video controls autoplay playsinline>
                <source src={video} type="video/mp4" />
                <track kind="captions" src="" srclang="it" label="Italiano" />
                Your browser does not support the video tag.
            </video>
        {:else}
            <div class="d-flex justify-content-center align-items-center flex-column text-primary">
                <VideoCameraSlash size={48} weight="duotone" class="mb-2" />
                <p class="text-center font-weight-boldest font-size-h5">Il video non è ancora disponibile.</p>
            </div>
        {/if}
    </div>
    <div slot="footer">
        <a
            href={doclink}
            target="_blank"
            class="btn btn-light-warning font-weight-boldest help-button d-flex align-items-center"
            style="border-top: 1px solid #ffffff94;outline: 1px solid #fdecca !important;"
            >Approfondisci nel manuale
            <ArrowSquareOut size={16} weight="bold" class="ml-2" />
        </a>
    </div>
</BasicModal>

<style>
    video {
        width: 100%;
        height: auto;
    }
</style>
