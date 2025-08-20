<script>
    export let items = [];
    export let auto = false;
    export let keys = [];
    export let headers = [];
    export let actions = {
        edit: false,
        approve: false,
        reject: false,
        delete: false,
    };
</script>

<!-- <div class="d-flex justify-content-center">
    <div class="d-flex flex-column">
        <div class="d-flex py-3 px-6 border-bottom">
            {#each auto ? Object.keys(item) : headers as key}
                <div class="px-4">
                    {key}
                </div>
            {/each}
        </div>
        {#each items as item}
            <div class="d-flex py-3 px-6 border-bottom">
                {#each auto ? Object.keys(item) : keys as key}
                    <div class="px-4">
                        {#if (String(item[key]).includes('/') || String(item[key]).includes('-')) && moment(item[key]).isValid()}
                            {moment(item[key]).format('DD/MM/YYYY HH:mm')}
                        {:else}
                            {item[key] || '-'}
                        {/if}
                    </div>
                {/each}
            </div>
        {/each}
    </div>
</div> -->

<div class="d-flex justify-content-center">
    <table class="table">
        <thead class="datatable-head">
            <tr class="datatable-row">
                {#each auto ? Object.keys(item) : headers as key}
                    <th scope="col" class="datatable-cell">
                        {key}
                    </th>
                {/each}
            </tr>
        </thead>
        <tbody class="datatable-body">
            {#each items as item}
                <tr class="datatable-row">
                    {#each auto ? Object.keys(item) : keys as key}
                        <td class="datatable-cell">
                            {#if (String(item[key]).includes('/') || String(item[key]).includes('-')) && moment(item[key]).isValid()}
                                {moment(item[key]).format('DD/MM/YYYY HH:mm')}
                            {:else}
                                {item[key] || '-'}
                            {/if}
                        </td>
                    {/each}
                </tr>
            {/each}
        </tbody>
    </table>
</div>
