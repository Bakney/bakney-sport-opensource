<script>
    import Portal from 'svelte-portal';
    export let userData;

    let downloading = false;

    function printPreview() {
        let printContents = document.getElementById('previewIframe');
        let iframeContent = printContents.contentWindow || printContents;

        iframeContent.focus();
        iframeContent.print();
    }

    async function downloadPreview() {
        try {
            downloading = true;
            let res = await fetch(
                `${window.location.protocol}//${window.location.host}/api/document/subscription/preview/?print=true&sport_association_id=${userData?.sport_association?.sport_association_id}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            let blob = await res.json();
            console.info(blob);
            window.downloadFile("Modulo d'iscrizione.pdf", blob.file, 'application/pdf');
        } catch (error) {
            console.error(error);
        } finally {
            downloading = false;
        }
    }
</script>

<Portal target="body">
    <div
        class="modal fade show"
        id="previewModal"
        tabindex="-1"
        role="dialog"
        aria-labelledby="previewModal"
        aria-hidden="true"
        style="z-index: 100000;">
        <div class="modal-dialog modal-dialog-centered modal-xl" role="document">
            <div class="modal-content" style="width: 100%;">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Anteprima modulo d'iscrizione</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <i aria-hidden="true" class="ki ki-close" />
                    </button>
                </div>
                <div class="modal-body px-0 pb-0" style="min-height:70vh">
                    <iframe
                        id="previewIframe"
                        scrolling="yes"
                        style="min-height:75vh;background: #ccc !important; border: 1px solid #ebebeb !important; border-radius: 1rem;"
                        title="Anteprima modulo d'iscrizione"
                        src="{window.location.protocol}//{window.location
                            .host}/api/document/subscription/preview/?sport_association_id={userData?.sport_association
                            ?.sport_association_id}"
                        frameborder="0"
                        width="100%"
                        height="100%" />
                </div>
                <div class="modal-footer p-4">
                    <button
                        class="btn btn-dark font-weight-bold"
                        on:click|preventDefault={downloadPreview}
                        disabled={downloading}>
                        {#if downloading}
                            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                            <span class="sr-only">Scaricamento...</span>
                        {:else}
                            Scarica
                        {/if}
                    </button>
                    <button
                        class="btn btn-success font-weight-bold"
                        on:click|preventDefault={printPreview}
                        disabled={downloading}>Stampa</button>
                    <!-- <button type="button" class="btn btn-light-primary font-weight-bold" data-dismiss="modal">Chiudi</button> -->
                    <button type="button" class="btn btn-primary font-weight-bold" data-dismiss="modal">Chiudi</button>
                </div>
            </div>
        </div>
    </div>
</Portal>
