<script>
    import {sessionToken, role, userData, subPage} from 'store/stores.js';
    import {scale} from 'svelte/transition';
    import {apiFetch} from 'utils/ApiMiddleware.js';
    import {push} from 'svelte-spa-router';
    import {canPerformAction} from 'utils/Permissions.js';
    import {FileArchive, Signature, Warning} from 'phosphor-svelte';
    import SignatureModal from './modals/SignatureModal.svelte';
    import {toast} from 'svelte-sonner';
    import QuillEditor from 'components/inputs/QuillEditor.svelte';
    import {afterUpdate, onMount} from 'svelte';
    import BottomBarFixedSave from 'components/inputs/BottomBarFixedSave.svelte';
    import TipTapEditor from 'components/inputs/TipTapEditor.svelte';
    import SimpleButton from 'components/buttons/simple-button.svelte';
    import {FileInput} from 'components/formBuilder/preview-blocks/index.js';

    sessionToken.useLocalStorage();
    role.useLocalStorage();
    userData.useLocalStorage();
    subPage.useLocalStorage();

    export let changes = false;

    let profileData = {
        first_name: $userData.first_name,
        last_name: $userData.last_name,
        username: $userData.username,
        email: $userData.email,
        avatar_image: null,
        sport_association: $userData.sport_association ? {...$userData.sport_association} : null,
    };

    let files;
    let validation;
    let form;
    let signatureComponent;
    let signatureComponentShow = false;
    let initialData = JSON.stringify(profileData);

    $: profileData, (profileData.username = profileData.username.replace(/\s/g, ''));

    const removeProfilePic = function () {
        files = undefined;
    };

    function readBlob(blob) {
        return new Promise(resolve => {
            let reader = new FileReader();
            reader.readAsDataURL(blob);

            reader.onloadend = function () {
                let base64data = reader.result;
                profileData.avatar_image = base64data;
                resolve(reader.result);
            };
        });
    }

    function toBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    const updateAccountInformation = function () {
        validation.validate().then(async function (status) {
            if (status == 'Valid') {
                // waiting for converting updated image if available
                if (files && files[0]) {
                    //let blob = window.URL.createObjectURL(files[0]);
                    //profileData.avatar_image = readImage(files[0]);
                    let readedBlob = await readBlob(files[0]);
                }
                KTApp.blockPage({
                    overlayColor: '#000000',
                    state: 'primary',
                    message: 'Salvataggio in corso...',
                });
                const url = __bakney.env.HOST + '/profile/update';
                const res = await window.fetch(url, {
                    method: 'PATCH',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + $sessionToken,
                    },
                    body: JSON.stringify({
                        user_data: {...profileData},
                    }),
                });

                const response = await res.json();

                // spinner stop
                KTApp.unblockPage();

                if (res.status == 200) {
                    userData.set(response.user_data);

                    toast.success('Informazioni Salvate con Successo.');
                } else {
                    swal.fire({
                        text: 'Scusa, ho individuato degli errori, riprova.',
                        icon: 'error',
                        buttonsStyling: false,
                        confirmButtonText: 'Ok, capito!',
                        customClass: {
                            confirmButton: 'btn font-weight-bold btn-light-primary',
                        },
                    }).then(function () {
                        KTUtil.scrollTop();
                    });
                }
            } else {
                swal.fire({
                    text: 'Scusa, ho individuato degli errori, per favore riprova.',
                    icon: 'error',
                    buttonsStyling: false,
                    confirmButtonText: 'Ok, capito!',
                    customClass: {
                        confirmButton: 'btn font-weight-bold btn-light-primary',
                    },
                }).then(function () {
                    KTUtil.scrollTop();
                });
            }
        });
    };

    const _handleUpdateAccountInformation = function (e) {
        form = KTUtil.getById('kt_form_account_update');

        // Init form validation rules. For more info check the FormValidation plugin's official documentation:https://formvalidation.io/
        validation = FormValidation.formValidation(form, {
            fields: {
                username: {
                    validators: {
                        notEmpty: {
                            message: 'Username obbligatorio',
                        },
                        remote: {
                            message: 'Lo username è già stato utilizzato.',
                            method: 'GET',
                            url: __bakney.env.HOST + '/oauth2/check/username',
                        },
                    },
                },
            },
            plugins: {
                excluded: new FormValidation.plugins.Excluded({
                    excluded: function () {
                        return profileData.username == $userData.username;
                    },
                }),
                trigger: new FormValidation.plugins.Trigger(),
                bootstrap: new FormValidation.plugins.Bootstrap(),
            },
        });
    };

    jQuery(document).ready(function () {
        _handleUpdateAccountInformation();
    });

    afterUpdate(() => {
        if (JSON.stringify(profileData) != initialData || (files && files[0])) {
            changes = true;
        }
    });

    onMount(() => {
        window.scrollTo(0, 0);
        document.body.style.overflow = 'auto';
    });
</script>

