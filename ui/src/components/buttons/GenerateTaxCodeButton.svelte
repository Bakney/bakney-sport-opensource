<script>
    import {scale} from 'svelte/transition';
    import {ArrowClockwise} from 'phosphor-svelte';
    import {createEventDispatcher} from 'svelte';
    import * as easing from 'svelte/easing';
    import {apiFetch} from 'utils/ApiMiddleware';
    import {toast} from 'svelte-sonner';

    const dispatch = createEventDispatcher();

    export let disabled = false;
    export let hidden = false;
    export let popover_text = 'Genera codice fiscale';
    export let color = 'dark';
    export let data = {};

    async function calculateTaxCode() {
        let res = await apiFetch(__bakney.env.API.SUBSCRIPTION.CALCULATE_TAX_CODE, {
            method: 'POST',
            body: JSON.stringify(data),
        });

        if (!res.error) {
            toast.success('Codice fiscale generato con successo');
            dispatch('codice', res.response.tax_code);
        } else {
            if (res.status === 400) {
                toast.error(res.response.msg);
            } else {
                toast.error('Qualcosa è andato storto');
            }
        }
    }

    function open(event) {
        calculateTaxCode();
        event.preventDefault();
        dispatch('open');
    }
</script>

<button
    {disabled}
    in:scale={{duration: 150, start: 0.9, easing: easing.backOut}}
    class="btn btn-md btn-icon btn-{color} m-0 px-3 ml-2 {hidden ? 'd-none' : ''}"
    data-toggle="tooltip"
    data-placement="bottom"
    title={popover_text}
    on:touchend={open}
    on:click={open}>
    <ArrowClockwise size="28" weight="duotone" />
</button>
