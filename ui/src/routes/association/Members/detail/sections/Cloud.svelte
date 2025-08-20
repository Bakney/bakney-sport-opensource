<script>
    import DeleteButton from 'components/buttons/DeleteButton.svelte';
    import {File, FileArrowUp, Sparkle} from 'phosphor-svelte';
    import {sessionToken} from 'store/stores';
    import {createEventDispatcher} from 'svelte';
    import Portal from 'svelte-portal';
    import {toast} from 'svelte-sonner';
    import * as easing from 'svelte/easing';
    import {scale, fade} from 'svelte/transition';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import {canPerformAction} from 'utils/Permissions';
    import AddFileModal from './modals/AddFileModal.svelte';
    import GenerateFromTemplateModal from 'routes/association/archive/modals/GenerateFromTemplateModal.svelte';

    const dispatch = createEventDispatcher();

    sessionToken.useLocalStorage();

    export let info = {};

    async function deleteFile(id) {
        Swal.fire({
            title: 'Sei sicuro?',
            text: 'Questa azione non può essere annullata',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Si, elimina!',
            cancelButtonText: 'Annulla',
            reverseButtons: true,
        }).then(result => {
            if (result.isConfirmed) {
                apiFetch(
                    replaceUID(
                        replaceUID(__bakney.env.API.SUBSCRIPTION.DELETE_DOCUMENT, info.subscription_id),
                        id,
                        '<doc_uid>'
                    ),
                    {
                        method: 'DELETE',
                    }
                ).then(res => {
                    if (res.status == 200) {
                        toast.success('File eliminato!');
                        dispatch('reset', 'cloud');
                    } else {
                        toast.error('Qualcosa è andato storto.');
                    }
                });
            }
        });
    }
</script>

<div class="row">
    <div class="col-12 col-md-6 mt-2">
        <h3 class="card-label font-size-h2">Documenti</h3>
    </div>
    <div class="col-12 col-md-6 my-auto text-md-right py-4 py-md-0 d-flex justify-content-end" style="gap: .5rem;">
        {#if canPerformAction('association.members.update')}
            <button
                class="btn btn-light-primary font-weight-boldest d-flex align-items-center"
                on:click={() => {
                    let generateFromTemplateModal = new GenerateFromTemplateModal({
                        target: document.body,
                        props: {
                            show: true,
                            additionalData: {
                                subscription: info.subscription_id,
                            },
                        },
                    });

                    generateFromTemplateModal.$on('update', () => {
                        generateFromTemplateModal.$destroy();
                        dispatch('reset', 'cloud');
                    });
                }}>
                <Sparkle size={18} weight="bold" class="mr-2" />
                Genera da Modello
            </button>
            <button
                class="btn btn-primary font-weight-boldest d-flex align-items-center"
                on:click={() => {
                    let addFileModal = new AddFileModal({
                        target: document.querySelector('#portal-elements'),
                        props: {
                            show: true,
                            id: info.subscription_id,
                        },
                    });
                    addFileModal.$on('update', () => {
                        addFileModal.$destroy();
                        setTimeout(() => {
                            dispatch('reset', 'cloud');
                        }, 1000);
                    });
                }}><FileArrowUp size={18} weight="duotone" class="mr-2" /> Carica file</button>
        {/if}
    </div>
</div>
<div class="row">
    <div class="col-12 mt-6">
        <h6>File Caricati</h6>
        {#if info.subscription_files?.length == 0}
            Nessun file caricato.
        {/if}
        {#each info.subscription_files as file}
            <div class="d-flex justify-content-between py-1">
                <div class="font-weight-boldest d-flex align-items-center" style="cursor:pointer">
                    <a
                        href="{__bakney.env.API.DOCUMENT.RETRIEVE}/{file.document_id}?token={$sessionToken}"
                        target="_blank"
                        class="mr-2">
                        <File size="18" weight="duotone" class="mr-2" />
                        {file.filename}
                    </a>
                </div>
                <div>
                    {#if canPerformAction('association.members.update')}
                        <DeleteButton on:open={() => deleteFile(file.subscription_file_id)} />
                    {/if}
                </div>
            </div>
            <!-- {JSON.stringify(file)} -->
        {/each}
    </div>
</div>
