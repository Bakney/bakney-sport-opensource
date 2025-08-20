<script>
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import Portal from 'svelte-portal';
    import {getDataFromForm} from 'utils/Functions';
    import InplaceTabs from 'components/InplaceTabs.svelte';
    import Select from 'svelte-select/Select.svelte';
    import {createEventDispatcher, onMount} from 'svelte';
    import {TrashSimple} from 'phosphor-svelte';
    import {userData} from 'store/stores';
    import {toast} from 'svelte-sonner';

    const dispatch = createEventDispatcher();

    userData.useLocalStorage();

    export let id;
    export let instructorData = {
        data: {
            default_hourly_billing: 0,
            default_percentage_billing: 20,
        },
    };
    export let row = {
        date: new Date().toISOString().split('T')[0],
        hours: null,
        amount: 0,
        paid: false,
        notes: '',
        hourly_billing: null || parseFloat(instructorData?.data?.default_hourly_billing || 0),
        percentage_billing: null || parseFloat(instructorData?.data?.default_percentage_billing || 20),
        compensation_type: 'hourly',
        courses: null, // array of courses the instructor is teaching
        period: moment().startOf('month').format('DD/MM/YYYY') + ' al ' + moment().endOf('month').format('DD/MM/YYYY'),
        calculation_data: [],
    };
    export let ktdatable;
    export let edit = false;

    let form;
    let courses = [];

    $: {
        if (row.compensation_type == 'hourly') {
            row.amount = row.hours * row.hourly_billing;
        } else {
            try {
                row.amount = row.calculation_data.reduce((acc, item) => {
                    return acc + item.amount * (row.percentage_billing / 100);
                }, 0);
            } catch (e) {
                console.warn(e);
            }
        }
    }

    function resetData() {
        row = {
            date: new Date().toISOString().split('T')[0],
            hours: 0,
            amount: 0,
            paid: false,
            notes: '',
            hourly_billing: parseFloat(instructorData?.data?.default_hourly_billing || 0),
            percentage_billing: parseFloat(instructorData?.data?.default_percentage_billing || 20),
            compensation_type: 'hourly',
            courses: null, // array of courses the instructor is teaching
            period:
                moment().startOf('month').format('DD/MM/YYYY') + ' al ' + moment().endOf('month').format('DD/MM/YYYY'),
            calculation_data: [],
        };
    }

    async function fetchCourses() {
        let res = await apiFetch(__bakney.env.API.COURSE.LIST + '?all=1');
        let response = res.response.data;
        // convert the dict to an array
        response = Object.keys(response).map(key => response[key]);
        let tmpCourses = response || [];
        courses = [];
        tmpCourses?.forEach(item => {
            courses = [
                ...courses,
                {
                    value: item.course_id,
                    course_id: item.course_id,
                    label: item.title,
                },
            ];
        });
    }

    async function calculatePercentage() {
        let res = await apiFetch(replaceUID(__bakney.env.API.INSTRUCTOR.HOURS.CALCULATE, edit ? row.instructor : id), {
            method: 'POST',
            body: JSON.stringify({
                courses: row.courses,
                period: row.period,
                percentage: row.percentage_billing,
            }),
        });

        if (res.status == 200) {
            let response = res.response.data;
            row.amount = response.amount;
            row.calculation_data = response.calculation_data;
        }
    }

    function initHourly() {
        // Nothing to do for hourly compensation type
    }

    function initPercentage() {
        jQuery('#compensation-range, #compensation-range_modal').daterangepicker({
            buttonClasses: ' btn',
            applyClass: 'btn-primary',
            cancelClass: 'btn-secondary',
            autoUpdateInput: true,
            startDate: moment().startOf('month'),
            endDate: moment().endOf('month'),
            ranges: {
                Oggi: [moment(), moment()],
                Ieri: [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Ultimi 30 giorni': [moment().subtract(29, 'days'), moment()],
                'Questo mese': [moment().startOf('month'), moment().endOf('month')],
                'Mese scorso': [
                    moment().subtract(1, 'month').startOf('month'),
                    moment().subtract(1, 'month').endOf('month'),
                ],
            },
            locale: {
                format: 'DD/MM/YYYY',
                separator: ' al ',
                cancelLabel: 'Annulla',
                applyLabel: 'Applica',
                fromLabel: 'Dal',
                toLabel: 'al',
                customRangeLabel: 'Periodo personalizzato',
                daysOfWeek: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'],
                monthNames: [
                    'Gennaio',
                    'Febbraio',
                    'Marzo',
                    'Aprile',
                    'Maggio',
                    'Giugno',
                    'Luglio',
                    'Agosto',
                    'Settembre',
                    'Ottobre',
                    'Novembre',
                    'Dicembre',
                ],
            },
        });

        jQuery('#compensation-range').on('change', function () {
            row.period = jQuery(this).val();
        });
    }

    function initForm() {
        form?.destroy();
        form = FormValidation.formValidation(document.getElementById('form_' + id), {
            fields: {
                date: {
                    validators: {
                        notEmpty: {
                            message: 'La data obbligatoria.',
                        },
                    },
                },
                paid: {
                    validators: {
                        notEmpty: {
                            message: 'Lo stato del compenso è obbligatorio.',
                        },
                    },
                },
                amount: {
                    validators: {
                        notEmpty: {
                            message: "L'importo totale è obbligatorio.",
                        },
                    },
                },
                hours: {
                    enabled: row.compensation_type == 'hourly',
                    validators: {
                        notEmpty: {
                            message: 'Le ore lavorate sono obbligatorie.',
                        },
                    },
                },
                hourly_billing: {
                    enabled: row.compensation_type == 'hourly',
                    validators: {
                        notEmpty: {
                            message: 'Il compenso orario è obbligatorio.',
                        },
                    },
                },
                percentage_billing: {
                    enabled: row.compensation_type == 'percentage',
                    validators: {
                        notEmpty: {
                            message: 'La percentuale è obbligatoria.',
                        },
                    },
                },
                notes: {
                    validators: {
                        // should be optional and a string if present
                        stringLength: {
                            min: 0,
                            max: 500,
                            message: 'Le note devono essere inferiori a 500 caratteri.',
                        },
                    },
                },
                compensation_type: {
                    validators: {
                        notEmpty: {
                            message: 'Il tipo di compenso è obbligatorio.',
                        },
                    },
                },
            },
            plugins: {
                trigger: new FormValidation.plugins.Trigger(),
                bootstrap: new FormValidation.plugins.Bootstrap(),
                excluded: new FormValidation.plugins.Excluded(),
                // submitButton: new FormValidation.plugins.SubmitButton(),
            },
        });
    }

    async function update(data) {
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: `Operazione in corso...`,
        });

        const url = replaceUID(
            replaceUID(__bakney.env.API.INSTRUCTOR.HOURS.UPDATE, row.instructor),
            row.instructor_hours_id,
            '<hour_uid>'
        );

        data.date = moment(data.date).format('DD/MM/YYYY');
        data.courses = row.courses;
        data.compensation_type = row.compensation_type;
        data.calculation_data = row.calculation_data;

        if (!data.hourly_billing) data.hourly_billing = 0;
        if (!data.percentage_billing) data.percentage_billing = 0;
        if (!data.hours) data.hours = 0;

        const res = await apiFetch(url, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
        // spinner stop
        KTApp.unblockPage();

        if (res.status == 200) {
            jQuery('#modal-' + id).modal('hide');
            toast.success('Modificato con successo.');
            ktdatable.reload();
        } else {
            swal.fire({
                text: 'Scusa, ho individuato degli errori, riprova.',
                icon: 'error',
                buttonsStyling: false,
                confirmButtonText: 'Ok, capito!',
                customClass: {
                    confirmButton: 'btn font-weight-bold btn-light-primary',
                },
            }).then(function () {
                KTUtil.scrollTop();
            });
        }
    }

    async function add(data) {
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: `Operazione in corso...`,
        });

        const url = replaceUID(__bakney.env.API.INSTRUCTOR.HOURS.ADD, id);

        data.date = moment(data.date).format('DD/MM/YYYY');
        data.courses = row.courses;
        data.compensation_type = row.compensation_type;
        data.calculation_data = row.calculation_data;
        if (!data.hourly_billing) data.hourly_billing = 0;
        if (!data.percentage_billing) data.percentage_billing = 0;
        if (!data.hours) data.hours = 0;

        const res = await apiFetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        // spinner stop
        KTApp.unblockPage();

        if (res.status == 200) {
            jQuery('#modal-' + id).modal('hide');
            toast.success('Inserito con successo.');
            ktdatable.reload();
        } else {
            swal.fire({
                text: 'Scusa, ho individuato degli errori, riprova.',
                icon: 'error',
                buttonsStyling: false,
                confirmButtonText: 'Ok, capito!',
                customClass: {
                    confirmButton: 'btn font-weight-bold btn-light-primary',
                },
            }).then(function () {
                KTUtil.scrollTop();
            });
        }
    }

    async function handleValidation(e) {
        if (!form) initForm();
        form?.validate().then(async function (status) {
            if (status === 'Valid') {
                if (!edit) {
                    await add(getDataFromForm(e));
                    resetData();
                } else await update(getDataFromForm(e));

                dispatch('close');
            } else {
                swal.fire({
                    text: 'Per favore, inserisci tutti i dati e riprova.',
                    icon: 'error',
                    buttonsStyling: false,
                    confirmButtonText: 'Ok, capito!',
                    customClass: {
                        confirmButton: 'btn font-weight-bold btn-light-primary',
                    },
                });
            }
        });
    }

    onMount(async () => {
        await fetchCourses();
        if (row.compensation_type == 'hourly') initHourly();
        else initPercentage();

        if (!edit) {
            // set hourly billing to the default value and percentage billing to the default value
            row.hourly_billing = parseFloat(instructorData?.data?.default_hourly_billing || 0);
            row.percentage_billing = parseFloat(instructorData?.data?.default_percentage_billing || 20);
        }
    });
