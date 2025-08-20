<script>
    import {onMount} from 'svelte';
    import {toast} from 'svelte-sonner';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware.js';

    export let params;

    let automationTree;
    let block;

    let broadcastChannelUpdate;

    async function fetchData() {
        let res = await apiFetch(replaceUID(__bakney.env.API.COMMUNICATIONS.WORKFLOWS.DETAILS, params?.workflow_id), {
            method: 'GET',
        });
        if (res.status == 200) {
            automationTree = [...res.response.automation_tree];
        }
    }

    async function save() {
        let res = await apiFetch(replaceUID(__bakney.env.API.COMMUNICATIONS.WORKFLOWS.UPDATE, params?.workflow_id), {
            method: 'PATCH',
            body: JSON.stringify({
                automation_tree: automationTree,
            }),
        });
        if (res.status == 200) {
            toast.success('Email salvata.');
        } else {
            toast.error('Si è verificato un errore durante il salvataggio.');
        }
    }

    function findBlockId(id) {
        // in automationTree find node.data.blockId == id
        return automationTree.find(node => node.data?.blockId == id);
    }

    onMount(async () => {
        broadcastChannelUpdate = new BroadcastChannel(`update_message_${params?.id}`);
        await fetchData();
        block = findBlockId(params?.id);
        console.info('block', block);
        if (block == undefined) {
            toast.error('La modifica dello step non è disponibile.');
            return;
        } else {
            // set localStorage
            localStorage.setItem(`email-builder-json-${params?.id}`, JSON.stringify(block.data.json));
            await import('./emailbuilder.js');
            window.addEventListener('save', async e => {
                block.data.content = e.detail.content;
                block.data.json = e.detail.json;
                automationTree.find(node => node.data?.blockId == params?.id).data = {...block.data};
                await save();
                broadcastChannelUpdate.postMessage('update');
            });
        }
    });
</script>

<div id="root" on:save={e => console.debug(e.detail)} />
{#if !block}
    <div class="d-flex justify-content-center align-items-center my-6 font-weight-boldest">
        La modifica di questo step non è disponibile. Apri un ticket al supporto tecnico.
    </div>
{/if}
