<script>
    import {Currency, Select, TextArea, TextInput} from 'components/formBuilder/preview-blocks/index.js';
    import {getDataFromForm} from 'utils/Functions.js';
    import {createEventDispatcher} from 'svelte';
    import {apiFetch} from 'utils/ApiMiddleware.js';
    import {onMount} from 'svelte';
    import {toast} from 'svelte-sonner';
    import {canPerformAction} from 'utils/Permissions';

    const dispatch = createEventDispatcher();

    export let id;
    export let data;
    export let show = false;
    export let isInModal = false;
    export let isEdit = false;

    let campsAndRetreatsForm;
    let categories = [];

    export let handleValidation = function (e) {
        if (!campsAndRetreatsForm) initForm();
        campsAndRetreatsForm?.validate().then(function (status) {
            if (status === 'Valid') {
                dispatch('sumbit', {
                    valid: true,
                    data: getDataFromForm(e),
                });
            } else {
                swal.fire({
                    text: 'Per favore, inserisci tutti i dati e riprova.',
                    icon: 'error',
                    buttonsStyling: false,
                    confirmButtonText: 'Ok, capito!',
                    customClass: {
                        confirmButton: 'btn font-weight-bold btn-light-primary',
                    },
                });
            }
        });
    };

    function initForm() {
        campsAndRetreatsForm?.destroy();
        campsAndRetreatsForm = FormValidation.formValidation(
            document.getElementById('camps_and_retreats_services_form'),
            {
                fields: {
                    fee: {
                        validators: {
                            notEmpty: {
                                message: 'La quota di partecipazione è obbligatoria.',
                            },
                        },
                    },
                    payment_category: {
                        validators: {
                            notEmpty: {
                                message: 'La causale è obbligatoria.',
                            },
                        },
                    },
                    title: {
                        validators: {
                            notEmpty: {
                                message: 'Il nome è obbligatorio.',
                            },
                        },
                    },
                    description: {
                        validators: {
                            notEmpty: {
                                message: 'La descrizione è obbligatoria.',
                            },
                        },
                    },
                },
                plugins: {
                    trigger: new FormValidation.plugins.Trigger(),
                    bootstrap: new FormValidation.plugins.Bootstrap(),
                    // submitButton: new FormValidation.plugins.SubmitButton(),
                },
            }
        );
    }

    async function fetchCategories() {
        let res = await apiFetch(__bakney.env.API.PAYMENT.CATEGORY.LIST);

        if (!res.error)
            categories =
                res.response.data
                    ?.filter(x => !x.expense)
                    .map(x => {
                        return {
                            value: x.payment_category_id,
                            label: x.name,
                        };
                    }) || [];
        else if (res.status != 403 && res.status != 401) toast.error('Qualcosa è andato storto.');
    }

    onMount(async () => {
        await fetchCategories();
    });
</script>

<form id="camps_and_retreats_services_form" on:submit|preventDefault={handleValidation}>
    <input type="hidden" name="camps_and_retreats_period" value={id} />
    <div class="text-left">
        <div class="row px-0 mx-0">
            <div class="col-12 col-md-6">
                <Currency
                    customClasses={'pl-4 my-4'}
                    editable={false}
                    active={false}
                    props={{
                        id: 'fee',
                        name: 'fee',
                        label: 'Costo servizio',
                        placeholder: 'Inserisci il costo del servizio',
                        required: true,
                        value: data?.fee || null,
                    }} />
            </div>
            <div class="col-12 col-md-6">
                {#if categories && categories.length > 0}
                    <Select
                        hideEmptyState={true}
                        customClasses={'pr-4 my-4'}
                        editable={false}
                        active={false}
                        props={{
                            id: 'payment_category',
                            name: 'payment_category',
                            label: 'Causale',
                            placeholder: 'Seleziona la causale',
                            helperLabel:
                                "Genera una nuova causale da <a class='ml-1' href='/#/payment/category/list' target='_blank'><u>qui</u></a>.",
                            required: true,
                            options: categories,
                            value: data?.payment_category || categories[0]?.value || '',
                        }} />
                {/if}
            </div>
        </div>
        <TextInput
            customClasses={'px-4 mx-4 my-4'}
            editable={false}
            active={false}
            props={{
                id: 'title',
                name: 'title',
                label: 'Titolo',
                placeholder: 'Inserisci il nome della settimana/periodo',
                required: true,
                value: data?.title,
            }} />
        <TextArea
            customClasses={'px-4 mx-4 my-4'}
            editable={false}
            active={false}
            props={{
                id: 'description',
                name: 'description',
                label: 'Descrizione',
                placeholder: 'Inserisci la descrizione del settimana/periodo',
                required: true,
                value: data?.description,
            }} />
    </div>
    {#if isInModal}
        <div class="modal-footer d-flex justify-content-end mt-2">
            {#if isEdit && canPerformAction('association.campsandretreats.delete')}
                <button
                    type="button"
                    class="btn btn-danger font-weight-bold"
                    on:click={() => {
                        dispatch('delete');
                    }}>
                    Elimina
                </button>
            {/if}
            <button type="button" class="btn btn-light-primary font-weight-bold" on:click={() => (show = false)}>
                Annulla
            </button>
            {#if (isEdit && canPerformAction('association.campsandretreats.update')) || (!isEdit && canPerformAction('association.campsandretreats.create'))}
                <button type="submit" class="btn btn-primary font-weight-bold">
                    {#if isEdit}
                        Salva
                    {:else}
                        Crea
                    {/if}
                </button>
            {/if}
        </div>
    {/if}
    <slot name="footer" />
</form>
