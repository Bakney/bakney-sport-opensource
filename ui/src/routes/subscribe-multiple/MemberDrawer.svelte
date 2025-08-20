<script>
    import BasicDrawer from 'components/drawer/basic-drawer.svelte';
    import {createEventDispatcher} from 'svelte';
    import FamilyMemberDetails from './wizard/family/FamilyMemberDetails.svelte';

    const dispatch = createEventDispatcher();

    export let athlete;
    export let title = '';
    export let wizardData;
</script>

<BasicDrawer isOpen={true} {title} on:close={() => dispatch('close', athlete)} width="70vw">
    <svelte:fragment slot="content">
        <FamilyMemberDetails bind:athlete bind:wizardData on:close={() => dispatch('close', athlete)} />
    </svelte:fragment>
</BasicDrawer>
