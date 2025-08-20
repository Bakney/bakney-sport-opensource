<script>
    import {onMount} from 'svelte';
    import {scale} from 'svelte/transition';

    import {apiFetch} from 'utils/ApiMiddleware.js';
    import {sessionToken, subPage, userData, billingData} from 'store/stores.js';
    import {Warning, WarningCircle} from 'phosphor-svelte';
    import {canPerformAction} from 'utils/Permissions';
    import {toast} from 'svelte-sonner';
    import BottomBarFixedSave from 'components/inputs/BottomBarFixedSave.svelte';
    import {SmartSelect} from 'components/formBuilder/preview-blocks';

    sessionToken.useLocalStorage();
    subPage.useLocalStorage();
    userData.useLocalStorage();
    billingData.useLocalStorage();

    export let changes = false;
    let validButton = false;
    let settings = {
        enumerate_invoices: false,
        starting_number_invoices: 0,
        online_payments: false,
        balance_sheet_year: null,
        auto_paid_payment: false,
    };
    let fetchedData = {};
    let fetching = false;
    let paymentCategories = [];

    $: {
        if (JSON.stringify(settings) != fetchedData) validButton = true;
        else validButton = false;
    }

    $: validButton, (changes = validButton);

    onMount(async () => {
        await fetchInfo();

        // dispatch onboarding-checklist-event
        document.dispatchEvent(new CustomEvent('onboarding-checklist-event', {detail: {key: 'view_settings'}}));
    });

    async function fetchPaymentCategories() {
        let res = await apiFetch(__bakney.env.API.PAYMENT.CATEGORY.LIST);
        if (!res.error) {
            paymentCategories = res.response.data.map(category => ({
                label: `${category.name} (${category.expense ? 'Spesa' : 'Entrata'} ${
                    category.type === 1 ? 'Istituzionale' : 'Commerciale'
                })`,
                value: category.payment_category_id,
            }));
        } else {
            toast.error(res.response.msg);
        }
    }

    async function fetchInfo() {
        fetching = true;
        await fetchPaymentCategories();
        apiFetch(__bakney.env.API.PROFILE.SETTINGS).then(res => {
            if (!res.error) {
                settings = res.response.settings;
                fetchedData = JSON.stringify(settings);
                $userData.temporary_invoice_deletion = settings.temporary_invoice_deletion;
                $userData.dark_mode = settings.dark_mode;
                fetching = false;
            } else {
                let modalText =
                    response.status == 403
                        ? 'Operazione non permessa.'
                        : 'Scusa, ho individuato degli errori, riprova.';
                toast.error(modalText);
            }
        });
    }

    async function updateSettings() {
        let res = await apiFetch(__bakney.env.API.PROFILE.SETTINGS, {
            method: 'POST',
            body: JSON.stringify(settings),
        });

        if (!res.error) {
            toast.success('Impostazioni generali aggiornate.');
            fetchInfo();
        } else {
            let modalText =
                response.status == 403 ? 'Operazione non permessa.' : 'Scusa, ho individuato degli errori, riprova.';
            toast.error(modalText);
        }
    }

    const months = [
        {label: 'Gennaio', name: 1, days: 31},
        {label: 'Febbraio', name: 2, days: 28},
        {label: 'Marzo', name: 3, days: 31},
        {label: 'Aprile', name: 4, days: 30},
        {label: 'Maggio', name: 5, days: 31},
        {label: 'Giugno', name: 6, days: 30},
        {label: 'Luglio', name: 7, days: 31},
        {label: 'Agosto', name: 8, days: 31},
        {label: 'Settembre', name: 9, days: 30},
        {label: 'Ottobre', name: 10, days: 31},
        {label: 'Novembre', name: 11, days: 30},
        {label: 'Dicembre', name: 12, days: 31},
    ];

    function updateDays(type) {
        const monthObject = months.find(m => m.name === month);
        const daysArray = Array.from({length: monthObject.days}, (_, i) => i + 1);
        if (type == 'balance_sheet') {
            settings.balance_sheet_start_day = daysArray[0].toString();
        } else {
            settings.subscription_start_day = daysArray[0].toString();
        }
    }

    function updateBalanceSheetData() {
        switch (settings.balance_sheet_year) {
            case '1':
                settings.balance_sheet_start_month = 1;
                settings.balance_sheet_start_day = 1;
                break;
            case '2':
                settings.balance_sheet_start_month = 9;
                settings.balance_sheet_start_day = 1;
                break;
            case '3':
                settings.balance_sheet_start_month = 6;
                settings.balance_sheet_start_day = 1;
                break;
            case '4':
                settings.balance_sheet_start_month = 1;
                settings.balance_sheet_start_day = 1;
                break;
        }
    }
