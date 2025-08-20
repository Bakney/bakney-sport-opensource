<script>
    import {apiFetch} from 'utils/ApiMiddleware';
    import {fade} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import Portal from 'svelte-portal';
    import {PuzzlePiece, Smiley, SmileyBlank} from 'phosphor-svelte';

    export let id;
    export let show = false;
    export let componentsMap;
    export let dashboardLayout;

    let selectedWidget = null;

    export let callback = function () {};

    async function addWidget() {
        // check if the widget is already in the dashboardLayout, if not add it at the end
        dashboardLayout.rows[0] = [
            ...dashboardLayout?.rows[0],
            {
                id: selectedWidget,
                size: componentsMap[selectedWidget].defaultSize,
            },
        ];
        callback();
        updateshow();
    }

    function updateshow() {
        show = false;
    }
</script>

<!-- svelte-ignore missing-declaration -->
<Portal target="#portal-elements">
    <!-- Modal-->
    <div
        in:fade={{duration: 500, easing: easing.cubicInOut}}
        class="modal fade {show ? 'show' : ''}"
        {id}
        tabindex="-1"
        role="dialog"
        aria-labelledby="staticBackdrop"
        aria-hidden="true"
        style="display:block; backdrop-filter: blur(2px) brightness(0.5);-webkit-backdrop-filter: blur(2px) brightness(0.5);">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header d-flex justify-content-center">
                    <h1 class="font-weight-boldest">Aggiungi widget</h1>
                </div>
                <div class="modal-body py-2 px-4" style="text-align: center;">
                    <p class="text-align-center">
                        Aggiungi uno o più widget alla tua dashboard per tenere sotto controllo le attività della tua
                        associazione sportiva.
                    </p>
                    <div
                        class="row"
                        style="max-height: 30rem; overflow-y: scroll;"
                        data-scroll="true"
                        max-data-height="400px">
                        {#if !Object.keys(componentsMap)?.some(x => !dashboardLayout?.rows[0]?.find(w => w.id == x))}
                            <div
                                class="d-flex flex-column justify-content-center align-items-center mx-auto mb-12 mt-4 font-weight-boldest text-primary">
                                <Smiley size={70} class="my-1 text-primary" weight="duotone" />
                                Hai già aggiunto tutti i widget disponibili!
                            </div>
                        {/if}
                        {#each Object.keys(componentsMap) as widget}
                            {#if !dashboardLayout?.rows[0]?.find(w => w.id == widget)}
                                <div class="col-12 mb-4 cursor-pointer">
                                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                                    <div
                                        class="card card-custom border d-flex align-items-center rounded-xl overflow-hidden bg-white card-stretch {selectedWidget ==
                                        widget
                                            ? 'bg-light-secondary border-light-dark'
                                            : ''}"
                                        on:click|preventDefault={e => (selectedWidget = widget)}>
                                        <div class="d-flex align-items-center justify-content-start px-4 py-3">
                                            <PuzzlePiece size={40} class="my-2 mr-5 text-primary" weight="duotone" />
                                            <div class="d-flex justify-content-start align-items-start flex-column">
                                                <span
                                                    class="card-label
                                                font-weight-boldest
                                                text-dark
                                                font-size-h3">
                                                    {componentsMap[widget].title}
                                                </span>
                                                <span class="card-label font-weight-bolder text-left font-size-sm">
                                                    {componentsMap[widget].description}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            {/if}
                        {/each}
                    </div>
                </div>
                <div class="modal-footer d-flex justify-content-center pb-3">
                    <button class="btn btn-ghost" on:click={updateshow}>Annulla</button>
                    <button class="btn btn-primary font-weight-boldest" on:click={addWidget}>Aggiungi Widget</button>
                </div>
                <small class="mx-auto mb-3 font-weight-bold text-dark"
                    >Vuoi consigliarci un widget? scrivi a <a href="mailto:{__bakney.OEM_CONFIG?.supportEmail}"
                        >{__bakney.OEM_CONFIG?.supportEmail}</a
                    ></small>
            </div>
        </div>
    </div>
</Portal>
