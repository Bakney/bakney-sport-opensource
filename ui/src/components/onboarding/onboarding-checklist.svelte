<script>
    import {CaretUp, CaretDown, CheckCircle, Circle} from 'phosphor-svelte';
    import {userData} from 'store/stores';
    import {onMount} from 'svelte';
    import Portal from 'svelte-portal';
    import confetti from 'canvas-confetti';
    import {toast} from 'svelte-sonner';
    import {fly} from 'svelte/transition';
    import {apiFetch} from 'utils/ApiMiddleware';

    userData.useLocalStorage();

    export let items = [
        {
            key: 'initial_setup',
            label: 'Configurazione iniziale del gestionale.',
            description: null,
            done: !$userData?.requires_welcome || false,
        },
        {
            key: 'create_membership',
            label: '<a href="/#/members/add" class="text-white"><u>Crea o importa un tesserato</u></a>',
            done: $userData?.onboarding?.create_membership || false,
        },
        {
            key: 'view_membership',
            label: '<a href="/#/members/list" class="text-white"><u>Vedi il tuo tesserato (clicca sul nome)</u></a>',
            done: $userData?.onboarding?.view_membership || false,
        },
        {
            key: 'approve_payment',
            label: '<a href="/#/payment/list" class="text-white"><u>Incassa un pagamento</u></a>',
            done: $userData?.onboarding?.approve_payment || false,
        },
        {
            key: 'download_invoice',
            label: '<a href="/#/invoice/list" class="text-white"><u>Scarica la ricevuta di pagamento</u></a>',
            done: $userData?.onboarding?.download_invoice || false,
        },
        {
            key: 'view_collaborators',
            label: '<a href="/#/connected-collaborators" class="text-white"><u>Vedi come aggiungere un collaboratore</u></a>',
            done: $userData?.onboarding?.view_collaborators || false,
        },
        {
            key: 'view_settings',
            label: '<a href="/#/profile?page=settings" class="text-white"><u>Vedi le impostazioni</u></a>',
            done: $userData?.onboarding?.view_settings || false,
        },
    ];
    export let expanded = true;

    let undone = items?.filter(item => !item?.done);
    let total = items?.length;
    let currentActive = null;

    $: undone = items?.filter(item => !item?.done);
    $: total = items?.length;

    async function checkOnboardingComplete() {
        if (items?.every(item => item?.done)) {
            let sports = ['🏆'];
            for (let i = 0; i < sports.length; i++) {
                var scalar = Math.random() * 2 + 1;
                var pineapple = confetti.shapeFromText({text: sports[i], scalar});
                confetti({
                    shapes: [pineapple],
                    scalar: scalar,
                    particleCount: Math.floor(Math.random() * 50) + 50,
                    spread: 10000,
                    origin: {
                        y: 0.5,
                    },
                    zIndex: 999999,
                    flat: true,
                });
            }
            // remove userData from local storage
            localStorage.removeItem('userData');

            // await until userData is back in the local storage
            while (localStorage.getItem('userData') === null) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }

            setTimeout(() => {
                toast.success('ONBOARDING COMPLETATO! 🎉');
            }, 1000);
        }

        return items?.every(item => item?.done);
    }

    async function gamificationFeedback(msg) {
        await apiFetch(__bakney.env.API.ONBOARDING.UPDATE, {
            method: 'PATCH',
            body: JSON.stringify({
                onboarding_data: $userData.onboarding,
            }),
        });

        confetti({
            particleCount: 200,
            spread: 400,
            origin: {
                y: 0.5,
            },
            zIndex: 999999,
        });

        toast.success(msg);
        items = [...items]; // force re-render
        // check if onboarding is complete
        await checkOnboardingComplete();
    }

    onMount(async () => {
        // add event listener: onboarding-checklist-event
        document.addEventListener('onboarding-checklist-event', async e => {
            let item = items.find(item => item.key === e.detail.key);
            if (!item) return;
            if (e.detail.key === 'view_settings' && !item.done) {
                item.done = true;
                $userData.onboarding.view_settings = true;
                gamificationFeedback('Hai visto le impostazioni del tuo gestionale');
            }
            if (e.detail.key === 'view_membership' && !item.done) {
                item.done = true;
                $userData.onboarding.view_membership = true;
                gamificationFeedback('Hai visto il tuo tesserato');
            }
            if (e.detail.key === 'view_collaborators' && !item.done) {
                item.done = true;
                $userData.onboarding.view_collaborators = true;
                gamificationFeedback('Hai visto come aggiungere un collaboratore');
            }
            if (e.detail.key === 'download_invoice' && !item.done) {
                item.done = true;
                $userData.onboarding.download_invoice = true;
                gamificationFeedback('Hai visto come scaricare la ricevuta di pagamento');
            }
            if (e.detail.key === 'approve_payment' && !item.done) {
                item.done = true;
                $userData.onboarding.approve_payment = true;
                gamificationFeedback('Hai visto come approvare un pagamento');
            }
            if (e.detail.key === 'create_membership' && !item.done) {
                item.done = true;
                $userData.onboarding.create_membership = true;
                gamificationFeedback('Hai visto come creare o importare un tesserato');
            }
            currentActive = null;
        });
    });
