<script>
    import {afterUpdate, onDestroy, onMount} from 'svelte';
    import {scale} from 'svelte/transition';
    import {apiFetch} from 'utils/ApiMiddleware.js';
    import {subPage, userData} from 'store/stores.js';
    import {ArrowsClockwise, XCircle, Warning} from 'phosphor-svelte';
    import {canPerformAction} from 'utils/Permissions';
    import {toast} from 'svelte-sonner';
    import BottomBarFixedSave from 'components/inputs/BottomBarFixedSave.svelte';

    subPage.useLocalStorage();
    userData.useLocalStorage();

    export let changes = false;
    let googleCheckInterval = null;
    let fetchedData = {};

    async function fetchIntegrationSettings() {
        let res = await apiFetch(`${__bakney.env.API.PROFILE.INTEGRATIONS}`);

        if (!res.error) {
            $userData.sport_association.review_url = res.response.review_url;
            $userData.sport_association.review_url_enabled = res.response.review_url_enabled;
        } else {
            toast.error('Si sono verificati degli errori, contatta il supporto immediatamente!');
        }
    }

    async function updateIntegrationSettings() {
        let res = await apiFetch(`${__bakney.env.API.PROFILE.INTEGRATIONS}`, {
            method: 'PATCH',
            body: JSON.stringify({
                review_url: $userData.sport_association.review_url,
                review_url_enabled: $userData.sport_association.review_url_enabled,
            }),
        });

        if (!res.error) {
            toast.success('Impostazioni salvate con successo.');
        } else {
            toast.error('Si sono verificati degli errori, contatta il supporto immediatamente!');
        }
    }

    onMount(async () => {
        googleCheckInterval = setInterval(async () => {
            let res = await apiFetch(`${__bakney.env.API.GOOGLE.CHECK}`);

            if (!res.error) {
                $userData.google_sync_enabled = res.response.google_sync_enabled;
            }
        }, 2000);
        await fetchIntegrationSettings();
        fetchedData = JSON.stringify($userData);
        if (JSON.stringify($userData) != fetchedData) changes = true;
        else changes = false;
    });

    onDestroy(() => {
        clearInterval(googleCheckInterval);
    });

    afterUpdate(() => {
        if (JSON.stringify($userData) != fetchedData) changes = true;
        else changes = false;
    });
</script>

