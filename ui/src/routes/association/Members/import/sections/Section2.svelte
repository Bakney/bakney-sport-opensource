<script>
    import {Info, Warning} from 'phosphor-svelte';

    export let fileData = {};

    let optionalFiels = [
        'email',
        'telefono',
        'email tutore',
        'telefono tutore',
        'scadenza certificato medico',
        'data tesseramento',
        'data scadenza tesseramento',
        'numero tessera',
    ];
</script>

<div class="pb-5" data-wizard-type="step-content">
    <h4 class="font-weight-bold text-dark font-size-h4">Collega le informazioni del tuo file ai campi corretti</h4>
    <div class="mb-5 text-dark-75 font-weight-bold font-size-sm">
        Scegli quale colonna del tuo file corrisponde a ciascun campo richiesto. Non preoccuparti se mancano alcune
        informazioni - puoi lasciarle vuote e aggiungerle più tardi.
    </div>
    {#if JSON.stringify(fileData) != '{}'}
        <div
            class="row d-flex justify-content-center align-items-center text-dark font-weight-bold font-size-h6 px-2 py-2 my-2 mx-0">
            <div class="col-5">
                <div class="font-weight-boldest">la colonna nel tuo file</div>
            </div>
            <div class="col-2 font-size-sm d-flex justify-content-center text-secondary font-weight-boldest">
                corrisponde
            </div>
            <div class="col-5 text-right">
                <div class="font-weight-boldest">a questo campo in Bakney</div>
            </div>
        </div>
        <hr class="mt-0" />
        {#each Object.keys(fileData?.map) as key, idx}
            <div
                class="row d-flex justify-content-center align-items-center text-dark font-weight-bold font-size-h6 px-2 py-2 my-2 mx-1 rounded-lg">
                <div class="col-5">
                    <select
                        style="outline: 1px solid #e4e6ef; border: 0 !important; border-top: 1px solid #fff !important; border-bottom: 1px solid #f1f1f1 !important;"
                        class="form-control form-control-solid border border-secondary m-auto selection-box-mapper"
                        bind:value={fileData.map[key]}>
                        <option value={null} default />
                        {#each Object.values(fileData?.columns).filter(x => !Object.values(fileData?.map).includes(x) || x == fileData.map[key]) as value}
                            <option {value}>{value}</option>
                        {/each}
                    </select>
                </div>
                <div class="col-2 font-size-h6 d-flex justify-content-center text-secondary">&#10132;</div>
                <div class="col-5 text-right">
                    <b
                        class="font-weight-boldest rounded-lg py-2 px-4 text-primary bg-light-primary font-size-lg"
                        style="outline: 1px solid #96b3ff; border-top: 1px solid #fff;text-wrap: nowrap;!important"
                        >{key}</b>
                </div>
            </div>

            {#if optionalFiels.includes(key) || key.includes('tutore')}
                <div
                    class="bg-light-warning rounded border border-secondary mt-3 font-weight-bolder text-warning py-1 text-left mx-7"
                    style="max-width: fit-content;outline: rgb(255, 220, 172) solid 1px; border-top: 1px solid #fff !important; border-bottom: 0 !important; border-right: 0 !important; border-left: 0 !important;">
                    {#if optionalFiels.includes(key)}
                        <div class="col-12 font-size-sm">Il campo è opzionale.</div>
                    {/if}
                    {#if key.includes('tutore')}
                        <div class="col-12 font-size-sm">Richiesto solo se minore.</div>
                    {/if}
                </div>
            {/if}
            {#if idx < Object.keys(fileData?.map).length - 1}
                <hr />
            {/if}
        {/each}
    {/if}
</div>
