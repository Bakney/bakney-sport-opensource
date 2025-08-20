<script>
    import BottomBarFixedSave from 'components/inputs/BottomBarFixedSave.svelte';
    import {Warning, GearSix, Coins, Rows, Textbox} from 'phosphor-svelte';
    import {onDestroy, onMount} from 'svelte';
    import * as easing from 'svelte/easing';
    import {scale} from 'svelte/transition';
    import {apiFetch} from 'utils/ApiMiddleware';
    import {canPerformAction} from 'utils/Permissions';
    import Preview from './partials/Preview.svelte';
    import QuoteIscrizione from './partials/QuoteIscrizione.svelte';
    import {toast} from 'svelte-sonner';
    import LogoModule from './partials/LogoModule.svelte';
    import TypesModule from './partials/TypesModule.svelte';
    import ModuleSections from './partials/ModuleSections.svelte';
    import AdditionalFields from './partials/AdditionalFields.svelte';
    import LinkShareHeader from './share/link-share-header.svelte';

    let isShowPreview = false;
    let userData;
    let visibleSaveBottom = false;
    let visibleSaveBottomListener = null;
    let files = [];
    let visiblePage = 'info';
    let showPreviewIscrizioni = false;
    let showPreviewPreiscrizioni = false;

    async function showPreview() {
        isShowPreview = true;
    }

    async function fetchData() {
        let res = await apiFetch(__bakney.env.API.PROFILE.INFO);
        if (!res.error) {
            userData = res.response.user_data;
        } else {
            // fire toast error
            toast.error('Errore nel caricamento dei dati');
        }
    }

    const updateAccountInformation = async function () {
        let dataSportAssociation = {...userData.sport_association};

        // clean from the errors key
        dataSportAssociation.additional_sections = dataSportAssociation.additional_sections.map(section => {
            delete section.error;
            return section;
        });

        // check there are no empty sections in both name & text, if so stop the function and show a toast
        let emptySections = dataSportAssociation?.additional_sections?.filter(section => {
            if (section?.name?.trim() === '' || section?.text?.replace(/<[^>]*>/g, '')?.trim() === '') {
                section.error = 'Il nome e/o il testo della sezione non possono essere vuoti';
                section.collapsed = false;
                return true;
            }
            return false;
        });
        if (emptySections?.length > 0) {
            toast.error('Alcune sezioni contengono errori. Controlla i campi evidenziati.');
            // trigger UI update with reassign additional_sections
            userData.sport_association.additional_sections = [...dataSportAssociation?.additional_sections];
            return;
        }

        // waiting for converting updated image if available
        if (files && files[0]) {
            //let blob = window.URL.createObjectURL(files[0]);
            //profileData.avatar_image = readImage(files[0]);
            let readedBlob = await readBlob(files[0]);
            dataSportAssociation.logo = readedBlob;
        }

        // convert all the string with floats string that have , instead of . to actual floats with .
        dataSportAssociation.subscription_fee = parseFloat(
            dataSportAssociation.subscription_fee?.replace(',', '.') || 0
        );
        dataSportAssociation.membership_fee = parseFloat(dataSportAssociation.membership_fee?.replace(',', '.') || 0);
        // perform the converstion also for membership_fee_plans & subscription_fee_plans
        dataSportAssociation.membership_fee_plans = dataSportAssociation.membership_fee_plans?.map(plan => {
            plan.membership_fee = parseFloat(String(plan.membership_fee)?.replace(',', '.') || 0);
            return plan;
        });
        dataSportAssociation.subscription_fee_plans = dataSportAssociation.subscription_fee_plans.map(plan => {
            plan.subscription_fee = parseFloat(String(plan.subscription_fee)?.replace(',', '.') || 0);
            return plan;
        });

        // block the page
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Salvataggio in corso...',
        });

        // perform the update
        let res = await apiFetch(__bakney.env.HOST + '/profile/update/subscription/template', {
            method: 'PATCH',
            body: JSON.stringify({
                sport_association: dataSportAssociation,
            }),
        });

        if (!res.error) {
            toast.success("Modulo d'iscrizione aggiornato correttamente");
        } else {
            toast.error("Errore nel salvataggio del modulo d'iscrizione");
        }

        // refresh the data
        userData = null;
        await fetchData();

        // unblock the page
        KTApp.unblockPage();
    };

    function readBlob(blob) {
        return new Promise(resolve => {
            let reader = new FileReader();
            reader.readAsDataURL(blob);

            reader.onloadend = function () {
                let base64data = reader.result;
                userData.sport_association.logo = base64data;
                resolve(reader.result);
            };
        });
    }

    onMount(async () => {
        await fetchData();

        // if scrolling vertically for more than 200px, show bottom bar
        visibleSaveBottomListener = window.addEventListener('scroll', function () {
            if (window.scrollY > 200) {
                visibleSaveBottom = true;
            } else {
                visibleSaveBottom = false;
            }
        });
    });

    onDestroy(() => {
        window.removeEventListener('scroll', visibleSaveBottomListener);
    });
