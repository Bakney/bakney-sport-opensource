<script>
    import {onMount} from 'svelte';
    import {signature, sessionToken, medicalCertificate} from 'store/stores.js';
    import {Warning} from 'phosphor-svelte';

    signature.useLocalStorage();
    sessionToken.useLocalStorage();
    medicalCertificate.useLocalStorage();

    let aiSuggestion = false;

    const uploadMedicalCertificateUrl = __bakney.env.HOST + '/document/medical/certificate/';

    onMount(() => {
        $medicalCertificate.certificate_expring_date = moment().format('DD/MM/YYYY');

        jQuery('#expiring_certificate').datetimepicker({
            format: 'L',
            locale: 'it',
            useCurrent: false, // workaround the bug that maxDate overwrites defaultDate
            minDate: moment().format('MM/DD/YYYY'),
            defaultDate: moment().format('MM/DD/YYYY'),
        });

        jQuery('#expiring_certificate').on('change.datetimepicker', function (e) {
            $medicalCertificate.certificate_expring_date = e.date.format('DD/MM/YYYY');
        });
    });

    jQuery(document).ready(function () {
        const medicalCertificateUpload = function () {
            // set the dropzone container id
            var id = '#kt_dropzone';

            // set the preview element template
            var previewNode = jQuery(id + ' .dropzone-item');
            previewNode.id = '';
            var previewTemplate = document.querySelector('.dropzone-items').innerHTML; //previewNode.parent('.dropzone-items').html();
            previewNode.remove();

            var myDropzone5 = new Dropzone(id, {
                // Make the whole body a dropzone
                url: uploadMedicalCertificateUrl, // Set the url for your upload script location
                headers: {
                    Accept: '*/*',
                    Authorization: 'Bearer ' + $sessionToken,
                    'Cache-Control': null,
                    'X-Requested-With': null,
                    Referer: null,
                },
                paramName: 'medical_certificate',
                parallelUploads: 1,
                uploadMultiple: false,
                enqueueForUpload: false,
                maxFiles: 1,
                acceptedFiles: 'image/*,application/pdf',
                maxFilesize: 5, // Max filesize in MB
                previewTemplate: previewTemplate,
                previewsContainer: id + ' .dropzone-items', // Define the container to display the previews
                clickable: id + ' .dropzone-select', // Define the element that should be used as click trigger to select files.
                dictFallbackMessage: 'Il browser non è supportato.',
                dictDefaultMessage: 'Trascina qui i files.',
                dictFileTooBig: 'Il file è troppo grande: {{filesize}} MB > {{maxFilesize}} MB!',
                dictResponseError: 'Il server ha risposto con ERRORE {{statusCode}}.',
                dictCancelUpload: 'Annulla.',
                dictUploadCanceled: 'Caricamento annullato.',
                dictMaxFilesExceeded: 'È possibile caricare al massimo {{maxFiles}} file.',
            });

            myDropzone5.on('processing', function (file) {
                KTApp.blockPage({
                    overlayColor: '#000000',
                    state: 'primary',
                    message: 'Caricamento in corso...',
                });
            });

            myDropzone5.on('addedfile', function (file) {
                // Hookup the start button
                jQuery(document)
                    .find(id + ' .dropzone-item')
                    .css('display', '');
            });

            myDropzone5.on('success', function (file, response) {
                $medicalCertificate.medical_id = response.uid;
                $medicalCertificate.filename = file.name;
                medicalCertificate.set($medicalCertificate);
                aiSuggestion = false;
                // check if key expiring_date is present in response and not null
                if (response.expiring_date) {
                    // set expiring date from format YYYY-MM-DD to DD/MM/YYYY
                    document.getElementById('expiring_certificate').value = moment(
                        response.expiring_date,
                        'YYYY-MM-DD'
                    ).format('DD/MM/YYYY');
                    aiSuggestion = true;
                    $medicalCertificate.certificate_expring_date = moment(response.expiring_date, 'YYYY-MM-DD').format(
                        'DD/MM/YYYY'
                    );
                }
                KTApp.unblockPage();
            });

            myDropzone5.on('removedfile', function (file) {
                medicalCertificate.set({medical_id: null, filename: ''});
            });

            // Update the total progress bar
            myDropzone5.on('totaluploadprogress', function (progress) {
                jQuery(id + ' .progress-bar').css('width', progress + '%');
            });

            myDropzone5.on('sending', function (file) {
                // Show the total progress bar when upload starts
                jQuery(id + ' .progress-bar').css('opacity', '1');
            });

            // Hide the total progress bar when nothing's uploading anymore
            myDropzone5.on('complete', function (progress) {
                var thisProgressBar = id + ' .dz-complete';
                setTimeout(function () {
                    jQuery(thisProgressBar + ' .progress-bar, ' + thisProgressBar + ' .progress').css('opacity', '0');
                }, 300);
            });
        };

        medicalCertificateUpload();
    });
</script>

<div class="pb-5" data-wizard-type="step-content">
    <h4 class="mb-10 font-weight-bold text-dark wizard-title-info">Certificato Medico</h4>

    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="subtitle-label">Hai già un certificato medico?</label>
    <span class="form-text text-muted" style="display: block;">
        Puoi caricare il tuo <b>certificato medico</b> già ora, altrimenti puoi saltare questo passaggio premendo su
        <b>continua</b>.
    </span>

    <div class="dropzone dropzone-multi" id="kt_dropzone">
        <div class="dropzone-panel mb-lg-0 mb-2">
            <!-- svelte-ignore a11y-missing-attribute -->
            <a class="dropzone-select btn btn-primary font-weight-bold" style="margin-top: 2rem"
                ><i class="flaticon-upload" style="vertical-align: text-top" /> Carica Certificato</a>
        </div>

        <div class="dropzone-items">
            <div class="dropzone-item" style="display:none">
                <div class="dropzone-file">
                    <div class="dropzone-filename" title="file caricato!">
                        <span data-dz-name="">file caricato!</span>
                        <strong
                            >(
                            <span data-dz-size="">340kb</span>)</strong>
                    </div>
                    <div class="dropzone-error" data-dz-errormessage="Errore nel caricamento del file." />
                </div>
                <div class="dropzone-progress">
                    <div class="progress">
                        <div
                            class="progress-bar bg-primary"
                            role="progressbar"
                            aria-valuemin="0"
                            aria-valuemax="100"
                            aria-valuenow="0"
                            data-dz-uploadprogress="" />
                    </div>
                </div>
                <div class="dropzone-toolbar">
                    <span class="dropzone-delete" data-dz-remove="">
                        <i class="flaticon2-cross" />
                    </span>
                </div>
            </div>
        </div>
        <span class="form-text text-muted">La dimensione massima del file è 5MB.</span>
    </div>
    <div class="col-xl-12 ml-0 pl-0 pt-8">
        <div class="form-group">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label>Data di scadenza</label>
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div
                class="input-group input-group-solid date"
                on:click={() => (aiSuggestion = false)}
                data-target-input="nearest">
                <input
                    bind:value={$medicalCertificate.certificate_expring_date}
                    id="expiring_certificate"
                    name="expiringCertificate"
                    type="text"
                    class="form-control form-control-solid form-control-lg datetimepicker-input"
                    placeholder="Seleziona Data"
                    data-target="#expiring_certificate" />
                <div class="input-group-append" data-target="#expiring_certificate" data-toggle="datetimepicker">
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
                Verrà inviata una mail all'utente e all'associazione per notificare la scadenza del certificato.
            </small>
        </div>
    </div>
</div>
