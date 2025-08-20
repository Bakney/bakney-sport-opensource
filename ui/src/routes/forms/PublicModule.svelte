<script>
    import ModuleRender from 'components/formBuilder/module-render.svelte';
    import {CheckCircle, Copy, SmileyMeh, SmileyWink, TrashSimple} from 'phosphor-svelte';
    import {sessionToken, userData} from 'store/stores';
    import * as easing from 'svelte/easing';
    import {onMount} from 'svelte';
    import {link, push} from 'svelte-spa-router';
    import {scale} from 'svelte/transition';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import {getDataFromForm} from 'utils/Functions';
    import SimpleButton from 'components/buttons/simple-button.svelte';
    import XCircle from 'components/buttons/XCircle.svelte';
    import {toast} from 'svelte-sonner';

    userData.useLocalStorage();
    sessionToken.useLocalStorage();

    export let params = {};

    let res;
    let showSubmit = false;
    let alreadyResponed = false;

    onMount(async () => {
        await fetchInfo();
    });
    async function fetchInfo() {
        let query = '';
        if (params.response_id) {
            alreadyResponed = true;
            query = `?response_id=${params.response_id}`;
        }
        res = await apiFetch(replaceUID(__bakney.env.API.MODULES.CUSTOM_LINK_INFO, params.custom_link) + query);
    }

    function checkLogin() {
        // check that user is logged in by checking local storage for:
        // - sessionToken
        // - isExpired
        // - userData
        // - refreshToken
        // - expires

        if (localStorage.getItem('sessionToken') && localStorage.getItem('isExpired') === 'false') {
            location.reload();
        } else {
            // if not logged in, open window to login page and wait until the session token is set
            // then close the window and continue
            const loginWindow = window.open(
                `${window.location.origin}/#/login?redirect=${window.location.pathname}`,
                'Login',
                'width=600,height=600'
            );

            const interval = setInterval(() => {
                if (localStorage.getItem('sessionToken') && localStorage.getItem('isExpired') === 'false') {
                    clearInterval(interval);
                    loginWindow.close();
                    location.reload();
                }
            }, 1000);
        }
    }

    async function submitForm(e) {
        e.preventDefault();

        let addRes = await apiFetch(replaceUID(__bakney.env.API.MODULES.RESPONSE.ADD, res?.response?.data?.module_id), {
            method: 'POST',
            body: JSON.stringify(getDataFromForm(e)),
        });

        if (addRes.status == 200) {
            showSubmit = true;
            push(`/forms/${params.custom_link}/${addRes.response.module_response_id}`);
        } else {
            toast.error('Qualcosa è andato storto, riprova.');
        }
    }

    async function addAttachments(e) {
        const fileInput = e.target;

        const file = fileInput.files[0];
        const base64 = await toBase64(file);
        const filename = file.name;

        let addRes = await apiFetch(replaceUID(__bakney.env.API.MODULES.RESPONSE.ADD_ATTACHMENT, params?.response_id), {
            method: 'POST',
            body: JSON.stringify({
                filename,
                base64,
            }),
        });

        if (addRes.status == 200) {
            toast.success('Allegato aggiunto con successo.');
        } else {
            toast.error('Qualcosa è andato storto, riprova.');
        }
        fetchInfo();
    }

    async function removeAttachment(document_id) {
        let removeRes = await apiFetch(
            replaceUID(__bakney.env.API.MODULES.RESPONSE.ADD_ATTACHMENT, params?.response_id),
            {
                method: 'DELETE',
                body: JSON.stringify({
                    document_id: document_id,
                }),
            }
        );

        if (removeRes.status == 200) {
            toast.success('Allegato rimosso con successo.');
        } else {
            toast.error('Qualcosa è andato storto, riprova.');
        }
        fetchInfo();
    }
</script>

<!-- <pre>
{JSON.stringify(res, null, 2)}
</pre> -->

