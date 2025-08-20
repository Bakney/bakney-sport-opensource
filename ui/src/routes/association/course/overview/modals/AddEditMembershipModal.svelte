<script>
    import BasicModal from 'components/modals/BasicModal.svelte';
    import {
        Datepicker,
        Currency,
        TextInput,
        SmartSelect,
        SmartMultiSelect,
    } from 'components/formBuilder/preview-blocks/index.js';
    import {getDataFromForm} from 'utils/Functions.js';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware.js';
    import {toast} from 'svelte-sonner';
    import {createEventDispatcher, onMount} from 'svelte';
    import {userData} from 'store/stores';

    const dispatch = createEventDispatcher();

    userData.useLocalStorage();

    export let show;
    export let data = {};
    export let info = {};
    export let edit = false;
    let loading = false;
    let availableAssociates = [];

    async function prepareJSONData(formData) {
        if (info.billed_duration_is_sport_season) {
            formData.billed_until = moment(formData.billed_until, 'DD/MM/YYYY').format('YYYY-MM-DD');
            formData.billed_frequency = 12;
        } else {
            formData.billed_frequency = JSON.parse(formData.billed_frequency)?.value || null;
            if (!info.billed_from_subscription_date) {
                formData.billed_from_day_of_month = JSON.parse(formData.billed_from_day_of_month)?.value || null;
            }
            formData.billed_until = moment(formData.billed_from, 'DD/MM/YYYY')
                .add(formData.billed_frequency, 'months')
                .format('YYYY-MM-DD');
        }

        formData.billed_from = moment(formData.billed_from, 'DD/MM/YYYY').format('YYYY-MM-DD');

        formData.auto_renewal = formData.auto_renewal === 'on' ? true : false;
        formData.membership_active = formData.membership_active === 'on' ? true : false;

        formData.membership_fee = parseFloat(formData.membership_fee.replaceAll(',', '.'));

        let subscriptions = [];
        JSON.parse(formData.selectedAthletes).forEach(athlete => {
            let athleteData = {
                course: info.course_id,
                subscription_id: athlete.value,
                billed_from: formData.billed_from,
                billed_until: formData.billed_until,
                billed_frequency: formData.billed_frequency,
                billed_from_day_of_month: formData.billed_from_day_of_month,
                membership_active: formData.membership_active,
                auto_renewal: formData.auto_renewal,
                membership_fee: formData.membership_fee,
            };
            if (edit) {
                athleteData.course_subscription_id = formData.course_subscription_id;
            }
            subscriptions.push(athleteData);
        });
        return subscriptions;
    }

    async function create(formData) {
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Creazione...',
        });

        const url = __bakney.env.API.COURSE_SUBSCRIPTIONS.ADD;

        let subs = await prepareJSONData(formData);

        if (subs.length == 0) {
            KTApp.unblockPage();
            toast.error('Seleziona almeno un tesserato.');
            return;
        }

        const res = await apiFetch(url, {
            method: 'POST',
            body: JSON.stringify(subs),
        });

        KTApp.unblockPage();

        if (res.status == 200 || res.status == 201) {
            toast.success('Abbonamento creato con successo.');
            dispatch('update');
            show = false;
        } else {
            toast.error(res.response?.msg || "Si è verificato un errore durante l'iscrizione.");
        }
    }

    async function update(formData) {
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Aggiornamento...',
        });

        let subs = await prepareJSONData(formData);

        if (subs.length == 0 || subs.length > 1) {
            KTApp.unblockPage();
            toast.error('Seleziona solo un tesserato.');
            return;
        }
        const url = replaceUID(__bakney.env.API.COURSE_SUBSCRIPTIONS.UPDATE, data.course_subscription_id);

        const res = await apiFetch(url, {
            method: 'PATCH',
            body: JSON.stringify(subs[0]),
        });
        KTApp.unblockPage();

        if (res.status == 200) {
            toast.success('Abbonamento aggiornato con successo.');
            show = false;
            dispatch('update');
        } else {
            toast.error(res.response?.msg || "Si è verificato un errore durante l'aggiornamento.");
        }
    }

    function handleValidation(e) {
        if (edit) {
            update(getDataFromForm(e));
        } else {
            create(getDataFromForm(e));
        }
    }

    async function fetchAvailableAssociates() {
        loading = true;
        const res = await apiFetch(
            `${__bakney.env.HOST}/subscription/list/all?current_year=true&type=athletes&course_id=${info.course_id}`
        );

        if (!res.error) {
            let dataResult = res.response.data;
            availableAssociates = [];
            for (let i = 0; i < Object.keys(dataResult).length; i++) {
                availableAssociates.push(dataResult[i]);
            }
        }
        loading = false;
    }

    onMount(async () => {
        await fetchAvailableAssociates();
    });
