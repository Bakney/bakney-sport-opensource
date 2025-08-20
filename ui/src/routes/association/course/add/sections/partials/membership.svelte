<script>
    import {Currency, SmartSelect} from 'components/formBuilder/preview-blocks/index.js';

    export let course;
    export let editable = true;
</script>

<div>
    {#if editable}
        <h3 class="font-weight-bolder">Abbonamento</h3>
        <p class="text-muted font-weight-bold">Configura le impostazioni dell'abbonamento.</p>
    {/if}
    {#if editable}
        <div class="form-group row mb-0">
            <div class="col-12 col-md-2">
                <Currency
                    customClasses={'px-0 min-w-7'}
                    editable={false}
                    active={false}
                    on:change={e => {
                        course.fee = e.detail;
                    }}
                    props={{
                        label: 'Quota abbonamento',
                        name: 'fee',
                        id: 'fee',
                        placeholder: '0,00',
                        required: true,
                        value: course.fee || '0,00',
                    }} />
            </div>
        </div>
    {:else}
        <div
            class="d-flex flex-column justify-content-center align-items-start pr-4 text-right text-primary font-weight-boldest mb-4 mt-0 pt-0">
            <div class="font-weight-bolder mb-1 font-size-h6 text-dark">Quota abbonamento</div>
            <div class="font-size-h2">
                {new Intl.NumberFormat('it-IT', {style: 'currency', currency: 'EUR'}).format(parseFloat(course.fee))}
            </div>
        </div>
    {/if}

    {#if editable}
        <div class="form-group row mb-6 mx-0 d-flex justify-content-start border rounded-xl p-0">
            <div class="font-size-md font-weight-boldest px-4 pt-4 pb-0 w-100">Configurazione abbonamento</div>
            <div class="row m-0 p-0" style="gap: 1.5rem;">
                <div class="p-4">
                    <div class="text-left font-size-sm font-weight-bold m-0">Rinnovo automatico</div>
                    <div class="input-group" style="height: calc(1.5em + 1.3rem + 2px)">
                        <span class="switch switch-icon switch-sm m-auto" style="margin-left: 0 !important;">
                            <label>
                                <input
                                    disabled={!editable}
                                    type="checkbox"
                                    bind:checked={course.auto_renewal}
                                    name="auto_renewal" />
                                <span />
                            </label>
                        </span>
                    </div>
                </div>
                <div class="p-4">
                    <div class="text-left font-size-sm font-weight-bold m-0">Dura tutta la stagione sportiva</div>
                    <div class="input-group" style="height: calc(1.5em + 1.3rem + 2px)">
                        <span class="switch switch-icon switch-sm m-auto" style="margin-left: 0 !important;">
                            <label>
                                <input
                                    disabled={!editable}
                                    type="checkbox"
                                    bind:checked={course.billed_duration_is_sport_season}
                                    name="billed_duration_is_sport_season" />
                                <span />
                            </label>
                        </span>
                    </div>
                </div>
                <div class="p-4">
                    <div class="text-left font-size-sm font-weight-bold m-0">Inizia da data iscrizione</div>
                    <div class="input-group" style="height: calc(1.5em + 1.3rem + 2px)">
                        <span class="switch switch-icon switch-sm m-auto" style="margin-left: 0 !important;">
                            <label>
                                <input
                                    disabled={!editable}
                                    type="checkbox"
                                    bind:checked={course.billed_from_subscription_date}
                                    name="billed_from_subscription_date" />
                                <span />
                            </label>
                        </span>
                    </div>
                </div>
            </div>
        </div>

        {#if !course.billed_duration_is_sport_season}
            <div class="form-group row mx-0 p-4 border rounded-xl">
                <div class="col-12 col-md-6">
                    <SmartSelect
                        customClasses={'px-0'}
                        editable={false}
                        active={false}
                        on:change={e => {
                            course.billed_frequency = e.detail.value;
                        }}
                        props={{
                            id: 'billed_frequency',
                            name: 'billed_frequency',
                            label: 'Durata abbonamento (mesi)',
                            placeholder: 'Seleziona il numero di mesi',
                            required: true,
                            clearable: false,
                            searchable: true,
                            showChevron: true,
                            value: course.billed_frequency || 1,
                            options: [
                                {label: 'Mensile', value: 1},
                                {label: 'Bimestrale', value: 2},
                                {label: 'Trimestrale', value: 3},
                                {label: 'Ogni 4 mesi', value: 4},
                                {label: 'Ogni 5 mesi', value: 5},
                                {label: 'Semestrale', value: 6},
                                {label: 'Ogni 7 mesi', value: 7},
                                {label: 'Ogni 8 mesi', value: 8},
                                {label: 'Ogni 9 mesi', value: 9},
                                {label: 'Ogni 10 mesi', value: 10},
                                {label: 'Ogni 11 mesi', value: 11},
                                {label: 'Annuale', value: 12},
                            ],
                        }} />
                </div>

                {#if !course.billed_from_subscription_date}
                    <div class="col-12 col-md-6">
                        <SmartSelect
                            customClasses={'px-0'}
                            editable={false}
                            active={false}
                            on:change={e => {
                                course.billed_from_day_of_month = e.detail.value;
                            }}
                            props={{
                                id: 'billed_from_day_of_month',
                                name: 'billed_from_day_of_month',
                                label: 'Si rinnova il giorno',
                                placeholder: 'Seleziona il giorno del mese',
                                required: true,
                                clearable: false,
                                searchable: true,
                                showChevron: true,
                                value: course.billed_from_day_of_month || 1,
                                options: Array.from({length: 28}, (_, i) => ({
                                    label: i + 1 + ' del mese',
                                    value: i + 1,
                                })),
                            }} />
                    </div>
                {/if}
            </div>
        {/if}
    {/if}
    <div
        class="form-group mx-auto row px-4 mb-4 py-2 bg-light-primary text-primary rounded-xl font-size-lg"
        style="border-top: 1px solid #ffffff59;outline: 1px solid #ceddff;width: fit-content;">
        <p class="mb-0 font-weight-bold">
            {#if course.billed_duration_is_sport_season}
                L'abbonamento durerà dall'inizio alla fine della stagione sportiva.
            {:else if course.auto_renewal}
                {#if course.billed_from_subscription_date}
                    L'abbonamento si rinnoverà <strong
                        >automaticamente ogni {course.billed_frequency === 1 ? 'mese' : course.billed_frequency}
                        {course.billed_frequency === 1 ? '' : 'mesi'}</strong>
                    a partire dalla <strong>data di iscrizione</strong> dell'atleta.
                {:else}
                    L'abbonamento si rinnoverà <strong
                        >automaticamente ogni {course.billed_frequency === 1 ? 'mese' : course.billed_frequency}
                        {course.billed_frequency === 1 ? '' : 'mesi'}</strong>
                    il giorno <strong>{course.billed_from_day_of_month} del mese</strong>.
                {/if}
            {:else if course.billed_from_subscription_date}
                L'abbonamento partirà dalla <strong>data di iscrizione</strong> dell'atleta per la durata di
                <strong>{course.billed_frequency} {course.billed_frequency === 1 ? 'mese' : 'mesi'}.</strong>
            {:else}
                L'abbonamento inizierà il giorno <strong>{course.billed_from_day_of_month} del mese</strong> per la
                durata di <strong>{course.billed_frequency} {course.billed_frequency === 1 ? 'mese' : 'mesi'}.</strong>
            {/if}
        </p>
    </div>
</div>
