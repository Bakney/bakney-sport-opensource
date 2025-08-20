<script>
    import QuillEditor from 'components/inputs/QuillEditor.svelte';
    import {newCourse} from 'store/stores.js';
    import EventGenerator from 'components/eventgenerator/EventGenerator.svelte';
    import {beforeUpdate, onMount} from 'svelte';
    import MultipleQuotes from './partials/multiple-quotes.svelte';
    import {SmartMultiSelect} from 'components/formBuilder/preview-blocks/index.js';
    import AddModal from '../../modals/AddModal.svelte';
    import {apiFetch} from 'utils/ApiMiddleware';
    import Membership from './partials/membership.svelte';
    import {Currency} from 'components/formBuilder/preview-blocks/index.js';

    newCourse.useLocalStorage();

    let totalAmount = 0;
    let isFreeCourse = false;
    let allStructures = [];
    let availableStructures = [];

    $: {
        if (isFreeCourse) $newCourse.fee = '0,00';
    }

    async function fetchAvailableStructures() {
        const res = await apiFetch(__bakney.env.API.COURSE.LOCATIONS.LIST);

        if (!res.error) {
            availableStructures = res.response.data?.map(x => ({label: x.title, value: x.course_location_id}));
            allStructures = res.response.data;
        }
    }

    function updateCourseText() {
        $newCourse.title =
            String($newCourse.title || '')
                .slice(0, 1)
                .toUpperCase() + String($newCourse.title || '').slice(1);
        $newCourse.description =
            String($newCourse.description || '')
                .slice(0, 1)
                .toUpperCase() + String($newCourse.description || '').slice(1);
    }

    onMount(async () => {
        await fetchAvailableStructures();
    });
</script>

