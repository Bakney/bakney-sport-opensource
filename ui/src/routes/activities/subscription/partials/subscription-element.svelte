<script>
    import {scale} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import Tessera from 'routes/association/Members/detail/sections/subcomponents/Tessera.svelte';
    import {
        ListChecks,
        Calendar,
        Ticket,
        Warning,
        PencilSimple,
        FileArrowUp,
        Signature,
        Swap,
        CaretCircleDoubleDown,
        CaretCircleDoubleUp,
        Repeat,
        FirstAidKit,
    } from 'phosphor-svelte';
    import DocumentButton from 'components/buttons/DocumentButton.svelte';
    import CertificateButton from 'components/buttons/CertificateButton.svelte';
    import SignatureModal from 'routes/association/Members/modals/SignatureModal.svelte';
    import {toast} from 'svelte-sonner';
    import RenewalModal from 'routes/association/Members/modals/RenewalModal.svelte';

    export let subscription;
    export let subscriptionId;
    export let signatureComponent;
    export let id;
    export let getSubscriptionList = () => {};

    let collapsed = true;

    const updateSubscription = id => {
        subscriptionId = id;
    };

    let statusMedicalCertificateDictionary = {
        valid: '<span class="font-weight-bolder">[DAYS] giorni rimanenti</span>',
        expiring: '<span class="font-weight-bolder">[DAYS] giorni rimanenti</span>',
        expired: '<span class="font-weight-bolder text-danger">certificato scaduto</span>',
        not_present: '<span class="font-weight-bolder text-danger">scadenza certificato mancante</span>',
    };

    let statusMedicalCertificateColorDictionary = {
        valid: 'success',
        expiring: 'warning',
        expired: 'danger',
        not_present: 'danger',
    };

    let statusMap = {
        1: 'Non Firmata',
        2: 'In Attesa',
        3: 'Rifiutata',
        4: 'Accettata',
        5: 'Archiviata',
    };

    let statusColorMap = {
        1: 'light-info',
        2: 'light-warning',
        3: 'light-danger',
        4: 'light-success',
        5: 'light-dark',
    };

    let statusColorTextMap = {
        1: 'info',
        2: 'warning',
        3: 'danger',
        4: 'success',
        5: 'dark',
    };

    let statusIconMap = {
        1: 'fas fa-signature',
        2: 'far fa-clock',
        3: 'far fa-times-circle',
        4: 'far fa-check-circle',
        5: 'fas fa-archive',
    };

    let statusFlagColorMap = {
        1: 'light-warning',
        2: 'light-success',
        3: 'light-danger',
    };

    function getExpirationDaysColor(row) {
        const currentDate = new Date();
        const expirationDate = new Date(row.medical?.expiration_date);
        let daysLeft = Math.max(Math.floor((expirationDate - currentDate) / (1000 * 60 * 60 * 24)), 0);

        let medicalCertificateKey = 'not_present';

        if (row.medical != null) {
            if (daysLeft <= 0) {
                medicalCertificateKey = 'expired';
            } else if (daysLeft <= 30) {
                medicalCertificateKey = 'expiring';
            } else {
                medicalCertificateKey = 'valid';
            }
        }
        return statusMedicalCertificateColorDictionary[medicalCertificateKey];
    }

    async function payInOneFee(course_course_id, subscription_id, fee) {
        swal.fire({
            html: `Vuoi sostituire le rate con il pagamento in un'unica soluzione?<br> <br> <b style="font-size: 1rem;">Il costo della rata è ${fee}€</b> <br> <span class="text-danger font-size-sm">(sostituisce solo le rate non ancora pagate)</span>`,
            icon: 'question',
            buttonsStyling: true,
            showCancelButton: true,
            cancelButtonText: 'Annulla',
            confirmButtonText: 'Applica',
            reverseButtons: true,
        }).then(async function (result) {
            if (result.isConfirmed) {
                KTApp.blockPage({
                    overlayColor: '#000000',
                    state: 'primary',
                    message: 'Cambio pagamento in corso...',
                });
                const url = replaceUID(
                    replaceUID(__bakney.env.API.COURSE.SUBSCRIPTION.UPDATE, course_course_id),
                    subscription_id,
                    '<sub_uid>'
                );

                let data = {
                    one_fee_payment: true,
                };

                let res = await apiFetch(url, {
                    method: 'POST',
                    body: JSON.stringify(data),
                });

                // spinner stop
                KTApp.unblockPage();

                if (res.status == 200) {
                    toast.success('Cambiato il tipo pagamento.');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    let modalText =
                        res.status == 403 ? 'Operazione non permessa.' : 'Scusa, ho individuato degli errori, riprova.';
                    swal.fire({
                        text: modalText,
                        icon: 'error',
                        buttonsStyling: false,
                        confirmButtonText: 'Ok!',
                        customClass: {
                            confirmButton: 'btn font-weight-bold btn-light-primary',
                        },
                    });
                }
            }
        });
    }

    function getExpirationDays(row) {
        const currentDate = new Date();
        const expirationDate = new Date(row.medical?.expiration_date);
        let daysLeft = Math.max(Math.floor((expirationDate - currentDate) / (1000 * 60 * 60 * 24)), 0);

        let medicalCertificateKey = 'not_present';

        if (row.medical != null) {
            if (daysLeft <= 0) {
                medicalCertificateKey = 'expired';
            } else if (daysLeft <= 30) {
                medicalCertificateKey = 'expiring';
            } else {
                medicalCertificateKey = 'valid';
            }
        }
        return statusMedicalCertificateDictionary[medicalCertificateKey].replace('[DAYS]', daysLeft);
    }
