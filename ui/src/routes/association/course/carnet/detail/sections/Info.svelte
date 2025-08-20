<script>
    import {onMount} from 'svelte';

    export let info;

    $: {
        if (info.lessons_number < 1) info.lessons_number = 1;
        if (info.lessons_number > 100) info.lessons_number = 100;
        if (info.fee) info.fee = info.fee.replace('.', ',');
    }

    onMount(() => {});

    jQuery(document).ready(function () {
        // "mask": "(999)|(999.9{1,2})",
        jQuery('#kt_inputmask_fee').inputmask('9{1,4},9{2}', {
            greedy: false,
            placeholder: '0',
            rightAlign: true,
        });

        jQuery('#kt_inputmask_fee').change(function () {
            info.fee = document.getElementById('kt_inputmask_fee').value.replace(',', '.');
        });
    });

    function updateCarnetText() {
        info.title =
            String(info.title || '')
                .slice(0, 1)
                .toUpperCase() + String(info.title || '').slice(1);
        info.description =
            String(info.description || '')
                .slice(0, 1)
                .toUpperCase() + String(info.description || '').slice(1);
    }
</script>

{#if info}
    <div class="row pt-0 pb-4">
        <div class="col-12">
            <h2 class="pb-4 pt-4">Dettagli Carnet</h2>

            <div class="row">
                <div class="col-12">
                    <div class="alert alert-custom alert-light-info fade show mb-10" role="alert">
                        <div class="alert-icon">
                            <span class="svg-icon svg-icon-3x svg-icon-info">
                                <!--begin::Svg Icon | path:/keen/theme/demo1/dist/assets/media/svg/icons/Code/Info-circle.svg-->
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    xmlns:xlink="http://www.w3.org/1999/xlink"
                                    width="24px"
                                    height="24px"
                                    viewBox="0 0 24 24"
                                    version="1.1">
                                    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                        <rect x="0" y="0" width="24" height="24" />
                                        <circle fill="#000000" opacity="0.3" cx="12" cy="12" r="10" />
                                        <rect fill="#000000" x="11" y="10" width="2" height="7" rx="1" />
                                        <rect fill="#000000" x="11" y="7" width="2" height="2" rx="1" />
                                    </g>
                                </svg>
                                <!--end::Svg Icon-->
                            </span>
                        </div>
                        <div class="alert-text font-weight-bold">
                            In questa sezione puoi modificare le informazioni del carnet. Tuttavia, le modifiche non
                            avranno effetto sui carnet già acquistati anche se saranno sempre visibili nella sezione <b
                                >Utilizzo</b
                            >.
                        </div>
                        <div class="alert-close">
                            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">
                                    <i class="ki ki-close" />
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-12 col-md-4">
                    <div class="form-group">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label class="font-weight-bolder">Nome carnet</label>
                        <input
                            on:keypress={updateCarnetText}
                            bind:value={info.title}
                            name="title"
                            type="text"
                            class="form-control form-control-solid form-control-lg margin-tb-2"
                            placeholder="Nome carnet" />
                    </div>
                </div>

                <div class="col-12 col-md-3">
                    <div class="form-group">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label class="font-weight-bolder">Prezzo del carnet</label>
                        <div
                            class="input-group input-group-solid"
                            style="margin-top: 1rem !important; height: 3.5rem; border-radius: 0.5rem !important;">
                            <div class="input-group-prepend">
                                <span class="input-group-text fs-1-1">€</span>
                            </div>
                            <input
                                bind:value={info.fee}
                                id="kt_inputmask_fee"
                                name="fee"
                                type="text"
                                class="form-control fs-1-1"
                                placeholder="60,00" />
                        </div>
                    </div>
                </div>
                <div class="col-12 col-md-2">
                    <div class="form-group">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label class="font-weight-bolder">Numero lezioni</label>
                        <input
                            placeholder="10"
                            style="max-width: 10rem; margin-right: 0!important;"
                            class="form-control form-control-solid form-control-lg margin-tb-2"
                            type="number"
                            bind:value={info.lessons_number}
                            min="1"
                            max="100" />
                    </div>
                </div>
                <div class="col-12 col-md-3">
                    <div class="form-group">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label class="font-weight-bolder mb-4">Carnet pubblico</label>
                        <!-- <label class="col-3 col-form-label">With Icon</label> -->
                        <div class="input-group" style="height: calc(1.5em + 1.3rem + 2px)">
                            <span class="switch switch-icon m-auto" style="margin-left: 0!important;">
                                <label>
                                    <input type="checkbox" bind:checked={info.public} />
                                    <span />
                                </label>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-12">
                    <div class="form-group">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label class="font-weight-bolder">Descrizione carnet</label>
                        <textarea
                            on:keypress={updateCarnetText}
                            rows="10"
                            bind:value={info.description}
                            name="description"
                            type="text"
                            class="form-control form-control-solid form-control-lg margin-tb-2"
                            placeholder="Descrizione carnet" />
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}
