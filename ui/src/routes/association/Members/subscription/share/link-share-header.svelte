<script>
    import QrCode from 'svelte-qrcode';
    import {Clipboard, ShareNetwork} from 'phosphor-svelte';
    import {toast} from 'svelte-sonner';

    import {sessionToken, userData} from 'store/stores';
    import ShareModuleSubscriptionLink from 'components/modals/ShareModuleSubscriptionLink.svelte';
    import ShareModuleMultipleSubscriptionLink from 'components/modals/ShareModuleMultipleSubscriptionLink.svelte';

    sessionToken.useLocalStorage();
    userData.useLocalStorage();

    let copied = false;
</script>

<div
    class="mx-0 d-flex flex-column w-100 flex-md-row align-items-center justify-content-between px-3 py-3 border rounded-xl">
    <QrCode
        value="{__bakney.env.DOMAIN}/#/subscribe/{String($userData.username).toLowerCase()}"
        size={KTUtil.isMobileDevice() ? 120 : 80} />
    <div class="px-4 text-center text-md-left">
        <h3 class="py-4 py-md-0 font-size-h3 font-weight-bolder">Condividi il link per raccogliere le iscrizioni</h3>
        <a
            href="{__bakney.env.DOMAIN}/#/subscribe/{String($userData.username).toLowerCase()}"
            target="_blank"
            class="py-4 py-md-0 text-primary font-size-xl font-weight-bold">
            {__bakney.env.DOMAIN}/#/subscribe/{String($userData.username).toLowerCase()}
        </a>
    </div>
    <div class="d-flex align-items-center">
        <button
            class="btn btn-icon btn-sm btn-dark mr-0 mr-md-4 mb-0 mt-4 mt-md-0 font-weight-bolder font-size-lg"
            on:click={() => {
                navigator.clipboard.writeText(
                    `${__bakney.env.DOMAIN}/#/subscribe/${String($userData.username).toLowerCase()}`
                );
                toast.success('Link copiato nella clipboard');
            }}>
            <Clipboard size={18} weight="duotone" />
        </button>
        <button
            class="btn btn-icon btn-sm btn-primary mr-0 mr-md-4 mb-0 mt-4 mt-md-0 font-weight-bolder font-size-lg"
            on:click={() => {
                let modal = new ShareModuleSubscriptionLink({
                    target: document.body,
                    props: {
                        show: true,
                    },
                });
            }}>
            <ShareNetwork size="18" weight="duotone" />
        </button>
    </div>
</div>
{#if $userData?.preview_and_custom_features?.find(x => x.name === 'Iscrizioni multiple per federazioni') !== undefined}
    <div
        class="mx-0 d-flex flex-column w-100 flex-md-row align-items-center justify-content-between px-3 py-3 border border-dashed rounded-xl mt-4">
        <QrCode
            value="{__bakney.env.DOMAIN}/#/subscribe-multiple/{String($userData.username).toLowerCase()}"
            size={KTUtil.isMobileDevice() ? 120 : 80} />
        <div class="px-4 text-center text-md-left">
            <h3 class="py-4 py-md-0 font-size-h3 font-weight-bolder">Condividi il link per le iscrizioni multiple</h3>
            <a
                href="{__bakney.env.DOMAIN}/#/subscribe-multiple/{String($userData.username).toLowerCase()}"
                target="_blank"
                class="py-4 py-md-0 text-primary font-size-xl font-weight-bold">
                {__bakney.env.DOMAIN}/#/subscribe-multiple/{String($userData.username).toLowerCase()}
            </a>
        </div>
        <div class="d-flex align-items-center">
            <button
                class="btn btn-icon btn-sm btn-dark mr-0 mr-md-4 mb-0 mt-4 mt-md-0 font-weight-bolder font-size-lg"
                on:click={() => {
                    navigator.clipboard.writeText(
                        `${__bakney.env.DOMAIN}/#/subscribe-multiple/${String($userData.username).toLowerCase()}`
                    );
                    toast.success('Link copiato nella clipboard');
                }}>
                <Clipboard size={18} weight="duotone" />
            </button>
            <button
                class="btn btn-icon btn-sm btn-primary mr-0 mr-md-4 mb-0 mt-4 mt-md-0 font-weight-bolder font-size-lg"
                on:click={() => {
                    let modal = new ShareModuleMultipleSubscriptionLink({
                        target: document.body,
                        props: {
                            show: true,
                        },
                    });
                }}>
                <ShareNetwork size="18" weight="duotone" />
            </button>
        </div>
    </div>
{/if}