</script>

<div
    in:scale|local={{delay: 20 * id, duration: 50, start: 0.98, easing: easing.cubicInOut}}
    class="col-lg-12 {window.innerWidth <= 768
        ? 'border-bottom shadow-sm mb-2'
        : 'border rounded-lg mb-12'} overflow-hidden mx-0 mx-md-4">
    <div class="card card-custom">
        <div class="card card-custom">
            <div class="card-body pt-0 d-flex flex-column">
                <div
                    class="d-flex flex-column flex-md-row justify-content-between align-items-center"
                    style="gap:4rem;">
                    <Tessera member={subscription} />
                    <div
                        class="d-flex flex-wrap flex-md-column justify-content-center align-items-center align-items-md-end"
                        style="gap: 0.75rem;">
                        <span
                            class="mb-0 mb-md-4 d-flex border align-items-center justify-content-center py-2 px-4 rounded-lg text-{statusColorTextMap[
                                subscription.status_flag
                            ]} bg-{statusColorMap[
                                subscription.status_flag
                            ]} font-weight-boldest d-flex align-items-top mr-2">
                            <i
                                class="icon {statusIconMap[subscription.status_flag]} text-{statusColorTextMap[
                                    subscription.status_flag
                                ]}  p-0 mr-2" />
                            {statusMap[subscription.status_flag]}
                        </span>
                        <a
                            class="btn btn-sm btn-secondary font-weight-boldest mr-2 d-flex"
                            href="/#/subscription/detail/{subscription.subscription_id}">
                            <PencilSimple size="15" weight="duotone" />
                            <span class="ml-2">Dati anagrafici</span>
                        </a>

                        {#if subscription.status_flag == 1}
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <!-- svelte-ignore a11y-no-static-element-interactions -->
                            <a
                                class="btn btn-sm btn-secondary font-weight-boldest d-flex align-items-center mr-2"
                                id="open_signature_modal-{subscription.subscription_id}"
                                on:click={() => {
                                    let sign = new SignatureModal({
                                        target: document.body,
                                        props: {
                                            id: subscription.subscription_id,
                                            show: true,
                                        },
                                    });
                                    sign.$on('close', async () => {
                                        toast.success('Firma aggiunta con successo.');
                                        setTimeout(async () => {
                                            await getSubscriptionList();
                                        }, 500);
                                    });
                                }}>
                                <Signature size="15" weight="duotone" class="mr-1" />
                                Firma modulo
                            </a>
                        {/if}

                        {#if !subscription.medical}
                            <span data-toggle="tooltip" data-placement="bottom" title="Carica Certificato Medico">
                                <!-- svelte-ignore a11y-missing-attribute -->
                                <!-- svelte-ignore a11y-click-events-have-key-events -->
                                <!-- svelte-ignore a11y-no-static-element-interactions -->
                                <a
                                    on:click={() => updateSubscription(subscription.subscription_id)}
                                    class="btn btn-sm btn-secondary font-weight-boldest mr-2"
                                    data-toggle="modal"
                                    data-target="#uploadMedicalCertificateModal">
                                    <FileArrowUp size="15" weight="duotone" class="mr-1" />
                                    Carica certificato medico
                                </a>
                            </span>
                        {:else if subscription.medical}
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <!-- svelte-ignore a11y-no-static-element-interactions -->
                            <span
                                data-toggle="tooltip"
                                data-placement="bottom"
                                title="Aggiorna Certificato Medico"
                                on:click={() => updateSubscription(subscription.subscription_id)}>
                                <!-- svelte-ignore a11y-missing-attribute -->
                                <a
                                    class="btn btn-sm btn-secondary font-weight-boldest d-flex align-items-center mr-2"
                                    data-toggle="modal"
                                    data-target="#uploadMedicalCertificateModal">
                                    <Swap size="15" weight="duotone" class="mr-1" />
                                    Aggiorna certificato medico
                                </a>
                            </span>
                        {/if}

                        <div
                            class="d-flex align-items-center justify-content-center justify-content-md-end mt-0 mt-md-4">
                            <!-- svelte-ignore a11y-missing-attribute -->
                            <!-- svelte-ignore missing-declaration -->
                            <DocumentButton
                                on:open={() =>
                                    downloadPdf(`${__bakney.env.API.DOCUMENT.RETRIEVE}/${subscription.document_pdf}`)}
                                popover_text="Scarica Modulo d'Iscrizione" />

                            {#if subscription.medical}
                                <!-- svelte-ignore missing-declaration -->
                                <CertificateButton
                                    on:open={() =>
                                        downloadPdf(
                                            `${__bakney.env.API.DOCUMENT.RETRIEVE}/${subscription.medical?.document_id}`
                                        )}
                                    popover_text="Scarica Certificato Medico" />
                            {/if}
                        </div>
                    </div>
                </div>
                <div class="w-100 mt-12 d-flex justify-content-center">
                    <button
                        class="btn btn-outline-secondary btn-sm font-weight-boldest d-flex align-items-center"
                        type="button"
                        on:click={() => {
                            collapsed = !collapsed;
                        }}>
                        {#if collapsed}
                            <CaretCircleDoubleDown size={20} weight="duotone" class="mr-2" />
                            Mostra dettagli
                        {:else}
                            <CaretCircleDoubleUp size={20} weight="duotone" class="mr-2" />
                            Nascondi dettagli
                        {/if}
                    </button>
                </div>
                <div class="w-100 mt-4" class:d-none={collapsed}>
                    <h3 class="font-weight-st text-dark-75">Certificato Medico</h3>
                    <div class="d-flex mt-4 mb-12">
                        {#if subscription?.medical}
                            <span
                                class="font-weight-bold d-flex align-items-center text-{getExpirationDaysColor(
                                    subscription
                                )}">
                                <span class="svg-icon svg-icon-xl svg-icon-{getExpirationDaysColor(subscription)}">
                                    <FirstAidKit size={24} weight="duotone" class="text-primary" />
                                </span>
                                <span class="ml-1">
                                    {@html getExpirationDays(subscription)}
                                </span>
                            </span>
                        {:else}
                            <span class="font-weight-bolder d-flex align-items-center rounded text-warning">
                                <Warning size="19" weight="duotone" class="mr-2" />
                                Scadenza certificato mancante
                            </span>
                        {/if}
                    </div>

                    <h3 class="font-weight-bolder text-dark-75 mt-12">Corsi</h3>
                    <div class="mb-8" style={subscription?.courses?.length == 0 ? 'pointer-events: none;' : ''}>
                        {#if subscription?.courses?.length > 0}
                            <div
                                class="accordion accordion-solid accordion-toggle-plus"
                                id="accordion-{subscription.subscription_id}">
                                <div class="card mt-4">
                                    <div class="card-header" style="padding: 0 !important;">
                                        <div
                                            class="card-title collapsed p-4"
                                            data-toggle="collapse"
                                            data-target="#accordion-collapse-{subscription.subscription_id}">
                                            <div
                                                class="card-label font-weight-boldest d-flex align-items-center justify-content-start">
                                                <span class="label label-md label-primary font-weight-boldest mr-2"
                                                    >{subscription?.courses?.length}</span>
                                                Corsi associati
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        id="accordion-collapse-{subscription.subscription_id}"
                                        class="collapse"
                                        data-parent="#accordion-{subscription.subscription_id}">
                                        <div class="tab-content px-0 pt-6">
                                            <!--begin::Tap pane-->
                                            <div class="tab-pane fade show active">
                                                {#each Array.from(subscription?.courses || []) || [] as course}
                                                    <!--begin::Item-->
                                                    <div class="d-flex justify-content-between pb-6 px-0">
                                                        <div class="d-flex">
                                                            <!--begin::Bullet-->
                                                            <span
                                                                class="bullet bullet-bar bg-light-primary align-self-stretch mr-4 my-1" />
                                                            <!--end::Bullet-->
                                                            <!--begin::Text-->
                                                            <div class="d-flex flex-column flex-grow-1">
                                                                <!-- svelte-ignore a11y-missing-attribute -->
                                                                <a
                                                                    class="text-dark-75 text-hover-primary font-weight-bolder font-size-lg mb-1">
                                                                    {course.course__title}
                                                                </a>
                                                                <span class="text-muted font-weight-bold"
                                                                    >Iscritto il {new Date(
                                                                        course.creation_date
                                                                    ).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                        <div
                                                            class="d-flex flex-column flex-md-row align-items-end align-items-md-center gap-1">
                                                            <div class="m-1 mr-0 d-flex align-items-center">
                                                                <a
                                                                    href="/#/payment/list/{course.course_subscription_id}"
                                                                    style="padding: 0.45rem !important;{course.course__one_fee_payment &&
                                                                    !course.one_fee_payment
                                                                        ? 'border-radius: 0.55rem 0 0 0.55rem !important;'
                                                                        : ''}"
                                                                    class="btn btn-sm btn-primary font-weight-bold label-lg">
                                                                    Pagamenti
                                                                </a>
                                                                {#if course.course__one_fee_payment && !course.one_fee_payment}
                                                                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                                                                    <!-- svelte-ignore a11y-missing-attribute -->
                                                                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                                                                    <a
                                                                        on:click={() => {
                                                                            payInOneFee(
                                                                                course.course__course_id,
                                                                                subscription.subscription_id,
                                                                                course.course__one_fee
                                                                            );
                                                                        }}
                                                                        style="border-radius: 0 0.55rem 0.55rem 0 !important;padding: .45rem !important"
                                                                        class="btn btn-sm btn-light-primary font-weight-boldest label-lg">
                                                                        cambia in rata unica
                                                                    </a>
                                                                {/if}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <!--end:Item-->
                                                {/each}
                                            </div>
                                            <!--end::Tap pane-->
                                        </div>
                                    </div>
                                </div>
                            </div>
                        {:else}
                            <div
                                class="d-flex justify-content-center text-center p-3 mt-8 symbol-label font-weight-bolder font-weight-bold font-size-md"
                                style="border: 0.15rem dashed #e9e9e9; border-radius: 0.4rem;color: #b0b2b5;">
                                Iscrivi l'atleta ad un corso per visualizzare i dettagli.
                            </div>
                        {/if}
                    </div>

                    <h3 class="font-weight-bolder text-dark-75 mt-12">Dettagli</h3>
                    <div class="pt-2">
                        <a
                            href="/#/subscription/list/detail/{subscription.subscription_id}/attendance"
                            class="btn btn-sm btn-light font-weight-boldest m-1">
                            <ListChecks size="19" weight="duotone" />
                            <span class="ml-1">Registro Presenze</span>
                        </a>
                        <a
                            href="/#/subscription/list/detail/{subscription.subscription_id}/calendar"
                            class="btn btn-sm btn-light font-weight-boldest m-1">
                            <Calendar size="19" weight="duotone" />
                            <span class="ml-1">Calendario Lezioni</span>
                        </a>
                        {#if subscription?.carnets}
                            <a
                                href="/#/subscription/list/detail/{subscription.subscription_id}/carnet"
                                class="btn btn-sm btn-light font-weight-boldest m-1">
                                <Ticket size="19" weight="duotone" />
                                <span class="ml-1">Carnet</span>
                            </a>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .card-header,
    .card-body,
    .card-footer {
        padding: 1.5rem !important;
    }
</style>
