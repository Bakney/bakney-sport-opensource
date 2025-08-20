<script>
    import {PlusCircle, Tag, TrashSimple} from 'phosphor-svelte';
    import {onMount} from 'svelte';
    import {toast} from 'svelte-sonner';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import {canPerformAction} from 'utils/Permissions';

    export let searchTagName = '';
    export let tags = [];
    export let datatableId;
    export let datatable;
    export let row_id_name = 'subscription_id';
    export let replace_row_id = '<sub_uid>';
    export let endpoint_to_assign_tag = __bakney.env.API.SUBSCRIPTION.TAGS.ASSIGN;
    export let endpoint_to_unassign_tag = __bakney.env.API.SUBSCRIPTION.TAGS.UNASSIGN;
    export let endpoint_to_delete_tag = __bakney.env.API.SUBSCRIPTION.TAGS.DELETE;
    export let endpoint_to_create_tag = __bakney.env.API.SUBSCRIPTION.TAGS.ADD;
    export let endpoint_to_fetch_tags = __bakney.env.API.SUBSCRIPTION.TAGS.LIST;
    export let permission_to_perform = "'association.members.update'";
    export let visibleMultiaction = false;

    async function fetchTags() {
        apiFetch(endpoint_to_fetch_tags, {
            method: 'GET',
        }).then(res => {
            if (res.status == 200) {
                tags = [...res.response?.tags];
            }
        });
    }

    onMount(() => {
        fetchTags();
    });

    async function createTag() {
        apiFetch(endpoint_to_create_tag, {
            method: 'POST',
            body: JSON.stringify({
                tag_name: searchTagName,
            }),
        }).then(res => {
            if (res.status == 200) {
                fetchTags();
                toast.success('Tag creato con successo');
            } else {
                toast.error(res.response.msg);
            }
            searchTagName = '';
        });
    }

    async function deleteTag(tag_id) {
        // ask for confirmation before deleting with sweetalert
        swal.fire({
            text: 'Vuoi eliminare il tag?',
            icon: 'question',
            buttonsStyling: true,
            showCancelButton: true,
            cancelButtonText: 'Annulla',
            confirmButtonText: 'Elimina',
            reverseButtons: true,
        }).then(function (result) {
            if (result.isConfirmed) {
                apiFetch(replaceUID(endpoint_to_delete_tag, tag_id), {
                    method: 'DELETE',
                }).then(res => {
                    visibleMultiaction = false;
                    if (res.status == 200) {
                        fetchTags();
                        toast.success('Tag eliminato con successo');
                        jQuery(`#${datatableId}`).KTDatatable('reload');
                    } else {
                        toast.error(res.response.msg);
                    }
                });
            }
        });
    }

    async function assignTag() {
        // get the selected tag
        let selectedTags = tags.filter(tag => tag.checked);
        let unassignedTags = tags.filter(tag => !tag.checked);

        // get selected subscriptions rows
        let records = jQuery(`#${datatableId}`).KTDatatable('getSelectedRecords').dataSet;
        let checkedNodes = datatable?.getSelectedRecords();
        let count = checkedNodes.length;
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Assegnazione tag in corso...',
        });
        let results = [];
        if (count > 0) {
            for (let i = 0; i < count; i++) {
                let id = checkedNodes[i].dataset.row;
                for (let j = 0; j < selectedTags.length; j++) {
                    results.push(
                        new Promise(async (resolve, reject) => {
                            let r = await apiFetch(
                                replaceUID(
                                    replaceUID(endpoint_to_assign_tag, records[id][row_id_name], replace_row_id),
                                    selectedTags[j].tag_id
                                ),
                                {
                                    method: 'PATCH',
                                }
                            );
                            resolve(r.status == 200);
                        })
                    );
                }
                for (let j = 0; j < unassignedTags.length; j++) {
                    results.push(
                        new Promise(async (resolve, reject) => {
                            let r = await apiFetch(
                                replaceUID(
                                    replaceUID(endpoint_to_unassign_tag, records[id][row_id_name], replace_row_id),
                                    unassignedTags[j].tag_id
                                ),
                                {
                                    method: 'PATCH',
                                }
                            );
                            resolve(r.status == 200);
                        })
                    );
                }
            }
        }

        Promise.all(results).then(values => {
            KTApp.unblockPage();
            visibleMultiaction = false;

            if (values.length > 0) {
                if (values.every(r => r)) {
                    toast.success('Tag assegnati con successo');
                } else {
                    toast.warning(`${values.length} Tag assegnati a ${selectedCounter} righe.`);
                }
            } else {
                toast.warning(`Nessun tag assegnato.`);
            }
            jQuery(`#${datatableId}`).KTDatatable('reload');
        });
    }