</script>

{#if $subPage == 'settings'}
    <!-- $subPage == 'password' -->
    <!--begin::Content-->
    <div class="flex-row-fluid">
        <!--begin::Card-->
        <div class="card card-custom card-stretch">
            <!--begin::Header-->
            <div class="card-header py-3">
                <div class="card-title align-items-start flex-column">
                    <h3 class="card-label font-weight-bolder text-dark font-size-h1">Impostazioni generali</h3>
                    <span class="text-muted font-weight-bold font-size-sm mt-1"
                        >Aggiorna le impostazioni generali dell'applicazione</span>
                </div>
                <div class="card-toolbar">
                    <button
                        disabled={!validButton || !canPerformAction('other.settings.update')}
                        id="kt_form_password_update_submit"
                        class="btn btn-primary font-weight-bolder"
                        on:click={updateSettings}>Salva</button>
                </div>
            </div>
            <!--end::Header-->
            <!--begin::Form-->
            <div id="kt_form_password_update">
                <!--begin::Body-->
                <div class="card-body">
                    {#if !fetching}
                        <div in:scale={{duration: 150, start: 0.98}} class="form-group row mb-0">
                            <h1 class="col-12 font-weight-boldest text-dark">Contabilità</h1>
                        </div>

                        <div
                            in:scale={{duration: 150, start: 0.98}}
                            class="form-group row border border-secondary rounded-xl p-4 mx-0">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="col-12 col-form-label font-weight-bolder text-left pb-0">Anno fiscale</label>
                            <p class="text-muted px-4">
                                Seleziona il tipo di anno fiscale per il rendiconto annuale, le ricevute e i pagamenti.
                            </p>
                            <div
                                class="col-12 d-flex justify-content-start align-items-center mb-3"
                                style="flex-wrap: wrap;">
                                <!-- <label class="col-3 col-form-label">With Icon</label> -->
                                <label>
                                    <select
                                        id="balance-sheet"
                                        disabled={!canPerformAction('other.settings.update')}
                                        bind:value={settings.balance_sheet_year}
                                        on:change={updateBalanceSheetData}
                                        class="form-control form-control-solid form-control-sm">
                                        <option value="1">Anno solare (Gennaio-Dicembre)</option>
                                        <option value="2">Anno Sportivo 1 (Settembre-Agosto)</option>
                                        <option value="3">Anno Sportivo 2 (Giugno-Maggio)</option>
                                        <option value="4">Altro Periodo (personalizzato)</option>
                                    </select>
                                </label>
                                {#if settings.balance_sheet_year == '4'}
                                    <!-- svelte-ignore a11y-label-has-associated-control -->
                                    <label class="ml-4">
                                        <select
                                            disabled={!canPerformAction('other.settings.update')}
                                            id="balance-sheet-start-month"
                                            class="form-control form-control-solid form-control-sm"
                                            bind:value={settings.balance_sheet_start_month}
                                            on:change={() => updateDays('balance_sheet')}>
                                            {#each months as m}
                                                <option value={m.name}>{m.label}</option>
                                            {/each}
                                        </select>
                                    </label>

                                    <label class="ml-4">
                                        <select
                                            disabled={!canPerformAction('other.settings.update')}
                                            id="balance-sheet-start-day"
                                            class="form-control form-control-solid form-control-sm"
                                            bind:value={settings.balance_sheet_start_day}>
                                            {#each Array.from({length: Number(months.find(m => m.name === settings.balance_sheet_start_month)?.days) || 0}, (_, i) => i + 1) as d}
                                                <option value={d}>{d}</option>
                                            {/each}
                                        </select>
                                    </label>
                                {/if}
                            </div>
                            <div class="col-12 d-flex justify-content-start align-items-center mb-3">
                                <div
                                    class="bg-light-info p-3 rounded-lg text-info font-size-lg px-4 d-flex align-items-center flex-wrap">
                                    Il tuo anno fiscale inizierà il
                                    <span class="font-weight-boldest mx-1"
                                        >{settings.balance_sheet_start_day}{' '}
                                        {months.find(m => m.name === settings.balance_sheet_start_month)?.label}</span>
                                    e terminerà il
                                    <!-- end date -->
                                    <span class="font-weight-boldest mx-1">
                                        <!-- end day -->
                                        {settings.balance_sheet_start_day == '1'
                                            ? months.findIndex(m => m.name === settings.balance_sheet_start_month) > 0
                                                ? months[
                                                      months.findIndex(
                                                          m => m.name === settings.balance_sheet_start_month
                                                      ) - 1
                                                  ].days
                                                : months[11].days
                                            : settings.balance_sheet_start_day - 1}
                                        {' '}
                                        <!-- end month -->
                                        {settings.balance_sheet_start_day == '1'
                                            ? months.findIndex(m => m.name === settings.balance_sheet_start_month) > 0
                                                ? months[
                                                      months.findIndex(
                                                          m => m.name === settings.balance_sheet_start_month
                                                      ) - 1
                                                  ].label
                                                : months[11].label
                                            : months.find(m => m.name === settings.balance_sheet_start_month)
                                                  ?.label}</span> (dell'anno successivo)
                                </div>
                            </div>

                            <div class="col-12 d-flex justify-content-start align-items-center">
                                <small class="font-size-sm lh-xs text-warning font-weight-boldest">
                                    Cambiare il tipo di anno fiscale influenzerà il rendiconto annuale.
                                </small>
                            </div>
                        </div>

                        <div
                            in:scale={{duration: 150, start: 0.98}}
                            class="form-group row border border-secondary rounded-xl p-4 mx-0">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="col-12 col-form-label font-weight-bolder text-left pb-0"
                                >Stagione sportiva</label>
                            <p class="text-muted px-4">
                                Seleziona la stagione sportiva per gestire le iscrizioni e tesseramenti.
                            </p>
                            <div
                                class="col-12 px-0 d-flex justify-content-start align-items-start mb-3"
                                style="flex-wrap: wrap;">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label class="ml-2">
                                    <select
                                        disabled={!canPerformAction('other.settings.update')}
                                        id="season-start-month"
                                        class="form-control form-control-solid form-control-sm"
                                        bind:value={settings.subscription_start_month}
                                        on:change={() => updateDays('subscription')}>
                                        {#each months as m}
                                            <option value={m.name}>{m.label}</option>
                                        {/each}
                                    </select>
                                </label>

                                <label class="ml-4">
                                    <select
                                        disabled={!canPerformAction('other.settings.update')}
                                        id="season-start-day"
                                        class="form-control form-control-solid form-control-sm"
                                        bind:value={settings.subscription_start_day}>
                                        {#each Array.from({length: Number(months.find(m => m.name === settings.subscription_start_month)?.days) || 0}, (_, i) => i + 1) as d}
                                            <option value={d}>{d}</option>
                                        {/each}
                                    </select>
                                </label>
                                <div class="d-flex align-items-center justify-content-center ml-4 mt-0">
                                    <span class="switch switch-icon switch-sm mt-0">
                                        <label>
                                            <input
                                                disabled={!canPerformAction('other.settings.update')}
                                                type="checkbox"
                                                name="custom_end_date"
                                                bind:checked={settings.custom_end_date} />
                                            <span />
                                        </label>
                                    </span>
                                    <span class="ml-3 text-muted font-weight-bold">Dura meno di un anno</span>
                                </div>

                                {#if settings.custom_end_date}
                                    <div
                                        class="col-12 px-0 d-flex justify-content-start align-items-center mb-3"
                                        style="flex-wrap: wrap;">
                                        <label class="ml-2">
                                            <select
                                                disabled={!canPerformAction('other.settings.update')}
                                                id="season-end-month"
                                                class="form-control form-control-solid form-control-sm"
                                                bind:value={settings.subscription_end_month}
                                                on:change={() => updateDays('subscription_end')}>
                                                {#each months as m}
                                                    <option value={m.name}>{m.label}</option>
                                                {/each}
                                            </select>
                                        </label>

                                        <label class="ml-4">
                                            <select
                                                disabled={!canPerformAction('other.settings.update')}
                                                id="season-end-day"
                                                class="form-control form-control-solid form-control-sm"
                                                bind:value={settings.subscription_end_day}>
                                                {#each Array.from({length: Number(months.find(m => m.name === settings.subscription_end_month)?.days) || 0}, (_, i) => i + 1) as d}
                                                    <option value={d}>{d}</option>
                                                {/each}
                                            </select>
                                        </label>
                                    </div>
                                {/if}
                            </div>
                            <div class="col-12 d-flex justify-content-start align-items-center mb-3">
                                <div
                                    class="bg-light-info p-3 rounded-lg text-info font-size-lg px-4 d-flex align-items-center flex-wrap">
                                    La tua stagione sportiva inizierà il
                                    <span class="font-weight-boldest mx-1"
                                        >{settings.subscription_start_day}{' '}
                                        {months.find(m => m.name === settings.subscription_start_month)?.label}</span>
                                    e terminerà il
                                    <span class="font-weight-boldest mx-1">
                                        {#if settings.custom_end_date}
                                            {settings.subscription_end_day}{' '}
                                            {months.find(m => m.name === settings.subscription_end_month)?.label}
                                        {:else}
                                            {settings.subscription_start_day == '1'
                                                ? months.findIndex(m => m.name === settings.subscription_start_month) >
                                                  0
                                                    ? months[
                                                          months.findIndex(
                                                              m => m.name === settings.subscription_start_month
                                                          ) - 1
                                                      ].days
                                                    : months[11].days
                                                : settings.subscription_start_day - 1}
                                            {' '}
                                            {settings.subscription_start_day == '1'
                                                ? months.findIndex(m => m.name === settings.subscription_start_month) >
                                                  0
                                                    ? months[
                                                          months.findIndex(
                                                              m => m.name === settings.subscription_start_month
                                                          ) - 1
                                                      ].label
                                                    : months[11].label
                                                : months.find(m => m.name === settings.subscription_start_month)?.label}
                                        {/if}
                                    </span>
                                    {#if !settings.custom_end_date}
                                        (dell'anno successivo)
                                    {/if}
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-12 col-lg-6 px-0 p-4">
                                <SmartSelect
                                    customClasses={'min-w-100 p-0 m-0'}
                                    editable={false}
                                    active={false}
                                    bind:value={settings.default_payment_category}
                                    props={{
                                        id: 'default_payment_category',
                                        name: 'default_payment_category',
                                        label: 'Causale predefinita iscrizioni',
                                        placeholder: 'Seleziona la categoria di pagamento predefinita',
                                        helperLabel:
                                            'Impostata per i pagamenti di iscrizioni dove non specificato altrimenti.',
                                        required: false,
                                        options: paymentCategories,
                                        value: settings?.default_payment_category,
                                    }} />
                            </div>

                            <div class="col-12 col-lg-6 px-0 mt-8 mt-lg-0 p-4">
                                <SmartSelect
                                    customClasses={'min-w-100 p-0 m-0'}
                                    editable={false}
                                    active={false}
                                    bind:value={settings.default_payment_category_courses}
                                    props={{
                                        id: 'default_payment_category_courses',
                                        name: 'default_payment_category_courses',
                                        label: 'Causale predefinita corsi',
                                        placeholder: 'Seleziona la categoria di pagamento predefinita',
                                        helperLabel:
                                            'Impostata per i pagamenti dei corsi dove non specificato altrimenti.',
                                        required: false,
                                        options: paymentCategories,
                                        value: settings?.default_payment_category_courses,
                                    }} />
                            </div>
                        </div>

                        <div in:scale={{duration: 150, start: 0.98}} class="form-group row mb-0">
                            <h1 class="col-12 font-weight-boldest text-dark mt-16">Iscrizioni e tesseramenti</h1>
                        </div>
                        <div in:scale={{duration: 150, start: 0.98}} class="form-group row">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="col-12 col-form-label font-weight-bolder text-left"
                                >Durata delle iscrizioni</label>
                            <div class="col-12 d-flex justify-content-start align-items-center mb-1">
                                <select
                                    disabled={!canPerformAction('other.settings.update')}
                                    bind:value={settings.subscription_duration}
                                    class="form-control form-control-solid"
                                    style="max-width:fit-content">
                                    <option value={1}>Un'anno solare dalla data di iscrizione</option>
                                    <option value={2}>Da inizio stagione sportiva</option>
                                    <option value={3}>Dall'iscrizione al termine della stagione sportiva</option>
                                </select>
                            </div>
                            <div class="col-12 d-flex justify-content-start align-items-center">
                                <small class="text-muted font-size-sm lh-xs">
                                    Seleziona l'opzione che definisce la durata delle iscrizioni.<br />
                                    <div class="mt-1 mb-3 d-flex">
                                        <span
                                            class="d-flex align-items-center text-warning font-weight-semibold mt-2 p-3 bg-light-warning rounded-lg text-xs">
                                            <WarningCircle size="20" class="mr-2" weight="duotone" />
                                            <b class="mr-1">Nota:</b> i soci e tesserati esistenti non verranno modificati.
                                        </span>
                                    </div>
                                </small>
                            </div>
                        </div>
                        <div in:scale={{duration: 150, start: 0.98}} class="form-group row mb-0">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="col-12 col-form-label font-weight-bolder text-left"
                                >Durata dei tesseramenti</label>
                            <div class="col-12 d-flex justify-content-start align-items-center mb-1">
                                <select
                                    disabled={!canPerformAction('other.settings.update')}
                                    bind:value={settings.membership_duration}
                                    class="form-control form-control-solid"
                                    style="max-width:fit-content">
                                    <option value={1}>Un'anno solare dalla data di iscrizione</option>
                                    <option value={2}>Da inizio stagione sportiva</option>
                                    <option value={3}>Dall'iscrizione al termine della stagione sportiva</option>
                                </select>
                            </div>
                            <div class="col-12 d-flex justify-content-start align-items-center">
                                <small class="text-muted font-size-sm lh-xs">
                                    Seleziona l'opzione che definisce la durata dei tesseramenti.<br />
                                    <div class="mt-1 mb-3 d-flex">
                                        <span
                                            class="d-flex align-items-center text-warning font-weight-semibold mt-2 p-3 bg-light-warning rounded-lg text-xs">
                                            <WarningCircle size="20" class="mr-2" weight="duotone" />
                                            <b class="mr-1">Nota:</b> le anagrafiche esistenti non verranno modificate.
                                        </span>
                                    </div>
                                </small>
                            </div>
                            <div in:scale={{duration: 150, start: 0.98}} class="form-group mt-2">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label class="col-12 col-form-label font-weight-bolder text-left mb-0"
                                    >Numero iniziale tesseramenti</label>
                                <div class="col-12 d-flex justify-content-start align-items-center mb-1">
                                    <input
                                        disabled={!canPerformAction('other.settings.update')}
                                        class="form-control form-control-solid form-control-lg my-0"
                                        type="number"
                                        style="max-width: 15rem;"
                                        name=""
                                        bind:value={settings.membership_starting_number} />
                                </div>
                                <div class="col-12 d-flex justify-content-start align-items-center">
                                    <small class="text-muted font-size-sm lh-xs">
                                        I tesseramenti partiranno da questo numero progressivo più uno (quindi da <b
                                            >{settings.membership_starting_number + 1}</b
                                        >), oppure dall'ultimo numero utilizzato più uno.
                                    </small>
                                </div>
                            </div>
                            <div in:scale={{duration: 150, start: 0.98}} class="form-group row col-12">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label class="col-12 col-form-label font-weight-bolder text-left"
                                    >Tipo di tesseramento predefinito</label>
                                <div class="col-12 col-md-6 d-flex justify-content-start align-items-center my-0">
                                    <input
                                        disabled={!canPerformAction('other.settings.update')}
                                        class="form-control form-control-solid"
                                        type="text"
                                        placeholder="Tipologia di tesseramento, esempio: FISR, CONI, etc."
                                        bind:value={settings.default_membership_type} />
                                </div>
                                <div class="col-12 d-flex justify-content-start align-items-center">
                                    <small class="text-muted font-size-sm lh-xs">
                                        Inserisci il tipo di tesseramento predefinito, come "FISR", "CONI", etc.
                                    </small>
                                </div>
                            </div>
                        </div>

                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <div in:scale={{duration: 150, start: 0.98}} class="form-group row">
                            <label class="col-12 col-form-label font-weight-bolder text-left"
                                >Modulo di iscrizione anonimo</label>
                            <div class="col-12 d-flex justify-content-start align-items-center mb-3">
                                <span class="switch switch-icon">
                                    <label>
                                        <input
                                            disabled={!canPerformAction('other.settings.update') ||
                                                settings.force_account_creation}
                                            type="checkbox"
                                            name="accountCreation"
                                            on:change={() => {
                                                if (settings.force_account_creation) {
                                                    settings.disable_account_creation = false;
                                                }
                                            }}
                                            bind:checked={settings.disable_account_creation} />
                                        <span />
                                    </label>
                                </span>
                            </div>
                            {#if settings.force_account_creation}
                                <div class="col-12 d-flex justify-content-start align-items-center">
                                    <div
                                        class="label label-lg label-light-info px-4 mb-2 font-weight-bolder"
                                        style="width:fit-content">
                                        Per abilitarlo disabilita "Account obbligatorio"
                                    </div>
                                </div>
                            {/if}
                            <div class="col-12 d-flex justify-content-start align-items-center">
                                <small class="text-muted font-size-sm lh-xs">
                                    Se abilitato, quando i soci o tesserati compilano il modulo non verrà chiesto di
                                    creare un nuovo account.<br />
                                </small>
                            </div>
                            <label class="col-12 col-form-label font-weight-bolder text-left"
                                >Account obbligatorio</label>
                            <div class="col-12 d-flex justify-content-start align-items-center mb-3">
                                <span class="switch switch-icon">
                                    <label>
                                        <input
                                            disabled={!canPerformAction('other.settings.update') ||
                                                settings.disable_account_creation}
                                            type="checkbox"
                                            name="accountCreation"
                                            on:change={() => {
                                                if (settings.disable_account_creation) {
                                                    settings.force_account_creation = true;
                                                }
                                            }}
                                            bind:checked={settings.force_account_creation} />
                                        <span />
                                    </label>
                                </span>
                            </div>
                            {#if settings.disable_account_creation}
                                <div class="col-12 d-flex justify-content-start align-items-center">
                                    <div
                                        class="label label-lg label-light-info px-4 mb-2 font-weight-bolder"
                                        style="width:fit-content">
                                        Per abilitarlo disabilita "Modulo di iscrizione anonimo"
                                    </div>
                                </div>
                            {/if}
                            <div class="col-12 d-flex justify-content-start align-items-center">
                                <small class="text-muted font-size-sm lh-xs">
                                    Se abilitato, quando i soci o tesserati compilano il modulo dovranno avere un
                                    account.<br />
                                </small>
                            </div>
                        </div>

                        <div in:scale={{duration: 150, start: 0.98}} class="form-group row mb-0 mt-4">
                            <h1 class="col-12 font-weight-boldest text-dark mt-16">Ricevute</h1>
                        </div>
                        <div in:scale={{duration: 150, start: 0.98}} class="form-group row">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="col-12 col-form-label font-weight-bolder text-left">Numera Ricevute</label>
                            <div class="col-12 d-flex justify-content-start align-items-center mb-3">
                                <span class="switch switch-icon">
                                    <label>
                                        <input
                                            disabled={!canPerformAction('other.settings.update')}
                                            type="checkbox"
                                            name=""
                                            bind:checked={settings.enumerate_invoices} />
                                        <span />
                                    </label>
                                </span>
                            </div>
                            <div class="col-12 d-flex justify-content-start align-items-center">
                                <small class="text-muted font-size-sm lh-xs">
                                    Se abilitato, le ricevute riporteranno il numero progressivo di ricevuta in base
                                    all'anno fiscale.
                                </small>
                            </div>
                        </div>

                        <div in:scale={{duration: 150, start: 0.98}} class="form-group row">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="col-12 col-form-label font-weight-bolder text-left"
                                >Numero iniziale ricevute</label>
                            <div class="col-12 d-flex justify-content-start align-items-center mb-3">
                                <input
                                    disabled={!canPerformAction('other.settings.update')}
                                    class="form-control form-control-solid form-control-lg my-0"
                                    type="number"
                                    style="max-width: 7rem;"
                                    name=""
                                    bind:value={settings.starting_number_invoices} />
                            </div>
                            <div class="col-12 d-flex justify-content-start align-items-center">
                                <small class="text-muted font-size-sm lh-xs">
                                    Le ricevute partiranno da questo numero progressivo più uno (quindi da <b
                                        >{settings.starting_number_invoices + 1}</b
                                    >). Il numero sarà resettato all'inizio dell'anno fiscale.
                                </small>
                            </div>
                        </div>

                        <div in:scale={{duration: 150, start: 0.98}} class="form-group row">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="col-12 col-form-label font-weight-bolder text-left"
                                >Data uguale per ricevute e pagamenti</label>
                            <div class="col-12 d-flex justify-content-start align-items-center mb-3">
                                <span class="switch switch-icon">
                                    <label>
                                        <input
                                            disabled={!canPerformAction('other.settings.update')}
                                            type="checkbox"
                                            name=""
                                            bind:checked={settings.payment_date_equal_invoice_date} />
                                        <span />
                                    </label>
                                </span>
                            </div>
                            <div class="col-12 d-flex justify-content-start align-items-center">
                                <small class="text-muted font-size-sm lh-xs">
                                    Se abilitato, le ricevute riporteranno la stessa data del pagamento.
                                </small>
                            </div>
                        </div>

                        <div in:scale={{duration: 150, start: 0.98}} class="form-group row">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="col-12 col-form-label font-weight-bolder text-left"
                                >Nascondi nome causale</label>
                            <div class="col-12 d-flex justify-content-start align-items-center mb-3">
                                <span class="switch switch-icon">
                                    <label>
                                        <input
                                            disabled={!canPerformAction('other.settings.update')}
                                            type="checkbox"
                                            name=""
                                            bind:checked={settings.hide_category_name} />
                                        <span />
                                    </label>
                                </span>
                            </div>
                            <div class="col-12 d-flex justify-content-start align-items-center">
                                <small class="text-muted font-size-sm lh-xs">
                                    Se abilitato, il nome della causale non verrà riportato nel dettaglio delle causali
                                    delle ricevute.
                                </small>
                            </div>
                        </div>

                        <!-- <div in:scale={{duration: 150, start: 0.98}} class="form-group row">
                            <label class="col-12 col-form-label font-weight-bolder text-left"
                                >Ricevute temporanee eliminabili</label>
                            <div class="col-12 d-flex justify-content-start align-items-center mb-3">
                                <span class="switch switch-icon">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name=""
                                            bind:checked={settings.temporary_invoice_deletion} />
                                        <span />
                                    </label>
                                </span>
                            </div>
                            <div class="col-12 d-flex justify-content-start align-items-center">
                                <small class="text-muted font-size-sm lh-xs">
                                    Se abilitato, le ricevute potranno essere eliminate entro 7gg dalla loro creazione.
                                </small>
                            </div>
                        </div> -->

                        <div in:scale={{duration: 150, start: 0.98}} class="form-group row mb-0">
                            <h1 class="col-12 font-weight-boldest text-dark mt-16">Altro</h1>
                        </div>

                        <div in:scale={{duration: 150, start: 0.98}} class="form-group row">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="col-12 col-form-label font-weight-bolder text-left"
                                >Invia notifiche certificati medici</label>
                            <div class="col-12 d-flex justify-content-start align-items-center mb-3">
                                <!-- <label class="col-3 col-form-label">With Icon</label> -->
                                <span class="switch switch-icon">
                                    <label>
                                        <input
                                            disabled={!canPerformAction('other.settings.update')}
                                            type="checkbox"
                                            name=""
                                            bind:checked={settings.medical_certificate_notifications} />
                                        <span />
                                    </label>
                                </span>
                            </div>

                            <div class="col-12 d-flex justify-content-start align-items-center">
                                <small class="text-muted font-size-sm lh-xs">
                                    Se abilitato, verranno inviate le notifiche via email per i certificati medici in
                                    scadenza e scaduti (30gg e 7gg prima della scadenza ed 1gg dopo la scadenza).
                                </small>
                            </div>
                        </div>

                        <div in:scale={{duration: 150, start: 0.98}} class="form-group row">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="col-12 col-form-label font-weight-bolder text-left">Pagamenti Online</label>
                            <div class="col-12 d-flex justify-content-start align-items-center mb-3">
                                <!-- <label class="col-3 col-form-label">With Icon</label> -->
                                <span class="switch switch-icon">
                                    <label>
                                        <input
                                            disabled={!canPerformAction('other.settings.update')}
                                            type="checkbox"
                                            name=""
                                            bind:checked={settings.online_payments} />
                                        <span />
                                    </label>
                                </span>
                            </div>

                            <div class="col-12 d-flex justify-content-start align-items-center">
                                <small class="text-muted font-size-sm lh-xs">
                                    Se abilitato, si potranno effettuare pagamenti online. La funzionalità è attiva solo
                                    se hai configurato Stripe.
                                </small>
                            </div>
                        </div>

                        <div in:scale={{duration: 150, start: 0.98}} class="form-group row">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="col-12 col-form-label font-weight-bolder text-left"
                                >Assegna piano rate completo di default</label>
                            <div class="col-12 d-flex justify-content-start align-items-center mb-3">
                                <!-- <label class="col-3 col-form-label">With Icon</label> -->
                                <span class="switch switch-icon">
                                    <label>
                                        <input
                                            disabled={!canPerformAction('other.settings.update')}
                                            type="checkbox"
                                            name=""
                                            bind:checked={settings.full_installments_plan} />
                                        <span />
                                    </label>
                                </span>
                            </div>

                            <div class="col-12 d-flex justify-content-start align-items-center">
                                <small class="text-muted font-size-sm lh-xs">
                                    Se abilitato, quando aggiungi un atleta ad un corso con le rate, verranno assegnate
                                    tutte le rate, anche quelle già scadute.
                                </small>
                            </div>
                        </div>

                        <div in:scale={{duration: 150, start: 0.98}} class="form-group row">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="col-12 col-form-label font-weight-bolder text-left"
                                >Archivia Iscrizioni Automaticamente</label>
                            <div class="col-12 d-flex justify-content-start align-items-center mb-3">
                                <!-- <label class="col-3 col-form-label">With Icon</label> -->
                                <span class="switch switch-icon">
                                    <label>
                                        <input
                                            disabled={!canPerformAction('other.settings.update')}
                                            type="checkbox"
                                            name=""
                                            bind:checked={settings.auto_archive} />
                                        <span />
                                    </label>
                                </span>
                            </div>

                            <div class="col-12 d-flex justify-content-start align-items-center">
                                <small class="text-muted font-size-sm lh-xs">
                                    Se abilitato, le iscrizioni saranno archiviate automaticamente all'inizio del nuovo
                                    anno fiscale.
                                </small>
                            </div>
                        </div>

                        <div in:scale={{duration: 150, start: 0.98}} class="form-group row">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="col-12 col-form-label font-weight-bolder text-left"
                                >Segna Presenze Automaticamente</label>
                            <div class="col-12 d-flex justify-content-start align-items-center mb-3">
                                <!-- <label class="col-3 col-form-label">With Icon</label> -->
                                <span class="switch switch-icon">
                                    <label>
                                        <input
                                            disabled={!canPerformAction('other.settings.update')}
                                            type="checkbox"
                                            name=""
                                            bind:checked={settings.auto_mark_attendance} />
                                        <span />
                                    </label>
                                </span>
                            </div>

                            <div class="col-12 d-flex justify-content-start align-items-center">
                                <small class="text-muted font-size-sm lh-xs">
                                    Se abilitato (solo piano Pro e Teams), nel giorno della lezione del corso tutti gli
                                    atleti verranno segnati come presenti.
                                </small>
                            </div>
                        </div>
                        <div in:scale={{duration: 150, start: 0.98}} class="form-group row">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="col-12 col-form-label font-weight-bolder text-left"
                                >Segna come "pagati" i pagamenti aggiunti manualmente</label>
                            <div class="col-12 d-flex justify-content-start align-items-center mb-3">
                                <!-- <label class="col-3 col-form-label">With Icon</label> -->
                                <span class="switch switch-icon">
                                    <label>
                                        <input
                                            disabled={!canPerformAction('other.settings.update')}
                                            type="checkbox"
                                            name=""
                                            bind:checked={settings.auto_paid_payment} />
                                        <span />
                                    </label>
                                </span>
                            </div>

                            <div class="col-12 d-flex justify-content-start align-items-center">
                                <small class="text-muted font-size-sm lh-xs">
                                    Se abilitato, quando aggiungi un pagamento verrà automaticamente segnato come
                                    "pagato", ma non verrà generata la ricevuta in automatico.
                                </small>
                            </div>
                        </div>
                    {/if}

                    <div in:scale={{duration: 150, start: 0.98}} class="form-group row">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label class="col-12 col-form-label font-weight-bolder text-left"
                            >Pagamenti di importo zero</label>
                        <div class="col-12 d-flex justify-content-start align-items-center mb-3">
                            <!-- <label class="col-3 col-form-label">With Icon</label> -->
                            <span class="switch switch-icon">
                                <label>
                                    <input
                                        disabled={!canPerformAction('other.settings.update')}
                                        type="checkbox"
                                        name=""
                                        bind:checked={settings.show_zero_payments} />
                                    <span />
                                </label>
                            </span>
                        </div>

                        <div class="col-12 d-flex justify-content-start align-items-center">
                            <small class="text-muted font-size-sm lh-xs">
                                Se abilitato,
                                <ul>
                                    <li>Gli atleti vedranno i pagamenti di importo zero, e l'eventuale ricevuta.</li>
                                    <li>
                                        Verranno creati dei pagamenti anche per quote <b>tesseramento</b> e
                                        <b>iscrizione</b> con importo zero.
                                    </li>
                                </ul>
                            </small>
                        </div>
                    </div>

                    <div in:scale={{duration: 150, start: 0.98}} class="form-group row">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label class="col-12 col-form-label font-weight-bolder text-left">Modalità scura (beta)</label>
                        <div class="col-12 d-flex justify-content-start align-items-center mb-3">
                            <!-- <label class="col-3 col-form-label">With Icon</label> -->
                            <span class="switch switch-icon">
                                <label>
                                    <input
                                        disabled={!canPerformAction('other.settings.update')}
                                        type="checkbox"
                                        name=""
                                        bind:checked={settings.dark_mode} />
                                    <span />
                                </label>
                            </span>
                        </div>

                        <div class="col-12 d-flex justify-content-start align-items-center mb-12">
                            <small class="text-muted font-size-sm lh-xs">
                                Se abilitato, vedrai l'applicazione in modalità scura.
                            </small>
                        </div>
                    </div>
                </div>
                <!--end::Body-->
            </div>
            <!--end::Form-->
        </div>
    </div>
    <BottomBarFixedSave on:save={updateSettings} autoShow={true}>
        <div slot="left" class="d-flex align-items-center">
            <Warning weight={'duotone'} size={18} class="mr-2 text-warning" />
            <p class="font-weight-boldest mb-0 text-warning text-xs">
                Ricordati di salvare per applicare le modifiche.
            </p>
        </div>
    </BottomBarFixedSave>
{/if}
