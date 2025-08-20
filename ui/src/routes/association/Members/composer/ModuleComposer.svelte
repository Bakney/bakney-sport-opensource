<script>
    import {scale} from 'svelte/transition';
    import Composer from 'components/formBuilder/composer.svelte';
    import * as easing from 'svelte/easing';
    import {onMount} from 'svelte';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import {toast} from 'svelte-sonner';

    export let params;
    let data;

    async function fetchData() {
        let res = await apiFetch(replaceUID(__bakney.env.API.MODULES.OVERVIEW, params.id));

        if (res.status === 200) {
            data = res.response.data;
            data.start_date = moment(data.start_date).format('DD/MM/YYYY');
            data.end_date = moment(data.end_date).format('DD/MM/YYYY');
        } else {
            toast.error('Errore nel caricamento dei dati');
        }
    }

    onMount(() => {
        if (params.id) fetchData();
    });
</script>

<div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}} class="d-flex flex-column-fluid">
    <div class="px-2 col-12 col-md-12 mx-auto">
        {#if data}
            <Composer {...data} is_edit={true} />
        {:else}
            <Composer />
        {/if}
    </div>
</div>
