<script>
    import {ArrowLeft} from 'phosphor-svelte';
</script>

<button on:click={() => history.back()} class="btn btn-light-primary font-weight-bold d-flex align-items-center gap-2">
    <ArrowLeft size={16} weight="bold" />
    <span class="d-none d-md-inline-block">Indietro</span>
</button>
