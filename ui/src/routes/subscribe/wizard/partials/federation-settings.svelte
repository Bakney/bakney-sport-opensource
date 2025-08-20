<script>
    import {typesOfAssociates} from 'utils/enumUtils';
    import {SmartSelect} from 'components/formBuilder/preview-blocks';
    import {createEventDispatcher} from 'svelte';

    const dispatch = createEventDispatcher();

    export let formData;
    export let isInEdit = false;
    export let availableTypesOfRequests = [
        {
            value: 'affiliazione',
            label: 'Affiliazione',
        },
        {
            value: 'rinnovo',
            label: 'Rinnovo',
        },
    ];
</script>

<div class="border bg-white rounded-lg py-4 px-8 mb-18">
    <h3 class="font-weight-bolder font-size-h2 mt-8 mb-4">Domanda affiliazione</h3>
    <SmartSelect
        customClasses={'min-w-100'}
        editable={false}
        active={false}
        bind:value={formData.custom_data.type_of_associate}
        on:change={event => {
            dispatch('type_of_associate_changed', {
                type_of_associate: event.detail.value,
            });
        }}
        props={{
            id: 'custom_data.type_of_associate',
            name: 'custom_data.type_of_associate',
            label: 'Sono un/una',
            placeholder: 'Seleziona la tipologia di associato',
            required: true,
            clearable: false,
            searchable: false,
            showChevron: true,
            options: typesOfAssociates,
            value: formData?.custom_data?.type_of_associate || null,
        }} />
    <SmartSelect
        customClasses={'min-w-100'}
        editable={false}
        active={false}
        bind:value={formData.custom_data.type_of_request}
        props={{
            id: 'custom_data.type_of_request',
            name: 'custom_data.type_of_request',
            label: 'Tipo di richiesta',
            placeholder: 'Seleziona il tipo di richiesta',
            required: true,
            clearable: false,
            searchable: false,
            showChevron: true,
            options: availableTypesOfRequests,
            value: formData?.custom_data?.type_of_request || 'affiliazione',
        }} />
    {#if formData?.custom_data?.type_of_request === 'rinnovo' && !['scuola-asc', 'asd-o-ssd', 'societa'].includes(formData?.custom_data?.type_of_associate)}
        <div class="form-group">
            <label for="custom_data.membership_number">Numero di tesseramento*</label>
            <input
                type="number"
                class="form-control form-control-solid form-control-lg"
                id="custom_data.membership_number"
                name="custom_data.membership_number"
                placeholder="Inserisci il numero di tesseramento"
                required
                bind:value={formData.custom_data.membership_number} />
        </div>
    {/if}
    {#if !isInEdit}
        <SmartSelect
            customClasses={'min-w-100'}
            editable={false}
            active={false}
            bind:value={formData.associate_data.type}
            props={{
                id: 'custom_data.type_of_qualifications',
                name: 'custom_data.type_of_qualifications',
                label: 'Chiedo di diventare',
                placeholder: 'Socio o tesserato...',
                helperLabel: 'ai sensi dell’articolo 8 dello statuto sociale*',
                required: true,
                clearable: false,
                searchable: false,
                showChevron: true,
                multiple: false,
                options: [
                    ...(!(
                        formData.custom_data.type_of_associate === 'atleta' ||
                        formData.custom_data.type_of_associate === 'atleta-agonista'
                    )
                        ? [
                              {
                                  value: 1,
                                  label: 'Socio',
                              },
                          ]
                        : []),
                    {
                        value: 3,
                        label: 'Tesserato',
                    },
                ],
                value: formData?.associate_data?.type || null,
            }} />
    {/if}

    {#if !['scuola-asc', 'asd-o-ssd', 'societa'].includes(formData?.custom_data?.type_of_associate)}
        <div class="row">
            <div class="col-12">
                <div class="form-group">
                    <!-- svelte-ignore a11y-label-has-associated-control -->
                    <label>Disciplina praticata<b>*</b></label>
                    <input
                        bind:value={formData.custom_data.disciplines}
                        name="custom_data.disciplines"
                        type="text"
                        required
                        class="form-control form-control-solid form-control-lg margin-tb-2"
                        placeholder="Discipline insegnate..."
                        style="text-transform:capitalize" />
                </div>
            </div>
        </div>
    {/if}
</div>
