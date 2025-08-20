<script>
    import {Info} from 'phosphor-svelte';
    export let title = '';
    export let customCols = null;
</script>

<tr>
    <th style="width: 55%;min-width: 33rem;text-align: left">
        {title}
    </th>
    <th class="theader-balance-sheet" style="width: 15%;min-width: 11rem;">
        {#if customCols}
            <span
                class="text-{parseFloat(customCols.institutionalTotal || 0) >= 0 ? 'success' : 'danger'}"
                style="font-weight: bold;">{customCols.institutionalTotal || 'n.d.'} €</span>
        {:else}
            <div style="gap: 0.2rem;">
                Istituzionale
                <!-- svelte-ignore a11y-missing-attribute -->
                <a
                    class="btn btn-xs btn-clean btn-icon p-0"
                    data-toggle="tooltip"
                    data-placement="left"
                    data-html="true"
                    data-original-title="Questi sono i proventi derivanti da attività <span class='label label-inline font-weight-bold label-light-primary'>non a scopo di lucro</span>.">
                    <Info size={16} weight="duotone" class="text-primary" />
                </a>
            </div>
        {/if}
    </th>
    <th class="theader-balance-sheet" style="width: 15%;min-width: 11rem;">
        {#if customCols}
            <span
                class="text-{parseFloat(customCols.commercialTotal || 0) >= 0 ? 'success' : 'danger'}"
                style="font-weight: bold;">{customCols.commercialTotal || 'n.d.'} €</span>
        {:else}
            <div style="gap: 0.2rem;">
                Commerciale
                <!-- svelte-ignore a11y-missing-attribute -->
                <a
                    class="btn btn-xs btn-clean btn-icon p-0"
                    data-toggle="tooltip"
                    data-placement="left"
                    data-html="true"
                    data-original-title="Questi sono i proventi derivanti da attività <span class='label label-inline font-weight-bold label-light-primary'>a scopo di lucro</span>.">
                    <Info size={16} weight="duotone" class="text-primary" />
                </a>
            </div>
        {/if}
    </th>
    <th class="theader-balance-sheet" style="width: 15%;min-width: 11rem;">
        {#if customCols}
            <span
                class="text-{parseFloat(customCols.total || 0) >= 0 ? 'success' : 'danger'}"
                style="font-weight: bold;">{customCols.total || 'n.d.'} €</span>
        {:else}
            <div style="gap: 0.2rem;">
                Importo
                <!-- svelte-ignore a11y-missing-attribute -->
                <a
                    class="btn btn-xs btn-clean btn-icon p-0"
                    data-toggle="tooltip"
                    data-placement="left"
                    data-html="true"
                    data-original-title="Questa è la somma di attività istituzionali e commerciali.">
                    <Info size={16} weight="duotone" class="text-primary" />
                </a>
            </div>
        {/if}
    </th>
</tr>

<style>
    .theader-balance-sheet div {
        display: flex;
        justify-content: flex-end;
        width: 100%;
        align-items: center;
        border: 0;
    }
</style>
