<script>
    import {v4 as uuidv4} from 'uuid';
    import {sessionToken} from 'store/stores.js';
    import {scale, slide} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import Portal from 'svelte-portal';
    import {onDestroy, onMount} from 'svelte';
    import {
        ArrowDown,
        ChatDots,
        ClockCountdown,
        EnvelopeSimple,
        Bell,
        Pencil,
        PlayCircle,
        PlusCircle,
        Trash,
        WarningOctagon,
    } from 'phosphor-svelte';
    import {push} from 'svelte-spa-router';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import {canPerformAction} from 'utils/Permissions';
    import {toast} from 'svelte-sonner';
    import StepDrawer from './StepDrawer.svelte';

    sessionToken.useLocalStorage();

    export let params = {};

    let triggerAvailable = true;
    let tags = [];
    let automationTree = [
        {
            id: 'trigger',
            label: 'Evento di attivazione',
            value: 'cron',
            data: {},
        },
    ];
    let automationData = {
        enabled: false,
        onlyView: false,
    };
    let name = 'Nuova Automazione';
    let editingName = false;
    let isNewAutomation = true;

    const triggerMap = {
        cron: 'Data e ora specifica',
        new_subscription: 'Nuova iscrizione',
        subscription_signed: 'Iscrizione firmata',
        subscription_approved: 'Iscrizione approvata',
    };

    function fetchData() {
        apiFetch(replaceUID(__bakney.env.API.COMMUNICATIONS.WORKFLOWS.DETAILS, params.workflow_id), {
            method: 'GET',
        }).then(res => {
            if (res.status == 200) {
                isNewAutomation = false;
                name = res.response.name;
                automationTree = [...res.response.automation_tree];
                automationData = res.response;
            }
        });
    }

    onMount(() => {
        // disable page scroll
        document.body.style.overflow = 'hidden';
        // fetch tags
        apiFetch(__bakney.env.API.SUBSCRIPTION.TAGS.LIST, {
            method: 'GET',
        }).then(res => {
            if (res.status == 200) {
                tags = [...res.response?.tags];
            }
        });

        if (params?.workflow_id) {
            fetchData();
        }
    });

    onDestroy(() => {
        // enable page scroll
        document.body.style.overflow = 'auto';
    });

    function addEvent(type) {
        if (type == 'wait') {
            automationTree = [
                ...automationTree,
                {
                    id: 'wait',
                    label: 'Attendi',
                    value: 'wait',
                    data: {
                        blockId: uuidv4(),
                        amount: 5,
                        type: 'minutes',
                    },
                },
            ];
        } else {
            automationTree = [
                ...automationTree,
                {
                    id: 'message',
                    label: 'Messaggio',
                    value: 'email',
                    data: {
                        blockId: uuidv4(),
                        recipients: 'athletes',
                        subject: '',
                        content: '',
                        json: {
                            root: {
                                type: 'EmailLayout',
                                data: {
                                    backdropColor: '#F5F5F5',
                                    canvasColor: '#FFFFFF',
                                    textColor: '#262626',
                                    fontFamily: 'MODERN_SANS',
                                    childrenIds: [],
                                },
                            },
                        },
                    },
                },
            ];
        }
    }

    function deleteNode(idx) {
        automationTree = [
            ...automationTree.filter((x, id) => {
                return idx != id;
            }),
        ];
    }

    async function save() {
        let url = __bakney.env.API.COMMUNICATIONS.WORKFLOWS.ADD;
        if (!isNewAutomation) {
            url = replaceUID(__bakney.env.API.COMMUNICATIONS.WORKFLOWS.UPDATE, params?.workflow_id);
            isNewAutomation = false;
        }
        let res = await apiFetch(
            url,
            {
                method: isNewAutomation ? 'POST' : 'PATCH',
                body: JSON.stringify({
                    automation_tree: automationTree,
                    name: name,
                }),
            },
            true
        );
        if (res.response?.workflow_id) {
            params.workflow_id = res.response.workflow_id;
        }
        if (res.status == 200) {
            toast.success('Automazione aggiornata con successo.');
        } else {
            toast.error('Si è verificato un errore durante il salvataggio.');
        }

        await fetchData();
    }

    // function handleClick(e) {
    //     const {detail} = e;
    //     detail.node.bgColor.set('red');
    // }
