<script>
    export let selectedPaymentModality = 'MP05';

    let paymentModalities = [
        {code: 'MP01', description: 'contanti'},
        {code: 'MP02', description: 'assegno'},
        {code: 'MP03', description: 'assegno circolare'},
        {code: 'MP04', description: 'contanti presso Tesoreria'},
        {code: 'MP05', description: 'bonifico'},
        {code: 'MP06', description: 'vaglia cambiario'},
        {code: 'MP07', description: 'bollettino bancario'},
        {code: 'MP08', description: 'carta di pagamento'},
        {code: 'MP09', description: 'RID'},
        {code: 'MP10', description: 'RID utenze'},
        {code: 'MP11', description: 'RID veloce'},
        {code: 'MP12', description: 'RIBA'},
        {code: 'MP13', description: 'MAV'},
        {code: 'MP14', description: 'quietanza erario'},
        {code: 'MP15', description: 'giroconto su conti di contabilità speciale'},
        {code: 'MP16', description: 'domiciliazione bancaria'},
        {code: 'MP17', description: 'domiciliazione postale'},
        {code: 'MP18', description: 'bollettino di c/c postale'},
        {code: 'MP19', description: 'SEPA Direct Debit'},
        {code: 'MP20', description: 'SEPA Direct Debit CORE'},
        {code: 'MP21', description: 'SEPA Direct Debit B2B'},
        {code: 'MP22', description: 'Trattenuta su somme già riscosse'},
    ];
</script>

<div class="form-group">
    <label for="payment_modality">Modalità di Pagamento</label>
    <select
        bind:value={selectedPaymentModality}
        name="payment_modality"
        class="form-control form-control-sm form-control-solid mb-0">
        <option value="">Seleziona una modalità di pagamento</option>
        {#each paymentModalities as modality}
            <option value={modality.code}>{modality.code} - {modality.description}</option>
        {/each}
    </select>
</div>