</script>

<!-- svelte-ignore missing-declaration -->
<Portal>
    <!-- Modal-->
    <form class="form" id="form_{id}" on:submit|preventDefault={handleValidation}>
        <div
            class="modal fade"
            id="modal-{id}"
            tabindex="-1"
            role="dialog"
            aria-labelledby="staticBackdrop"
            aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">
                            {edit ? 'Modifica' : 'Aggiungi'} Orario Istruttore
                        </h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <i aria-hidden="true" class="ki ki-close" />
                        </button>
                    </div>
                    <div class="modal-body" style="min-height: 370px;">
                        <!-- here the modal -->
                        <div class="row">
                            <div class="form-group mb-0 col-12 col-md-4">
                                <label class="font-weight-bold" for="date">Data*</label>
                                <input
                                    type="date"
                                    class="form-control form-control-solid form-control"
                                    id="date"
                                    name="date"
                                    value={row.date} />
                            </div>
                            <div class="form-group mb-0 col-12 col-md-4">
                                <label class="font-weight-bold" for="paid">Stato*</label>
                                <select
                                    class="form-control form-control-solid form-control"
                                    id="paid"
                                    value={row.paid}
                                    name="paid">
                                    <option value={false}>Da Pagare</option>
                                    <option value={true}>Pagato</option>
                                </select>
                            </div>
                        </div>
                        <hr />
                        <div class="row my-2">
                            <div class="form-group mb-0 col-12 col-md-6">
                                <label class="font-weight-bold" for="date">Tipo di compenso</label>
                                <InplaceTabs
                                    showHR={false}
                                    paddingClass={'pb-2'}
                                    bind:disabled={edit}
                                    bind:activeTab={row.compensation_type}
                                    on:tabChange={e => {
                                        row.compensation_type = e.detail.tabName;
                                        if (row.compensation_type == 'hourly') initHourly();
                                        else initPercentage();
                                    }}
                                    navigationPages={[
                                        {title: 'Orario', tabName: 'hourly', icon: null},
                                        {
                                            title: 'Percentuale',
                                            tabName: 'percentage',
                                            icon: null,
                                        },
                                    ]} />
                            </div>

                            <div>
                                <p />
                            </div>
                        </div>
                        <div class="row">
                            <!-- compenso orario -->
                            <div
                                class:d-none={row.compensation_type != 'hourly'}
                                class="form-group mb-0 col-12 col-md-2">
                                <label class="font-weight-bold" for="date">Ore*</label>
                                <input
                                    type="number"
                                    class="form-control form-control-solid form-control"
                                    id="hours"
                                    min="0"
                                    step="0.5"
                                    name="hours"
                                    bind:value={row.hours} />
                            </div>
                            <div
                                class:d-none={row.compensation_type != 'hourly'}
                                class="form-group mb-0 col-12 col-md-2">
                                <label class="font-weight-bold" for="paid">€/ora*</label>
                                <input
                                    type="number"
                                    class="form-control form-control-solid form-control"
                                    id="hourly_billing"
                                    min="0"
                                    step="0.01"
                                    disabled={$userData.instructor_id != null}
                                    name="hourly_billing"
                                    bind:value={row.hourly_billing} />
                            </div>
                            <!-- percentage section -->

                            <div class="form-group mb-4 col-12" class:d-none={row.compensation_type != 'percentage'}>
                                <label class="font-weight-bold" for="courses">Corsi*</label>
                                <Select
                                    hideEmptyState={true}
                                    class="mb-0"
                                    multiple={true}
                                    bind:value={row.courses}
                                    name="course"
                                    bind:items={courses}
                                    placeholder="Seleziona i corsi" />
                            </div>
                            <div
                                class:d-none={row.compensation_type != 'percentage'}
                                class="form-group
                                mb- col-12 col-md-2">
                                <label class="font-weight-bold" for="date">% introiti</label>
                                <input
                                    type="number"
                                    class="form-control form-control-lg form-control-solid form-control"
                                    id="percentage_billing"
                                    min="0"
                                    step="0.01"
                                    max="100"
                                    name="percentage_billing"
                                    disabled={$userData.instructor_id != null}
                                    on:change={e => {
                                        // set to 0 or 100 if the value is out of bounds
                                        if (e.target.value < 0) row.percentage_billing = 0;
                                        if (e.target.value > 100) row.percentage_billing = 100;
                                    }}
                                    bind:value={row.percentage_billing} />
                            </div>
                            <div
                                class:d-none={row.compensation_type != 'percentage'}
                                class="form-group mb-0 col-12 col-md-4">
                                <label class="font-weight-bold" for="period">Periodo*</label>
                                <div class="d-flex align-items-center">
                                    <input
                                        type="text"
                                        name="period"
                                        value={row.period}
                                        class="form-control form-control-lg form-control-solid my-auto px-2 text-center"
                                        id="compensation-range"
                                        placeholder="Seleziona un periodo" />
                                </div>
                            </div>
                            <div
                                class="col-12 m-auto mb-0"
                                style="margin-bottom: 0 !important;"
                                class:d-none={row.compensation_type != 'percentage'}>
                                <div class="d-flex align-items-bottom justify-content-end">
                                    <button
                                        disabled={row.courses == null || row.courses.length == 0}
                                        type="button"
                                        class="btn btn-primary btn-lg font-weight-bolder"
                                        on:click={calculatePercentage}>Calcola</button>
                                </div>
                            </div>
                            <div class="col-12 mt-4" class:d-none={row.compensation_type != 'percentage'}>
                                {#each row.calculation_data as item}
                                    <hr />
                                    <div class="d-flex align-items-center justify-content-between">
                                        <div class="col-2 d-flex align-items-center">{item.full_athlete_name}</div>
                                        <div class="col-4 d-flex align-items-center">{item.course}</div>
                                        <div class="col-2 d-flex align-items-center justify-content-center">
                                            {moment(item.payment_date).format('DD/MM/YYYY')}
                                        </div>
                                        <div class="col-4 d-flex align-items-center justify-content-end">
                                            {item.amount.toLocaleString('it-IT', {
                                                maximumFractionDigits: 2,
                                                minimumFractionDigits: 2,
                                            })} € * {row.percentage_billing}% = {(
                                                item.amount *
                                                (row.percentage_billing / 100)
                                            ).toLocaleString('it-IT', {
                                                maximumFractionDigits: 2,
                                                minimumFractionDigits: 2,
                                            })} €
                                            <button
                                                type="button"
                                                class="btn btn-icon btn-xs p-0 btn-light-danger ml-4 mb-0"
                                                on:click={() => {
                                                    row.calculation_data = row.calculation_data.filter(i => i != item);
                                                }}>
                                                <TrashSimple size="16" />
                                            </button>
                                        </div>
                                    </div>
                                {/each}
                                {#if row.calculation_data.length == 0}
                                    <div class="text-center">
                                        <h4>Nessun dato da visualizzare</h4>
                                    </div>
                                {/if}
                            </div>
                        </div>
                        <hr />
                        <div class="row">
                            <div class="form-group mb-0 col-12">
                                <label class="font-weight-bold" for="notes">Note</label>
                                <textarea
                                    class="form-control form-control-solid form-control"
                                    id="notes"
                                    name="notes"
                                    rows="3"
                                    value={row.notes} />
                            </div>
                        </div>
                        <div class="row mb-4">
                            <div class="form-group col-12 text-right">
                                <label class="font-weight-bolder mt-10" for="paid">Compenso totale</label>
                                <h4>
                                    {parseFloat(row.amount || 0).toLocaleString('it-IT', {
                                        maximumFractionDigits: 2,
                                        minimumFractionDigits: 2,
                                    })} €
                                </h4>
                                <input
                                    type="hidden"
                                    class="form-control form-control-solid form-control-lg font-weight-bolder"
                                    id="amount"
                                    name="amount"
                                    value={row.amount} />
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button
                            type="button"
                            class="btn btn-light-primary font-weight-bold"
                            data-dismiss="modal"
                            on:click={() => {
                                if (!edit) resetData();
                                dispatch('close');
                            }}>Chiudi</button>
                        <button type="submit" class="btn btn-primary font-weight-bold">Salva</button>
                    </div>
                </div>
            </div>
        </div>
    </form>
</Portal>

<svelte:head>
    <style>
        .multi-item {
            background: #fff0 !important;
            border: 0 !important;
            outline: 0 !important;
        }
    </style>
</svelte:head>