</script>

<Portal target="#portal-elements">
    <div class="card w-full" style="height: 100vh;">
        <div class="px-4 py-2 d-flex align-items-center">
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <span class="font-weight-boldest d-flex align-items-center" style="font-size: 1.8rem">
                <Pencil size="24" weight="duotone" class="mr-2" />
                <div
                    id="automation-name"
                    contenteditable="true"
                    style="border: 1px solid #ebedf3; border-radius: 0.55rem; padding: 0 0.5rem;"
                    on:click={() => {
                        // select all the inner text
                        document.getElementById('automation-name').focus();
                        try {
                            document.execCommand('selectAll', false, null);
                        } catch (e) {
                            console.warning(e);
                        }
                    }}
                    on:keyup={e => {
                        name = document.getElementById('automation-name').innerText;
                        if (e.key == 'Enter') {
                            editingName = false;
                        }
                    }}>
                    {name}
                </div>
            </span>
        </div>
        <div class="px-4 pb-2">
            <p class="font-weight-bold font-size-lg m-0">
                Scegli un nodo trigger e uno o più nodi azione per creare un'automazione. Potrai inserire solo un nodo
                trigger per automazione.
            </p>
        </div>
        <div style="display:none!important;" class="px-4 py-2 d-flex align-items-center">
            <button
                disabled={!triggerAvailable}
                draggable={false}
                on:click={e => {
                    e.preventDefault();
                    automationTree = [
                        {
                            id: 'trigger',
                            label: 'Evento',
                            bgColor: 'dark',
                            tree: true,
                            bgColor: '#fff',
                            textColor: '#000',
                        },
                    ];
                    triggerAvailable = false;
                }}
                class="btn btn-sm btn-dark font-weight-boldest mr-2 mb-0 mt-0 d-flex align-items-center"
                ><PlayCircle size="18" class="mr-2" weight="duotone" />Evento</button>
            <button
                disabled={triggerAvailable || automationTree.length == 2}
                on:click={e => {
                    e.preventDefault();
                    automationTree = [
                        ...automationTree,
                        {
                            id: 'sms',
                            connections: [],
                            label: 'SMS',
                            bgColor: '#fff',
                            tree: true,
                        },
                    ];
                }}
                class="btn btn-sm btn-primary font-weight-boldest mr-2 mb-0 mt-0 d-flex align-items-center"
                ><ChatDots size="18" class="mr-2" weight="duotone" />SMS</button>
            <button
                disabled={triggerAvailable || automationTree.length == 2}
                on:click={e => {
                    e.preventDefault();
                    automationTree = [
                        ...automationTree,
                        {
                            id: 'email',
                            connections: [],
                            label: 'Email',
                            bgColor: '#fff',
                            tree: true,
                        },
                    ];
                }}
                class="btn btn-sm btn-primary font-weight-boldest mr-2 mb-0 mt-0 d-flex align-items-center"
                ><EnvelopeSimple size="18" class="mr-2" weight="duotone" />Email</button>
        </div>
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        {#if automationData?.enabled && !automationData?.onlyView}
            <div
                class="w-100 d-flex flex-column jusity-content-center align-items-center bg-white py-12"
                style="position:absolute;z-index:999;top:40vh">
                <WarningOctagon size={42} weight="duotone" class="mx-auto text-danger my-2" />
                <h2 class="font-weight-boldest text-center text-dark">
                    L'automazione è in esecuzione, <br /> per modificarla disattivala.
                </h2>
                <p class="font-size-lg text-center text-dark-75">
                    Se apporti modifiche in modalità sola lettura non potrai salvarle.
                </p>
                <div>
                    <!-- button to view it in view mode -->
                    <button
                        on:click={() => {
                            automationData.onlyView = true;
                        }}
                        class="btn btn-primary font-weight-boldest mt-4">Visualizza in sola lettura</button>
                </div>
            </div>
        {/if}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
            on:dragover|preventDefault
            class="m-0 m-md-4 h-100 py-4 px-2"
            style="border-radius: 0.55rem; border: 1px solid
            #EBEDF3;margin-top:0!important;overflow-y:auto;
            {!automationData?.enabled || automationData?.onlyView
                ? ''
                : 'opacity:0.5;pointer-events:none;filter: blur(3px)'}
            ">
            <div class="pt-md-8">
                {#each automationTree as node, idx}
                    {#if node.id == 'trigger'}
                        <div
                            style="width: fit-content;min-width: 20rem;"
                            class="d-flex flex-column justify-content-center align-items-center py-4 px-6 mx-auto border rounded-lg shadow-xs">
                            <div class="d-flex align-items-center justify-content-center mt-4">
                                <div
                                    class="d-flex align-items-center justify-content-center bg-dark rounded-circle"
                                    style="width: 3rem; height: 3rem;">
                                    <PlayCircle size="24" class="text-white" weight="duotone" />
                                </div>
                            </div>
                            <div class="d-none d-md-block text-center mb-4 mt-4">
                                <h6 class="font-weight-boldest m-0">Evento di attivazione</h6>
                            </div>
                            <div class="d-flex align-items-center mb-6">
                                <div class="text-center bg-light-success border border-success rounded-xl py-1 px-4">
                                    <span class="font-weight-boldest text-dark">
                                        {triggerMap[node.value] || node.value}
                                    </span>
                                </div>
                            </div>
                            <button
                                on:click={() => {
                                    node.isDrawerOpen = true;
                                }}
                                class="btn btn-sm btn-dark font-weight-boldest mb-0">
                                Configura
                            </button>
                        </div>
                        <StepDrawer
                            bind:isOpen={node.isDrawerOpen}
                            title="Evento di attivazione"
                            on:close={() => {
                                delete node.isDrawerOpen;
                                if (!automationData.onlyView) {
                                    save();
                                }
                            }}>
                            <div
                                in:scale={{duration: 50, easing: easing.backOut}}
                                class="d-flex flex-column p-0 w-100 mx-auto">
                                <div class="d-flex flex-column justify-content-between align-items-center">
                                    <div class="d-flex flex-column align-items-center">
                                        <div class="d-flex align-items-center justify-content-center mt-4">
                                            <div
                                                class="d-flex align-items-center justify-content-center bg-light-primary rounded-circle"
                                                style="width: 3rem; height: 3rem;">
                                                <PlayCircle size="24" class="text-primary" weight="duotone" />
                                            </div>
                                        </div>
                                        <div class="d-none d-md-block text-center mb-4 mt-4">
                                            <h1 class="font-weight-boldest m-0">Evento di attivazione</h1>
                                            <p class="font-size-sm m-0 mt-2 text-dark-75">
                                                Seleziona un evento che attiva l'automazione. <br />
                                                Puoi inserire un <b>evento</b> specifico oppure una <b>data e ora</b> specifica.
                                            </p>
                                        </div>
                                        <div class="d-block d-md-none mr-4">
                                            <h2 class="font-weight-boldest m-auto">Evento</h2>
                                        </div>
                                    </div>
                                    <div class="d-flex align-items-center mb-2">
                                        <select bind:value={node.value} class="form-control form-control-sm mr-2 mb-0">
                                            <optgroup label="Eventi Generici">
                                                <option value="cron">Data e ora specifica</option>
                                            </optgroup>
                                            <optgroup label="Iscrizioni">
                                                <option value="new_subscription">Nuova iscrizione</option>
                                                <option value="subscription_signed">Iscrizione firmata</option>
                                                <option value="subscription_approved">Iscrizione approvata</option>
                                            </optgroup>
                                        </select>
                                    </div>
                                </div>
                                <hr class="w-100" />
                                {#if node.value != ''}
                                    {#if node.value == 'cron'}
                                        <div class="p-4 d-block d-md-flex">
                                            <!-- datetime -->
                                            <div class="col-12 col-md-3 p-0 pl-md-0 pr-md-2">
                                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                                <label class="font-weight-boldest">Data e ora</label>
                                                <input
                                                    bind:value={node.data.time}
                                                    type="datetime-local"
                                                    class="form-control form-control-sm" />
                                            </div>
                                            <div class="col-12 col-md-9 p-0 pr-md-0 pl-md-2">
                                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                                <label class="font-weight-boldest">Filtro</label>
                                                <select
                                                    bind:value={node.data.target}
                                                    class="form-control form-control-sm">
                                                    <option value="all">iscrizioni "Tutte"</option>
                                                    <option value="approved">iscrizioni "Approvate"</option>
                                                    <option value="rejected">iscrizioni "Rifiutate"</option>
                                                    <option value="pending">iscrizioni "In attesa"</option>
                                                    <option value="not_signed">iscrizioni "Modulo da firmare"</option>
                                                    <option value="archived">iscrizioni "Archiviate"</option>
                                                    {#each tags as tag}
                                                        <option value={tag.tag_id}>con tag "{tag.tag_name}"</option>
                                                    {/each}
                                                </select>
                                            </div>
                                        </div>
                                    {:else}
                                        <div
                                            style="outline: 1px solid #d6d8fc;"
                                            class="m-4 py-2 px-6 bg-light-info text-info font-weight-boldest rounded-lg border-top border-white">
                                            L'evento selezionato attiverà il prossimo passo. Il messaggio sarà inviato a
                                            te se scegli "Me Stesso" come destinatario, altrimenti all'atleta coinvolto.
                                        </div>
                                    {/if}
                                {/if}
                            </div>
                        </StepDrawer>
                    {:else if node.id == 'message'}
                        <div class="d-flex justify-content-center align-items-center py-4">
                            <div class="d-flex align-items-center justify-content-center">
                                <ArrowDown size="24" weight="bold" />
                            </div>
                        </div>
                        <div
                            style="width: fit-content;min-width: 20rem;"
                            class="d-flex flex-column justify-content-center align-items-center p-4 mx-auto border rounded-xl shadow-xs">
                            <div class="d-flex align-items-center justify-content-center mt-4">
                                <div
                                    class="d-flex align-items-center justify-content-center bg-light-primary rounded-circle"
                                    style="width: 3rem; height: 3rem;">
                                    {#if node.value == 'email'}
                                        <EnvelopeSimple size="20" class="text-primary" weight="duotone" />
                                    {:else if node.value == 'sms'}
                                        <ChatDots size="20" class="text-primary" weight="duotone" />
                                    {:else if node.value == 'push'}
                                        <Bell size="20" class="text-primary" weight="duotone" />
                                    {/if}
                                </div>
                            </div>
                            <div class="d-none d-md-block text-center mb-4 mt-4">
                                <h6 class="font-weight-boldest m-0">Invia un messaggio</h6>
                            </div>
                            <div class="d-flex align-items-center mb-6">
                                <div class="text-center bg-light-success border border-success rounded-xl py-1 px-4">
                                    <span class="font-weight-boldest text-dark">
                                        {#if node.value == 'email'}
                                            EMAIL
                                        {:else if node.value == 'sms'}
                                            SMS
                                        {:else if node.value == 'push'}
                                            NOTIFICA PUSH
                                        {:else}
                                            {node.value}
                                        {/if}
                                    </span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between w-100">
                                <!-- svelte-ignore a11y-click-events-have-key-events -->
                                <div
                                    on:click={() => {
                                        deleteNode(idx);
                                    }}
                                    class="btn btn-sm rounded-circle btn-icon btn-danger font-weight-boldest mb-0">
                                    <Trash size="16" weight="bold" />
                                </div>
                                <!-- svelte-ignore a11y-click-events-have-key-events -->
                                <div
                                    on:click={() => {
                                        node.isDrawerOpen = true;
                                    }}
                                    class="btn btn-sm btn-dark font-weight-boldest mb-0">
                                    Configura
                                </div>
                            </div>
                        </div>
                        <StepDrawer
                            bind:isOpen={node.isDrawerOpen}
                            title="Invia un messaggio"
                            on:close={() => {
                                delete node.isDrawerOpen;
                                if (!automationData.onlyView) {
                                    save();
                                }
                            }}>
                            <div
                                in:slide={{duration: 120, easing: easing.backOut}}
                                out:slide={{duration: 200, easing: easing.backIn}}
                                class="d-flex flex-column p-0 w-100 mx-auto">
                                <div class="d-flex flex-column justify-content-between align-items-center">
                                    <div class="d-flex flex-column align-items-center">
                                        <div class="d-flex align-items-center justify-content-center mt-4">
                                            <div
                                                class="d-flex align-items-center justify-content-center bg-light-primary rounded-circle"
                                                style="width: 3rem; height: 3rem;">
                                                <ChatDots size="20" class="text-primary" weight="duotone" />
                                            </div>
                                        </div>
                                        <div class="d-none d-md-block text-center mb-4 mt-4">
                                            <h1 class="font-weight-boldest m-0">Messaggio</h1>
                                            <p class="font-size-sm m-0 mt-2">
                                                Il messaggio che verrà inviato all'utente. <br />
                                                Puoi decidere se inviare un SMS o una email.
                                            </p>
                                        </div>
                                        <div class="d-block d-md-none mr-4">
                                            <h2 class="font-weight-boldest m-auto">Messaggio</h2>
                                        </div>
                                    </div>
                                    <div class="d-flex align-items-center">
                                        <select bind:value={node.value} class="form-control form-control-sm mr-2">
                                            <option value="email">Email</option>
                                            <option value="sms" disabled>SMS (in arrivo)</option>
                                            <option value="push" disabled>Notifica push (in arrivo)</option>
                                        </select>
                                    </div>
                                </div>
                                <hr class="w-100" />
                                {#if node.value != ''}
                                    <div class="p-4">
                                        {#if node.value == 'email'}
                                            <div class="d-flex flex-column flex-md-row align-items-center mb-4">
                                                <div class="d-flex flex-column col-12 col-md-2 p-0 pr-md-4">
                                                    <!-- svelte-ignore a11y-label-has-associated-control -->
                                                    <label class="font-weight-boldest">Destinatari</label>
                                                    <select
                                                        bind:value={node.data.recipients}
                                                        class="form-control form-control-sm">
                                                        <option value="all">Atleti e Me stesso</option>
                                                        <option value="athletes">Atleti</option>
                                                        <option value="me">Me stesso</option>
                                                    </select>
                                                </div>
                                                <div class="d-flex flex-column col-12 col-md-10 p-0">
                                                    <!-- svelte-ignore a11y-label-has-associated-control -->
                                                    <label class="font-weight-boldest">Oggetto</label>
                                                    <input
                                                        bind:value={node.data.subject}
                                                        type="text"
                                                        class="form-control form-control-sm" />
                                                </div>
                                            </div>

                                            <div
                                                class="d-flex flex-column justify-content-center align-items-center my-4"
                                                style="min-height: 10rem; gap: 0.5rem;">
                                                <div
                                                    class="d-flex justify-content-{node.data.content
                                                        ? 'between'
                                                        : 'center'} align-items-center w-100">
                                                    {#if node.data.content}
                                                        <span class="font-weight-boldest text-center mb-0 font-size-h4"
                                                            >Email</span>
                                                    {/if}
                                                    <button
                                                        disabled={automationData.onlyView}
                                                        on:click={async e => {
                                                            const broadcastChannelUpdate = new BroadcastChannel(
                                                                `update_message_${node.data.blockId}`
                                                            );
                                                            broadcastChannelUpdate.onmessage = () => {
                                                                // refresh the page
                                                                fetchData();
                                                            };
                                                            e.preventDefault();
                                                            await save();
                                                            setTimeout(() => {
                                                                window.open(
                                                                    `/#/email-builder/${node.data.blockId}/${params.workflow_id}?key=${node.data.blockId}`,
                                                                    '_blank'
                                                                );
                                                            }, 1000);
                                                        }}
                                                        class="btn btn-primary btn-sm font-weight-boldest d-flex align-items-center">
                                                        <Pencil size="18" class="mr-1" weight="duotone" />
                                                        {#if !node.data.blockId}
                                                            Sovrascrivi per modificare
                                                        {:else if node.data.content}
                                                            Modifica
                                                        {:else}
                                                            Crea email
                                                        {/if}
                                                    </button>
                                                </div>
                                                {#if node.data.content && node.data.content != ''}
                                                    <div
                                                        class="p-0 border rounded-xl bg-white w-100 overflow-hidden"
                                                        style="pointer-events:none;">
                                                        {@html node.data.content}
                                                    </div>
                                                {/if}
                                            </div>
                                        {/if}
                                        {#if node.value == 'sms'}
                                            <!-- svelte-ignore a11y-label-has-associated-control -->
                                            <label class="font-weight-boldest">Testo</label>
                                            <textarea
                                                bind:value={node.data.content}
                                                class="form-control form-control-sm"
                                                rows="4" />
                                        {/if}
                                    </div>
                                {/if}
                            </div>
                        </StepDrawer>
                    {:else if node.id == 'wait'}
                        <div class="d-flex justify-content-center align-items-center py-4">
                            <div class="d-flex align-items-center justify-content-center">
                                <ArrowDown size="24" weight="bold" />
                            </div>
                        </div>
                        <div
                            style="width: fit-content;min-width: 20rem;"
                            class="d-flex flex-column justify-content-center align-items-center p-4 mx-auto border rounded-xl shadow-xs">
                            <div class="d-flex align-items-center justify-content-center mt-4">
                                <div
                                    class="d-flex align-items-center justify-content-center bg-light-warning rounded-circle"
                                    style="width: 3rem; height: 3rem;">
                                    <ClockCountdown size="24" class="text-warning" weight="duotone" />
                                </div>
                            </div>
                            <div class="d-none d-md-block text-center mb-4 mt-4">
                                <h6 class="font-weight-boldest m-0">Rimani in attesa</h6>
                            </div>
                            <div class="d-flex align-items-center mb-6">
                                <div class="text-center bg-light-success border border-success rounded-xl py-1 px-4">
                                    <span class="font-weight-boldest text-dark">
                                        {node.data?.amount || 0}
                                        {#if node.data?.type == 'minutes'}
                                            minuti
                                        {:else if node.data?.type == 'hours'}
                                            ore
                                        {:else if node.data?.type == 'days'}
                                            giorni
                                        {/if}
                                    </span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between w-100">
                                <!-- svelte-ignore a11y-click-events-have-key-events -->
                                <div
                                    on:click={() => {
                                        deleteNode(idx);
                                    }}
                                    class="btn btn-sm rounded-circle btn-icon btn-danger font-weight-boldest mb-0">
                                    <Trash size="16" weight="bold" />
                                </div>
                                <!-- svelte-ignore a11y-click-events-have-key-events -->
                                <div
                                    on:click={() => {
                                        node.isDrawerOpen = true;
                                    }}
                                    class="btn btn-sm btn-dark font-weight-boldest mb-0">
                                    Configura
                                </div>
                            </div>
                        </div>
                        <StepDrawer
                            bind:isOpen={node.isDrawerOpen}
                            title=""
                            on:close={() => {
                                delete node.isDrawerOpen;
                                if (!automationData.onlyView) {
                                    save();
                                }
                            }}>
                            <div
                                in:slide={{duration: 120, easing: easing.backOut}}
                                out:slide={{duration: 200, easing: easing.backIn}}
                                class="d-flex flex-column mx-auto">
                                <div class="d-flex justify-content-between flex-column align-items-center">
                                    <div class="d-flex flex-column align-items-center justify-content-center">
                                        <div class="d-flex align-items-center justify-content-center mb-4">
                                            <div
                                                class="d-flex align-items-center justify-content-center bg-light-warning rounded-circle"
                                                style="width: 3rem; height: 3rem;">
                                                <ClockCountdown size="24" class="text-warning" />
                                            </div>
                                        </div>
                                        <div class="d-none d-md-block text-center">
                                            <h1 class="font-weight-boldest m-0">Rimani in attesa</h1>
                                            <p class="font-size-sm m-0">
                                                L'automazione rimarrà in attesa per un periodo di tempo specificato.
                                            </p>
                                        </div>
                                        <div class="d-block d-md-none mr-4">
                                            <h2 class="font-weight-boldest m-auto">Attesa</h2>
                                        </div>
                                    </div>
                                    <div class="d-flex align-items-center px-8 pt-8 mt-4 border-top w-100">
                                        <!-- pick amount of time: value | unit (mins, hours, days)-->
                                        <input
                                            bind:value={node.data.amount}
                                            type="number"
                                            min="1"
                                            placeholder="50"
                                            class="form-control form-control-sm mr-2" />
                                        <select bind:value={node.data.type} class="form-control form-control-sm">
                                            <option value="minutes">Minuti</option>
                                            <option value="hours">Ore</option>
                                            <option value="days">Giorni</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </StepDrawer>
                    {/if}
                {/each}

                <div class="d-flex justify-content-center mt-4">
                    <div class="d-flex align-items-center justify-content-center">
                        <ArrowDown size="24" weight="bold" class="text-dark" />
                    </div>
                </div>
                <div class="d-flex justify-content-center mt-4 font-weight-boldest">
                    <h6>scegli il prossimo step</h6>
                </div>
                <!-- add new step -->
                <div
                    class="d-flex p-4 justify-content-center"
                    style={automationTree[0].value == '' ? 'opacity:0.5;pointer-events:none;' : ''}>
                    <!-- centerd msg to add an action (only send message of type SMS or EMAIL) -->
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <div
                        class="d-flex flex-column align-items-center justify-content-center cursor-pointer btn"
                        style="border: 1px solid #ebedf3;width:11rem;"
                        on:click|preventDefault={addEvent}>
                        <div
                            class="d-flex align-items-center justify-content-center bg-light-primary rounded-circle"
                            style="width: 3rem; height: 3rem;">
                            <PlusCircle size="24" class="text-primary" />
                        </div>
                        <p class="font-size-sm m-0 mt-2 font-weight-bold">Azione Messaggio</p>
                    </div>
                    <div class="d-flex align-items-center mx-12">o</div>
                    <!-- add wait block -->
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <div
                        class="d-flex flex-column align-items-center justify-content-center cursor-pointer btn"
                        style="border: 1px solid #ebedf3;width:11rem;"
                        on:click|preventDefault={e => {
                            addEvent('wait');
                        }}>
                        <div
                            class="d-flex align-items-center justify-content-center bg-light-warning rounded-circle"
                            style="width: 3rem; height: 3rem;">
                            <ClockCountdown size="24" class="text-warning" />
                        </div>
                        <p class="font-size-sm m-0 mt-2 font-weight-bold">Rimani in Attesa</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="pt-0 pb-4 px-4 d-flex justify-content-end">
            <div class="m-0 p-0 d-flex align-items-center">
                <button
                    class="btn btn-secondary font-weight-boldest mr-2 mb-0 mt-0"
                    on:click={() => push('/communication/automation')}>Chiudi</button>
                <button
                    disabled={name == '' ||
                        automationData?.enabled ||
                        !canPerformAction('association.communication.workflows.update')}
                    class="btn btn-primary font-weight-boldest mb-0 mt-0"
                    on:click={save}>Salva</button>
            </div>
        </div>
    </div>
</Portal>

<!-- <style>
    [draggable='true'] {
        cursor: move;
    }
</style> -->
