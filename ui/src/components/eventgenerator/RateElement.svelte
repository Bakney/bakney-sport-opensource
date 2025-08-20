<script>
    import DeleteButton from 'components/buttons/DeleteButton.svelte';
    import {afterUpdate, createEventDispatcher, onDestroy, onMount} from 'svelte';
    import {slide} from 'svelte/transition';

    const dispatch = createEventDispatcher();

    export let event;
    export let editableAmounts = false;
    export let isSubscription = false;

    $: editableAmounts, mountInputMask();
    $: event, dispatch('update', event);

    $: {
        if (event.amount == null || event.amount == 'NaN' || isNaN(event.amount)) event.amount = '0.00';
    }

    onMount(() => {
        jQuery.fn.datepicker.dates['it'] = {
            days: ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'],
            daysShort: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'],
            daysMin: ['Do', 'Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa'],
            months: [
                'Gennaio',
                'Febbario',
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
            monthsShort: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'],
            today: 'Oggi',
            clear: 'Cancella',
            format: 'dd/mm/yyyy',
            titleFormat: 'MM yyyy' /* Leverages same syntax as 'format' */,
            weekStart: 1,
        };

        jQuery(`#datepicker_${event.id}`).datepicker({
            rtl: false,
            orientation: 'top right',
            todayHighlight: true,
            templates: {
                leftArrow: '<i class="la la-angle-left"></i>',
                rightArrow: '<i class="la la-angle-right"></i>',
            },
            format: {
                toDisplay: function (date, format, language) {
                    event.payment_date = moment(date).format('DD/MM/YYYY');
                    return event.payment_date;
                },
                toValue: function (date, format, language) {
                    return moment(date, 'DD/MM/YYYY').toDate();
                },
            },
            language: 'it',
        });

        editableAmounts = false;

        mountInputMask();
    });

    afterUpdate(() => {
        mountInputMask();
    });

    onDestroy(() => {
        editableAmounts = false;
    });

    function mountInputMask() {
        if (!editableAmounts) return;

        jQuery(`#amount_rate_${event.id}`).inputmask('9{1,4},9{2}', {
            greedy: false,
            placeholder: '0',
            rightAlign: true,
        });

        jQuery(`#amount_rate_${event.id}`).change(function () {
            event.amount = document.getElementById(`amount_rate_${event.id}`).value.replace(',', '.');
        });
        if (document.getElementById(`amount_rate_${event.id}`))
            document.getElementById(`amount_rate_${event.id}`).value = event.amount.replace('.', ',');
    }
</script>

<div transition:slide class="form-group col-12 form-group-last m-0 p-1">
    <div class="alert alert-custom alert-default py-0 px-4 rounded-xl border mb-0" role="alert">
        <div class="alert-text row">
            <div
                class="col-6 col-md-2 d-sm-block d-flex justify-content-center m-auto font-weight-boldest text-dark font-size-xl">
                {event.id + 1}° rata
            </div>
            <div class="col-6 col-md-2 d-sm-block d-flex justify-content-center p-1 m-auto text-left">
                {#if editableAmounts}
                    <div
                        class="input-group input-group-solid input-group-sm"
                        style="background: #fff;max-width: 6.5rem;">
                        <div class="input-group-prepend">
                            <span class="input-group-text fs-1-1">€</span>
                        </div>
                        <input
                            name="fee"
                            type="text"
                            class="form-control fs-1-1"
                            id="amount_rate_{event.id}"
                            placeholder="" />
                    </div>
                {:else}
                    <span class="label label-md label-light-success label-inline font-weight-bold p-3">
                        € {event.amount}
                    </span>
                {/if}
            </div>
            <div class="col-8 {isSubscription ? 'col-md-4' : 'col-md-7'} pt-4 p-md-1 m-auto d-flex">
                <div class="col-6 m-auto text-right" style="margin-right: 0rem !important;">
                    <span class="pr-2 m-auto mr-0 font-weight-bolder text-dark"> Scade il </span>
                </div>
                <div
                    class="col-6 p-0 input-group input-group-solid input-group-sm"
                    style="background: #fff;max-width: 7.5rem;">
                    <input
                        bind:value={event.payment_date}
                        type="text"
                        class="form-control date m-auto"
                        id="datepicker_{event.id}" />
                </div>
            </div>
            {#if isSubscription}
                <div class="col-12 col-md-3 p-1 m-auto d-flex p-4 p-md-0 justify-content-center">
                    <label class="checkbox font-weight-bolder text-dark-50" style="font-size:1rem">
                        <input
                            class="mr-2"
                            bind:checked={event.is_subscription}
                            type="checkbox"
                            name="checkbox_{event.id}" />
                        <span class="mr-2" />
                        quota attività
                    </label>
                </div>
            {/if}
            <div class="col-12 col-md-1 d-sm-block d-flex justify-content-center m-auto d-flex justify-content-end">
                <DeleteButton on:open={() => dispatch('removeEvent', event.id)} />
            </div>
        </div>
    </div>
</div>
