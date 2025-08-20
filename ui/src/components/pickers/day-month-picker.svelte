<script>
    import {Calendar} from 'phosphor-svelte';
    import {createEventDispatcher, onMount, onDestroy} from 'svelte';

    export let selectedDay = 1;
    export let selectedMonth = 1;

    const dispatch = createEventDispatcher();

    let isOpen = false;
    let daysInMonth = 31;

    let pickerElement;

    const monthNames = [
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
    ];

    function getDaysInMonth(month) {
        if (month === 2) return 29; // February (accounting for leap years)
        return [4, 6, 9, 11].includes(month) ? 30 : 31;
    }

    function updateDaysInMonth() {
        daysInMonth = getDaysInMonth(selectedMonth);
        if (selectedDay > daysInMonth) {
            selectedDay = daysInMonth;
        }
    }

    function togglePicker() {
        isOpen = !isOpen;
    }

    function selectDate(day, month) {
        selectedDay = day;
        selectedMonth = month;
        isOpen = false;
        dispatch('dateSelect', {day, month});
    }

    function handleClickOutside(event) {
        if (isOpen && pickerElement && !pickerElement.contains(event.target)) {
            isOpen = false;
        }
    }

    onMount(() => {
        window.addEventListener('click', handleClickOutside);
    });

    onDestroy(() => {
        window.removeEventListener('click', handleClickOutside);
    });

    $: updateDaysInMonth(selectedMonth);
</script>

<div class="month-day-picker d-flex align-items-center" bind:this={pickerElement}>
    <div class="picker-inputs">
        <select
            class="form-control form-control-solid mr-2 day-select"
            bind:value={selectedDay}
            on:change={() => dispatch('dateSelect', {day: selectedDay, month: selectedMonth})}>
            {#each Array(daysInMonth) as _, i}
                <option value={i + 1}>{i + 1}</option>
            {/each}
        </select>
        <select
            class="form-control form-control-solid mr-2 month-select"
            bind:value={selectedMonth}
            on:change={() => dispatch('dateSelect', {day: selectedDay, month: selectedMonth})}>
            {#each monthNames as month, i}
                <option value={i + 1}>{month}</option>
            {/each}
        </select>
        <button type="button" on:click={togglePicker} class="btn btn-light-primary btn-sm p-2">
            <Calendar size={18} weight="duotone" />
        </button>
    </div>

    {#if isOpen}
        <div class="picker-popup border rounded-lg p-4 shadow-sm">
            <div class="d-flex gap-2">
                <div class="month-grid d-grid">
                    {#each monthNames as month, i}
                        <button
                            type="button"
                            class="btn btn-sm p-2 font-weight-boldest"
                            class:btn-light={selectedMonth !== i + 1}
                            class:btn-primary={selectedMonth === i + 1}
                            on:click={() => {
                                selectedMonth = i + 1;
                                updateDaysInMonth();
                            }}>
                            {month}
                        </button>
                    {/each}
                </div>
            </div>
            <div class="day-selector d-grid mt-4">
                {#each Array(daysInMonth) as _, i}
                    <button
                        type="button"
                        class="btn btn-sm p-2 font-weight-boldest"
                        class:btn-light={selectedDay !== i + 1}
                        class:btn-primary={selectedDay === i + 1}
                        on:click={() => selectDate(i + 1, selectedMonth)}>
                        {i + 1}
                    </button>
                {/each}
            </div>
        </div>
    {/if}
</div>

<style>
    .month-day-picker {
        position: relative;
        font-family: Arial, sans-serif;
    }

    .picker-inputs {
        display: flex;
        align-items: center;
    }

    .month-select {
        min-width: 110px;
    }

    .day-select {
        min-width: 60px;
    }

    .picker-popup {
        position: absolute;
        top: 100%;
        left: 0;
        background-color: white;
        z-index: 1000;
    }

    .month-grid,
    .day-selector {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 5px;
    }

    .day-selector {
        grid-template-columns: repeat(7, 1fr);
    }
</style>
