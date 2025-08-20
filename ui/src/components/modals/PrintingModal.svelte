<script>
    import BasicModal from './BasicModal.svelte';
    import {userData} from 'store/stores.js';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import {EyeSlash, FileArrowDown, FilePdf, MicrosoftExcelLogo} from 'phosphor-svelte';
    import {onDestroy, onMount} from 'svelte';
    import {toast} from 'svelte-sonner';
    import QueryFilter from 'components/filters/QueryFilter.svelte';

    export let id = 'printing-modal';
    export let title = 'Esporta Stampa';
    export let cancelButton = 'Chiudi';
    export let actionButton = 'Scarica file';
    export let dataHeight = 'auto';
    export let fullHeight = false;
    export let type;
    export let currentStatus = 'queryFilter';
    let show = true;
    let showFooter = true;
    let modalSize = 'lg';
    let scrollable = false;
    let showCancelButton = true;
    let showActionButton = false;
    let alignFooterCenter = true;
    let copied = false;
    let filters = [
        {
            name: 'Filtra anno',
            value: '',
            active: false,
            type: 'radio',
            key: 'year',
            data: {
                options: [
                    {label: 'Tutti gli anni', value: 'tutti'},
                    {label: 'Anno corrente', value: 'corrente'},
                    {label: 'Anni precedenti', value: 'precedenti'},
                    {label: 'Pre-iscrizioni', value: 'pre-iscrizioni'},
                ],
            },
        },
        {
            name: 'Stato',
            value: '',
            active: false,
            type: 'checkbox',
            key: 'status',
            data: {
                options: [
                    {label: 'Non Firmata', value: 1, checked: false},
                    {label: 'In Attesa', value: 2, checked: false},
                    {label: 'Rifiutata', value: 3, checked: false},
                    {label: 'Accettata', value: 4, checked: false},
                ],
            },
        },
        {
            name: 'Periodo di riferimento',
            value: '',
            active: false,
            type: 'date-range',
            key: 'period',
            data: {
                from_date: moment().startOf('month').format('DD/MM/YYYY'),
                to_date: moment().endOf('month').format('DD/MM/YYYY'),
            },
        },
    ];

    let currentScale = 1;

    const availableStatus = {
        queryFilter: 'Filtro',
        choosing: 'Scegli il formato di stampa',
        previewing: 'Anteprima',
    };

    let printingData = {
        current_year: 1, // 1 = current year, 0 = past years
        format: 'pdf', // pdf or excel
        type: type,
    };

    let file = '';
    let filename = '';
    let generating = false;

    function generateFilterObject() {
        let filterObj = {};
        filters.forEach(filter => {
            if (filter.active) {
                if (filter.type === 'date-range') {
                    filterObj[filter.key] = filter.data;
                } else if (filter.type === 'checkbox') {
                    filterObj[filter.key] = filter.data.options
                        .filter(option => option.checked)
                        .map(option => option.value);
                } else if (filter.type === 'radio') {
                    filterObj[filter.key] = filter.value;
                }
            }
        });
        return filterObj;
    }

    async function generatePrinting() {
        generating = true;
        printingData.filters = generateFilterObject();
        const res = await apiFetch(__bakney.env.API.PRINTING.GENERATE, {
            method: 'POST',
            body: JSON.stringify(printingData),
        });

        if (!res.error && res.status === 200) {
            file = res.response?.file;
            filename = res.response?.filename;
        } else {
            toast.error(res.response?.msg || 'Errore nella generazione della stampa. Contatta il supporto tecnico.');
        }
        generating = false;
        return res.error || res.status != 200;
    }

    onMount(() => {
        // set body overflow hidden and body height 100vh when modal is open
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100vh';
        printingData.type = type;
    });

    function clearBody() {
        document.body.style = 'overflow:auto;';
    }

    onDestroy(() => {
        clearBody();
    });
</script>

