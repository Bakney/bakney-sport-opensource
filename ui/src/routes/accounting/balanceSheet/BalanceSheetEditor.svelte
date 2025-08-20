<script>
    import {scale} from 'svelte/transition';
    import {onMount} from 'svelte';
    import {apiFetch} from 'utils/ApiMiddleware.js';
    import {v4 as uuidv4} from 'uuid';
    import {fixedDecimal} from 'utils/Functions.js';
    // import NumericInput from './balanceInputs/NumericInput.svelte';
    import EditableSection from './balanceInputs/EditableSection.svelte';
    import TableHeader from './balanceInputs/TableHeader.svelte';
    import {userData} from 'store/stores.js';
    import {canPerformAction} from 'utils/Permissions';
    import {toast} from 'svelte-sonner';
    import CurrentViewPrintingModal from 'components/modals/CurrentViewPrintingModal.svelte';
    import {SimpleButton} from 'components/buttons';
    import {
        ArrowCounterClockwise,
        ArrowLineDown,
        ArrowSquareDown,
        ArrowSquareUp,
        Eye,
        Eyeglasses,
        ShareFat,
        Warning,
        X,
    } from 'phosphor-svelte';
    import BottomBarFixedSave from 'components/inputs/BottomBarFixedSave.svelte';
    import {sidebarCollapsed} from 'store/stores';

    userData.useLocalStorage();

    let currentDate = moment(new Date()).format('YYYY-MM-DD');
    let animateSaving = false;
    let animatePublish = false;
    let balanceSheet = {
        incoming: {
            projectContributions: [
                {
                    description: 'Altre entrate da soci',
                    institutional: 0,
                    commercial: 0,
                    id: uuidv4(),
                    editable: true,
                },
            ],
            institutionalIncome: [
                {
                    description: 'Quote annuali associati',
                    institutional: 0,
                    commercial: 0,
                    id: uuidv4(),
                    editable: true,
                },
                {
                    description: 'Quote associative',
                    institutional: 0,
                    commercial: 0,
                    id: uuidv4(),
                    editable: true,
                },
                {
                    description: 'Quote per partecipazione attività sportiva',
                    institutional: 0,
                    commercial: 0,
                    id: uuidv4(),
                    editable: true,
                },
                {
                    description: 'Quote per utilizzo impianti da parte di altre associazioni',
                    institutional: 0,
                    commercial: 0,
                    id: uuidv4(),
                    editable: true,
                },
            ],
            commercialIncome: [
                {
                    description: 'Pubblicità regime L. 398/1991',
                    institutional: 0,
                    commercial: 0,
                    id: uuidv4(),
                    editable: true,
                },
            ],
        },
        outgoing: {
            reimboursments: [
                {
                    description: 'Indennità, rimborsi, premi e compensi art. 67 C. 1 lett. m) TUIR',
                    institutional: 0,
                    commercial: 0,
                    id: uuidv4(),
                    editable: true,
                },
            ],
            generalExpenses: [
                {
                    description: 'Spese di pubblicità',
                    institutional: 0,
                    commercial: 0,
                    id: uuidv4(),
                    editable: true,
                },
            ],
        },
        cash: 0,
        bank: 0,
        draft: true,
        year: new Date().getFullYear(),
    };
    let balanceSheetYear = 0;
    let balanceSheetStartMonth = 0;
    let balanceSheetStartDay = 0;
    let availableYears = [];
    let currentYear = new Date().getFullYear();
    let balanceSheetYearMap = {
        1: 'Anno solare (GENNAIO - DICEMBRE)',
        2: 'Anno sportivo 1 (SETTEMBRE - AGOSTO)',
        3: 'Anno sportivo 2 (GIUGNO - MAGGIO)',
    };
    let sections = {
        incoming: [
            {
                titleLabel: 'ENTRATE GENERALI',
                totalLabel: 'TOTALE ENTRATE GENERALI',
                ref: 'generalIncome',
            },
        ],
        outgoing: [
            {
                titleLabel: 'SPESE GENERALI',
                totalLabel: 'TOTALE SPESE GENERALI',
                ref: 'generalExpenses',
            },
        ],
    };

    let oldSections = {
        incoming: [
            {
                titleLabel: 'ENTRATE GENERALI',
                totalLabel: 'TOTALE ENTRATE GENERALI',
                ref: 'generalIncome',
            },
            {
                titleLabel: 'CONTRIBUTI SU PROGETTI',
                totalLabel: 'TOTALE CONTRIBUTI SU PROGETTI',
                ref: 'projectContributions',
            },
            {
                titleLabel: 'ENTRATE ISTITUZIONALI',
                totalLabel: 'TOTALE ENTRATE ISTITUZIONALI',
                ref: 'institutionalIncome',
            },
            {
                titleLabel: 'PROVENTI ATTIVITÀ COMMERCIALE',
                totalLabel: 'TOTALE PROVENTI ATTIVITÀ COMMERCIALE',
                ref: 'commercialIncome',
            },
        ],
        outgoing: [
            {
                titleLabel: 'INDENNITÀ E RIMBORSO',
                totalLabel: 'TOTALE INDENNITÀ E RIMBORSO',
                ref: 'reimboursments',
            },
            {
                titleLabel: 'SPESE GENERALI',
                totalLabel: 'TOTALE SPESE GENERALI',
                ref: 'generalExpenses',
            },
        ],
    };

    let customCols = {
        institutionalTotal: fixedDecimal(calculateInstitutional()),
        commercialTotal: fixedDecimal(calculateCommercial()),
        total: fixedDecimal(calculateTotal()),
    };
    let loading = false;

    $: balanceSheet,
        (customCols = {
            institutionalTotal: fixedDecimal(calculateInstitutional()),
            commercialTotal: fixedDecimal(calculateCommercial()),
            total: fixedDecimal(calculateTotal()),
        });

    async function fetchInitialData() {
        loading = true;
        await fetchSettingsInfo();
        await fetchData();
        document.querySelectorAll('.popover').forEach(popover => popover.remove());
        jQuery('body').tooltip({selector: '[data-toggle=tooltip]', trigger: 'hover'});
        jQuery('body').popover({selector: '[data-toggle=popover]', trigger: 'hover'});
        setTimeout(() => {
            jQuery('#social-year').selectpicker();
        }, 300);
        loading = false;
    }

    onMount(async () => {
        await fetchInitialData();
    });

    async function resetBalanceSheet() {
        // call the API endpoint with DELETE method
        let res = await apiFetch(`${__bakney.env.API.BALANCE_SHEET}?currentDate=${currentDate}`, {
            method: 'DELETE',
        });
        if (!res.error) {
            // refetch data
            await fetchData();
            toast.success('Il bilancio è stato resettato con successo.');
        } else {
            toast.error('Si è verificato un errore, riprova.');
        }
    }

    function getTextMonthFromNumber(month) {
        switch (month) {
            case 1:
                return 'GENNAIO';
            case 2:
                return 'FEBBRAIO';
            case 3:
                return 'MARZO';
            case 4:
                return 'APRILE';
            case 5:
                return 'MAGGIO';
            case 6:
                return 'GIUGNO';
            case 7:
                return 'LUGLIO';
            case 8:
                return 'AGOSTO';
            case 9:
                return 'SETTEMBRE';
            case 10:
                return 'OTTOBRE';
            case 11:
                return 'NOVEMBRE';
            case 12:
                return 'DICEMBRE';
        }
    }

    function fetchSettingsInfo() {
        apiFetch(__bakney.env.API.PROFILE.SETTINGS).then(res => {
            if (!res.error) {
                balanceSheetYear = res.response.settings.balance_sheet_year;
                balanceSheetStartMonth = res.response.settings.balance_sheet_start_month;
                balanceSheetStartDay = res.response.settings.balance_sheet_start_day;
                currentYear = res.response.settings.current_year;
            } else {
                let modalText =
                    response.status == 403
                        ? 'Operazione non permessa.'
                        : 'Scusa, ho individuato degli errori, riprova.';
                toast.error(modalText);
            }
        });
    }

    async function fetchData() {
        loading = true;
        let res = await apiFetch(__bakney.env.API.BALANCE_SHEET + '?currentDate=' + currentDate);
        if (!res.error) {
            balanceSheet = res.response.data.balance_sheet.data;
            balanceSheet.year = res.response.data.balance_sheet.year;
            balanceSheet.draft = res.response.data.balance_sheet.draft;
            availableYears = res.response.data.available_years;
        }
        setTimeout(() => {
            loading = false;
        }, 200);
    }

    function getBalanceSheetNoEdits(balanceSheet) {
        let balanceSheetNoEdits = JSON.parse(JSON.stringify(balanceSheet));
        for (let section in balanceSheetNoEdits.incoming) {
            balanceSheetNoEdits.incoming[section].forEach(row => {
                row.editable = false;
            });
        }
        for (let section in balanceSheetNoEdits.outgoing) {
            balanceSheetNoEdits.outgoing[section].forEach(row => {
                row.editable = false;
            });
        }
        return balanceSheetNoEdits;
    }

    async function saveDraft() {
        animateSaving = true;
        let res = await apiFetch(__bakney.env.API.BALANCE_SHEET, {
            method: 'POST',
            body: JSON.stringify({
                balance_sheet: getBalanceSheetNoEdits(balanceSheet),
            }),
        });
        if (!res.error) {
            balanceSheet = res.response?.data?.balance_sheet?.data || {};
            balanceSheet.year = res.response?.data?.balance_sheet?.year;
            balanceSheet.draft = res.response?.data?.balance_sheet?.draft;
        }
        setTimeout(() => {
            animateSaving = false;
        }, 200);
    }

    async function publish(draft) {
        swal.fire({
            text: !draft ? 'Vuoi pubblicare il bilancio?' : 'Vuoi annullare la pubblicazione del bilancio?',
            icon: 'question',
            footer: '<b class="text-danger">Puoi annullare la pubblicazione in qualsiasi momento.</b>',
            buttonsStyling: true,
            showCancelButton: true,
            cancelButtonText: 'Annulla',
            confirmButtonText: !draft ? 'Pubblica' : 'Annulla pubblicazione',
            reverseButtons: true,
        }).then(async function (result) {
            if (result.isConfirmed) {
                KTApp.blockPage({
                    overlayColor: '#000000',
                    state: 'primary',
                    message: 'Publicazione in corso...',
                });
                animatePublish = true;
                // change balanceSheet draft status
                balanceSheet.draft = draft;
                let res = await apiFetch(__bakney.env.API.BALANCE_SHEET, {
                    method: 'POST',
                    body: JSON.stringify({
                        balance_sheet: balanceSheet,
                    }),
                });
                if (!res.error) {
                    balanceSheet = res.response?.data?.balance_sheet?.data || {};
                    balanceSheet.year = res.response?.data?.balance_sheet?.year;
                    balanceSheet.draft = res.response?.data?.balance_sheet?.draft;
                    toast.success('Il bilancio è stato pubblicato con successo, è possibile stamparlo in PDF.');
                } else {
                    let modalText =
                        response.status == 403
                            ? 'Operazione non permessa.'
                            : 'Scusa, ho individuato degli errori, riprova.';
                    toast.error(modalText);
                }
                setTimeout(() => {
                    KTApp.unblockPage();
                    animatePublish = false;
                }, 200);
            }
        });
    }

    async function refreshData() {
        balanceSheet.draft = false;
        let res = await apiFetch(__bakney.env.API.BALANCE_SHEET + '?currentDate=' + currentDate + '&oldView=' + false);
        if (!res.error) {
            balanceSheet = res.response?.data?.balance_sheet?.data || {};
            balanceSheet.year = res.response?.data?.balance_sheet?.year;
            balanceSheet.draft = res.response?.data?.balance_sheet?.draft;
        }
    }

    function addRow(section) {
        if (Object.keys(balanceSheet.incoming).includes(section)) {
            balanceSheet.incoming[section] = [
                ...balanceSheet.incoming[section],
                {
                    description: '',
                    institutional: 0,
                    commercial: 0,
                    id: uuidv4(),
                    editable: true,
                },
            ];
        } else if (Object.keys(balanceSheet.outgoing).includes(section)) {
            balanceSheet.outgoing[section] = [
                ...balanceSheet.outgoing[section],
                {
                    description: '',
                    institutional: 0,
                    commercial: 0,
                    id: uuidv4(),
                    editable: true,
                },
            ];
        }
    }

    function calculateInstitutional() {
        // calculate institutional incoming and outgoing
        let total = 0;
        for (let section of Object.keys(balanceSheet.incoming)) {
            for (let row of balanceSheet.incoming[section]) {
                total += row.institutional;
            }
        }
        for (let section of Object.keys(balanceSheet.outgoing)) {
            for (let row of balanceSheet.outgoing[section]) {
                total -= row.institutional;
            }
        }
        return total;
    }

    function calculateCommercial() {
        // calculate commercial incoming and outgoing
        let total = 0;
        for (let section of Object.keys(balanceSheet.incoming)) {
            for (let row of balanceSheet.incoming[section]) {
                total += row.commercial;
            }
        }
        for (let section of Object.keys(balanceSheet.outgoing)) {
            for (let row of balanceSheet.outgoing[section]) {
                total -= row.commercial;
            }
        }
        return total;
    }

    function calculateTotalExpenses() {
        let total = 0;
        for (let section of Object.keys(balanceSheet.outgoing)) {
            for (let row of balanceSheet.outgoing[section]) {
                total -= row.commercial;
            }
        }
        for (let section of Object.keys(balanceSheet.outgoing)) {
            for (let row of balanceSheet.outgoing[section]) {
                total -= row.institutional;
            }
        }

        return total;
    }

    function calculateTotalIncoming() {
        let total = 0;
        for (let section of Object.keys(balanceSheet.incoming)) {
            for (let row of balanceSheet.incoming[section]) {
                total += row.commercial;
            }
        }
        for (let section of Object.keys(balanceSheet.incoming)) {
            for (let row of balanceSheet.incoming[section]) {
                total += row.institutional;
            }
        }

        return total;
    }

    function calculateTotal() {
        return calculateInstitutional() + calculateCommercial();
    }

    function printBalanceSheet() {
        let currentViewPrintingModal = new CurrentViewPrintingModal({
            target: document.querySelector(`#portal-elements`),
            intro: true,
            props: {
                title: 'Rendiconto economico finanziario',
                endpointWithQueryString:
                    __bakney.env.API.BALANCE_SHEET + '?currentDate=' + currentDate + '&oldView=' + false,
            },
        });
    }
