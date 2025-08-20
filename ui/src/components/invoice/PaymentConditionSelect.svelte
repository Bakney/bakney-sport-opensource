<script>
    export let selectedPaymentCondition = 'TP02';

    let paymentCondition = [
        {code: 'TP01', description: 'Pagamento a rate'},
        {code: 'TP02', description: 'Pagamento completo'},
        {code: 'TP03', description: 'Anticipo'},
    ];
</script>

<div class="form-group">
    <label for="payment_condition">Tipo di Pagamento</label>
    <select
        bind:value={selectedPaymentCondition}
        name="payment_condition"
        class="form-control form-control-sm form-control-solid mb-0">
        <option value="">Seleziona il tipo di pagamento</option>
        {#each paymentCondition as condition}
            <option value={condition.code}>{condition.code} - {condition.description}</option>
        {/each}
    </select>
</div>
