<script>
    import BasicModal from 'components/modals/BasicModal.svelte';
    import {createEventDispatcher} from 'svelte';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware.js';
    import {toast} from 'svelte-sonner';
    import {Datepicker} from 'components/formBuilder/preview-blocks/index.js';
    import {sessionToken} from 'store/stores.js';
    import {Warning} from 'phosphor-svelte';

    const dispatch = createEventDispatcher();

    export let show = false;
    export let id;
    export let data = {};
    export let mode = 'all'; // 'all' or 'only-date'

    let certificate_expiring_date = moment().format('DD/MM/YYYY');
    let uploadedFile = false;
    let aiSuggestion = false;

    async function handleSubmit(e) {
        e.preventDefault();

        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Salvataggio...',
        });

        const res = await apiFetch(
            replaceUID(__bakney.env.API.SUBSCRIPTION.MEDICAL_CERTIFICATE.SET_CERTIFICATE_EXPIRATION, id),
            {
                method: 'POST',
                body: JSON.stringify({
                    subscription_id: id,
                    certificate_expiring_date: certificate_expiring_date,
                }),
            }
        );

        KTApp.unblockPage();

        if (res.status === 200) {
            toast.success('Certificato medico salvato con successo');
            dispatch('update');
            show = false;
        } else {
            toast.error('Errore durante il salvataggio del certificato medico');
        }
    }

    $: {
        if (show && mode === 'all') {
            // Initialize dropzone when modal is shown
            setTimeout(() => {
                const uploadMedicalCertificateUrl =
                    __bakney.env.HOST + `/subscription/${id}/medical-certificate/upload`;

                let ktDropzone = new Dropzone('#kt_dropzone_medical', {
                    url: uploadMedicalCertificateUrl,
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
                    maxFiles: 1,
                    addRemoveLinks: true,
                    acceptedFiles: 'image/*,application/pdf',
                    maxFilesize: 5,
                    accept: function (file, done) {
                        done();
                        uploadedFile = true;
                    },
                    success: function (file, response) {
                        aiSuggestion = false;
                        if (response.expiring_date) {
                            certificate_expiring_date = moment(response.expiring_date, 'YYYY-MM-DD').format(
                                'DD/MM/YYYY'
                            );
                            aiSuggestion = true;
                        }
                    },
                    removedfile: function (file) {
                        uploadedFile = false;
                        file.previewElement.remove();
                    },
                });
            }, 100);
        }
    }
</script>

<BasicModal
    id="add-medical-certificate-modal"
    bind:show
    title="Certificato Medico"
    showTitle={true}
    showActionButton={true}
    showCancelButton={true}
    showFooter={false}
    modalSize={'md'}
    scrollable={false}
    hideOnClickOutside={false}
    bodyClass={'py-2 px-0'}>
    <form on:submit|preventDefault={handleSubmit}>
        <div class="text-left px-5">
            {#if mode === 'all'}
                <div class="dropzone dropzone-default" id="kt_dropzone_medical">
                    <div class="dropzone-msg dz-message needsclick">
                        <h3 class="dropzone-msg-title">Trascina o premi per caricare il Certificato Medico.</h3>
                        <span class="dropzone-msg-desc">
                            Sono supportati file <b>pdf</b> e <b>immagini</b> di grandezza inferiore a <b>5MB</b>.
                        </span>
                    </div>
                </div>
            {/if}

            <Datepicker
                customClasses={'mx-2 px-0 mt-4'}
                editable={false}
                active={false}
                on:change={e => {
                    certificate_expiring_date = e.target.value;
                }}
                bind:value={certificate_expiring_date}
                props={{
                    id: 'expiring_date',
                    name: 'expiring_date',
                    label: 'Data Scadenza',
                    required: true,
                    format: 'DD/MM/YYYY',
                    value: certificate_expiring_date,
                    minDate: moment().format('DD/MM/YYYY'),
                }} />

            {#if aiSuggestion}
                <div
                    class="d-flex align-items-center text-bold text-warning bg-light-warning p-4 mb-4 mx-2"
                    style="border-radius: 0.35rem;">
                    <Warning size={18} weight="duotone" class="mr-2" />
                    La data di scadenza è stata suggerita automaticamente dal sistema.
                </div>
            {/if}

            <div class="col-12 d-flex justify-content-start align-items-center mt-4">
                <small class="text-muted font-size-sm lh-xs">
                    Verrà inviata una mail all'utente e all'associazione per notificare la scadenza del certificato.
                </small>
            </div>
        </div>

        <div class="modal-footer d-flex justify-content-end mt-2">
            <button type="button" class="btn btn-light-primary font-weight-bold" on:click={() => (show = false)}>
                Annulla
            </button>
            <button type="submit" class="btn btn-primary font-weight-bold"> Salva </button>
        </div>
    </form>
</BasicModal>