<div class="pb-5">
    <div class="form-group">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label>Titolo <b>*</b></label>
        <input
            on:keypress={updateCourseText}
            bind:value={$newCourse.title}
            name="title"
            type="text"
            class="form-control form-control-solid form-control-lg margin-tb-2"
            placeholder="Titolo Corso" />
    </div>

    <div class="form-group">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label>Descrizione <b>*</b></label>
        <div class="mb-6 fs-1-1">
            <QuillEditor bind:value={$newCourse.description} />
        </div>
    </div>

    <div class="d-flex mb-8">
        <div class="d-flex flex-column w-100">
            <div class="d-flex flex-wrap mt-2 w-100" style="gap: 2rem;">
                <SmartMultiSelect
                    customClasses={'min-w-100 mb-0'}
                    editable={false}
                    active={false}
                    minNumberOfSelectedItems={0}
                    on:change={e => {
                        let locs = e.detail;
                        if (Array.isArray(locs)) {
                            $newCourse.locations = allStructures.filter(s => {
                                return locs.some(loc => loc.value === s.course_location_id);
                            });
                        } else {
                            $newCourse.course.locations = $newCourse.locations.filter(s => {
                                return locs.value !== s.course_location_id;
                            });
                        }
                    }}
                    props={{
                        id: `course_locations`,
                        name: `course_locations`,
                        label: 'Seleziona le strutture',
                        placeholder: 'Seleziona le strutture',
                        required: false,
                        clearable: false,
                        searchable: true,
                        showChevron: true,
                        options: availableStructures,
                        value:
                            availableStructures.filter(s => {
                                return $newCourse.locations?.map(l => l.course_location_id).includes(s.value);
                            }) || [],
                    }}>
                    <div slot="list-append" class="w-100 d-flex justify-content-center">
                        <button
                            type="button"
                            class="btn btn-sm btn-light-primary font-weight-boldest mx-auto mt-2"
                            on:click={() => {
                                let modal = new AddModal({
                                    target: document.body,
                                    props: {
                                        show: true,
                                        ktdatable: null,
                                    },
                                });
                                modal.$on('update', () => {
                                    fetchAvailableStructures();
                                });
                            }}>
                            Aggiungi Struttura
                        </button>
                    </div>
                </SmartMultiSelect>
            </div>
        </div>
    </div>

    <div class="form-group mb-8">
        <label class="font-weight-bold">Tipologia*</label>
        <div class="row">
            <div class="col-lg-4 my-0">
                <label class="option h-100 rounded-lg cursor-pointer">
                    <span class="option-control">
                        <span class="radio">
                            <input
                                type="radio"
                                name="course_type"
                                value={1}
                                bind:group={$newCourse.course_type}
                                checked />
                            <span />
                        </span>
                    </span>
                    <span class="option-label">
                        <span class="option-head">
                            <span class="option-title">Standard</span>
                        </span>
                        <span class="option-body text-muted"
                            >Corso standard, con possibilità di inserire rate e pagamenti in un'unica soluzione.</span>
                    </span>
                </label>
            </div>
            <div class="col-lg-4">
                <label class="option h-100 rounded-lg cursor-pointer">
                    <span class="option-control">
                        <span class="radio">
                            <input type="radio" name="course_type" value={2} bind:group={$newCourse.course_type} />
                            <span />
                        </span>
                    </span>
                    <span class="option-label">
                        <span class="option-head">
                            <span class="option-title">Quote Multiple</span>
                        </span>
                        <span class="option-body text-muted"
                            >Corso con possibilità di specificare più di una quota da far scegliere all'atleta.</span>
                    </span>
                </label>
            </div>
            <div class="col-lg-4">
                <label class="option h-100 rounded-lg cursor-pointer">
                    <span class="option-control">
                        <span class="radio">
                            <input type="radio" name="course_type" value={3} bind:group={$newCourse.course_type} />
                            <span />
                        </span>
                    </span>
                    <span class="option-label">
                        <span class="option-head">
                            <span class="option-title">Abbonamento</span>
                        </span>
                        <span class="option-body text-muted">
                            Abbonamento classico, configurabile per ogni atleta.
                        </span>
                    </span>
                </label>
            </div>
        </div>
    </div>
    {#if $newCourse.course_type == 1}
        <div class="row col-12">
            <Currency
                customClasses={'col-12 col-md-4 m-0 p-0'}
                editable={false}
                on:change={e => {
                    $newCourse.fee = e.detail;
                    totalAmount = e.detail;
                }}
                props={{
                    label: 'Quota attività',
                    name: 'fee',
                    id: 'fee',
                    placeholder: '0,00',
                    disabled: isFreeCourse,
                    required: true,
                    value: $newCourse.fee,
                }} />

            <div class="form-group col-6 col-md-4 m-0 p-0 pt-4 pt-md-0">
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <label class="text-left text-md-right" style="margin-right: 0!important;">Corso Gratuito</label>
                <!-- <label class="col-3 col-form-label">With Icon</label> -->
                <div class="input-group" style="height: calc(1.5em + 1.3rem + 2px)">
                    <span
                        class="switch switch-icon m-auto"
                        style={window.innerWidth < 991 ? 'margin-left: 0 !important;' : 'margin-right: 0!important'}>
                        <label>
                            <input type="checkbox" bind:checked={isFreeCourse} />
                            <span />
                        </label>
                    </span>
                </div>
            </div>

            <div class="form-group col-6 col-md-4 m-0 p-0 pt-4 pt-md-0">
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <label class="text-right" style="margin-right: 0!important;">Rateizza</label>
                <!-- <label class="col-3 col-form-label">With Icon</label> -->
                <div class="input-group" style="height: calc(1.5em + 1.3rem + 2px)">
                    <span class="switch switch-icon m-auto" style="margin-right: 0!important;">
                        <label>
                            <input
                                type="checkbox"
                                disabled={$newCourse.multi_payments_recurrent}
                                name=""
                                bind:checked={$newCourse.multi_payments_split} />
                            <span />
                        </label>
                    </span>
                </div>
            </div>
        </div>
        <div class="form-group row col-12 mt-4">
            <p>
                La <span class="font-weight-bold">quota attività</span> prevede di default il pagamento in un'unica
                soluzione.<br />
                <!-- Attivando la <span class="font-weight-bold">quota ricorrente</span> la quotà attività viene richiesta per un certo numero di mesi (fino a 12).<br> -->
                Attivando la <span class="font-weight-bold">rateizzazione</span> il pagamento della quota attività viene
                diviso in più rate.<br />
                Maggiori informazioni nella sezione corsi del
                <a
                    class="text-primary font-weight-bold"
                    href="https://manuale.bakney.com/docs/manuale/corsi/"
                    target="_blank">manuale</a
                >.
            </p>
        </div>

        {#if $newCourse.multi_payments_split}
            <div class="form-group row col-12 m-0 p-0 mt-4">
                <h6 class="mb-4 font-weight-bold text-dark">Rateizzazione della quota attività</h6>
                <div class="row col-12 m-0 p-0">
                    <EventGenerator
                        bind:totalAmount
                        on:update={data => {
                            $newCourse.events = [...data.detail];
                        }}
                        on:amountUpdated={data => {
                            if (data.detail == NaN) data.detail = '0.00';
                            totalAmount = data.detail.replace('.', ',');
                            $newCourse.fee = String(data.detail).replace('.', ','); //.replace(',', '.');
                        }} />
                </div>
                {#if $newCourse.events?.length > 0}
                    <div class="row m-2 p-8 mt-12 mt-12" style="border: .2rem dashed #ccc;border-radius:.55rem;">
                        <div class="col-12" style="padding: 0;">
                            <h3>Permetti pagamento in un'unica soluzione</h3>
                            <div class="form-group mt-2 mb-0">
                                <p>
                                    Puoi decidere di far pagare comunque la <span class="font-weight-bold"
                                        >quota attività</span>
                                    in un'unica soluzione. Attivando l'<span class="font-weight-bold"
                                        >Unica soluzione</span>
                                    puoi inserire un importo diverso. Ad esempio, puoi offrire uno sconto.<br />
                                </p>
                            </div>
                        </div>

                        <Currency
                            customClasses={'col-12 col-md-6 m-0 p-0'}
                            editable={false}
                            on:change={e => {
                                $newCourse.one_fee = parseFloat(e.detail?.replace(',', '.') || '0.00');
                            }}
                            props={{
                                label: 'Quota attività',
                                name: 'one_fee',
                                id: 'one_fee',
                                placeholder: '0,00',
                                disabled: !$newCourse.one_fee_payment,
                                required: true,
                                value: $newCourse.one_fee,
                            }} />
                        <div class="form-group col-12 col-md-6 m-0 p-0 pt-4 pt-md-0">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="text-right" style="margin-right: 0!important;">Unica soluzione</label>
                            <!-- <label class="col-3 col-form-label">With Icon</label> -->
                            <div class="input-group" style="height: calc(1.5em + 1.3rem + 2px)">
                                <span class="switch switch-icon m-auto" style="margin-right: 0!important;">
                                    <label>
                                        <input type="checkbox" name="" bind:checked={$newCourse.one_fee_payment} />
                                        <span />
                                    </label>
                                </span>
                            </div>
                        </div>
                    </div>
                {/if}

                <!--
                    numero di date: []
                    giorno raccolta data: []
                    i

                    applica -->
                <!--
                    si genera una lista di date
                -->
            </div>
        {/if}
    {:else if $newCourse.course_type == 2}
        <MultipleQuotes bind:course={$newCourse} />
    {:else if $newCourse.course_type == 3}
        <Membership bind:course={$newCourse} />
    {/if}
</div>