</script>

<div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}} class="d-flex flex-column-fluid">
    <!--begin::Container-->
    <div class="container container-overlay">
        <div class="card card-custom pb-24">
            <div class="card-header p-0 border-0">
                <h3 class="card-title font-size-h1 py-0 font-weight-boldest">Modulo Iscrizione</h3>
                <div class="card-toolbar py-0">
                    <!-- svelte-ignore a11y-missing-attribute -->
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <a
                        class="btn btn-light-success font-weight-bolder mr-2 btn-always-text-visible"
                        on:click={() => showPreview()}
                        data-toggle="modal"
                        data-target="#previewModal"
                        disabled
                        role="button"
                        aria-disabled="true">Anteprima</a>
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <button
                        disabled={!canPerformAction('association.members.update')}
                        id="kt_form_account_update_submit"
                        class="btn btn-primary font-weight-bolder mr-2 btn-always-text-visible mb-0"
                        on:click={() => updateAccountInformation()}>Salva</button>
                </div>
            </div>
            <div class="card-body px-0 pt-2">
                <div class="row w-100 px-0 mx-0 pb-7">
                    <LinkShareHeader />
                </div>
                {#if userData}
                    <div
                        class="nav nav-tabs nav-tabs-line nav-bold nav-tabs-line-3x border-0 mb-8 border-bottom border">
                        <div class="nav-item">
                            <a
                                class="nav-link {visiblePage === 'info' ? 'active' : ''}"
                                data-toggle="tab"
                                href="#kt_tab_pane_1"
                                on:click={() => (visiblePage = 'info')}>
                                <GearSix size={16} weight="duotone" class="mr-2" />
                                <span class="nav-text font-weight-boldest">Impostazioni</span>
                            </a>
                        </div>
                        <div class="nav-item">
                            <a
                                class="nav-link {visiblePage === 'quotes' ? 'active' : ''}"
                                data-toggle="tab"
                                href="#kt_tab_pane_2"
                                on:click={() => (visiblePage = 'quotes')}>
                                <Coins size={16} weight="duotone" class="mr-2" />
                                <span class="nav-text font-weight-boldest">Quote</span>
                            </a>
                        </div>
                        <div class="nav-item">
                            <a
                                class="nav-link {visiblePage === 'sections' ? 'active' : ''}"
                                data-toggle="tab"
                                href="#kt_tab_pane_3"
                                on:click={() => (visiblePage = 'sections')}>
                                <Rows size={16} weight="duotone" class="mr-2" />
                                <span class="nav-text font-weight-boldest">Sezioni Modulo</span>
                            </a>
                        </div>
                        <div class="nav-item">
                            <a
                                class="nav-link {visiblePage === 'fields' ? 'active' : ''}"
                                data-toggle="tab"
                                href="#kt_tab_pane_4"
                                on:click={() => (visiblePage = 'fields')}>
                                <Textbox size={16} weight="duotone" class="mr-2" />
                                <span class="nav-text font-weight-boldest">Campi Aggiuntivi</span>
                            </a>
                        </div>
                    </div>
                    {#if window.innerWidth > 768}
                        <div
                            class="bg-white border border-2 shadow-sm border-secondary rounded-xl px-0 pt-3 pb-1 shadow-sm {visibleSaveBottom
                                ? 'mb-16'
                                : ''}"
                            style="position: fixed;bottom: 1rem;right: 1rem;z-index: 1000;min-width: 30rem;background-color: #ffffff3d !important; backdrop-filter: blur(50px); -webkit-backdrop-filter: blur(50px);">
                            <div class="d-flex justify-content-between px-2">
                                <h6 class="font-weight-boldest text-center mb-2 pl-2">Anteprima Modulo Iscrizioni</h6>
                                <button
                                    class="btn btn-sm btn-dark font-weight-boldest py-0 px-2 rounded-xl mr-2"
                                    on:click={() => (showPreviewIscrizioni = !showPreviewIscrizioni)}>
                                    {showPreviewIscrizioni ? 'X' : 'Apri'}
                                </button>
                            </div>
                            {#if showPreviewIscrizioni}
                                <iframe
                                    class="w-100 border-0 rounded-xl"
                                    style="zoom: 0.6;min-height: 60rem"
                                    src="{__bakney.env.DOMAIN}/#/subscribe/{String(userData.username).toLowerCase()}" />
                            {/if}
                        </div>
                        <div
                            class="bg-white border border-2 shadow-sm border-secondary rounded-xl px-0 pt-3 pb-1 shadow-sm {visibleSaveBottom
                                ? 'mb-16'
                                : ''}"
                            style="position: fixed;bottom: 1rem;right: 32rem;z-index: 1001;min-width: 30rem;background-color: #ffffff3d !important; backdrop-filter: blur(50px); -webkit-backdrop-filter: blur(50px);">
                            <div class="d-flex justify-content-between px-2">
                                <h6 class="font-weight-boldest text-center mb-2 pl-2">
                                    Anteprima Modulo Preiscrizioni
                                </h6>
                                <button
                                    class="btn btn-sm btn-dark font-weight-boldest py-0 px-2 rounded-xl mr-2"
                                    on:click={() => (showPreviewPreiscrizioni = !showPreviewPreiscrizioni)}>
                                    {showPreviewPreiscrizioni ? 'X' : 'Apri'}
                                </button>
                            </div>
                            {#if showPreviewPreiscrizioni}
                                <iframe
                                    class="w-100 border-0 rounded-xl"
                                    style="zoom: 0.6;min-height: 60rem"
                                    src="{__bakney.env.DOMAIN}/#/subscribe/{String(
                                        userData.username
                                    ).toLowerCase()}/preregistration" />
                            {/if}
                        </div>
                    {/if}
                    {#if visiblePage === 'info'}
                        <div class="row">
                            <div class="col-12 col-md-8">
                                <LogoModule bind:userData bind:files />
                            </div>
                            {#if !(userData?.preview_and_custom_features?.find(x => x.name === 'Iscrizioni per Enti e Federazioni') !== undefined)}
                                <TypesModule bind:userData />
                            {/if}
                        </div>
                        <div class="row px-0 mt-12 text-center">
                            <div class="col-12 col-md-6 mx-auto border rounded-xl px-12 py-8 shadow-xs bg-light">
                                <div class="card card-custom bg-light">
                                    <h3 class="card-title font-weight-bolder text-dark mb-4">
                                        Link Preiscrizioni Prossima Stagione
                                    </h3>
                                    <div class="card-body px-0 py-0 my-0">
                                        <div class="text-dark-50 line-height-lg mb-2">
                                            <div class="input-group">
                                                <input
                                                    type="text"
                                                    class="form-control"
                                                    style="border-radius: .75rem 0 0 .75rem !important;"
                                                    readonly
                                                    value="{window.location
                                                        .origin}/#/subscribe/{userData.username?.toLowerCase()}/preregistration" />
                                                <div class="input-group-append">
                                                    <button
                                                        class="btn btn-dark font-weight-boldest"
                                                        type="button"
                                                        on:click={() => {
                                                            navigator.clipboard.writeText(
                                                                `${
                                                                    window.location.origin
                                                                }/#/subscribe/${userData.username?.toLowerCase()}/preregistration`
                                                            );
                                                            toast.success('Link copiato negli appunti!');
                                                        }}>
                                                        Copia
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="font-size-sm text-muted">
                                            Le preiscrizioni permettono di raccogliere in anticipo le iscrizioni e
                                            riconferme per l'anno successivo.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row text-center">
                            <div class="col-12 mt-24 text-center">
                                <span class="mb-0 font-size-lg">
                                    <span class="font-weight-boldest font-size-h3">
                                        Hai bisogno di aiuto o non trovi quello che ti serve?
                                    </span>
                                    <br />
                                    <span>
                                        <a
                                            data-toggle="modal"
                                            data-target="#newTicketModal"
                                            class="font-weight-boldest"
                                            style="cursor:pointer;">Apri un ticket</a> e ti risponderemo il prima possibile.
                                    </span>
                                </span>
                            </div>
                        </div>
                    {/if}

                    {#if visiblePage === 'quotes'}
                        <div class="row mt-8 border-t rounded-lg">
                            <h2 class="text-dark font-weight-boldest mx-4">Gestione quote iscrizione</h2>
                            <QuoteIscrizione bind:userData />
                        </div>
                    {/if}

                    {#if visiblePage === 'sections'}
                        <div class="mt-8 mx-auto">
                            <ModuleSections bind:userData />
                        </div>
                    {/if}

                    {#if visiblePage === 'fields'}
                        <div class="mt-8 mx-auto">
                            <AdditionalFields bind:userData />
                        </div>
                    {/if}
                {/if}
            </div>
        </div>
    </div>
</div>

{#if isShowPreview}
    <Preview {userData} />
{/if}

<BottomBarFixedSave bind:visible={visibleSaveBottom} on:save={updateAccountInformation}>
    <div slot="left" class="d-flex align-items-center">
        <Warning weight={'duotone'} size={18} class="mr-2 text-warning" />
        <p class="font-weight-boldest mb-0 text-warning text-xs">Ricordati di salvare per applicare le modifiche.</p>
    </div>
</BottomBarFixedSave>
