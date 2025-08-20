<script>
    import {Currency, Select, SmartSelect, TextArea, TextInput} from 'components/formBuilder/preview-blocks/index.js';
    import {getDataFromForm} from 'utils/Functions.js';
    import {createEventDispatcher} from 'svelte';
    import {apiFetch} from 'utils/ApiMiddleware.js';
    import {onMount} from 'svelte';
    import PeriodAndServiceSelector from './components/PeriodAndServiceSelector.svelte';
    import {canPerformAction} from 'utils/Permissions';

    const dispatch = createEventDispatcher();

    export let id;
    export let data;
    export let datatable;
    export let show = false;
    export let isInModal = false;
    export let isEdit = false;
    export let isAssociateView = false;
    export let sportAssociationUsername = '';
    export let sportAssociationId = '';

    let campsAndRetreatsForm;
    let subscriptions = [];
    let selectedPeriods = [];

    export let handleValidation = function (e) {
        if (!campsAndRetreatsForm) initForm();
        campsAndRetreatsForm?.validate().then(function (status) {
            if (status === 'Valid') {
                dispatch('sumbit', {
                    valid: true,
                    data: getDataFromForm(e),
                });
            }
        });
    };

    function initForm() {
        campsAndRetreatsForm?.destroy();
        try {
            const formElement = document.getElementById(
                `camps_and_retreats_subscriptions_form${isEdit ? '_' + id : ''}`
            );
            const validationFields = {
                subscription: {
                    validators: {
                        notEmpty: {
                            message: 'Il socio è obbligatorio.',
                        },
                    },
                },
            };
            if (formElement) {
                campsAndRetreatsForm = FormValidation.formValidation(formElement, {
                    fields: !isEdit ? validationFields : {},
                    plugins: {
                        trigger: new FormValidation.plugins.Trigger(),
                        bootstrap: new FormValidation.plugins.Bootstrap(),
                        // submitButton: new FormValidation.plugins.SubmitButton(),
                    },
                });
            } else {
                console.error('Form not found');
            }
        } catch (e) {
            console.error(e);
        }
    }

    function fetchSubscriptions() {
        return apiFetch(
            `${__bakney.env.API.SUBSCRIPTION.LIST_ALL}${
                isAssociateView ? '?sport_association=' + sportAssociationId : ''
            }`
        ).then(res => {
            subscriptions = [];
            Object.keys(res.response.data).forEach(key => {
                subscriptions.push({
                    value: res.response.data[key].subscription_id,
                    label:
                        res.response.data[key].associate?.first_name?.toUpperCase() +
                        ' ' +
                        res.response.data[key].associate?.last_name?.toUpperCase() +
                        (res.response.data[key]?.current_year ? ' (anno corrente)' : ''),
                });
            });
        });
    }

    onMount(async () => {
        await fetchSubscriptions();
    });
</script>

<form id="camps_and_retreats_subscriptions_form{isEdit ? '_' + id : ''}" on:submit|preventDefault={handleValidation}>
    <div class="text-left">
        {#if !isEdit}
            <SmartSelect
                customClasses={'px-4 mx-4 my-4'}
                editable={false}
                active={false}
                props={{
                    id: 'subscription',
                    name: 'subscription',
                    label: 'Associato',
                    placeholder: "Seleziona l'associato",
                    required: true,
                    options: subscriptions,
                    value:
                        data?.row?.subscription?.subscription_id || data?.subscription || subscriptions[0]?.value || '',
                }} />
            {#if isAssociateView}
                <p class="mx-8">
                    Se non sei ancora associato all'associazione, <a
                        href="{__bakney.env.DOMAIN}/#/subscribe/{String(sportAssociationUsername).toLowerCase()}"
                        >iscriviti qui</a
                    >.
                </p>
            {/if}
        {:else}
            <input
                type="hidden"
                id="subscription"
                name="subscription"
                value={data?.row?.subscription?.subscription_id} />
            <input
                type="hidden"
                id="camps_and_retreats_subscription_id"
                name="camps_and_retreats_subscription_id"
                value={data?.row?.camps_and_retreats_subscription_id} />
        {/if}

        <div class="px-4 mx-4 my-8">
            <PeriodAndServiceSelector
                periods={data?.periods}
                selectedPeriods={data?.row?.selected_periods || {}}
                selectedServices={data?.row?.selected_services || {}}
                paidPeriods={data?.row?.paid_periods || {}}
                currentPeriods={data?.row?.periods || []}
                on:selectionChange={e => {
                    selectedPeriods = e.detail.periods;
                }} />
        </div>
        <input type="hidden" name="periods" value={JSON.stringify(selectedPeriods)} />
    </div>
    {#if isInModal}
        <div class="modal-footer d-flex justify-content-end mt-2">
            <button
                type="button"
                class="btn btn-light-primary font-weight-bold"
                on:click={() => {
                    show = false;
                    datatable?.reload();
                }}>
                Annulla
            </button>
            {#if (isEdit && canPerformAction('association.campsandretreats.update')) || (!isEdit && canPerformAction('association.campsandretreats.create'))}
                <button type="submit" class="btn btn-primary font-weight-bold">
                    {#if isEdit}
                        Salva
                    {:else}
                        Iscrivi
                    {/if}
                </button>
            {/if}
        </div>
    {/if}
    <slot name="footer" />
</form>
