<script>
    import BasicModal from 'components/modals/BasicModal.svelte';
    import QrCode from 'svelte-qrcode';
    import Clipboard from 'svelte-clipboard';
    import {userData} from 'store/stores';
    import {Copy, PaperPlaneRight, Printer, WhatsappLogo} from 'phosphor-svelte';
    import {toast} from 'svelte-sonner';
    import SimpleButton from 'components/buttons/simple-button.svelte';

    userData.useLocalStorage();

    export let show;
    let loading = false;
    let copied = false;
</script>

<div>
    <BasicModal
        id={`share-link`}
        bind:show
        title="Condividi link pre-iscrizioni"
        showTitle={true}
        showActionButton={true}
        showCancelButton={true}
        showFooter={false}
        modalSize={'md'}
        scrollable={true}
        bodyClass={'py-2 px-0'}
        actionButton="Crea"
        dataHeight={300}>
        {#if !loading}
            <div class="px-8 py-4">
                <div class="d-flex justify-content-center flex-column">
                    <div style="text-align: center" id="qr-code-subscriptions">
                        <QrCode
                            value="{__bakney.env.DOMAIN}/#/subscribe/{String(
                                $userData.username
                            ).toLowerCase()}/preregistration" />
                    </div>
                    <div class="pt-2 pb-4 text-center">
                        Scarica e stampa il QR code per far pre-iscrivere soci e tesserati.
                    </div>
                </div>
                <div class="d-flex justify-content-center gap-2 mb-5">
                    <div class="input-group link-share-group">
                        <!-- svelte-ignore missing-declaration -->
                        <Clipboard
                            text="{__bakney.env.DOMAIN}/#/subscribe/{String(
                                $userData.username
                            ).toLowerCase()}/preregistration"
                            let:copy
                            on:copy={() => {
                                copied = true;
                                setTimeout(() => {
                                    copied = false;
                                }, 2000);
                                toast.success('Link copiato negli appunti');
                            }}>
                            <input
                                type="text"
                                class="form-control {copied ? 'bg-light-success' : ''}"
                                style="pointer-events: none;"
                                value="{__bakney.env.DOMAIN}/#/subscribe/{String(
                                    $userData.username
                                ).toLowerCase()}/preregistration" />
                            <div class="input-group-append">
                                <!-- svelte-ignore a11y-click-events-have-key-events -->
                                <!-- svelte-ignore a11y-missing-attribute -->
                                <a
                                    on:click={copy}
                                    role="button"
                                    tabindex="0"
                                    class="btn btn-primary"
                                    style="border-radius: 0 .55rem .55rem 0;margin: auto; margin-top:0"
                                    data-clipboard="true"
                                    data-clipboard-target="#kt_clipboard_1">
                                    <Copy size={16} weight="duotone" />
                                </a>
                            </div>
                        </Clipboard>
                    </div>
                    <SimpleButton
                        label="Apri"
                        variant="success"
                        on:click={() => {
                            window.open(
                                `${__bakney.env.DOMAIN}/#/subscribe/${String(
                                    $userData.username
                                ).toLowerCase()}/preregistration`,
                                '_blank'
                            );
                        }} />
                </div>
            </div>

            <div class="modal-footer border-0 py-1 d-flex justify-content-between">
                <div class="d-flex">
                    <button
                        type="button"
                        style="background-color: #22ceba; border-color: #22ceba;"
                        class="btn btn-primary font-weight-bold d-flex align-items-center"
                        on:click={() => {
                            window.open(
                                `https://api.whatsapp.com/send/?text=` +
                                    encodeURIComponent(
                                        `Ciao 👋\nQuesto è il link per pre-iscriverti all'associazione *${
                                            $userData.sport_association.denomination
                                        }*:\n\n${__bakney.env.DOMAIN}/#/subscribe/${String(
                                            $userData.username
                                        ).toLowerCase()}/preregistration\n\nSe non hai ancora un account puoi crearne uno. Avrai tutto a portata di mano: iscrizioni, pagamenti online (corsi/iscrizioni/carnet) e ricevute. \n\nCordiali saluti,\n${
                                            $userData.sport_association.denomination
                                        }`
                                    )
                            );
                        }}><WhatsappLogo size="20" weight="fill" class="mr-2" />Whatsapp</button>
                    <button
                        type="button"
                        class="btn btn-primary font-weight-bold d-flex align-items-center ml-2"
                        on:click={() => {
                            window.open(
                                'mailto:user@example.com?subject=Compila il modulo di pre-iscrizione&body=' +
                                    encodeURIComponent(
                                        `Ciao,\nQuesto è il link per pre-iscriverti all'associazione ${
                                            $userData.sport_association.denomination
                                        }:\n\n${__bakney.env.DOMAIN}/#/subscribe/${String(
                                            $userData.username
                                        ).toLowerCase()}/preregistration\n\nSe non hai ancora un account puoi crearne uno. Avrai tutto a portata di mano: iscrizioni, pagamenti online (corsi/iscrizioni/carnet) e ricevute. \n\nCordiali saluti,\n${
                                            $userData.sport_association.denomination
                                        }`
                                    )
                            );
                        }}><PaperPlaneRight size="20" weight="fill" class="mr-2" />Invia Email</button>

                    <button
                        type="button"
                        class="btn btn-primary font-weight-bold d-flex align-items-center ml-2"
                        on:click={() => {
                            let printDiv = document.getElementById('qr-code-subscriptions');
                            let printContents = printDiv.innerHTML;

                            // set print window
                            let printWindow = window.open(
                                '',
                                '',
                                'height=400,width=800,left=0,top=0,toolbar=0,scrollbars=0,status=0'
                            );
                            // set print content
                            printWindow.document.write(`
                                <html>
                                    <head>
                                        <title>QR code</title>
                                        <style>
                                            @media print {
                                                .no-print {
                                                    display: none;
                                                }
                                            }
                                            #content img {
                                                width: 100%;
                                            }
                                        </style>
                                    </head>
                                    <body>
                                        <div class="no-print">
                                            <button type="button" class="btn btn-primary font-weight-bold d-flex align-items-center" onclick="window.print();"><Printer size="20" weight="fill" class="mr-2" />Stampa</button>
                                        </div>
                                        <div id="content">
                                            ${printContents}
                                            <div class="text-center" style="font-family:sans-serif;text-align:center; font-size: 1.2rem;">
                                                <h1 class="text-center">Scannerizza il QR code per iscriverti a ${
                                                    $userData.sport_association.denomination
                                                }</h1>
                                                <div>
                                                    <br>oppure vai su:
                                                </div>
                                                <div>
                                                    ${__bakney.env.DOMAIN}/#/subscribe/${String(
                                $userData.username
                            ).toLowerCase()}/preregistration
                                                    </div>
                                            </div>
                                        </div>
                                    </body>
                                </html>
                            `);
                            printWindow.document.close();
                            printWindow.focus();
                            printWindow.print();
                        }}><Printer size="20" weight="fill" class="mr-2" />QR code</button>
                </div>
                <button
                    type="button"
                    class="btn mt-0 btn-secondary font-weight-bold"
                    data-dismiss="modal"
                    on:click={() => (show = false)}>Chiudi</button>
            </div>
        {:else}
            <div class="text-center py-20 d-flex justify-content-center">
                <div class="spinner spinner-primary spinner-lg" />
            </div>
        {/if}
    </BasicModal>
</div>