</script>

<Portal target="#portal-elements">
    {#if expanded}
        <div
            in:fly|local={{duration: 150, y: 300}}
            out:fly|local={{duration: 150, y: 50}}
            class="onboarding-checklist bg-primary text-white rounded-xl shadow-lg pt-3 pb-4 px-3 border border-3 border-success">
            <div class="d-flex justify-content-between px-4 pt-2 align-items-center">
                <h2 class="text-left font-weight-boldest">Iniziamo subito</h2>
                <button
                    class="btn btn-xs btn-icon btn-light text-primary p-0"
                    on:click|preventDefault={() => (expanded = !expanded)}>
                    <CaretDown size="18" weight="bold" />
                </button>
            </div>

            <p class="text-left font-weight-bold px-4 mb-6 mt-2">
                Ti manca{undone.length > 1 ? 'no' : ''}
                <b class="font-weight-boldest bg-light text-primary border mx-1 px-1 rounded-pill">{undone.length}</b>
                compit{undone.length > 1 ? 'i' : 'o'}
                per completare il tuo onboarding.
            </p>
            {#each Array.from(items) as item}
                <div
                    class="d-flex font-size-h6 align-items-center rounded-lg py-1 mb-2 mx-3 px-2 {item.done
                        ? 'font-weight-boldest'
                        : 'font-weight-medium text-white'}">
                    {#if item.done}
                        <CheckCircle size="22" weight="fill" class="mr-2" />
                    {:else}
                        <Circle size="22" weight="bold" class="mr-2" />
                    {/if}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <div
                        class="d-flex flex-column align-items-start justify-content-center"
                        on:click={() => {
                            currentActive = item.label;
                            expanded = !expanded;
                        }}>
                        {@html item.label}
                    </div>
                </div>
            {/each}
        </div>
    {:else}
        <div
            in:fly|local={{duration: 150, y: 300}}
            out:fly|local={{duration: 150, y: 50}}
            class="onboarding-checklist bg-primary text-white rounded-xl shadow-lg p-0 mx-0 border border-4 border-success">
            <div class="d-flex justify-content-between align-items-center">
                <button
                    class="btn btn-xs btn-primary py-2 px-4 rounded-lg mb-0 d-flex align-items-center"
                    on:click|preventDefault={() => (expanded = !expanded)}>
                    <CaretUp size="18" weight="bold" class="mr-1" />
                    {#if currentActive}
                        <div class="my-auto font-weight-boldest ml-1 font-size-lg mr-4">
                            Da fare: {@html currentActive}
                        </div>
                    {/if}
                    <div class="my-auto font-weight-boldest ml-1 font-size-lg">
                        {total - undone.length} su {total} fatti
                    </div>
                </button>
            </div>
        </div>
    {/if}
</Portal>

<style>
    .onboarding-checklist {
        display: flex;
        position: fixed;
        flex-direction: column;
        right: 1.5vh !important;
        bottom: 1.5vh;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
    }
</style>
