<script>
    import {Warning, CheckCircle} from 'phosphor-svelte';

    export let fileData = {};

    let fieldsThatCanHaveDefault = [
        'indirizzo',
        'città di residenza',
        'cap',
        'città di residenza tutore',
        'indirizzo tutore',
        'cap tutore',
    ];
</script>

<div class="pb-5" data-wizard-type="step-content">
    <h4 class="font-weight-bold text-dark font-size-h4">Colonne senza collegamento</h4>
    <div class="mb-5 text-dark-75 font-weight-bold font-size-sm">
        Puoi impostare un valore di default per alcune delle colonne non collegate ai campi anagrafici in Bakney Sport.
    </div>
    {#if JSON.stringify(fileData) != '{}' && fileData.default}
        {#if Object.keys(fileData?.map)?.filter(x => fileData?.map[x] == null && fieldsThatCanHaveDefault?.includes(x))?.length == 0}
            <div
                class="bg-light-success text-success font-weight-boldest text-size-h2 py-2 px-4 rounded"
                style="border-top: 1px solid #fff; outline: rgb(179 231 229) solid 1px;width:fit-content;">
                <CheckCircle size={18} weight="duotone" class="mr-1" />
                Tutti i campi sono stati collegati con successo.
            </div>
        {:else}
            <div
                class="row d-flex justify-content-center align-items-center text-dark font-weight-bold font-size-h6 px-2 py-2 my-2 mx-0">
                <div class="col-5">
                    <div class="font-weight-boldest">Assegna un valore che</div>
                </div>
                <div class="col-2 font-size-sm d-flex justify-content-center text-secondary font-weight-boldest">
                    corrisponde
                </div>
                <div class="col-5 text-right">
                    <div class="font-weight-boldest">a questo campo in Bakney</div>
                </div>
            </div>
            <hr class="mt-0" />
            {#each Object.keys(fileData?.map).filter(x => fileData?.map[x] == null && fieldsThatCanHaveDefault.includes(x)) as key}
                <div
                    class="row d-flex justify-content-center align-items-center text-dark font-weight-bold font-size-h6 px-2 py-2 my-2 mx-1">
                    <div class="col-5">
                        <!-- input -->
                        <input
                            class="form-control m-auto from-control-solid"
                            placeholder="Inserisci un valore..."
                            bind:value={fileData.default[key]} />
                    </div>
                    <div class="col-2 font-size-h6 d-flex justify-content-center text-secondary">&#10132;</div>
                    <div class="col-5 text-right">
                        <b
                            class="font-weight-boldest rounded-lg py-2 px-4 text-primary bg-light-primary font-size-lg"
                            style="outline: 1px solid #96b3ff; border-top: 1px solid #fff;text-wrap: nowrap;!important"
                            >{key}</b>
                    </div>
                </div>
            {/each}
        {/if}
    {/if}
</div>
