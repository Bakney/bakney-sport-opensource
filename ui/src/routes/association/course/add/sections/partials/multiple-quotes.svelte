<script>
    import Currency from 'components/formBuilder/preview-blocks/currency-input.svelte';
    import TextInput from 'components/formBuilder/preview-blocks/text-input.svelte';
    import SmartSelect from 'components/formBuilder/preview-blocks/smart-select-input.svelte';
    import {onMount} from 'svelte';
    import {toast} from 'svelte-sonner';
    import {apiFetch} from 'utils/ApiMiddleware';
    import {TrashSimple} from 'phosphor-svelte';

    export let course;
    export let multiple_quotes = [];
    export let editable = true;
    let paymentCategories = [];

    function addQuote() {
        const newQuote = {
            title: '',
            payment_category_id: '',
            amount: '',
            quote_id: crypto.randomUUID(),
        };
        multiple_quotes = [...(multiple_quotes ?? []), newQuote];
        course.multiple_quotes = multiple_quotes;
    }

    function removeQuote(index) {
        multiple_quotes = multiple_quotes.filter((_, i) => i !== index);
        course.multiple_quotes = multiple_quotes;
    }

    function updateQuote(index, field, value) {
        multiple_quotes[index][field] = value;
        multiple_quotes = [...multiple_quotes];
        course.multiple_quotes = multiple_quotes;
    }

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
    onMount(() => {
        fetchPaymentCategories();
        // check if course.multiple_quotes is empty, if not, set multiple_quotes to course.multiple_quotes
        if (course?.multiple_quotes?.length > 0) {
            multiple_quotes = course.multiple_quotes;
        } else {
            multiple_quotes = [];
        }
    });
</script>

<div>
    <h3 class="font-weight-bolder">Quote multiple</h3>
    <p class="text-muted font-weight-bold">
        Configura le quote multiple per il corso, ogni atleta potrà scegliere una delle quote configurate.
    </p>
    {#if editable}
        <div class="border rounded-lg p-6 mt-6">
            <div class="quotes-container">
                {#each multiple_quotes ?? [] as quote, i}
                    <div class="quote-item mb-3 p-0 rounded">
                        <div class="row">
                            <div
                                class="col-12 col-md-3 mb-md-0"
                                style={!editable ? 'pointer-events: none;opacity: 0.8;' : ''}>
                                <TextInput
                                    customClasses="mb-0 p-0"
                                    editable={false}
                                    value={quote.title}
                                    on:change={e => updateQuote(i, 'title', e.detail)}
                                    props={{
                                        label: 'Titolo',
                                        name: 'quoteTitle',
                                        id: 'quoteTitle_' + i,
                                        placeholder: 'Es: Quota Base, Quota Premium...',
                                        required: true,
                                        value: quote.title,
                                    }} />
                            </div>
                            <div
                                class="col-12 col-md-5 mb-md-0"
                                style={!editable ? 'pointer-events: none;opacity: 0.8;' : ''}>
                                <SmartSelect
                                    customClasses="mb-0 p-0"
                                    value={quote.payment_category_id}
                                    editable={false}
                                    on:change={e => updateQuote(i, 'payment_category', e.detail)}
                                    props={{
                                        options: paymentCategories ?? [],
                                        label: 'Causale',
                                        name: 'quoteCategory',
                                        id: 'quoteCategory_' + i,
                                        placeholder: 'Seleziona la causale',
                                        required: true,
                                        value: quote.payment_category?.value || '',
                                    }}>
                                    <div slot="list-append" class="w-100 d-flex justify-content-center">
                                        <button
                                            type="button"
                                            class="btn btn-sm btn-light-primary font-weight-boldest mx-auto mt-2"
                                            on:click|stopPropagation={() => {
                                                window.location.href = '/#/payment/category/list';
                                            }}>
                                            Aggiungi Causale
                                        </button>
                                    </div>
                                </SmartSelect>
                            </div>
                            <div
                                class="col-12 col-md-3 mb-md-0"
                                style={!editable ? 'pointer-events: none;opacity: 0.8;' : ''}>
                                <Currency
                                    customClasses="mb-0 p-0"
                                    value={quote.amount}
                                    editable={false}
                                    on:change={e => updateQuote(i, 'amount', e.detail)}
                                    props={{
                                        label: 'Importo',
                                        name: 'quoteAmount_' + i,
                                        id: 'quoteAmount_' + i,
                                        placeholder: '0,00',
                                        required: true,
                                        value: quote.amount,
                                    }} />
                            </div>
                            <div class="col-12 col-md-1 d-flex justify-content-end align-items-end">
                                <button
                                    disabled={!editable}
                                    type="button"
                                    class="px-2 btn btn-sm btn-icon btn-danger font-weight-boldest w-100 w-md-auto"
                                    on:click={() => removeQuote(i)}>
                                    <TrashSimple size={16} weight="bold" />
                                </button>
                            </div>
                        </div>
                    </div>
                {/each}

                {#if multiple_quotes.length === 0}
                    <div class="rounded-lg text-center font-weight-boldest text-muted py-12 bg-light">
                        <div>Nessuna quota configurata</div>
                        <div class="mt-4">
                            <button
                                disabled={!editable}
                                type="button"
                                class="btn btn-sm btn-primary font-weight-boldest"
                                on:click={addQuote}>
                                Aggiungi Quota
                            </button>
                        </div>
                    </div>
                {/if}
            </div>

            {#if multiple_quotes.length > 0}
                <div class="d-flex justify-content-end mt-4">
                    <button
                        disabled={!editable}
                        type="button"
                        class="btn btn-primary font-weight-boldest"
                        on:click={addQuote}>
                        Aggiungi Quota
                    </button>
                </div>
            {/if}
        </div>
    {:else}
        <div class="d-flex mt-6" style="flex-wrap: wrap;gap: 1rem;">
            {#each multiple_quotes ?? [] as quote, i}
                <div
                    class="d-flex align-items-center bg-light rounded-lg p-4 flex-grow-1"
                    style="min-width: 15rem;max-width: 25rem;outline: 1px solid #e9eff6;border-top: 1px solid #fff;">
                    <div class="flex-grow-1">
                        <div class="font-weight-boldest font-size-sm text-primary text-uppercase">{quote.title}</div>
                        <div class="text-dark font-size-h1 font-weight-boldest my-1">{quote.amount}€</div>
                        <div class="font-size-xs text-muted">{quote.payment_category?.label}</div>
                    </div>
                </div>
            {/each}

            {#if multiple_quotes.length === 0}
                <div class="text-center font-weight-boldest text-muted py-6">
                    <div>Nessuna quota configurata</div>
                </div>
            {/if}
        </div>
    {/if}
</div>
