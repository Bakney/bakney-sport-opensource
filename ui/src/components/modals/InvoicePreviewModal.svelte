<script>
    import BasicModal from './BasicModal.svelte';
    import {userData} from 'store/stores.js';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import Clipboard from 'svelte-clipboard';
    import {WhatsappLogo, PaperPlaneRight, Printer, Copy, PaperPlaneTilt, EnvelopeSimple} from 'phosphor-svelte';
    import {onDestroy, onMount} from 'svelte';
    import {toast} from 'svelte-sonner';

    export let id;
    export let title = 'Anteprima Ricevuta';
    export let cancelButton = 'Chiudi';
    export let actionButton = 'Conferma';
    export let dataHeight = 'auto';
    export let fullHeight = true;
    export let pdfLink;
    export let row;
    export let target = null;
    let show = true;
    let showFooter = true;
    let modalSize = 'xl';
    let scrollable = false;
    let showCancelButton = true;
    let showActionButton = false;
    let alignFooterCenter = false;
    let copied = false;

    onMount(() => {
        // set body overflow hidden and body height 100vh when modal is open
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100vh';
    });

    function clearBody() {
        document.body.style = 'overflow:auto;';
    }

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
    on:cancel={clearBody}
    on:confirm={clearBody}>
    <div class="my-4">
        <h1>{title}</h1>
    </div>
    <iframe
        {title}
        src={pdfLink}
        style="width: 100%; min-height: {KTUtil.isMobileDevice() ? '60svh' : '70svh'}; border: none;" />
    <div class="d-flex mt-2">
        <h6 class="mr-2">Condividi il link</h6>
    </div>
    <div class="input-group link-share-group mt-1">
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
    <div slot="footer" class="d-flex justify-content-center">
        <div class="d-flex">
            <button
                type="button"
                style="background-color: #22ceba; border-color: #22ceba;"
                class="btn btn-primary font-weight-bold d-flex align-items-center mb-0"
                on:click={() => {
                    window.open(
                        `https://api.whatsapp.com/send/?text=` +
                            encodeURIComponent(
                                `Ciao 👋\nQuesto è il link per scaricare la tua ricevuta di *${parseFloat(
                                    parseFloat(row.membership_fee) + parseFloat(row.activity_fee)
                                ).toLocaleString('it-IT', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })} €*:\n\n${pdfLink}
                                \n\nCordiali saluti,\n${$userData.sport_association.denomination}`
                            )
                    );
                }}
                ><WhatsappLogo size="20" weight="fill" class="mr-0 mr-md-2" />
                <span class="d-none d-md-block">WhatsApp</span>
            </button>
            <button
                type="button"
                class="btn btn-primary font-weight-bold d-flex align-items-center ml-2 mb-0"
                on:click={() => {
                    window.open(
                        `mailto:${row.payment.associate.email || ''}?subject=Ecco la ricevuta di ${parseFloat(
                            parseFloat(row.membership_fee) + parseFloat(row.activity_fee)
                        ).toLocaleString('it-IT', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}€ di ${$userData.sport_association.denomination} &body=` +
                            encodeURIComponent(
                                `Ciao,\nQuesto è il link per scaricare la tua ricevuta di ${parseFloat(
                                    parseFloat(row.membership_fee) + parseFloat(row.activity_fee)
                                ).toLocaleString('it-IT', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}€:\n\n${pdfLink}\n\n
                                \n\nCordiali saluti,\n${$userData.sport_association.denomination}`
                            )
                    );
                }}
                ><EnvelopeSimple size="20" weight="fill" class="mr-0 mr-md-2" />
                <span class="d-none d-md-block">Email</span>
            </button>
            <button
                type="button"
                class="btn btn-primary font-weight-bold d-flex align-items-center ml-2 mb-0"
                on:click={async () => {
                    let res = await apiFetch(replaceUID(__bakney.env.API.INVOICE.SEND, id), {
                        method: 'POST',
                    });

                    if (res.status == 200) {
                        toast.success('Inviato con successo.');
                    } else {
                        toast.error("Errore durante l'invio.");
                    }
                }}
                ><PaperPlaneTilt size="20" weight="fill" class="mr-0 mr-md-2" />
                <span class="d-none d-md-block">Invia</span>
            </button>
        </div>
    </div>
</BasicModal>