</script>

<div>
    <BasicModal
        id={`subscription-modal`}
        bind:show
        title="{edit ? 'Modifica' : 'Crea'} abbonamento"
        showTitle={true}
        showActionButton={true}
        showCancelButton={true}
        showFooter={false}
        modalSize={'md'}
        scrollable={false}
        hideOnClickOutside={true}
        bodyClass={'py-2 px-0'}>
        {#if !loading}
            <form id="course_subscription_form" on:submit|preventDefault={handleValidation}>
                {#if edit}
                    <input type="hidden" name="course_subscription_id" value={data.course_subscription_id} />
                {/if}
                <div class="px-7">
                    <SmartMultiSelect
                        customClasses="mb-4 p-0"
                        editable={false}
                        active={false}
                        minNumberOfSelectedItems={1}
                        props={{
                            id: 'selectedAthletes',
                            name: 'selectedAthletes',
                            label: 'Tesserati',
                            disabled: edit || data?.disable_selection_of_athletes || false,
                            placeholder: "Seleziona l'atleta",
                            helperLabel: 'Seleziona i tesserati da iscrivere al corso',
                            required: true,
                            clearable: true,
                            searchable: true,
                            showChevron: true,
                            options: availableAssociates?.map(athlete => ({
                                label: `${athlete.associate.first_name.toUpperCase()} ${athlete.associate.last_name.toUpperCase()} (${
                                    athlete.current_year ? 'Anno corrente' : 'Anni precedenti'
                                })`,
                                value: athlete.subscription_id,
                            })),
                            value: edit
                                ? {
                                      label: `${data?.subscription?.associate?.first_name.toUpperCase()} ${data?.subscription?.associate?.last_name.toUpperCase()}`,
                                      value: data?.subscription?.subscription_id,
                                  }
                                : data?.subscription_id
                                ? [
                                      {
                                          label: `${data?.associate?.first_name?.toUpperCase()} ${data?.associate?.last_name?.toUpperCase()}`,
                                          value: data?.subscription_id,
                                      },
                                  ]
                                : [],
                        }} />
                    <Currency
                        customClasses="mb-4"
                        editable={false}
                        props={{
                            id: 'membership_fee',
                            name: 'membership_fee',
                            label: 'Quota di iscrizione',
                            placeholder: 'Inserisci la quota',
                            required: true,
                            value: edit ? data.membership_fee.replaceAll('.', ',') : info.fee || '',
                        }} />
                    {#if !info.billed_duration_is_sport_season}
                        <SmartSelect
                            customClasses="mb-4"
                            editable={false}
                            props={{
                                id: 'billed_frequency',
                                name: 'billed_frequency',
                                label: 'Durata abbonamento (mesi)',
                                placeholder: 'Seleziona il numero di mesi',
                                required: true,
                                clearable: false,
                                searchable: true,
                                showChevron: true,
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
                                value: data?.billed_frequency || info.billed_frequency || '',
                            }} />
                        {#if !info.billed_from_subscription_date}
                            <SmartSelect
                                customClasses={'mb-4'}
                                editable={false}
                                active={false}
                                on:change={e => {
                                    data.billed_from_day_of_month = e.detail.value;
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
                                    value: data?.billed_from_day_of_month || info.billed_from_day_of_month || 1,
                                    options: Array.from({length: 28}, (_, i) => ({
                                        label: i + 1 + ' del mese',
                                        value: i + 1,
                                    })),
                                }} />
                        {/if}
                    {/if}
                    <div class="d-flex flex-wrap" style="gap: 1rem;">
                        <Datepicker
                            customClasses="mb-4"
                            editable={false}
                            props={{
                                id: 'billed_from',
                                name: 'billed_from',
                                label: 'Data inizio',
                                placeholder: 'Seleziona data inizio',
                                required: true,
                                format: 'DD/MM/YYYY',
                                value: data?.billed_from
                                    ? moment(data?.billed_from, 'YYYY-MM-DD').format('DD/MM/YYYY')
                                    : info?.billed_duration_is_sport_season
                                    ? moment(
                                          `${$userData.subscription_start_day}/${
                                              $userData.subscription_start_month
                                          }/${new Date().getFullYear()}`,
                                          'DD/MM/YYYY'
                                      ).format('DD/MM/YYYY')
                                    : info.billed_from_subscription_date
                                    ? moment().format('DD/MM/YYYY')
                                    : moment(
                                          `${info.billed_from_day_of_month}/${
                                              new Date().getMonth() + 1
                                          }/${new Date().getFullYear()}`,
                                          'DD/MM/YYYY'
                                      ).format('DD/MM/YYYY'),
                            }} />
                        {#if info.billed_duration_is_sport_season}
                            <Datepicker
                                customClasses="mb-4"
                                editable={false}
                                props={{
                                    id: 'billed_until',
                                    name: 'billed_until',
                                    label: 'Data fine',
                                    placeholder: 'Seleziona data fine',
                                    required: true,
                                    format: 'DD/MM/YYYY',
                                    value: moment(
                                        `${$userData.subscription_start_day}/${$userData.subscription_start_month}/${
                                            new Date().getFullYear() + 1
                                        }`,
                                        'DD/MM/YYYY'
                                    )
                                        .subtract(1, 'days')
                                        .format('DD/MM/YYYY'),
                                }} />
                        {/if}
                    </div>
                    <h5 class="font-weight-bolder font-size-h4 mb-4 mt-4">Opzioni</h5>
                    <div class="d-flex flex-wrap justify-content-between mb-4" style="gap: 1.5rem;">
                        <div class="form-group mb-4">
                            <div class="checkbox-inline">
                                <label class="checkbox">
                                    <input
                                        type="checkbox"
                                        name="membership_active"
                                        checked={data.membership_active ?? true} />
                                    <span />
                                    <div class="font-weight-bolder font-size-lg">Abbonamento attivo</div>
                                </label>
                            </div>
                        </div>

                        <div class="form-group mb-4">
                            <div class="checkbox-inline">
                                <label class="checkbox">
                                    <input
                                        type="checkbox"
                                        name="auto_renewal"
                                        checked={edit ? data.auto_renewal : info.auto_renewal} />
                                    <span />
                                    <div class="font-weight-bolder font-size-lg">Rinnovo automatico</div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {#if edit}
                    <div
                        class="bg-light-info py-2 px-4 rounded-xl text-primary font-weight-bolder d-flex align-items-center mx-6 mb-8"
                        style="outline: 1px solid #a8b9ffa8;border-top: 1px solid #ffffff45;">
                        <span>Le modifiche ai pagamenti saranno applicate dal prossimo rinnovo.</span>
                    </div>
                {/if}

                <div class="modal-footer d-flex justify-content-end mt-2">
                    <button
                        type="button"
                        class="btn btn-light-primary font-weight-bold"
                        on:click={() => (show = false)}>
                        Annulla
                    </button>
                    <button type="submit" class="btn btn-primary font-weight-bold">
                        {edit ? 'Salva' : 'Crea'}
                    </button>
                </div>
            </form>
        {:else}
            <div class="d-flex justify-content-center align-items-center" style="height: 100px;">
                <div class="spinner spinner-primary spinner-lg" />
            </div>
        {/if}
    </BasicModal>
</div>