{#if $subPage == 'info'}
    <!--begin::Content-->
    <div class="flex-row-fluid">
        <!--begin::Card-->
        <div class="card card-custom card-stretch">
            <!--begin::Header-->
            <div class="card-header py-3">
                <div class="card-title align-items-start flex-column">
                    <h3 class="card-label font-weight-bolder text-dark font-size-h1">Informazioni</h3>
                    <span class="text-muted font-weight-bold font-size-sm mt-1"
                        >Aggiorna le informazioni relative al tuo account</span>
                </div>
                <div class="card-toolbar">
                    <button
                        id="kt_form_account_update_submit"
                        disabled={!changes}
                        type="reset"
                        class="btn btn-primary font-weight-bolder"
                        on:click={() => updateAccountInformation()}>Salva</button>
                </div>
            </div>
            <!--end::Header-->
            <!--begin::Form-->
            <div id="kt_form_account_update">
                <!--begin::Body-->
                <div class="card-body">
                    <div class="row">
                        <div class="col-12">
                            <h5 class="font-weight-boldest mb-6 font-size-h2">Account</h5>
                        </div>
                    </div>
                    <div class="form-group row">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label class="col-xl-3 col-lg-3 col-form-label text-left font-weight-bold font-size-h7"
                            >Foto Profilo</label>
                        <div class="col-lg-9 col-xl-5">
                            <div
                                class="image-input image-input-outline border rounded-lg"
                                id="kt_profile_avatar"
                                style="width:10rem;height:10rem;cursor:pointer">
                                {#if files && files[0]}
                                    <div
                                        class="image-input-wrapper border rounded-lg"
                                        style="background-image: url({window.URL.createObjectURL(files[0])})" />
                                {:else}
                                    <div
                                        class="image-input-wrapper border rounded-lg"
                                        style="background-image: url({$userData.avatar_image != null
                                            ? $userData.avatar_image
                                            : '/static/assets/media/users/blank.png'})" />
                                {/if}
                                <label
                                    class="btn btn-xs btn-icon btn-circle btn-white btn-hover-text-primary border"
                                    data-action="change"
                                    data-toggle="tooltip"
                                    title=""
                                    data-original-title="Cambia Foto Profilo">
                                    <i class="fa fa-pen icon-sm text-muted" />
                                    <input type="file" accept=".png, .jpg, .jpeg" style="display:contents" bind:files />
                                    <input type="hidden" name="profile_avatar_remove" />
                                </label>
                                <span
                                    class="btn btn-xs btn-icon btn-circle btn-white btn-hover-text-primary border"
                                    on:click={() => removeProfilePic()}
                                    data-action="remove"
                                    data-toggle="tooltip"
                                    title="Rimuovi Foto Profilo">
                                    <i class="ki ki-bold-close icon-xs text-muted" />
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="form-group row">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label class="col-xl-3 col-lg-3 col-form-label text-left font-weight-bold">Nome</label>
                        <div class="col-lg-9 col-xl-5">
                            <input
                                class="form-control rounded-lg form-control-solid"
                                type="text"
                                bind:value={profileData.first_name} />
                        </div>
                    </div>
                    <div class="form-group row">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label class="col-xl-3 col-lg-3 col-form-label text-left font-weight-bold">Cognome</label>
                        <div class="col-lg-9 col-xl-5">
                            <input
                                class="form-control rounded-lg form-control-solid"
                                type="text"
                                bind:value={profileData.last_name} />
                        </div>
                    </div>

                    <div class="form-group row">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label class="col-xl-3 col-lg-3 col-form-label text-left font-weight-bold">Username</label>
                        <div class="col-lg-9 col-xl-5">
                            <input
                                name="username"
                                class="form-control rounded-lg form-control-solid"
                                type="text"
                                bind:value={profileData.username} />
                        </div>
                    </div>
                    <div class="form-group row">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label class="col-xl-3 col-lg-3 col-form-label text-left font-weight-bold">Email</label>
                        <div class="col-lg-9 col-xl-5">
                            <div class="input-group input-group-md rounded-lg input-group-solid">
                                <input
                                    class="form-control rounded-lg form-control-solid opacity-50"
                                    type="text"
                                    disabled
                                    value={profileData.email} />
                            </div>
                            <!-- add comment to update -->
                            <span class="font-size-sm text-dark font-weight-bold"
                                >Per modificare contatta
                                <a href="mailto:{__bakney.OEM_CONFIG?.supportEmail}"
                                    >{__bakney.OEM_CONFIG?.supportEmail}</a>
                            </span>
                        </div>
                    </div>

                    {#if $role == 'association' && canPerformAction('other.settings.read')}
                        <div class="row">
                            <div class="col-lg-9 col-xl-5 mt-12">
                                <h5 class="font-weight-boldest mb-6 font-size-h2">Organizzazione</h5>
                            </div>
                        </div>

                        <div class="form-group row">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="col-xl-3 col-lg-3 col-form-label text-left font-weight-bold"
                                >Denominazione</label>
                            <div class="col-lg-9 col-xl-5">
                                <input
                                    disabled={!canPerformAction('other.settings.update')}
                                    class="form-control rounded-lg form-control-solid"
                                    type="text"
                                    placeholder="Inserisci denominazione..."
                                    bind:value={profileData.sport_association.denomination} />
                            </div>
                        </div>

                        <div class="form-group row">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="col-xl-3 col-lg-3 col-form-label text-left font-weight-bold"
                                >Codice Fiscale</label>
                            <div class="col-lg-9 col-xl-5">
                                <input
                                    disabled={!canPerformAction('other.settings.update')}
                                    class="form-control rounded-lg form-control-solid"
                                    type="text"
                                    placeholder="Inserisci Codice Fiscale..."
                                    bind:value={profileData.sport_association.tax_code} />
                            </div>
                        </div>

                        <div class="form-group row">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="col-xl-3 col-lg-3 col-form-label text-left font-weight-bold"
                                >Partita IVA</label>
                            <div class="col-lg-9 col-xl-5">
                                <input
                                    disabled={!canPerformAction('other.settings.update')}
                                    class="form-control rounded-lg form-control-solid"
                                    type="text"
                                    placeholder="Inserisci Partita IVA..."
                                    bind:value={profileData.sport_association.vat_number} />
                            </div>
                        </div>

                        <div class="form-group row">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="col-xl-3 col-lg-3 col-form-label text-left font-weight-bold">Città</label>
                            <div class="col-lg-9 col-xl-5">
                                <input
                                    disabled={!canPerformAction('other.settings.update')}
                                    class="form-control rounded-lg form-control-solid"
                                    type="text"
                                    placeholder="Inserisci città..."
                                    bind:value={profileData.sport_association.address_city} />
                            </div>
                        </div>

                        <div class="form-group row">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="col-xl-3 col-lg-3 col-form-label text-left font-weight-bold">Cap</label>
                            <div class="col-lg-9 col-xl-5">
                                <input
                                    disabled={!canPerformAction('other.settings.update')}
                                    class="form-control rounded-lg form-control-solid"
                                    type="text"
                                    placeholder="Inserisci CAP..."
                                    bind:value={profileData.sport_association.address_cap} />
                            </div>
                        </div>

                        <div class="form-group row">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="col-xl-3 col-lg-3 col-form-label text-left font-weight-bold">Indirizzo</label>
                            <div class="col-lg-9 col-xl-5">
                                <input
                                    disabled={!canPerformAction('other.settings.update')}
                                    class="form-control rounded-lg form-control-solid"
                                    type="text"
                                    placeholder="Inserisci indirizzo..."
                                    bind:value={profileData.sport_association.address} />
                            </div>
                        </div>

                        <div class="form-group row">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="col-xl-3 col-lg-3 col-form-label text-left font-weight-bold">IBAN</label>
                            <div class="col-lg-9 col-xl-5">
                                <input
                                    disabled={!canPerformAction('other.settings.update')}
                                    class="form-control rounded-lg form-control-solid"
                                    type="text"
                                    placeholder="Inserisci IBAN..."
                                    bind:value={profileData.sport_association.iban} />
                            </div>
                        </div>

                        <div class="form-group row">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="col-xl-3 col-lg-3 col-form-label text-left font-weight-bold">Sito Web</label>
                            <div class="col-lg-9 col-xl-5">
                                <input
                                    disabled={!canPerformAction('other.settings.update')}
                                    class="form-control rounded-lg form-control-solid"
                                    type="text"
                                    placeholder="Inserisci URL sito web..."
                                    bind:value={profileData.sport_association.website} />
                            </div>
                        </div>

                        <div class="form-group row">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="col-xl-3 col-lg-3 col-form-label text-left font-weight-bold"
                                >Nome Abbreviato</label>
                            <div class="col-lg-9 col-xl-5">
                                <input
                                    disabled={!canPerformAction('other.settings.update')}
                                    class="form-control rounded-lg form-control-solid"
                                    type="text"
                                    placeholder="Inserisci nome abbreviato..."
                                    bind:value={profileData.sport_association.abbreviated} />
                            </div>
                        </div>

                        <div class="form-group row">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="col-xl-3 col-lg-3 col-form-label text-left font-weight-bold">WhatsApp</label>
                            <div class="col-lg-9 col-xl-5">
                                <input
                                    disabled={!canPerformAction('other.settings.update')}
                                    class="form-control rounded-lg form-control-solid"
                                    type="text"
                                    placeholder="Inserisci numero WhatsApp o Numero di telefono..."
                                    bind:value={profileData.sport_association.whatsapp} />
                            </div>
                        </div>

                        <div class="form-group row">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="col-xl-3 col-lg-3 col-form-label text-left font-weight-bold"
                                >Federazione</label>
                            <div class="col-lg-9 col-xl-5">
                                <input
                                    disabled={!canPerformAction('other.settings.update')}
                                    class="form-control rounded-lg form-control-solid"
                                    type="text"
                                    placeholder="FISR, CONI..."
                                    bind:value={profileData.sport_association.federation} />
                            </div>
                        </div>

                        <div class="form-group row">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="col-xl-3 col-lg-3 col-form-label text-left font-weight-bold"
                                >Matricola federazione</label>
                            <div class="col-lg-9 col-xl-5">
                                <input
                                    disabled={!canPerformAction('other.settings.update')}
                                    class="form-control rounded-lg form-control-solid"
                                    type="text"
                                    placeholder="Inserisci numero matricola..."
                                    bind:value={profileData.sport_association.enroll_number} />
                            </div>
                        </div>

                        <div class="form-group row">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="col-xl-3 col-lg-3 col-form-label text-left font-weight-bold">Sport</label>
                            <div class="col-lg-9 col-xl-5">
                                <input
                                    disabled={!canPerformAction('other.settings.update')}
                                    class="form-control rounded-lg form-control-solid"
                                    type="text"
                                    placeholder="Inserisci sport..."
                                    bind:value={profileData.sport_association.sport} />
                            </div>
                        </div>

                        <div class="form-group row">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <div class="col-12 font-size-h2 mb-2 mt-8 font-weight-boldest text-dark text-left">
                                Firma del presidente
                            </div>
                            <div
                                class="col-12 col-md-9 p-2 mx-4 mb-6 bg-light d-flex justify-content-between border rounded-lg">
                                {#if profileData.sport_association.president_signature}
                                    <!-- {JSON.stringify(profileData.sport_association.president_signature)} -->
                                    <img
                                        height="100"
                                        src={profileData.sport_association.president_signature}
                                        alt="firma del presidente" />
                                {:else}
                                    Nessuna firma presente, inseriscine una.
                                {/if}
                            </div>
                            <div class="col-12">
                                <SignatureModal
                                    bind:this={signatureComponent}
                                    showPreview={false}
                                    bind:show={signatureComponentShow}
                                    on:close={e => {
                                        profileData.sport_association.president_signature = null;
                                        setTimeout(() => {
                                            profileData.sport_association.president_signature = e.detail;
                                        }, 200);
                                    }}
                                    id="president-signature-settings" />
                                <div class="mt-4 d-flex align-items-center justify-content-start" style="gap: 1rem;">
                                    <FileInput
                                        customClasses={'mx-0 px-0 max-w-12'}
                                        editable={false}
                                        active={false}
                                        props={{
                                            id: 'signature',
                                            name: 'signature',
                                            label: 'Seleziona una firma',
                                            placeholder: 'Inserisci firma',
                                            noPadding: true,
                                            required: false,
                                            multiple: false,
                                            onChange: async e => {
                                                profileData.sport_association.president_signature = await toBase64(
                                                    e.target.files[0]
                                                );
                                            },
                                        }} />

                                    <button
                                        on:click={() => (signatureComponentShow = true)}
                                        class="btn btn-sm btn-dark font-weight-bolder mt-4"
                                        ><Signature size="15" weight="duotone" class="mr-1" /> Scrivi firma
                                    </button>

                                    {#if profileData.sport_association.president_signature}
                                        <button
                                            on:click={() => {
                                                profileData.sport_association.president_signature = null;
                                                document.getElementById('signature').value = '';
                                            }}
                                            class="btn btn-sm btn-danger font-weight-bolder mt-4">
                                            Rimuovi firma
                                        </button>
                                    {/if}
                                </div>
                            </div>
                        </div>

                        <div class="form-group row">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <div class="col-12 font-size-h2 mb-2 mt-8 font-weight-boldest text-dark text-left">
                                Timbro
                            </div>
                            <div
                                class="col-12 col-md-9 p-2 mx-4 mb-6 bg-light d-flex justify-content-between border rounded-lg">
                                {#if profileData.sport_association.stamp}
                                    <!-- {JSON.stringify(profileData.sport_association.stamp)} -->
                                    <img height="100" src={profileData.sport_association.stamp} alt="timbro" />
                                {:else}
                                    Nessuno timbro presente, inseriscine uno.
                                {/if}
                            </div>
                            <div class="col-12 d-flex align-items-center justify-content-start" style="gap: 1rem;">
                                <FileInput
                                    customClasses={'mx-0 px-0 max-w-12'}
                                    editable={false}
                                    active={false}
                                    props={{
                                        id: 'stamp',
                                        name: 'stamp',
                                        label: 'Seleziona un timbro',
                                        placeholder: 'Inserisci timbro',
                                        noPadding: true,
                                        required: false,
                                        multiple: false,
                                        onChange: async e => {
                                            profileData.sport_association.stamp = await toBase64(e.target.files[0]);
                                        },
                                    }} />
                                {#if profileData.sport_association.stamp}
                                    <button
                                        on:click={() => {
                                            profileData.sport_association.stamp = null;
                                            document.getElementById('stamp').value = '';
                                        }}
                                        class="btn btn-sm btn-danger font-weight-bolder mt-4">
                                        Rimuovi timbro
                                    </button>
                                {/if}
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-lg-12 mt-6">
                                <h5 class="font-weight-boldest mb-2 font-size-h2">Moduli d'iscrizione</h5>
                                <p class="font-size-md mb-6 text-dark-75">
                                    Puoi rendere obbligatorie alcune informazioni nella compilazione dei moduli.<br />
                                    <b
                                        >Attenzione, se crei un'anagrafica dal tuo account associazione non verrà
                                        applicato questo obbligo.</b>
                                </p>
                            </div>
                        </div>

                        <div class="form-group row">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="col-xl-5 col-lg-5 col-form-label text-left"
                                >Telefono atleta obbligatorio</label>
                            <div class="col-lg-3 col-xl-3" style="display: flex; align-items: center;">
                                <!-- <label class="col-3 col-form-label">With Icon</label> -->
                                <div class="col-3">
                                    <span class="switch switch-icon">
                                        <label>
                                            <input
                                                disabled={!canPerformAction('other.settings.update')}
                                                type="checkbox"
                                                name=""
                                                bind:checked={profileData.sport_association.configuration
                                                    .mandatory_phone} />
                                            <span />
                                        </label>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="form-group row">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="col-xl-5 col-lg-5 col-form-label text-left">Email tutore obbligatoria</label>
                            <div class="col-lg-3 col-xl-3" style="display: flex; align-items: center;">
                                <!-- <label class="col-3 col-form-label">With Icon</label> -->
                                <div class="col-3">
                                    <span class="switch switch-icon">
                                        <label>
                                            <input
                                                disabled={!canPerformAction('other.settings.update')}
                                                type="checkbox"
                                                name=""
                                                bind:checked={profileData.sport_association.configuration
                                                    .mandatory_tutor_email} />
                                            <span />
                                        </label>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="form-group row">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="col-xl-5 col-lg-5 col-form-label text-left"
                                >Telefono tutore obbligatorio</label>
                            <div class="col-lg-3 col-xl-3" style="display: flex; align-items: center;">
                                <!-- <label class="col-3 col-form-label">With Icon</label> -->
                                <div class="col-3">
                                    <span class="switch switch-icon">
                                        <label>
                                            <input
                                                disabled={!canPerformAction('other.settings.update')}
                                                type="checkbox"
                                                name=""
                                                bind:checked={profileData.sport_association.configuration
                                                    .mandatory_tutor_phone} />
                                            <span />
                                        </label>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="form-group row">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="col-xl-5 col-lg-5 col-form-label text-left">Email atleta obbligatoria</label>
                            <div class="col-lg-3 col-xl-3" style="display: flex; align-items: center;">
                                <!-- <label class="col-3 col-form-label">With Icon</label> -->
                                <div class="col-3">
                                    <span class="switch switch-icon">
                                        <label>
                                            <input
                                                disabled={!canPerformAction('other.settings.update')}
                                                type="checkbox"
                                                name=""
                                                bind:checked={profileData.sport_association.configuration
                                                    .mandatory_email} />
                                            <span />
                                        </label>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="form-group row">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="col-xl-5 col-lg-5 col-form-label text-left"
                                >Firma obbligatoria alla compilazione</label>
                            <div class="col-lg-3 col-xl-3" style="display: flex; align-items: center;">
                                <!-- <label class="col-3 col-form-label">With Icon</label> -->
                                <div class="col-3">
                                    <span class="switch switch-icon">
                                        <label>
                                            <input
                                                disabled={!canPerformAction('other.settings.update')}
                                                type="checkbox"
                                                name=""
                                                bind:checked={profileData.sport_association.configuration
                                                    .mandatory_signature} />
                                            <span />
                                        </label>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-lg-12 mt-6">
                                <h5 class="font-weight-boldest mb-2 font-size-h2">Checkout</h5>
                                <p class="font-size-md mb-2 text-dark-75">
                                    Se desideri aggiungere delle informazioni nel <b>checkout</b> come i dati per i bonifici
                                    puoi inserirli qui.
                                </p>
                            </div>
                        </div>
                        {#if !canPerformAction('other.settings.update')}
                            <div class="mb-6 fs-1-1">
                                {@html profileData.sport_association.checkout_info || ''}
                            </div>
                        {:else}
                            <TipTapEditor
                                isHeader={true}
                                mentions={false}
                                bind:value={profileData.sport_association.checkout_info}
                                placeholder="Inserisci il testo del checkout..." />
                        {/if}

                        <div class="row">
                            <div class="col-lg-12 mt-6">
                                <h5 class="font-weight-boldest mb-2 font-size-h2">Intestazione stampe</h5>
                                <p class="font-size-md mb-2 text-dark-75">
                                    Inserisci il testo dell'intestazione e premi <strong>Salva</strong> quando hai
                                    finito. <b>Lascia il campo vuoto per non renderlo visibile.</b>
                                </p>
                            </div>
                        </div>
                        {#if !canPerformAction('other.settings.update')}
                            <div class="mb-6 fs-1-1">
                                {@html profileData.sport_association.document_header || ''}
                            </div>
                        {:else}
                            <TipTapEditor
                                isHeader={true}
                                bind:value={profileData.sport_association.document_header}
                                placeholder="Inserisci il testo dell'intestazione..." />
                        {/if}

                        <div class="row">
                            <div class="col-lg-12 mt-6">
                                <h5 class="font-weight-boldest mb-2 font-size-h2">Piè di pagina stampe</h5>
                                <p class="font-size-md mb-2 text-dark-75">
                                    Inserisci il testo del piè di pagina e premi <strong>Salva</strong> quando hai
                                    finito. <b>Lascia il campo vuoto per non renderlo visibile.</b>
                                </p>
                            </div>
                        </div>
                        {#if !canPerformAction('other.settings.update')}
                            <div class="mb-6 fs-1-1">
                                {@html profileData.sport_association.invoice_footer || ''}
                            </div>
                        {:else}
                            <TipTapEditor
                                isFooter={true}
                                bind:value={profileData.sport_association.invoice_footer}
                                placeholder="Inserisci il testo dell'intestazione..." />
                        {/if}
                        <div class="col-lg-12 mt-6 px-0">
                            <div class="row">
                                <div class="col-lg-12 mt-6">
                                    <h5 class="font-weight-boldest mb-2 font-size-h2">Testo Extra Ricevute</h5>
                                    <p class="font-size-md mb-2 text-dark-75">
                                        Puoi inserire del testo extra nelle ricevute, lasciando il campo vuoto per non
                                        renderlo visibile.
                                    </p>
                                </div>
                            </div>
                            {#if !canPerformAction('other.settings.update')}
                                <div class="mb-6 fs-1-1">
                                    {@html profileData.sport_association.extra_text_invoices || ''}
                                </div>
                            {:else}
                                <TipTapEditor
                                    bind:value={profileData.sport_association.extra_text_invoices}
                                    placeholder="Inserisci il testo extra..." />
                            {/if}
                        </div>

                        <div class="row">
                            <div class="col-lg-12 mt-6">
                                <h5 class="font-weight-boldest mb-2 font-size-h2">Modello Ricevute</h5>
                                <p class="font-size-md mb-2 text-dark-75">
                                    Puoi cambiare il modello delle ricevute cliccando sui pulsanti qui sotto.
                                </p>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-lg-6">
                                <label
                                    class:border-primary={profileData.sport_association.invoice_template ===
                                        'invoice.html'}
                                    class="option-card d-flex flex-column justify-content-start align-items-center cursor-pointer rounded-xl py-2 border-3 shadow-xs border"
                                    style="max-height: 30rem; overflow: hidden;">
                                    <input
                                        type="radio"
                                        name="invoice_template"
                                        value="invoice.html"
                                        on:change={e => {
                                            profileData.sport_association.invoice_template = e.target.value;
                                        }}
                                        checked={profileData.sport_association.invoice_template === 'invoice.html'}
                                        class="option-card-input" />
                                    <div
                                        class="option-card-box d-flex flex-column justify-content-start align-items-center">
                                        <span
                                            class="font-weight-boldest"
                                            style="font-size: 1.3rem;position: absolute; top: 14rem; z-index: 10; background: var({profileData
                                                .sport_association.invoice_template === 'invoice.html'
                                                ? '--primary'
                                                : '--dark'}); padding: 0.5rem 1rem; border-radius: 2rem; border-top: 1px solid #ffffff6b; box-shadow: 0 .1rem 8rem 1rem #1a0a76; color: #fff; outline: 1px solid var({profileData
                                                .sport_association.invoice_template === 'invoice.html'
                                                ? '--primary'
                                                : '--dark'});">Standard</span>
                                        <img
                                            style="filter: {profileData.sport_association.invoice_template ===
                                            'invoice.html'
                                                ? 'blur(3px) opacity(0.6)'
                                                : 'blur(5px) opacity(0.2) grayscale(100%)'}"
                                            src="static/documents/preview/receipts/invoice.html.png"
                                            alt="Modern Template"
                                            class="img-fluid mb-2" />
                                    </div>
                                </label>
                            </div>
                            <div class="col-lg-6">
                                <label
                                    class:border-primary={profileData.sport_association.invoice_template ===
                                        'invoice_classic.html'}
                                    class="option-card d-flex flex-column justify-content-start align-items-center cursor-pointer rounded-xl py-2 border-3 shadow-xs border"
                                    style="max-height: 30rem; overflow: hidden;">
                                    <input
                                        type="radio"
                                        name="invoice_template"
                                        value="invoice_classic.html"
                                        on:change={e => {
                                            profileData.sport_association.invoice_template = e.target.value;
                                        }}
                                        checked={profileData.sport_association.invoice_template ===
                                            'invoice_classic.html'}
                                        class="option-card-input" />
                                    <div
                                        class="option-card-box d-flex flex-column justify-content-start align-items-center">
                                        <span
                                            class="font-weight-boldest"
                                            style="font-size: 1.3rem;position: relative; top: 14rem; z-index: 10; background: var({profileData
                                                .sport_association.invoice_template === 'invoice_classic.html'
                                                ? '--primary'
                                                : '--dark'}); padding: 0.5rem 1rem; border-radius: 2rem; border-top: 1px solid #ffffff6b; box-shadow: 0 .1rem 8rem 1rem #1a0a76; color: #fff; outline: 1px solid var({profileData
                                                .sport_association.invoice_template === 'invoice_classic.html'
                                                ? '--primary'
                                                : '--dark'});">Classico</span>
                                        <img
                                            style="filter: {profileData.sport_association.invoice_template ===
                                            'invoice_classic.html'
                                                ? 'blur(3px) opacity(0.6)'
                                                : 'blur(5px) opacity(0.2) grayscale(100%)'}"
                                            src="static/documents/preview/receipts/invoice_classic.html.png"
                                            alt="Classic Template"
                                            class="img-fluid mb-2" />
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-lg-12 mt-6">
                                <h5 class="font-weight-boldest mb-2 font-size-h2">Modello Modulo Iscrizione</h5>
                                <p class="font-size-md mb-2 text-dark-75">
                                    Puoi cambiare il modello delle ricevute cliccando sui pulsanti qui sotto.
                                </p>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-lg-6">
                                <label
                                    class:border-primary={profileData.sport_association.subscription_template ===
                                        'subscription.html'}
                                    class="option-card d-flex flex-column justify-content-start align-items-center cursor-pointer rounded-xl py-2 border-3 shadow-xs border"
                                    style="max-height: 30rem; overflow: hidden;">
                                    <input
                                        type="radio"
                                        name="subscription_template"
                                        value="subscription.html"
                                        on:change={e => {
                                            profileData.sport_association.subscription_template = e.target.value;
                                        }}
                                        checked={profileData.sport_association.subscription_template ===
                                            'subscription.html'}
                                        class="option-card-input" />
                                    <div
                                        class="option-card-box d-flex flex-column justify-content-start align-items-center">
                                        <span
                                            class="font-weight-boldest"
                                            style="font-size: 1.3rem;position: relative; top: 14rem; z-index: 10; background: var({profileData
                                                .sport_association.subscription_template === 'subscription.html'
                                                ? '--primary'
                                                : '--dark'}); padding: 0.5rem 1rem; border-radius: 2rem; border-top: 1px solid #ffffff6b; box-shadow: 0 .1rem 8rem 1rem #1a0a76; color: #fff; outline: 1px solid var({profileData
                                                .sport_association.subscription_template === 'subscription.html'
                                                ? '--primary'
                                                : '--dark'});">Standard</span>
                                        <img
                                            style="filter: {profileData.sport_association.subscription_template ===
                                            'subscription.html'
                                                ? 'blur(3px) opacity(0.6)'
                                                : 'blur(5px) opacity(0.2) grayscale(100%)'}"
                                            src="static/documents/preview/subscriptions/subscription.html.png"
                                            alt="Modern Template"
                                            class="img-fluid mb-2" />
                                    </div>
                                </label>
                            </div>
                            <div class="col-lg-6">
                                <label
                                    class:border-primary={profileData.sport_association.subscription_template ===
                                        'subscription_classic.html'}
                                    class="option-card d-flex flex-column justify-content-start align-items-center cursor-pointer rounded-xl py-2 border-3 shadow-xs border"
                                    style="max-height: 30rem; overflow: hidden;">
                                    <input
                                        type="radio"
                                        name="subscription_template"
                                        value="subscription_classic.html"
                                        on:change={e => {
                                            profileData.sport_association.subscription_template = e.target.value;
                                        }}
                                        checked={profileData.sport_association.subscription_template ===
                                            'subscription_classic.html'}
                                        class="option-card-input" />
                                    <div
                                        class="option-card-box d-flex flex-column justify-content-start align-items-center">
                                        <span
                                            class="font-weight-boldest"
                                            style="font-size: 1.3rem;position: relative; top: 14rem; z-index: 10; background: var({profileData
                                                .sport_association.subscription_template === 'subscription_classic.html'
                                                ? '--primary'
                                                : '--dark'}); padding: 0.5rem 1rem; border-radius: 2rem; border-top: 1px solid #ffffff6b; box-shadow: 0 .1rem 8rem 1rem #1a0a76; color: #fff; outline: 1px solid var({profileData
                                                .sport_association.subscription_template === 'subscription_classic.html'
                                                ? '--primary'
                                                : '--dark'});">Classico</span>
                                        <img
                                            style="filter: {profileData.sport_association.subscription_template ===
                                            'subscription_classic.html'
                                                ? 'blur(3px) opacity(0.6)'
                                                : 'blur(5px) opacity(0.2) grayscale(100%)'}"
                                            src="static/documents/preview/subscriptions/subscription_classic.html.png"
                                            alt="Classic Template"
                                            class="img-fluid mb-2" />
                                    </div>
                                </label>
                            </div>
                        </div>
                    {/if}

                    <div in:scale={{duration: 150, start: 0.98}} class="form-group row mb-0 mt-12">
                        <h2 class="col-12 font-weight-boldest">Privacy e Termini d'uso</h2>
                    </div>

                    <div in:scale={{duration: 150, start: 0.98}} class="form-group row">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label class="col-12 col-form-label font-weight-bolder text-left"
                            >Diritto di accesso dell'interessato</label>

                        <div class="col-12 d-flex justify-content-start align-items-center mb-3">
                            <a
                                href="mailto:{__bakney.OEM_CONFIG?.supportEmail}"
                                class="btn btn-sm btn-secondary font-weight-bolder mr-2">Invia un'email di richiesta</a>
                        </div>

                        <div class="col-12 d-flex justify-content-start align-items-center">
                            <small class="text-muted font-size-sm lh-xs">
                                Secondo l'artico 15 del GDPR, hai il diritto di richiedere i dati personali che abbiamo
                                raccolto su di te.
                            </small>
                        </div>
                    </div>

                    {#if $role == 'association'}
                        <div in:scale={{duration: 150, start: 0.98}} class="form-group row">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="col-12 col-form-label font-weight-bolder text-left"
                                >Esporta tutti i tuoi dati (beta)</label>

                            <div class="col-12 d-flex justify-content-start align-items-center mb-3">
                                <!-- svelte-ignore missing-declaration -->
                                <SimpleButton
                                    label="Esporta"
                                    size="sm"
                                    variant="dark"
                                    on:click={async () => {
                                        KTApp.blockPage({
                                            overlayColor: '#000000',
                                            state: 'primary',
                                            message: 'Esportazione in corso non chiudere la pagina...',
                                        });
                                        let res = await fetch(__bakney.env.API.EXPORT_ALL_DATA, {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                Authorization: `Bearer ${$sessionToken}`,
                                            },
                                        });
                                        KTApp.unblockPage();
                                        if (res.status === 200) {
                                            toast.success('Esportazione completata.');

                                            const blob = await res.blob();
                                            const url = window.URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = res.headers.get('Content-Disposition').split('filename=')[1];
                                            document.body.appendChild(a);
                                            a.click();
                                            window.URL.revokeObjectURL(url);
                                            document.body.removeChild(a);
                                        } else {
                                            toast.error('Si è verificato un errore, riprova più tardi.');
                                        }
                                    }}>
                                    <FileArchive size={18} weight="bold" class="mr-1" />
                                    Esporta
                                </SimpleButton>
                            </div>

                            <div class="col-12 d-flex justify-content-start align-items-center">
                                <small class="text-muted font-size-sm lh-xs">
                                    Esporta tutti i tuoi dati, la funzione è correntemente in beta, se hai bisogno di un
                                    export più completo, apri un ticket.
                                </small>
                            </div>
                        </div>
                    {/if}

                    <div in:scale={{duration: 150, start: 0.98}} class="form-group row mb-2 mt-12 border-top pt-6">
                        <h2 class="col-12 font-weight-boldest">Account</h2>
                    </div>

                    <div in:scale={{duration: 150, start: 0.98}} class="form-group row">
                        <div class="col-12 d-flex justify-content-start align-items-center mb-3">
                            <button
                                type="button"
                                on:click={() => {
                                    swal.fire({
                                        title: 'Sei sicuro?',
                                        text: 'Questa azione eliminerà definitivamente il tuo account tra 30 giorni.',
                                        icon: 'warning',
                                        showCancelButton: true,
                                        confirmButtonText: 'Elimina tra 30 gg',
                                        cancelButtonText: 'Annulla',
                                        reverseButtons: true,
                                        customClass: {
                                            confirmButton: 'btn btn-lg btn-danger font-weight-boldest',
                                            cancelButton: 'btn btn-lg btn-light-primary font-weight-boldest',
                                        },
                                    }).then(async result => {
                                        console.info('RESULT: ', result);
                                        if (result.isConfirmed) {
                                            console.info(
                                                'CONFIRMED',
                                                'calling:',
                                                __bakney.env.API.OAUTH2.DELETE_ACCOUNT
                                            );
                                            let res = await apiFetch(__bakney.env.API.OAUTH2.DELETE_ACCOUNT, {
                                                method: 'POST',
                                            });
                                            if (!res.error) {
                                                localStorage.clear();
                                                sessionStorage.clear();
                                                push('/login');
                                                toast.success(
                                                    'Il tuo account è stato sospeso e sarà eliminato tra 30 giorni.'
                                                );
                                            } else {
                                                toast.error('Si è verificato un errore, riprova più tardi.');
                                            }
                                        }
                                    });
                                }}
                                class="btn btn-lg btn-danger font-weight-boldest mr-2"
                                >Elimina definitivamente il mio account</button>
                        </div>

                        <div class="col-12 d-flex justify-content-start align-items-center mb-24">
                            <small class="text-muted font-size-sm lh-xs">
                                Il tuo account verrà eliminato definitivamento dopo 30 giorni dalla richiesta, se non
                                accedi. <br />
                                <b>Per annullare la richiesta, accedi al tuo account prima della scadenza.</b>
                            </small>
                        </div>
                    </div>
                </div>
                <!--end::Body-->
            </div>
            <!--end::Form-->
        </div>
    </div>

    <BottomBarFixedSave on:save={updateAccountInformation} autoShow={true} visible={false}>
        <div slot="left" class="d-flex align-items-center">
            <Warning weight={'duotone'} size={18} class="mr-2 text-warning" />
            <p class="font-weight-boldest mb-0 text-warning text-xs">
                Ricordati di salvare per applicare le modifiche.
            </p>
        </div>
    </BottomBarFixedSave>
{/if}

<svelte:head>
    <style>
        .form-group.row {
            margin-bottom: 0.5rem !important;
        }

        .option-card {
            display: block;
            cursor: pointer;
            margin-bottom: 1rem;
        }

        .option-card-input {
            display: none;
        }
    </style>
</svelte:head>