{#if $subPage == 'integrations'}
    <!-- $subPage == 'password' -->
    <!--begin::Content-->
    <div class="flex-row-fluid">
        <!--begin::Card-->
        <div class="card card-custom card-stretch">
            <!--begin::Header-->
            <div class="card-header py-3">
                <div class="card-title align-items-start flex-column">
                    <h3 class="card-label font-weight-bolder text-dark font-size-h1">Integrazioni con terze parti</h3>
                    <span class="text-muted font-weight-bold font-size-sm mt-1"
                        >Aggiorna le impostazioni delle integrazioni disponibili.</span>
                </div>
                <div class="card-toolbar">
                    <button
                        disabled={!canPerformAction('other.settings.update') ||
                            (canPerformAction('other.settings.update') && !changes)}
                        type="button"
                        class="btn btn-primary font-weight-bolder"
                        on:click={updateIntegrationSettings}>
                        Salva
                    </button>
                </div>
            </div>
            <!--end::Header-->
            <!--begin::Form-->
            <div id="kt_form_password_update">
                <!--begin::Body-->
                <div class="card-body">

                    <div in:scale={{duration: 150, start: 0.98}} class="form-group row">
                        <div class="col-12">
                            {#if $userData.google_sync_enabled}
                                <button
                                    disabled={!canPerformAction('other.settings.update')}
                                    type="button"
                                    class="d-flex align-items-center btn btn-light-danger font-weight-bolder"
                                    on:click={async () => {
                                        // swal confirm
                                        swal.fire({
                                            title: 'Sei sicuro?',
                                            text: 'Questa azione disconnetterà il tuo account Google.',
                                            icon: 'question',
                                            showCancelButton: true,
                                            confirmButtonText: 'Disconnetti',
                                            reverseButtons: true,
                                            cancelButtonText: 'Annulla',
                                            buttonsStyling: false,
                                            confirmButtonClass: 'btn btn-danger font-weight-bolder',
                                            confirmButtonColor: null,
                                            cancelButtonClass: 'btn btn-secondary font-weight-bolder',
                                            cancelButtonColor: null,
                                        }).then(async result => {
                                            if (result.isConfirmed) {
                                                let res = await apiFetch(`${__bakney.env.API.GOOGLE.CALENDAR_CONFIG}`, {
                                                    method: 'DELETE',
                                                });

                                                if (!res.error) {
                                                    toast.success('Account Google disconnesso.');
                                                    $userData.google_sync_enabled = false;
                                                } else {
                                                    toast.error(
                                                        'Si sono verificati degli errori, contatta il supporto immediatamente!'
                                                    );
                                                }
                                            }
                                        });
                                    }}>
                                    <XCircle weight="duotone" size={17} class="mr-1" />
                                    Disconnetti
                                </button>
                            {:else}
                                <button
                                    disabled={!canPerformAction('other.settings.update')}
                                    type="button"
                                    class="btn btn-light-primary font-weight-bolder"
                                    on:click={async () => {
                                        let res = await apiFetch(`${__bakney.env.API.GOOGLE.CALENDAR_CONFIG}`);

                                        if (!res.error) {
                                            // Redirect to Google on new tab
                                            window.open(res.response.authorization_url, '_blank');
                                        }
                                    }}>
                                    <ArrowsClockwise weight="duotone" size={17} class="mr-1" />
                                    Connetti a Google
                                </button>
                            {/if}
                        </div>
                        <div class="col-12 mt-2">
                            <span class="text-muted"> Sincronizza i tuoi eventi con il calendario di Google. </span>
                        </div>
                    </div>

                    <div in:scale={{duration: 150, start: 0.98}} class="form-group row mb-0 mt-10">
                        <h2 class="col-12 font-weight-boldest">Url Recensioni</h2>
                    </div>
                    <div in:scale={{duration: 150, start: 0.98}} class="form-group row mb-0">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label class="col-12 col-form-label font-weight-bolder text-left">Url recensioni</label>
                        <div class="col-12 col-md-6 d-flex justify-content-start align-items-center mb-3">
                            <input
                                class="form-control form-control-lg form-control-solid"
                                type="input"
                                name=""
                                disabled={!canPerformAction('other.settings.update')}
                                placeholder="https://link-recensioni.com..."
                                bind:value={$userData.sport_association.review_url} />
                        </div>
                        <div class="col-12 d-flex justify-content-start align-items-center">
                            <small class="text-muted font-size-sm lh-xs">
                                Il link per la raccolta delle recensioni, ad esempio se usi google puoi andare sulla
                                pagina
                                <span class="font-weight-boldest">
                                    <a href="https://business.google.com/locations" target="_blank">Google Business</a>:
                                    <br />
                                    Vedi profilo > Chiedi Recensioni e copia il link.
                                </span>
                            </small>
                        </div>
                    </div>
                    <div in:scale={{duration: 150, start: 0.98}} class="form-group row">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label class="col-12 col-form-label font-weight-bolder text-left"
                            >Abilita raccolta recensioni</label>
                        <div class="col-12 d-flex justify-content-start align-items-center mb-3">
                            <span class="switch switch-icon">
                                <label>
                                    <input
                                        disabled={!canPerformAction('other.settings.update')}
                                        type="checkbox"
                                        name=""
                                        bind:checked={$userData.sport_association.review_url_enabled} />
                                    <span />
                                </label>
                            </span>
                        </div>
                        <div class="col-12 d-flex justify-content-start align-items-center">
                            <small class="text-muted font-size-sm lh-xs">
                                Se abilitato, verrà mostrato il link per la raccolta delle recensioni nella bacheca.
                            </small>
                        </div>
                    </div>
                </div>
                <!--end::Body-->
            </div>
            <!--end::Form-->
        </div>
    </div>
    <BottomBarFixedSave on:save={updateIntegrationSettings} autoShow={true}>
        <div slot="left" class="d-flex align-items-center">
            <Warning weight={'duotone'} size={18} class="mr-2 text-warning" />
            <p class="font-weight-boldest mb-0 text-warning text-xs">
                Ricordati di salvare per applicare le modifiche.
            </p>
        </div>
    </BottomBarFixedSave>
{/if}
