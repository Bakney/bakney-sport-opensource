<script>
    import Tabs from 'components/Tabs.svelte';
</script>

<Tabs
    navigationPages={[
        {
            title: 'Corsi',
            url: '/course/list',
            icon: 'book',
        },
        {
            title: 'Strutture',
            url: '/course/locations',
            icon: 'book',
        },
        {
            title: 'Archivio',
            url: '/course/archive',
            icon: 'archive',
        },
    ]} />
