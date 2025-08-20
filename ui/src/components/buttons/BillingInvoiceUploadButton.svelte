<script>
    import {scale} from 'svelte/transition';
    import {FileArrowUp} from 'phosphor-svelte';
    import {createEventDispatcher} from 'svelte';
    import Portal from 'svelte-portal';
    import * as easing from 'svelte/easing';
    import {apiFetch} from 'utils/ApiMiddleware';
    import {toast} from 'svelte-sonner';

    const dispatch = createEventDispatcher();

    export let disabled = false;
    export let hidden = false;
    export let popover_text = 'Carica fattura';
    export let sport_association_id;

    let randomId = Math.random().toString(36).substring(7);
    let saveDisabled = true;

    $: {
        if (disabled) {
            popover_text = 'Non puoi caricare la fattura';
        } else {
            popover_text = 'Carica fattura';
        }
    }

    function updateSaveDisabled() {
        saveDisabled =
            document.getElementById(`file-${randomId}`).files?.length == 0 ||
            document.getElementById(`invoice_date-${randomId}`).value == '';
    }

    function open(event) {
        event.preventDefault();
        dispatch('open');
    }

    function toBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
        });
    }
</script>

<span data-toggle="modal" data-target="#upload-billing-invoice-{randomId}">
    <button
        {disabled}
        in:scale={{duration: 150, start: 0.9, easing: easing.backOut}}
        class="btn btn-xs btn-clean btn-icon text-primary m-0 mr-2 {hidden ? 'd-none' : ''}"
        data-toggle="tooltip"
        data-placement="bottom"
        title={popover_text}
        on:touchend={open}
        on:click={open}>
        <FileArrowUp size="24" weight="duotone" />
    </button>
</span>

<Portal>
    <div
        class="modal fade"
        id="upload-billing-invoice-{randomId}"
        style="padding:0!important"
        data-backdrop="static"
        tabindex="-1"
        role="dialog"
        aria-labelledby="staticBackdrop"
        aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Carica Fattura</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <i aria-hidden="true" class="ki ki-close" />
                    </button>
                </div>
                <div class="modal-body" on:change={updateSaveDisabled}>
                    <!-- input file name -->
                    <div class="form-group">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label>Fattura</label>
                        <div class="custom-file">
                            <input
                                type="file"
                                id="file-{randomId}"
                                name="file"
                                class="form-control form-control-solid form-control-lg" />
                        </div>
                    </div>
                    <!-- data fattura -->
                    <div class="form-group">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label>Data Emissione Fattura</label>
                        <input
                            type="date"
                            id="invoice_date-{randomId}"
                            name="invoice_date"
                            class="form-control form-control-solid form-control-lg margin-t-2" />
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-light-primary font-weight-bold" data-dismiss="modal"
                        >Chiudi</button>
                    <button
                        disabled={saveDisabled}
                        type="button"
                        class="btn btn-primary font-weight-bold"
                        on:click|preventDefault={async () => {
                            const fileInput = document.getElementById(`file-${randomId}`);
                            const dateInput = document.getElementById(`invoice_date-${randomId}`);

                            const file = fileInput.files[0];
                            const base64 = await toBase64(file);

                            apiFetch(__bakney.env.API.PROFILE.BILLING_INVOICE.UPLOAD, {
                                method: 'POST',
                                body: JSON.stringify({
                                    billing_invoice: {
                                        file: base64,
                                        name: file.name,
                                        invoice_date: dateInput.value,
                                    },
                                    sport_association_id: sport_association_id,
                                }),
                            }).then(res => {
                                if (res.status == 200) {
                                    // close modal and show success toast
                                    jQuery(`#upload-billing-invoice-${randomId}`).modal('hide');
                                    toast.success('Fattura caricata!');
                                } else {
                                    toast.error('Qualcosa è andato storto.');
                                }
                            });
                        }}>Carica</button>
                </div>
            </div>
        </div>
    </div>
</Portal>
