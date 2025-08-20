<script>
    import {InputTypes} from './inputs.js';
    export let elements = [];
    export let availableElements = InputTypes.map(x => x.type);
    export let title = 'Componenti';
    export let resetLabel = 'Reset modulo';

    function pushElement(element) {
        elements = [...elements, element];
    }
</script>

<div class="d-flex flex-column mx-auto" style="width:250px;">
    <h6 class="font-weight-boldest">{title || 'Componenti'}</h6>
    {#each InputTypes as inputType}
        {#if availableElements.includes(inputType.type)}
            <button
                on:click={() => {
                    let tmpinputType = {
                        type: inputType.type,
                        icon: inputType.type,
                        props: {...inputType.props},
                        component: inputType.component,
                    };
                    tmpinputType.props.id = Math.random().toString(36).substring(2);
                    tmpinputType.props.name = tmpinputType.type + '_' + tmpinputType.props.id;
                    pushElement(tmpinputType);
                }}
                type="button"
                class="w-full btn btn-outline-secondary btn-sm py-1 d-flex justify-content-left align-items-center font-size-lg font-weight-bolder">
                <svelte:component this={inputType.icon} size={24} />
                <span class="ml-2">
                    {inputType.props.label}
                </span>
            </button>
        {/if}
    {/each}
    <button
        class="btn btn-sm btn-dark font-weight-bolder"
        on:click={() => {
            elements = [];
        }}>
        {resetLabel || 'Reset modulo'}
    </button>
</div>
