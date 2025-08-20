<script>
    import {SunDim, Warning, MoonStars, Smiley} from 'phosphor-svelte';
    import {sessionToken} from 'store/stores.js';
    import {onMount} from 'svelte';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import {scale} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import {toast} from 'svelte-sonner';
    import InplaceTabs from 'components/InplaceTabs.svelte';
    import SubscriptionElement from './partials/subscription-element.svelte';

    let subscriptionList = [];
    let subscriptionId = null;
    let certificate_expring_date = moment().format('DD/MM/YYYY');
    let isValid = false;
    let uploadedFile = false;
    let aiSuggestion = false;
    let isLoading = true;
    let activeTab = 'active';

    let signatureComponent;
    let signatureData;

    $: {
        isValid = !moment(certificate_expring_date, 'DD/MM/YYYY').isBefore(moment());
    }

    async function getSubscriptionList() {
        try {
            isLoading = true;
            subscriptionList = [];
            let res = await apiFetch(__bakney.env.API.SUBSCRIPTION.LIST, {method: 'GET'});
            if (!res.error) {
                subscriptionList = Object.values(res.response.data) || [];
                subscriptionList.forEach(sub => {
                    sub.signature = {there_is_signature: false, data: ''};
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            isLoading = false;
        }
    }

    onMount(async () => {
        await getSubscriptionList();
        jQuery('body').tooltip({selector: '[data-toggle=tooltip]', trigger: 'hover'});

        jQuery('#expiring_certificate').datetimepicker({
            format: 'L',
            locale: 'it',
            useCurrent: false, // workaround the bug that maxDate overwrites defaultDate
            minDate: moment().format('MM/DD/YYYY'),
            defaultDate: moment().format('MM/DD/YYYY'),
        });

        jQuery('#expiring_certificate').on('change.datetimepicker', function (e) {
            certificate_expring_date = e.date.format('DD/MM/YYYY');
            isValid = !moment(certificate_expring_date, 'DD/MM/YYYY').isBefore(moment());
        });

        const uploadMedicalCertificateUrl =
            __bakney.env.HOST + '/subscription/${subscriptionId}/medical-certificate/upload';
        let ktDropzone = new Dropzone('#kt_dropzone', {
            url: uploadMedicalCertificateUrl, // Set the url for your upload script location
            headers: {
                Accept: '*/*',
                Authorization: 'Bearer ' + $sessionToken,
                'Cache-Control': null,
                'X-Requested-With': null,
                Referer: null,
            },
            clickable: true,
            paramName: 'medical_certificate',
            uploadMultiple: false,
            enqueueForUpload: false,
            maxFiles: 1,
            addRemoveLinks: true,
            acceptedFiles: 'image/*,application/pdf',
            maxFilesize: 5, // Max filesize in MB
            dictFallbackMessage: 'Il browser non è supportato.',
            dictDefaultMessage: 'Trascina qui i files.',
            dictFileTooBig: 'Il file è troppo grande: {{filesize}} MB > {{maxFilesize}} MB!',
            dictResponseError: 'Il server ha risposto con ERRORE {{statusCode}}.',
            dictCancelUpload: 'Annulla.',
            dictRemoveFile: 'Rimuovi!',
            dictUploadCanceled: 'Caricamento annullato.',
            dictMaxFilesExceeded: 'È possibile caricare al massimo {{maxFiles}} file.',
            processing: function (file) {
                this.options.url = this.options.url.replace('${subscriptionId}', subscriptionId);
                KTApp.blockPage({
                    overlayColor: '#000000',
                    state: 'primary',
                    message: 'Caricamento in corso...',
                });
            },
            accept: function (file, done) {
                done();
                uploadedFile = true;
            },
            success: function (file, response) {
                aiSuggestion = false;
                // check if key expiring_date is present in response and not null
                if (response.expiring_date) {
                    // set expiring date from format YYYY-MM-DD to DD/MM/YYYY
                    document.getElementById('expiring_certificate').value = moment(
                        response.expiring_date,
                        'YYYY-MM-DD'
                    ).format('DD/MM/YYYY');
                    aiSuggestion = true;
                }
                isValid = true;
                KTApp.unblockPage();
            },
            removedfile: function (file) {
                uploadedFile = false;
                file.previewElement.remove();
            },
        });

        ktDropzone.on('queuecomplete', async function (file) {
            await getSubscriptionList();
        });
    });

    async function setCertificateExpiration() {
        // close modal
        jQuery('#uploadMedicalCertificateModal').modal('hide');
        let res = apiFetch(
            replaceUID(__bakney.env.API.SUBSCRIPTION.MEDICAL_CERTIFICATE.SET_CERTIFICATE_EXPIRATION, subscriptionId),
            {
                method: 'POST',
                body: JSON.stringify({
                    subscription_id: subscriptionId,
                    certificate_expiring_date: certificate_expring_date,
                }),
            }
        );
        Dropzone.forElement('#kt_dropzone').removeAllFiles();
        await getSubscriptionList();

        if (res && !res.error) {
            toast.success('Certificato medico aggiornato con successo.');
        } else {
            toast.error('Qualcosa è andato storto.');
        }
    }
</script>

<!--begin::Entry-->
<div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}} class="d-flex flex-column-fluid">
    <!--begin::Container-->
    <div class="container" style="max-width: 70rem !important;">
        <div class="row">
            <div class="d-flex justify-content-between align-items-center mb-4 mb-md-6 mt-6 mt-md-0 w-full mx-auto">
                <InplaceTabs
                    showHR={false}
                    paddingClass={'pb-2'}
                    disabled={false}
                    on:tabChange={e => {
                        activeTab = e.detail.tabName;
                    }}
                    {activeTab}
                    navigationPages={[
                        {title: 'Iscrizioni attive', tabName: 'active', icon: SunDim},
                        {
                            title: 'Iscrizioni Archiviate',
                            tabName: 'past',
                            icon: MoonStars,
                        },
                    ]} />
            </div>
            {#if activeTab == 'active'}
                <div
                    in:scale|local={{delay: 0, duration: 50, start: 0.98, easing: easing.cubicInOut}}
                    style="width:100%;padding:0!important;">
                    {#each subscriptionList?.filter(sub => sub.is_current) || [] as subscription, id}
                        <SubscriptionElement
                            bind:subscriptionId
                            {subscription}
                            {signatureComponent}
                            {id}
                            {getSubscriptionList} />
                    {/each}
                </div>
            {:else if activeTab == 'past'}
                <div
                    in:scale|local={{delay: 0, duration: 50, start: 0.98, easing: easing.cubicInOut}}
                    style="width:100%;padding:0!important;">
                    {#each subscriptionList?.filter(sub => !sub.is_current) || [] as subscription, id}
                        <SubscriptionElement
                            bind:subscriptionId
                            {subscription}
                            {signatureComponent}
                            {id}
                            {getSubscriptionList} />
                    {/each}
                </div>
            {/if}

            {#if subscriptionList?.filter(sub => sub.is_current)?.length == 0 && activeTab == 'active' && !isLoading}
                <div class="col-12">
                    <div class="d-flex flex-column justify-content-center text-center align-items-center m-12">
                        <Smiley size={64} color="#000" weight="duotone" />
                        <h4 class="text-dark font-weight-boldest mt-4">Nessuna iscrizione attiva</h4>
                        <p class="text-dark-75 font-weight-bold">
                            Compila il modulo d'iscrizione della tua associazione.
                        </p>
                    </div>
                </div>
            {:else if subscriptionList?.filter(sub => !sub.is_current)?.length == 0 && activeTab == 'past' && !isLoading}
                <div class="col-12">
                    <div class="d-flex flex-column justify-content-center text-center align-items-center m-12">
                        <Smiley size={64} color="#000" weight="duotone" />
                        <h4 class="text-dark font-weight-boldest mt-4">Nessuna iscrizione passata</h4>
                        <p class="text-dark-75 font-weight-bold">Non sono presenti iscrizioni passate.</p>
                    </div>
                </div>
            {:else if isLoading}
                <div class="col-12">
                    <div
                        class="d-flex justify-content-center text-center p-3 mt-8 symbol-label font-weight-bolder font-weight-bold font-size-md">
                        <div class="spinner-border text-primary" role="status" />
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>

<!-- Modal-->
<div
    class="modal fade"
    id="uploadMedicalCertificateModal"
    data-backdrop="static"
    tabindex="-1"
    role="dialog"
    aria-labelledby="staticBackdrop"
    aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Certificato Medico</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <i aria-hidden="true" class="ki ki-close" />
                </button>
            </div>
            <div class="modal-body">
                <div class="dropzone dropzone-default" id="kt_dropzone">
                    <div class="dropzone-msg dz-message needsclick">
                        <h3 class="dropzone-msg-title">Trascina o premi per caricare il Certificato Medico.</h3>
                        <span class="dropzone-msg-desc"
                            >Sono supportati file <b>pdf</b> e <b>immagini</b> di grandezza inferiore a
                            <b>5MB</b>.</span>
                    </div>
                </div>
                <div class="col-xl-12 ml-0 pl-0 pt-8">
                    <div class="form-group">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label>Data di scadenza<b>*</b></label>
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                        <div
                            on:click={() => (aiSuggestion = false)}
                            class="input-group input-group-solid date"
                            data-target-input="nearest">
                            <input
                                bind:value={certificate_expring_date}
                                id="expiring_certificate"
                                name="bornDateAssociate"
                                type="text"
                                class="form-control form-control-solid form-control-lg datetimepicker-input"
                                placeholder="Seleziona Data"
                                data-target="#expiring_certificate" />
                            <div
                                class="input-group-append"
                                data-target="#expiring_certificate"
                                data-toggle="datetimepicker">
                                <span class="input-group-text">
                                    <i class="ki ki-calendar" />
                                </span>
                            </div>
                        </div>
                    </div>

                    {#if aiSuggestion}
                        <!-- alert -->
                        <div
                            class="d-flex align-items-center text-bold text-warning bg-light-warning p-4 mb-4"
                            style="border-radius: 0.35rem;">
                            <Warning size={18} weight="duotone" class="mr-2" />
                            La data di scadenza è stata suggerita automaticamente dal sistema.
                        </div>
                    {/if}
                    <div class="col-12 d-flex justify-content-start align-items-center">
                        <small class="text-muted font-size-sm lh-xs">
                            Verrà inviata una mail all'utente e all'associazione per notificare la scadenza del
                            certificato.
                        </small>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-light-primary font-weight-bold" data-dismiss="modal"
                    >Chiudi</button>
                <button
                    on:click|preventDefault={setCertificateExpiration}
                    disabled={!isValid}
                    type="button"
                    class="btn btn-primary font-weight-bold">Salva</button>
            </div>
        </div>
    </div>
</div>
