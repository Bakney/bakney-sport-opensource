<script>
    import {scale} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import {Copy, PaperPlaneRight, Printer, Question, WhatsappLogo, ArrowSquareOut} from 'phosphor-svelte';
    import {sessionToken, userData} from 'store/stores';
    import Clipboard from 'svelte-clipboard';
    import QrCode from 'svelte-qrcode';
    import {toast} from 'svelte-sonner';
    import {onMount} from 'svelte';

    sessionToken.useLocalStorage();
    userData.useLocalStorage();

    let copied = false;

    onMount(() => {
        document.dispatchEvent(new CustomEvent('onboarding-checklist-event', {detail: {key: 'create_membership'}}));
    });
</script>

<div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}} class="d-flex flex-column-fluid">
    <div class="px-2 px-md-24 col-12 col-md-10 mx-auto rounded-lg" style="max-width: 65rem;">
        <h2 class="font-weight-boldest text-center mt-10 mb-10">Condividi il link iscrizioni</h2>
        <div class="alert alert-custom alert-light-info fade show mb-2 rounded-lg" role="alert">
            <div class="alert-icon">
                <Question size="32" weight="duotone" class="text-info" />
            </div>
            <div class="alert-text font-weight-boldest rounded-lg">
                Condividi il seguente link con i tuoi soci per farli iscriversi online. <br />
                Possono anche creare un account e scaricare le ricevute.
            </div>
            <div class="alert-close">
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">
                        <i class="ki ki-close" />
                    </span>
                </button>
            </div>
        </div>

        <div class="d-flex justify-content-center flex-column pt-4">
            <div style="text-align: center" id="qr-code-subscriptions">
                <QrCode value="{__bakney.env.DOMAIN}/#/subscribe/{String($userData.username).toLowerCase()}" />
            </div>
            <h3 class="p-4 text-center font-size-h4 font-weight-boldest">
                Condividi o stampa il QR code e<br />
                fai iscrivere i soci e tesserati digitalmente.
            </h3>
        </div>
        <div class="input-group row">
            <!-- svelte-ignore missing-declaration -->
            <div class="col-12 input-group link-share-group mb-4">
                <Clipboard
                    text="{__bakney.env.DOMAIN}/#/subscribe/{String($userData.username).toLowerCase()}"
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
                        style="pointer-events: none;border-radius: .75rem 0 0 .75rem !important;"
                        value="{__bakney.env.DOMAIN}/#/subscribe/{String($userData.username).toLowerCase()}" />
                    <div class="input-group-append">
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-missing-attribute -->
                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                        <a
                            on:click={copy}
                            class="btn btn-primary"
                            style="border-radius: 0 .55rem .55rem 0;"
                            data-clipboard="true"
                            data-clipboard-target="#kt_clipboard_1">
                            <Copy size={16} weight="duotone" />
                        </a>
                    </div>
                </Clipboard>

                <button
                    type="button"
                    class="btn btn-dark btn-icon font-weight-boldest d-flex align-items-center ml-2 mb-0"
                    on:click={() => {
                        window.open(
                            `${__bakney.env.DOMAIN}/#/subscribe/${String($userData.username).toLowerCase()}`,
                            '_blank'
                        );
                    }}>
                    <ArrowSquareOut size="20" weight="duotone" />
                </button>
            </div>

            <div class="d-flex mt-4 mx-auto m-md-auto">
                <button
                    type="button"
                    style="background-color: #22ceba; border-color: #22ceba;"
                    class="btn btn-sm btn-primary font-weight-boldest d-flex align-items-center mb-0 ml-2"
                    on:click={() => {
                        window.open(
                            `https://api.whatsapp.com/send/?text=` +
                                encodeURIComponent(
                                    `Ciao 👋\nQuesto è il link per iscriverti all'associazione *${
                                        $userData.sport_association.denomination
                                    }*:\n\n${__bakney.env.DOMAIN}/#/subscribe/${String(
                                        $userData.username
                                    ).toLowerCase()}\n\nSe non hai ancora un account puoi crearne uno. Avrai tutto a portata di mano: iscrizioni, pagamenti online (corsi/iscrizioni/carnet) e ricevute. \n\nCordiali saluti,\n${
                                        $userData.sport_association.denomination
                                    }`
                                )
                        );
                    }}><WhatsappLogo size="20" weight="duotone" class="mr-2" />Whatsapp</button>
                <button
                    type="button"
                    class="btn btn-sm btn-primary font-weight-boldest d-flex align-items-center ml-2 mb-0"
                    on:click={() => {
                        window.open(
                            "mailto:user@example.com?subject=Compila il modulo d'iscrizione&body=" +
                                encodeURIComponent(
                                    `Ciao,\nQuesto è il link per iscriverti all'associazione ${
                                        $userData.sport_association.denomination
                                    }:\n\n${__bakney.env.DOMAIN}/#/subscribe/${String(
                                        $userData.username
                                    ).toLowerCase()}\n\nSe non hai ancora un account puoi crearne uno. Avrai tutto a portata di mano: iscrizioni, pagamenti online (corsi/iscrizioni/carnet) e ricevute. \n\nCordiali saluti,\n${
                                        $userData.sport_association.denomination
                                    }`
                                )
                        );
                    }}><PaperPlaneRight size="20" weight="fill" class="mr-2" />Invia Email</button>

                <button
                    type="button"
                    class="btn btn-sm btn-primary font-weight-boldest d-flex align-items-center ml-2 mb-0"
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
                        ).toLowerCase()}
                                                    </div>
                                            </div>
                                        </div>
                                    </body>
                                </html>
                            `);
                        printWindow.document.close();
                        printWindow.focus();
                        printWindow.print();
                    }}><Printer size="20" weight="fill" class="mr-2" />Stampa QR code</button>
            </div>
        </div>
    </div>
</div>
