<script>
    import BasicDropdown from 'components/dropdowns/basic-dropdown.svelte';
    import {FileXls, CloudArrowDown, FileCsv} from 'phosphor-svelte';
    import {apiFetch} from 'utils/ApiMiddleware';

    function exportDataFile(filetype, simplified = false) {
        // show loading
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Esportazione in corso...',
        });
        // assign content type for automatic download
        const contentType = filetype == 'csv' ? 'text/csv' : 'application/vnd.ms-excel';

        // fetching the API by providing the required format
        apiFetch(`${__bakney.env.API.SUBSCRIPTION.EXPORT}?filetype=${filetype}&simplified=${simplified}`)
            .then(res => {
                window.downloadFile(res.response.data.filename, res.response.data.file, contentType);
            })
            .finally(() => {
                // hide loading
                KTApp.unblockPage();
            });
    }
</script>

<BasicDropdown
    dropdownClass={'d-none d-md-block mr-2'}
    on:itemClick={e => {
        const id = e.detail.id;
        if (id === 'export-excel') {
            exportDataFile('xls');
        } else if (id === 'export-csv') {
            exportDataFile('csv');
        } else if (id === 'simplified-export-excel') {
            exportDataFile('xls-simplified');
        } else if (id === 'simplified-export-csv') {
            exportDataFile('csv-simplified');
        }
    }}
    items={[
        {
            id: 'export-excel',
            label: 'Excel',
            icon: FileXls,
        },
        {
            id: 'export-csv',
            label: 'Csv',
            icon: FileCsv,
        },
        {
            id: 'simplified-export-excel',
            label: 'Excel (semplice)',
            icon: FileXls,
        },
        {
            id: 'simplified-export-csv',
            label: 'Csv (semplice)',
            icon: FileCsv,
        },
    ]}
    variant="light-primary">
    <span slot="button-content">
        <CloudArrowDown size="19" weight="duotone" class="mr-2" />
        Esporta tutto
    </span>
</BasicDropdown>
