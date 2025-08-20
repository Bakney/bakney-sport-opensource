<script>
    import NumericInput from './NumericInput.svelte';
    import {slide} from 'svelte/transition';
    import {Circle} from 'svelte-loading-spinners';
    import {SimpleButton} from 'components/buttons';
    import {ArrowClockwise, FloppyDisk, PencilSimple, TrashSimple} from 'phosphor-svelte';

    export let section;
    export let titleLabel = '';
    export let totalLabel = '';
    export let ref = '';
    export let formatDecimal = x => {
        return x;
    };
    export let addRow = section => {};
    export let deleteRow = id => {
        section = section.filter(x => x.id != id);
        document.querySelectorAll('.popover').forEach(popover => popover.remove());
        document.querySelectorAll('.tooltip').forEach(popover => popover.remove());
    };
    export let editRow = id => {
        for (let row of section) {
            if (row.id === id) {
                row.editable = true;
                break;
            }
        }
        section = [...section];
        document.querySelectorAll('.popover').forEach(popover => popover.remove());
        document.querySelectorAll('.tooltip').forEach(popover => popover.remove());
    };
    export let refreshData = () => {};
    export let draft = true;

    let isUpdating = false;
</script>

<tr>
    <td style="font-weight: bold;">{titleLabel}</td>
    <td />
    <td />
    <td>
        {#if draft}
            <div class="d-flex justify-content-end">
                <div class="update-btn-section">
                    <!-- svelte-ignore a11y-missing-attribute -->
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <a
                        class="btn btn-sm btn-clean btn-icon"
                        on:click={async () => {
                            isUpdating = true;
                            await refreshData(ref);
                            setTimeout(() => {
                                isUpdating = false;
                            }, 500);
                        }}
                        data-toggle="tooltip"
                        data-placement="bottom"
                        data-original-title="Aggiorna">
                        {#if isUpdating}
                            <Circle size="16" color="#351DC2" unit="px" duration="0.5s" />
                        {:else}
                            <ArrowClockwise size="18" weight="bold" class="text-primary" />
                        {/if}
                    </a>
                </div>
            </div>
        {/if}
    </td>
</tr>
{#each Array.from(section || []) as row}
    <tr>
        <td>
            {#if row.editable && draft}
                <div class="d-flex align-items-center ml-2" in:slide={{duration: 150}}>
                    <div class="d-flex align-items-center">
                        <SimpleButton
                            on:click={() => {
                                row.editable = false;
                                row.description = row.description;
                            }}
                            variant={'light'}
                            size={'sm'}
                            classList={'btn-icon p-0 my-auto mr-2 border-light-dark'}
                            label={''}>
                            <FloppyDisk size="18" weight="bold" class="text-primary" />
                        </SimpleButton>
                        <SimpleButton
                            on:click={async () => {
                                const result = await Swal.fire({
                                    target: document.getElementById('portal-elements-foreground'),
                                    title: 'Sei sicuro?',
                                    text: 'Questa azione non può essere annullata.',
                                    icon: 'warning',
                                    showCancelButton: true,
                                    confirmButtonText: 'Sì, elimina',
                                    cancelButtonText: 'Annulla',
                                    reverseButtons: true,
                                });
                                if (result.isConfirmed) {
                                    deleteRow(row.id);
                                }
                            }}
                            variant={'light'}
                            size={'sm'}
                            classList={'btn-icon p-0 my-auto mr-4 border-light-dark'}
                            label={''}>
                            <TrashSimple size="18" weight="bold" class="text-danger" />
                        </SimpleButton>
                    </div>
                    <div class="input-group input-group-solid input-group-sm">
                        <input
                            type="text"
                            class="form-control"
                            placeholder="Descrizione"
                            bind:value={row.description} />
                    </div>
                </div>
            {:else}
                <div in:slide={{duration: 150}} class="d-flex align-items-center ml-2 font-weight-bold font-size-lg">
                    {#if draft}
                        <SimpleButton
                            on:click={() => editRow(row.id)}
                            variant={'light'}
                            size={'sm'}
                            classList={'btn-icon p-0 my-auto mr-4 border-light-dark'}
                            label={''}>
                            <PencilSimple size="18" weight="bold" class="text-dark" />
                        </SimpleButton>
                    {/if}
                    {row.description}
                </div>
            {/if}
        </td>
        <td style="border-left: 1px solid #e4e9f0;">
            {#if row.editable && !row.default}
                <NumericInput
                    bind:value={row.institutional}
                    id={row.id + '_institutional'}
                    on:update={e => {
                        row.institutional = parseFloat(e.detail);
                    }}
                    editable={row.editable} />
            {:else}
                {formatDecimal(row.institutional)} €
            {/if}
        </td>
        <td style="border-left: 1px solid #e4e9f0;">
            {#if row.editable && !row.default}
                <NumericInput
                    bind:value={row.commercial}
                    id={row.id + '_commercial'}
                    on:update={e => {
                        row.commercial = parseFloat(e.detail);
                    }}
                    editable={row.editable} />
            {:else}
                {formatDecimal(row.commercial)} €
            {/if}
        </td>
        <td style="border-left: 1px solid #e4e9f0;">
            {formatDecimal((row.institutional || 0) + (row.commercial || 0))} €
        </td>
    </tr>
{/each}
{#if draft}
    <div class="d-flex justify-content-end pt-4 pr-4">
        <button class="btn btn-secondary btn-sm font-weight-bolder add-btn-section" on:click={() => addRow(ref)}>
            Aggiungi riga
        </button>
    </div>
{/if}
<tr class="subtotal">
    <td style="font-weight: bold;">{totalLabel}</td>
    <td>{formatDecimal(section?.reduce((prev, curr) => prev + parseFloat(curr.institutional || 0), 0))} €</td>
    <td>{formatDecimal(section?.reduce((prev, curr) => prev + parseFloat(curr.commercial || 0), 0))} €</td>
    <td
        >{formatDecimal(
            section?.reduce(
                (prev, curr) => prev + parseFloat(curr.institutional || 0) + parseFloat(curr.commercial || 0),
                0
            )
        )} €</td>
</tr>

<svelte:head>
    <style>
        @media print {
            .add-btn-section,
            .delete-btn-section,
            .update-btn-section {
                display: none;
            }
        }
    </style>
</svelte:head>
