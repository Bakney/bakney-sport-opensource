<script>
    import Tabs from 'components/Tabs.svelte';
    import {canPerformAction} from 'utils/Permissions';
</script>

<Tabs
    navigationPages={[
        {
            title: 'Tesserati',
            url: '/members/list',
            icon: 'book',
        },
        {
            title: 'Libro Soci',
            url: '/members/members-book',
            icon: 'book',
        },
        ...(canPerformAction('association.members.create')
            ? [
                  {
                      title: 'Bozze',
                      url: '/members/list-draft',
                      icon: 'book',
                  },
              ]
            : []),
        ...(canPerformAction('association.members.archive.read')
            ? [
                  {
                      title: 'Archivio',
                      url: '/members/archive',
                      icon: 'archive',
                  },
              ]
            : []),
    ]} />
