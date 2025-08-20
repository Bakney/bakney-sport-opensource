<script>
    export let name;
    export let value = 'RF01';

    let fiscalRegimes = [
        {code: 'RF01', description: 'Ordinario'},
        {code: 'RF02', description: 'Contribuenti minimi (art. 1, commi 96-117, legge n. 244/2007)'},
        {
            code: 'RF04',
            description: 'Agricoltura e attività connesse e pesca (articoli 34 e 34-bis, D.P.R. n. 633/1972)',
        },
        {code: 'RF05', description: 'Vendita sali e tabacchi (art. 74, comma 1, D.P.R. n. 633/1972)'},
        {code: 'RF06', description: 'Commercio dei fiammiferi (art. 74, comma 1, D.P.R. n. 633/1972)'},
        {code: 'RF07', description: 'Editoria (art. 74, comma 1, D.P.R. n. 633/1972)'},
        {code: 'RF08', description: 'Gestione di servizi di telefonia pubblica (art. 74, comma 1, D.P.R. n. 633/1972)'},
        {
            code: 'RF09',
            description:
                'Rivendita di documenti di trasporto pubblico e di sosta (art. 74, comma 1, D.P.R. n. 633/1972)',
        },
        {
            code: 'RF10',
            description:
                'Intrattenimenti, giochi e altre attività di cui alla tariffa allegata al D.P.R. n. 640/1972 (art. 74, comma 6, D.P.R. n. 633/1972)',
        },
        {code: 'RF11', description: 'Agenzie di viaggi e turismo (art. 74-ter, D.P.R. n. 633/1972)'},
        {code: 'FR12', description: 'Agriturismo (art. 5, comma 2, legge n. 413/1991)'},
        {code: 'RF13', description: 'Vendite a domicilio (art. 25-bis, comma 6, D.P.R. n. 600/1973)'},
        {
            code: 'RF14',
            description:
                'Rivendita di beni usati, di oggetti d’arte, d’antiquariato o da collezione (art. 36, D.L. n. 41/1995)',
        },
        {
            code: 'RF15',
            description:
                'Agenzie di vendite all’asta di oggetti d’arte, antiquariato o da collezione (art. 40-bis, D.L. n. 41/1995)',
        },
        {code: 'RF16', description: 'IVA per cassa P.A. (art. 6, comma 5, D.P.R. n. 633/1972)'},
        {code: 'RF17', description: 'IVA per cassa (art. 32-bis, D.L. n. 83/2012)'},
        {code: 'RF18', description: 'Altro'},
        {code: 'RF19', description: 'Forfettario (art.1, commi 54-89, legge n. 190/2014)'},
    ];
</script>

<select bind:value class="form-control form-control-sm form-control-solid mb-0" {name}>
    {#each fiscalRegimes as regime}
        <option value={regime.code}>{regime.code} - {regime.description}</option>
    {/each}
</select>
