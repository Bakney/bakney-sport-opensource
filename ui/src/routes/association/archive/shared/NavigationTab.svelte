<script>
    import Tabs from 'components/Tabs.svelte';
</script>

<Tabs
    navigationPages={[
        {
            title: 'Documenti',
            url: '/archive',
            icon: 'book',
        },
        {
            title: 'Modulistica',
            url: '/templates/list',
            icon: 'book',
        },
    ]} />
