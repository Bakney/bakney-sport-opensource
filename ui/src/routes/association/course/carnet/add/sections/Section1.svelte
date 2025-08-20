<script>
    export let newCarnet = {};

    $: {
        if (newCarnet.lessons_number < 1) newCarnet.lessons_number = 1;
        if (newCarnet.lessons_number > 100) newCarnet.lessons_number = 100;
    }
    jQuery(document).ready(function () {
        // "mask": "(999)|(999.9{1,2})",
        jQuery('#kt_inputmask_fee').inputmask('9{1,4},9{2}', {
            greedy: false,
            placeholder: '0',
            rightAlign: true,
        });

        jQuery('#kt_inputmask_fee').change(function () {
            newCarnet.fee = document.getElementById('kt_inputmask_fee').value.replace(',', '.');
        });
    });

    function updateCarnetText() {
        newCarnet.title =
            String(newCarnet.title || '')
                .slice(0, 1)
                .toUpperCase() + String(newCarnet.title || '').slice(1);
        newCarnet.description =
            String(newCarnet.description || '')
                .slice(0, 1)
                .toUpperCase() + String(newCarnet.description || '').slice(1);
    }
</script>

<div class="pb-5" data-wizard-type="step-content">
    <h4 class="mb-10 font-weight-bold text-dark wizard-title-info">Inserisci le informazioni del Carnet</h4>
    <div class="form-group">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label>Titolo <b>*</b></label>
        <input
            on:keypress={updateCarnetText}
            bind:value={newCarnet.title}
            name="title"
            type="text"
            class="form-control form-control-solid form-control-lg margin-tb-2"
            placeholder="Nome del carnet..." />
    </div>

    <div class="form-group">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label>Descrizione <b>*</b></label>
        <textarea
            on:keypress={updateCarnetText}
            bind:value={newCarnet.description}
            name="description"
            class="form-control form-control-solid form-control-lg margin-tb-2"
            placeholder="Breve descrizione del carnet..."
            rows="3" />
    </div>

    <div class="row col-12 m-0 p-0">
        <div class="form-group col-12 col-md-4 m-0 p-0">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label>Prezzo del carnet</label>
            <div class="input-group input-group-solid">
                <div class="input-group-prepend">
                    <span class="input-group-text fs-1-1">€</span>
                </div>
                <input name="fee" type="text" class="form-control fs-1-1" id="kt_inputmask_fee" placeholder="60,00" />
            </div>
        </div>

        <div class="form-group col-12 col-md-4 m-0 p-0" />

        <div class="form-group col-12 col-md-4 m-0 p-0 pt-4 pt-md-0">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="text-right" style="margin-right: 0!important;">Numero lezioni</label>
            <!-- <label class="col-3 col-form-label">With Icon</label> -->
            <div class="input-group" style="height: calc(1.5em + 1.3rem + 2px)">
                <input
                    placeholder="10"
                    style="max-width: 6rem; margin-right: 0!important;"
                    class="form-control form-control-solid form-control-sm m-auto mr-0"
                    type="number"
                    bind:value={newCarnet.lessons_number}
                    min="1"
                    max="100" />
            </div>
        </div>
    </div>
    <div class="form-group row col-12 mt-4">
        <p>
            Il <span class="font-weight-bold">pagamento</span> verrà generato al momento dell'assegnazione del carnet.
        </p>
    </div>
</div>
