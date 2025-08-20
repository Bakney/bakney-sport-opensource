<script>
    import {userData} from 'store/stores.js';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import Portal from 'svelte-portal';
    import Clipboard from 'svelte-clipboard';
    import {WhatsappLogo, PaperPlaneRight, Printer, Copy, PaperPlaneTilt, EnvelopeSimple} from 'phosphor-svelte';
    import {toast} from 'svelte-sonner';

    userData.useLocalStorage();

    export let id;
    export let row;
    export let pdfLink;
    export let title = 'Condividi link ricevuta';
    export let whatsappMessage = `Ciao 👋\nQuesto è il link per scaricare la tua ricevuta di *${parseFloat(
        parseFloat(row.membership_fee) + parseFloat(row.activity_fee)
    ).toLocaleString('it-IT', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })} €*:\n\n${pdfLink}
        \n\nCordiali saluti,\n${$userData.sport_association.denomination}`;
    export let sendClientEmailCallback = async () => {
        window.open(
            `mailto:${row.payment.associate.email || ''}?subject=Ecco la ricevuta di ${parseFloat(
                parseFloat(row.membership_fee) + parseFloat(row.activity_fee)
            ).toLocaleString('it-IT', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}€ di ${$userData.sport_association.denomination} &body=` +
                encodeURIComponent(`Ciao,\nQuesto è il link per scaricare la tua ricevuta di ${parseFloat(
                    parseFloat(row.membership_fee) + parseFloat(row.activity_fee)
                ).toLocaleString('it-IT', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })}€:\n\n${pdfLink}\n\n
            \n\nCordiali saluti,\n${$userData.sport_association.denomination}`)
        );
    };

    export let showSendEmailButton = true;
    export let sendEMailCallback = async () => {
        let res = await apiFetch(replaceUID(__bakney.env.API.INVOICE.SEND, id), {
            method: 'POST',
        });

        if (res.status == 200) {
            toast.success('Inviato con successo.');
        } else {
            toast.error("Errore durante l'invio.");
        }
    };

    let copied = false;
</script>

<!-- svelte-ignore missing-declaration -->
<Portal target="#portal-elements-foreground">
    <!-- Modal-->
    <form class="form" id="form_edit_{id}">
        <div
            class="modal fade"
            id="shareModal-{id}"
            tabindex="-1"
            role="dialog"
            aria-labelledby="staticBackdrop"
            aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" role="document">
                <div class="modal-content">
                    <div class="modal-header border-0 pb-0">
                        <h5 class="modal-title" id="exampleModalLabel">{title}</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <i aria-hidden="true" class="ki ki-close" />
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="input-group link-share-group">
                            <!-- svelte-ignore missing-declaration -->
                            <Clipboard
                                text={pdfLink}
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
                                    value={pdfLink} />
                                <div class="input-group-append">
                                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                                    <!-- svelte-ignore a11y-missing-attribute -->
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
                        </div>
                    </div>
                    <div class="modal-footer border-0 pt-0 d-flex justify-content-between">
                        <div class="d-flex">
                            <button
                                type="button"
                                style="background-color: #22ceba; border-color: #22ceba;"
                                class="btn btn-primary font-weight-bold d-flex align-items-center"
                                on:click={() => {
                                    window.open(
                                        `https://api.whatsapp.com/send/?text=` + encodeURIComponent(whatsappMessage)
                                    );
                                }}
                                ><WhatsappLogo size="20" weight="fill" class="mr-0 mr-md-2" />
                                <span class="d-none d-md-block">WhatsApp</span>
                            </button>
                            <button
                                type="button"
                                class="btn btn-primary font-weight-bold d-flex align-items-center ml-2"
                                on:click={sendClientEmailCallback}
                                ><EnvelopeSimple size="20" weight="fill" class="mr-0 mr-md-2" />
                                <span class="d-none d-md-block">Email</span>
                            </button>
                            {#if showSendEmailButton}
                                <button
                                    type="button"
                                    class="btn btn-primary font-weight-bold d-flex align-items-center ml-2"
                                    on:click={sendEMailCallback}
                                    ><PaperPlaneTilt size="20" weight="fill" class="mr-0 mr-md-2" />
                                    <span class="d-none d-md-block">Invia</span>
                                </button>
                            {/if}
                        </div>
                        <button type="button" class="btn mt-0 btn-secondary font-weight-bold" data-dismiss="modal"
                            >Chiudi</button>
                    </div>
                </div>
            </div>
        </div>
    </form>
</Portal>