</script>

<!--begin::Content-->
<div class="flex-row-fluid mb-24">
    <div class="d-flex justify-content-between align-items-center p-0">
        <!-- svelte-ignore a11y-missing-attribute -->
        <img id="logo-print" class="ml-8" src={$userData.sport_association.logo} height="60" />
        <div class="only-printable">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="font-weight-bolder h5 mb-2"
                >Periodo di riferimento dal
                <b>{balanceSheetStartDay}/{balanceSheetStartMonth}/{balanceSheet.year}</b>
                al
                <b>{balanceSheetStartDay}/{balanceSheetStartMonth}/{balanceSheet.year + 1}</b>
            </label>
        </div>
    </div>
    <!--begin::Card-->
    <div class="card card-custom card-stretch">
        <!--begin::Header-->
        <div class="card-header py-3 border-0 p-0">
            <div class="card-title">
                <h3 class="card-label font-size-h2">
                    Rendiconto economico finanziario
                    <span id="title-description-balance-sheet" class="d-block text-muted pt-2 font-size-sm"
                        >Gestisci il bilancio annuale entrate e uscite della tua associazione.</span>
                </h3>
            </div>
            <div class="card-toolbar">
                <button class="btn btn-light-primary font-weight-bolder mr-2" on:click={printBalanceSheet}>
                    Esporta PDF/Excel
                </button>
                <button
                    class="btn btn-{balanceSheet.draft ? 'success' : 'light-danger'} font-weight-bolder"
                    disabled={animatePublish || !canPerformAction('bookeeping.management.balancesheet.update')}
                    on:click={() => publish(!balanceSheet.draft)}>
                    {#if animatePublish}
                        <span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true" />
                        Attendere...
                    {:else if balanceSheet.draft}
                        <ShareFat size="18" weight="bold" class="mr-1" />
                        Pubblica
                    {:else}
                        <X size="18" weight="bold" class="mr-1" />
                        Annulla pubblicazione
                    {/if}
                </button>

                <button
                    class="btn btn-primary font-weight-bolder ml-2"
                    disabled={animateSaving || !canPerformAction('bookeeping.management.balancesheet.update')}
                    on:click={() => saveDraft()}>
                    {#if animateSaving}
                        <span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true" />
                        Attendere...
                    {:else}
                        Salva
                    {/if}
                </button>
            </div>
        </div>
        <!--end::Header-->
        <!--begin::Form-->
        <div>
            <!--begin::Body-->
            <div class="card-body balance-sheet-card p-0">
                {#if !loading}
                    <div
                        class="d-none d-flex justify-content-start mb-2 mt-2 mt-md-0 mb-md-3 pb-2 pb-md-0 overflow-auto"
                        style="flex-wrap: wrap;">
                        <div class="col-12 col-md-3 p-2 pr-md-4" in:scale={{duration: 250, start: 0.92}}>
                            <div class="card-widget card p-0 m-0">
                                <div class="card-body p-4">
                                    <div class="mb-0">
                                        <h6 class="font-weight-boldest text-center mb-0" style="font-size: 1rem;">
                                            ENTRATE
                                        </h6>
                                    </div>
                                    <div
                                        class="text-center font-weight-bolder text-primary"
                                        style="font-size: 1.75rem;">
                                        <span class="text-{calculateTotalIncoming() < 0 ? 'danger' : 'success'}"
                                            >{Number(calculateTotalIncoming()).toLocaleString('it-IT', {
                                                maximumFractionDigits: 2,
                                                minimumFractionDigits: 2,
                                            })} €</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-3 p-2 pr-md-4" in:scale={{duration: 250, start: 0.92}}>
                            <div class="card-widget card p-0 m-0">
                                <div class="card-body p-4">
                                    <div class="mb-0">
                                        <h6 class="font-weight-boldest text-center mb-0" style="font-size: 1rem;">
                                            USCITE
                                        </h6>
                                    </div>
                                    <div
                                        class="text-center font-weight-bolder text-primary"
                                        style="font-size: 1.75rem;">
                                        <span class="text-{calculateTotalExpenses() < 0 ? 'danger' : 'success'}"
                                            >{Number(calculateTotalExpenses()).toLocaleString('it-IT', {
                                                maximumFractionDigits: 2,
                                                minimumFractionDigits: 2,
                                            })} €
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-3 p-2 pr-md-4" in:scale={{duration: 250, start: 0.92}}>
                            <div class="card-widget card p-0 m-0">
                                <div class="card-body p-4">
                                    <div class="mb-0">
                                        <h6 class="font-weight-boldest text-center mb-0" style="font-size: 1rem;">
                                            BILANCIO FINALE
                                        </h6>
                                    </div>
                                    <div
                                        class="text-center font-weight-bolder text-primary"
                                        style="font-size: 1.75rem;">
                                        <span
                                            class="text-{parseFloat(
                                                customCols.total.replace('.', '').replace(',', '.')
                                            ) < 0
                                                ? 'danger'
                                                : 'success'}">{customCols.total} €</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-3 p-2" in:scale={{duration: 250, start: 0.92}}>
                            <div class="card-widget card p-0 m-0">
                                <div class="card-body p-4">
                                    <div class="mb-0">
                                        <h6 class="font-weight-boldest text-center mb-0" style="font-size: 1rem;">
                                            INDICE DI REDDITIVITÀ
                                        </h6>
                                    </div>
                                    <div
                                        class="text-center font-weight-bolder text-primary"
                                        style="font-size: 1.75rem;">
                                        {Number(
                                            (parseFloat(customCols.total.replace('.', '').replace(',', '.')) /
                                                parseFloat(calculateTotalIncoming() || 1)) *
                                                100
                                        ).toLocaleString('it-IT', {maximumFractionDigits: 2, minimumFractionDigits: 2})}
                                        %
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                {/if}
                {#if !loading}
                    <div class="row mb-8 not-printable pt-4 mx-auto" style="max-width: 80rem;">
                        <div class="col-xl-6">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="font-weight-bolder h6 mb-2"
                                >Periodo anno sociale dal
                                <b>{balanceSheetStartDay}/{balanceSheetStartMonth}/{balanceSheet.year}</b>
                                al
                                <b>{balanceSheetStartDay}/{balanceSheetStartMonth}/{balanceSheet.year + 1}</b>
                            </label>
                            <div style="max-width: 8rem">
                                <select
                                    on:change={async () => {
                                        // update currentDate to the new year with moment to YYYY-MM-DD
                                        // available_years is an array of objects with year property and start_date property
                                        // we extract the start_date property to get the day and month of the start date
                                        let selectedYear = parseInt(document.getElementById('social-year').value);
                                        let actualYear = availableYears.find(
                                            year => year.year === selectedYear
                                        ).start_date;
                                        currentDate = moment(actualYear).format('YYYY-MM-DD');
                                        await fetchInitialData();
                                    }}
                                    value={balanceSheet.year}
                                    id="social-year"
                                    class="form-control form-control-solid">
                                    {#each availableYears || [] as year}
                                        <option value={year.year}>{year.year}</option>
                                    {/each}
                                </select>
                            </div>
                            <span class="form-text text-muted font-size-sm"
                                >Puoi cambiare l'anno sociale dalle <a href="/#/profile?page=settings">impostazioni</a
                                >.</span>
                        </div>

                        <div class="col-xl-6 d-flex align-items-center justify-content-end" style="gap: .5rem;">
                            {#if balanceSheet.draft}
                                <SimpleButton label={'Reset'} variant={'dark'} size={'sm'} on:click={resetBalanceSheet}>
                                    <ArrowCounterClockwise size="14" weight="duotone" class="mr-1" />
                                    Reset
                                </SimpleButton>
                            {/if}
                        </div>
                    </div>
                    <div class="row mx-auto" style="max-width: 80rem;">
                        <div class="col-lg-9 col-xl-6">
                            <h5 class="font-size-h1 text-success font-weight-bolder d-flex align-items-start">
                                <ArrowSquareDown size={26} weight="duotone" class="text-success mr-2" />
                                Entrate
                            </h5>
                        </div>
                    </div>
                    <div class="form-group row mx-auto" style="max-width: 80rem;">
                        <div class="card-body p-4 pt-5">
                            <table class="balance-sheet-table">
                                <TableHeader title={'A) ENTRATE'} />
                                {#each Array.from(sections.incoming || []) as section}
                                    <EditableSection
                                        bind:section={balanceSheet.incoming[section.ref]}
                                        titleLabel={section.titleLabel}
                                        totalLabel={section.totalLabel}
                                        ref={section.ref}
                                        formatDecimal={fixedDecimal}
                                        {addRow}
                                        {refreshData}
                                        bind:draft={balanceSheet.draft} />
                                {/each}
                            </table>
                        </div>
                    </div>

                    <div class="row mx-auto" style="max-width: 80rem;">
                        <div class="col-lg-9 col-xl-6">
                            <h5 class="font-size-h1 text-danger font-weight-bolder d-flex align-items-start">
                                <ArrowSquareUp size={26} weight="duotone" class="text-danger mr-2" />
                                Uscite
                            </h5>
                        </div>
                    </div>

                    <div class="form-group row mx-auto" style="max-width: 80rem;">
                        <div class="card-body p-4 pt-5">
                            <table class="balance-sheet-table">
                                <TableHeader title={'B) USCITE'} />
                                <!-- OUTGOING -->
                                {#each Array.from(sections.outgoing || []) as section}
                                    <EditableSection
                                        bind:section={balanceSheet.outgoing[section.ref]}
                                        titleLabel={section.titleLabel}
                                        totalLabel={section.totalLabel}
                                        ref={section.ref}
                                        formatDecimal={fixedDecimal}
                                        {addRow}
                                        bind:draft={balanceSheet.draft} />
                                {/each}
                            </table>
                        </div>
                    </div>

                    <div class="form-group row mx-auto" style="max-width: 80rem;">
                        <div class="card-body p-4 pt-5">
                            <table class="balance-sheet-table">
                                <TableHeader
                                    title={'C) RENDICONTO DELLA GESTIONE'}
                                    customCols={{
                                        total: customCols.total,
                                        institutionalTotal: fixedDecimal(calculateTotalIncoming()),
                                        commercialTotal: fixedDecimal(calculateTotalExpenses()),
                                    }} />
                            </table>
                        </div>
                    </div>

                    <div class="form-group row mx-auto" style="max-width: 80rem;">
                        <div class="card-body p-4 pt-5">
                            <table class="balance-sheet-table">
                                <tr>
                                    <th style="width:80%;text-align: left;">D) LIQUIDIT&Agrave;</th>
                                    <th />
                                </tr>
                                <tr>
                                    <th style="width:80%;text-align: left;">Di cui in cassa</th>
                                    <th>
                                        <!-- {#if balanceSheet.draft}
                                            <NumericInput
                                                bind:value={balanceSheet.cash}
                                                id={'balance_sheet_cash'}
                                                on:update={e => {
                                                    balanceSheet.cash = parseFloat(e.detail);
                                                }}
                                                editable={balanceSheet.draft} />
                                        {:else} -->
                                        <span>{fixedDecimal(balanceSheet.cash)} €</span>
                                        <!-- {/if} -->
                                    </th>
                                </tr>
                                <tr>
                                    <th style="width:80%;text-align: left;">Di cui in banca</th>
                                    <th>
                                        <!-- {#if balanceSheet.draft}
                                            <NumericInput
                                                bind:value={balanceSheet.bank}
                                                id={'balance_sheet_bank'}
                                                on:update={e => {
                                                    balanceSheet.bank = parseFloat(e.detail);
                                                }}
                                                editable={balanceSheet.draft} />
                                        {:else} -->
                                        <span>{fixedDecimal(balanceSheet.bank)} €</span>
                                        <!-- {/if} -->
                                    </th>
                                </tr>
                                <tr>
                                    <th style="width:80%;text-align: left;">Di cui altro</th>
                                    <th>
                                        <!-- {#if balanceSheet.draft}
                                            <NumericInput
                                                bind:value={balanceSheet.other}
                                                id={'balance_sheet_bank'}
                                                on:update={e => {
                                                    balanceSheet.other = parseFloat(e.detail);
                                                }}
                                                editable={balanceSheet.draft} />
                                        {:else} -->
                                        <span>{fixedDecimal(balanceSheet.other || 0)} €</span>
                                        <!-- {/if} -->
                                    </th>
                                </tr>
                                <tr>
                                    <th style="width:80%;text-align: left;">Totale disponibilità liquide</th>
                                    <th
                                        >{fixedDecimal(balanceSheet.cash + balanceSheet.bank + balanceSheet.other)} €</th>
                                </tr>
                            </table>
                        </div>
                    </div>
                {/if}
            </div>
            <!--end::Body-->
        </div>
        <!--end::Form-->
    </div>
</div>

{#if balanceSheet.draft}
    <BottomBarFixedSave
        customStyle={KTUtil.isMobileDevice()
            ? 'width: 100%;'
            : $sidebarCollapsed
            ? 'width: calc(100% - 17px);right: 0;left: auto;'
            : `width: calc(100% - 238px);right: 0;left: auto;`}
        on:save={() => {
            saveDraft();
        }}
        autoShow={balanceSheet.draft && canPerformAction('bookeeping.management.balancesheet.update') && !animateSaving}
        visible={false}>
        <div slot="left" class="d-flex align-items-center">
            {#if animateSaving}
                <span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true" />
                Attendere...
            {:else}
                <Warning weight={'duotone'} size={18} class="mr-2 text-warning" />
                <p class="font-weight-boldest mb-0 text-warning text-xs">
                    Ricordati di salvare per applicare le modifiche.
                </p>
            {/if}
        </div>
    </BottomBarFixedSave>
{/if}

<svelte:head>
    <style>
        .balance-sheet-card {
            overflow: auto;
        }
        .balance-sheet-table {
            width: 100%;
            background: #fff;
            border-radius: 0.55rem !important;
            border-collapse: collapse;
            border-style: hidden;
            box-shadow: 0 0 0 1px #e4e6ef;
            min-width: 45rem;
            overflow: scroll;
        }
        .balance-sheet-table td:first-child {
            text-align: left;
        }
        .balance-sheet-table th,
        .balance-sheet-table td {
            border-bottom: 1px solid #e4e9f0;
            padding: 1rem;
            text-align: right;
        }
        .balance-sheet-table tr {
            border-bottom: 1px solid #e4e9f0;
            padding: 1rem;
            text-align: right;
        }
        .subtotal td {
            font-size: 1.1rem;
            font-weight: bolder;
        }
        #logo-print {
            display: none;
        }
        .only-printable {
            display: none;
        }
        @media print {
            .card-toolbar {
                display: none !important;
            }
            #engage-msg {
                display: none !important;
            }
            #title-description-balance-sheet {
                display: none !important;
            }
            .theader-balance-sheet .btn-clean {
                display: none !important;
            }
            #kt_header_mobile,
            #kt_header,
            #kt_footer {
                display: none !important;
            }
            .aside {
                display: none !important;
            }
            #logo-print {
                display: block !important;
            }
            .not-printable {
                display: none !important;
            }
            .only-printable {
                display: block !important;
            }
        }
    </style>
</svelte:head>
