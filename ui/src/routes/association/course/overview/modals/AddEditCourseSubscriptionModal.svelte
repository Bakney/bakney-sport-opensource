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

    const dispatch = createEventDispatcher();

    export let show;
    export let data = {};
    export let info = {};
    export let edit = false;
    let loading = false;
    let availableAssociates = [];

    async function prepareJSONData(formData) {
        let subscriptions = [];
        let multiple_quote = JSON.parse(formData.selectedQuote || null)?.value || null;
        if (multiple_quote) {
            multiple_quote = info?.multiple_quotes?.find(quote => quote.quote_id == multiple_quote) || null;
        }
        let selectedEvents = JSON.parse(formData.selectedEvents || '[]');
        if (selectedEvents.length > 0) {
            selectedEvents = selectedEvents.map(event => info.events?.find(e => e.id == event.value));
        }
        // only on create
        if (!edit) {
            JSON.parse(formData.selectedAthletes).forEach(athlete => {
                subscriptions.push({
                    course: info.course_id,
                    subscription_id: athlete.value,
                    multiple_quote: multiple_quote,
                    events: selectedEvents,
                });
            });
        } else {
            // fill the selectedEvents with the course_subscription_installment_id
            selectedEvents = [
                ...selectedEvents.map(event => {
                    let installment = data.installments?.find(installment => installment.id == event.id);
                    if (installment) {
                        return {
                            course_subscription_installment_id: installment.course_subscription_installment_id,
                            id: event.id,
                            amount: installment.amount,
                            payment_date: installment.payment_date,
                        };
                    }
                    return event;
                }),
            ];
            subscriptions = [
                {
                    course: info.course_id,
                    subscription_id: data.subscription_id,
                    multiple_quote: multiple_quote,
                    events: selectedEvents,
                },
            ];
        }
        return subscriptions;
    }

    async function create(formData) {
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Creazione...',
        });

        const url = __bakney.env.API.COURSE_SUBSCRIPTIONS.ADD;

        data = await prepareJSONData(formData);

        if (data.length == 0) {
            KTApp.unblockPage();
            toast.error('Seleziona almeno un tesserato.');
            return;
        }

        const res = await apiFetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
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

        const url = replaceUID(__bakney.env.API.COURSE_SUBSCRIPTIONS.UPDATE, data.course_subscription_id);

        const subscriptionData = await prepareJSONData(formData);

        if (subscriptionData.length == 0) {
            KTApp.unblockPage();
            toast.error('Seleziona almeno un tesserato.');
            return;
        }

        const res = await apiFetch(url, {
            method: 'PATCH',
            body: JSON.stringify(subscriptionData[0]),
        });

        KTApp.unblockPage();

        if (res.status == 200) {
            toast.success('Abbonamento aggiornato con successo.');
            dispatch('update');
            show = false;
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
        title={edit ? 'Modifica iscrizione al corso' : 'Iscrivi al corso'}
        showTitle={true}
        showActionButton={true}
        showCancelButton={true}
        showFooter={false}
        modalSize={'lg'}
        scrollable={false}
        hideOnClickOutside={true}
        bodyClass={'py-2 px-0'}>
        {#if !loading}
            <form id="course_subscription_form" on:submit|preventDefault={handleValidation}>
                <div class="px-7">
                    {#if !edit}
                        <SmartMultiSelect
                            customClasses="mb-4 p-0"
                            editable={false}
                            active={false}
                            minNumberOfSelectedItems={1}
                            props={{
                                id: 'selectedAthletes',
                                name: 'selectedAthletes',
                                label: 'Tesserati',
                                placeholder: "Seleziona l'atleta",
                                helperLabel: 'Seleziona i tesserati da iscrivere al corso',
                                disabled: data?.disable_selection_of_athletes || edit || false,
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
                                value: data?.subscription_id
                                    ? [
                                          {
                                              label: `${data?.associate?.first_name?.toUpperCase()} ${data?.associate?.last_name?.toUpperCase()}`,
                                              value: data?.subscription_id,
                                          },
                                      ]
                                    : [],
                            }} />
                    {:else}
                        <span class="label label-light-primary label-inline font-weight-bolder label-lg mb-4"
                            >{data?.subscription?.associate?.first_name}
                            {data?.subscription?.associate?.last_name}</span>
                    {/if}
                    {#if info.course_type == 2}
                        <SmartSelect
                            customClasses="mb-0 p-0"
                            editable={false}
                            on:change={e => {
                                console.info(e.detail);
                            }}
                            props={{
                                options: info?.multiple_quotes?.map(quote => ({
                                    label: `${quote.title} - ${quote.amount}€`,
                                    value: quote.quote_id,
                                })),
                                label: 'Quota',
                                name: 'selectedQuote',
                                id: 'selectedQuote',
                                placeholder: 'Seleziona la quota',
                                helperLabel: edit
                                    ? 'La modifica della quota non apporta modifiche ai pagamenti.'
                                    : 'Seleziona la quota da applicare',
                                required: true,
                                value: data?.multiple_quote?.quote_id ?? null,
                            }} />
                    {/if}
                    {#if info.events && !edit}
                        <SmartMultiSelect
                            customClasses="mb-0 p-0"
                            editable={false}
                            props={{
                                label: 'Piano rate',
                                name: 'selectedEvents',
                                id: 'selectedEvents',
                                placeholder: 'Seleziona le rate da pagare',
                                helperLabel: edit
                                    ? 'Seleziona le rate da modificare (i pagamenti già incassati non saranno eliminati)'
                                    : 'Seleziona le rate da aggiungere',
                                required: true,
                                options: info.events?.map(event => ({
                                    label: `${event.payment_date} - ${event.amount}€`,
                                    value: event.id,
                                })),
                                clearable: false,
                                searchable: true,
                                showChevron: true,
                                value:
                                    info.events?.map(event => ({
                                        label: `${event.payment_date} - ${event.amount}€`,
                                        value: event.id,
                                    })) || [],
                            }} />
                    {:else if data?.installments && edit && info.course_type == 1}
                        <SmartMultiSelect
                            customClasses="mb-0 p-0"
                            editable={false}
                            props={{
                                label: 'Piano rate',
                                name: 'selectedEvents',
                                id: 'selectedEvents',
                                placeholder: 'Seleziona le rate da pagare',
                                helperLabel: edit
                                    ? 'Seleziona le rate da modificare (i pagamenti già incassati non saranno eliminati)'
                                    : 'Seleziona le rate da aggiungere',
                                required: true,
                                options: [
                                    ...(data?.installments?.map(installment => ({
                                        label: `${installment.paid ? '✅ ' : '⚠️ '} n.${installment.id + 1} ${
                                            moment(installment.payment_date).isValid()
                                                ? moment(installment.payment_date).format('DD/MM/YYYY')
                                                : ''
                                        } - ${installment.amount}€`,
                                        value: installment.id,
                                    })) || []),
                                    ...(info.events
                                        ?.filter(
                                            event =>
                                                !data?.installments?.some(installment => installment.id === event.id)
                                        )
                                        ?.map(event => ({
                                            label: `N.${event.id + 1} ${
                                                moment(event.payment_date).isValid()
                                                    ? moment(event.payment_date).format('DD/MM/YYYY')
                                                    : ''
                                            } - ${event.amount}€`,
                                            value: event.id,
                                        })) || []),
                                ],
                                clearable: false,
                                searchable: true,
                                showChevron: true,
                                value:
                                    data?.installments?.map(installment => ({
                                        label: `${installment.paid ? '✅ ' : '⚠️ '} n.${installment.id + 1} ${
                                            moment(installment.payment_date).isValid()
                                                ? moment(installment.payment_date).format('DD/MM/YYYY')
                                                : ''
                                        } - ${installment.amount}€`,
                                        value: installment.id,
                                    })) || [],
                            }} />
                    {/if}
                </div>

                <div class="modal-footer d-flex justify-content-end mt-2">
                    <button
                        type="button"
                        class="btn btn-light-primary font-weight-bold"
                        on:click={() => (show = false)}>
                        Annulla
                    </button>
                    <button type="submit" class="btn btn-primary font-weight-bold">
                        {edit ? 'Modifica' : 'Aggiungi'}
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
