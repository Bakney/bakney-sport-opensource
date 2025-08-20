<script>
    import {onMount} from 'svelte';
    import {sessionToken} from 'store/stores.js';
    import {toast} from 'svelte-sonner';

    export let ktDropzone;
    export let valid = false;
    export let fileData = {};
    export let file;

    onMount(() => {
        ktDropzone = new Dropzone('#import_dropzone', {
            url: __bakney.env.API.SUBSCRIPTION.IMPORT.UPLOAD, // Set the url for your upload script location
            headers: {
                Accept: '*/*',
                Authorization: 'Bearer ' + $sessionToken,
                'Cache-Control': null,
                'X-Requested-With': null,
                Referer: null,
            },
            clickable: true,
            paramName: 'associates_file', // The name that will be used to transfer the file
            uploadMultiple: false,
            enqueueForUpload: false,
            maxFiles: 1,
            addRemoveLinks: true,
            acceptedFiles:
                'text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            maxFilesize: 15, // Max filesize in MB
            dictFallbackMessage: 'Il browser non è supportato.',
            dictDefaultMessage: 'Trascina qui i files.',
            dictFileTooBig: 'Il file è troppo grande: {{filesize}} MB > {{maxFilesize}} MB!',
            dictResponseError: 'Il server ha risposto con ERRORE {{statusCode}}.',
            dictCancelUpload: 'Annulla.',
            dictRemoveFile: 'Rimuovi!',
            dictUploadCanceled: 'Caricamento annullato.',
            dictMaxFilesExceeded: 'È possibile caricare al massimo {{maxFiles}} file.',
            accept: function (file_accepted, done) {
                done();
                valid = ktDropzone?.getAcceptedFiles().length == 1 || false;
                file = file_accepted;
            },
            success: function (file, response) {
                if (response.error) {
                    toast.error(response.error);
                    this.removeFile(file);
                } else {
                    fileData = response;
                    fileData.associates_file = file;
                    fileData.default = {};
                    // toast.success('File caricato con successo!');
                }
            },
        });

        ktDropzone.on('maxfilesexceeded', function (file) {
            ktDropzone.removeAllFiles();
            ktDropzone.addFile(file);
        });

        ktDropzone.on('reset', function () {
            valid = false;
        });
    });
</script>

<div class="pb-5" data-wizard-type="step-content" data-wizard-state="current">
    <h4 class="mb-10 font-weight-bold text-dark text-lg">Seleziona il file da importare</h4>
    <div class="form-group">
        <div class="dropzone dropzone-default" id="import_dropzone">
            <div class="dropzone-msg dz-message needsclick">
                <h3 class="dropzone-msg-title">Trascina o premi per caricare il file contenente soci e tesserati.</h3>
                <span class="dropzone-msg-desc"
                    >Sono supportati file <b>.xls/.xlsx</b>, <b>.csv</b> o <b>.ods</b> di grandezza inferiore a
                    <b>15MB</b>.</span>
            </div>
        </div>
        <p class="text-left mt-2">
            Ti suggeriamo di seguire il formato del template per importare con successo gli atleti.
        </p>
        <div class="w-100 mt-12">
            <p class="text-left">
                <span class="font-weight-boldest h6">Che formato deve avere il file?</span><br />
                <a href="/static/templates/Template_Atleti_Bakney_Sport.xlsx" class="font-weight-bolder"
                    >Scarica il file di esempio in .xlsx</a>
            </p>
            <p class="text-left">
                <span class="font-weight-boldest h6">Posso importare un file con un formato diverso?</span><br />
                Sì, dovrai collegare manualmente le colonne corrispondenti, se hai bisogno di aiuto contattaci aprendo un
                ticket dalla barra laterale a sinistra
                <code class="font-weight-boldest">Altro &gt; Assistenza Tecnica</code>
            </p>
        </div>
    </div>
</div>
