<script>
    import {ArrowsOutCardinal, DotsSixVertical, HandTap} from 'phosphor-svelte';
    import {MoveIcon, SortableItem} from 'svelte-sortable-items';
    import {flip} from 'svelte/animate';
    import {InputTypes} from './inputs';

    export let title = 'Anteprima modulo';
    export let showSendButton = true;

    export let elements = [];
    let numberHoveredItem;
</script>

<div class="d-flex flex-column w-full ml-0 ml-md-10 mt-8 mt-md-0" style="width:100%;">
    <h6 class=" font-weight-bolder mx-auto">{title || 'Anteprima modulo'}</h6>
    <div class="d-flex flex-column bg-light rounded-lg py-12">
        <div class="mx-auto p-0 col-11 bg-white border border-light rounded-xl">
            <!-- {#each elements as element, numberCounter (element.props.id)}
                {#if element}
                    <div class="form-element-preview">
                        <svelte:component
                            this={element.component}
                            bind:props={element.props}
                            on:delete={() => {
                                elements = [...elements.filter(x => x.props.id != element.props.id)];
                            }} />
                    </div>
                {/if}
            {/each} -->

            {#each elements as element, numberCounter (element.props.id)}
                <div animate:flip={{duration: 150}}>
                    {#if element}
                        <SortableItem
                            propItemNumber={numberCounter}
                            bind:propData={elements}
                            bind:propHoveredItemNumber={numberHoveredItem}>
                            <div class:classHovered={numberHoveredItem === numberCounter}>
                                <div class="form-element-preview d-flex">
                                    <div class="d-flex align-items-center pl-2 pl-md-6" style="cursor:move">
                                        <DotsSixVertical size="20" weight="duotone" class="text-dark" />
                                    </div>
                                    <div class="w-100">
                                        <svelte:component
                                            this={element.component
                                                ? element.component
                                                : InputTypes?.find(x => x.type === element.type)?.component}
                                            bind:props={element.props}
                                            on:delete={() => {
                                                elements = [...elements.filter(x => x.props.id != element.props.id)];
                                            }} />
                                    </div>
                                </div>
                            </div>
                        </SortableItem>
                    {/if}
                </div>
            {/each}
            {#if elements.length === 0}
                <div class="text-center p-4 mx-8 my-12">
                    <p class="text-dark-50 font-weight-bold font-size-md mb-0">
                        <HandTap size="48" class="text-primary mb-2" /><br />
                        Clicca su un componente a sinistra per aggiungerlo al form.
                    </p>
                </div>
            {:else if showSendButton}
                <div class="d-flex justify-content-end mx-8 mb-6">
                    <button type="button" class="btn btn-primary font-weight-bolder"> Invia </button>
                </div>
            {/if}
        </div>
    </div>
</div>

<svelte:head>
    <style>
        .form-element-preview:hover {
            /* background: #000; */
            outline: 0.22rem solid #000;
            border-radius: 1rem;
            transition: 0.1s;
        }
    </style>
    <script src="https://unpkg.com/svelte-drag-drop-touch"></script>
</svelte:head>
