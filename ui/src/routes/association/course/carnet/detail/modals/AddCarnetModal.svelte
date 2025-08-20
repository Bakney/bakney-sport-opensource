<script>
    import BasicModal from 'components/modals/BasicModal.svelte';
    import {SmartSelect} from 'components/formBuilder/preview-blocks/index.js';
    import {getDataFromForm} from 'utils/Functions.js';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware.js';
    import {toast} from 'svelte-sonner';
    import {onMount} from 'svelte';
    import {createEventDispatcher} from 'svelte';

    const dispatch = createEventDispatcher();

    export let show;
    export let id;
    export let value;
    export let selectableCarnet = false;
    let carnets = [];

    let subscriptions = [];

    async function update(formData) {
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Operazione in corso...',
        });

        let subscriptionId = JSON.parse(formData.subscription_id)?.value;

        const url = replaceUID(replaceUID(__bakney.env.API.CARNET.ASSIGN, id), subscriptionId, '<sub_uid>');

        const res = await apiFetch(url, {
            method: 'POST',
        });

        KTApp.unblockPage();

        if (res.status == 200) {
            toast.success('Completato con successo.');
            dispatch('update');
            show = false;
        } else {
            toast.error("Si è verificato un errore durante l'operazione.");
        }
    }

    function handleValidation(e) {
        update(getDataFromForm(e));
    }

    function fetchSubscriptions() {
        return apiFetch(`${__bakney.env.API.SUBSCRIPTION.LIST}?m=1&filter=all`).then(res => {
            subscriptions = [];
            Object.keys(res.response.data).forEach(key => {
                subscriptions.push({
                    value: res.response.data[key].subscription_id,
                    label:
                        res.response.data[key].associate.first_name + ' ' + res.response.data[key].associate.last_name,
                });
            });
        });
    }

    function fetchCarnets() {
        return apiFetch(`${__bakney.env.API.CARNET.LIST}?m=1&filter=all`).then(res => {
            carnets = [];
            Object.keys(res.response.data).forEach(key => {
                carnets.push({
                    value: res.response.data[key].carnet_id,
                    label: res.response.data[key].title,
                });
            });
        });
    }

    onMount(async () => {
        await fetchSubscriptions();
        if (selectableCarnet) {
            await fetchCarnets();
        }
    });
</script>

<div>
    <BasicModal
        id={`carnet-modal`}
        bind:show
        title="Assegna un carnet"
        showTitle={true}
        showActionButton={true}
        showCancelButton={true}
        showFooter={false}
        modalSize={'md'}
        scrollable={false}
        hideOnClickOutside={true}
        bodyClass={'py-2 px-0'}>
        <form id="form_add_carnet" on:submit|preventDefault={handleValidation}>
            {#if selectableCarnet}
                <div class="px-7">
                    <SmartSelect
                        customClasses="mb-4 p-0"
                        editable={false}
                        active={false}
                        on:change={e => (id = e.detail.value)}
                        props={{
                            id: 'carnet_id',
                            name: 'carnet_id',
                            label: 'Seleziona il carnet',
                            placeholder: 'Seleziona il carnet',
                            required: true,
                            searchable: true,
                            showChevron: true,
                            options: carnets?.map(carnet => ({
                                label: `${carnet.label}`,
                                value: carnet.value,
                            })),
                        }} />
                </div>
            {/if}
            <div class="px-7">
                <SmartSelect
                    customClasses="mb-4 p-0"
                    editable={false}
                    active={false}
                    bind:value
                    props={{
                        id: 'subscription_id',
                        name: 'subscription_id',
                        label: 'Associa carnet a',
                        placeholder: "Seleziona l'associato",
                        required: true,
                        clearable: true,
                        searchable: true,
                        disabled: value !== null && value !== undefined && value !== '',
                        showChevron: true,
                        options: subscriptions?.map(sub => ({
                            label: `${sub.label}`,
                            value: sub.value,
                        })),
                        value: value || null,
                    }} />
            </div>

            <div class="modal-footer d-flex justify-content-end mt-2">
                <button type="button" class="btn btn-light-primary font-weight-bold" on:click={() => (show = false)}>
                    Chiudi
                </button>
                <button
                    type="submit"
                    disabled={!value || (selectableCarnet && !id)}
                    class="btn btn-primary font-weight-bold">
                    Assegna
                </button>
            </div>
        </form>
    </BasicModal>
</div>
