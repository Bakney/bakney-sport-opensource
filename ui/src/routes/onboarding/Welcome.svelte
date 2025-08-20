<script>
    import {scale} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import {userData, role} from 'store/stores';
    import {NumberCircleOne, NumberCircleThree, NumberCircleTwo} from 'phosphor-svelte';
    import WelcomeStep0 from './partials/step0.svelte';
    import WelcomeStep1 from './partials/step1.svelte';
    import WelcomeStep2 from './partials/step2.svelte';
    import Footer from './partials/footer.svelte';
    import {onDestroy, onMount} from 'svelte';

    userData.useLocalStorage();
    role.useLocalStorage();
    let currentStep = 0;

    let hasUnsavedChanges = true; // Set this to true when changes are made
    let isExiting = false;
    let isLoading = false;

    function beforeUnloadHandler(event) {
        if (currentStep == 2 || currentStep == 0) return;
        if (hasUnsavedChanges && !isExiting) {
            event.preventDefault();
            event.returnValue = 'Hai modifiche non salvate. Sei sicuro di voler uscire?';
        }
    }

    async function handleExit() {
        if (currentStep == 2 || currentStep == 0) return;
        if (hasUnsavedChanges && !isExiting) {
            isExiting = true;
            const result = await swal.fire({
                title: 'Sei sicuro di voler uscire?',
                text: 'Hai modifiche non salvate.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Esci',
                cancelButtonText: 'Annulla',
                reverseButtons: true,
                target: '#portal-elements',
                customClass: {
                    confirmButton: 'btn rounded font-weight-boldest btn-light-primary m-0',
                    cancelButton: 'btn rounded font-weight-boldest btn-secondary m-0 mr-2',
                },
            });

            if (result.isConfirmed) {
                hasUnsavedChanges = false;
                isExiting = false;
                // Allow the navigation to proceed
                window.removeEventListener('beforeunload', beforeUnloadHandler);
                history.back();
            } else {
                isExiting = false;
            }
        }
    }

    function handlePopState(event) {
        if (currentStep == 2 || currentStep == 0) return;
        if (hasUnsavedChanges) {
            history.pushState(null, '', window.location.href);
            handleExit();
        }
    }

    onMount(async () => {
        // check role, if athlete redirect to /
        if ($role == 'athlete') {
            location.href = '/';
        }
        setTimeout(async () => {
            // remove userData from local storage
            localStorage.removeItem('userData');

            // await until userData is back in the local storage
            while (localStorage.getItem('userData') === null) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            window.addEventListener('beforeunload', beforeUnloadHandler);
            window.addEventListener('popstate', handlePopState);
            history.pushState(null, '', window.location.href);
        });
    });

    onDestroy(() => {
        window.removeEventListener('beforeunload', beforeUnloadHandler);
        window.removeEventListener('popstate', handlePopState);
    });
</script>

<svelte:window on:beforeunload={beforeUnloadHandler} />

<div in:scale={{duration: 350, start: 0.96, easing: easing.cubicInOut}}>
    <div
        class="bg-primary pt-24 pb-36"
        style="color: rgb(255, 255, 255); background-image: url(/static/forms/pattern.png);background-size: cover;">
        <div class="d-flex align-items-center justify-content-center flex-column">
            <div class="align-items-center d-flex mb-4">
                <a href={__bakney.OEM_CONFIG?.url} target="_blank">
                    <img
                        class="h-30px"
                        alt="logo {__bakney?.OEM_CONFIG?.name}"
                        src={__bakney.OEM_CONFIG?.logo}
                        style="filter:brightness(100)" />
                </a>
            </div>
            <div class="d-flex flex-column aling-items-center justify-content-center">
                <h1 class="text-center font-weight-boldest font-size-h1">Completa il tuo profilo in 2 minuti</h1>
                <h4 class="text-center font-weight-bold font-size-h6">
                    Ti aiutiamo a configurare il gestionale passo passo per partire subito al massimo 🚀
                </h4>
            </div>
        </div>
    </div>
    <div
        class="bg-white py-8 px-10 rounded-lg border-2 border border-secondary font-weight-bold col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5 mx-auto"
        style="postion:relative;top:-4.5rem;">
        <div class="d-flex justify-content-between mb-12 px-4 px-lg-14 px-xl-24 align-items-center">
            <div>
                <NumberCircleOne size={34} weight="duotone" class={currentStep < 0 ? 'text-primary' : 'text-primary'} />
            </div>
            <div class="w-100 border border-{currentStep < 1 ? 'light-dark' : 'primary'} opacity-75" />
            <div>
                <NumberCircleTwo
                    size={34}
                    weight="duotone"
                    class={currentStep < 1 ? 'text-light-dark' : 'text-primary'} />
            </div>
            <div class="w-100 border border-{currentStep < 2 ? 'light-dark' : 'primary'} opacity-75" />
            <div>
                <NumberCircleThree
                    size={34}
                    weight="duotone"
                    class={currentStep < 2 ? 'text-light-dark' : 'text-primary'} />
            </div>
        </div>
        <div class="mb-0">
            {#if currentStep == 0}
                <h1 class="font-weight-boldest font-size-h1">🚀 Iniziamo! Configura la tua associazione</h1>
                <p class="font-size-h5 font-weight-bold text-dark-50">
                    Configuriamo insieme {__bakney?.OEM_CONFIG?.name} per sfruttarne al massimo le potenzialità!
                </p>
                <div class="mt-6">
                    <WelcomeStep0 bind:currentStep>
                        <Footer bind:currentStep />
                    </WelcomeStep0>
                </div>
            {:else if currentStep == 1}
                <h1 class="font-weight-boldest font-size-h1">🏋️‍♀️ Configura la stagione e quote</h1>
                <p class="font-size-h5 font-weight-bold text-dark-50">
                    Imposta la <b>stagione sportiva</b> (ad esempio Settembre-Agosto) e la quota di <b>iscrizione</b>
                    e/o
                    <b>tesseramento</b>.
                </p>
                <div class="mt-6">
                    <WelcomeStep1 bind:currentStep>
                        <Footer bind:currentStep />
                    </WelcomeStep1>
                </div>
            {:else if currentStep == 2}
                <h1 class="font-weight-boldest text-black font-size-h1">🏁 Ci siamo quasi</h1>
                <p class="font-size-h5 font-weight-bold text-dark-50">
                    Queste informazioni ci permettono di offrirti la migliore esperienza possibile.
                </p>
                <div class="mt-6">
                    <WelcomeStep2 bind:isLoading>
                        <Footer bind:currentStep bind:isLoading />
                    </WelcomeStep2>
                </div>
            {/if}
        </div>
    </div>
</div>

<svelte:head>
    <style>
        .offcanvas-right {
            border-left: 0 !important;
        }
    </style>
</svelte:head>
