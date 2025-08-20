<script>
    import DeleteButton from 'components/buttons/DeleteButton.svelte';
    import EventGenerator from 'components/eventgenerator/EventGenerator.svelte';
    import {SmartMultiSelect} from 'components/formBuilder/preview-blocks';
    import NumberInput from 'components/inputs/NumberInput.svelte';
    import DayMonthPicker from 'components/pickers/day-month-picker.svelte';
    import {CaretCircleDown, CaretCircleUp, Placeholder, WarningCircle} from 'phosphor-svelte';
    import {typesOfAssociates} from 'utils/enumUtils.js';
    import {v4 as uuidv4} from 'uuid';

    export let userData;
    export let visibleMembershipQuotes = false;

    function toggleMembershipQuotes() {
        visibleMembershipQuotes = !visibleMembershipQuotes;
    }
</script>

{#if visibleMembershipQuotes}
    <div class="border rounded-lg" style="overflow-x:auto;">
        {#if userData.sport_association?.membership_fee_plans?.length == 0}
            <p class="text-center font-weight-bold mt-10">
                <Placeholder size={32} weight="duotone" class="mb-4" />
                <br />
                Premi su
                <strong class="text-primary font-weight-boldest">"Aggiungi quota"</strong> per creare la tua prima quota
                associativa.
            </p>
        {/if}
        {#each userData.sport_association?.membership_fee_plans || [] as membership_fee_plan, idx}
            <div class="row mx-1 mt-0" style="border-radius: 0.55rem; padding: .25rem .5rem;">
                <div class="col-12 mx-0 my-4">
                    <div class="row">
                        <div class="col-md-12 col-lg-4">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="font-weight-boldest">Nome quota</label>
                            <div class="input-group input-group-solid">
                                <input
                                    bind:value={membership_fee_plan.name}
                                    type="text"
                                    class="form-control fs-1-1"
                                    placeholder="Nome quota" />
                            </div>
                        </div>
                        <div class="col-md-12 col-lg-4">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="font-weight-boldest">Quota</label>
                            <NumberInput
                                reactive={true}
                                disabled={membership_fee_plan?.multiple_membership_fee}
                                bind:value={membership_fee_plan.membership_fee}
                                name="membership_fee_{membership_fee_plan?.id}"
                                id="kt_inputmask_membership_fee_{membership_fee_plan?.id}"
                                placeholder="25,00"
                                checkFloat={true} />
                        </div>
                        <div class="col-md-12 col-lg-3">
                            <span class="mb-4 font-weight-boldest text-black font-size-md">Parziale</span>

                            <div>
                                <!-- switch to enable advanced options -->
                                <div class="input-group mt-2">
                                    <span class="switch switch-icon ml-0">
                                        <label>
                                            <input
                                                type="checkbox"
                                                name=""
                                                bind:checked={membership_fee_plan.advanced_options} />
                                            <span />
                                        </label>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-12 col-lg-1 text-right d-flex justify-content-end align-items-center pt-4">
                            <DeleteButton
                                color="danger"
                                on:open={() => {
                                    userData.sport_association.membership_fee_plans =
                                        userData.sport_association?.membership_fee_plans?.filter(
                                            (item, index) => index !== idx
                                        );
                                }} />
                        </div>
                        <div class="col-12 mt-4" class:d-none={!membership_fee_plan.advanced_options}>
                            <div class="align-items-center justify-content-start mt-4 d-flex">
                                <div class="mr-4">
                                    <span class="font-weight-bolder">Attiva dal</span>
                                    <DayMonthPicker
                                        bind:selectedDay={membership_fee_plan.from_day}
                                        bind:selectedMonth={membership_fee_plan.from_month} />
                                </div>
                                <div class="mr-4">
                                    <span class="font-weight-bolder">Fino al</span>
                                    <DayMonthPicker
                                        bind:selectedDay={membership_fee_plan.to_day}
                                        bind:selectedMonth={membership_fee_plan.to_month} />
                                </div>
                            </div>
                            <div class="col-12 px-0 mt-4 d-flex">
                                <div class="mr-4">
                                    <span class="font-weight-bolder">Quota antecedente</span>
                                    <select
                                        bind:value={membership_fee_plan.previous_membership_fee_plan}
                                        class="form-control form-control-solid form-control-sm mt-2"
                                        style="width: 300px;">
                                        <option value="" default>Nessuna (è la prima)</option>
                                        {#each Array.from(userData.sport_association?.membership_fee_plans)?.filter(x => x.id != membership_fee_plan.id) as plan}
                                            <option value={plan?.id}>{plan?.name}</option>
                                        {/each}
                                    </select>
                                </div>
                                <div
                                    class="mr-4 {membership_fee_plan.previous_membership_fee_plan == ''
                                        ? 'd-none'
                                        : ''}">
                                    <span class=" font-weight-bolder">Emetti in automatico</span>
                                    <select
                                        bind:value={membership_fee_plan.auto_assign}
                                        class="form-control form-control-solid form-control-sm mt-2">
                                        <option value="1" default>Si</option>
                                        <option value="0">No</option>
                                    </select>
                                </div>
                            </div>
                            <div
                                class="align-items-center justify-content-start mt-4"
                                class:d-none={!membership_fee_plan?.advanced_options}
                                class:d-flex={membership_fee_plan?.advanced_options}>
                                <div class="mt-2">
                                    <div
                                        class="d-flex align-items-center text-bold text-info bg-light-info p-4 mb-4 rounded-lg">
                                        <div style="min-width: 30px;">
                                            <WarningCircle size={18} weight="duotone" />
                                        </div>
                                        <div>
                                            La quota sarà visible dal <b>
                                                {membership_fee_plan?.from_day}/{membership_fee_plan?.from_month}</b>
                                            al
                                            <b>{membership_fee_plan?.to_day}/{membership_fee_plan?.to_month}</b>
                                            .
                                            {@html membership_fee_plan?.previous_membership_fee_plan != ''
                                                ? 'La quota antecedente è "' +
                                                  '<b>' +
                                                  userData.sport_association?.membership_fee_plans?.find(
                                                      x => x.id == membership_fee_plan?.previous_membership_fee_plan
                                                  )?.name +
                                                  '"</b>. '
                                                : ''}
                                            {@html membership_fee_plan?.auto_assign == '1' &&
                                            membership_fee_plan?.previous_membership_fee_plan != ''
                                                ? 'Verrà creato in automatico un <b>pagamento</b> per tutti gli atleti con la quota antecedente.'
                                                : ''}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {#if userData?.preview_and_custom_features?.find(x => x.name === 'Iscrizioni per Enti e Federazioni') !== undefined}
                        <div class="row mt-6">
                            <div class="col-12">
                                <SmartMultiSelect
                                    customClasses={'min-w-100'}
                                    editable={false}
                                    active={false}
                                    bind:value={membership_fee_plan.type_of_associate}
                                    props={{
                                        id: `membership_fee_plan.type_of_associate.${idx}`,
                                        name: `membership_fee_plan.type_of_associate.${idx}`,
                                        label: 'Valida per',
                                        placeholder: 'Disponibile per i seguenti tipi di associato',
                                        required: true,
                                        clearable: true,
                                        searchable: true,
                                        showChevron: true,
                                        options: typesOfAssociates,
                                        value: membership_fee_plan.type_of_associate,
                                    }} />
                            </div>
                            <div class="col-12">
                                <SmartMultiSelect
                                    customClasses={'min-w-100'}
                                    editable={false}
                                    active={false}
                                    bind:value={membership_fee_plan.type_of_request}
                                    props={{
                                        id: `membership_fee_plan.type_of_request.${idx}`,
                                        name: `membership_fee_plan.type_of_request.${idx}`,
                                        label: 'Per richieste',
                                        placeholder: 'Disponibile per le seguenti richieste',
                                        required: true,
                                        clearable: true,
                                        searchable: true,
                                        showChevron: true,
                                        options: [
                                            {
                                                value: 'affiliazione',
                                                label: 'Affiliazione',
                                            },
                                            {
                                                value: 'rinnovo',
                                                label: 'Rinnovo',
                                            },
                                        ],
                                        value: membership_fee_plan.type_of_request,
                                    }} />
                            </div>
                        </div>
                    {/if}
                    {#if membership_fee_plan?.installments}
                        <div
                            class="row mx-1 mt-1"
                            style="background: #cccccc10;border-radius: 0.55rem; padding: .25rem .5rem;">
                            <div class="col-12 mt-6 mb-4">
                                <h6 class="mb-4 font-weight-bold text-dark">Rateizzazione della quota</h6>
                                <div class="row col-12 m-0 p-0">
                                    <EventGenerator
                                        isSubscription={true}
                                        on:update={data => {
                                            // $newCourse.events = [...data.detail];
                                        }}
                                        on:amountUpdated={data => {
                                            // if (data.detail == NaN) data.detail = '0.00';
                                            // totalAmount = data.detail.replace('.', ',');
                                            // document.getElementById('kt_inputmask_fee').value = data.detail.replace('.', ',');
                                            // $newCourse.fee = data.detail.replace(',', '.');
                                        }} />
                                </div>
                            </div>
                        </div>
                    {/if}
                </div>
            </div>
            <hr class="my-0" />
        {/each}
        <div class="row mx-1 mt-6 d-flex justify-content-center px-4 pb-4">
            <button
                class="btn btn-primary btn-sm font-weight-bolder"
                on:click={() => {
                    let id = uuidv4();
                    if (!userData.sport_association.membership_fee_plans)
                        userData.sport_association.membership_fee_plans = [];
                    userData.sport_association.membership_fee_plans = [
                        ...userData.sport_association.membership_fee_plans,
                        {
                            id: id,
                            name: '',
                            membership_fee: '',
                        },
                    ];
                }}>Aggiungi quota</button>
        </div>
    </div>
    <div class="row mx-1 mt-6 d-flex justify-content-center px-4 pb-4">
        <button
            class="btn btn-light-dark btn-sm font-weight-boldest d-flex align-items-center"
            on:click={toggleMembershipQuotes}>
            <CaretCircleUp size={16} weight="bold" class="mr-1" />
            Nascondi quote</button>
    </div>
{:else}
    <div class="row mx-1 mt-6 d-flex justify-content-center px-4 pb-4">
        <button
            class="btn btn-light-dark btn-sm font-weight-boldest d-flex align-items-center"
            on:click={toggleMembershipQuotes}>
            <CaretCircleDown size={16} weight="bold" class="mr-1" />
            Mostra quote</button>
    </div>
{/if}
