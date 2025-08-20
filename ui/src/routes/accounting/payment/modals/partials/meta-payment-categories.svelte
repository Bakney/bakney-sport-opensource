<script>
    import {
        Datepicker,
        Currency,
        SmartSelect,
        FileInput,
        TextArea,
        TextInput,
    } from 'components/formBuilder/preview-blocks/index.js';
    import {ListPlus, TrashSimple} from 'phosphor-svelte';

    export let data = {
        expense: false,
        meta_payment_categories: [],
    };
    export let categories = [];

    function addMetaPaymentCategory(
        obj = {
            payment_category_id: data?.expense
                ? categories?.filter(x => x.name == 'Compensi e Rimborsi Spese')[0]?.payment_category_id
                : categories?.filter(x => x.name == 'entrate e proventi da attività tipiche')[0]?.payment_category_id,
            amount: 0,
            subject: 0, // 0 = other
        }
    ) {
        data.meta_payment_categories = [...data.meta_payment_categories, obj];
    }

    function deleteMetaPaymentCategory(idx) {
        let categories = [...data.meta_payment_categories.filter((meta, index) => index != idx)];
        data.meta_payment_categories = [];
        for (let i = 0; i < categories.length; i++) {
            addMetaPaymentCategory(categories[i]);
        }
    }
</script>

<div class="rounded-lg border mx-2 mb-5 p-4">
    <!-- hidden input -->
    {#if data.meta_payment_categories}
        <div class="font-weight-bolder font-size-h4 mb-4">
            Causali aggiuntive

            <div class="text-muted font-size-xs font-weight-bold">
                Aggiungi più causali per ragrupparle in un'unico pagamento.
            </div>
        </div>
        {#each data.meta_payment_categories as meta_payment_category, idx}
            <div class="d-flex align-items-center justify-content-between p-0 m-0 mb-4">
                <SmartSelect
                    customClasses={'mx-0 px-0 mb-0 col-12 col-md-7'}
                    editable={false}
                    active={false}
                    on:change={e => {
                        data.meta_payment_categories[idx].payment_category_id = e.detail.value;
                    }}
                    props={{
                        id: `meta_payment_category_${idx}.payment_category`,
                        name: `meta_payment_category_${idx}.payment_category`,
                        label: 'Causale',
                        placeholder: 'Seleziona la causale',
                        required: true,
                        clearable: false,
                        searchable: false,
                        showChevron: true,
                        options: data.expense
                            ? categories
                                  .filter(x => x.expense)
                                  ?.map(x => {
                                      return {label: x.name, value: x.payment_category_id};
                                  })
                            : categories
                                  .filter(x => !x.expense)
                                  ?.map(x => {
                                      return {label: x.name, value: x.payment_category_id};
                                  }),
                        value:
                            meta_payment_category?.payment_category_id ||
                            (data?.expense
                                ? categories?.filter(x => x.name == 'Compensi e Rimborsi Spese')[0]?.payment_category_id
                                : categories?.filter(x => x.name == 'entrate e proventi da attività tipiche')[0]
                                      ?.payment_category_id),
                    }} />

                <Currency
                    customClasses={'mx-2 mb-0 px-0 min-w-10 col-12 col-md-auto'}
                    editable={false}
                    on:change={e => {
                        meta_payment_category.amount = e.detail;
                    }}
                    props={{
                        label: 'Importo',
                        name: `amount_${idx}`,
                        id: `amount_${idx}`,
                        placeholder: '0,00',
                        required: true,
                        value:
                            typeof meta_payment_category.amount == 'number'
                                ? String(meta_payment_category.amount).replace('.', ',')
                                : meta_payment_category.amount,
                    }} />

                <button
                    type="button"
                    class="btn btn-icon text-danger mt-8 btn-sm mb-0 col-12 col-md-auto"
                    on:click={() => deleteMetaPaymentCategory(idx)}>
                    <TrashSimple size={20} weight="bold" />
                </button>
            </div>
        {/each}
    {/if}

    <div class="row p-0 m-0 d-flex justify-content-center mt-6">
        <!-- button to add more categories -->
        <button
            type="button"
            class="btn btn-dark btn-sm d-flex align-items-center font-weight-boldest"
            on:click={() => {
                addMetaPaymentCategory();
            }}>
            <ListPlus size={18} weight="bold" class="mr-1" />
            Aggiungi causale
        </button>
    </div>
</div>
