<script>
    import {CheckCircle, Copy} from 'phosphor-svelte';
    import {sessionToken, userData} from 'store/stores';
    import {link, push} from 'svelte-spa-router';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import {getDataFromForm} from 'utils/Functions';
    import CampsAndRetreatsSubscriptionsForm from 'routes/association/course/campsAndRetreats/overview/modals/camps-and-retreats-subscriptions-form.svelte';
    import {onMount} from 'svelte';
    import {toast} from 'svelte-sonner';

    userData.useLocalStorage();
    sessionToken.useLocalStorage();

    export let params = {};
    let data;

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
                }
                location.reload();
            }, 200);
        }
    }

    async function create(formData) {
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Creazione...',
        });

        formData.subscription = JSON.parse(formData?.subscription)?.value;
        formData.periods = JSON.parse(formData?.periods);

        const url = replaceUID(__bakney.env.API.CAMPS_AND_RETREATS.SUBSCRIPTIONS.ADD, params.id);

        const res = await apiFetch(url, {
            method: 'POST',
            body: JSON.stringify(formData),
        });
        // spinner stop
        KTApp.unblockPage();

        if (res.status == 200 || res.status == 201) {
            document.getElementById('camps_and_retreats_subscriptions_form')?.reset();
            toast.success('Creato con successo.');

            // fire event to update the data
            push('/payment/list');
        } else {
            swal.fire({
                text: 'Scusa, ho individuato degli errori, riprova.',
                icon: 'error',
                buttonsStyling: false,
                confirmButtonText: 'Ok, capito!',
                customClass: {
                    confirmButton: 'btn font-weight-bold btn-light-primary',
                },
            });
        }
    }

    async function fetchData() {
        let res = await apiFetch(replaceUID(__bakney.env.API.CAMPS_AND_RETREATS.INFO, params.id), {
            method: 'GET',
        });

        if (res.status === 200) {
            data = res.response.data;
        } else {
            toast.error('Errore nel recupero dei dati.');
        }
    }

    onMount(async () => {
        if ($sessionToken) await fetchData();
    });
</script>

<!-- <pre>
{JSON.stringify(res, null, 2)}
</pre> -->

{#if !$sessionToken}
    <div class="d-flex flex-column justify-content-center align-items-center h-100 w-100">
        <img id="logo" class="h-40px mb-12" src={__bakney.OEM_CONFIG?.logo} alt="logo" />

        <h1 class="text-center font-weight-boldest mb-4">Accedi per iscriverti</h1>
        <p class="mb-12 font-weight-bold text-center">
            Clicca sul pulsante qui sotto per <br />
            creare un account o accedere con uno esistente.
        </p>
        <button
            type="button"
            class="btn btn-sm btn-primary font-weight-bolder font-size-h6 px-8 py-4 my-3 mr-4"
            on:click={checkLogin}>
            CREA o ACCEDI con l'account
        </button>
    </div>
{:else if $sessionToken && data?.sport_association}
    <img id="logo" class="h-40px mt-8" src={__bakney.OEM_CONFIG?.logo} alt="logo" />
    <div class="d-flex justify-content-center p-2 p-x-24 pt-12">
        <div class="m-auto border border-md-2 rounded-lg" style="width:800px;">
            <h2 class="font-weight-bolder mb-4 mt-12 mx-8">Iscriviti al Camp</h2>
            <CampsAndRetreatsSubscriptionsForm
                id={params.id}
                isInModal={true}
                isAssociateView={true}
                {data}
                sportAssociationUsername={data?.sport_association?.username}
                sportAssociationId={data?.sport_association?.sport_association_id}
                on:sumbit={e => {
                    if (e.detail.valid) {
                        create(e.detail.data);
                    }
                }} />
        </div>
    </div>
{/if}

<svelte:head>
    <style>
        body,
        .offcanvas-right {
            border-left: 0 !important;
        }
    </style>
</svelte:head>
