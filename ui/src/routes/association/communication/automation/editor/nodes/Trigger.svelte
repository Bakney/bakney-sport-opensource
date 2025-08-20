<script>
    import {Node, Anchor} from 'svelvet';
    // export Node props
</script>

<Node {...$$restProps} class="trigger-node" style="background:#000">
    <!-- <div> -->
    <!-- print label -->
    <h1>{$$restProps.label}</h1>
    <!-- <div class="input-anchors">
            <Anchor bgColor="red" id="data-connection" input />
            <Anchor multiple input nodeConnect />
        </div> -->
    <!-- <div class="output-anchors">
            <Anchor direction="south" bind:connections={$$restProps.connections} output />
        </div> -->
    <!-- </div> -->
    <!-- <div class="output-anchors"> -->
    <Anchor direction="south" bind:connections={$$restProps.connections} output />
    <!-- </div> -->
</Node>

<svelte:head>
    <style>
        .trigger-node {
            background-color: #fff;
            color: #000;
            padding: 2rem;
            /* padding: 1rem; */
            border-radius: 0.5rem;
            box-shadow: 0 0.5rem 0.5rem 0.2rem #cccccc7a;
        }
    </style>
</svelte:head>
