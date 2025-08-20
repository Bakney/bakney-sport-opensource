<script>
    import BasicModal from 'components/modals/BasicModal.svelte';
    import {File} from 'phosphor-svelte';
    import {onMount} from 'svelte';

    export let id;
    export let show;
    export let data;
    export let elements;
    let hideBack = false;
    let loading = false;

    function getElementDataFromPropName(x) {
        return elements?.find(e => e.props?.name === x).props || null;
    }

    onMount(() => {
        // Sort the response keys based on the order of elements
        if (data && data.response && elements) {
            // Create a map of element names to their positions in the elements array
            const elementPositions = {};
            elements.forEach((element, index) => {
                if (element.props?.name) {
                    elementPositions[element.props.name] = index;
                }
            });

            // Sort the response keys based on the element positions
            const sortedKeys = Object.keys(data.response).sort((a, b) => {
                const posA = elementPositions[a] !== undefined ? elementPositions[a] : Infinity;
                const posB = elementPositions[b] !== undefined ? elementPositions[b] : Infinity;
                return posA - posB;
            });

            // Create a new sorted response object
            const sortedResponse = {};
            sortedKeys.forEach(key => {
                sortedResponse[key] = data.response[key];
            });

            // Replace the original response with the sorted one
            data.response = sortedResponse;
        }
    });
</script>

<div class={hideBack ? 'd-none' : ''}>
    <BasicModal
        id={`response-${id}`}
        bind:show
        title="Risposta modulo"
        showActionButton={false}
        modalSize={'md'}
        scrollable={true}
        dataHeight={300}>
        {#if !loading}
            <div class="py-3">
                {#each Object.keys(data.response) as key}
                    <!-- {key} -->
                    <div class="py-2">
                        <h4 class="font-weight-bolder">{getElementDataFromPropName(key)?.label}</h4>
                        <div class="font-size-sm border rounded-lg p-2">
                            {#if key.includes('signature')}
                                <div class="signature-preview h-20">
                                    <img height="100" src={data.response[key] || ''} alt="Firma" />
                                </div>
                            {:else}
                                {@html data.response[key]
                                    .replaceAll('\n', '<br>')
                                    .replaceAll('\t', '&nbsp;&nbsp;&nbsp;&nbsp;')}
                            {/if}
                        </div>
                    </div>
                {/each}

                {#if data.attachments_docs.length > 0}
                    <div class="py-3">
                        <h4 class="font-weight-bolder">Allegati</h4>
                        <div class="font-size-sm rounded-lg">
                            {#each data.attachments_docs as attachment}
                                <a
                                    href={__bakney.env.HOST +
                                        '/document/retrieve/' +
                                        attachment.document_id +
                                        '?download=true&token=' +
                                        attachment.token}
                                    target="_blank"
                                    class="d-block text-primary font-weight-bolder pt-2 font-size-lg d-flex align-items-center cursor-pointer"
                                    download={attachment.filename}>
                                    <File size="20" weight="duotone" class="mr-1" />
                                    {attachment.filename}
                                </a>
                            {/each}
                        </div>
                    </div>
                {/if}
            </div>
            <!-- <pre>
                {JSON.stringify(data?.response, null, 2)}
                {JSON.stringify(elements, null, 2)}
            </pre> -->
        {:else}
            <div class="text-center py-20 d-flex justify-content-center">
                <div class="spinner spinner-primary spinner-lg" />
            </div>
        {/if}
    </BasicModal>
</div>