<div in:scale={{duration: 350, start: 0.96, easing: easing.cubicInOut}}>
    <div
        class="bg-primary pb-20"
        style="color: rgb(255, 255, 255); background-image: url(/static/forms/pattern.png);background-size: cover;">
        <div class="d-flex align-items-center justify-content-between">
            <div class="align-items-center d-flex p-4">
                <a href={__bakney.OEM_CONFIG?.url} target="_blank">
                    <img
                        class="h-20px"
                        alt="logo {__bakney?.OEM_CONFIG?.name}"
                        src={__bakney.OEM_CONFIG?.logo}
                        style="filter:brightness(100)" />
                </a>
            </div>
        </div>
        <div class="mx-auto w-100 w-md-50 px-12" style="min-width: 75% !important;">
            <div class="py-2">
                <div style="display: flex; flex-direction:column; align-items: center; justify-content:center;">
                    <div class="symbol symbol-light-info symbol-100 symbol-circle" style="margin: auto;">
                        <span class="symbol-label font-weight-bold" style="font-size: 4.5rem !important;">
                            {res?.response?.data?.sport_association?.denomination?.slice(0, 2) || ':('}
                        </span>
                    </div>
                </div>

                <div style="display: flex; flex-direction:column; align-items: center; justify-content:center;">
                    <h1 class="text-center mt-10">
                        <span class="font-size-md font-weight-semibold"
                            >{res?.response?.data?.sport_association?.denomination || 'Ops...'}</span
                        ><br />
                        <span class="font-weight-boldest" style="font-size: 3.2rem; line-height: 1.2;">
                            {res?.response?.data?.title || 'Nessun modulo trovato'}</span>
                    </h1>
                </div>
            </div>
            <p class="m-auto text-center font-size-h6 pb-10">
                Compila il modulo con le informazioni richieste, <br />
                poi clicca su <b>"Invia"</b> per mandare il modulo.
            </p>
        </div>
    </div>
    {#if showSubmit || alreadyResponed}
        <div class="d-flex justify-content-center align-items-center mt-24 mb-24">
            <div class="text-center border py-6 px-8 rounded-xl mx-4" style="max-width: 100%;">
                <CheckCircle size={84} class="text-success mb-6" weight="duotone" />
                <h2 class="font-weight-bolder">Modulo inviato</h2>
                <div class="mt-4 mb-8">
                    <div>
                        {@html res?.response?.data?.response_message
                            ? res?.response?.data?.response_message
                            : 'Grazie, la tua risposta è stata registrata nei nostri sistemi.'}
                    </div>

                    {#if res?.response?.data?.allow_attachments}
                        <div class="form-group my-14 col-12 col-md-8 mx-auto">
                            <label for="customFile" class="font-weight-bolder">Aggiungi un file alla risposta</label>
                            <div />
                            <div class="custom-file">
                                <input
                                    type="file"
                                    class="custom-file-input"
                                    id="customFile"
                                    on:change={addAttachments} />
                                <label class="custom-file-label" for="customFile">Scegli file</label>
                            </div>
                        </div>

                        <div class="mt-12">
                            <h3 class="font-weight-boldest">Allegati</h3>
                        </div>
                        {#if res?.response?.response_data?.attachments_docs}
                            {#each res?.response?.response_data?.attachments_docs as attachment}
                                <div
                                    class="d-flex align-items-center justify-content-between py-2 px-4 border rounded-lg mt-2">
                                    <span class="font-weight-boldest">{attachment.filename}</span>
                                    <XCircle
                                        on:open={() => {
                                            removeAttachment(attachment.document_id);
                                        }}
                                        popover_text="Elimina allegato" />
                                </div>
                            {/each}
                        {:else}
                            <div class="d-flex py-2 px-4 border rounded-lg mt-2">
                                <span class="font-weight-boldest">Nessun allegato</span>
                            </div>
                        {/if}

                        <div class="d-flex flex-column my-12">
                            <span class="font-weight-bold">Per allegare un file in seguito salva questo link</span>
                            <div class="d-flex mx-auto mt-4">
                                <input
                                    style="max-width: 30rem;width: 30rem;"
                                    class="input-group-text input-group-text-sm border-0 bg-light font-weight-bold font-size-sm"
                                    type="text"
                                    value="{window.location.origin}/#/forms/{params.custom_link}/{params.response_id}"
                                    href={`/#/forms/${params.custom_link}/${params.response_id}`}
                                    target="_blank" />
                                <!-- copy to clipboard btn -->
                                <button
                                    on:click={() => {
                                        navigator.clipboard.writeText(
                                            `${window.location.origin}/#/forms/${params.custom_link}/${params.response_id}`
                                        );
                                        toast.success('Link copiato negli appunti.');
                                    }}
                                    class="btn btn-sm btn-primary btn-icon mb-0 ml-2">
                                    <Copy size={14} weight="duotone" />
                                </button>
                            </div>
                        </div>
                    {/if}
                </div>
                <button
                    class="btn btn-dark font-weight-bolder"
                    on:click={() => {
                        history.pushState({}, '', `/#/forms/${params.custom_link}`);
                        window.location.reload();
                    }}>
                    Invia un'altra risposta
                </button>
            </div>
        </div>
    {:else if res?.status == 200 && res?.response?.data?.only_users && !$sessionToken}
        <div class="d-flex flex-column justify-content-center align-items-center mt-24">
            <div class="symbol symbol-light-info symbol-100 symbol-circle">
                <SmileyWink size={84} class="text-info mb-4" weight="duotone" />
            </div>
            <h4 class="text-center mb-4 font-weight-boldest">
                Per poter compilare il seguente modulo <br />hai bisogno di un account.
            </h4>

            <button
                type="button"
                class="btn btn-sm btn-primary font-weight-bolder font-size-h6 px-8 py-4 my-3 mr-4"
                on:click={checkLogin}>
                CREA o ACCEDI con l'account
            </button>
        </div>
    {:else if res?.status == 404}
        <h3 class="text-center mt-24 font-weight-bolder">
            <SmileyMeh size={84} class="text-dark mb-4" weight="duotone" />
            <br />
            Ricontrolla l'URL e riprova. <br />
            Il modulo potrebbe non essere più attivo.
        </h3>
        <div class="d-flex justify-content-center align-items-center mt-6">
            <SimpleButton
                on:click={() => {
                    history.pushState({}, '', `/#/forms/${params.custom_link}`);
                    window.location.reload();
                }}>
                Ricarica la pagina
            </SimpleButton>
        </div>
    {:else if res?.status == 200}
        <form on:submit={submitForm} style="margin-top: -8rem;">
            <ModuleRender bind:elements={res.response.data.elements} />
        </form>
    {:else}
        <h3 class="text-center mt-24 font-weight-bolder text-dark">
            <SmileyMeh size={84} class="text-dark mb-4" weight="duotone" />
            <br />
            Errori nel caricamento del modulo.
        </h3>
        <div class="d-flex justify-content-center align-items-center mt-6">
            <SimpleButton
                on:click={() => {
                    history.pushState({}, '', `/#/forms/${params.custom_link}`);
                    window.location.reload();
                }}>
                Ricarica la pagina
            </SimpleButton>
        </div>
    {/if}
</div>

<svelte:head>
    <style>
        body,
        .offcanvas-right {
            border-left: 0 !important;
        }
    </style>
</svelte:head>