<BasicModal
    {id}
    {show}
    {fullHeight}
    {title}
    {cancelButton}
    {showCancelButton}
    {showFooter}
    {showActionButton}
    {actionButton}
    {scrollable}
    {dataHeight}
    {alignFooterCenter}
    {modalSize}
    on:cancel={clearBody}
    on:confirm={clearBody}>
    <div class="my-4">
        <h1>{title}</h1>
    </div>
    <!-- show timeline of available options -->
    <div class="col-12 mt-8 mb-4 bg-light p-0 rounded">
        <!-- the 3 states, with the current and past states in primary color -->
        <div class="d-flex justify-content-center">
            <div class="col-4 text center font-weight-bolder bg-secondary py-4 rounded-left">
                <h6 class="text-center text-dark font-weight-boldest mb-0">Filtro</h6>
            </div>
            <div
                class="col-4 text center font-weight-bolder py-4 {currentStatus == 'choosing' ||
                currentStatus == 'previewing'
                    ? 'bg-secondary'
                    : ''}">
                <h6 class="text-center text-dark font-weight-boldest mb-0">Formato</h6>
            </div>
            <div
                class="col-4 text center font-weight-bolder py-4 rounded-right {currentStatus == 'previewing'
                    ? 'bg-secondary'
                    : ''}">
                <h6 class="text-center text-dark font-weight-boldest mb-0">Anteprima</h6>
            </div>
        </div>
    </div>
    <!-- <div class="col-12 mb-8 text-center">
        {#if currentStatus === 'choosing' || currentStatus === 'previewing'}
            <span class="text-center text-dark font-weight-normal">
                Saranno esportati i dati relativi
                <b>
                    {printingData.current_year === 1 ? "all'anno corrente" : 'a gli anni passati'}
                </b>
                {#if currentStatus === 'previewing'}
                    in formato
                    <b>
                        {printingData.format === 'pdf' ? 'PDF' : 'Excel'}
                    </b>
                    .
                {/if}
            </span>
        {/if}
    </div> -->
    {#if currentStatus === 'queryFilter'}
        <div class="d-flex justify-content-center flex-column mb-12">
            <!-- d-flex with 2 options: Current year or past years -->
            <div class="d-flex p-8 w-100">
                <QueryFilter {filters} />
            </div>
            <button
                class="btn btn-primary font-weight-boldest m-auto"
                on:click={() => {
                    currentStatus = 'choosing';
                }}>
                Continua e scegli il formato
            </button>
        </div>
    {:else if currentStatus === 'choosing'}
        {#if generating}
            <!-- loading spinner -->
            <div class="d-flex justify-content-center mb-8">
                <div class="spinner-border text-primary" role="status" />
                <span class="sr-only">Generazione stampa in corso...</span>
            </div>
        {:else}
            <!-- like above but you can choose pdf or excel -->
            <div class="d-flex justify-content-center flex-column">
                <h2 class="text-center font-weight-bolder">{availableStatus.choosing}</h2>
                <div class="d-flex p-8">
                    <button
                        class="btn btn-light-primary col-6 text-center border rounded-lg p-12 mr-4"
                        on:click={async () => {
                            printingData.format = 'pdf';
                            let result = await generatePrinting();
                            if (!result) {
                                currentStatus = 'previewing';
                                modalSize = 'xl';
                            }
                        }}>
                        <FilePdf size="62" weight="duotone" />
                        <h4 class="text-center">PDF</h4>
                    </button>
                    <button
                        class="btn btn-light-primary col-6 text-center border rounded-lg p-12 ml-4"
                        on:click={async () => {
                            printingData.format = 'excel';
                            let result = await generatePrinting();
                            if (!result) {
                                currentStatus = 'previewing';
                            }
                        }}>
                        <MicrosoftExcelLogo size="62" weight="duotone" />
                        <h4 class="text-center">Excel</h4>
                    </button>
                </div>
            </div>
        {/if}
    {/if}
    {#if currentStatus === 'previewing'}
        <!-- Title as above -->
        <div class="d-flex justify-content-center">
            <h2 class="text-center font-weight-bolder">{availableStatus.previewing}</h2>
        </div>
        {#if printingData.format === 'pdf'}
            <!-- iframe with pdf -->
            <iframe
                id="frame-preview-{id}"
                {title}
                src="data:application/pdf;base64,{file}"
                class="mb-8"
                style="width: 100%; min-height: 55vh; border: none;" />
        {:else if printingData.format === 'excel'}
            <!-- preview not available -->
            <div
                class="d-flex flex-column justify-content-center align-items-center bg-light rounded-xl p-24 mx-0 mx-md-24 my-8">
                <EyeSlash size={52} weight="duotone" />
                <h6 class="text-center font-weight-normal">Anteprima non disponibile per i fogli excel.</h6>
            </div>
        {/if}
        <div class="d-flex justify-content-center mb-12">
            <!-- button to download file -->
            <button
                class="btn btn-primary font-weight-bolder align-items-center"
                on:click={() => {
                    window.downloadFile(
                        filename,
                        file,
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    );
                }}>
                <FileArrowDown size="20" weight="duotone" />
                Scarica file
            </button>
        </div>
    {/if}
</BasicModal>
