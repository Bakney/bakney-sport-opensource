<script>
    import BasicModal from 'components/modals/BasicModal.svelte';
    import {Datepicker} from 'components/formBuilder/preview-blocks';
    import {apiFetch} from 'utils/ApiMiddleware';
    import {toast} from 'svelte-sonner';

    export let show;

    let formData = {
        from_date: moment().startOf('month').format('DD/MM/YYYY'),
        to_date: moment().endOf('month').format('DD/MM/YYYY'),
    };

    let valid = true;

    function checkValidity() {
        if (moment(formData.from_date, 'DD/MM/YYYY').isAfter(moment(formData.to_date, 'DD/MM/YYYY'))) {
            valid = false;
            toast.error('La data di inizio non può essere successiva alla data di fine');
        } else {
            valid = true;
        }
        valid = valid && formData.from_date && formData.to_date;
    }

    async function generateReport() {
        let res = await apiFetch(
            `${__bakney.env.API.INSTRUCTOR.REPORT}?start_date=${formData.from_date}&end_date=${formData.to_date}`
        );
        if (!res.error) {
            toast.success(res?.response?.msg ?? 'Report generato con successo');

            window.downloadFile(
                `report-istruttori-${formData.from_date}-${formData.to_date}.xlsx`,
                res.response.data.report_file,
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
        } else {
            toast.error(res?.response?.msg ?? 'Errore nella generazione del report');
        }
    }
</script>

<BasicModal
    id={`report-instructors-modal`}
    bind:show
    title="Genera Report Istruttori"
    showTitle={true}
    showFooter={false}
    modalSize={''}
    scrollable={false}
    on:confirm={() => generateReport()}
    dataHeight={300}>
    <div class="py-3 d-flex" style="gap: 20px;">
        <Datepicker
            customClasses={'p-0'}
            editable={false}
            active={false}
            on:change={e => {
                formData.from_date = e.detail;
                checkValidity();
            }}
            props={{
                id: 'from_date',
                name: 'from_date',
                label: 'Dal',
                helperLabel: 'Seleziona il giorno di inizio (incluso)',
                required: true,
                format: 'DD/MM/YYYY',
                value: formData.from_date || null,
            }} />
        <Datepicker
            customClasses={'p-0'}
            editable={false}
            active={false}
            on:change={e => {
                formData.to_date = e.detail;
                checkValidity();
            }}
            props={{
                id: 'to_date',
                name: 'to_date',
                label: 'Dal',
                helperLabel: 'Seleziona il giorno di fine (incluso)',
                required: true,
                format: 'DD/MM/YYYY',
                value: formData.to_date || null,
            }} />
    </div>
    <div class="modal-footer d-flex justify-content-center">
        <button disabled={!valid} type="button" class="btn btn-primary font-weight-boldest" on:click={generateReport}>
            Genera Report
        </button>
    </div>
</BasicModal>