</script>

<button
    disabled={!canPerformAction(permission_to_perform)}
    class="btn btn-sm btn-light-primary font-weight-bolder m-0 ml-2 p-2 d-flex align-items-centerdropdown-toggle"
    type="button"
    on:click={() => {
        searchTagName = '';
        tags = tags.map(x => {
            x.checked = false;
            return x;
        });
    }}
    data-toggle="dropdown"
    aria-haspopup="true"
    aria-expanded="false"
    id="{datatableId}_assign_tag_to_selected">
    <Tag size="17" weight="duotone" class="mr-1" />
    <span class="d-none d-md-block">Assegna Tag</span>
</button>
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
    on:click={e => e.stopPropagation()}
    class="dropdown-menu dropdown-menu-lg p-1 m-0"
    style="box-shadow: #00000012 0px 1rem 1rem 0;width:20rem;">
    <div class="form-group mb-0">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <div class="input-group">
            <input
                bind:value={searchTagName}
                type="text"
                on:focus={e => {
                    // remove outline css on focus
                    e.target.style.outline = 'none';
                    // set border radius to .35rem
                    e.target.style.borderRadius = '.35rem';
                }}
                class="form-control form-control-sm form-control-solid"
                placeholder="Nome tag..." />
            <div class="input-group-append">
                <button
                    on:click={() => {
                        createTag();
                    }}
                    disabled={Array.from(tags).filter(
                        x => x.tag_name.toUpperCase().includes(searchTagName.toUpperCase()) || searchTagName == ''
                    ).length != 0}
                    class="btn btn-sm btn-primary font-weight-bold"
                    type="button"><PlusCircle weight="duotone" /></button>
            </div>
        </div>
    </div>
    <div class="" style="max-height: 12rem; overflow-y: auto;">
        <!-- Empty state -->
        {#if Array.from(tags).filter(x => x.tag_name
                    .toUpperCase()
                    .includes(searchTagName.toUpperCase()) || searchTagName == '').length == 0}
            <span class="dropdown-item rounded p-2 d-flex justify-content-between">
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <label class="checkbox w-100">
                    <content class="ml-4" for="tag-empty">Nessun tag trovato</content>
                </label>
            </span>
        {/if}
        {#each Array.from(tags).filter(x => x.tag_name
                    .toUpperCase()
                    .includes(searchTagName.toUpperCase()) || searchTagName == '') as tag}
            <span class="dropdown-item rounded p-2 d-flex justify-content-between">
                <label class="checkbox w-100">
                    <input type="checkbox" bind:checked={tag.checked} id="tag-{tag.tag_id}" />
                    <span />
                    <content class="ml-4" for="tag-{tag.tag_id}">{tag.tag_name}</content>
                </label>
                <span
                    on:click={() => {
                        deleteTag(tag.tag_id);
                    }}>
                    <TrashSimple size="17" weight="duotone" class="ml-2 text-danger" />
                </span>
            </span>
        {/each}
    </div>
    <div>
        <button
            class="btn btn-sm btn-primary w-100 font-weight-bolder m-0 mt-2 d-flex align-items-center justify-content-center"
            type="button"
            on:click={() => {
                assignTag();
            }}
            data-toggle="tooltip"
            data-placement="bottom"
            title="Assegna i tag selezionati ai soci selezionati">
            APPLICA</button>
    </div>
</div>
