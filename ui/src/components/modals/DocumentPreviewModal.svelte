<script>
    import BasicModal from './BasicModal.svelte';
    import {userData} from 'store/stores.js';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import Clipboard from 'svelte-clipboard';
    import {
        WhatsappLogo,
        PaperPlaneRight,
        Printer,
        Copy,
        PaperPlaneTilt,
        EnvelopeSimple,
        FileArrowDown,
        MagnifyingGlassPlus,
        MagnifyingGlassMinus,
        Signature,
        ShareNetwork,
    } from 'phosphor-svelte';
    import {onDestroy, onMount} from 'svelte';
    import DocumentButton from 'components/buttons/DocumentButton.svelte';
    import ShareModal from 'routes/accounting/receipts/modals/ShareModal.svelte';

    export let id;
    export let title = 'Anteprima Ricevuta';
    export let cancelButton = 'Chiudi';
    export let actionButton = 'Conferma';
    export let dataHeight = 'auto';
    export let fullHeight = true;
    export let pdfLink;
    export let row;
    export let signatureButton = false;
    export let signatureFunction = null;
    export let show = true;
    export let target = null;
    let showFooter = true;
    let modalSize = 'xl';
    let scrollable = false;
    let showCancelButton = true;
    let showActionButton = false;
    let alignFooterCenter = false;
    let copied = false;

    let currentScale = 1;

    onMount(() => {
        // set body overflow hidden and body height 100vh when modal is open
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100vh';
    });

    function clearBody() {
        document.body.style = 'overflow:auto;';
    }

    // function scaleUpIframeContentWithCss() {
    //     let iframe = document.getElementById(`frame-preview-${id}`);
    //     if (iframe) {
    //         currentScale += 0.25;
    //         iframe.style.transform = `scale(${currentScale}, ${currentScale})`;
    //     }
    // }

    // function scaleDownIframeContentWithCss() {
    //     let iframe = document.getElementById(`frame-preview-${id}`);
    //     if (iframe) {
    //         currentScale -= 0.25;
    //         iframe.style.transform = `scale(${currentScale}, ${currentScale})`;
    //     }
    // }

    onDestroy(() => {
        clearBody();
    });
</script>

<BasicModal
    {id}
    {show}
    {fullHeight}
    {title}
    {cancelButton}
    {showCancelButton}
    {showFooter}
    {showActionButton}
    {actionButton}
    {scrollable}
    {dataHeight}
    {alignFooterCenter}
    {modalSize}
    {target}
    hideOnClickOutside={false}
    on:cancel={clearBody}
    on:confirm={clearBody}>
    <div class="my-4">
        <h1>{title}</h1>
    </div>
    <iframe
        id="frame-preview-{id}"
        {title}
        src={pdfLink}
        style="width: 100%; min-height: {KTUtil.isMobileDevice() ? '50svh' : '80svh'}; border: none;" />
    <div slot="footer" class="d-flex justify-content-center">
        <div class="d-flex">
            <div style="display: flex; gap: .5rem;">
                <!-- Download file -->
                <button
                    class="btn btn-sm btn-primary font-weight-bolder align-items-center"
                    on:click={() => {
                        // remove query string from url
                        const url = pdfLink.split('?')[0];
                        downloadPdf(url);
                    }}>
                    <FileArrowDown size="16" weight="duotone" />
                    Scarica
                </button>
                <button
                    class="btn btn-sm btn-light-primary font-weight-bolder align-items-center"
                    on:click={() => {
                        let shareModal = new ShareModal({
                            target: document.getElementById(`frame-preview-${id}`),
                            intro: true,
                            props: {
                                id: id,
                                row: row,
                                pdfLink: pdfLink,
                                title: 'Condividi documento',
                                showSendEmailButton: false,
                                whatsappMessage: `Ciao 👋\nQuesto è il link per scaricare il tuo documento:\n\n${pdfLink}\n\nCordiali saluti,\n${$userData.sport_association.denomination}`,
                                sendClientEmailCallback: async () => {
                                    window.open(
                                        `mailto:?subject=Documento da ${$userData.sport_association.denomination}&body=` +
                                            encodeURIComponent(`Ciao,\nQuesto è il link per scaricare il tuo documento:\n\n${pdfLink}
                                            \n\nCordiali saluti,\n${$userData.sport_association.denomination}`)
                                    );
                                },
                            },
                        });
                        jQuery(`#shareModal-${id}`).modal('show');
                    }}>
                    <ShareNetwork size="16" weight="duotone" />
                    Condividi documento
                </button>
            </div>
            {#if signatureButton}
                <button
                    class="btn btn-sm btn-primary font-weight-bolder align-items-center ml-2"
                    on:click={signatureFunction}>
                    <Signature size="16" weight="duotone" />
                    Firma documento
                </button>
            {/if}
            <!-- <button
                class="btn btn-icon btn-primary font-weight-bolder align-items-center"
                on:click={scaleUpIframeContentWithCss}>
                <MagnifyingGlassPlus size="24" weight="duotone" />
            </button>
            <button
                class="btn btn-icon btn-primary font-weight-bolder align-items-center"
                on:click={scaleDownIframeContentWithCss}>
                <MagnifyingGlassMinus size="24" weight="duotone" />
            </button> -->
        </div>
    </div>
</BasicModal>
