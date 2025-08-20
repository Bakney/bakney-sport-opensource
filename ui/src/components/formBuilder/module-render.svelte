<script>
    import {onMount} from 'svelte';
    import {InputTypes} from './inputs.js';
    export let elements = [];
    export let styled = true;
    export let sendButton = true;
    export let branded = true;

    function findElement(element) {
        let inputType = InputTypes.find(inputType => inputType.type === element.type);
        if (inputType) {
            return inputType;
        }
        return null;
    }

    onMount(() => {
        elements = elements.map(element => {
            let inputType = findElement(element);
            if (inputType) {
                element.component = inputType.component;
                element.icon = inputType.icon;
            }
            return element;
        });
    });
</script>

<div class={styled ? 'd-flex justify-content-center p-2 p-x-24 pt-12' : ''}>
    <div
        class={styled ? 'm-auto border border-md-2 rounded-lg bg-white' : 'w-100'}
        style={styled ? 'width:800px;' : ''}>
        {#each elements as element}
            <div class="form-element-preview">
                <svelte:component
                    this={element.component}
                    bind:props={element.props}
                    editable={false}
                    on:delete={() => {
                        elements = [...elements.filter(x => x.props.id != element.props.id)];
                    }} />
            </div>
        {/each}
        {#if sendButton}
            <div class="d-flex justify-content-end px-8 py-4">
                <button type="submit" class="btn btn-primary font-weight-bolder">Invia</button>
            </div>
        {/if}
    </div>
</div>
{#if branded}
    <div class="pb-4 pt-1 text-center">
        <a href={__bakney.env.DOMAIN}>
            <b class="font-weight-boldest mr-2 font-size-lg">modulo creato con</b>
            <img id="logo" class="h-20px" src={__bakney.OEM_CONFIG?.logo} alt="logo" />
        </a>
    </div>
{/if}
