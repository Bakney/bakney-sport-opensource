<script>
    import {onMount} from 'svelte';

    export let tags = [];
    export let activeTags = [];

    $: tags, (activeTags = [...tags.filter(t => t.active).map(t => t.tag_name)]);

    // when user clic on a tag is active
    const activateTag = tag_name => {
        tags = [
            ...tags?.map(t => {
                if (t.tag_name === tag_name) {
                    t.active = !t.active;
                }
                return t;
            }),
        ];
    };

    onMount(() => {
        // set all tags to active
        tags = [
            ...tags?.map(tag => {
                return {
                    ...tag,
                    active: true,
                };
            }),
        ];
    });
</script>

<div class="d-flex align-items-center justify-content-start w-100 mb-12 px-4">
    <span class="font-weight-boldest font-size-lg my-auto mr-2"> Filtra corso per tag </span>
    <div class="d-flex align-items-center">
        {#each tags as tag}
            <span
                class="m-0 font-weight-bolder btn btn-sm py-1 px-3 {tag.active ? 'btn-dark' : 'btn-light'} mx-1"
                on:click={() => activateTag(tag.tag_name)}>
                {tag.tag_name}
            </span>
        {/each}
    </div>
</div>
